
const { PublicKey, Connection } = require('@solana/web3.js');
const { 
  WINDOW_MS, 
  FORMING_WINDOW_MS,
  MIN_CHILDREN, 
  FORMING_MIN_CHILDREN,
  SPEND_RATE_WINDOW_MS, 
  MIN_TRANSFER_LAMPORTS,
  MIN_CLUSTER_FUNDING_LAMPORTS,
  DATA_RETENTION_MS 
} = require('./config');
const state = require('./state');

const clusters = new Map();
const MAX_HISTORY_POINTS = 20;

const SYSTEM_PROGRAM_ID = '11111111111111111111111111111111';
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const ASSOCIATED_TOKEN_PROGRAM_ID = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
const WSOL_MINT = 'So11111111111111111111111111111111111111112';

const DEX_PROGRAMS = {
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'Raydium',
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P': 'pump.fun',
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': 'Orca',
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': 'Jupiter',
  '2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c': 'Lifinity',
  'PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY': 'Phoenix V1',
  'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo': 'Meteora DLMM',
  'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG': 'Meteora DAMM',
  'GAMMA7meSFWaBXF25oSUgmGRwaW6sCMFLmBNiMSdbHVT': 'GooseFX',
  '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP': 'Serum',
  'SaberqXzwVjhZFkrHkh2SgSV9G3pK3G6kD3E8k6FHYt': 'Saber',
};

function lamportsToSOL(l) {
  return l / 1_000_000_000;
}

function pruneOldClusters(now) {
  const cutoff = now - DATA_RETENTION_MS;
  for (const [parent, cluster] of clusters.entries()) {
    if (cluster.lastUpdate < cutoff) {
      console.log(`Removing old cluster ${parent} (last update: ${new Date(cluster.lastUpdate).toISOString()})`);
      clusters.delete(parent);
    }
  }
}

function computeActiveStatus(cluster, now) {
  if (cluster.events.length === 0) {
    cluster.status = 'inactive';
    cluster.active = false;
    return;
  }

  const validChildren = new Set();
  for (const [childAddr, child] of cluster.children) {
    if (child.receivedLamports >= MIN_TRANSFER_LAMPORTS) {
      validChildren.add(childAddr);
    }
  }
  const uniq = validChildren.size;
  const total = cluster.events
    .filter(e => validChildren.has(e.child))
    .reduce((s, e) => s + e.lamports, 0);
  const tsList = cluster.events
    .filter(e => validChildren.has(e.child))
    .map(e => e.ts);
  const minTs = tsList.length > 0 ? Math.min(...tsList) : now;
  const maxTs = tsList.length > 0 ? Math.max(...tsList) : now;
  const span = maxTs - minTs;

  cluster.totalFundedLamports = total;

  let status = 'inactive';
  if (span <= FORMING_WINDOW_MS && uniq >= FORMING_MIN_CHILDREN && total >= MIN_TRANSFER_LAMPORTS * FORMING_MIN_CHILDREN) {
    status = 'forming';
  }
  if (span <= WINDOW_MS && uniq >= MIN_CHILDREN && total >= MIN_CLUSTER_FUNDING_LAMPORTS) {
    status = 'active';
  }

  cluster.status = status;
  cluster.active = status === 'active';

  console.log(`Cluster ${cluster.parent} - Children: ${uniq}/${MIN_CHILDREN}, Funding: ${lamportsToSOL(total)}/${lamportsToSOL(MIN_CLUSTER_FUNDING_LAMPORTS)} SOL, Span: ${(span / 1000).toFixed(2)}s, Status: ${status}`);
}

