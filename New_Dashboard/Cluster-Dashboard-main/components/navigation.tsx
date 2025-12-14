
// // "use client"

// // import Link from "next/link"
// // import { usePathname, useRouter } from "next/navigation"
// // import { Button } from "@/components/ui/button"
// // import { ThemeToggle } from "@/components/theme-toggle"
// // import { BarChart3, Home, Menu, X, LogIn, LogOut, UserPlus } from "lucide-react"
// // import { useState, useEffect } from "react"
// // import { cn } from "@/lib/utils"

// // export function Navigation({ setIsLoggedInState }: { setIsLoggedInState?: (isLoggedIn: boolean) => void }) {
// //   const pathname = usePathname()
// //   const router = useRouter()
// //   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
// //   const [isLoggedIn, setIsLoggedIn] = useState(false)

// //   // auth form state
// //   const [email, setEmail] = useState("")
// //   const [password, setPassword] = useState("")
// //   const [solanaAddress, setSolanaAddress] = useState("")
// //   const [message, setMessage] = useState("")
// //   const [mode, setMode] = useState<"login" | "signup" | null>(null) // which form is active
// //   const [walletDetected, setWalletDetected] = useState(false)

// //   // 🔹 Detect Solana wallet on mount
// //   useEffect(() => {
// //     if ('solana' in window) {
// //       setWalletDetected(true)
// //     }
// //   }, [])

// //   // 🔹 Check session on mount using localStorage first
// //   useEffect(() => {
// //     const storedIsLoggedIn = localStorage.getItem("isLoggedIn")
// //     if (storedIsLoggedIn === "true") {
// //       setIsLoggedIn(true)
// //       if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
// //     } else {
// //       // Fallback to API check if no localStorage data
// //       const checkSession = async () => {
// //         try {
// //           const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/me", { credentials: "include" })
// //           const loggedIn = res.ok
// //           setIsLoggedIn(loggedIn)
// //           if (setIsLoggedInState) setIsLoggedInState(loggedIn) // Only call if prop exists
// //           if (loggedIn) {
// //             localStorage.setItem("isLoggedIn", "true")
// //           } else {
// //             localStorage.removeItem("isLoggedIn")
// //           }
// //         } catch {
// //           setIsLoggedIn(false)
// //           if (setIsLoggedInState) setIsLoggedInState(false) // Only call if prop exists
// //           localStorage.removeItem("isLoggedIn")
// //         }
// //       }
// //       checkSession()
// //     }
// //   }, [setIsLoggedInState])

// //   const handleLogout = async () => {
// //     await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/logout", {
// //       method: "POST",
// //       credentials: "include"
// //     })
// //     setIsLoggedIn(false)
// //     if (setIsLoggedInState) setIsLoggedInState(false) // Only call if prop exists
// //     localStorage.removeItem("isLoggedIn")
// //     setMode(null)
// //     router.push("/")
// //   }

// //   // 🔹 Connect Solana Wallet
// //   const connectWallet = async () => {
// //     if ('solana' in window) {
// //       const provider: any = window.solana
// //       if (provider.isPhantom) {
// //         try {
// //           const resp = await provider.connect({ onlyIfTrusted: true }).catch(() => provider.connect())
// //           setSolanaAddress(resp.publicKey.toString())
// //           setMessage(`✅ Connected wallet: ${resp.publicKey.toString().slice(0, 6)}...`)
// //         } catch (err) {
// //           setMessage('❌ Wallet connection failed')
// //         }
// //       } else {
// //         setMessage('❌ Unsupported Solana wallet')
// //       }
// //     } else {
// //       setMessage('❌ No Solana wallet detected. Install Phantom or similar.')
// //     }
// //   }

// //   // 🔹 Handle Signup
// //   const handleSignup = async (e: any) => {
// //     e.preventDefault()
// //     if (!email && !solanaAddress) {
// //       setMessage('❌ Provide email or connect Solana wallet')
// //       return
// //     }
// //     if (email && !password) {
// //       setMessage('❌ Password required for email signup')
// //       return
// //     }
// //     try {
// //       const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/signup", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         credentials: "include",
// //         body: JSON.stringify({ email, password, solanaAddress }),
// //       })
// //       const data = await res.json()
// //       if (res.ok) {
// //         setMessage(`✅ Signed up as ${data.user.email || data.user.solana_address}`)
// //         setIsLoggedIn(true)
// //         if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
// //         localStorage.setItem("isLoggedIn", "true")
// //         setMode(null)
// //       } else {
// //         setMessage(`❌ ${data.error}`)
// //       }
// //     } catch {
// //       setMessage("❌ Error connecting to backend")
// //     }
// //   }

// //   // 🔹 Handle Login
// //   const handleLogin = async (e: any) => {
// //     e.preventDefault()
// //     if (!email && !solanaAddress) {
// //       setMessage('❌ Provide email or connect Solana wallet')
// //       return
// //     }
// //     if (email && !password) {
// //       setMessage('❌ Password required for email login')
// //       return
// //     }
// //     try {
// //       const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/login", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         credentials: "include",
// //         body: JSON.stringify({ email, password, solanaAddress }),
// //       })
// //       const data = await res.json()
// //       if (res.ok) {
// //         setMessage(`✅ Logged in as ${data.user.email || data.user.solana_address}`)
// //         setIsLoggedIn(true)
// //         if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
// //         localStorage.setItem("isLoggedIn", "true")
// //         setMode(null)
// //       } else {
// //         setMessage(`❌ ${data.error}`)
// //       }
// //     } catch {
// //       setMessage("❌ Error connecting to backend")
// //     }
// //   }

// //   // 🔹 Handle Home Click to close forms and navigate
// //   const handleHomeClick = () => {
// //     setMode(null) // Close signup/login form
// //   }

// //   const navItems = [
// //     { name: "Home", href: "/", icon: Home, current: pathname === "/", onClick: handleHomeClick },
// //     ...(isLoggedIn
// //       ? [{ name: "Dashboard", href: "/dashboard", icon: BarChart3, current: pathname === "/dashboard" }]
// //       : []),
// //   ]

// //   return (
// //     <>
// //       <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //           <div className="flex justify-between items-center h-16">
// //             {/* Logo */}
// //             <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300 group">
// //               <div className="relative">
// //                 <svg
// //                   className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300"
// //                   viewBox="0 0 397.7 311.7"
// //                   fill="currentColor"
// //                 >
// //                   <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 237.9z" />
// //                   <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1L333.1 73.8c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
// //                   <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
// //                 </svg>
// //                 <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:bg-primary/30 transition-all duration-300"></div>
// //               </div>
// //               <div className="flex flex-col">
// //                 <span className="text-xl font-bold text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text hover:text-transparent transition-all duration-300">
// //                   Solana
// //                 </span>
// //                 <span className="text-sm font-medium text-muted-foreground -mt-1">Watch</span>
// //               </div>
// //             </Link>

// //             {/* Desktop Navigation */}
// //             <div className="hidden md:flex items-center space-x-6">
// //               {navItems.map((item) => {
// //                 const Icon = item.icon
// //                 return (
// //                   <Link key={item.name} href={item.href} onClick={item.onClick}>
// //                     <Button
// //                       variant={item.current ? "default" : "ghost"}
// //                       size="sm"
// //                       className={cn("flex items-center space-x-2", item.current && "bg-primary text-primary-foreground")}
// //                     >
// //                       <Icon className="h-4 w-4" />
// //                       <span>{item.name}</span>
// //                     </Button>
// //                   </Link>
// //                 )
// //               })}

