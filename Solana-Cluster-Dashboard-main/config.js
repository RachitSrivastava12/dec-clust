
// config.js
require('dotenv').config();

module.exports = {
  // Use mainnet RPC URL
  RPC_URL: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
  
  // Poll every 1 second for faster detection
  POLL_INTERVAL_MS: parseInt(process.env.POLL_INTERVAL_MS || '1000', 10),
  
  // 10 second window to catch fast funding clusters
  WINDOW_MS: parseInt(process.env.WINDOW_MS || '10000', 10),

  // 7 second window for forming
  FORMING_WINDOW_MS: parseInt(process.env.FORMING_WINDOW_MS || '7000', 10),
  
  // Minimum 5 children for active cluster, 3 for forming
  MIN_CHILDREN: parseInt(process.env.MIN_CHILDREN || '5', 10),
  FORMING_MIN_CHILDREN: parseInt(process.env.FORMING_MIN_CHILDREN || '3', 10),
  
  // Update balances every 15 seconds
  SPEND_REFRESH_MS: parseInt(process.env.SPEND_REFRESH_MS || '15000', 10),
  
  // 5 minute window for spend rate calculation
  SPEND_RATE_WINDOW_MS: parseInt(process.env.SPEND_RATE_WINDOW_MS || '300000', 10),
  
  // Minimum SOL per transfer (1 SOL = 1,000,000,000 lamports)
  MIN_TRANSFER_LAMPORTS: parseInt(process.env.MIN_TRANSFER_LAMPORTS || '1000000000', 10), // 1 SOL
  
  // Minimum total cluster funding (20 SOL)
  MIN_CLUSTER_FUNDING_LAMPORTS: parseInt(process.env.MIN_CLUSTER_FUNDING_LAMPORTS || '20000000000', 10), // 20 SOL
  
  // Data retention window (30 minutes)
  DATA_RETENTION_MS: parseInt(process.env.DATA_RETENTION_MS || '1800000', 10), // 30 minutes
};
