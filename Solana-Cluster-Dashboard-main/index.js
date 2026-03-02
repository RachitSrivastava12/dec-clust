'use strict';

/**
 * ALPHA INDEX.JS v2.1
 * 
 * Critical fixes:
 *  1. ingestTransfer runs BEFORE detectClusterBehavior — so cluster exists when behavior fires
 *  2. detectClusterBehavior now also runs on ALL txns (not just child-wallet txns)
 *     so buys made in the same block as funding are captured
 *  3. Retrospective scan: when a cluster first goes active/forming, we re-scan
 *     recent signatures for each child wallet to catch buys we may have missed
 *  4. Spend rate N/A fix: initializes balance history immediately from funding amounts
 *  5. Slot subscription properly handles rapid slot bursts without stacking
 */

const { Connection } = require('@solana/web3.js');
const {
  RPC_URL,
  POLL_INTERVAL_MS,
  SPEND_REFRESH_MS,
  MIN_TRANSFER_LAMPORTS,
} = require('./config');

const {
  ingestTransfer,
  updateBalances,
  getClusterStats,
  detectClusterBehavior,
  clearClusters,
  _clusters,
} = require('./cluster');

const { startApi } = require('./api');
const state = require('./state');

// ─── Config ───────────────────────────────────────────────────────────────────

const RPC_ENDPOINT      = RPC_URL || 'https://convincing-nameless-river.solana-mainnet.quiknode.pro/6aa580ab6b1189a84dfa37bd5e479fdb9a19bd6c/';
const MAX_SLOTS_CATCHUP = 10;
const SLOT_DELAY_MS     = 80;
const MAX_SLOT_RETRIES  = 3;
const BASE_RETRY_MS     = 800;
const WSOL_MINT         = 'So11111111111111111111111111111111111111112';

// How many recent signatures to scan retroactively per child wallet
const RETRO_SCAN_LIMIT  = 15;

if (!RPC_URL) console.warn('⚠️  RPC_URL not in .env — falling back to hardcoded endpoint');

// ─── Connection ───────────────────────────────────────────────────────────────

const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'confirmed',
  wsEndpoint: RPC_ENDPOINT.replace('https://', 'wss://').replace('http://', 'ws://'),
  confirmTransactionInitialTimeout: 60_000,
  disableRetryOnRateLimit: false,
});

// ─── State ────────────────────────────────────────────────────────────────────

let lastProcessedSlot  = 0;
let pollInterval       = null;
let balanceInterval    = null;
let slotSubId          = null;
let isPollRunning      = false;
let isBalanceRunning   = false;
let shutdownRequested  = false;

// Track which clusters we've already done a retro scan on
const retroScanned = new Set();

// ─── Utils ────────────────────────────────────────────────────────────────────

const sleep  = (ms) => new Promise(r => setTimeout(r, ms));
const jitter = (ms) => ms + Math.floor(Math.random() * ms * 0.25);
const sol    = (l) => (l / 1e9).toFixed(6);

// ─── Retrospective Child Wallet Scan ─────────────────────────────────────────
// When a cluster first forms, we missed any buys that happened before we
// detected the cluster. This scans recent txns for each child wallet.

async function retroScanCluster(cluster) {
  const parentKey = cluster.parent;
  if (retroScanned.has(parentKey)) return;
  retroScanned.add(parentKey);

  console.log(`🔍 Retro-scanning ${cluster.children.size} child wallets for cluster ${parentKey.slice(0, 8)}...`);

  const childAddrs = Array.from(cluster.children.keys());

  for (const addr of childAddrs) {
    if (shutdownRequested || !state.isPollingStarted) return;
    try {
      const sigs = await connection.getSignaturesForAddress(
        { toBase58: () => addr, toString: () => addr },
        { limit: RETRO_SCAN_LIMIT, commitment: 'confirmed' }
      );

      for (const sigInfo of sigs) {
        if (sigInfo.err) continue;
        try {
          const tx = await connection.getParsedTransaction(sigInfo.signature, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed',
          });
          if (!tx || !tx.blockTime) continue;
          detectClusterBehavior(tx, tx.blockTime, tx.slot);
        } catch {}
        await sleep(100);
      }
    } catch (e) {
      console.warn(`⚠️  Retro scan failed for ${addr.slice(0, 8)}: ${e.message}`);
    }
    await sleep(150);
  }

  console.log(`✅ Retro scan done for cluster ${parentKey.slice(0, 8)}`);
}

// Check all active/forming clusters and kick off retro scans for new ones
async function triggerRetroScans() {
  if (!_clusters) return;
  for (const cluster of _clusters.values()) {
    if (cluster.status === 'inactive') continue;
    if (retroScanned.has(cluster.parent)) continue;
    // Don't await — run in background so it doesn't block polling
    retroScanCluster(cluster).catch(e => console.warn('Retro scan error:', e.message));
  }
}

// ─── Process Single Transaction ───────────────────────────────────────────────