// //               {isLoggedIn ? (
// //                 <Button onClick={handleLogout} variant="ghost" size="sm" className="flex items-center space-x-2">
// //                   <LogOut className="h-4 w-4" />
// //                   <span>Logout</span>
// //                 </Button>
// //               ) : (
// //                 <>
// //                   <Button onClick={() => setMode("login")} variant="ghost" size="sm" className="flex items-center space-x-2">
// //                     <LogIn className="h-4 w-4" />
// //                     <span>Login</span>
// //                   </Button>
// //                   <Button onClick={() => setMode("signup")} variant="ghost" size="sm" className="flex items-center space-x-2">
// //                     <UserPlus className="h-4 w-4" />
// //                     <span>Sign Up</span>
// //                   </Button>
// //                 </>
// //               )}

// //               <ThemeToggle />
// //             </div>

// //             {/* Mobile menu button */}
// //             <div className="md:hidden flex items-center space-x-2">
// //               <ThemeToggle />
// //               <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
// //                 {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
// //               </Button>
// //             </div>
// //           </div>
// //         </div>
// //       </nav>

// //       {/* Auth Forms Modal-like */}
// //       {mode && (
// //         <div className="p-6 max-w-md mx-auto bg-card rounded-xl shadow-md mt-6">
// //           <h2 className="text-lg font-bold mb-4">{mode === "login" ? "Login" : "Sign Up"}</h2>
// //           <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-3">
// //             <input
// //               type="email"
// //               placeholder="Email (optional if using wallet)"
// //               className="w-full border rounded p-2"
// //               value={email}
// //               onChange={(e) => setEmail(e.target.value)}
// //             />
// //             <input
// //               type="password"
// //               placeholder="Password (required if using email)"
// //               className="w-full border rounded p-2"
// //               value={password}
// //               onChange={(e) => setPassword(e.target.value)}
// //             />
// //             <div className="flex items-center space-x-2">
// //               <input
// //                 type="text"
// //                 placeholder="Solana Address (optional)"
// //                 className="flex-1 border rounded p-2"
// //                 value={solanaAddress}
// //                 onChange={(e) => setSolanaAddress(e.target.value)}
// //               />
// //               {walletDetected && (
// //                 <Button type="button" onClick={connectWallet} className="whitespace-nowrap">
// //                   Connect Wallet
// //                 </Button>
// //               )}
// //             </div>
// //             <Button type="submit" className="w-full">{mode === "login" ? "Login" : "Sign Up"}</Button>
// //           </form>
// //           {message && <p className="mt-3 text-sm">{message}</p>}
// //           <Button variant="ghost" size="sm" onClick={() => setMode(null)} className="mt-3 w-full">
// //             Cancel
// //           </Button>
// //         </div>
// //       )}
// //     </>
// //   )
// // }






















// "use client"

// import Link from "next/link"
// import { usePathname, useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { ThemeToggle } from "@/components/theme-toggle"
// import { Menu, X, LogIn, LogOut } from "lucide-react"
// import { useState, useEffect } from "react"

// export function Navigation({ setIsLoggedInState }: { setIsLoggedInState?: (isLoggedIn: boolean) => void }) {
//   const pathname = usePathname()
//   const router = useRouter()
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
//   const [isLoggedIn, setIsLoggedIn] = useState(false)

//   // auth form state
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [solanaAddress, setSolanaAddress] = useState("")
//   const [message, setMessage] = useState("")
//   const [mode, setMode] = useState<"login" | "signup" | null>(null) // which form is active
//   const [walletDetected, setWalletDetected] = useState(false)

//   // 🔹 Detect Solana wallet on mount
//   useEffect(() => {
//     if ("solana" in window) {
//       setWalletDetected(true)
//     }
//   }, [])

//   // 🔹 Check session on mount using localStorage first
//   useEffect(() => {
//     const storedIsLoggedIn = localStorage.getItem("isLoggedIn")
//     if (storedIsLoggedIn === "true") {
//       setIsLoggedIn(true)
//       if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
//     } else {
//       // Fallback to API check if no localStorage data
//       const checkSession = async () => {
//         try {
//           const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/me", {
//             credentials: "include",
//           })
//           const loggedIn = res.ok
//           setIsLoggedIn(loggedIn)
//           if (setIsLoggedInState) setIsLoggedInState(loggedIn) // Only call if prop exists
//           if (loggedIn) {
//             localStorage.setItem("isLoggedIn", "true")
//           } else {
//             localStorage.removeItem("isLoggedIn")
//           }
//         } catch {
//           setIsLoggedIn(false)
//           if (setIsLoggedInState) setIsLoggedInState(false) // Only call if prop exists
//           localStorage.removeItem("isLoggedIn")
//         }
//       }
//       checkSession()
//     }
//   }, [setIsLoggedInState])

//   const handleLogout = async () => {
//     await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/logout", {
//       method: "POST",
//       credentials: "include",
//     })
//     setIsLoggedIn(false)
//     if (setIsLoggedInState) setIsLoggedInState(false) // Only call if prop exists
//     localStorage.removeItem("isLoggedIn")
//     setMode(null)
//     router.push("/")
//   }

//   // 🔹 Connect Solana Wallet
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

//   // 🔹 Handle Signup
//   const handleSignup = async (e: any) => {
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
//       const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password, solanaAddress }),
//       })
//       const data = await res.json()
//       if (res.ok) {
//         setMessage(`✅ Signed up as ${data.user.email || data.user.solana_address}`)
//         setIsLoggedIn(true)
//         if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
//         localStorage.setItem("isLoggedIn", "true")
//         setMode(null)
//       } else {
//         setMessage(`❌ ${data.error}`)
//       }
//     } catch {
//       setMessage("❌ Error connecting to backend")
//     }
//   }

//   // 🔹 Handle Login
//   const handleLogin = async (e: any) => {
//     e.preventDefault()
//     if (!email && !solanaAddress) {
//       setMessage("❌ Provide email or connect Solana wallet")
//       return
//     }
//     if (email && !password) {
//       setMessage("❌ Password required for email login")
//       return
//     }
//     try {
//       const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password, solanaAddress }),
//       })
//       const data = await res.json()
//       if (res.ok) {
//         setMessage(`✅ Logged in as ${data.user.email || data.user.solana_address}`)
//         setIsLoggedIn(true)
//         if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
//         localStorage.setItem("isLoggedIn", "true")
//         setMode(null)
//       } else {
//         setMessage(`❌ ${data.error}`)
//       }
//     } catch {
//       setMessage("❌ Error connecting to backend")
//     }
//   }

//   // 🔹 Handle Home Click to close forms and navigate
//   const handleHomeClick = () => {
//     setMode(null) // Close signup/login form
//   }

//   const navItems = [
//     { name: "Products", href: "#", current: false },
//     { name: "Tools", href: "#", current: false },
//     { name: "Pricing", href: "#", current: false },
//     { name: "Support", href: "#", current: false },
//   ]

//   return (
//     <>
//       <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
//               <span className="text-xl font-medium text-foreground">Opsonchain</span>
//             </Link>

//             <div className="hidden md:flex items-center space-x-8">
//               {navItems.map((item) => (
//                 <Link key={item.name} href={item.href}>
//                   <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
//                     {item.name}
//                   </span>
//                 </Link>
//               ))}

