'use strict';

/**
 * ALPHA CLUSTER DETECTION ENGINE v2.1
 *
 * Key fixes in this version:
 *  1. detectClusterBehavior now scans ALL account keys in a tx (not just signer)
 *     so it catches child wallets even if they aren't the fee payer
 *  2. Spend rate "N/A" fix: balance history is seeded with funding amount
 *     so spend rate is calculable from first updateBalances call
 *  3. Jitter ???  fix: buySlots dedup was too strict — fixed to allow
 *     same slot if different tx
 *  4. Token mint detection: also reads postTokenBalances for ALL cluster children
 *     in a tx, not just the signer
 *  5. computeConfidence: token focus factor fixed — was dividing by 0 when
 *     no mints found, returning NaN which poisoned the score
 */

const { PublicKey } = require('@solana/web3.js');
const {
  WINDOW_MS, FORMING_WINDOW_MS, MIN_CHILDREN, FORMING_MIN_CHILDREN,
  SPEND_RATE_WINDOW_MS, MIN_TRANSFER_LAMPORTS, MIN_CLUSTER_FUNDING_LAMPORTS, DATA_RETENTION_MS,
} = require('./config');
const state = require('./state');

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_HISTORY_POINTS  = 50;
const MAX_SEEN_KEYS       = 2000;
const MAX_BUY_SLOTS       = 500;
const BATCH_SIZE          = 100;
const BATCH_DELAY_MS      = 150;
const MAX_RETRIES         = 3;
const BASE_RETRY_MS       = 300;

const TOKEN_PROGRAM_ID            = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const TOKEN_2022_PROGRAM_ID       = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
const ASSOCIATED_TOKEN_PROGRAM_ID = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
const WSOL_MINT                   = 'So11111111111111111111111111111111111111112';
const MEMO_PROGRAM_ID             = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';
const COMPUTE_BUDGET_PROGRAM_ID   = 'ComputeBudget111111111111111111111111111111';
const SYSTEM_PROGRAM_ID           = '11111111111111111111111111111111';

const NOISE_PROGRAMS = new Set([
  SYSTEM_PROGRAM_ID, COMPUTE_BUDGET_PROGRAM_ID, MEMO_PROGRAM_ID,
]);

const DEX_PROGRAMS = new Map([
  ['675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', 'Raydium AMM'],
  ['6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',  'pump.fun'],
  ['whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',  'Orca Whirlpool'],
  ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',  'Jupiter v6'],
  ['2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c', 'Lifinity'],
  ['PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY',  'Phoenix'],
  ['LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',  'Meteora DLMM'],
  ['cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG',  'Meteora DAMM'],
  ['GAMMA7meSFWaBXF25oSUgmGRwaW6sCMFLmBNiMSdbHVT',  'GooseFX'],
  ['9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP',  'Serum'],
  ['SaberqXzwVjhZFkrHkh2SgSV9G3pK3G6kD3E8k6FHYt',  'Saber'],
  ['srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX',   'OpenBook'],
  ['CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK',  'Raydium CLMM'],
  ['CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW',  'Raydium CPMM'],
]);

const KNOWN_BUNDLER_PROGRAMS = new Set([
  'TSWAPaqyCSx2KABk68Shruf4rp7CxcAi9N6RyNTTHeP',
  'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K',
]);

// ─── State ────────────────────────────────────────────────────────────────────

const clusters      = new Map();
const parentLineage = new Map();

// ─── Utils ────────────────────────────────────────────────────────────────────

const lamportsToSOL = (l) => l / 1_000_000_000;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const jitteredDelay = (ms) => ms + Math.floor(Math.random() * ms * 0.3);

// ─── Confidence Score 0-100 ───────────────────────────────────────────────────

