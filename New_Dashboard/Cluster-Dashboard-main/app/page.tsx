"use client"

import { useState, useEffect } from "react"
import { 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  BarChart,
  Twitter,
  Github,
  Sparkles,
  ArrowRight,
  X,
  Linkedin,
  Mail,
  Menu
} from "lucide-react"

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mode, setMode] = useState<"signup" | "login" | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [solanaAddress, setSolanaAddress] = useState("")
  const [message, setMessage] = useState("")
  const [walletDetected, setWalletDetected] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [animatedValues, setAnimatedValues] = useState({
    sol: 0,
    wallets: 0,
    speed: 0
  })

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true"
      setIsLoggedIn(loggedIn)
      
      if ("solana" in window) {
        setWalletDetected(true)
      }
    }

    // Animate hero stats
    const interval = setInterval(() => {
      setAnimatedValues(prev => ({
        sol: Math.min(prev.sol + 0.5, 24.7),
        wallets: Math.min(prev.wallets + 1, 47),
        speed: Math.min(prev.speed + 0.2, 5.3)
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const connectWallet = async () => {
    if (typeof window !== "undefined" && "solana" in window) {
      const provider: any = window.solana
      if (provider.isPhantom) {
        try {
          const resp = await provider.connect({ onlyIfTrusted: true }).catch(() => provider.connect())
          setSolanaAddress(resp.publicKey.toString())
          setMessage(`✅ Connected: ${resp.publicKey.toString().slice(0, 8)}...`)
        } catch (err) {
          setMessage("❌ Connection failed")
        }
      }
    } else {
      setMessage("❌ Install Phantom wallet")
    }
  }

  const handleSignup = async () => {
    if (!email && !solanaAddress) {
      setMessage("❌ Email or wallet required")
      return
    }
    if (email && !password) {
      setMessage("❌ Password required")
      return
    }
    try {
      const res = await fetch("https://dec-clust-1.onrender.com/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, solanaAddress }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`✅ Signed up! ${data.user?.email || data.user?.solana_address}`)
        setIsLoggedIn(true)
        if (typeof window !== "undefined") {
          localStorage.setItem("isLoggedIn", "true")
        }
        setTimeout(() => {
          setMode(null)
          setEmail("")
          setPassword("")
          setSolanaAddress("")
          setMessage("")
        }, 1500)
      } else {
        setMessage(`❌ ${data.error || 'Signup failed'}`)
      }
    } catch {
      setMessage("❌ Connection error")
    }
  }

  const handleLogin = async () => {
    if (!email && !solanaAddress) {
      setMessage("❌ Email or wallet required")
      return
    }
    if (email && !password) {
      setMessage("❌ Password required")
      return
    }
    try {
      const res = await fetch("https://dec-clust-1.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, solanaAddress }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`✅ Welcome back! ${data.user?.email || data.user?.solana_address}`)
        setIsLoggedIn(true)
        if (typeof window !== "undefined") {
          localStorage.setItem("isLoggedIn", "true")
        }
        setTimeout(() => {
          setMode(null)
          setEmail("")
          setPassword("")
          setSolanaAddress("")
          setMessage("")
        }, 1500)
      } else {
        setMessage(`❌ ${data.error || 'Login failed'}`)
      }
    } catch {
      setMessage("❌ Connection error")
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("https://dec-clust-1.onrender.com/logout", {
        method: "POST",
        credentials: "include",
      })
      setIsLoggedIn(false)
      if (typeof window !== "undefined") {
        localStorage.removeItem("isLoggedIn")
      }
    } catch {
      console.error("Logout failed")
    }
  }

  const faqs = [
    {
      question: "What is DecClust?",
      answer: "DecClust is a real-time Solana cluster detection platform that identifies wallet funding patterns, bundler activity, and potential pump opportunities before they happen."
    },
    {
      question: "How does cluster detection work?",
      answer: "We monitor parent wallets funding multiple child wallets within 10-second windows, tracking at least 5 wallets with 20+ SOL total. This reveals coordinated trading activity in real-time."
    },
    {
      question: "What makes DecClust different?",
      answer: "Direct Solana RPC ingestion with 5-second polling. No Twitter rumors, no delays—just pure on-chain data showing you exactly what's happening as it happens."
    },
    {
      question: "Who is this for?",
      answer: "Solana traders who want institutional-grade intelligence. Whether you're tracking pumps, avoiding rugs, or analyzing wallet behavior, DecClust gives you the edge."
    },
    {
      question: "How fast is the detection?",
      answer: "Clusters are detected within 10-second windows and displayed with 5-second refresh rates. You see the play forming before it prints on the chart."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                DecClust
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <a href="/dashboard" className="text-foreground hover:text-primary transition-colors">
                    Dashboard
                  </a>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setMode("login")}
                    className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-all duration-300"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setMode("signup")}
                    className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-300"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <a href="/dashboard" className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors">
                    Dashboard
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMode("login")
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setMode("signup")
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {mode === "login" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border shadow-2xl relative">
            <button
              onClick={() => {
                setMode(null)
                setMessage("")
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-foreground mb-6">Welcome Back</h2>
            
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or Solana Address"
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  value={solanaAddress}
                  onChange={(e) => setSolanaAddress(e.target.value)}
                />
                {walletDetected && (
                  <button
                    onClick={connectWallet}
                    className="px-4 py-3 rounded-lg bg-background border border-border text-foreground hover:border-primary transition-colors whitespace-nowrap"
                  >
                    Connect
                  </button>
                )}
              </div>
              
              <button
                onClick={handleLogin}
                className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-300"
              >
                Login
              </button>

              <div className="text-center">
                <button
                  onClick={() => setMode("signup")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Don't have an account? <span className="font-semibold">Sign up</span>
                </button>
              </div>
            </div>
            
            {message && (
              <p className="mt-4 text-sm text-center text-muted-foreground">{message}</p>
            )}
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {mode === "signup" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border shadow-2xl relative">
            <button
              onClick={() => {
                setMode(null)
                setMessage("")
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-foreground mb-6">Join Early Access</h2>
            
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Solana Address (optional)"
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  value={solanaAddress}
                  onChange={(e) => setSolanaAddress(e.target.value)}
                />
                {walletDetected && (
                  <button
                    onClick={connectWallet}
                    className="px-4 py-3 rounded-lg bg-background border border-border text-foreground hover:border-primary transition-colors whitespace-nowrap"
                  >
                    Connect
                  </button>
                )}
              </div>
              
              <button
                onClick={handleSignup}
                className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-300"
              >
                Sign Up
              </button>

              <div className="text-center">
                <button
                  onClick={() => setMode("login")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Already have an account? <span className="font-semibold">Login</span>
                </button>
              </div>
            </div>
            
            {message && (
              <p className="mt-4 text-sm text-center text-muted-foreground">{message}</p>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-muted border border-border">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground font-medium">First-of-its-kind cluster detection</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Exit Before
                <span className="block text-primary">
                  The Rug Pulls
                </span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Real-time Solana wallet cluster detection. See pump coordination as it happens, 
                track SOL flows, and exit safely before the door closes.
              </p>

              <div className="space-y-3">
                {[
                  "5-second real-time detection",
                  "100% on-chain transparency",
                  "Institutional-grade intelligence",
                  "No rumors, just data"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => setMode("signup")}
                  className="group px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Get Early Access</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 rounded-xl bg-muted border border-border text-foreground font-bold text-lg hover:bg-muted/80 transition-all duration-300">
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Dashboard Preview */}
            <div className="relative">
              {/* Live Dashboard Card */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm text-muted-foreground font-medium">LIVE DETECTION</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Updated 2s ago</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted rounded-xl p-4 border border-border">
                    <div className="text-2xl font-bold text-foreground">{animatedValues.sol.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground mt-1">SOL Detected</div>
                  </div>
                  <div className="bg-muted rounded-xl p-4 border border-border">
                    <div className="text-2xl font-bold text-foreground">{Math.floor(animatedValues.wallets)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Child Wallets</div>
                  </div>
                  <div className="bg-muted rounded-xl p-4 border border-border">
                    <div className="text-2xl font-bold text-foreground">{animatedValues.speed.toFixed(1)}s</div>
                    <div className="text-xs text-muted-foreground mt-1">Detection</div>
                  </div>
                </div>

                {/* Cluster Activity */}
                <div className="space-y-3">
                  {[
                    { status: "LOADING", token: "$PUMP", sol: "12.4", wallets: 23, color: "yellow" },
                    { status: "ACTIVE", token: "$MEW", sol: "8.7", wallets: 15, color: "green" },
                    { status: "SPENT", token: "$BUZZ", sol: "3.2", wallets: 9, color: "red" }
                  ].map((cluster, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-4 border border-border hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            cluster.color === 'yellow' ? 'bg-yellow-500' :
                            cluster.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                          } animate-pulse`}></div>
                          <div>
                            <div className="text-sm font-bold text-foreground">{cluster.token}</div>
                            <div className="text-xs text-muted-foreground">{cluster.status}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-primary">{cluster.sol} SOL</div>
                          <div className="text-xs text-muted-foreground">{cluster.wallets} wallets</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Trading Intelligence That Actually Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              While others chase Twitter rumors, you'll trade with real-time on-chain data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Activity,
                title: "Real-time Monitoring",
                description: "5-second polling intervals catch clusters as they form. No delays, no missed opportunities.",
                features: ["Live cluster detection", "Instant status updates", "Auto-refresh dashboard"]
              },
              {
                icon: TrendingUp,
                title: "Pattern Analysis",
                description: "Track DEX programs, wallet age, and funding patterns to identify coordinated activity.",
                features: ["DEX program tracking", "Wallet age analysis", "Amount pattern detection"]
              },
              {
                icon: Shield,
                title: "Risk Assessment",
                description: "Monitor spend rates and remaining balances to know exactly when to exit.",
                features: ["SOL spend velocity", "Time remaining calc", "Low balance alerts"]
              },
              {
                icon: Zap,
                title: "Ultra-fast Detection",
                description: "Detect coordinated wallet activity within 10-second windows with high precision.",
                features: ["10-second windows", "5+ wallet minimum", "20+ SOL threshold"]
              },
              {
                icon: Users,
                title: "Cluster Mapping",
                description: "View complete parent-child relationships and track every wallet in the network.",
                features: ["Full wallet lists", "One-click copying", "Relationship graphs"]
              },
              {
                icon: BarChart,
                title: "Advanced Filtering",
                description: "Search and filter clusters by status, wallet address, and custom time ranges.",
                features: ["Status filtering", "Address search", "Custom timeframes"]
              }
            ].map((feature, i) => (
              <div key={i} className="group bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, j) => (
                    <li key={j} className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">How DecClust Works</h2>
            <p className="text-xl text-muted-foreground">Four steps to smarter trading</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Detect Clusters",
                description: "Monitor parent wallets funding 5+ child wallets within 10-second windows with 20+ SOL total"
              },
              {
                step: "02",
                title: "Track Activity",
                description: "Watch real-time as child wallets load tokens, enter DEX programs, and coordinate buys"
              },
              {
                step: "03",
                title: "Analyze Risk",
                description: "Calculate spend velocity, remaining bankroll, and estimated runway before the pump ends"
              },
              {
                step: "04",
                title: "Exit Smart",
                description: "Get alerts when spend rates accelerate or balances drop—exit before the rug"
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300">
                  <div className="text-6xl font-bold text-primary/20 mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Common Questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-foreground text-left">{faq.question}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-muted-foreground border-t border-border pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary/10 rounded-3xl border border-primary/20 p-12 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Ready to Trade Smarter?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the waitlist for early access to DecClust and start detecting clusters before they pump
            </p>
            <button
              onClick={() => setMode("signup")}
              className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <span>Get Early Access</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold text-foreground">
                  DecClust
                </span>
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                Real-time Solana cluster detection for advanced traders. Track funding patterns, analyze wallet behaviors, and stay ahead of the market.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Connect</h3>
              <div className="flex space-x-3">
                <button className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 border border-border hover:border-primary/50 flex items-center justify-center transition-all">
                  <Twitter className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 border border-border hover:border-primary/50 flex items-center justify-center transition-all">
                  <Github className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 border border-border hover:border-primary/50 flex items-center justify-center transition-all">
                  <Linkedin className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 border border-border hover:border-primary/50 flex items-center justify-center transition-all">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2025 DecClust. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}