//               {isLoggedIn ? (
//                 <div className="flex items-center space-x-4">
//                   <Link href="/dashboard">
//                     <Button variant="default" size="sm">
//                       Open App
//                     </Button>
//                   </Link>
//                   <Button onClick={handleLogout} variant="ghost" size="sm">
//                     <LogOut className="h-4 w-4" />
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="flex items-center space-x-4">
//                   <Button onClick={() => setMode("login")} variant="ghost" size="sm">
//                     <LogIn className="h-4 w-4 mr-2" />
//                     Login
//                   </Button>
//                   <Button onClick={() => setMode("signup")} variant="default" size="sm">
//                     Open App
//                   </Button>
//                 </div>
//               )}

//               <ThemeToggle />
//             </div>

//             {/* Mobile menu button */}
//             <div className="md:hidden flex items-center space-x-2">
//               <ThemeToggle />
//               <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
//                 {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {mobileMenuOpen && (
//           <div className="md:hidden border-t border-border bg-background">
//             <div className="px-4 py-4 space-y-4">
//               {navItems.map((item) => (
//                 <Link key={item.name} href={item.href}>
//                   <div className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
//                     {item.name}
//                   </div>
//                 </Link>
//               ))}
//               {!isLoggedIn && (
//                 <div className="space-y-2 pt-4 border-t border-border">
//                   <Button onClick={() => setMode("login")} variant="ghost" size="sm" className="w-full justify-start">
//                     <LogIn className="h-4 w-4 mr-2" />
//                     Login
//                   </Button>
//                   <Button onClick={() => setMode("signup")} variant="default" size="sm" className="w-full">
//                     Open App
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Auth Forms Modal-like */}
//       {mode && (
//         <div className="p-6 max-w-md mx-auto bg-card rounded-xl shadow-md mt-6">
//           <h2 className="text-lg font-bold mb-4">{mode === "login" ? "Login" : "Sign Up"}</h2>
//           <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-3">
//             <input
//               type="email"
//               placeholder="Email (optional if using wallet)"
//               className="w-full border rounded p-2"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <input
//               type="password"
//               placeholder="Password (required if using email)"
//               className="w-full border rounded p-2"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//             <div className="flex items-center space-x-2">
//               <input
//                 type="text"
//                 placeholder="Solana Address (optional)"
//                 className="flex-1 border rounded p-2"
//                 value={solanaAddress}
//                 onChange={(e) => setSolanaAddress(e.target.value)}
//               />
//               {walletDetected && (
//                 <Button type="button" onClick={connectWallet} className="whitespace-nowrap">
//                   Connect Wallet
//                 </Button>
//               )}
//             </div>
//             <Button type="submit" className="w-full">
//               {mode === "login" ? "Login" : "Sign Up"}
//             </Button>
//           </form>
//           {message && <p className="mt-3 text-sm">{message}</p>}
//           <Button variant="ghost" size="sm" onClick={() => setMode(null)} className="mt-3 w-full">
//             Cancel
//           </Button>
//         </div>
//       )}
//     </>
//   )
// }

























// "use client"

// import Link from "next/link"
// import { usePathname, useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { ThemeToggle } from "@/components/theme-toggle"
// import { Home, Menu, X, LogIn, LogOut, UserPlus, BarChart3 } from "lucide-react"
// import { useState, useEffect } from "react"
// import { cn } from "@/lib/utils"

// export function Navigation({ setIsLoggedInState }: { setIsLoggedInState?: (isLoggedIn: boolean) => void }) {
//   const pathname = usePathname()
//   const router = useRouter()
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
//   const [isLoggedIn, setIsLoggedIn] = useState(false)

//   // auth form state
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [solanaAddress, setSolanaAddress] = useState("")
//   const [message, setMessage] = useState("")
//   const [mode, setMode] = useState<"login" | "signup" | null>(null) // which form is active
//   const [walletDetected, setWalletDetected] = useState(false)

//   // 🔹 Detect Solana wallet on mount
//   useEffect(() => {
//     if ("solana" in window) {
//       setWalletDetected(true)
//     }
//   }, [])

//   // 🔹 Check session on mount using localStorage first
//   useEffect(() => {
//     const storedIsLoggedIn = localStorage.getItem("isLoggedIn")
//     if (storedIsLoggedIn === "true") {
//       setIsLoggedIn(true)
//       if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
//     } else {
//       // Fallback to API check if no localStorage data
//       const checkSession = async () => {
//         try {
//           // Try GET first, fallback to POST if GET returns 405
//           let res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/me", {
//             method: "GET",
//             credentials: "include",
//           })
          
//           // If GET returns 405, try POST
//           if (res.status === 405) {
//             res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/me", {
//               method: "POST",
//               credentials: "include",
//             })
//           }
          
//           const loggedIn = res.ok
//           setIsLoggedIn(loggedIn)
//           if (setIsLoggedInState) setIsLoggedInState(loggedIn) // Only call if prop exists
//           if (loggedIn) {
//             localStorage.setItem("isLoggedIn", "true")
//           } else {
//             localStorage.removeItem("isLoggedIn")
//           }
//         } catch (error) {
//           console.error("Session check error:", error)
//           setIsLoggedIn(false)
//           if (setIsLoggedInState) setIsLoggedInState(false) // Only call if prop exists
//           localStorage.removeItem("isLoggedIn")
//         }
//       }
//       checkSession()
//     }
//   }, [setIsLoggedInState])

//   const handleLogout = async () => {
//     try {
//       await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/logout", {
//         method: "POST",
//         credentials: "include",
//       })
//     } catch (error) {
//       console.error("Logout error:", error)
//     }
//     setIsLoggedIn(false)
//     if (setIsLoggedInState) setIsLoggedInState(false) // Only call if prop exists
//     localStorage.removeItem("isLoggedIn")
//     setMode(null)
//     router.push("/")
//   }

//   // 🔹 Connect Solana Wallet
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

//   // 🔹 Handle Signup
//   const handleSignup = async (e: any) => {
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
//       const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password, solanaAddress }),
//       })
//       const data = await res.json()
//       if (res.ok) {
//         setMessage(`✅ Signed up as ${data.user?.email || data.user?.solana_address}`)
//         setIsLoggedIn(true)
//         if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
//         localStorage.setItem("isLoggedIn", "true")
//         setMode(null)
//       } else {
//         setMessage(`❌ ${data.error || 'Signup failed'}`)
//       }
//     } catch {
//       setMessage("❌ Error connecting to backend")
//     }
//   }

//   // 🔹 Handle Login
//   const handleLogin = async (e: any) => {
//     e.preventDefault()
//     if (!email && !solanaAddress) {
//       setMessage("❌ Provide email or connect Solana wallet")
//       return
//     }
//     if (email && !password) {
//       setMessage("❌ Password required for email login")
//       return
//     }
//     try {
//       const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password, solanaAddress }),
//       })
//       const data = await res.json()
//       if (res.ok) {
//         setMessage(`✅ Logged in as ${data.user?.email || data.user?.solana_address}`)
//         setIsLoggedIn(true)
//         if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
//         localStorage.setItem("isLoggedIn", "true")
//         setMode(null)
//       } else {
//         setMessage(`❌ ${data.error || 'Login failed'}`)
//       }
//     } catch {
//       setMessage("❌ Error connecting to backend")
//     }
//   }

//   // 🔹 Handle Home Click to close forms and navigate
//   const handleHomeClick = () => {
//     setMode(null) // Close signup/login form
//   }