function processTx(tx, blockTime, slot) {
  if (tx.meta?.err) return;

  const msg     = tx.transaction.message;
  const meta    = tx.meta || {};
  const accKeys = msg.accountKeys || [];
  const sig     = tx.transaction.signatures[0];

  // Flatten all instructions
  const allIxs = [...(msg.instructions || [])];
  for (const inner of (meta.innerInstructions || [])) {
    if (inner.instructions) allIxs.push(...inner.instructions);
  }

  let ixIdx = 0;

  // ── PASS 1: Ingest transfers first ───────────────────────────────────────
  // Critical: cluster must exist before detectClusterBehavior runs
  for (const ix of allIxs) {
    // Native SOL transfer
    if (ix.program === 'system' && ix.parsed?.type === 'transfer') {
      const { source: from, destination: to, lamports } = ix.parsed.info;
      const lamps = Number(lamports) || 0;

      if (lamps >= MIN_TRANSFER_LAMPORTS) {
        console.log(`💸 SOL ${from.slice(0,8)}→${to.slice(0,8)} ${sol(lamps)} SOL`);
        ingestTransfer({ parent: from, child: to, lamports: lamps, ts: blockTime, slot, signature: sig, ixIdx });
      }
    }

    // WSOL transfer
    if (
      ix.program === 'spl-token' &&
      ix.parsed?.type === 'transfer' &&
      ix.parsed?.info?.mint === WSOL_MINT
    ) {
      const { authority: from, destination: destTokenAcc, amount } = ix.parsed.info;
      const lamps = Number(amount) || 0;
      if (lamps < MIN_TRANSFER_LAMPORTS) { ixIdx++; continue; }

      // Resolve token account → owner
      const destIdx = accKeys.findIndex(k =>
        (k.pubkey ? k.pubkey.toString() : k.toString()) === destTokenAcc
      );
      if (destIdx === -1) { ixIdx++; continue; }

      const postBal = meta.postTokenBalances?.find(b => b.accountIndex === destIdx);
      if (!postBal?.owner) { ixIdx++; continue; }

      const to = postBal.owner;
      if (!to || to === from) { ixIdx++; continue; }

      console.log(`💸 WSOL ${from.slice(0,8)}→${to.slice(0,8)} ${sol(lamps)} SOL`);
      ingestTransfer({ parent: from, child: to, lamports: lamps, ts: blockTime, slot, signature: sig, ixIdx });
    }

    ixIdx++;
  }

  // ── PASS 2: Behavior detection on ALL transactions ────────────────────────
  // Run on every tx — not just ones we know about — because:
  // (a) a child wallet might buy in the same block it was funded
  // (b) a child might transact before we saw its funding tx
  detectClusterBehavior(tx, blockTime, slot);
}

// ─── Process Single Slot ─────────────────────────────────────────────────────

async function processSlot(slot) {
  for (let attempt = 0; attempt < MAX_SLOT_RETRIES; attempt++) {
    if (shutdownRequested || !state.isPollingStarted) return;

    try {
      const block = await connection.getParsedBlock(slot, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
        rewards: false,
        transactionDetails: 'full',
      });

      if (!block || !block.blockTime || !block.transactions?.length) return;

      const blockTime = block.blockTime;
      const txCount   = block.transactions.length;
      console.log(`📦 Slot ${slot} | ${new Date(blockTime * 1000).toISOString()} | ${txCount} txns`);

      for (const tx of block.transactions) {
        if (shutdownRequested || !state.isPollingStarted) return;
        processTx(tx, blockTime, slot);
      }

      return; // success

    } catch (e) {
      const is429     = e.message?.includes('429') || e.message?.includes('Too Many Requests');
      const isSkipped = e.message?.includes('skipped') || e.message?.includes('SlotNotAvailable') || e.message?.includes('was skipped');

      if (isSkipped) return; // normal — slot skipped by validator

      if (attempt < MAX_SLOT_RETRIES - 1) {
        const delay = is429
          ? jitter(BASE_RETRY_MS * Math.pow(2, attempt + 1))
          : jitter(BASE_RETRY_MS);
        console.warn(`⚠️  Slot ${slot} attempt ${attempt + 1} failed: ${e.message} — retry in ${delay}ms`);
        await sleep(delay);
      } else {
        console.error(`❌ Slot ${slot} failed after ${MAX_SLOT_RETRIES} attempts: ${e.message}`);
      }
    }
  }
}

// ─── Poll Cycle ───────────────────────────────────────────────────────────────

