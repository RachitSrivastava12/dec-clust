

// "use client"

// import type React from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Navigation } from "@/components/navigation"
// import {
//   BarChart3,
//   Twitter,
//   Linkedin,
//   Github,
//   Mail,
//   CheckCircle,
//   ChevronDown,
//   ChevronUp,
//   Activity,
//   TrendingUp,
//   Shield,
//   Zap,
//   Users,                  
//   BarChart,
// } from "lucide-react"
// import { useState, useEffect } from "react"

// export default function HomePage() {
//   const router = useRouter()
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [openFaq, setOpenFaq] = useState<number | null>(null)
//   const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
//   // Signup form state
//   const [mode, setMode] = useState<"signup" | null>(null)
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [solanaAddress, setSolanaAddress] = useState("")
//   const [message, setMessage] = useState("")
//   const [walletDetected, setWalletDetected] = useState(false)

//   // Detect Solana wallet on mount
//   useEffect(() => {
//     if ("solana" in window) {
//       setWalletDetected(true)
//     }
//   }, [])

//   const handleDashboardClick = (e: React.MouseEvent) => {
//     if (!isLoggedIn) {
//       e.preventDefault()
//       alert("Please log in to access the dashboard.")
//       router.push("/#login")
//     }
//   }

//   // Connect Solana Wallet
//   const connectWallet = async () => {
//     if ("solana" in window) {
//       const provider: any = window.solana
//       if (provider.isPhantom) {
//         try {
//           const resp = await provider.connect({ onlyIfTrusted: true }).catch(() => provider.connect())
//           setSolanaAddress(resp.publicKey.toString())
//           setMessage(`✅ Connected wallet: ${resp.publicKey.toString().slice(0, 6)}...`)
//         } catch (err) {
//           setMessage("❌ Wallet connection failed")
//         }
//       } else {
//         setMessage("❌ Unsupported Solana wallet")
//       }
//     } else {
//       setMessage("❌ No Solana wallet detected. Install Phantom or similar.")
//     }
//   }

//   // Handle Signup
//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!email && !solanaAddress) {
//       setMessage("❌ Provide email or connect Solana wallet")
//       return
//     }
//     if (email && !password) {
//       setMessage("❌ Password required for email signup")
//       return
//     }
//     try {
//       const res = await fetch("https://dec-clust-1.onrender.com/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password, solanaAddress }),
//       })
//       const data = await res.json()
//       if (res.ok) {
//         setMessage(`✅ Signed up as ${data.user?.email || data.user?.solana_address}`)
//         setIsLoggedIn(true)
//         localStorage.setItem("isLoggedIn", "true")
//         setMode(null)
//       } else {
//         setMessage(`❌ ${data.error || 'Signup failed'}`)
//       }
//     } catch {
//       setMessage("❌ Error connecting to backend")
//     }
//   }

//   const faqs = [
//     {
//       question: "What is Opsonchain?",
//       answer:
//         "Opsonchain is a real-time Solana on-chain monitoring platform that detects real-time cluster detection and trading patterns.",
//     },
//     {
//       question: "How does Opsonchain work?",
//       answer:
//         "It tracks parent-to-child wallet fundings, bundles, and token activity to give traders early insights.",
//     },
//     {
//       question: "What features does Opsonchain offer?",
//       answer:
//         "Live bundler detection, token load analysis, exit signals, and trading opportunity alerts.",
//     },
//     {
//       question: "Is Opsonchain suitable for beginners?",
//       answer:
//         "Yes, it provides clear insights with simple dashboards designed for all experience levels.",
//     },
//     {
//       question: "What makes Opsonchain different?",
//       answer:
//         "It’s the first Solana on-chain tool offering ultra-fast wallet cluster detection with actionable trading windows.",
//     },
//   ]

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Navigation */}
//       <Navigation setIsLoggedInState={setIsLoggedIn} />