//   const navItems = [
//     { name: "Home", href: "/", icon: Home, current: pathname === "/", onClick: handleHomeClick },
//     { name: "Products", href: "#", current: false },
//     { name: "Tools", href: "#", current: false },
//     { name: "Pricing", href: "#", current: false },
//     { name: "Support", href: "#", current: false },
//     ...(isLoggedIn
//       ? [{ name: "Dashboard", href: "/dashboard", icon: BarChart3, current: pathname === "/dashboard" }]
//       : []),
//   ]

//   return (
//     <>
//       <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
//               <span className="text-xl font-medium text-foreground">Opsonchain</span>
//             </Link>

//             <div className="hidden md:flex items-center space-x-6">
//               {navItems.map((item) => {
//                 const Icon = item.icon
//                 return (
//                   <Link key={item.name} href={item.href} onClick={item.onClick}>
//                     <Button
//                       variant={item.current ? "default" : "ghost"}
//                       size="sm"
//                       className={cn("flex items-center space-x-2", item.current && "bg-primary text-primary-foreground")}
//                     >
//                       {Icon && <Icon className="h-4 w-4" />}
//                       <span>{item.name}</span>
//                     </Button>
//                   </Link>
//                 )
//               })}

//               {isLoggedIn ? (
//                 <div className="flex items-center space-x-4">
//                   <Link href="/dashboard">
//                     <Button variant="default" size="sm">
//                       Open App
//                     </Button>
//                   </Link>
//                   <Button onClick={handleLogout} variant="ghost" size="sm" className="flex items-center space-x-2">
//                     <LogOut className="h-4 w-4" />
//                     <span>Logout</span>
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="flex items-center space-x-4">
//                   <Button onClick={() => setMode("login")} variant="ghost" size="sm" className="flex items-center space-x-2">
//                     <LogIn className="h-4 w-4" />
//                     <span>Login</span>
//                   </Button>
//                   <Button onClick={() => setMode("signup")} variant="ghost" size="sm" className="flex items-center space-x-2">
//                     <UserPlus className="h-4 w-4" />
//                     <span>Sign Up</span>
//                   </Button>
//                 </div>
//               )}

//               <ThemeToggle />
//             </div>

//             {/* Mobile menu button */}
//             <div className="md:hidden flex items-center space-x-2">
//               <ThemeToggle />
//               <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
//                 {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {mobileMenuOpen && (
//           <div className="md:hidden border-t border-border bg-background">
//             <div className="px-4 py-4 space-y-4">
//               {navItems.map((item) => {
//                 const Icon = item.icon
//                 return (
//                   <Link key={item.name} href={item.href} onClick={item.onClick}>
//                     <div className="flex items-center space-x-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
//                       {Icon && <Icon className="h-4 w-4" />}
//                       <span>{item.name}</span>
//                     </div>
//                   </Link>
//                 )
//               })}
//               {!isLoggedIn && (
//                 <div className="space-y-2 pt-4 border-t border-border">
//                   <Button onClick={() => setMode("login")} variant="ghost" size="sm" className="w-full justify-start flex items-center space-x-2">
//                     <LogIn className="h-4 w-4" />
//                     <span>Login</span>
//                   </Button>
//                   <Button onClick={() => setMode("signup")} variant="ghost" size="sm" className="w-full justify-start flex items-center space-x-2">
//                     <UserPlus className="h-4 w-4" />
//                     <span>Sign Up</span>
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Auth Forms Modal-like */}
//       {mode && (
//         <div className="p-6 max-w-md mx-auto bg-card rounded-xl shadow-md mt-6">
//           <h2 className="text-lg font-bold mb-4">{mode === "login" ? "Login" : "Sign Up"}</h2>
//           <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-3">
//             <input
//               type="email"
//               placeholder="Email (optional if using wallet)"
//               className="w-full border rounded p-2"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <input
//               type="password"
//               placeholder="Password (required if using email)"
//               className="w-full border rounded p-2"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//             <div className="flex items-center space-x-2">
//               <input
//                 type="text"
//                 placeholder="Solana Address (optional)"
//                 className="flex-1 border rounded p-2"
//                 value={solanaAddress}
//                 onChange={(e) => setSolanaAddress(e.target.value)}
//               />
//               {walletDetected && (
//                 <Button type="button" onClick={connectWallet} className="whitespace-nowrap">
//                   Connect Wallet
//                 </Button>
//               )}
//             </div>
//             <Button type="submit" className="w-full">
//               {mode === "login" ? "Login" : "Sign Up"}
//             </Button>
//           </form>
//           {message && <p className="mt-3 text-sm">{message}</p>}
//           <Button variant="ghost" size="sm" onClick={() => setMode(null)} className="mt-3 w-full">
//             Cancel
//           </Button>
//         </div>
//       )}
//     </>
//   )
// }







































// "use client"

// import Link from "next/link"
// import { usePathname, useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { ThemeToggle } from "@/components/theme-toggle"
// import { Home, Menu, X, LogIn, LogOut, UserPlus, BarChart3, Mail } from "lucide-react"
// import { useState, useEffect } from "react"
// import { cn } from "@/lib/utils"

// export function Navigation({ setIsLoggedInState }: { setIsLoggedInState?: (isLoggedIn: boolean) => void }) {
//   const pathname = usePathname()
//   const router = useRouter()
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
//   const [isLoggedIn, setIsLoggedIn] = useState(false)

//   // auth form state
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [solanaAddress, setSolanaAddress] = useState("")
//   const [message, setMessage] = useState("")
//   const [mode, setMode] = useState<"login" | "signup" | null>(null) // which form is active
//   const [walletDetected, setWalletDetected] = useState(false)

//   // 🔹 Support form state
//   const [supportOpen, setSupportOpen] = useState(false)
//   const [supportEmail, setSupportEmail] = useState("")
//   const [supportMessage, setSupportMessage] = useState("")
//   const [supportFiles, setSupportFiles] = useState<FileList | null>(null)

//   // 🔹 Detect Solana wallet on mount
//   useEffect(() => {
//     if ("solana" in window) {
//       setWalletDetected(true)
//     }
//   }, [])

//   // 🔹 Check session on mount using localStorage first
//   useEffect(() => {
//     const storedIsLoggedIn = localStorage.getItem("isLoggedIn")
//     if (storedIsLoggedIn === "true") {
//       setIsLoggedIn(true)
//       if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
//     } else {
//       // Fallback to API check if no localStorage data
//       const checkSession = async () => {
//         try {
//           // Try GET first, fallback to POST if GET returns 405
//           let res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/me", {
//             method: "GET",
//             credentials: "include",
//           })
          
//           // If GET returns 405, try POST
//           if (res.status === 405) {
//             res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/me", {
//               method: "POST",
//               credentials: "include",
//             })
//           }
          
//           const loggedIn = res.ok
//           setIsLoggedIn(loggedIn)
//           if (setIsLoggedInState) setIsLoggedInState(loggedIn) // Only call if prop exists
//           if (loggedIn) {
//             localStorage.setItem("isLoggedIn", "true")
//           } else {
//             localStorage.removeItem("isLoggedIn")
//           }
//         } catch (error) {
//           console.error("Session check error:", error)
//           setIsLoggedIn(false)
//           if (setIsLoggedInState) setIsLoggedInState(false) // Only call if prop exists
//           localStorage.removeItem("isLoggedIn")
//         }
//       }
//       checkSession()
//     }
//   }, [setIsLoggedInState])

