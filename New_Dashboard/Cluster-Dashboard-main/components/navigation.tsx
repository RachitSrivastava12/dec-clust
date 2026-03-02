"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Activity, Menu, X, LogIn, LogOut, UserPlus, BarChart3, HelpCircle, Home, Wallet } from "lucide-react"
import { useState, useEffect } from "react"

const API_BASE = "http://localhost:3001"

const NAV_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');

  .dc-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid rgba(0,255,170,0.12);
    background: rgba(8,10,15,0.95);
    backdrop-filter: blur(20px);
    font-family: 'Space Mono', monospace;
  }

  .dc-nav-inner {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
  }

  .dc-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .dc-logo-icon {
    width: 34px; height: 34px;
    border-radius: 7px;
    background: rgba(0,255,170,0.1);
    border: 1px solid rgba(0,255,170,0.3);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .dc-logo-text {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 18px;
    color: #e8edf5;
    letter-spacing: -0.01em;
  }

  .dc-logo-text span { color: #00ffaa; }

  .dc-beta {
    padding: 2px 7px;
    background: rgba(255,56,96,0.1);
    border: 1px solid rgba(255,56,96,0.3);
    border-radius: 4px;
    font-size: 9px;
    color: #ff3860;
    letter-spacing: 0.12em;
  }

  .dc-nav-center {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .dc-nav-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 12px;
    letter-spacing: 0.06em;
    color: #5a6a80;
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: color 0.2s, background 0.2s;
    font-family: 'Space Mono', monospace;
  }

  .dc-nav-link:hover {
    color: #e8edf5;
    background: rgba(255,255,255,0.04);
  }

  .dc-nav-link.active {
    color: #00ffaa;
    background: rgba(0,255,170,0.08);
  }

  .dc-nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .dc-live-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: #00ffaa;
    letter-spacing: 0.12em;
  }

  .dc-live-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #00ffaa;
    animation: dc-pulse 2s infinite;
  }

  @keyframes dc-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,170,0.7); }
    70% { box-shadow: 0 0 0 6px rgba(0,255,170,0); }
  }

  .dc-btn-primary {
    padding: 8px 18px;
    background: #00ffaa;
    color: #080a0f;
    font-family: 'Space Mono', monospace;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.06em;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: box-shadow 0.3s;
    white-space: nowrap;
  }

  .dc-btn-primary:hover {
    box-shadow: 0 0 20px rgba(0,255,170,0.4), 0 0 40px rgba(0,255,170,0.15);
  }

  .dc-btn-ghost {
    padding: 7px 14px;
    background: transparent;
    color: #5a6a80;
    font-family: 'Space Mono', monospace;
    font-weight: 400;
    font-size: 12px;
    letter-spacing: 0.06em;
    border: 1px solid rgba(0,255,170,0.15);
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .dc-btn-ghost:hover {
    color: #00ffaa;
    border-color: rgba(0,255,170,0.4);
    background: rgba(0,255,170,0.05);
  }

  .dc-btn-danger {
    padding: 7px 14px;
    background: transparent;
    color: #ff3860;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.06em;
    border: 1px solid rgba(255,56,96,0.2);
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .dc-btn-danger:hover {
    background: rgba(255,56,96,0.08);
    border-color: rgba(255,56,96,0.4);
  }

  .dc-divider {
    width: 1px; height: 20px;
    background: rgba(0,255,170,0.12);
    margin: 0 4px;
  }

  /* Mobile */
  .dc-mobile-toggle {
    display: none;
    background: none;
    border: 1px solid rgba(0,255,170,0.15);
    border-radius: 6px;
    padding: 7px;
    color: #e8edf5;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .dc-mobile-toggle:hover { border-color: rgba(0,255,170,0.4); }

  .dc-mobile-menu {
    border-top: 1px solid rgba(0,255,170,0.1);
    background: rgba(8,10,15,0.98);
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  @media (max-width: 768px) {
    .dc-nav-center, .dc-nav-right { display: none; }
    .dc-mobile-toggle { display: flex; }
  }

  /* Modal */
  .dc-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 200;
  }

  .dc-modal {
    background: #0d1117;
    border: 1px solid rgba(0,255,170,0.2);
    border-radius: 14px;
    padding: 28px;
    max-width: 440px;
    width: calc(100% - 32px);
    box-shadow: 0 0 60px rgba(0,255,170,0.08), 0 40px 80px rgba(0,0,0,0.6);
  }

  .dc-modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: #e8edf5;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dc-input {
    width: 100%;
    background: #080a0f;
    border: 1px solid rgba(0,255,170,0.15);
    border-radius: 7px;
    padding: 10px 14px;
    color: #e8edf5;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
    margin-bottom: 10px;
  }

  .dc-input:focus { border-color: rgba(0,255,170,0.4); }
  .dc-input::placeholder { color: #5a6a80; }

  .dc-modal-footer-msg {
    font-size: 12px;
    margin-top: 12px;
    padding: 8px 12px;
    border-radius: 6px;
  }

  .dc-msg-ok { background: rgba(0,255,170,0.1); color: #00ffaa; border: 1px solid rgba(0,255,170,0.2); }
  .dc-msg-err { background: rgba(255,56,96,0.1); color: #ff3860; border: 1px solid rgba(255,56,96,0.2); }

  .dc-close-btn {
    background: none;
    border: none;
    color: #5a6a80;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    transition: color 0.2s;
  }
  .dc-close-btn:hover { color: #e8edf5; }

  .dc-wallet-row {
    display: flex; gap: 8px; align-items: center;
    margin-bottom: 10px;
  }
  .dc-wallet-row .dc-input { margin-bottom: 0; flex: 1; }

  .dc-modal-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    background: #080a0f;
    border: 1px solid rgba(0,255,170,0.1);
    border-radius: 7px;
    padding: 4px;
  }

  .dc-tab {
    flex: 1;
    padding: 8px;
    text-align: center;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s;
    background: none;
    color: #5a6a80;
  }

  .dc-tab.active {
    background: #00ffaa;
    color: #080a0f;
    font-weight: 700;
  }

  textarea.dc-input { resize: none; height: 100px; }
`

export function Navigation({ setIsLoggedInState }: { setIsLoggedInState?: (v: boolean) => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [solanaAddress, setSolana] = useState("")
  const [message, setMessage] = useState("")
  const [mode, setMode] = useState<"login" | "signup" | null>(null)
  const [walletDetected, setWalletDetected] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [supportEmail, setSupportEmail] = useState("")
  const [supportMessage, setSupportMessage] = useState("")
  const [supportFile, setSupportFile] = useState<File | null>(null)
  const [supportStatus, setSupportStatus] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined" && "solana" in window) setWalletDetected(true)
  }, [])

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("isLoggedIn") : null
    if (stored === "true") { setIsLoggedIn(true); setIsLoggedInState?.(true); return }
    fetch(`${API_BASE}/me`, { method: "GET", credentials: "include" })
      .then(res => {
        const ok = res.ok
        setIsLoggedIn(ok); setIsLoggedInState?.(ok)
        ok ? localStorage.setItem("isLoggedIn", "true") : localStorage.removeItem("isLoggedIn")
      })
      .catch(() => { setIsLoggedIn(false); setIsLoggedInState?.(false); localStorage.removeItem("isLoggedIn") })
  }, [setIsLoggedInState])

  const setLoggedIn = (val: boolean) => {
    setIsLoggedIn(val); setIsLoggedInState?.(val)
    val ? localStorage.setItem("isLoggedIn", "true") : localStorage.removeItem("isLoggedIn")
  }

  const handleLogout = async () => {
    try { await fetch(`${API_BASE}/logout`, { method: "POST", credentials: "include" }) } catch {}
    setLoggedIn(false); setMode(null); router.push("/")
  }

  const connectWallet = async () => {
    if (typeof window === "undefined" || !("solana" in window)) { setMessage("❌ No Solana wallet detected."); return }
    const provider = (window as Window & { solana?: { isPhantom?: boolean; connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }> } }).solana
    if (!provider?.isPhantom) { setMessage("❌ Unsupported wallet"); return }
    try {
      const resp = await provider.connect({ onlyIfTrusted: true }).catch(() => provider!.connect())
      setSolana(resp.publicKey.toString())
      setMessage(`✅ Connected: ${resp.publicKey.toString().slice(0, 6)}...`)
    } catch { setMessage("❌ Wallet connection failed") }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email && !solanaAddress) { setMessage("❌ Provide email or connect wallet"); return }
    if (email && !password) { setMessage("❌ Password required"); return }
    try {
      const res = await fetch(`${API_BASE}/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email, password, solanaAddress }) })
      const data = await res.json()
      if (res.ok) { setMessage(`✅ Signed up as ${data.user?.email || data.user?.solana_address}`); setLoggedIn(true); setMode(null) }
      else setMessage(`❌ ${data.error || "Signup failed"}`)
    } catch { setMessage("❌ Error connecting to backend") }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email && !solanaAddress) { setMessage("❌ Provide email or connect wallet"); return }
    if (email && !password) { setMessage("❌ Password required"); return }
    try {
      const res = await fetch(`${API_BASE}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email, password, solanaAddress }) })
      const data = await res.json()
      if (res.ok) { setMessage(`✅ Logged in as ${data.user?.email || data.user?.solana_address}`); setLoggedIn(true); setMode(null) }
      else setMessage(`❌ ${data.error || "Login failed"}`)
    } catch { setMessage("❌ Error connecting to backend") }
  }

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supportEmail || !supportMessage) { setSupportStatus("❌ Email and message required"); return }
    const form = new FormData()
    form.append("email", supportEmail); form.append("message", supportMessage)
    if (supportFile) form.append("file", supportFile)
    try {
      const res = await fetch(`${API_BASE}/support`, { method: "POST", body: form, credentials: "include" })
      if (res.ok) {
        setSupportStatus("✅ Message sent")
        setSupportEmail(""); setSupportMessage(""); setSupportFile(null)
        setTimeout(() => { setShowSupport(false); setSupportStatus("") }, 1500)
      } else {
        const d = await res.json().catch(() => ({}))
        setSupportStatus(`❌ ${d.error || "Failed to send"}`)
      }
    } catch { setSupportStatus("❌ Error connecting to backend") }
  }

  const navItems = [
    { name: "HOME", href: "/", icon: Home },
    { name: "SUPPORT", href: "#", icon: HelpCircle, onClick: () => setShowSupport(true) },
  ]

  const closeModal = () => { setMode(null); setMessage("") }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NAV_STYLES }} />

      <nav className="dc-nav">
        <div className="dc-nav-inner">
          {/* Logo */}
          <Link href="/" className="dc-logo">
            <div className="dc-logo-icon">
              <Activity size={16} color="#00ffaa" />
            </div>
            <span className="dc-logo-text">Dec<span>Clust</span></span>
            <div className="dc-beta">BETA</div>
          </Link>

          {/* Center nav */}
          <div className="dc-nav-center">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => { item.onClick?.(); if (item.href !== "#") router.push(item.href) }}
                className={`dc-nav-link ${pathname === item.href ? "active" : ""}`}
              >
                <item.icon size={13} />
                {item.name}
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="dc-nav-right">
            <div className="dc-live-badge">
              <div className="dc-live-dot" />
              LIVE
            </div>
            <div className="dc-divider" />

            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="dc-btn-primary">
                  <BarChart3 size={13} /> DASHBOARD
                </Link>
                <button onClick={handleLogout} className="dc-btn-danger">
                  <LogOut size={13} /> LOGOUT
                </button>
              </>
            ) : (
              <>
               
              </>
            )}

            {/* Mobile toggle */}
            <button className="dc-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="dc-mobile-menu">
            {navItems.map(item => (
              <button key={item.name} className="dc-nav-link" style={{ justifyContent: "flex-start" }}
                onClick={() => { item.onClick?.(); if (item.href !== "#") router.push(item.href); setMobileMenuOpen(false) }}>
                <item.icon size={13} /> {item.name}
              </button>
            ))}
            <div style={{ height: 1, background: "rgba(0,255,170,0.1)", margin: "8px 0" }} />
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="dc-btn-primary" style={{ justifyContent: "center" }} onClick={() => setMobileMenuOpen(false)}>
                  <BarChart3 size={13} /> DASHBOARD
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }} className="dc-btn-danger" style={{ justifyContent: "center" }}>
                  <LogOut size={13} /> LOGOUT
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setMode("login"); setMobileMenuOpen(false) }} className="dc-btn-ghost" style={{ justifyContent: "center" }}>
                  <LogIn size={13} /> LOGIN
                </button>
                <button onClick={() => { setMode("signup"); setMobileMenuOpen(false) }} className="dc-btn-primary" style={{ justifyContent: "center" }}>
                  <UserPlus size={13} /> SIGN UP
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* AUTH MODAL */}
      {mode && (
        <div className="dc-modal-overlay" onClick={closeModal}>
          <div className="dc-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-title">
              <span style={{ fontFamily: "'Syne', sans-serif" }}>
                {mode === "login" ? "// LOGIN" : "// SIGN UP"}
              </span>
              <button className="dc-close-btn" onClick={closeModal}><X size={18} /></button>
            </div>

            <div className="dc-modal-tabs">
              <button className={`dc-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setMessage("") }}>LOGIN</button>
              <button className={`dc-tab ${mode === "signup" ? "active" : ""}`} onClick={() => { setMode("signup"); setMessage("") }}>SIGN UP</button>
            </div>

            <form onSubmit={mode === "login" ? handleLogin : handleSignup}>
              <input type="email" placeholder="Email (optional if using wallet)" className="dc-input"
                value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Password (required for email)" className="dc-input"
                value={password} onChange={e => setPassword(e.target.value)} />
              <div className="dc-wallet-row">
                <input type="text" placeholder="Solana address (optional)" className="dc-input"
                  value={solanaAddress} onChange={e => setSolana(e.target.value)} />
                {walletDetected && (
                  <button type="button" onClick={connectWallet} className="dc-btn-ghost" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                    <Wallet size={12} /> Connect
                  </button>
                )}
              </div>
              <button type="submit" className="dc-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                {mode === "login" ? "LOGIN →" : "SIGN UP →"}
              </button>
            </form>

            {message && (
              <div className={`dc-modal-footer-msg ${message.startsWith("✅") ? "dc-msg-ok" : "dc-msg-err"}`}>
                {message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUPPORT MODAL */}
      {showSupport && (
        <div className="dc-modal-overlay" onClick={() => setShowSupport(false)}>
          <div className="dc-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-title">
              <span>// SUPPORT</span>
              <button className="dc-close-btn" onClick={() => setShowSupport(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSupportSubmit}>
              <input type="email" placeholder="Your email" className="dc-input"
                value={supportEmail} onChange={e => setSupportEmail(e.target.value)} required />
              <textarea placeholder="Your message..." className="dc-input"
                value={supportMessage} onChange={e => setSupportMessage(e.target.value)} required />
              <input type="file" className="dc-input" style={{ cursor: "pointer" }}
                onChange={e => setSupportFile(e.target.files?.[0] ?? null)} />
              <button type="submit" className="dc-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                SEND MESSAGE →
              </button>
            </form>
            {supportStatus && (
              <div className={`dc-modal-footer-msg ${supportStatus.startsWith("✅") ? "dc-msg-ok" : "dc-msg-err"}`}>
                {supportStatus}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