//       {/* Signup Form Modal-like */}
//       {mode === "signup" && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="p-6 max-w-md w-full bg-card rounded-xl shadow-md">
//             <h2 className="text-lg font-bold mb-4">Sign Up</h2>
//             <form onSubmit={handleSignup} className="space-y-3">
//               <input
//                 type="email"
//                 placeholder="Your Email"
//                 className="w-full border rounded p-2 bg-background text-foreground"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//               <input
//                 type="password"
//                 placeholder="Your Password"
//                 className="w-full border rounded p-2 bg-background text-foreground"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <div className="flex items-center space-x-2">
//                 <input
//                   type="text"
//                   placeholder="Solana Address (optional)"
//                   className="flex-1 border rounded p-2 bg-background text-foreground"
//                   value={solanaAddress}
//                   onChange={(e) => setSolanaAddress(e.target.value)}
//                 />
//                 {walletDetected && (
//                   <Button type="button" onClick={connectWallet} className="whitespace-nowrap">
//                     Connect Wallet
//                   </Button>
//                 )}
//               </div>
//               <Button type="submit" className="w-full">
//                 Sign Up
//               </Button>
//             </form>
//             {message && <p className="mt-3 text-sm text-foreground">{message}</p>}
//             <Button variant="ghost" size="sm" onClick={() => setMode(null)} className="mt-3 w-full">
//               Cancel
//             </Button>
//           </div>
//         </div>
//       )}

//       <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//             {/* Left Content */}
//             <div className="space-y-8">
//               <div className="space-y-6">
//                 <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance text-left">
//                   Know when the rug will happen, exit before it does.{" "}
//                 </h1>
//                 <p className="text-lg text-muted-foreground max-w-lg text-pretty">
//                   The first live bundler detector on Solana. Ultra-fast wallet cluster detection that shows you what
//                   token is being pumped, how much SOL is behind it, and when the exit door closes.
//                 </p>
//               </div>

//               {/* Feature List */}
//               <div className="space-y-3">
//                 <div className="flex items-center space-x-3">
//                   <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
//                   <span className="text-foreground">{"First-of-its-kind real-time bundler detection"}</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
//                   <span className="text-foreground">{"On-chain clarity, no rumors"}</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
//                   <span className="text-foreground">{"Predict pumps before they peak"}</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
//                   <span className="text-foreground">{"Exit safely, avoid rugs"}</span>
//                 </div>
//               </div>

//               {/* CTA Buttons */}
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <Button
//                   size="lg"
//                   className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium w-full sm:w-auto"
//                   onClick={() => setMode("signup")}
//                 >
//                   {"👉 Join the early access waitlist"}
//                 </Button>
//                 <div className="flex items-center space-x-2 text-sm text-muted-foreground"></div>
//               </div>
//             </div>

//             {/* Right Dashboard Preview */}
//             <div className="relative">
//               <div className="bg-muted/30 rounded-2xl p-8 border border-border">
//                 <div className="aspect-video bg-card rounded-lg border border-border flex items-center justify-center">
//                   <div className="text-center space-y-4">
//                     <BarChart3 className="h-16 w-16 text-primary mx-auto" />
//                     <div className="space-y-2">
//                       <div className="h-2 bg-muted rounded w-32 mx-auto"></div>
//                       <div className="h-2 bg-muted rounded w-24 mx-auto"></div>
//                       <div className="h-2 bg-muted rounded w-28 mx-auto"></div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Advanced Trading Intelligence features section */}
//           {/* Advanced Trading Intelligence features section */}
// <section className="py-20 px-4 sm:px-6 lg:px-8">
//   <div className="max-w-7xl mx-auto space-y-12">
//     <div className="text-center space-y-4">
//       <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
//         Advanced Trading Intelligence
//       </h2>
//       <p className="text-lg text-muted-foreground text-pretty">
//         Get the insights you need to make informed trading decisions on Solana
//       </p>
//     </div>

//     {/* Features Grid */}
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {/* Real-time Monitoring */}
//       <div className="bg-card rounded-xl p-6 border border-border space-y-4 shadow-none hover:shadow-lg transition-shadow duration-300">
//         <Activity className="h-10 w-10 text-foreground" />
//         <div className="space-y-2">
//           <h3 className="text-xl font-bold text-foreground">Real-time Monitoring</h3>
//           <p className="text-muted-foreground text-sm">
//             Track funding clusters as they form and evolve in real-time
//           </p>
//         </div>
//         <ul className="space-y-2 text-sm text-muted-foreground">
//           <li>• Live cluster detection</li>
//           <li>• 5-second polling intervals</li>
//           <li>• Instant status updates</li>
//         </ul>
//       </div>

//       {/* Pattern Analysis */}
//       <div className="bg-card rounded-xl p-6 border border-border space-y-4 shadow-none hover:shadow-lg transition-shadow duration-300">
//         <TrendingUp className="h-10 w-10 text-foreground" />
//         <div className="space-y-2">
//           <h3 className="text-xl font-bold text-foreground">Pattern Analysis</h3>
//           <p className="text-muted-foreground text-sm">Identify common trading patterns and wallet behaviors</p>
//         </div>
//         <ul className="space-y-2 text-sm text-muted-foreground">
//           <li>• DEX program tracking</li>
//           <li>• Wallet age analysis</li>
//           <li>• Amount pattern detection</li>
//         </ul>
//       </div>