//   const handleLogout = async () => {
//     try {
//       await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/logout", {
//         method: "POST",
//         credentials: "include",
//       })
//     } catch (error) {
//       console.error("Logout error:", error)
//     }
//     setIsLoggedIn(false)
//     if (setIsLoggedInState) setIsLoggedInState(false) // Only call if prop exists
//     localStorage.removeItem("isLoggedIn")
//     setMode(null)
//     router.push("/")
//   }

//   // 🔹 Connect Solana Wallet
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

//   // 🔹 Handle Signup
//   const handleSignup = async (e: any) => {
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
//       const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password, solanaAddress }),
//       })
//       const data = await res.json()
//       if (res.ok) {
//         setMessage(`✅ Signed up as ${data.user?.email || data.user?.solana_address}`)
//         setIsLoggedIn(true)
//         if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
//         localStorage.setItem("isLoggedIn", "true")
//         setMode(null)
//       } else {
//         setMessage(`❌ ${data.error || 'Signup failed'}`)
//       }
//     } catch {
//       setMessage("❌ Error connecting to backend")
//     }
//   }

//   // 🔹 Handle Login
//   const handleLogin = async (e: any) => {
//     e.preventDefault()
//     if (!email && !solanaAddress) {
//       setMessage("❌ Provide email or connect Solana wallet")
//       return
//     }
//     if (email && !password) {
//       setMessage("❌ Password required for email login")
//       return
//     }
//     try {
//       const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password, solanaAddress }),
//       })
//       const data = await res.json()
//       if (res.ok) {
//         setMessage(`✅ Logged in as ${data.user?.email || data.user?.solana_address}`)
//         setIsLoggedIn(true)
//         if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
//         localStorage.setItem("isLoggedIn", "true")
//         setMode(null)
//       } else {
//         setMessage(`❌ ${data.error || 'Login failed'}`)
//       }
//     } catch {
//       setMessage("❌ Error connecting to backend")
//     }
//   }

//   // 🔹 Handle Home Click to close forms and navigate
//   const handleHomeClick = () => {
//     setMode(null) // Close signup/login form
//   }

//   // 🔹 Handle Support Submit
//   const handleSupportSubmit = (e: any) => {
//     e.preventDefault()
//     if (!supportEmail || !supportMessage) {
//       alert("❌ Please provide your email and message.")
//       return
//     }

//     const emailBody = `User Email: ${supportEmail}\n\nMessage:\n${supportMessage}\n\n(Attach your files below in the email client.)`
//     const mailtoLink = `mailto:support@opsonchain.com?subject=Support Request from Opsonchain&body=${encodeURIComponent(emailBody)}`
    
//     window.location.href = mailtoLink
//     alert("✅ Email client opened! Please attach your files and send.")

//     // Clear and close
//     setSupportEmail("")
//     setSupportMessage("")
//     setSupportFiles(null)
//     setSupportOpen(false)
//   }

//   const navItems = [
//     { name: "Home", href: "/", icon: Home, current: pathname === "/", onClick: handleHomeClick },
//     { 
//       name: "Support", 
//       href: "#", 
//       icon: Mail, 
//       current: false, 
//       onClick: () => setSupportOpen(true) 
//     },
//   ]

//   return (
//     <>
//       <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
//               <span className="text-xl font-medium text-foreground">Opsonchain</span>
//             </Link>

//             <div className="hidden md:flex items-center space-x-6">
//               {navItems.map((item) => {
//                 const Icon = item.icon
//                 return (
//                   <Link key={item.name} href={item.href} onClick={item.onClick}>
//                     <Button
//                       variant={item.current ? "default" : "ghost"}
//                       size="sm"
//                       className={cn("flex items-center space-x-2", item.current && "bg-primary text-primary-foreground")}
//                     >
//                       {Icon && <Icon className="h-4 w-4" />}
//                       <span>{item.name}</span>
//                     </Button>
//                   </Link>
//                 )
//               })}

//               {isLoggedIn ? (
//                 <div className="flex items-center space-x-4">
//                   <Link href="/dashboard">
//                     <Button variant="default" size="sm">
//                       Open App
//                     </Button>
//                   </Link>
//                   <Button onClick={handleLogout} variant="ghost" size="sm" className="flex items-center space-x-2">
//                     <LogOut className="h-4 w-4" />
//                     <span>Logout</span>
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="flex items-center space-x-4">
//                   <Button onClick={() => setMode("login")} variant="ghost" size="sm" className="flex items-center space-x-2">
//                     <LogIn className="h-4 w-4" />
//                     <span>Login</span>
//                   </Button>
//                   <Button onClick={() => setMode("signup")} variant="ghost" size="sm" className="flex items-center space-x-2">
//                     <UserPlus className="h-4 w-4" />
//                     <span>Sign Up</span>
//                   </Button>
//                 </div>
//               )}

//               <ThemeToggle />
//             </div>

//             {/* Mobile menu button */}
//             <div className="md:hidden flex items-center space-x-2">
//               <ThemeToggle />
//               <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
//                 {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {mobileMenuOpen && (
//           <div className="md:hidden border-t border-border bg-background">
//             <div className="px-4 py-4 space-y-4">
//               {navItems.map((item) => {
//                 const Icon = item.icon
//                 return (
//                   <Link key={item.name} href={item.href} onClick={() => {
//                     item.onClick?.()
//                     setMobileMenuOpen(false) // Close mobile menu after click
//                   }}>
//                     <div className="flex items-center space-x-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
//                       {Icon && <Icon className="h-4 w-4" />}
//                       <span>{item.name}</span>
//                     </div>
//                   </Link>
//                 )
//               })}
//               {!isLoggedIn && (
//                 <div className="space-y-2 pt-4 border-t border-border">
//                   <Button onClick={() => {
//                     setMode("login")
//                     setMobileMenuOpen(false)
//                   }} variant="ghost" size="sm" className="w-full justify-start flex items-center space-x-2">
//                     <LogIn className="h-4 w-4" />
//                     <span>Login</span>
//                   </Button>
//                   <Button onClick={() => {
//                     setMode("signup")
//                     setMobileMenuOpen(false)
//                   }} variant="ghost" size="sm" className="w-full justify-start flex items-center space-x-2">
//                     <UserPlus className="h-4 w-4" />
//                     <span>Sign Up</span>
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Auth Forms Modal-like */}
//       {mode && (
//         <div className="p-6 max-w-md mx-auto bg-card rounded-xl shadow-md mt-6">
//           <h2 className="text-lg font-bold mb-4">{mode === "login" ? "Login" : "Sign Up"}</h2>
//           <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-3">
//             <input
//               type="email"
//               placeholder="Email (optional if using wallet)"
//               className="w-full border rounded p-2"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <input
//               type="password"
//               placeholder="Password (required if using email)"
//               className="w-full border rounded p-2"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//             <div className="flex items-center space-x-2">
//               <input
//                 type="text"
//                 placeholder="Solana Address (optional)"
//                 className="flex-1 border rounded p-2"
//                 value={solanaAddress}
//                 onChange={(e) => setSolanaAddress(e.target.value)}
//               />
//               {walletDetected && (
//                 <Button type="button" onClick={connectWallet} className="whitespace-nowrap">
//                   Connect Wallet
//                 </Button>
//               )}
//             </div>
//             <Button type="submit" className="w-full">
//               {mode === "login" ? "Login" : "Sign Up"}
//             </Button>
//           </form>
//           {message && <p className="mt-3 text-sm">{message}</p>}
//           <Button variant="ghost" size="sm" onClick={() => setMode(null)} className="mt-3 w-full">
//             Cancel
//           </Button>
//         </div>
//       )}