function ingestTransfer({ parent, child, lamports, ts, slot, signature, ixIdx }) {
  const now = ts * 1000;

  if (lamports < MIN_TRANSFER_LAMPORTS) {
    console.log(`Transfer below minimum threshold: ${lamportsToSOL(lamports)} SOL (min: ${lamportsToSOL(MIN_TRANSFER_LAMPORTS)} SOL)`);
    return;
  }

  let cluster = clusters.get(parent);
  if (!cluster) {
    cluster = {
      parent,
      createdAt: now,
      events: [],
      children: new Map(),
      totalFundedLamports: 0,
      active: false,
      status: 'inactive',
      lastUpdate: now,
      fanOutSlot: slot,
      buySlots: [],
      dexPrograms: new Set(),
      tokenMints: new Set(),
      seen: new Set(),
    };
    clusters.set(parent, cluster);
    console.log(`New cluster created for parent: ${parent} at slot ${slot} with ${lamportsToSOL(lamports)} SOL transfer`);
  }

  const key = `${signature}:${ixIdx}`;
  if (cluster.seen.has(key)) {
    console.log(`Duplicate transfer detected for key ${key}`);
    return;
  }
  cluster.seen.add(key);
  if (cluster.seen.size > 1000) cluster.seen.clear();

  cluster.fanOutSlot = Math.min(cluster.fanOutSlot, slot);
  cluster.events.push({ child, lamports, ts: now });
  cluster.lastUpdate = now;

  let c = cluster.children.get(child) || {
    receivedLamports: 0,
    firstFundedAt: now,
    lastSeenAt: now,
    balanceHistory: [{ t: now, bal: lamports }],
    lastBalanceLamports: lamports,
    boughtMints: new Set(),
  };
  c.receivedLamports += lamports;
  c.lastSeenAt = now;
  if (!cluster.children.has(child)) {
    cluster.children.set(child, c);
  } else {
    c.balanceHistory.push({ t: now, bal: c.lastBalanceLamports + lamports });
    if (c.balanceHistory.length > MAX_HISTORY_POINTS) {
      c.balanceHistory.shift();
    }
  }

  computeActiveStatus(cluster, now);
}

function detectClusterBehavior(tx, blockTime, slot) {
  const now = blockTime * 1000;
  const msg = tx.transaction.message;
  const meta = tx.meta || {};
  const accountKeys = msg.accountKeys.map(k => k.pubkey.toString());
  const allIxs = [...msg.instructions];
  for (const inner of (meta.innerInstructions || [])) {
    allIxs.push(...inner.instructions);
  }

  const signer = accountKeys[0];
  const touchClusters = [];
  for (const [_, cluster] of clusters.entries()) {
    if (cluster.children.has(signer)) {
      touchClusters.push(cluster);
    }
  }
  if (touchClusters.length === 0) return;

  // Track token balance changes
  const preMap = new Map();
  for (const bal of (meta.preTokenBalances || [])) {
    if (bal.owner !== signer) continue;
    const current = preMap.get(bal.mint) || 0;
    preMap.set(bal.mint, current + Number(bal.uiTokenAmount.amount));
  }
  const postMap = new Map();
  for (const bal of (meta.postTokenBalances || [])) {
    if (bal.owner !== signer) continue;
    const current = postMap.get(bal.mint) || 0;
    postMap.set(bal.mint, current + Number(bal.uiTokenAmount.amount));
  }

  const increasedMints = new Set();
  for (const [mint, postAmt] of postMap) {
    const preAmt = preMap.get(mint) || 0;
    if (postAmt > preAmt && mint !== WSOL_MINT) {
      increasedMints.add(mint);
    }
  }

  const child = touchClusters[0].children.get(signer);
  if (child) {
    for (const mint of increasedMints) {
      child.boughtMints.add(mint);
    }
  }

  // Enhanced token and DEX detection
  for (const ix of allIxs) {
    let programId;
    if (ix.programId) {
      programId = ix.programId.toString();
    } else if (ix.programIdIndex !== undefined) {
      programId = accountKeys[ix.programIdIndex];
    }
    if (!programId) continue;

    const dexName = DEX_PROGRAMS[programId];
    if (dexName) {
      for (const cluster of touchClusters) {
        cluster.dexPrograms.add(dexName);
        if (!cluster.buySlots.includes(slot)) {
          cluster.buySlots.push(slot);
        }
      }
    }

    if (ix.parsed) {
      const type = ix.parsed.type;
      const info = ix.parsed.info;
      if (programId === ASSOCIATED_TOKEN_PROGRAM_ID && (type === 'create' || type === 'createIdempotent')) {
        const mint = info?.mint;
        if (mint && mint !== WSOL_MINT) {
          for (const cluster of touchClusters) {
            cluster.tokenMints.add(mint);
            if (!cluster.buySlots.includes(slot)) {
              cluster.buySlots.push(slot);
            }
            if (child) {
              child.boughtMints.add(mint);
            }
          }
        }
      } else if (programId === TOKEN_PROGRAM_ID && (type === 'initializeAccount' || type === 'transfer' || type === 'mint')) {
        const mint = info?.mint;
        if (mint && mint !== WSOL_MINT) {
          for (const cluster of touchClusters) {
            cluster.tokenMints.add(mint);
            if (!cluster.buySlots.includes(slot)) {
              cluster.buySlots.push(slot);
            }
            if (child) {
              child.boughtMints.add(mint);
            }
          }
        }
      }
    }
  }

  console.log(`Processed behavior for ${touchClusters.length} clusters at slot ${slot}, detected mints: ${Array.from(increasedMints)}`);
}