//       {/* Risk Assessment */}
//       <div className="bg-card rounded-xl p-6 border border-border space-y-4 shadow-none hover:shadow-lg transition-shadow duration-300">
//         <Shield className="h-10 w-10 text-foreground" />
//         <div className="space-y-2">
//           <h3 className="text-xl font-bold text-foreground">Risk Assessment</h3>
//           <p className="text-muted-foreground text-sm">
//             Monitor spend rates and remaining balances for risk management
//           </p>
//         </div>
//         <ul className="space-y-2 text-sm text-muted-foreground">
//           <li>• SOL spend rate tracking</li>
//           <li>• Time remaining estimates</li>
//           <li>• Low balance alerts</li>
//         </ul>
//       </div>

//       {/* Fast Detection */}
//       <div className="bg-card rounded-xl p-6 border border-border space-y-4 shadow-none hover:shadow-lg transition-shadow duration-300">
//         <Zap className="h-10 w-10 text-foreground" />
//         <div className="space-y-2">
//           <h3 className="text-xl font-bold text-foreground">Fast Detection</h3>
//           <p className="text-muted-foreground text-sm">
//             Detect activities within 10-second windows with high precision
//           </p>
//         </div>
//         <ul className="space-y-2 text-sm text-muted-foreground">
//           <li>• Minimum 5 children required</li>
//           <li>• 20+ SOL threshold</li>
//           <li>• 10-second detection window</li>
//         </ul>
//       </div>

//       {/* Child Wallet Tracking */}
//       <div className="bg-card rounded-xl p-6 border border-border space-y-4 shadow-none hover:shadow-lg transition-shadow duration-300">
//         <Users className="h-10 w-10 text-foreground" />
//         <div className="space-y-2">
//           <h3 className="text-xl font-bold text-foreground">Child Wallet Tracking</h3>
//           <p className="text-muted-foreground text-sm">View and analyze all child wallets within each cluster</p>
//         </div>
//         <ul className="space-y-2 text-sm text-muted-foreground">
//           <li>• Complete recipient lists</li>
//           <li>• One-click address copying</li>
//           <li>• Cluster relationship mapping</li>
//         </ul>
//       </div>

//       {/* Advanced Filtering */}
//       <div className="bg-card rounded-xl p-6 border border-border space-y-4 shadow-none hover:shadow-lg transition-shadow duration-300">
//         <BarChart className="h-10 w-10 text-foreground" />
//         <div className="space-y-2">
//           <h3 className="text-xl font-bold text-foreground">Advanced Filtering</h3>
//           <p className="text-muted-foreground text-sm">Filter and search clusters by multiple criteria</p>
//         </div>
//         <ul className="space-y-2 text-sm text-muted-foreground">
//           <li>• Status-based filtering</li>
//           <li>• Wallet address search</li>
//           <li>• Custom time ranges</li>
//         </ul>
//       </div>
//     </div>
//   </div>
// </section>

     

      

//       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
//         <div className="max-w-6xl mx-auto text-center space-y-16">
//           <div className="space-y-4">
//             <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">How it works</h2>
//             <p className="text-lg text-muted-foreground text-pretty max-w-3xl mx-auto">
//               While others rely on Twitter rumors and gut feelings, you'll trade with institutional-grade intelligence.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {/* Discover Card */}
//             <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
//               <div className="aspect-square bg-muted/50 rounded-xl flex items-center justify-center">
//                 {/* <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">MEW</div> */}

//                 <img 
//   src="/image.png" 
//   alt="Custom Image" 
//   className="w-full h-full object-cover rounded-xl" 
// />

                
//               </div>
//               <div className="space-y-3">
//                 <h3 className="text-xl font-bold text-foreground">Ultra-fast wallet clustering</h3>
//                 <p className="text-muted-foreground text-sm">
//                   OpsOnchain continuously monitors on-chain data to detect parent wallets funding child wallets in
//                   seconds
//                 </p>
//               </div>
//             </div>

//             {/* Monitor Card */}
//             <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
//               <div className="aspect-square bg-muted/50 rounded-xl p-4">
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs text-muted-foreground">Open</span>
//                     <span className="text-xs text-muted-foreground">1 min ago</span>
//                     <span className="text-xs text-muted-foreground">$3150</span>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
//                     <span className="text-sm font-medium">BUZZ</span>
//                     <span className="text-green-500 text-sm">+ $194.57K</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="space-y-3">
//                 <h3 className="text-xl font-bold text-foreground">On-chain only</h3>
//                 <p className="text-muted-foreground text-sm">
//                   Direct Solana RPC ingestion with no third-party feeds. 100% transparent, 100% real-time.
//                 </p>
//               </div>
//             </div>