//       {/* Support Form Modal-like */}
//       {supportOpen && (
//         <div className="p-6 max-w-md mx-auto bg-card rounded-xl shadow-md mt-6">
//           <h2 className="text-lg font-bold mb-4">Support Request</h2>
//           <form onSubmit={handleSupportSubmit} className="space-y-3">
//             <input
//               type="email"
//               placeholder="Your Email"
//               className="w-full border rounded p-2"
//               value={supportEmail}
//               onChange={(e) => setSupportEmail(e.target.value)}
//               required
//             />
//             <textarea
//               placeholder="Your Message"
//               className="w-full border rounded p-2 h-24"
//               value={supportMessage}
//               onChange={(e) => setSupportMessage(e.target.value)}
//               required
//             />
//             <input
//               type="file"
//               multiple
//               className="w-full border rounded p-2"
//               onChange={(e) => setSupportFiles(e.target.files)}
//             />
//             <p className="text-xs text-muted-foreground">
//               Files will be attached in your email client after submission.
//             </p>
//             <Button type="submit" className="w-full">
//               Send Support Request
//             </Button>
//           </form>
//           <Button variant="ghost" size="sm" onClick={() => setSupportOpen(false)} className="mt-3 w-full">
//             Cancel
//           </Button>
//         </div>
//       )}
//     </>
//   )
// }










// "use client"

// import Link from "next/link"
// import { usePathname, useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { ThemeToggle } from "@/components/theme-toggle"
// import { Home, Menu, X, LogIn, LogOut, UserPlus, BarChart3, HelpCircle } from "lucide-react"
// import { useState, useEffect } from "react"
// import { cn } from "@/lib/utils"

// export function Navigation({ setIsLoggedInState }: { setIsLoggedInState?: (isLoggedIn: boolean) => void }) {
//   const pathname = usePathname()
//   const router = useRouter()
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
//   const [isLoggedIn, setIsLoggedIn] = useState(false)

//   // auth form state
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [solanaAddress, setSolanaAddress] = useState("")
//   const [message, setMessage] = useState("")
//   const [mode, setMode] = useState<"login" | "signup" | null>(null) // which form is active
//   const [walletDetected, setWalletDetected] = useState(false)

//   // support form state
//   const [showSupport, setShowSupport] = useState(false)
//   const [supportEmail, setSupportEmail] = useState("")
//   const [supportMessage, setSupportMessage] = useState("")
//   const [supportFile, setSupportFile] = useState<File | null>(null)
//   const [supportStatus, setSupportStatus] = useState("")

//   // 🔹 Detect Solana wallet on mount
//   useEffect(() => {
//     if ("solana" in window) {
//       setWalletDetected(true)
//     }
//   }, [])

//   // 🔹 Check session on mount using localStorage first
//   useEffect(() => {
//     const storedIsLoggedIn = localStorage.getItem("isLoggedIn")
//     if (storedIsLoggedIn === "true") {
//       setIsLoggedIn(true)
//       if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
//     } else {
//       // Fallback to API check if no localStorage data
//       const checkSession = async () => {
//         try {
//           // Try GET first, fallback to POST if GET returns 405
//           let res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/me", {
//             method: "GET",
//             credentials: "include",
//           })
          
//           // If GET returns 405, try POST
//           if (res.status === 405) {
//             res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/me", {
//               method: "POST",
//               credentials: "include",
//             })
//           }
          
//           const loggedIn = res.ok
//           setIsLoggedIn(loggedIn)
//           if (setIsLoggedInState) setIsLoggedInState(loggedIn) // Only call if prop exists
//           if (loggedIn) {
//             localStorage.setItem("isLoggedIn", "true")
//           } else {
//             localStorage.removeItem("isLoggedIn")
//           }
//         } catch (error) {
//           console.error("Session check error:", error)
//           setIsLoggedIn(false)
//           if (setIsLoggedInState) setIsLoggedInState(false) // Only call if prop exists
//           localStorage.removeItem("isLoggedIn")
//         }
//       }
//       checkSession()
//     }
//   }, [setIsLoggedInState])

//   const handleLogout = async () => {
//     try {
//       await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/logout", {
//         method: "POST",
//         credentials: "include",
//       })
//     } catch (error) {
//       console.error("Logout error:", error)
//     }
//     setIsLoggedIn(false)
//     if (setIsLoggedInState) setIsLoggedInState(false) // Only call if prop exists
//     localStorage.removeItem("isLoggedIn")
//     setMode(null)
//     router.push("/")
//   }

//   // 🔹 Connect Solana Wallet
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

//   // 🔹 Handle Signup
//   const handleSignup = async (e: any) => {
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
//       const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password, solanaAddress }),
//       })
//       const data = await res.json()
//       if (res.ok) {
//         setMessage(`✅ Signed up as ${data.user?.email || data.user?.solana_address}`)
//         setIsLoggedIn(true)
//         if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
//         localStorage.setItem("isLoggedIn", "true")
//         setMode(null)
//       } else {
//         setMessage(`❌ ${data.error || 'Signup failed'}`)
//       }
//     } catch {
//       setMessage("❌ Error connecting to backend")
//     }
//   }

//   // 🔹 Handle Login
//   const handleLogin = async (e: any) => {
//     e.preventDefault()
//     if (!email && !solanaAddress) {
//       setMessage("❌ Provide email or connect Solana wallet")
//       return
//     }
//     if (email && !password) {
//       setMessage("❌ Password required for email login")
//       return
//     }
//     try {
//       const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password, solanaAddress }),
//       })
//       const data = await res.json()
//       if (res.ok) {
//         setMessage(`✅ Logged in as ${data.user?.email || data.user?.solana_address}`)
//         setIsLoggedIn(true)
//         if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
//         localStorage.setItem("isLoggedIn", "true")
//         setMode(null)
//       } else {
//         setMessage(`❌ ${data.error || 'Login failed'}`)
//       }
//     } catch {
//       setMessage("❌ Error connecting to backend")
//     }
//   }

//   // 🔹 Handle Support Submit
//   const handleSupportSubmit = async (e: any) => {
//     e.preventDefault()
//     if (!supportEmail || !supportMessage) {
//       setSupportStatus("❌ Please provide both email and message")
//       return
//     }
//     const formData = new FormData()
//     formData.append('email', supportEmail)
//     formData.append('message', supportMessage)
//     if (supportFile) {
//       formData.append('file', supportFile)
//     }
//     try {
//       const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/support", {
//         method: "POST",
//         body: formData,
//         credentials: "include",
//       })
//       if (res.ok) {
//         setSupportStatus("✅ Message sent successfully")
//         setSupportEmail("")
//         setSupportMessage("")
//         setSupportFile(null)
//         setTimeout(() => setShowSupport(false), 1000) // Close after 1s
//       } else {
//         const data = await res.json().catch(() => ({}))
//         setSupportStatus(`❌ ${data.error || 'Failed to send message'}`)
//       }
//     } catch {
//       setSupportStatus("❌ Error connecting to backend")
//     }
//   }

//   // 🔹 Handle Home Click to close forms and navigate
//   const handleHomeClick = () => {
//     setMode(null) // Close signup/login form
//   }

//   const navItems = [
//     { name: "Home", href: "/", icon: Home, current: pathname === "/", onClick: handleHomeClick },
//     { name: "Support", href: "#", icon: HelpCircle, current: false, onClick: () => { setShowSupport(true); setMobileMenuOpen(false); } },
//   ]

