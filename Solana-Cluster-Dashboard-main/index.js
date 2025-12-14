const { Connection } = require('@solana/web3.js');
const { RPC_URL, POLL_INTERVAL_MS, SPEND_REFRESH_MS } = require('./config');
const { ingestTransfer, updateBalances, getClusterStats, detectClusterBehavior, clearClusters } = require('./cluster');
const { startApi } = require('./api');
const state = require('./state');

if (!RPC_URL) {
  console.error('Missing RPC_URL in .env - using mainnet default');
}

// Use 'processed' for faster ingestion
const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=866ca2a0-db6a-4527-adfe-3a1aa6682c65', 'processed');
console.log('Connected to Solana Mainnet RPC:', RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=866ca2a0-db6a-4527-adfe-3a1aa6682c65');

let lastProcessedSlot = 0;
let pollInterval = null;
let balanceInterval = null;

async function processSlot(slot) {
  let attempt = 0;
  const maxAttempts = 3;
  const baseDelay = 1000; 
  
  while (attempt < maxAttempts && state.isPollingStarted) {
    try {
      console.log(`Processing slot ${slot}...`);
      const block = await connection.getParsedBlock(slot, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
      });

      if (!block || !block.blockTime || !block.transactions) {
        console.log(`No data for slot ${slot}`);
        return;
      }

      const blockTime = block.blockTime;
      console.log(`Block ${slot} time: ${new Date(blockTime * 1000).toISOString()}, transactions: ${block.transactions.length}`);

      for (const tx of block.transactions) {
        if (!state.isPollingStarted) return; // Early exit if stopped
        if (tx.meta?.err) {
          continue;
        }

        detectClusterBehavior(tx, blockTime, slot);

        const messageInstructions = tx.transaction.message.instructions || [];
        const innerInstructions = tx.meta?.innerInstructions || [];

        const allInstructions = [...messageInstructions];
        for (const inner of innerInstructions) {
          allInstructions.push(...inner.instructions);
        }

        let ixIdx = 0;
        for (const ix of allInstructions) {
          if (ix.program === 'system' && ix.parsed?.type === 'transfer') {
            const info = ix.parsed.info;
            const from = info.source;
            const to = info.destination;
            const lamports = Number(info.lamports) || 0;

            if (lamports > 0) {
              console.log(`SOL transfer detected: ${from.slice(0, 6)}...${from.slice(-4)} -> ${to.slice(0, 6)}...${to.slice(-4)}, ${(lamports / 1_000_000_000).toFixed(6)} SOL`);
              
              ingestTransfer({
                parent: from,
                child: to,
                lamports,
                ts: blockTime,
                slot: slot,
                signature: tx.transaction.signatures[0],
                ixIdx
              });
            }
          } else if (ix.program === 'spl-token' && ix.parsed?.type === 'transfer' && ix.parsed.info.mint === 'So11111111111111111111111111111111111111112') {
            const info = ix.parsed.info;
            const from = info.authority;
            const destTokenAcc = info.destination;
            const amount = Number(info.amount) || 0;

            if (amount < require('./config').MIN_TRANSFER_LAMPORTS) continue;

            // Get account keys as strings
            const accountKeys = tx.transaction.message.accountKeys.map(key => key.pubkey.toString());
            const destIndex = accountKeys.indexOf(destTokenAcc);
            if (destIndex === -1) continue;

            const postBal = tx.meta.postTokenBalances.find(b => b.accountIndex === destIndex);
            if (!postBal) continue;

            const to = postBal.owner;

            console.log(`WSOL transfer detected: ${from.slice(0, 6)}...${from.slice(-4)} -> ${to.slice(0, 6)}...${to.slice(-4)}, ${(amount / 1_000_000_000).toFixed(6)} SOL`);

            ingestTransfer({
              parent: from,
              child: to,
              lamports: amount,
              ts: blockTime,
              slot: slot,
              signature: tx.transaction.signatures[0],
              ixIdx
            });
          }
          ixIdx++;
        }
      }

      return;
    } catch (e) {
      if ((e.response?.status === 429 || e.message?.includes('429') || e.message?.includes('Too Many Requests')) && attempt < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limit hit for slot ${slot}. Retrying after ${delay}ms delay... (attempt ${attempt + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      } else {
        console.error(`Failed to process slot ${slot} after ${attempt + 1} attempts:`, e?.message || e);
        return;
      }
    }
  }
}

async function poll() {
  if (!state.isPollingStarted) return;
  try {
    console.log('Starting poll cycle...');
    const current = await connection.getSlot('processed');
    console.log(`Current slot: ${current}`);

    if (lastProcessedSlot === 0) {
      lastProcessedSlot = current - 5;
      console.log(`Initial lastProcessedSlot set to: ${lastProcessedSlot}`);
    }

    const maxSlotsToProcess = 20;
    const startSlot = Math.max(lastProcessedSlot + 1, current - maxSlotsToProcess);
    
    for (let s = startSlot; s <= current; s++) {
      if (!state.isPollingStarted) return; // Early exit if stopped
      await processSlot(s);
      lastProcessedSlot = s;
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const stats = getClusterStats();
    console.log(`Poll cycle completed. Last processed slot: ${lastProcessedSlot}, Active clusters: ${stats.activeClusters}/${stats.totalClusters}`);
  } catch (e) {
    console.error('Poll error:', e?.message || e);
  }
}

function stopPolling() {
  state.isPollingStarted = false;
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
    console.log('🛑 Stopped polling interval');
  }
  if (balanceInterval) {
    clearInterval(balanceInterval);
    balanceInterval = null;
    console.log('🛑 Stopped balance update interval');
  }
}

async function startPolling() {
  if (state.isPollingStarted) {
    console.log('Polling already started, skipping initialization.');
    return;
  }

  console.log('🚀 Starting Solana Cluster Monitor for MAINNET...');
  console.log('📊 Requirements: ≥5 children, ≥20 SOL total, ≥1 SOL per transfer, 10s detection window');
  console.log('⚡ REAL-TIME MODE: New clusters appear immediately!');
  
  clearClusters(); // Clear old data for fresh start
  lastProcessedSlot = 0; // Reset to start from recent slots
  state.isPollingStarted = true;

  await poll();
  
  pollInterval = setInterval(poll, POLL_INTERVAL_MS);
  
  setTimeout(async () => {
    console.log('🎯 Running initial balance update...');
    await updateBalances(connection);
  }, 5000);

  console.log(`⏱️ Polling every ${POLL_INTERVAL_MS}ms, Balance updates every 15s for real-time data`);
  balanceInterval = setInterval(() => {
    console.log('🔄 Starting real-time balance update...');
    updateBalances(connection)
      .then(() => {
        const stats = getClusterStats();
        console.log(`✅ Real-time update completed. Active clusters: ${stats.activeClusters} (sorted by newest first)`);
      })
      .catch(err => console.error('❌ Balance update failed:', err.message));
  }, 15000);
}

async function start() {
  const port = process.env.PORT || 3001;
  
  startApi(port, startPolling, stopPolling);
  
  console.log('✅ API server started, waiting for /clusters request to begin polling.');

  process.on('SIGINT', () => {
    console.log('🛑 Shutting down gracefully...');
    stopPolling();
    process.exit(0);
  });
}

start().catch(error => {
  console.error('❌ Failed to start monitor:', error);
  process.exit(1);
});