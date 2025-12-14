# DecClust — Solana Wallet Cluster Detection

DecClust is a real-time on-chain intelligence system that detects coordinated wallet funding and trading behavior on the Solana blockchain.

It identifies parent wallets funding multiple child wallets in short time windows and tracks how those wallets deploy capital across tokens and DEXes — enabling early detection of pump coordination, wallet farms, and potential rug pull setups.

---

## 🔍 What DecClust Detects

DecClust monitors Solana transactions in real time and detects:

- Parent wallets funding multiple child wallets
- Rapid fan-out funding patterns
- Coordinated token purchases
- DEX-level trading activity
- Spend-rate behavior across clusters
- Remaining liquidity and time-to-depletion estimates

This behavior is commonly associated with:
- Pump-and-dump coordination
- Insider token launches
- Sniper wallet farms
- Liquidity drain events
- Market manipulation setups

---

## ⚙️ How It Works

### 1. Funding Detection
- Monitors native SOL transfers
- Detects parent wallets funding ≥ N child wallets
- Enforces minimum SOL thresholds
- Uses sliding time windows to detect coordination

### 2. Cluster Classification
Clusters are classified as:
- **Forming** — early-stage funding activity
- **Active** — confirmed coordinated behavior
- **Inactive** — expired or incomplete clusters

### 3. Token & DEX Tracking
- Detects token mints acquired by child wallets
- Tracks swaps across major Solana DEXes:
  - Raydium
  - Jupiter
  - Orca
  - Pump.fun
  - Lifinity
  - Meteora
  - Phoenix
  - Saber
- Associates clusters with dominant traded tokens

### 4. Spend Rate & Liquidity Analysis
- Continuously polls wallet balances
- Computes SOL spend rate (SOL/min)
- Estimates remaining time before funds are exhausted

---

## 📊 Dashboard Features

- Live cluster table
- Active / forming status indicators
- Total SOL funded
- Remaining SOL
- Spend rate estimation
- Child wallet count
- Token mints involved
- DEX programs used
- Fan-out slot tracking
- Expandable cluster details

---

## 🧠 Use Cases

- Traders seeking early pump detection
- Risk analysis for new token launches
- MEV and arbitrage intelligence
- Whale activity monitoring
- Market manipulation detection
- Research and analytics tooling

---

## 🧱 Tech Stack

- **Backend**
  - Node.js
  - Solana Web3.js
  - Helius / Solana RPC
  - Real-time polling & batching
- **Frontend**
  - Next.js
  - React
  - Tailwind
- **Infrastructure**
  - Vercel deployment
  - Real-time state processing

---

## 🚀 Live Demo

Dashboard:  
https://clust-dec.vercel.app/

---

## ⚠️ Disclaimer

This tool provides on-chain intelligence only.  
It does not constitute financial advice.
