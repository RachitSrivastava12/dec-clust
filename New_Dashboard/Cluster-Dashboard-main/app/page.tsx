

"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import {
  BarChart3,
  Twitter,
  Linkedin,
  Github,
  Mail,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  TrendingUp,
  Shield,
  Zap,
  Users,                  
  BarChart,
} from "lucide-react"
import { useState, useEffect } from "react"

export default function HomePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  // Signup form state
  const [mode, setMode] = useState<"signup" | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [solanaAddress, setSolanaAddress] = useState("")
  const [message, setMessage] = useState("")
  const [walletDetected, setWalletDetected] = useState(false)

  // Detect Solana wallet on mount
  useEffect(() => {
    if ("solana" in window) {
      setWalletDetected(true)
    }
  }, [])

  const handleDashboardClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault()
      alert("Please log in to access the dashboard.")
      router.push("/#login")
    }
  }

  // Connect Solana Wallet
  const connectWallet = async () => {
    if ("solana" in window) {
      const provider: any = window.solana
      if (provider.isPhantom) {
        try {
          const resp = await provider.connect({ onlyIfTrusted: true }).catch(() => provider.connect())
          setSolanaAddress(resp.publicKey.toString())
          setMessage(`✅ Connected wallet: ${resp.publicKey.toString().slice(0, 6)}...`)
        } catch (err) {
          setMessage("❌ Wallet connection failed")
        }
      } else {
        setMessage("❌ Unsupported Solana wallet")
      }
    } else {
      setMessage("❌ No Solana wallet detected. Install Phantom or similar.")
    }
  }

  // Handle Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email && !solanaAddress) {
      setMessage("❌ Provide email or connect Solana wallet")
      return
    }
    if (email && !password) {
      setMessage("❌ Password required for email signup")
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
        setMessage(`✅ Signed up as ${data.user?.email || data.user?.solana_address}`)
        setIsLoggedIn(true)
        localStorage.setItem("isLoggedIn", "true")
        setMode(null)
      } else {
        setMessage(`❌ ${data.error || 'Signup failed'}`)
      }
    } catch {
      setMessage("❌ Error connecting to backend")
    }
  }

  const faqs = [
    {
      question: "What is Opsonchain?",
      answer:
        "Opsonchain is a real-time Solana on-chain monitoring platform that detects real-time cluster detection and trading patterns.",
    },
    {
      question: "How does Opsonchain work?",
      answer:
        "It tracks parent-to-child wallet fundings, bundles, and token activity to give traders early insights.",
    },
    {
      question: "What features does Opsonchain offer?",
      answer:
        "Live bundler detection, token load analysis, exit signals, and trading opportunity alerts.",
    },
    {
      question: "Is Opsonchain suitable for beginners?",
      answer:
        "Yes, it provides clear insights with simple dashboards designed for all experience levels.",
    },
    {
      question: "What makes Opsonchain different?",
      answer:
        "It’s the first Solana on-chain tool offering ultra-fast wallet cluster detection with actionable trading windows.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation setIsLoggedInState={setIsLoggedIn} />

      {/* Signup Form Modal-like */}
      {mode === "signup" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="p-6 max-w-md w-full bg-card rounded-xl shadow-md">
            <h2 className="text-lg font-bold mb-4">Sign Up</h2>
            <form onSubmit={handleSignup} className="space-y-3">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full border rounded p-2 bg-background text-foreground"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Your Password"
                className="w-full border rounded p-2 bg-background text-foreground"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Solana Address (optional)"
                  className="flex-1 border rounded p-2 bg-background text-foreground"
                  value={solanaAddress}
                  onChange={(e) => setSolanaAddress(e.target.value)}
                />
                {walletDetected && (
                  <Button type="button" onClick={connectWallet} className="whitespace-nowrap">
                    Connect Wallet
                  </Button>
                )}
              </div>
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
            {message && <p className="mt-3 text-sm text-foreground">{message}</p>}
            <Button variant="ghost" size="sm" onClick={() => setMode(null)} className="mt-3 w-full">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance text-left">
                  Know when the rug will happen, exit before it does.{" "}
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg text-pretty">
                  The first live bundler detector on Solana. Ultra-fast wallet cluster detection that shows you what
                  token is being pumped, how much SOL is behind it, and when the exit door closes.
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{"First-of-its-kind real-time bundler detection"}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{"On-chain clarity, no rumors"}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{"Predict pumps before they peak"}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{"Exit safely, avoid rugs"}</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium w-full sm:w-auto"
                  onClick={() => setMode("signup")}
                >
                  {"👉 Join the early access waitlist"}
                </Button>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground"></div>
              </div>
            </div>

            {/* Right Dashboard Preview */}
            <div className="relative">
              <div className="bg-muted/30 rounded-2xl p-8 border border-border">
                <div className="aspect-video bg-card rounded-lg border border-border flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <BarChart3 className="h-16 w-16 text-primary mx-auto" />
                    <div className="space-y-2">
                      <div className="h-2 bg-muted rounded w-32 mx-auto"></div>
                      <div className="h-2 bg-muted rounded w-24 mx-auto"></div>
                      <div className="h-2 bg-muted rounded w-28 mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Trading Intelligence features section */}
          {/* Advanced Trading Intelligence features section */}
<section className="py-20 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto space-y-12">
    <div className="text-center space-y-4">
      <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
        Advanced Trading Intelligence
      </h2>
      <p className="text-lg text-muted-foreground text-pretty">
        Get the insights you need to make informed trading decisions on Solana
      </p>
    </div>

    {/* Features Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Real-time Monitoring */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-4 shadow-none hover:shadow-lg transition-shadow duration-300">
        <Activity className="h-10 w-10 text-foreground" />
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">Real-time Monitoring</h3>
          <p className="text-muted-foreground text-sm">
            Track funding clusters as they form and evolve in real-time
          </p>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Live cluster detection</li>
          <li>• 5-second polling intervals</li>
          <li>• Instant status updates</li>
        </ul>
      </div>

      {/* Pattern Analysis */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-4 shadow-none hover:shadow-lg transition-shadow duration-300">
        <TrendingUp className="h-10 w-10 text-foreground" />
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">Pattern Analysis</h3>
          <p className="text-muted-foreground text-sm">Identify common trading patterns and wallet behaviors</p>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• DEX program tracking</li>
          <li>• Wallet age analysis</li>
          <li>• Amount pattern detection</li>
        </ul>
      </div>

      {/* Risk Assessment */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-4 shadow-none hover:shadow-lg transition-shadow duration-300">
        <Shield className="h-10 w-10 text-foreground" />
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">Risk Assessment</h3>
          <p className="text-muted-foreground text-sm">
            Monitor spend rates and remaining balances for risk management
          </p>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• SOL spend rate tracking</li>
          <li>• Time remaining estimates</li>
          <li>• Low balance alerts</li>
        </ul>
      </div>

      {/* Fast Detection */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-4 shadow-none hover:shadow-lg transition-shadow duration-300">
        <Zap className="h-10 w-10 text-foreground" />
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">Fast Detection</h3>
          <p className="text-muted-foreground text-sm">
            Detect activities within 10-second windows with high precision
          </p>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Minimum 5 children required</li>
          <li>• 20+ SOL threshold</li>
          <li>• 10-second detection window</li>
        </ul>
      </div>

      {/* Child Wallet Tracking */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-4 shadow-none hover:shadow-lg transition-shadow duration-300">
        <Users className="h-10 w-10 text-foreground" />
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">Child Wallet Tracking</h3>
          <p className="text-muted-foreground text-sm">View and analyze all child wallets within each cluster</p>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Complete recipient lists</li>
          <li>• One-click address copying</li>
          <li>• Cluster relationship mapping</li>
        </ul>
      </div>

      {/* Advanced Filtering */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-4 shadow-none hover:shadow-lg transition-shadow duration-300">
        <BarChart className="h-10 w-10 text-foreground" />
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">Advanced Filtering</h3>
          <p className="text-muted-foreground text-sm">Filter and search clusters by multiple criteria</p>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Status-based filtering</li>
          <li>• Wallet address search</li>
          <li>• Custom time ranges</li>
        </ul>
      </div>
    </div>
  </div>
</section>

     

      

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">How it works</h2>
            <p className="text-lg text-muted-foreground text-pretty max-w-3xl mx-auto">
              While others rely on Twitter rumors and gut feelings, you'll trade with institutional-grade intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Discover Card */}
            <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
              <div className="aspect-square bg-muted/50 rounded-xl flex items-center justify-center">
                {/* <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">MEW</div> */}

                <img 
  src="/image.png" 
  alt="Custom Image" 
  className="w-full h-full object-cover rounded-xl" 
/>

                
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">Ultra-fast wallet clustering</h3>
                <p className="text-muted-foreground text-sm">
                  OpsOnchain continuously monitors on-chain data to detect parent wallets funding child wallets in
                  seconds
                </p>
              </div>
            </div>

            {/* Monitor Card */}
            <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
              <div className="aspect-square bg-muted/50 rounded-xl p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Open</span>
                    <span className="text-xs text-muted-foreground">1 min ago</span>
                    <span className="text-xs text-muted-foreground">$3150</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">BUZZ</span>
                    <span className="text-green-500 text-sm">+ $194.57K</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">On-chain only</h3>
                <p className="text-muted-foreground text-sm">
                  Direct Solana RPC ingestion with no third-party feeds. 100% transparent, 100% real-time.
                </p>
              </div>
            </div>

            {/* Analyze Card */}
            <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
              <div className="aspect-square bg-muted/50 rounded-xl p-4 flex flex-col justify-center">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Risk Score</span>
                    <span className="text-green-500 font-medium">Low</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-muted-foreground">Wallet Age</span>
                    <span className="text-foreground font-medium">45 days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="text-foreground font-medium">82%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">Live bundler telemetry</h3>
                <p className="text-muted-foreground text-sm">
                  Every wallet event - funding, token purchase, DEX entry is linked into a single cluster. You see the
                  play forming before volume prints the chart.
                </p>
              </div>
            </div>

            {/* Trade Card */}
            <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
              <div className="aspect-square bg-muted/50 rounded-xl p-4">
                <div className="space-y-3">
                  {[
                    { name: "shrimp", token: "PLANETUS", amount: "+ $8.45K", verified: true },
                    { name: "CookerHill", token: "SLM", amount: "+ $1.40K", verified: true },
                    { name: "Bastille", token: "meowcoins", amount: "+ $1.77K", verified: true },
                  ].map((trader, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-muted rounded-full"></div>
                        <span>{trader.name}</span>
                        {trader.verified && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">{trader.token}</span>
                        <span className="text-green-500">{trader.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">Quantified projections</h3>
                <p className="text-muted-foreground text-sm">
                  Remaining bankroll, spend velocity, and estimated upside runway are refreshed second-by-second.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card rounded-lg border border-border">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              onClick={() => setMode("signup")}
            >
              Join Now
            </Button>
         
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/30 backdrop-blur-sm py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                 OpsOnChain
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Real-time blockchain monitoring for advanced traders. Track funding patterns, analyze wallet behaviors,
                and stay ahead of market movements.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="/dashboard"
                    onClick={handleDashboardClick}
                    className="hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                </li> */}
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Connect</h3>
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <Github className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-muted-foreground mb-4 md:mb-0">© 2025 Opsonchain. All rights reserved.</div>
              <div className="flex space-x-6 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
                <Link href="#" className="hover:text-primary transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}