async function updateBalances(connection) {
  if (!state.isPollingStarted) return;
  console.log('🔄 Updating balances for all clusters...');
  const now = Date.now();

  pruneOldClusters(now);

  const activeClusters = Array.from(clusters.values()).filter(c => c.status === 'active' || c.status === 'forming');
  console.log(`📊 Processing ${activeClusters.length} active/forming clusters for balance updates`);

  for (const cluster of activeClusters) {
    if (!state.isPollingStarted) return;
    console.log(`💰 Updating balance for cluster ${cluster.parent.slice(0, 8)}... (${cluster.children.size} children)`);

    const childAddrs = Array.from(cluster.children.keys());
    const balances = await getBalancesBatch(connection, childAddrs);

    let totalRemaining = 0;
    let validBalances = 0;

    childAddrs.forEach((addr, idx) => {
      if (!state.isPollingStarted) return;
      let balLamports = balances[idx];
      const child = cluster.children.get(addr);
      if (balLamports == null) balLamports = child.lastBalanceLamports || 0;

      child.lastBalanceLamports = balLamports;
      if (child.balanceHistory[child.balanceHistory.length - 1].bal !== balLamports) {
        child.balanceHistory.push({ t: now, bal: balLamports });
        if (child.balanceHistory.length > MAX_HISTORY_POINTS) {
          child.balanceHistory.shift();
        }
      }

      totalRemaining += balLamports;
      if (balLamports > 0) validBalances++;
    });

    cluster.cachedRemainingLamports = totalRemaining;

    const buyersPerToken = new Map();
    for (const [addr, child] of cluster.children) {
      for (const mint of child.boughtMints) {
        if (!buyersPerToken.has(mint)) buyersPerToken.set(mint, new Set());
        buyersPerToken.get(mint).add(addr);
      }
    }

    if (buyersPerToken.size > 0) {
      let maxToken = null;
      let maxSet = new Set();
      let maxCount = 0;
      for (const [m, s] of buyersPerToken) {
        if (s.size > maxCount) {
          maxCount = s.size;
          maxToken = m;
          maxSet = s;
        }
      }

      if (maxCount >= FORMING_MIN_CHILDREN) {
        const toRemove = Array.from(cluster.children.keys()).filter(a => !maxSet.has(a));
        toRemove.forEach(a => {
          cluster.children.delete(a);
          cluster.events = cluster.events.filter(e => e.child !== a);
        });
        cluster.totalFundedLamports = cluster.events.reduce((s, e) => s + e.lamports, 0);
        cluster.tokenMints.clear();
        cluster.tokenMints.add(maxToken);
        console.log(`Refined cluster ${cluster.parent} to ${maxCount} children buying ${maxToken}`);
      }
    }

    computeActiveStatus(cluster, now);

    const windowStart = now - SPEND_RATE_WINDOW_MS;
    let balNow = 0;
    let balThen = 0;
    let hasHistoryData = false;

    for (const child of cluster.children.values()) {
      if (!state.isPollingStarted) return;
      if (child.balanceHistory.length < 1) continue;

      const latest = child.balanceHistory[child.balanceHistory.length - 1];
      balNow += latest.bal;

      let earliestInWindow = null;
      for (const point of child.balanceHistory) {
        if (point.t >= windowStart) {
          earliestInWindow = point;
          break;
        }
      }

      if (earliestInWindow) {
        balThen += earliestInWindow.bal;
        hasHistoryData = true;
      } else {
        balThen += child.balanceHistory[0].bal;
        hasHistoryData = true;
      }
    }

    cluster.cachedSpendRateLamportsPerSec = 0; // Default to 0
    cluster.cachedTimeRemainingSec = totalRemaining > 0 ? "N/A    " : 0; // Default to 1 hour if funds remain

    if (hasHistoryData) {
      const spentLamports = balThen - balNow;
      const timeElapsedMs = Math.min(now - windowStart, now - cluster.createdAt);
      const timeElapsedSec = timeElapsedMs / 1000;

      if (timeElapsedSec >= 3) {
        if (spentLamports >= 0) {
          cluster.cachedSpendRateLamportsPerSec = spentLamports / timeElapsedSec;
          if (totalRemaining > 0) {
            cluster.cachedTimeRemainingSec = cluster.cachedSpendRateLamportsPerSec > 0
              ? Math.floor(totalRemaining / cluster.cachedSpendRateLamportsPerSec)
              : "N/A"; // Default to 1 hour if no spending
          }
        }
      }
    } else {
      cluster.cachedSpendRateLamportsPerSec = 0; // Explicitly set for no history
    }

    const remainingSOL = lamportsToSOL(totalRemaining);
    const spendRateSOL = lamportsToSOL(cluster.cachedSpendRateLamportsPerSec) * 60;

    console.log(`✅ Cluster ${cluster.parent.slice(0, 8)}... - Remaining: ${remainingSOL.toFixed(6)} SOL, Spend Rate: ${spendRateSOL.toFixed(6)} SOL/min, Time Left: ${cluster.cachedTimeRemainingSec} sec, Active Wallets: ${validBalances}/${childAddrs.length}`);

    cluster.lastUpdate = now;
  }

  console.log(`🏁 Balance update completed for ${activeClusters.length} clusters`);
}

