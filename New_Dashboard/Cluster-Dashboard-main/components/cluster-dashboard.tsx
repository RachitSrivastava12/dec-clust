"use client"

import { useEffect, useRef, useState } from "react"
import {
  Activity, Database, TrendingUp, Wallet, Filter, Download,
  RefreshCw, Search, X, Zap, Shield, AlertTriangle, ChevronUp, ChevronDown, Copy
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface SlotJitter {
  label: "low" | "medium" | "high" | "insufficient_data"
  stdDevSlots: number
  meanGapSlots: number
}

interface CommonPatterns {
  avg_transfer: string
  transfer_uniformity: number
  dex_programs: string[]
  velocity_score: number
  seen_bundler_program: boolean
  grandchild_count: number
}

interface Cluster {
  funding_wallet: string
  recipients: string[]
  children_count: number
  status: "active" | "forming"
  token_mints: string[]
  dominant_mint: string | null
  dominant_mint_buyers: number
  fan_out_slot: number
  buy_slots: number[]
  slot_jitter: SlotJitter
  common_patterns: CommonPatterns
  total_sol_funded: number
  total_sol_remaining: number
  spend_rate_sol_per_min: number
  time_remaining_sec: number | "N/A"
  confidence: number
  rug_risk: number
  created_at: number
  last_update: number
  cluster_age_sec: number
}

interface ApiMetadata {
  total_active: number
  total_tracked: number
  avg_confidence: number
  total_sol: number
  timestamp: string
  requirements: {
    min_children: number
    min_total_sol: number
    min_transfer_sol: number
    detection_window_sec: number
  }
}

interface ApiResponse {
  clusters: Cluster[]
  metadata: ApiMetadata
}

type SortKey = "confidence" | "rug_risk" | "total_sol_funded" | "total_sol_remaining" | "children_count" | "cluster_age_sec"

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = "https://dec-clust.onrender.com"

const DASH_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');

  :root {
    --dc-bg: #080a0f;
    --dc-surface: #0d1117;
    --dc-surface2: #141b24;
    --dc-border: rgba(0,255,170,0.1);
    --dc-border-bright: rgba(0,255,170,0.3);
    --dc-accent: #00ffaa;
    --dc-accent-dim: rgba(0,255,170,0.1);
    --dc-red: #ff3860;
    --dc-red-dim: rgba(255,56,96,0.1);
    --dc-orange: #ff8c42;
    --dc-yellow: #ffd060;
    --dc-text: #e8edf5;
    --dc-muted: #5a6a80;
    --dc-mono: 'Space Mono', monospace;
    --dc-display: 'Syne', sans-serif;
  }

  .dc-dash {
    min-height: 100vh;
    background: var(--dc-bg);
    padding: 24px;
    font-family: var(--dc-mono);
    color: var(--dc-text);
  }

  .dc-dash * { box-sizing: border-box; }

  .dc-container { max-width: 1600px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }

  /* Cards */
  .dc-card {
    background: var(--dc-surface);
    border: 1px solid var(--dc-border);
    border-radius: 12px;
    overflow: hidden;
  }

  .dc-card-pad { padding: 20px 24px; }

  /* Header */
  .dc-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .dc-header-left { display: flex; align-items: center; gap: 14px; }

  .dc-header-icon {
    width: 42px; height: 42px;
    border-radius: 10px;
    background: var(--dc-accent-dim);
    border: 1px solid var(--dc-border-bright);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .dc-h1 {
    font-family: var(--dc-display);
    font-size: 22px;
    font-weight: 800;
    color: var(--dc-text);
    letter-spacing: -0.01em;
  }

  .dc-sub { font-size: 11px; color: var(--dc-muted); margin-top: 2px; letter-spacing: 0.06em; }

  /* Badges */
  .dc-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  }

  .dc-badge-live { background: rgba(0,255,170,0.1); color: var(--dc-accent); border: 1px solid rgba(0,255,170,0.2); }
  .dc-badge-stream { background: rgba(0,255,170,0.08); color: var(--dc-accent); border: 1px solid rgba(0,255,170,0.15); }
  .dc-badge-offline { background: var(--dc-red-dim); color: var(--dc-red); border: 1px solid rgba(255,56,96,0.2); }
  .dc-badge-connecting { background: rgba(255,208,96,0.1); color: var(--dc-yellow); border: 1px solid rgba(255,208,96,0.2); }

  .dc-badge-dot {
    width: 5px; height: 5px; border-radius: 50%;
  }
  .dc-dot-live { background: var(--dc-accent); animation: dc-blink 2s infinite; }
  .dc-dot-offline { background: var(--dc-red); }
  .dc-dot-connecting { background: var(--dc-yellow); animation: dc-blink 1s infinite; }

  @keyframes dc-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* Stats grid */
  .dc-stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }

  .dc-stat {
    background: var(--dc-surface2);
    border: 1px solid var(--dc-border);
    border-radius: 8px;
    padding: 14px 16px;
    transition: border-color 0.2s;
  }
  .dc-stat:hover { border-color: var(--dc-border-bright); }

  .dc-stat-label {
    font-size: 9px; letter-spacing: 0.15em; color: var(--dc-muted);
    text-transform: uppercase; margin-bottom: 6px;
    display: flex; align-items: center; justify-content: space-between;
  }

  .dc-stat-value { font-size: 22px; font-weight: 700; }
  .dc-stat-value.accent { color: var(--dc-accent); }
  .dc-stat-value.green { color: #4ade80; }
  .dc-stat-value.yellow { color: var(--dc-yellow); }
  .dc-stat-value.red { color: var(--dc-red); }
  .dc-stat-value.orange { color: var(--dc-orange); }

  /* Controls */
  .dc-controls { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

  .dc-search-wrap { position: relative; flex: 1; min-width: 200px; }
  .dc-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--dc-muted); }

  .dc-input {
    background: var(--dc-surface2);
    border: 1px solid var(--dc-border);
    border-radius: 7px;
    color: var(--dc-text);
    font-family: var(--dc-mono);
    font-size: 12px;
    padding: 0 14px;
    height: 38px;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
  }
  .dc-input:focus { border-color: var(--dc-border-bright); }
  .dc-input::placeholder { color: var(--dc-muted); }

  .dc-search { padding-left: 36px; }

  select.dc-input { cursor: pointer; }
  select.dc-input option { background: var(--dc-surface); }

  .dc-btn {
    height: 38px;
    padding: 0 16px;
    border-radius: 7px;
    font-family: var(--dc-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    white-space: nowrap;
    border: none;
  }

  .dc-btn-outline {
    background: transparent;
    border: 1px solid var(--dc-border);
    color: var(--dc-muted);
  }
  .dc-btn-outline:hover { border-color: var(--dc-border-bright); color: var(--dc-text); }

  .dc-btn-go {
    background: var(--dc-accent);
    color: var(--dc-bg);
    border: none;
  }
  .dc-btn-go:hover { box-shadow: 0 0 20px rgba(0,255,170,0.4); }
  .dc-btn-go:disabled { background: var(--dc-surface2); color: var(--dc-muted); cursor: not-allowed; box-shadow: none; }

  .dc-btn-stop {
    background: transparent;
    border: 1px solid rgba(255,56,96,0.25);
    color: var(--dc-red);
  }
  .dc-btn-stop:hover:not(:disabled) { background: var(--dc-red-dim); border-color: rgba(255,56,96,0.5); }
  .dc-btn-stop:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Advanced filters panel */
  .dc-filters-panel {
    margin-top: 12px;
    padding: 16px;
    background: var(--dc-surface2);
    border: 1px solid var(--dc-border);
    border-radius: 8px;
  }

  .dc-filters-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px;
  }

  .dc-section-label {
    font-size: 10px; letter-spacing: 0.15em; color: var(--dc-accent);
    text-transform: uppercase;
    display: flex; align-items: center; gap: 8px;
  }
  .dc-section-label::before { content: ''; width: 16px; height: 1px; background: var(--dc-accent); }

  .dc-filters-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

  .dc-filter-label { font-size: 10px; color: var(--dc-muted); letter-spacing: 0.08em; margin-bottom: 5px; display: block; }

  /* Table */
  .dc-table-wrap { overflow-x: auto; }

  table.dc-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }

  .dc-table thead tr {
    background: linear-gradient(135deg, rgba(0,255,170,0.12), rgba(0,255,170,0.06));
    border-bottom: 1px solid var(--dc-border-bright);
  }

  .dc-table th {
    padding: 10px 14px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--dc-accent);
    white-space: nowrap;
    user-select: none;
  }

  .dc-table th.sortable { cursor: pointer; }
  .dc-table th.sortable:hover { color: #e8edf5; }

  .dc-table th .th-inner { display: flex; align-items: center; gap: 4px; }

  .dc-table tbody tr {
    border-bottom: 1px solid rgba(0,255,170,0.05);
    transition: background 0.15s;
  }
  .dc-table tbody tr:hover { background: rgba(0,255,170,0.03); }
  .dc-table tbody tr:last-child { border-bottom: none; }

  .dc-table td {
    padding: 10px 14px;
    white-space: nowrap;
    vertical-align: middle;
  }

  /* Table cell types */
  .dc-cell-mono { font-family: var(--dc-mono); font-size: 11px; color: var(--dc-text); }
  .dc-cell-muted { color: var(--dc-muted); font-size: 11px; }

  .dc-copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--dc-muted);
    padding: 2px;
    border-radius: 3px;
    display: inline-flex;
    transition: color 0.15s;
    vertical-align: middle;
    margin-left: 3px;
  }
  .dc-copy-btn:hover { color: var(--dc-accent); }

  .dc-pill {
    display: inline-flex;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    border: 1px solid transparent;
  }

  .dc-pill-active { background: rgba(74,222,128,0.1); color: #4ade80; border-color: rgba(74,222,128,0.25); }
  .dc-pill-forming { background: rgba(255,208,96,0.1); color: var(--dc-yellow); border-color: rgba(255,208,96,0.25); }
  .dc-pill-bot { background: var(--dc-red-dim); color: var(--dc-red); border-color: rgba(255,56,96,0.25); }
  .dc-pill-mix { background: rgba(255,208,96,0.1); color: var(--dc-yellow); border-color: rgba(255,208,96,0.25); }
  .dc-pill-human { background: rgba(74,222,128,0.08); color: #4ade80; border-color: rgba(74,222,128,0.2); }
  .dc-pill-unknown { background: rgba(90,106,128,0.2); color: var(--dc-muted); border-color: rgba(90,106,128,0.3); }
  .dc-pill-bundler { background: var(--dc-red-dim); color: var(--dc-red); border-color: rgba(255,56,96,0.25); }
  .dc-pill-count { background: var(--dc-surface2); color: var(--dc-text); border-color: var(--dc-border); }

  /* Score bar */
  .dc-score-bar-wrap { width: 72px; }
  .dc-score-bar-track { height: 3px; background: var(--dc-surface2); border-radius: 2px; overflow: hidden; margin-top: 3px; }
  .dc-score-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }

  .dc-score-high { color: var(--dc-red); }
  .dc-score-med { color: var(--dc-orange); }
  .dc-score-low { color: var(--dc-yellow); }
  .dc-score-ok { color: #4ade80; }

  .dc-bar-high { background: var(--dc-red); }
  .dc-bar-med { background: var(--dc-orange); }
  .dc-bar-low { background: var(--dc-yellow); }

  .dc-sol-green { color: #4ade80; }
  .dc-sol-yellow { color: var(--dc-yellow); }
  .dc-sol-red { color: var(--dc-red); }

  /* Details btn */
  .dc-detail-btn {
    padding: 5px 12px;
    background: var(--dc-accent-dim);
    color: var(--dc-accent);
    border: 1px solid var(--dc-border-bright);
    border-radius: 6px;
    font-family: var(--dc-mono);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .dc-detail-btn:hover { background: rgba(0,255,170,0.2); box-shadow: 0 0 12px rgba(0,255,170,0.2); }

  /* Empty state */
  .dc-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 24px; gap: 12px; color: var(--dc-muted);
  }

  /* Error */
  .dc-error {
    margin-top: 12px;
    padding: 10px 14px;
    background: var(--dc-red-dim);
    border: 1px solid rgba(255,56,96,0.2);
    border-radius: 7px;
    font-size: 12px;
    color: var(--dc-red);
  }

  /* Timestamp */
  .dc-timestamp { font-size: 10px; color: var(--dc-muted); margin-top: 8px; letter-spacing: 0.06em; }

  /* Modal */
  .dc-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
  }

  .dc-modal {
    background: var(--dc-surface);
    border: 1px solid var(--dc-border-bright);
    border-radius: 14px;
    max-width: 720px; width: calc(100% - 32px);
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 0 80px rgba(0,255,170,0.06), 0 40px 80px rgba(0,0,0,0.7);
  }

  .dc-modal-head {
    position: sticky; top: 0;
    background: var(--dc-surface);
    border-bottom: 1px solid var(--dc-border);
    padding: 18px 24px;
    display: flex; align-items: center; justify-content: space-between;
  }

  .dc-modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }

  .dc-modal-section {
    background: var(--dc-surface2);
    border: 1px solid var(--dc-border);
    border-radius: 8px;
    padding: 16px;
  }

  .dc-modal-section-title {
    font-size: 10px; color: var(--dc-accent); letter-spacing: 0.15em;
    text-transform: uppercase; margin-bottom: 12px;
    display: flex; align-items: center; gap: 6px;
  }
  .dc-modal-section-title::before { content: '//'; opacity: 0.5; }

  .dc-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid rgba(0,255,170,0.05); }
  .dc-row:last-child { border-bottom: none; }
  .dc-row-label { font-size: 11px; color: var(--dc-muted); }
  .dc-row-value { font-size: 12px; font-weight: 700; color: var(--dc-text); font-family: var(--dc-mono); }

  .dc-risk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .dc-risk-box {
    border-radius: 8px;
    padding: 16px;
    border: 1px solid transparent;
  }

  .dc-risk-box-label { font-size: 11px; color: var(--dc-muted); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
  .dc-risk-box-score { font-family: var(--dc-display); font-size: 36px; font-weight: 800; margin-bottom: 6px; }
  .dc-risk-box-score sup { font-size: 14px; opacity: 0.6; }
  .dc-risk-box-desc { font-size: 10px; color: var(--dc-muted); margin-top: 8px; }

  .dc-progress-wrap { width: 100%; background: rgba(255,255,255,0.06); border-radius: 3px; height: 4px; overflow: hidden; }
  .dc-progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }

  .dc-big-score-bar { height: 4px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-top: 4px; }
  .dc-big-score-fill { height: 100%; border-radius: 3px; }

  /* Close btn */
  .dc-close {
    background: none; border: none; cursor: pointer;
    color: var(--dc-muted); padding: 4px; border-radius: 4px;
    transition: color 0.15s; display: flex;
  }
  .dc-close:hover { color: var(--dc-text); }

  /* Mini bar */
  .dc-mini-bars { display: flex; gap: 2px; align-items: flex-end; }
  .dc-mini-bar { width: 6px; height: 10px; border-radius: 1px; }

  /* Toast */
  .dc-toast {
    position: fixed; bottom: 24px; right: 24px;
    background: var(--dc-surface);
    border: 1px solid var(--dc-border-bright);
    color: var(--dc-accent);
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 12px;
    box-shadow: 0 0 20px rgba(0,255,170,0.15), 0 8px 32px rgba(0,0,0,0.5);
    z-index: 999;
    letter-spacing: 0.05em;
    animation: dc-toast-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes dc-toast-in {
    from { transform: translateY(12px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* Loading */
  .dc-loading {
    display: flex; align-items: center; justify-content: center;
    gap: 10px; padding: 80px; color: var(--dc-muted); font-size: 13px;
  }

  @media (max-width: 1024px) {
    .dc-stats-grid { grid-template-columns: repeat(3, 1fr); }
    .dc-filters-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 640px) {
    .dc-stats-grid { grid-template-columns: 1fr 1fr; }
    .dc-filters-grid { grid-template-columns: 1fr; }
    .dc-dash { padding: 12px; }
  }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shortenAddr(addr: string, chars = 4) {
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`
}

function formatTimeRemaining(sec: number | "N/A"): string {
  if (sec === "N/A" || sec === null || sec === undefined) return "N/A"
  if (typeof sec !== "number") return "N/A"
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${s}s`
}

function getConfidenceClass(score: number) {
  if (score >= 75) return "dc-score-high"
  if (score >= 50) return "dc-score-med"
  if (score >= 25) return "dc-score-low"
  return "dc-score-ok"
}

function getBarClass(score: number) {
  if (score >= 75) return "dc-bar-high"
  if (score >= 50) return "dc-bar-med"
  return "dc-bar-low"
}

function getSolClass(sol: number) {
  if (sol < 1) return "dc-sol-red"
  if (sol < 5) return "dc-sol-yellow"
  return "dc-sol-green"
}

function getJitter(jitter: SlotJitter): { cls: string; label: string } {
  const map: Record<string, { cls: string; label: string }> = {
    low:               { cls: "dc-pill dc-pill-bot",    label: "BOT" },
    medium:            { cls: "dc-pill dc-pill-mix",    label: "MIX" },
    high:              { cls: "dc-pill dc-pill-human",  label: "HUMAN" },
    insufficient_data: { cls: "dc-pill dc-pill-unknown", label: "???" },
  }
  return map[jitter.label] ?? map.insufficient_data
}

// ─── ScoreCell ────────────────────────────────────────────────────────────────

function ScoreCell({ value }: { value: number }) {
  const textCls = getConfidenceClass(value)
  const barCls = getBarClass(value)
  return (
    <div className="dc-score-bar-wrap">
      <span className={`${textCls}`} style={{ fontSize: 12, fontWeight: 700 }}>{value}</span>
      <span style={{ fontSize: 10, color: "var(--dc-muted)" }}>/100</span>
      <div className="dc-score-bar-track">
        <div className={`dc-score-bar-fill ${barCls}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

// ─── ClusterDetail Modal ──────────────────────────────────────────────────────

function ClusterDetail({ cluster, onClose }: { cluster: Cluster; onClose: () => void }) {
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const copy = (text: string, label = "Address") => {
    navigator.clipboard.writeText(text)
      .then(() => showToast(`${label} copied!`))
      .catch(() => showToast("Copy failed"))
  }

  const funded    = cluster.total_sol_funded
  const remaining = cluster.total_sol_remaining
  const spent     = Math.max(0, funded - remaining)
  const pct       = funded > 0 ? Math.min(100, (spent / funded) * 100) : 0
  const jitter    = getJitter(cluster.slot_jitter)
  const confCls   = getConfidenceClass(cluster.confidence)
  const rugCls    = getConfidenceClass(cluster.rug_risk)

  const confBoxStyle = {
    background: cluster.confidence >= 75 ? "rgba(255,56,96,0.08)" : cluster.confidence >= 50 ? "rgba(255,140,66,0.08)" : "rgba(255,208,96,0.08)",
    borderColor: cluster.confidence >= 75 ? "rgba(255,56,96,0.25)" : cluster.confidence >= 50 ? "rgba(255,140,66,0.25)" : "rgba(255,208,96,0.25)",
  }

  const rugBoxStyle = {
    background: cluster.rug_risk >= 70 ? "rgba(255,56,96,0.08)" : "rgba(255,140,66,0.06)",
    borderColor: cluster.rug_risk >= 70 ? "rgba(255,56,96,0.25)" : "rgba(255,140,66,0.2)",
  }

  return (
    <>
      <div className="dc-overlay" onClick={onClose}>
        <div className="dc-modal" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="dc-modal-head">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "var(--dc-display)", fontSize: 18, fontWeight: 800 }}>// CLUSTER DETAILS</span>
              <span className={`dc-pill ${cluster.status === "active" ? "dc-pill-active" : "dc-pill-forming"}`}>
                {cluster.status.toUpperCase()}
              </span>
            </div>
            <button className="dc-close" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="dc-modal-body">
            {/* Funding wallet */}
            <div className="dc-modal-section">
              <div className="dc-modal-section-title">Funding Wallet</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontFamily: "var(--dc-mono)", fontSize: 12, color: "var(--dc-text)", wordBreak: "break-all" }}>
                  {cluster.funding_wallet}
                </span>
                <button onClick={() => copy(cluster.funding_wallet, "Wallet")} className="dc-detail-btn" style={{ flexShrink: 0 }}>
                  COPY
                </button>
              </div>
            </div>

            {/* Risk scores */}
            <div className="dc-risk-grid">
              <div className="dc-risk-box" style={confBoxStyle}>
                <div className="dc-risk-box-label"><Zap size={13} /> Bundle Confidence</div>
                <div className={`dc-risk-box-score ${confCls}`}>
                  {cluster.confidence}<sup>/100</sup>
                </div>
                <div className="dc-big-score-bar">
                  <div className={`dc-big-score-fill ${getBarClass(cluster.confidence)}`} style={{ width: `${cluster.confidence}%` }} />
                </div>
                <div className="dc-risk-box-desc">
                  {cluster.confidence >= 75 ? "Almost certainly coordinated" :
                   cluster.confidence >= 50 ? "Likely coordinated bundle" :
                   cluster.confidence >= 25 ? "Possibly coordinated" : "Low coordination signal"}
                </div>
              </div>

              <div className="dc-risk-box" style={rugBoxStyle}>
                <div className="dc-risk-box-label"><AlertTriangle size={13} /> Rug Risk</div>
                <div className={`dc-risk-box-score ${rugCls}`}>
                  {cluster.rug_risk}<sup>/100</sup>
                </div>
                <div className="dc-big-score-bar">
                  <div className={`dc-big-score-fill ${getBarClass(cluster.rug_risk)}`} style={{ width: `${cluster.rug_risk}%` }} />
                </div>
                <div className="dc-risk-box-desc">
                  {cluster.rug_risk >= 70 ? "High dump risk — be careful" :
                   cluster.rug_risk >= 40 ? "Moderate dump probability" : "Lower exit risk"}
                </div>
              </div>
            </div>

            {/* Funding overview */}
            <div className="dc-modal-section">
              <div className="dc-modal-section-title">Funding Overview</div>
              {[
                { label: "Total Funded", value: `${funded.toFixed(3)} SOL` },
                { label: "Spent", value: `${spent.toFixed(3)} SOL` },
                { label: "Remaining", value: `${remaining.toFixed(3)} SOL`, cls: getSolClass(remaining) },
                { label: "Spend Rate", value: `${cluster.spend_rate_sol_per_min.toFixed(4)} SOL/min` },
                { label: "Est. Time Left", value: formatTimeRemaining(cluster.time_remaining_sec) },
              ].map((r, i) => (
                <div key={i} className="dc-row">
                  <span className="dc-row-label">{r.label}</span>
                  <span className={`dc-row-value ${r.cls ?? ""}`}>{r.value}</span>
                </div>
              ))}
              <div style={{ marginTop: 10 }}>
                <div className="dc-progress-wrap">
                  <div className="dc-progress-fill" style={{ width: `${pct}%`, background: "var(--dc-accent)" }} />
                </div>
                <div style={{ fontSize: 10, color: "var(--dc-muted)", marginTop: 4 }}>{Math.round(pct)}% spent</div>
              </div>
            </div>

            {/* Behavioral fingerprint */}
            <div className="dc-modal-section">
              <div className="dc-modal-section-title">Behavioral Fingerprint</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--dc-muted)", marginBottom: 4 }}>Avg Transfer</div>
                  <div style={{ fontSize: 12, fontFamily: "var(--dc-mono)" }}>{cluster.common_patterns.avg_transfer}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--dc-muted)", marginBottom: 4 }}>Transfer Uniformity</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="dc-progress-wrap" style={{ flex: 1 }}>
                      <div className="dc-progress-fill" style={{ width: `${cluster.common_patterns.transfer_uniformity * 100}%`, background: "var(--dc-accent)" }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{(cluster.common_patterns.transfer_uniformity * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--dc-muted)", marginBottom: 4 }}>Slot Jitter</div>
                  <span className={jitter.cls}>
                    {jitter.label} {cluster.slot_jitter.label !== "insufficient_data" && `σ${cluster.slot_jitter.stdDevSlots}`}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--dc-muted)", marginBottom: 4 }}>Velocity Score</div>
                  <div className="dc-mini-bars">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="dc-mini-bar" style={{
                        background: i < cluster.common_patterns.velocity_score ? "var(--dc-accent)" : "var(--dc-surface2)"
                      }} />
                    ))}
                    <span style={{ fontSize: 10, color: "var(--dc-muted)", marginLeft: 4 }}>{cluster.common_patterns.velocity_score}/10</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--dc-muted)", marginBottom: 4 }}>DEX Programs</div>
                  <div style={{ fontSize: 11 }}>{cluster.common_patterns.dex_programs.join(", ") || "Pending"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--dc-muted)", marginBottom: 4 }}>Flags</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {cluster.common_patterns.seen_bundler_program && <span className="dc-pill dc-pill-bundler">BUNDLER</span>}
                    {cluster.common_patterns.grandchild_count > 0 && (
                      <span className="dc-pill dc-pill-mix">+{cluster.common_patterns.grandchild_count} GRANDCHILDREN</span>
                    )}
                    {!cluster.common_patterns.seen_bundler_program && cluster.common_patterns.grandchild_count === 0 && (
                      <span style={{ fontSize: 11, color: "var(--dc-muted)" }}>None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Token intel */}
            <div className="dc-modal-section">
              <div className="dc-modal-section-title">Token Intel</div>
              {cluster.dominant_mint ? (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", background: "rgba(0,255,170,0.05)",
                  border: "1px solid rgba(0,255,170,0.15)", borderRadius: 6, marginBottom: 8
                }}>
                  <div>
                    <div style={{ fontSize: 9, color: "var(--dc-muted)", letterSpacing: "0.1em", marginBottom: 3 }}>
                      DOMINANT MINT ({cluster.dominant_mint_buyers} buyers)
                    </div>
                    <div style={{ fontFamily: "var(--dc-mono)", fontSize: 12 }}>{shortenAddr(cluster.dominant_mint, 6)}</div>
                  </div>
                  <button onClick={() => copy(cluster.dominant_mint!, "Mint")} className="dc-detail-btn">COPY</button>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--dc-muted)" }}>No token purchased yet</div>
              )}
              {cluster.token_mints.filter(m => m !== "Pending").map((mint, i) => (
                <div key={i} className="dc-row">
                  <span style={{ fontFamily: "var(--dc-mono)", fontSize: 11 }}>{shortenAddr(mint, 6)}</span>
                  <button onClick={() => copy(mint, "Mint")} className="dc-copy-btn"><Copy size={12} /></button>
                </div>
              ))}
            </div>

            {/* Child wallets */}
            <div className="dc-modal-section">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div className="dc-modal-section-title" style={{ marginBottom: 0 }}>
                  Child Wallets ({cluster.recipients.length})
                </div>
                <button onClick={() => setWalletDialogOpen(true)} className="dc-detail-btn">VIEW ALL</button>
              </div>
              {cluster.recipients.slice(0, 4).map((addr, i) => (
                <div key={i} className="dc-row">
                  <span style={{ fontFamily: "var(--dc-mono)", fontSize: 11 }}>{shortenAddr(addr, 6)}</span>
                  <button onClick={() => copy(addr)} className="dc-copy-btn"><Copy size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* All wallets dialog */}
      {walletDialogOpen && (
        <div className="dc-overlay" style={{ zIndex: 110 }} onClick={() => setWalletDialogOpen(false)}>
          <div className="dc-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="dc-modal-head">
              <span style={{ fontFamily: "var(--dc-display)", fontSize: 16, fontWeight: 800 }}>
                // ALL WALLETS ({cluster.recipients.length})
              </span>
              <button className="dc-close" onClick={() => setWalletDialogOpen(false)}><X size={18} /></button>
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
              {cluster.recipients.map((addr, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", borderRadius: 6, background: "var(--dc-surface2)",
                  border: "1px solid var(--dc-border)"
                }}>
                  <span style={{ fontFamily: "var(--dc-mono)", fontSize: 11, color: "var(--dc-text)" }}>{addr}</span>
                  <button onClick={() => copy(addr)} className="dc-copy-btn" style={{ marginLeft: 8, flexShrink: 0 }}>
                    <Copy size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && <div className="dc-toast">{toast}</div>}
    </>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function ClusterDashboard() {
  const [data, setData]                           = useState<ApiResponse | null>(null)
  const [loading, setLoading]                     = useState(true)
  const [error, setError]                         = useState<string | null>(null)
  const [searchTerm, setSearchTerm]               = useState("")
  const [statusFilter, setStatusFilter]           = useState<"all" | "active" | "forming">("all")
  const [isStreaming, setIsStreaming]              = useState(false)
  const [lastUpdate, setLastUpdate]               = useState<Date | null>(null)
  const [connStatus, setConnStatus]               = useState<"connected" | "disconnected" | "connecting">("disconnected")
  const [sortBy, setSortBy]                       = useState<SortKey>("confidence")
  const [sortOrder, setSortOrder]                 = useState<"asc" | "desc">("desc")
  const [minSolFilter, setMinSolFilter]           = useState("")
  const [minChildrenFilter, setMinChildrenFilter] = useState("")
  const [selectedCluster, setSelectedCluster]     = useState<Cluster | null>(null)
  const [showFilters, setShowFilters]             = useState(false)
  const [toast, setToast]                         = useState<string | null>(null)

  const esRef = useRef<EventSource | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => showToast("Copied!"))
      .catch(() => showToast("Copy failed"))
  }

  const startStream = () => {
    if (esRef.current) return
    setConnStatus("connecting")
    const es = new EventSource(`${API_BASE}/clusters/stream`)
    esRef.current = es
    es.onopen = () => { setIsStreaming(true); setConnStatus("connected"); setError(null); showToast("// Live stream connected") }
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data)
        if (payload.type === "snapshot" || payload.type === "update") {
          setData({ clusters: payload.clusters, metadata: payload.stats })
          setLastUpdate(new Date()); setLoading(false); setConnStatus("connected")
        }
      } catch (err) { console.error("SSE parse error:", err) }
    }
    es.onerror = () => { setConnStatus("disconnected"); setError("Stream connection lost — retrying...") }
  }

  const stopStream = async () => {
    if (esRef.current) { esRef.current.close(); esRef.current = null }
    setIsStreaming(false); setConnStatus("disconnected")
    try { await fetch(`${API_BASE}/stop-polling`, { method: "POST" }); showToast("// Monitoring paused") } catch {}
  }

  useEffect(() => {
    return () => { if (esRef.current) { esRef.current.close(); esRef.current = null } }
  }, [])

  useEffect(() => {
    fetch(`${API_BASE}/clusters`)
      .then(r => r.json())
      .then((json: ApiResponse) => { setData(json); setLoading(false); setLastUpdate(new Date()) })
      .catch(() => { setLoading(false); setError("Failed to connect to API") })
  }, [])

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortOrder(o => o === "desc" ? "asc" : "desc")
    else { setSortBy(key); setSortOrder("desc") }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortBy !== col) return <ChevronUp size={11} style={{ opacity: 0.3 }} />
    return sortOrder === "desc" ? <ChevronDown size={11} /> : <ChevronUp size={11} />
  }

  const filtered = (data?.clusters ?? [])
    .filter(c => {
      const matchSearch   = c.funding_wallet.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus   = statusFilter === "all" || c.status === statusFilter
      const matchSol      = !minSolFilter || c.total_sol_remaining >= parseFloat(minSolFilter)
      const matchChildren = !minChildrenFilter || c.children_count >= parseInt(minChildrenFilter)
      return matchSearch && matchStatus && matchSol && matchChildren
    })
    .sort((a, b) => {
      const av = a[sortBy] as number
      const bv = b[sortBy] as number
      return sortOrder === "desc" ? bv - av : av - bv
    })

  const stats = {
    active:      filtered.filter(c => c.status === "active").length,
    forming:     filtered.filter(c => c.status === "forming").length,
    totalFunded: filtered.reduce((s, c) => s + c.total_sol_funded, 0),
    totalRemain: filtered.reduce((s, c) => s + c.total_sol_remaining, 0),
    avgConf:     filtered.length > 0 ? filtered.reduce((s, c) => s + c.confidence, 0) / filtered.length : 0,
  }

  const exportCSV = () => {
    if (!filtered.length) { showToast("No data to export"); return }
    const headers = ["Funding Wallet","Children","Total SOL","Remaining SOL","Spend Rate SOL/min","Time Left (sec)","Confidence","Rug Risk","Status","Age (sec)","Dominant Mint","DEX Programs","Jitter"]
    const rows = filtered.map(c => [
      c.funding_wallet, c.children_count, c.total_sol_funded.toFixed(4), c.total_sol_remaining.toFixed(4),
      c.spend_rate_sol_per_min.toFixed(4), c.time_remaining_sec, c.confidence, c.rug_risk, c.status,
      c.cluster_age_sec, c.dominant_mint ?? "", `"${c.common_patterns.dex_programs.join(", ")}"`, c.slot_jitter.label,
    ].join(","))
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `clusters-${new Date().toISOString().split("T")[0]}.csv`; a.click()
    URL.revokeObjectURL(url); showToast("// Exported to CSV")
  }

  const clearFilters = () => {
    setSearchTerm(""); setStatusFilter("all"); setMinSolFilter(""); setMinChildrenFilter("")
    setSortBy("confidence"); setSortOrder("desc")
  }

  const connBadgeCls = connStatus === "connected" ? "dc-badge dc-badge-live" : connStatus === "connecting" ? "dc-badge dc-badge-connecting" : "dc-badge dc-badge-offline"
  const connDotCls = connStatus === "connected" ? "dc-badge-dot dc-dot-live" : connStatus === "connecting" ? "dc-badge-dot dc-dot-connecting" : "dc-badge-dot dc-dot-offline"
  const connLabel = connStatus === "connected" ? "LIVE" : connStatus === "connecting" ? "CONNECTING..." : "OFFLINE"

  const cols: { key: SortKey | null; label: string }[] = [
    { key: null, label: "WALLET" },
    { key: "children_count", label: "CHILDREN" },
    { key: "total_sol_funded", label: "FUNDED" },
    { key: "total_sol_remaining", label: "REMAINING" },
    { key: null, label: "SPEND/MIN" },
    { key: null, label: "TIME LEFT" },
    { key: "confidence", label: "CONFIDENCE" },
    { key: "rug_risk", label: "RUG RISK" },
    { key: null, label: "JITTER" },
    { key: null, label: "DEX" },
    { key: null, label: "MINT" },
    { key: null, label: "STATUS" },
    { key: "cluster_age_sec", label: "AGE" },
    { key: null, label: "" },
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DASH_STYLES }} />

      <div className="dc-dash">
        {selectedCluster && <ClusterDetail cluster={selectedCluster} onClose={() => setSelectedCluster(null)} />}

        <div className="dc-container">

          {/* ── Header ── */}
          <div className="dc-card dc-card-pad">
            <div className="dc-header-row">
              <div className="dc-header-left">
                <div className="dc-header-icon">
                  <Database size={18} color="var(--dc-accent)" />
                </div>
                <div>
                  <div className="dc-h1">Solana Cluster Monitor</div>
                  <div className="dc-sub">// REAL-TIME COORDINATED WALLET BUNDLE DETECTION</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className={connBadgeCls}>
                  <span className={connDotCls} />
                  {connLabel}
                </span>
                {isStreaming && (
                  <span className="dc-badge dc-badge-stream">
                    <RefreshCw size={10} style={{ animation: "spin 1s linear infinite" }} />
                    SSE ACTIVE
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="dc-stats-grid">
              {[
                { icon: Activity,   label: "ACTIVE",         value: stats.active,                         badge: <span className="dc-pill dc-pill-active">ACTIVE</span>,   valueCls: "green" },
                { icon: Shield,     label: "FORMING",        value: stats.forming,                        badge: <span className="dc-pill dc-pill-forming">FORMING</span>, valueCls: "yellow" },
                { icon: TrendingUp, label: "TOTAL FUNDED",   value: `${stats.totalFunded.toFixed(1)}`,    badge: <span style={{ fontSize: 9, color: "var(--dc-muted)" }}>SOL</span>, valueCls: "" },
                { icon: Wallet,     label: "REMAINING",      value: `${stats.totalRemain.toFixed(1)}`,    badge: <span style={{ fontSize: 9, color: "var(--dc-muted)" }}>SOL</span>, valueCls: getSolClass(stats.totalRemain) },
                { icon: Zap,        label: "AVG CONFIDENCE", value: `${stats.avgConf.toFixed(0)}/100`,    badge: null, valueCls: getConfidenceClass(stats.avgConf) },
              ].map((s, i) => (
                <div key={i} className="dc-stat">
                  <div className="dc-stat-label">
                    <span>{s.label}</span>
                    {s.badge}
                  </div>
                  <div className={`dc-stat-value ${s.valueCls}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {error && <div className="dc-error">⚠ {error}</div>}
            {lastUpdate && (
              <div className="dc-timestamp">LAST UPDATE: {lastUpdate.toLocaleTimeString()}</div>
            )}
          </div>

          {/* ── Controls ── */}
          <div className="dc-card dc-card-pad">
            <div className="dc-controls">
              <div className="dc-search-wrap">
                <span className="dc-search-icon"><Search size={14} /></span>
                <input className="dc-input dc-search" type="text" placeholder="Search funding wallet..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>

              <select className="dc-input" style={{ width: "auto" }}
                value={statusFilter} onChange={e => setStatusFilter(e.target.value as "all" | "active" | "forming")}>
                <option value="all">ALL STATUS</option>
                <option value="active">ACTIVE</option>
                <option value="forming">FORMING</option>
              </select>

              <button className={`dc-btn dc-btn-outline ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(!showFilters)}>
                <Filter size={13} /> FILTERS
              </button>
              <button className="dc-btn dc-btn-outline" onClick={exportCSV}>
                <Download size={13} /> CSV
              </button>
              <button className="dc-btn dc-btn-go" onClick={startStream} disabled={isStreaming}>
                <RefreshCw size={13} /> LIVE
              </button>
              <button className="dc-btn dc-btn-stop" onClick={stopStream} disabled={!isStreaming}>
                STOP
              </button>
            </div>

            {showFilters && (
              <div className="dc-filters-panel">
                <div className="dc-filters-header">
                  <span className="dc-section-label">Advanced Filters</span>
                  <button className="dc-btn dc-btn-outline" style={{ height: 28, fontSize: 10, padding: "0 10px" }} onClick={clearFilters}>
                    <X size={11} /> CLEAR
                  </button>
                </div>
                <div className="dc-filters-grid">
                  <div>
                    <label className="dc-filter-label">MIN SOL REMAINING</label>
                    <input type="number" placeholder="0.0" className="dc-input" value={minSolFilter} onChange={e => setMinSolFilter(e.target.value)} />
                  </div>
                  <div>
                    <label className="dc-filter-label">MIN CHILDREN</label>
                    <input type="number" placeholder="0" className="dc-input" value={minChildrenFilter} onChange={e => setMinChildrenFilter(e.target.value)} />
                  </div>
                  <div>
                    <label className="dc-filter-label">SORT BY</label>
                    <select className="dc-input" value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}>
                      <option value="confidence">Confidence</option>
                      <option value="rug_risk">Rug Risk</option>
                      <option value="total_sol_funded">Total Funded</option>
                      <option value="total_sol_remaining">SOL Remaining</option>
                      <option value="children_count">Children Count</option>
                      <option value="cluster_age_sec">Age</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Table ── */}
          <div className="dc-card">
            {loading ? (
              <div className="dc-loading">
                <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
                // Loading clusters...
              </div>
            ) : (
              <div className="dc-table-wrap">
                <table className="dc-table">
                  <thead>
                    <tr>
                      {cols.map((col, i) => (
                        <th key={i} className={col.key ? "sortable" : ""} onClick={() => col.key && toggleSort(col.key)}>
                          <div className="th-inner">
                            {col.label}
                            {col.key && <SortIcon col={col.key} />}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={14}>
                          <div className="dc-empty">
                            <Database size={36} style={{ opacity: 0.3 }} />
                            <span>// No clusters match your filters</span>
                            <button className="dc-btn dc-btn-outline" onClick={clearFilters} style={{ fontSize: 11 }}>CLEAR FILTERS</button>
                          </div>
                        </td>
                      </tr>
                    ) : filtered.map((cluster, idx) => {
                      const jitter = getJitter(cluster.slot_jitter)
                      return (
                        <tr key={idx}>
                          {/* Wallet */}
                          <td>
                            <span className="dc-cell-mono">{shortenAddr(cluster.funding_wallet)}</span>
                            <button className="dc-copy-btn" onClick={() => copy(cluster.funding_wallet)}><Copy size={11} /></button>
                          </td>

                          {/* Children */}
                          <td>
                            <span className="dc-pill dc-pill-count">{cluster.children_count}</span>
                          </td>

                          {/* Funded */}
                          <td>
                            <span className="dc-cell-mono">{cluster.total_sol_funded.toFixed(2)} SOL</span>
                          </td>

                          {/* Remaining */}
                          <td>
                            <span className={`dc-cell-mono ${getSolClass(cluster.total_sol_remaining)}`}>
                              {cluster.total_sol_remaining.toFixed(2)} SOL
                            </span>
                          </td>

                          {/* Spend */}
                          <td className="dc-cell-muted">{cluster.spend_rate_sol_per_min.toFixed(3)}/min</td>

                          {/* Time left */}
                          <td className="dc-cell-mono">{formatTimeRemaining(cluster.time_remaining_sec)}</td>

                          {/* Confidence */}
                          <td><ScoreCell value={cluster.confidence} /></td>

                          {/* Rug risk */}
                          <td><ScoreCell value={cluster.rug_risk} /></td>

                          {/* Jitter */}
                          <td><span className={jitter.cls}>{jitter.label}</span></td>

                          {/* DEX */}
                          <td className="dc-cell-muted" style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {cluster.common_patterns.dex_programs[0] ?? "—"}
                          </td>

                          {/* Dominant mint */}
                          <td>
                            {cluster.dominant_mint ? (
                              <span>
                                <span className="dc-cell-mono">{shortenAddr(cluster.dominant_mint, 4)}</span>
                                <button className="dc-copy-btn" onClick={() => copy(cluster.dominant_mint!)}><Copy size={11} /></button>
                              </span>
                            ) : (
                              <span className="dc-cell-muted">pending</span>
                            )}
                          </td>

                          {/* Status */}
                          <td>
                            <span className={`dc-pill ${cluster.status === "active" ? "dc-pill-active" : "dc-pill-forming"}`}>
                              {cluster.status.toUpperCase()}
                            </span>
                          </td>

                          {/* Age */}
                          <td className="dc-cell-mono">
                            {Math.floor(cluster.cluster_age_sec / 60)}m {cluster.cluster_age_sec % 60}s
                          </td>

                          {/* Actions */}
                          <td>
                            <button className="dc-detail-btn" onClick={() => setSelectedCluster(cluster)}>
                              DETAILS
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {toast && <div className="dc-toast">{toast}</div>}
      </div>
    </>
  )
}