//             {/* Analyze Card */}
//             <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
//               <div className="aspect-square bg-muted/50 rounded-xl p-4 flex flex-col justify-center">
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between text-xs">
//                     <span className="text-muted-foreground">Risk Score</span>
//                     <span className="text-green-500 font-medium">Low</span>
//                   </div>
//                   <div className="w-full bg-muted rounded-full h-2">
//                     <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
//                   </div>
//                   <div className="flex items-center justify-between text-xs pt-2">
//                     <span className="text-muted-foreground">Wallet Age</span>
//                     <span className="text-foreground font-medium">45 days</span>
//                   </div>
//                   <div className="flex items-center justify-between text-xs">
//                     <span className="text-muted-foreground">Success Rate</span>
//                     <span className="text-foreground font-medium">82%</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="space-y-3">
//                 <h3 className="text-xl font-bold text-foreground">Live bundler telemetry</h3>
//                 <p className="text-muted-foreground text-sm">
//                   Every wallet event - funding, token purchase, DEX entry is linked into a single cluster. You see the
//                   play forming before volume prints the chart.
//                 </p>
//               </div>
//             </div>

//             {/* Trade Card */}
//             <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
//               <div className="aspect-square bg-muted/50 rounded-xl p-4">
//                 <div className="space-y-3">
//                   {[
//                     { name: "shrimp", token: "PLANETUS", amount: "+ $8.45K", verified: true },
//                     { name: "CookerHill", token: "SLM", amount: "+ $1.40K", verified: true },
//                     { name: "Bastille", token: "meowcoins", amount: "+ $1.77K", verified: true },
//                   ].map((trader, i) => (
//                     <div key={i} className="flex items-center justify-between text-xs">
//                       <div className="flex items-center space-x-2">
//                         <div className="w-4 h-4 bg-muted rounded-full"></div>
//                         <span>{trader.name}</span>
//                         {trader.verified && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <span className="text-muted-foreground">{trader.token}</span>
//                         <span className="text-green-500">{trader.amount}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div className="space-y-3">
//                 <h3 className="text-xl font-bold text-foreground">Quantified projections</h3>
//                 <p className="text-muted-foreground text-sm">
//                   Remaining bankroll, spend velocity, and estimated upside runway are refreshed second-by-second.
//                 </p>
//               </div>
//             </div>
//           </div>

//         </div>
//       </section>

//       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
//         <div className="max-w-4xl mx-auto space-y-16">
//           <div className="text-center space-y-4">
//             <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">Frequently Asked Questions</h2>
//           </div>

//           <div className="space-y-4">
//             {faqs.map((faq, index) => (
//               <div key={index} className="bg-card rounded-lg border border-border">
//                 <button
//                   onClick={() => setOpenFaq(openFaq === index ? null : index)}
//                   className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
//                 >
//                   <span className="font-medium text-foreground">{faq.question}</span>
//                   {openFaq === index ? (
//                     <ChevronUp className="h-5 w-5 text-muted-foreground" />
//                   ) : (
//                     <ChevronDown className="h-5 w-5 text-muted-foreground" />
//                   )}
//                 </button>
//                 {openFaq === index && (
//                   <div className="px-6 pb-4">
//                     <p className="text-muted-foreground">{faq.answer}</p>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           <div className="text-center space-y-4">
//             <Button
//               size="lg"
//               className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
//               onClick={() => setMode("signup")}
//             >
//               Join Now
//             </Button>
         
//           </div>
//         </div>
//       </section>

//       <footer className="border-t border-border bg-card/30 backdrop-blur-sm py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
//             {/* Brand Section */}
//             <div className="md:col-span-2">
//               <div className="flex items-center space-x-3 mb-4">
//                 <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                  OpsOnChain
//                 </span>
//               </div>
//               <p className="text-sm text-muted-foreground max-w-md">
//                 Real-time blockchain monitoring for advanced traders. Track funding patterns, analyze wallet behaviors,
//                 and stay ahead of market movements.
//               </p>
//             </div>

