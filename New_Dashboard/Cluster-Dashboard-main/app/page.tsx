"use client"

import { useState, useEffect, useRef } from "react"
import type { FC, ReactNode, MouseEvent } from "react"
import {
  Activity,
  CheckCircle,
  ArrowRight,
  Menu,
  X as XIcon,
  TrendingUp,
  Shield,
  Zap,
  Crosshair,
  AlertTriangle,
  Eye,
  BarChart2,
} from "lucide-react"

// Inject global styles
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080a0f;
    --surface: #0d1117;
    --surface2: #141b24;
    --border: rgba(0,255,170,0.12);
    --border-bright: rgba(0,255,170,0.35);
    --accent: #00ffaa;
    --accent-dim: rgba(0,255,170,0.15);
    --accent-glow: 0 0 20px rgba(0,255,170,0.4), 0 0 60px rgba(0,255,170,0.15);
    --red: #ff3860;
    --red-dim: rgba(255,56,96,0.15);
    --yellow: #ffd060;
    --text: #e8edf5;
    --muted: #5a6a80;
    --font-display: 'Syne', sans-serif;
    --font-mono: 'Space Mono', monospace;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-mono);
    overflow-x: hidden;
  }

  ::selection { background: var(--accent); color: var(--bg); }

  /* Scanline overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.03) 2px,
      rgba(0,0,0,0.03) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  /* Noise texture */
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9998;
  }

  .font-display { font-family: var(--font-display); }

  /* Animated glow border */
  @keyframes border-flow {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,170,0.7); opacity: 1; }
    70% { box-shadow: 0 0 0 8px rgba(0,255,170,0); opacity: 0.8; }
  }

  @keyframes flicker {
    0%, 100% { opacity: 1; }
    92% { opacity: 1; }
    93% { opacity: 0.6; }
    94% { opacity: 1; }
    96% { opacity: 0.8; }
    97% { opacity: 1; }
  }

  @keyframes scan {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  @keyframes float-up {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes count-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes grid-pan {
    0% { transform: translateY(0); }
    100% { transform: translateY(60px); }
  }

  .animate-float { animation: float-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  .delay-4 { animation-delay: 0.4s; }
  .delay-5 { animation-delay: 0.5s; }
  .delay-6 { animation-delay: 0.6s; }

  /* Glitch text effect */
  @keyframes glitch-1 {
    0%, 100% { clip-path: inset(0 0 100% 0); transform: translate(0); }
    20% { clip-path: inset(30% 0 50% 0); transform: translate(-4px, 2px); }
    40% { clip-path: inset(60% 0 20% 0); transform: translate(4px, -2px); }
    60% { clip-path: inset(80% 0 5% 0); transform: translate(-2px, 1px); }
    80% { clip-path: inset(10% 0 80% 0); transform: translate(2px, -1px); }
  }

  .glitch-wrap { position: relative; display: inline-block; }
  .glitch-wrap::before, .glitch-wrap::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    font-family: var(--font-display);
    font-weight: 800;
  }
  .glitch-wrap::before {
    color: var(--red);
    animation: glitch-1 4s infinite linear;
    opacity: 0.7;
  }
  .glitch-wrap::after {
    color: var(--accent);
    animation: glitch-1 4s infinite linear reverse;
    animation-delay: 0.15s;
    opacity: 0.7;
  }

  /* Card hover */
  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px;
    transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    cursor: default;
  }
  .feature-card:hover {
    border-color: var(--border-bright);
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 20px rgba(0,255,170,0.08);
  }

  /* Terminal block */
  .terminal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }
  .terminal-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    background: rgba(0,0,0,0.3);
  }
  .terminal-dot { width: 10px; height: 10px; border-radius: 50%; }

  /* Stat card */
  .stat-card {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    transition: border-color 0.3s;
  }
  .stat-card:hover { border-color: var(--border-bright); }

  /* CTA button */
  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 32px;
    background: var(--accent);
    color: var(--bg);
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 15px;
    border-radius: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s, transform 0.2s;
    letter-spacing: 0.05em;
    animation: flicker 6s infinite;
  }
  .cta-btn:hover {
    box-shadow: var(--accent-glow);
    transform: translateY(-2px);
  }

  .outline-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    background: transparent;
    color: var(--accent);
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 14px;
    border: 1px solid var(--border-bright);
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.3s, box-shadow 0.3s;
    letter-spacing: 0.05em;
  }
  .outline-btn:hover {
    background: var(--accent-dim);
    box-shadow: 0 0 20px rgba(0,255,170,0.15);
  }

  .nav-btn {
    padding: 9px 22px;
    background: var(--accent);
    color: var(--bg);
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 13px;
    border-radius: 6px;
    text-decoration: none;
    letter-spacing: 0.06em;
    transition: box-shadow 0.3s;
  }
  .nav-btn:hover { box-shadow: var(--accent-glow); }

  /* Typewriter cursor */
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  .cursor { display: inline-block; width: 2px; height: 1em; background: var(--accent); margin-left: 3px; animation: blink 1s infinite; vertical-align: middle; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 3px; }

  /* Grid bg */
  .grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,255,170,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,170,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: grid-pan 8s linear infinite alternate;
  }

  /* Alert row */
  .alert-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 12px;
    border-left: 3px solid;
    font-family: var(--font-mono);
    animation: count-up 0.5s ease both;
  }
  .alert-row.danger { background: var(--red-dim); border-color: var(--red); }
  .alert-row.warning { background: rgba(255,208,96,0.1); border-color: var(--yellow); }
  .alert-row.success { background: var(--accent-dim); border-color: var(--accent); }

  /* Ticker */
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .ticker-inner {
    display: flex;
    gap: 60px;
    animation: ticker 20s linear infinite;
    white-space: nowrap;
  }
  .ticker-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 0.08em;
  }
  .ticker-item span { color: var(--accent); }

  /* Section divider */
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    letter-spacing: 0.2em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .section-label::before {
    content: '';
    width: 20px;
    height: 1px;
    background: var(--accent);
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: var(--accent-dim);
    border: 1px solid var(--border-bright);
    border-radius: 4px;
    font-size: 11px;
    color: var(--accent);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .live-dot {
    width: 7px; height: 7px; border-radius: 50%; background: var(--accent);
    animation: pulse-dot 2s infinite;
  }

  .red-dot {
    width: 7px; height: 7px; border-radius: 50%; background: var(--red);
    animation: pulse-dot 2s infinite;
    box-shadow: 0 0 0 0 rgba(255,56,96,0.7);
  }

  @keyframes scanline {
    0% { top: 0; }
    100% { top: 100%; }
  }
  .scanline {
    position: absolute;
    left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0,255,170,0.3), transparent);
    animation: scanline 3s linear infinite;
    pointer-events: none;
  }

  .card-number {
    font-size: 11px;
    color: var(--muted);
    font-family: var(--font-mono);
    margin-bottom: 8px;
    letter-spacing: 0.1em;
  }

  .nav-dashboard-btn { display: block; }
  @media (max-width: 768px) {
    .nav-dashboard-btn { display: none; }
    .mobile-menu-btn { display: block !important; }
  }
    .hero-grid { grid-template-columns: 1fr !important; }
    .feature-grid { grid-template-columns: 1fr 1fr !important; }
    .stats-grid { grid-template-columns: 1fr 1fr 1fr !important; }
    h1 { font-size: 42px !important; }
  }
  @media (max-width: 480px) {
    .feature-grid { grid-template-columns: 1fr !important; }
    .stats-grid { grid-template-columns: 1fr 1fr !important; }
  }