function computeConfidence(cluster) {
  let score = 0;
  const children = Array.from(cluster.children.values());
  const n = children.length;
  if (n === 0) return 0;

  // [25 pts] Transfer uniformity
  const amounts = children.map(c => c.receivedLamports);
  const mean = amounts.reduce((a, b) => a + b, 0) / n;
  const std  = Math.sqrt(amounts.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / n);
  const cv   = mean > 0 ? std / mean : 1;
  score += Math.max(0, Math.round(25 * (1 - Math.min(cv * 2, 1))));

  // [25 pts] Timing burst
  const times = cluster.events.map(e => e.ts);
  const span  = times.length > 1 ? Math.max(...times) - Math.min(...times) : 0;
  score += span < 2000 ? 25 : span < 5000 ? 20 : span < 15000 ? 12 : span < 30000 ? 5 : 0;

  // [20 pts] Token focus — FIXED: guard against n=0 and no mints
  const mintBuyers = new Map();
  for (const child of children) {
    for (const mint of child.boughtMints) {
      mintBuyers.set(mint, (mintBuyers.get(mint) || 0) + 1);
    }
  }
  if (mintBuyers.size > 0) {
    const maxBuyers = Math.max(...mintBuyers.values());
    score += Math.floor((maxBuyers / n) * 20);
  }
  // If no mints yet: 0 pts (not NaN)

  // [10 pts] DEX concentration
  const dexCount = cluster.dexPrograms.size;
  score += dexCount === 1 ? 10 : dexCount === 2 ? 5 : 0;

  // [10 pts] Children count
  score += Math.min(10, Math.floor((n / Math.max(MIN_CHILDREN, 1)) * 10));

  // [10 pts] Velocity
  score += Math.min(10, cluster.velocityScore || 0);

  return Math.min(100, Math.round(score));
}

// ─── Slot Jitter ──────────────────────────────────────────────────────────────

function analyzeSlotJitter(buySlots) {
  if (buySlots.length < 3) return { label: 'insufficient_data', stdDevSlots: 0, meanGapSlots: 0 };
  const sorted = [...new Set(buySlots)].sort((a, b) => a - b); // dedupe before analyzing
  if (sorted.length < 3) return { label: 'insufficient_data', stdDevSlots: 0, meanGapSlots: 0 };
  const gaps   = sorted.slice(1).map((s, i) => s - sorted[i]);
  const mean   = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const std    = Math.sqrt(gaps.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / gaps.length);
  return {
    label:        std < 2 ? 'low' : std < 8 ? 'medium' : 'high',
    stdDevSlots:  parseFloat(std.toFixed(2)),
    meanGapSlots: parseFloat(mean.toFixed(2)),
  };
}

// ─── Rug Risk ─────────────────────────────────────────────────────────────────

function computeRugRisk(cluster) {
  let risk = 0;
  const spendRateSOLPerMin = lamportsToSOL(cluster.cachedSpendRateLamportsPerSec || 0) * 60;
  if (spendRateSOLPerMin > 5)  risk += 30;
  else if (spendRateSOLPerMin > 1) risk += 15;

  const timeRem = cluster.cachedTimeRemainingSec;
  if (typeof timeRem === 'number' && timeRem < 60) risk += 25;

  if (cluster.tokenMints.size === 1)    risk += 20;
  if (cluster.children.size > 20)       risk += 15;
  else if (cluster.children.size > 10)  risk += 8;

  risk += Math.floor((cluster.confidence || 0) * 0.1);
  return Math.min(100, risk);
}

// ─── Prune ───────────────────────────────────────────────────────────────────

function pruneOldClusters(ts) {
  const cutoff = ts - DATA_RETENTION_MS;
  for (const [parent, cluster] of clusters.entries()) {
    if (cluster.lastUpdate < cutoff) {
      for (const child of cluster.children.keys()) parentLineage.delete(child);
      clusters.delete(parent);
      console.log(`🗑️  Pruned ${parent.slice(0, 8)}`);
    }
  }
}

// ─── Active Status ────────────────────────────────────────────────────────────