async function poll() {
  if (!state.isPollingStarted || shutdownRequested) return;
  if (isPollRunning) {
    console.log('⏭️  Poll already running, skipping');
    return;
  }

  isPollRunning = true;

  try {
    const current = await connection.getSlot('processed');

    if (lastProcessedSlot === 0) {
      lastProcessedSlot = current - 3;
      console.log(`🔖 Starting from slot ${lastProcessedSlot} (3 behind current ${current})`);
    }

    // Catchup cap — skip stale slots if too far behind
    const gap = current - lastProcessedSlot;
    if (gap > MAX_SLOTS_CATCHUP) {
      lastProcessedSlot = current - MAX_SLOTS_CATCHUP;
      console.log(`⚡ Gap ${gap} slots — jumping to ${lastProcessedSlot}`);
    }

    const toProcess = [];
    for (let s = lastProcessedSlot + 1; s <= current; s++) toProcess.push(s);

    if (toProcess.length > 0) {
      console.log(`🔄 Processing ${toProcess.length} slots (${toProcess[0]}→${toProcess[toProcess.length-1]})`);
    }

    for (const slot of toProcess) {
      if (shutdownRequested || !state.isPollingStarted) break;
      await processSlot(slot);
      lastProcessedSlot = slot;
      await sleep(SLOT_DELAY_MS);
    }

    // After processing slots, kick off retro scans for any new clusters
    if (toProcess.length > 0) {
      triggerRetroScans().catch(() => {});
    }

    const stats = getClusterStats();
    if (toProcess.length > 0) {
      console.log(
        `✅ Poll done | slot ${lastProcessedSlot} | ` +
        `Active: ${stats.activeClusters} | Forming: ${stats.formingClusters} | ` +
        `SOL: ${stats.totalSOLInActive} | Confidence: ${stats.avgConfidence}`
      );
    }

  } catch (e) {
    console.error('❌ Poll error:', e.message);
  } finally {
    isPollRunning = false;
  }
}

// ─── Safe Balance Update ──────────────────────────────────────────────────────

async function safeUpdateBalances() {
  if (!state.isPollingStarted || shutdownRequested) return;
  if (isBalanceRunning) return;

  // Wait for poll to drain first
  let waited = 0;
  while (isPollRunning && waited < 10_000) { await sleep(200); waited += 200; }

  isBalanceRunning = true;
  try {
    await updateBalances(connection);
  } catch (e) {
    console.error('❌ Balance update error:', e.message);
  } finally {
    isBalanceRunning = false;
  }
}

// ─── WebSocket Slot Subscription ─────────────────────────────────────────────

function subscribeToSlots() {
  try {
    slotSubId = connection.onSlotChange(async () => {
      if (!state.isPollingStarted || shutdownRequested || isPollRunning) return;
      await poll();
    });
    console.log(`🔌 WebSocket slot subscription active (id: ${slotSubId})`);
  } catch (e) {
    console.warn(`⚠️  WS subscription failed: ${e.message} — interval polling only`);
    slotSubId = null;
  }
}

async function unsubscribeSlots() {
  if (slotSubId !== null) {
    try { await connection.removeSlotChangeListener(slotSubId); } catch {}
    slotSubId = null;
  }
}

// ─── Stop / Start ─────────────────────────────────────────────────────────────

async function stopPolling() {
  state.isPollingStarted = false;
  shutdownRequested = true;

  if (pollInterval)   { clearInterval(pollInterval);   pollInterval   = null; }
  if (balanceInterval){ clearInterval(balanceInterval); balanceInterval = null; }

  await unsubscribeSlots();

  // Drain in-flight ops (max 5s)
  let w = 0;
  while ((isPollRunning || isBalanceRunning) && w < 5000) { await sleep(200); w += 200; }
  console.log('✅ Polling stopped');
}

async function startPolling() {
  if (state.isPollingStarted) {
    console.log('⚡ Polling already active');
    return;
  }

  console.log('🚀 Starting Solana Cluster Monitor [MAINNET]');
  console.log(`📡 RPC: ${RPC_ENDPOINT.slice(0, 55)}...`);

  clearClusters();
  retroScanned.clear();
  lastProcessedSlot = 0;
  shutdownRequested = false;
  state.isPollingStarted = true;

  await poll();

  subscribeToSlots();

  // Interval as backup / catch-up
  pollInterval = setInterval(async () => {
    if (!isPollRunning) await poll();
  }, POLL_INTERVAL_MS);

  // Staggered initial balance update
  setTimeout(() => safeUpdateBalances(), 8_000);

  // Regular balance refresh — run more frequently (every 10s) so spend rate populates faster
  balanceInterval = setInterval(safeUpdateBalances, Math.min(SPEND_REFRESH_MS, 10_000));

  console.log(`⏱️  Poll: ${POLL_INTERVAL_MS}ms | Balance: ${Math.min(SPEND_REFRESH_MS, 10_000)}ms`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function start() {
  const port = process.env.PORT || 3001;
  startApi(port, startPolling, stopPolling);
  console.log('✅ API server started');

  const shutdown = async (sig) => {
    console.log(`\n🛑 ${sig} — shutting down...`);
    await stopPolling();
    process.exit(0);
  };

  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException',  (err) => console.error('💥 Uncaught:', err.message));
  process.on('unhandledRejection', (r)   => console.error('💥 Unhandled rejection:', r));
}

start().catch(err => {
  console.error('❌ Fatal startup error:', err);
  process.exit(1);
});