`

interface TypewriterTextProps {
  texts: string[]
  speed?: number
}

const TypewriterText: FC<TypewriterTextProps> = ({ texts, speed = 80 }) => {
  const [displayed, setDisplayed] = useState("")
  const [idx, setIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[idx]
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIdx < current.length) {
          setDisplayed(current.slice(0, charIdx + 1))
          setCharIdx(c => c + 1)
        } else {
          setTimeout(() => setDeleting(true), 1800)
        }
      } else {
        if (charIdx > 0) {
          setDisplayed(current.slice(0, charIdx - 1))
          setCharIdx(c => c - 1)
        } else {
          setDeleting(false)
          setIdx(i => (i + 1) % texts.length)
        }
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, idx, texts, speed])

  return <span>{displayed}<span className="cursor" /></span>
}

interface AnimatedCounterProps {
  target: number
  decimals?: number
  duration?: number
}

const AnimatedCounter: FC<AnimatedCounterProps> = ({ target, decimals = 0, duration = 2000 }) => {
  const [value, setValue] = useState(0)
  const startTime = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    startTime.current = performance.now()
    const animate = (now: number) => {
      const elapsed = now - (startTime.current ?? now)
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, decimals, duration])

  return <span>{value.toFixed(decimals)}</span>
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const features = [
    { icon: Crosshair, num: "01", title: "Cluster Detection", desc: "Coordinated wallet funding spotted inside 10-second windows before price moves." },
    { icon: Eye, num: "02", title: "Wallet Mapping", desc: "Visualize full parent-child wallet trees. See who's funding who in real time." },
    { icon: Shield, num: "03", title: "Risk Scoring", desc: "Track spend velocity, bankroll depletion, and rug probability per cluster." },
    { icon: Zap, num: "04", title: "5s Refresh", desc: "Live dashboard updates every 5 seconds. No stale data. No excuses." },
    { icon: BarChart2, num: "05", title: "Smart Filters", desc: "Slice by status, wallet, timeframe, cluster size, or SOL amount." },
    { icon: TrendingUp, num: "06", title: "Pure On-Chain", desc: "Zero Twitter noise. Zero influencer signal. Solana blockchain data only." },
  ]

  const alerts = [
    { type: "danger", time: "00:03s", label: "RUG PATTERN", wallet: "7xKp...9mNr", sol: "847 SOL", wallets: "23 wallets" },
    { type: "warning", time: "00:11s", label: "CLUSTER FORMING", wallet: "3qRt...2bLp", sol: "214 SOL", wallets: "8 wallets" },
    { type: "success", time: "00:28s", label: "CLUSTER RESOLVED", wallet: "9mFz...7kQw", sol: "91 SOL", wallets: "5 wallets" },
  ]

  const tickerItems = [
    { label: "CLUSTERS DETECTED TODAY", value: "2,847" },
    { label: "SOL TRACKED", value: "184,290" },
    { label: "RUG PATTERNS CAUGHT", value: "341" },
    { label: "AVG DETECTION TIME", value: "4.8s" },
    { label: "WALLETS MAPPED", value: "91,447" },
    { label: "ACTIVE CLUSTERS", value: "127" },
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: `1px solid ${scrolled ? "rgba(0,255,170,0.15)" : "transparent"}`,
        background: scrolled ? "rgba(8,10,15,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        transition: "all 0.4s"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                border: "1px solid var(--border-bright)",
                background: "var(--accent-dim)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Activity size={18} color="var(--accent)" />
              </div>
              <span className="font-display" style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>
                Dec<span style={{ color: "var(--accent)" }}>Clust</span>
              </span>
              <div style={{
                padding: "2px 8px", background: "var(--red-dim)",
                border: "1px solid rgba(255,56,96,0.3)", borderRadius: 4,
                fontSize: 10, color: "var(--red)", letterSpacing: "0.12em"
              }}>BETA</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div className="live-dot" />
                <span style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em" }}>LIVE</span>
              </div>
              <a href="/dashboard" className="nav-btn nav-dashboard-btn">
                DASHBOARD →
              </a>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)" }}
                className="mobile-menu-btn">
                {mobileMenuOpen ? <XIcon size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* TICKER */}
      <div style={{
        position: "fixed", top: 64, left: 0, right: 0, zIndex: 99,
        height: 32, overflow: "hidden",
        background: "rgba(0,255,170,0.05)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center"
      }}>
        <div className="ticker-inner">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="ticker-item">
              <span style={{ color: "var(--muted)" }}>◆</span>
              {item.label}: <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section style={{ paddingTop: 140, paddingBottom: 100, paddingLeft: 24, paddingRight: 24, position: "relative", overflow: "hidden" }}>
        <div className="grid-bg" />
        {/* Gradient orbs */}
        <div style={{
          position: "absolute", top: "20%", left: "60%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,170,0.06) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "10%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,56,96,0.05) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none"
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <div className="animate-float">
                <div className="tag">
                  <div className="red-dot" />
                  Solana Cluster Intelligence
                </div>
              </div>

              <h1 className="animate-float delay-1 font-display" style={{
                fontSize: 64, fontWeight: 800, lineHeight: 1.0,
                letterSpacing: "-0.03em"
              }}>
                Exit Before<br />
                <span className="glitch-wrap" data-text="The Rug" style={{ color: "var(--accent)", display: "inline-block" }}>
                  The Rug
                </span>
                <br />Pulls.
              </h1>

              <p className="animate-float delay-2" style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.7, maxWidth: 420 }}>
                Real-time coordinated wallet detection on Solana. Track clusters, spot rug patterns, and trade with actual on-chain intelligence — not Twitter noise.
              </p>

              <div className="animate-float delay-3" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "5-second cluster detection",
                  "Parent-child wallet tree mapping",
                  "Spend velocity & rug risk scoring",
                  "100% pure on-chain data"
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--muted)" }}>
                    <CheckCircle size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>

              <div className="animate-float delay-4" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <a href="/dashboard" className="cta-btn">
                  ENTER DASHBOARD <ArrowRight size={16} />
                </a>
                <a href="#features" className="outline-btn">
                  HOW IT WORKS
                </a>
              </div>
            </div>

            {/* Right — Terminal */}
            <div className="animate-float delay-3 terminal" style={{ position: "relative" }}>
              <div className="scanline" />
              <div className="terminal-header">
                <div className="terminal-dot" style={{ background: "var(--red)" }} />
                <div className="terminal-dot" style={{ background: "var(--yellow)" }} />
                <div className="terminal-dot" style={{ background: "var(--accent)" }} />
                <span style={{ marginLeft: 8, fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em" }}>
                  DECLUST // LIVE MONITOR
                </span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="live-dot" />
                  <span style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em" }}>ACTIVE</span>
                </div>
              </div>

              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Stats row */}
                <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    { label: "SOL TRACKED", value: <><AnimatedCounter target={847.3} decimals={1} />K</>, accent: false },
                    { label: "WALLETS", value: <><AnimatedCounter target={2847} decimals={0} /></>, accent: false },
                    { label: "DETECTION", value: <><AnimatedCounter target={4.8} decimals={1} />s</>, accent: true },
                  ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ borderColor: s.accent ? "var(--border-bright)" : undefined }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: s.accent ? "var(--accent)" : "var(--text)", fontFamily: "var(--font-mono)" }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.12em", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Alert feed */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.15em", marginBottom: 4 }}>// RECENT DETECTIONS</div>
                  {alerts.map((a, i) => (
                    <div key={i} className={`alert-row ${a.type}`} style={{ animationDelay: `${i * 0.15}s` }}>
                      <AlertTriangle size={12} color={a.type === "danger" ? "var(--red)" : a.type === "warning" ? "var(--yellow)" : "var(--accent)"} />
                      <span style={{ color: a.type === "danger" ? "var(--red)" : a.type === "warning" ? "var(--yellow)" : "var(--accent)", fontWeight: 700, minWidth: 130 }}>{a.label}</span>
                      <span style={{ color: "var(--muted)" }}>{a.wallet}</span>
                      <span style={{ marginLeft: "auto", color: "var(--text)" }}>{a.sol}</span>
                      <span style={{ color: "var(--muted)" }}>{a.wallets}</span>
                    </div>
                  ))}
                </div>

                {/* Terminal input */}
                <div style={{
                  background: "var(--bg)", borderRadius: 6, padding: "10px 14px",
                  border: "1px solid var(--border)", fontSize: 12, color: "var(--muted)"
                }}>
                  <span style={{ color: "var(--accent)" }}>{">"}</span>{" "}
                  <TypewriterText texts={[
                    "monitoring 127 active clusters...",
                    "rug pattern detected: 7xKp...9mNr",
                    "cluster depth: 4 levels, 23 wallets",
                    "spend velocity: 2.4 SOL/min → HIGH RISK",
                  ]} speed={55} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HORIZONTAL RULE */}
      <div style={{ maxWidth: 1200, margin: "0 auto 0", padding: "0 24px" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--border-bright), transparent)" }} />
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 60 }}>
            <div className="section-label">Features</div>
            <h2 className="font-display" style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.02em", maxWidth: 600 }}>
              Intelligence that<br />
              <span style={{ color: "var(--accent)" }}>actually works.</span>
            </h2>
            <p style={{ marginTop: 16, color: "var(--muted)", fontSize: 15, maxWidth: 480, lineHeight: 1.6 }}>
              Every feature built for one goal: catch coordinated wallet activity before the dump.
            </p>
          </div>

          <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="card-number">{f.num} /</div>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: "var(--accent-dim)", border: "1px solid var(--border-bright)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16
                }}>
                  <f.icon size={18} color="var(--accent)" />
                </div>
                <h3 className="font-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <div style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "60px 24px"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40 }}>
          {[
            { num: "< 5s", label: "Average Detection Time" },
            { num: "100%", label: "On-Chain Data" },
            { num: "91K+", label: "Wallets Tracked" },
            { num: "24/7", label: "Live Monitoring" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div className="font-display" style={{ fontSize: 44, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em" }}>{s.num}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA SECTION */}
      <section style={{ padding: "120px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,170,0.05) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="section-label" style={{ justifyContent: "center" }}>Get Started</div>
          <h2 className="font-display" style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 20 }}>
            Stop trading blind.<br />
            <span style={{ color: "var(--accent)" }}>Start trading smart.</span>
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.7, marginBottom: 40, maxWidth: 500, margin: "0 auto 40px" }}>
            Real-time Solana cluster intelligence. See the coordinated wallets before they dump. Trade with conviction.
          </p>
          <a href="/dashboard" className="cta-btn" style={{ fontSize: 16, padding: "18px 40px" }}>
            OPEN DASHBOARD <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "24px",
        background: "var(--surface)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={14} color="var(--accent)" />
              <span className="font-display" style={{ fontWeight: 800, fontSize: 14 }}>
                Dec<span style={{ color: "var(--accent)" }}>Clust</span>
              </span>
            </div>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>Powered by QuickNode</span>
          </div>
          <a href="https://x.com/Rachit_twts" target="_blank" rel="noopener noreferrer"
            style={{
              padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 6,
              color: "var(--muted)", fontSize: 12, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 6,
              transition: "border-color 0.3s, color 0.3s"
            }}
            onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.borderColor = "var(--accent)"
              e.currentTarget.style.color = "var(--accent)"
            }}
            onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.borderColor = "var(--border)"
              e.currentTarget.style.color = "var(--muted)"
            }}
          >
            <XIcon size={14} /> @Rachit_twts
          </a>
        </div>
      </footer>
    </>
  )
}