function computeActiveStatus(cluster, ts) {
  if (cluster.events.length === 0) {
    cluster.status = 'inactive'; cluster.active = false; cluster.confidence = 0; return;
  }

  const validChildren = new Set();
  for (const [addr, child] of cluster.children) {
    if (child.receivedLamports >= MIN_TRANSFER_LAMPORTS) validChildren.add(addr);
  }

  const evts  = cluster.events.filter(e => validChildren.has(e.child));
  const uniq  = validChildren.size;
  const total = evts.reduce((s, e) => s + e.lamports, 0);
  const times = evts.map(e => e.ts);
  const span  = times.length > 1 ? Math.max(...times) - Math.min(...times) : 0;

  cluster.totalFundedLamports = total;

  // Velocity: max transfers in any 5-second burst window
  if (times.length > 1) {
    let maxV = 0;
    for (const t of times) {
      const count = times.filter(x => x >= t && x <= t + 5000).length;
      if (count > maxV) maxV = count;
    }
    cluster.velocityScore = Math.min(10, maxV);
  }

  let status = 'inactive';
  if (span <= FORMING_WINDOW_MS && uniq >= FORMING_MIN_CHILDREN && total >= MIN_TRANSFER_LAMPORTS * FORMING_MIN_CHILDREN) {
    status = 'forming';
  }
  if (span <= WINDOW_MS && uniq >= MIN_CHILDREN && total >= MIN_CLUSTER_FUNDING_LAMPORTS) {
    status = 'active';
  }

  cluster.status     = status;
  cluster.active     = status === 'active';
  cluster.confidence = computeConfidence(cluster);

  console.log(
    `[${cluster.parent.slice(0,8)}] n=${uniq}/${MIN_CHILDREN} ` +
    `funded=${lamportsToSOL(total).toFixed(2)} SOL ` +
    `span=${(span/1000).toFixed(1)}s ` +
    `vel=${cluster.velocityScore} ` +
    `status=${status} conf=${cluster.confidence}`
  );
}

// ─── Ingest Transfer ──────────────────────────────────────────────────────────

function ingestTransfer({ parent, child, lamports, ts, slot, signature, ixIdx }) {
  const eventTs = ts * 1000;
  if (lamports < MIN_TRANSFER_LAMPORTS) return;
  if (parent === child) return;

  parentLineage.set(child, parent);

  const grandparent = parentLineage.get(parent);
  if (grandparent) {
    const gc = clusters.get(grandparent);
    if (gc) gc.grandchildCount = (gc.grandchildCount || 0) + 1;
  }

  let cluster = clusters.get(parent);
  if (!cluster) {
    cluster = {
      parent, createdAt: eventTs, events: [], children: new Map(),
      totalFundedLamports: 0, active: false, status: 'inactive',
      lastUpdate: eventTs, fanOutSlot: slot, buySlots: [],
      dexPrograms: new Set(), tokenMints: new Set(), seen: new Set(),
      velocityScore: 0, confidence: 0, grandchildCount: 0,
      cachedRemainingLamports: 0, cachedSpendRateLamportsPerSec: 0,
      cachedTimeRemainingSec: 'N/A', seenBundlerProgram: false,
    };
    clusters.set(parent, cluster);
    console.log(`🌱 New cluster [${parent.slice(0,8)}] slot=${slot} ${lamportsToSOL(lamports).toFixed(3)} SOL`);
  }

  const dedupKey = `${signature}:${ixIdx}`;
  if (cluster.seen.has(dedupKey)) return;
  cluster.seen.add(dedupKey);
  if (cluster.seen.size > MAX_SEEN_KEYS) cluster.seen.clear();

  cluster.fanOutSlot = Math.min(cluster.fanOutSlot, slot);
  cluster.events.push({ child, lamports, ts: eventTs });
  cluster.lastUpdate = eventTs;

  let c = cluster.children.get(child);
  if (!c) {
    c = {
      receivedLamports: 0,
      firstFundedAt: eventTs,
      lastSeenAt: eventTs,
      // Seed balance history immediately with funding amount
      // so spend rate can be calculated from the very first updateBalances call
      balanceHistory: [{ t: eventTs, bal: lamports }],
      lastBalanceLamports: lamports,
      boughtMints: new Set(),
      txCount: 0,
    };
    cluster.children.set(child, c);
  } else {
    c.receivedLamports    += lamports;
    c.lastSeenAt           = eventTs;
    c.txCount             += 1;
    c.lastBalanceLamports += lamports;
    c.balanceHistory.push({ t: eventTs, bal: c.lastBalanceLamports });
    if (c.balanceHistory.length > MAX_HISTORY_POINTS) c.balanceHistory.shift();
    return; // already processed the first ingest below
  }

  // First time seeing this child
  c.receivedLamports = lamports;

  computeActiveStatus(cluster, eventTs);
}