//             {/* Quick Links */}
//             <div>
//               <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
//               <ul className="space-y-2 text-sm text-muted-foreground">
//                 <li>
//                   <Link href="/" className="hover:text-primary transition-colors">
//                     Home
//                   </Link>
//                 </li>
//                 {/* <li>
//                   <Link
//                     href="/dashboard"
//                     onClick={handleDashboardClick}
//                     className="hover:text-primary transition-colors"
//                   >
//                     Dashboard
//                   </Link>
//                 </li> */}
//                 <li>
//                   <Link href="#" className="hover:text-primary transition-colors">
//                     About Us
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="hover:text-primary transition-colors">
//                     Documentation
//                   </Link>
//                 </li>
//               </ul>
//             </div>

//             {/* Social Links */}
//             <div>
//               <h3 className="font-semibold text-foreground mb-4">Connect</h3>
//               <div className="flex space-x-3">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="p-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
//                 >
//                   <Twitter className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="p-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
//                 >
//                   <Linkedin className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="p-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
//                 >
//                   <Github className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="p-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
//                 >
//                   <Mail className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </div>

//           {/* Bottom Bar */}
//           <div className="border-t border-border pt-8">
//             <div className="flex flex-col md:flex-row justify-between items-center">
//               <div className="text-sm text-muted-foreground mb-4 md:mb-0">© 2025 Opsonchain. All rights reserved.</div>
//               <div className="flex space-x-6 text-sm text-muted-foreground">
//                 <Link href="#" className="hover:text-primary transition-colors">
//                   Privacy Policy
//                 </Link>
//                 <Link href="#" className="hover:text-primary transition-colors">
//                   Terms of Service
//                 </Link>
//                 <Link href="#" className="hover:text-primary transition-colors">
//                   Support
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }











"use client"

import { useEffect, useState } from "react"
import { Activity, Database, TrendingUp, Wallet, Filter, Download, RefreshCw, Search, X } from "lucide-react"

interface Cluster {
  funding_wallet: string
  recipients: string[]
  token_mints: string[]
  fan_out_slot: number
  buy_slots: number[]
  common_patterns: {
    amounts: string
    wallet_age: string
    dex_programs: string[]
  }
  total_sol_funded: number
  total_sol_remaining: number
  spend_rate_sol_per_min: number | null
  time_remaining_sec: number | null
  last_update: number
  cluster_age_sec: number
  children_count: number
  created_at: number
  status: "active" | "forming"
}

interface ApiResponse {
  clusters: Cluster[]
  metadata: {
    total_active: number
    total_tracked: number
    timestamp: string
    requirements: {
      min_children: number
      min_total_sol: number
      min_transfer_sol: number
      detection_window_sec: number
      data_retention_min: number
    }
  }
}