//   const handleNavClick = (item: any) => (e: React.MouseEvent) => {
//     e.preventDefault()
//     if (item.onClick) item.onClick()
//     if (item.href !== "#") {
//       router.push(item.href)
//     }
//   }

//   return (
//     <>
//       <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
//               <span className="text-xl font-medium text-foreground">Opsonchain</span>
//             </Link>

//             <div className="hidden md:flex items-center space-x-6">
//               {navItems.map((item) => {
//                 const Icon = item.icon
//                 return (
//                   <Button
//                     key={item.name}
//                     onClick={handleNavClick(item)}
//                     variant={item.current ? "default" : "ghost"}
//                     size="sm"
//                     className="flex items-center space-x-2"
//                   >
//                     {Icon && <Icon className="h-4 w-4" />}
//                     <span>{item.name}</span>
//                   </Button>
//                 )
//               })}

//               {isLoggedIn ? (
//                 <div className="flex items-center space-x-4">
//                   <Link href="/dashboard">
//                     <Button variant="default" size="sm">
//                       Open App
//                     </Button>
//                   </Link>
//                   <Button onClick={handleLogout} variant="ghost" size="sm" className="flex items-center space-x-2">
//                     <LogOut className="h-4 w-4" />
//                     <span>Logout</span>
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="flex items-center space-x-4">
//                   <Button onClick={() => setMode("login")} variant="ghost" size="sm" className="flex items-center space-x-2">
//                     <LogIn className="h-4 w-4" />
//                     <span>Login</span>
//                   </Button>
//                   <Button onClick={() => setMode("signup")} variant="ghost" size="sm" className="flex items-center space-x-2">
//                     <UserPlus className="h-4 w-4" />
//                     <span>Sign Up</span>
//                   </Button>
//                 </div>
//               )}

//               <ThemeToggle />
//             </div>

//             {/* Mobile menu button */}
//             <div className="md:hidden flex items-center space-x-2">
//               <ThemeToggle />
//               <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
//                 {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {mobileMenuOpen && (
//           <div className="md:hidden border-t border-border bg-background">
//             <div className="px-4 py-4 space-y-4">
//               {navItems.map((item) => {
//                 const Icon = item.icon
//                 return (
//                   <button
//                     key={item.name}
//                     onClick={(e) => {
//                       e.preventDefault()
//                       if (item.onClick) item.onClick()
//                       if (item.href !== "#") {
//                         router.push(item.href)
//                       }
//                       setMobileMenuOpen(false)
//                     }}
//                     className="flex items-center space-x-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-start"
//                   >
//                     {Icon && <Icon className="h-4 w-4" />}
//                     <span>{item.name}</span>
//                   </button>
//                 )
//               })}
//               {isLoggedIn ? (
//                 <div className="space-y-2 pt-4 border-t border-border">
//                   <button
//                     onClick={() => {
//                       router.push("/dashboard")
//                       setMobileMenuOpen(false)
//                     }}
//                     className="flex items-center space-x-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-start"
//                   >
//                     <BarChart3 className="h-4 w-4" />
//                     <span>Open App</span>
//                   </button>
//                   <Button
//                     onClick={() => {
//                       handleLogout()
//                       setMobileMenuOpen(false)
//                     }}
//                     variant="ghost"
//                     size="sm"
//                     className="w-full justify-start flex items-center space-x-2"
//                   >
//                     <LogOut className="h-4 w-4" />
//                     <span>Logout</span>
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="space-y-2 pt-4 border-t border-border">
//                   <Button
//                     onClick={() => {
//                       setMode("login")
//                       setMobileMenuOpen(false)
//                     }}
//                     variant="ghost"
//                     size="sm"
//                     className="w-full justify-start flex items-center space-x-2"
//                   >
//                     <LogIn className="h-4 w-4" />
//                     <span>Login</span>
//                   </Button>
//                   <Button
//                     onClick={() => {
//                       setMode("signup")
//                       setMobileMenuOpen(false)
//                     }}
//                     variant="ghost"
//                     size="sm"
//                     className="w-full justify-start flex items-center space-x-2"
//                   >
//                     <UserPlus className="h-4 w-4" />
//                     <span>Sign Up</span>
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Auth Forms Modal-like */}
//       {mode && (
//         <div className="p-6 max-w-md mx-auto bg-card rounded-xl shadow-md mt-6">
//           <h2 className="text-lg font-bold mb-4">{mode === "login" ? "Login" : "Sign Up"}</h2>
//           <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-3">
//             <input
//               type="email"
//               placeholder="Email (optional if using wallet)"
//               className="w-full border rounded p-2 bg-background text-foreground"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <input
//               type="password"
//               placeholder="Password (required if using email)"
//               className="w-full border rounded p-2 bg-background text-foreground"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//             <div className="flex items-center space-x-2">
//               <input
//                 type="text"
//                 placeholder="Solana Address (optional)"
//                 className="flex-1 border rounded p-2 bg-background text-foreground"
//                 value={solanaAddress}
//                 onChange={(e) => setSolanaAddress(e.target.value)}
//               />
//               {walletDetected && (
//                 <Button type="button" onClick={connectWallet} className="whitespace-nowrap">
//                   Connect Wallet
//                 </Button>
//               )}
//             </div>
//             <Button type="submit" className="w-full">
//               {mode === "login" ? "Login" : "Sign Up"}
//             </Button>
//           </form>
//           {message && <p className="mt-3 text-sm text-foreground">{message}</p>}
//           <Button variant="ghost" size="sm" onClick={() => setMode(null)} className="mt-3 w-full">
//             Cancel
//           </Button>
//         </div>
//       )}