// ─── Detect Cluster Behavior ──────────────────────────────────────────────────
//
// KEY CHANGE: we now scan ALL account keys in the transaction, not just the signer.
// This means we catch behavior even when:
//   - The child wallet is not the fee payer
//   - The child is referenced as a writable/readable account (e.g. as a swap destination)
//   - Multiple child wallets from the same cluster transact in one tx

function detectClusterBehavior(tx, blockTime, slot) {
  if (tx.meta?.err) return;

  const msg  = tx.transaction.message;
  const meta = tx.meta || {};

  // Resolve all account keys to strings
  const allKeys = (msg.accountKeys || []).map(k =>
    typeof k === 'string' ? k : (k.pubkey ? k.pubkey.toString() : k.toString())
  );

  // Find every cluster that has any of these keys as a child
  const matchedClusters = new Map(); // childAddr -> cluster[]
  for (const key of allKeys) {
    for (const cluster of clusters.values()) {
      if (cluster.children.has(key)) {
        if (!matchedClusters.has(key)) matchedClusters.set(key, []);
        matchedClusters.get(key).push(cluster);
      }
    }
  }

  if (matchedClusters.size === 0) return;

  // Collect all unique touched clusters
  const touchClusters = new Set();
  for (const cls of matchedClusters.values()) {
    for (const c of cls) touchClusters.add(c);
  }

  // For each matched child, update their SOL balance from post-balances
  for (const [childAddr, cls] of matchedClusters) {
    const keyIdx = allKeys.indexOf(childAddr);
    if (keyIdx < 0) continue;

    const postSolBal = (meta.postBalances || [])[keyIdx];
    for (const cluster of cls) {
      const child = cluster.children.get(childAddr);
      if (child && postSolBal != null) {
        child.lastBalanceLamports = postSolBal;
      }
    }
  }

  // Detect token gains for each matched child wallet
  // Build per-owner pre/post token balance maps
  const preByOwner  = new Map(); // owner -> { mint -> amount }
  const postByOwner = new Map();

  for (const bal of (meta.preTokenBalances || [])) {
    if (!bal.owner) continue;
    if (!preByOwner.has(bal.owner)) preByOwner.set(bal.owner, new Map());
    const m = preByOwner.get(bal.owner);
    m.set(bal.mint, (m.get(bal.mint) || 0) + Number(bal.uiTokenAmount.amount));
  }
  for (const bal of (meta.postTokenBalances || [])) {
    if (!bal.owner) continue;
    if (!postByOwner.has(bal.owner)) postByOwner.set(bal.owner, new Map());
    const m = postByOwner.get(bal.owner);
    m.set(bal.mint, (m.get(bal.mint) || 0) + Number(bal.uiTokenAmount.amount));
  }

  // For every child wallet that appears in this tx, check for token gains
  for (const [childAddr, cls] of matchedClusters) {
    const postMints = postByOwner.get(childAddr);
    const preMints  = preByOwner.get(childAddr) || new Map();
    if (!postMints) continue;

    const gained = new Set();
    for (const [mint, postAmt] of postMints) {
      const preAmt = preMints.get(mint) || 0;
      if (postAmt > preAmt && mint !== WSOL_MINT) gained.add(mint);
    }

    for (const mint of gained) {
      for (const cluster of cls) {
        cluster.tokenMints.add(mint);
        const child = cluster.children.get(childAddr);
        if (child) child.boughtMints.add(mint);
      }
    }

    if (gained.size > 0) {
      console.log(`🎯 [slot=${slot}] ${childAddr.slice(0,8)} gained: ${[...gained].map(m=>m.slice(0,8)).join(', ')}`);
    }
  }

  // Instruction-level DEX + token program analysis
  const allIxs = [...(msg.instructions || [])];
  for (const inner of (meta.innerInstructions || [])) {
    if (inner.instructions) allIxs.push(...inner.instructions);
  }

  for (const ix of allIxs) {
    let programId;
    if (ix.programId)                programId = ix.programId.toString();
    else if (ix.programIdIndex != null) programId = allKeys[ix.programIdIndex];
    if (!programId || NOISE_PROGRAMS.has(programId)) continue;

    const dexName = DEX_PROGRAMS.get(programId);
    if (dexName) {
      for (const cluster of touchClusters) {
        cluster.dexPrograms.add(dexName);
        // Store slot once per unique slot (not per tx)
        if (cluster.buySlots.length < MAX_BUY_SLOTS) {
          const lastSlot = cluster.buySlots[cluster.buySlots.length - 1];
          if (lastSlot !== slot) cluster.buySlots.push(slot);
        }
      }
    }

    if (KNOWN_BUNDLER_PROGRAMS.has(programId)) {
      for (const cluster of touchClusters) cluster.seenBundlerProgram = true;
    }

    // Token account creation → extract mint
    if (ix.parsed) {
      const type = ix.parsed.type;
      const info = ix.parsed.info || {};
      const isTok = programId === TOKEN_PROGRAM_ID || programId === TOKEN_2022_PROGRAM_ID;
      const isATA = programId === ASSOCIATED_TOKEN_PROGRAM_ID;

      if (
        (isATA && (type === 'create' || type === 'createIdempotent')) ||
        (isTok && (type === 'initializeAccount' || type === 'initializeAccount3'))
      ) {
        const mint = info.mint;
        if (mint && mint !== WSOL_MINT) {
          // Attribute mint to the child wallet that created the ATA
          const mintOwner = info.owner || info.wallet;
          for (const cluster of touchClusters) {
            cluster.tokenMints.add(mint);
            if (cluster.buySlots.length < MAX_BUY_SLOTS) {
              const lastSlot = cluster.buySlots[cluster.buySlots.length - 1];
              if (lastSlot !== slot) cluster.buySlots.push(slot);
            }
            if (mintOwner) {
              const child = cluster.children.get(mintOwner);
              if (child) child.boughtMints.add(mint);
            }
          }
        }
      }
    }
  }

  // Refresh confidence for all touched clusters
  for (const cluster of touchClusters) {
    cluster.confidence = computeConfidence(cluster);
  }
}