function ClusterDetail({ cluster, onClose }: { cluster: Cluster, onClose: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const funded = cluster.total_sol_funded;
  const remaining = cluster.total_sol_remaining;
  const spent = funded - remaining;
  const percentComplete = funded > 0 ? (spent / funded) * 100 : 0;
  const estMin = cluster.time_remaining_sec !== null ? Math.floor(cluster.time_remaining_sec / 60) : 0;
  const estSec = cluster.time_remaining_sec !== null ? cluster.time_remaining_sec % 60 : 0;
  const estTime = cluster.time_remaining_sec !== null ? `${estMin}m ${estSec}s remaining` : 'N/A';
  const activeCount = cluster.children_count;
  const dexUsed = cluster.common_patterns.dex_programs.join(' / ') || 'N/A';

  const childrenToShow = cluster.recipients.slice(0, 5);
  const tokenMintsToShow = cluster.token_mints.slice(0, 5);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("Address copied to clipboard"))
      .catch((err) => {
        console.error("Failed to copy:", err)
        showToast("Failed to copy to clipboard")
      })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-card rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-border" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Cluster Details</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Funding Overview - now true full width */}
            <div className="rounded-lg bg-muted/30 p-4 shadow w-full border border-border">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Funding Overview</h3>
              <div className="flex justify-between mb-1 text-foreground">
                <span>Total SOL Funded</span>
                <span className="font-bold">{funded.toFixed(1)} SOL</span>
              </div>
              <div className="flex justify-between mb-1 text-foreground">
                <span>SOL Spent</span>
                <span className="font-bold">{spent.toFixed(1)} SOL</span>
              </div>
              <div className="flex justify-between mb-2 text-foreground">
                <span>SOL Remaining</span>
                <span className="font-bold text-yellow-500">{remaining.toFixed(1)} SOL</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-1">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${percentComplete}%` }}></div>
              </div>
              <div className="text-sm text-muted-foreground mb-1">{Math.round(percentComplete)}% Complete</div>
              <div className="text-sm text-muted-foreground">Est. {estTime}</div>
            </div>

            {/* Quick Stats + Child Wallets side by side on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quick Stats */}
              <div className="rounded-lg bg-muted/30 p-4 shadow w-full border border-border">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-foreground">
                  <div>Active Wallets</div>
                  <div className="font-bold">
                    <div className="flex items-center justify-between">
                      <span>{activeCount} / {cluster.children_count}</span>
                      <button onClick={() => setDialogOpen(true)} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90">View</button>
                    </div>
                  </div>
                  <div>Token mint</div>
                  <div className="font-bold">
                    {tokenMintsToShow.length > 0 ? (
                      tokenMintsToShow.map((mint, i) => (
                        <div key={i} className="flex items-center mb-2 justify-between">
                          <span className="font-mono">{mint.slice(0, 3) + "..." + mint.slice(-3)}</span>
                          <button onClick={() => copyToClipboard(mint)} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90">Copy</button>
                        </div>
                      ))
                    ) : (
                      'N/A'
                    )}
                  </div>
                  <div>DEX Used</div>
                  <div className="font-bold">{dexUsed}</div>
                </div>
              </div>

              {/* Child Wallets */}
              <div className="rounded-lg bg-muted/30 p-4 shadow w-full border border-border">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Child Wallets Activity</h3>
                {childrenToShow.map((addr, i) => {
                  const abbr = addr.slice(0, 3) + "..." + addr.slice(-3);
                  return (
                    <div key={i} className="flex items-center mb-2 justify-between text-foreground">
                      <div className="font-mono">{abbr}</div>
                      <button onClick={() => copyToClipboard(addr)} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90">Copy</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setDialogOpen(false)}>
          <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">Active Child Wallets</h3>
              <button onClick={() => setDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-2">
              {cluster.recipients.map((addr, i) => (
                <div key={i} className="flex items-center justify-between p-3 border-b border-border hover:bg-muted/50">
                  <div className="font-mono text-sm truncate max-w-xs text-foreground">{addr}</div>
                  <button onClick={() => copyToClipboard(addr)} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90 flex-shrink-0">Copy</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-foreground text-background px-6 py-3 rounded-lg shadow-lg z-[70]">
          {toastMessage}
        </div>
      )}
    </>
  );
}















export function ClusterDashboard() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "forming">("all")
  const [isPolling, setIsPolling] = useState(false)
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected")
  const [sortBy, setSortBy] = useState<
    "total_sol_funded" | "total_sol_remaining" | "children_count" | "cluster_age_sec"
  >("total_sol_funded")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [minSolFilter, setMinSolFilter] = useState<string>("")
  const [minChildrenFilter, setMinChildrenFilter] = useState<string>("")
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const API_BASE = "https://dec-clust-1.onrender.com"

  const fetchData = async () => {
    try {
      setConnectionStatus("connecting")
      console.log("[v0] Attempting to fetch data from:", `${API_BASE}/clusters`)

      const response = await fetch(`${API_BASE}/clusters`)
      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const json: ApiResponse = await response.json()
      console.log("[v0] Successfully fetched data:", json)

      setData(json)
      setLoading(false)
      setError(null)
      setConnectionStatus("connected")
      setLastUpdateTime(new Date())
    } catch (err) {
      console.error("[v0] Fetch error:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(`Connection failed: ${errorMessage}`)
      setLoading(false)
      setConnectionStatus("disconnected")
      showToast(`Unable to connect to API: ${errorMessage}`)
    }
  }

  const startPolling = async () => {
    if (!isPolling) {
      await fetchData()
      const interval = setInterval(fetchData, 5000)
      setPollInterval(interval)
      setIsPolling(true)
      showToast("Real-time monitoring is now active")
    }
  }

  const stopPolling = async () => {
    if (isPolling) {
      if (pollInterval) {
        clearInterval(pollInterval)
        setPollInterval(null)
      }
      try {
        const response = await fetch(`${API_BASE}/stop-polling`, {
          method: "POST",
        })
        if (!response.ok) {
          throw new Error("Failed to stop backend polling")
        }
        showToast("Real-time monitoring has been paused")
      } catch (err) {
        console.error("Error stopping backend polling:", err)
        setError("Failed to stop backend polling")
      }
      setIsPolling(false)
    }
  }

  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [pollInterval])

  const toggleExpand = (cluster: Cluster) => {
    setSelectedCluster(cluster)
  };

  const closeClusterDetail = () => {
    setSelectedCluster(null)
  }

  const filteredAndSortedClusters =
    data?.clusters
      .filter((cluster) => {
        const matchesSearch = cluster.funding_wallet.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || cluster.status === statusFilter
        const matchesMinSol = !minSolFilter || cluster.total_sol_remaining >= Number.parseFloat(minSolFilter)
        const matchesMinChildren = !minChildrenFilter || cluster.children_count >= Number.parseInt(minChildrenFilter)
        return matchesSearch && matchesStatus && matchesMinSol && matchesMinChildren
      })
      .sort((a, b) => {
        const aValue = a[sortBy]
        const bValue = b[sortBy]
        const multiplier = sortOrder === "desc" ? -1 : 1
        return (aValue > bValue ? 1 : -1) * multiplier
      }) || []

  const exportToCSV = () => {
    if (!filteredAndSortedClusters.length) {
      showToast("No clusters to export")
      return
    }

    const headers = [
      "Funding Wallet",
      "Children Count",
      "Total SOL Funded",
      "Remaining SOL",
      "Spend Rate (SOL/min)",
      "Time Remaining (sec)",
      "Status",
      "Age (sec)",
      "Token Mints",
      "DEX Programs",
    ]

    const csvContent = [
      headers.join(","),
      ...filteredAndSortedClusters.map((cluster) =>
        [
          cluster.funding_wallet,
          cluster.children_count,
          cluster.total_sol_funded.toFixed(2),
          cluster.total_sol_remaining.toFixed(2),
          cluster.spend_rate_sol_per_min?.toFixed(2) ?? "N/A",
          cluster.time_remaining_sec ?? "N/A",
          cluster.status,
          cluster.cluster_age_sec,
          `"${cluster.token_mints.join(", ")}"`,
          `"${cluster.common_patterns.dex_programs.join(", ")}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `solana-clusters-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    showToast("Cluster data exported to CSV")
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setMinSolFilter("")
    setMinChildrenFilter("")
    setSortBy("total_sol_funded")
    setSortOrder("desc")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("Address copied to clipboard"))
      .catch((err) => {
        console.error("Failed to copy:", err)
        showToast("Failed to copy to clipboard")
      })
  }

  const summaryStats = {
    totalClusters: filteredAndSortedClusters.length,
    totalSolFunded: filteredAndSortedClusters.reduce((sum, cluster) => sum + cluster.total_sol_funded, 0),
    totalSolRemaining: filteredAndSortedClusters.reduce((sum, cluster) => sum + cluster.total_sol_remaining, 0),
    averageChildren:
      filteredAndSortedClusters.length > 0
        ? filteredAndSortedClusters.reduce((sum, cluster) => sum + cluster.children_count, 0) /
          filteredAndSortedClusters.length
        : 0,
    activeClusters: filteredAndSortedClusters.filter((c) => c.status === "active").length,
    formingClusters: filteredAndSortedClusters.filter((c) => c.status === "forming").length,
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {selectedCluster && <ClusterDetail cluster={selectedCluster} onClose={closeClusterDetail} />}
        
        {/* Header Section */}
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-lg">
                <Database className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Solana Funding Clusters
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Real-time monitoring dashboard
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                connectionStatus === "connected" 
                  ? "bg-green-500/10 text-green-600" 
                  : connectionStatus === "connecting"
                  ? "bg-yellow-500/10 text-yellow-600"
                  : "bg-red-500/10 text-red-600"
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected" ? "bg-green-500 animate-pulse" : 
                  connectionStatus === "connecting" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
                }`} />
                <span className="text-sm font-medium capitalize">{connectionStatus}</span>
              </div>
              
              {isPolling && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Live</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-primary" />
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">Active</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{summaryStats.activeClusters}</div>
              <div className="text-xs text-muted-foreground mt-1">Active Clusters</div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">{summaryStats.totalClusters}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {summaryStats.totalSolFunded.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total SOL Funded</div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">SOL</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {summaryStats.totalSolRemaining.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">SOL Remaining</div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-primary" />
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">Avg</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {summaryStats.averageChildren.toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Avg Children</div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="mt-4 text-xs text-muted-foreground text-center">
            Last Updated: {lastUpdateTime?.toLocaleString() || new Date(data?.metadata.timestamp || "").toLocaleString()}
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Funding Wallet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 h-11 bg-muted/50 border border-border rounded-lg px-4 text-foreground"
              />
            </div>

            {/* Status Filter */}
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "forming")}
              className="w-full lg:w-48 h-11 bg-muted/50 border border-border rounded-lg px-4 text-foreground"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="forming">Forming Only</option>
            </select>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="h-11 px-4 border border-border rounded-lg hover:bg-muted/50 flex items-center gap-2 text-foreground"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              
              <button
                onClick={exportToCSV}
                className="h-11 px-4 border border-border rounded-lg hover:bg-muted/50 flex items-center gap-2 text-foreground"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={startPolling}
                disabled={isPolling}
                className={`h-11 px-6 rounded-lg flex items-center gap-2 ${
                  isPolling
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                Start
              </button>

              <button
                onClick={stopPolling}
                disabled={!isPolling}
                className={`h-11 px-6 rounded-lg ${
                  !isPolling
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                Stop
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Advanced Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Min SOL Remaining
                  </label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={minSolFilter}
                    onChange={(e) => setMinSolFilter(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Min Children
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minChildrenFilter}
                    onChange={(e) => setMinChildrenFilter(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Sort By
                  </label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                  >
                    <option value="total_sol_funded">Total SOL Funded</option>
                    <option value="total_sol_remaining">SOL Remaining</option>
                    <option value="children_count">Children Count</option>
                    <option value="cluster_age_sec">Cluster Age</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-card rounded-lg shadow-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary">
                  <th className="p-3 text-left font-semibold text-primary-foreground text-sm">Funding Wallet</th>
                  <th className="p-3 text-left font-semibold text-primary-foreground text-sm">Children</th>
                  <th className="p-3 text-left font-semibold text-primary-foreground text-sm">Total Funded</th>
                  <th className="p-3 text-left font-semibold text-primary-foreground text-sm">Remaining</th>
                  <th className="p-3 text-left font-semibold text-primary-foreground text-sm">Spend Rate</th>
                  <th className="p-3 text-left font-semibold text-primary-foreground text-sm">Time Left</th>
                  <th className="p-3 text-left font-semibold text-primary-foreground text-sm">Token Mints</th>
                  <th className="p-3 text-left font-semibold text-primary-foreground text-sm">DEX Programs</th>
                  <th className="p-3 text-left font-semibold text-primary-foreground text-sm">Fan Out</th>
                  <th className="p-3 text-left font-semibold text-primary-foreground text-sm">Status</th>
                  <th className="p-3 text-left font-semibold text-primary-foreground text-sm">Age</th>
                  <th className="p-3 text-left font-semibold text-primary-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedClusters.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Database className="w-12 h-12 text-muted-foreground" />
                        <div className="text-muted-foreground font-medium">No clusters match your filters</div>
                        <button onClick={clearFilters} className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 text-sm text-foreground">
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedClusters.map((cluster, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-muted/30 transition-colors border-b border-border"
                    >
                      <td className="p-3 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">
                            {cluster.funding_wallet.slice(0, 4)}...{cluster.funding_wallet.slice(-4)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(cluster.funding_wallet)}
                            className="text-muted-foreground hover:text-foreground p-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-muted px-2 py-1 rounded text-xs font-semibold text-foreground">
                          {cluster.children_count}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-foreground text-sm">
                        {cluster.total_sol_funded.toFixed(2)} SOL
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm ${
                            cluster.total_sol_remaining < 1 
                              ? "text-red-600" 
                              : cluster.total_sol_remaining < 5
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}>
                            {cluster.total_sol_remaining.toFixed(2)} SOL
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-foreground text-sm">
                        {cluster.spend_rate_sol_per_min?.toFixed(2) ?? "N/A"} SOL/min
                      </td>
                      <td className="p-3 text-foreground text-sm">
                        {cluster.time_remaining_sec 
                          ? `${Math.floor(cluster.time_remaining_sec / 60)}m ${cluster.time_remaining_sec % 60}s`
                          : "N/A"
                        }
                      </td>
                      <td className="p-3 max-w-xs truncate text-xs text-muted-foreground">
                        {cluster.token_mints.length > 0 ? cluster.token_mints.slice(0, 2).join(", ") : "None"}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {cluster.common_patterns.dex_programs.join(", ") || "None"}
                      </td>
                      <td className="p-3 text-foreground text-sm">
                        {cluster.fan_out_slot}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          cluster.status === "active" 
                            ? "bg-green-500/10 text-green-600" 
                            : "bg-yellow-500/10 text-yellow-600"
                        }`}>
                          {cluster.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-foreground text-sm">
                        {Math.floor(cluster.cluster_age_sec / 60)}m
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleExpand(cluster)}
                          className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-foreground text-background px-6 py-3 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}
    </div>
  )
}