//       {/* Support Form Modal-like */}
//       {showSupport && (
//         <div className="p-6 max-w-md mx-auto bg-card rounded-xl shadow-md mt-6">
//           <h2 className="text-lg font-bold mb-4">Contact Support</h2>
//           <form onSubmit={handleSupportSubmit} className="space-y-3">
//             <input
//               type="email"
//               placeholder="Your Email"
//               className="w-full border rounded p-2 bg-background text-foreground"
//               value={supportEmail}
//               onChange={(e) => setSupportEmail(e.target.value)}
//               required
//             />
//             <textarea
//               placeholder="Your Message"
//               className="w-full border rounded p-2 bg-background text-foreground h-32 resize-none"
//               value={supportMessage}
//               onChange={(e) => setSupportMessage(e.target.value)}
//               required
//             />
//             <input
//               type="file"
//               className="w-full border rounded p-2 bg-background text-foreground"
//               onChange={(e) => setSupportFile(e.target.files?.[0] || null)}
//             />
//             <Button type="submit" className="w-full">
//               Send Message
//             </Button>
//           </form>
//           {supportStatus && <p className="mt-3 text-sm text-foreground">{supportStatus}</p>}
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => {
//               setShowSupport(false)
//               setSupportEmail("")
//               setSupportMessage("")
//               setSupportFile(null)
//               setSupportStatus("")
//             }}
//             className="mt-3 w-full"
//           >
//             Cancel
//           </Button>
//         </div>
//       )}
//     </>
//   )
// }







"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, Menu, X, LogIn, LogOut, UserPlus, BarChart3, HelpCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Navigation({ setIsLoggedInState }: { setIsLoggedInState?: (isLoggedIn: boolean) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // auth form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [solanaAddress, setSolanaAddress] = useState("")
  const [message, setMessage] = useState("")
  const [mode, setMode] = useState<"login" | "signup" | null>(null) // which form is active
  const [walletDetected, setWalletDetected] = useState(false)

  // support form state
  const [showSupport, setShowSupport] = useState(false)
  const [supportEmail, setSupportEmail] = useState("")
  const [supportMessage, setSupportMessage] = useState("")
  const [supportFile, setSupportFile] = useState<File | null>(null)
  const [supportStatus, setSupportStatus] = useState("")

  // 🔹 Detect Solana wallet on mount
  useEffect(() => {
    if ("solana" in window) {
      setWalletDetected(true)
    }
  }, [])

  // 🔹 Check session on mount using localStorage first
  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn")
    if (storedIsLoggedIn === "true") {
      setIsLoggedIn(true)
      if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
    } else {
      // Fallback to API check if no localStorage data
      const checkSession = async () => {
        try {
          // Try GET first, fallback to POST if GET returns 405
          let res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/me", {
            method: "GET",
            credentials: "include",
          })
          
          // If GET returns 405, try POST
          if (res.status === 405) {
            res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/me", {
              method: "POST",
              credentials: "include",
            })
          }
          
          const loggedIn = res.ok
          setIsLoggedIn(loggedIn)
          if (setIsLoggedInState) setIsLoggedInState(loggedIn) // Only call if prop exists
          if (loggedIn) {
            localStorage.setItem("isLoggedIn", "true")
          } else {
            localStorage.removeItem("isLoggedIn")
          }
        } catch (error) {
          console.error("Session check error:", error)
          setIsLoggedIn(false)
          if (setIsLoggedInState) setIsLoggedInState(false) // Only call if prop exists
          localStorage.removeItem("isLoggedIn")
        }
      }
      checkSession()
    }
  }, [setIsLoggedInState])

  const handleLogout = async () => {
    try {
      await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
    setIsLoggedIn(false)
    if (setIsLoggedInState) setIsLoggedInState(false) // Only call if prop exists
    localStorage.removeItem("isLoggedIn")
    setMode(null)
    router.push("/")
  }

  // 🔹 Connect Solana Wallet
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

  // 🔹 Handle Signup
  const handleSignup = async (e: any) => {
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
      const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, solanaAddress }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`✅ Signed up as ${data.user?.email || data.user?.solana_address}`)
        setIsLoggedIn(true)
        if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
        localStorage.setItem("isLoggedIn", "true")
        setMode(null)
      } else {
        setMessage(`❌ ${data.error || 'Signup failed'}`)
      }
    } catch {
      setMessage("❌ Error connecting to backend")
    }
  }

  // 🔹 Handle Login
  const handleLogin = async (e: any) => {
    e.preventDefault()
    if (!email && !solanaAddress) {
      setMessage("❌ Provide email or connect Solana wallet")
      return
    }
    if (email && !password) {
      setMessage("❌ Password required for email login")
      return
    }
    try {
      const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, solanaAddress }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`✅ Logged in as ${data.user?.email || data.user?.solana_address}`)
        setIsLoggedIn(true)
        if (setIsLoggedInState) setIsLoggedInState(true) // Only call if prop exists
        localStorage.setItem("isLoggedIn", "true")
        setMode(null)
      } else {
        setMessage(`❌ ${data.error || 'Login failed'}`)
      }
    } catch {
      setMessage("❌ Error connecting to backend")
    }
  }

  // 🔹 Handle Support Submit
  const handleSupportSubmit = async (e: any) => {
    e.preventDefault()
    if (!supportEmail || !supportMessage) {
      setSupportStatus("❌ Email and message required")
      return
    }
    const formData = new FormData()
    formData.append('email', supportEmail)
    formData.append('message', supportMessage)
    if (supportFile) {
      formData.append('file', supportFile)
    }
    try {
      const res = await fetch("https://solana-cluster-dashboard-production-cce9.up.railway.app/support", {
        method: "POST",
        body: formData,
        credentials: "include",
      })
      if (res.ok) {
        setSupportStatus("✅ Message sent successfully")
        setSupportEmail("")
        setSupportMessage("")
        setSupportFile(null)
        setShowSupport(false)
      } else {
        const data = await res.json().catch(() => ({}))
        setSupportStatus(`❌ ${data.error || 'Failed to send message'}`)
      }
    } catch {
      setSupportStatus("❌ Error connecting to backend")
    }
  }

  // 🔹 Handle Home Click to close forms and navigate
  const handleHomeClick = () => {
    setMode(null) // Close signup/login form
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home, current: pathname === "/", onClick: handleHomeClick },
    { name: "Support", href: "#", icon: HelpCircle, current: false, onClick: () => setShowSupport(true) },
  ]

  const handleNavClick = (item: any) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (item.onClick) item.onClick()
    if (item.href !== "#") {
      router.push(item.href)
    }
  }

  return (
    <>
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <span className="text-2xl font-bold text-foreground">OpsOnChain</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.name}
                    onClick={handleNavClick(item)}
                    variant={item.current ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </Button>
                )
              })}

              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard">
                    <Button variant="default" size="sm">
                      Open App
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} variant="ghost" size="sm" className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button onClick={() => setMode("login")} variant="ghost" size="sm" className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                  <Button onClick={() => setMode("signup")} variant="ghost" size="sm" className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </Button>
                </div>
              )}

              <ThemeToggle />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.name}
                    onClick={(e) => {
                      e.preventDefault()
                      if (item.onClick) item.onClick()
                      if (item.href !== "#") {
                        router.push(item.href)
                      }
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-start"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </button>
                )
              })}
              {isLoggedIn ? (
                <div className="space-y-2 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      router.push("/dashboard")
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-start"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Open App</span>
                  </button>
                  <Button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 pt-4 border-t border-border">
                  <Button
                    onClick={() => {
                      setMode("login")
                      setMobileMenuOpen(false)
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start flex items-center space-x-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setMode("signup")
                      setMobileMenuOpen(false)
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Forms Modal-like */}
      {mode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="p-6 max-w-md w-full bg-card rounded-xl shadow-md">
            <h2 className="text-lg font-bold mb-4">{mode === "login" ? "Login" : "Sign Up"}</h2>
            <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-3">
              <input
                type="email"
                placeholder="Email (optional if using wallet)"
                className="w-full border rounded p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password (required if using email)"
                className="w-full border rounded p-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Solana Address (optional)"
                  className="flex-1 border rounded p-2"
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
                {mode === "login" ? "Login" : "Sign Up"}
              </Button>
            </form>
            {message && <p className="mt-3 text-sm">{message}</p>}
            <Button variant="ghost" size="sm" onClick={() => setMode(null)} className="mt-3 w-full">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Support Form Modal-like */}
      {showSupport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="p-6 max-w-md w-full bg-card rounded-xl shadow-md">
            <h2 className="text-lg font-bold mb-4">Support</h2>
            <form onSubmit={handleSupportSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full border rounded p-2"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                required
              />
              <textarea
                placeholder="Your Message"
                className="w-full border rounded p-2 h-32 resize-none"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                required
              />
              <input
                type="file"
                className="w-full border rounded p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                onChange={(e) => setSupportFile(e.target.files?.[0] || null)}
              />
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
            {supportStatus && <p className="mt-3 text-sm">{supportStatus}</p>}
            <Button variant="ghost" size="sm" onClick={() => { setShowSupport(false); setSupportEmail(""); setSupportMessage(""); setSupportFile(null); setSupportStatus(""); }} className="mt-3 w-full">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