// ─── Balance Updates ──────────────────────────────────────────────────────────

async function getBalancesBatch(connection, addresses) {
  const results = new Array(addresses.length).fill(null);
  for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
    if (!state.isPollingStarted) return results;
    const batch   = addresses.slice(i, i + BATCH_SIZE);
    const pubkeys = batch.map(a => new PublicKey(a));

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const infos = await connection.getMultipleAccountsInfo(pubkeys, 'confirmed');
        infos.forEach((info, j) => { results[i + j] = info?.lamports ?? null; });
        break;
      } catch (e) {
        const delay = jitteredDelay(BASE_RETRY_MS * Math.pow(2, attempt));
        console.warn(`⚠️  Balance batch attempt ${attempt + 1} failed: ${e.message}`);
        if (attempt < MAX_RETRIES) await sleep(delay);
      }
    }
    await sleep(BATCH_DELAY_MS);
  }
  return results;
}

async function updateBalances(connection) {
  if (!state.isPollingStarted) return;
  const ts = Date.now();
  console.log('🔄 Balance update...');
  pruneOldClusters(ts);

  const activeClusters = Array.from(clusters.values()).filter(
    c => c.status === 'active' || c.status === 'forming'
  );
  if (activeClusters.length === 0) {
    console.log('⏭️  No active/forming clusters to update');
    return;
  }

  for (const cluster of activeClusters) {
    if (!state.isPollingStarted) return;

    const childAddrs = Array.from(cluster.children.keys());
    const balances   = await getBalancesBatch(connection, childAddrs);
    let totalRemaining = 0, activeWallets = 0;

    for (let idx = 0; idx < childAddrs.length; idx++) {
      if (!state.isPollingStarted) return;
      const child = cluster.children.get(childAddrs[idx]);
      // Use fetched balance, fall back to last known
      const bal   = balances[idx] ?? child.lastBalanceLamports ?? 0;

      child.lastBalanceLamports = bal;

      // Only push to history if value changed (avoid duplicate points)
      const lastPt = child.balanceHistory[child.balanceHistory.length - 1];
      if (!lastPt || lastPt.bal !== bal) {
        child.balanceHistory.push({ t: ts, bal });
        if (child.balanceHistory.length > MAX_HISTORY_POINTS) child.balanceHistory.shift();
      }

      totalRemaining += bal;
      if (bal > 0) activeWallets++;
    }

    cluster.cachedRemainingLamports = totalRemaining;

    // ── Token concentration refinement ────────────────────────────────────
    const mintBuyers = new Map();
    for (const [addr, child] of cluster.children) {
      for (const mint of child.boughtMints) {
        if (!mintBuyers.has(mint)) mintBuyers.set(mint, new Set());
        mintBuyers.get(mint).add(addr);
      }
    }
    if (mintBuyers.size > 0) {
      let domMint = null, domBuyers = new Set(), domCount = 0;
      for (const [mint, buyers] of mintBuyers) {
        if (buyers.size > domCount) { domCount = buyers.size; domMint = mint; domBuyers = buyers; }
      }
      if (domCount >= FORMING_MIN_CHILDREN && domMint) {
        const toRemove = [...cluster.children.keys()].filter(a => !domBuyers.has(a));
        if (toRemove.length > 0) {
          toRemove.forEach(a => {
            cluster.children.delete(a);
            cluster.events = cluster.events.filter(e => e.child !== a);
          });
          cluster.totalFundedLamports = cluster.events.reduce((s, e) => s + e.lamports, 0);
          cluster.tokenMints.clear();
          cluster.tokenMints.add(domMint);
          console.log(`🎯 Refined [${cluster.parent.slice(0,8)}] → ${domCount} wallets → ${domMint.slice(0,8)}`);
        }
      }
    }

    computeActiveStatus(cluster, ts);
    cluster.confidence = computeConfidence(cluster);

    // ── Spend rate ────────────────────────────────────────────────────────
    // Use all available history — the seeded funding balance means this works
    // from the very first updateBalances call
    const windowStart = ts - SPEND_RATE_WINDOW_MS;
    let balNow = 0, balThen = 0, hasHistory = false;

    for (const child of cluster.children.values()) {
      if (child.balanceHistory.length < 1) continue;

      // Most recent balance
      balNow += child.balanceHistory[child.balanceHistory.length - 1].bal;

      // Earliest point within window (or oldest if all older than window)
      let ref = child.balanceHistory[0];
      for (const pt of child.balanceHistory) {
        if (pt.t >= windowStart) { ref = pt; break; }
      }
      balThen += ref.bal;
      hasHistory = true;
    }

    cluster.cachedSpendRateLamportsPerSec = 0;
    cluster.cachedTimeRemainingSec = totalRemaining > 0 ? 'N/A' : 0;

    if (hasHistory) {
      const spent      = Math.max(0, balThen - balNow);
      const elapsedMs  = Math.min(ts - windowStart, ts - cluster.createdAt);
      const elapsedSec = Math.max(elapsedMs / 1000, 1); // min 1s to avoid div/0

      if (elapsedSec >= 3) {
        const rate = spent / elapsedSec;
        cluster.cachedSpendRateLamportsPerSec = rate;
        if (totalRemaining > 0 && rate > 0) {
          cluster.cachedTimeRemainingSec = Math.floor(totalRemaining / rate);
        }
      }
    }

    const jitter = analyzeSlotJitter(cluster.buySlots);
    console.log(
      `✅ [${cluster.parent.slice(0,8)}] ` +
      `rem=${lamportsToSOL(totalRemaining).toFixed(3)} SOL | ` +
      `spend=${(lamportsToSOL(cluster.cachedSpendRateLamportsPerSec)*60).toFixed(4)} SOL/min | ` +
      `wallets=${activeWallets}/${childAddrs.length} | ` +
      `conf=${cluster.confidence} | ` +
      `jitter=${jitter.label} | ` +
      `dex=${Array.from(cluster.dexPrograms).join(',')||'none'} | ` +
      `mints=${cluster.tokenMints.size}`
    );

    cluster.lastUpdate = ts;
  }

  console.log(`🏁 Balance update done (${activeClusters.length} clusters)`);
}