async function getBalancesBatch(connection, addresses) {
  const results = new Array(addresses.length).fill(null);
  const chunkSize = 100;
  const retries = 2;

  for (let i = 0; i < addresses.length; i += chunkSize) {
    if (!state.isPollingStarted) return results;
    const batch = addresses.slice(i, Math.min(i + chunkSize, addresses.length));
    const pubkeys = batch.map(addr => new PublicKey(addr));
    let success = false;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const infos = await connection.getMultipleAccountsInfo(pubkeys, 'confirmed');
        infos.forEach((info, j) => results[i + j] = info?.lamports ?? null);
        success = true;
        break;
      } catch (e) {
        console.warn(`Batch balance fetch attempt ${attempt + 1} failed: ${e.message}`);
        if (attempt === retries) {
          console.error(`Failed to fetch batch after retries`);
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  return results;
}

function serializeClusters() {
  const arr = [];
  const now = Date.now();

  for (const cluster of clusters.values()) {
    if (cluster.status === 'inactive') continue;

    const received = Array.from(cluster.children.values()).map(c => c.receivedLamports);
    const avgTransferAmount = received.length > 0 ? received.reduce((a, b) => a + b, 0) / received.length : 0;
    const variance = received.reduce((s, x) => s + Math.pow(x - avgTransferAmount, 2), 0) / received.length;
    const std = Math.sqrt(variance);

    const clusterAgeSeconds = Math.floor((now - cluster.createdAt) / 1000);
    const remainingSOL = cluster.cachedRemainingLamports != null 
      ? lamportsToSOL(cluster.cachedRemainingLamports) 
      : 0;
    const spendRatePerMin = lamportsToSOL(cluster.cachedSpendRateLamportsPerSec) * 60;

    arr.push({
      funding_wallet: cluster.parent,
      recipients: Array.from(cluster.children.keys()),
      token_mints: cluster.tokenMints.size > 0 ? Array.from(cluster.tokenMints) : ['Pending'],
      fan_out_slot: cluster.fanOutSlot,
      buy_slots: cluster.buySlots.sort((a, b) => a - b),
      common_patterns: {
        amounts: `~${lamportsToSOL(avgTransferAmount).toFixed(3)} SOL each (±${lamportsToSOL(std).toFixed(3)} SOL)`,
        wallet_age: `${clusterAgeSeconds} seconds old (fast funding detected)`,
        dex_programs: cluster.dexPrograms.size > 0 ? Array.from(cluster.dexPrograms) : ['Pending'],
      },
      total_sol_funded: lamportsToSOL(cluster.totalFundedLamports),
      total_sol_remaining: remainingSOL,
      spend_rate_sol_per_min: spendRatePerMin,
      time_remaining_sec: cluster.cachedTimeRemainingSec,
      last_update: cluster.lastUpdate,
      cluster_age_sec: clusterAgeSeconds,
      children_count: cluster.children.size,
      created_at: cluster.createdAt,
      status: cluster.status,
    });
  }

  arr.sort((a, b) => (b.created_at - a.created_at));
  console.log(`📊 Serialized ${arr.length} active clusters - sorted by newest first`);
  return arr;
}

function getClusterStats() {
  const totalClusters = clusters.size;
  const activeClusters = Array.from(clusters.values()).filter(c => c.status === 'active').length;
  return { totalClusters, activeClusters };
}

function clearClusters() {
  clusters.clear();
  console.log('🧹 Cleared all clusters for fresh start');
}

module.exports = {
  ingestTransfer,
  updateBalances,
  detectClusterBehavior,
  serializeClusters,
  getClusterStats,
  clearClusters
};