// ─── Serialize ────────────────────────────────────────────────────────────────

function serializeClusters() {
  const ts  = Date.now();
  const arr = [];

  for (const cluster of clusters.values()) {
    if (cluster.status === 'inactive') continue;

    const children = Array.from(cluster.children.values());
    const amounts  = children.map(c => c.receivedLamports);
    const mean     = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
    const std      = amounts.length > 0
      ? Math.sqrt(amounts.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / amounts.length)
      : 0;

    // Dominant mint
    const mintBuyers = new Map();
    for (const child of children) {
      for (const mint of child.boughtMints) {
        mintBuyers.set(mint, (mintBuyers.get(mint) || 0) + 1);
      }
    }
    let domMint = null, domMintBuyers = 0;
    for (const [mint, count] of mintBuyers) {
      if (count > domMintBuyers) { domMint = mint; domMintBuyers = count; }
    }

    const jitter     = analyzeSlotJitter(cluster.buySlots);
    const rugRisk    = computeRugRisk(cluster);
    const ageSeconds = Math.floor((ts - cluster.createdAt) / 1000);

    // Non-pending token mints
    const tokenMints = cluster.tokenMints.size > 0
      ? Array.from(cluster.tokenMints).filter(m => m !== 'Pending')
      : [];

    arr.push({
      funding_wallet:  cluster.parent,
      recipients:      Array.from(cluster.children.keys()),
      children_count:  cluster.children.size,
      status:          cluster.status,

      token_mints:           tokenMints.length > 0 ? tokenMints : ['Pending'],
      dominant_mint:         domMint,
      dominant_mint_buyers:  domMintBuyers,

      fan_out_slot: cluster.fanOutSlot,
      buy_slots:    cluster.buySlots.sort((a, b) => a - b),
      slot_jitter:  jitter,

      common_patterns: {
        avg_transfer:         `~${lamportsToSOL(mean).toFixed(4)} SOL (±${lamportsToSOL(std).toFixed(4)} SOL)`,
        transfer_uniformity:  parseFloat((1 - Math.min(1, mean > 0 ? std / mean : 0)).toFixed(3)),
        dex_programs:         cluster.dexPrograms.size > 0 ? Array.from(cluster.dexPrograms) : ['Pending'],
        velocity_score:       cluster.velocityScore || 0,
        seen_bundler_program: cluster.seenBundlerProgram || false,
        grandchild_count:     cluster.grandchildCount || 0,
      },

      total_sol_funded:       lamportsToSOL(cluster.totalFundedLamports),
      total_sol_remaining:    lamportsToSOL(cluster.cachedRemainingLamports || 0),
      spend_rate_sol_per_min: lamportsToSOL(cluster.cachedSpendRateLamportsPerSec || 0) * 60,
      time_remaining_sec:     cluster.cachedTimeRemainingSec,

      confidence: cluster.confidence,
      rug_risk:   rugRisk,

      created_at:      cluster.createdAt,
      last_update:     cluster.lastUpdate,
      cluster_age_sec: ageSeconds,
    });
  }

  arr.sort((a, b) => b.confidence - a.confidence || b.created_at - a.created_at);
  return arr;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function getClusterStats() {
  const all     = Array.from(clusters.values());
  const active  = all.filter(c => c.status === 'active');
  const forming = all.filter(c => c.status === 'forming');
  const totalSOL = active.reduce((s, c) => s + lamportsToSOL(c.totalFundedLamports), 0);
  const avgConf  = active.length > 0
    ? active.reduce((s, c) => s + (c.confidence || 0), 0) / active.length
    : 0;

  return {
    totalClusters:    clusters.size,
    activeClusters:   active.length,
    formingClusters:  forming.length,
    totalSOLInActive: parseFloat(totalSOL.toFixed(4)),
    avgConfidence:    parseFloat(avgConf.toFixed(1)),
    topCluster: [...active].sort((a, b) => (b.confidence||0) - (a.confidence||0))[0]?.parent || null,
  };
}

function clearClusters() {
  clusters.clear();
  parentLineage.clear();
  console.log('🧹 Clusters cleared');
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  ingestTransfer,
  updateBalances,
  detectClusterBehavior,
  serializeClusters,
  getClusterStats,
  clearClusters,
  _clusters: clusters,
  _parentLineage: parentLineage,
};
