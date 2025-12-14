
// "use client"

// import { useEffect, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
// import { Progress } from "@/components/ui/progress"
// import { useToast } from "@/hooks/use-toast"

// interface Cluster {
//   funding_wallet: string
//   recipients: string[]
//   token_mints: string[]
//   fan_out_slot: number
//   buy_slots: number[]
//   common_patterns: {
//     amounts: string
//     wallet_age: string
//     dex_programs: string[]
//   }
//   total_sol_funded: number
//   total_sol_remaining: number
//   spend_rate_sol_per_min: number | null
//   time_remaining_sec: number | null
//   last_update: number
//   cluster_age_sec: number
//   children_count: number
//   created_at: number
//   status: "active" | "forming"
// }

// interface ApiResponse {
//   clusters: Cluster[]
//   metadata: {
//     total_active: number
//     total_tracked: number
//     timestamp: string
//     requirements: {
//       min_children: number
//       min_total_sol: number
//       min_transfer_sol: number
//       detection_window_sec: number
//       data_retention_min: number
//     }
//   }
// }

// function ClusterDetail({ cluster, onClose }: { cluster: Cluster, onClose: () => void }) {
//   const { toast } = useToast()
//   const [dialogOpen, setDialogOpen] = useState(false)

//   const funded = cluster.total_sol_funded;
//   const remaining = cluster.total_sol_remaining;
//   const spent = funded - remaining;
//   const percentComplete = funded > 0 ? (spent / funded) * 100 : 0;
//   const estMin = cluster.time_remaining_sec !== null ? Math.floor(cluster.time_remaining_sec / 60) : 0;
//   const estSec = cluster.time_remaining_sec !== null ? cluster.time_remaining_sec % 60 : 0;
//   const estTime = cluster.time_remaining_sec !== null ? `${estMin}m ${estSec}s remaining` : 'N/A';
//   const healthScore = Math.round(100 - (percentComplete / 5));
//   const healthLabel = healthScore > 80 ? 'Excellent Health' : healthScore > 60 ? 'Good Health' : 'Poor Health';
//   const activeCount = cluster.children_count;
//   const dexUsed = cluster.common_patterns.dex_programs.join(' / ') || 'N/A';

//   const childrenToShow = cluster.recipients.slice(0, 5);
//   const tokenMintsToShow = cluster.token_mints.slice(0, 5);

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard
//       .writeText(text)
//       .then(() => {
//         toast({
//           title: "Copied!",
//           description: "Address copied to clipboard",
//         })
//       })
//       .catch((err) => {
//         console.error("Failed to copy:", err)
//         toast({
//           title: "Copy Failed",
//           description: "Unable to copy to clipboard",
//           variant: "destructive",
//         })
//       })
//   }

//   return (
//     <Dialog open={true} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl">
//         <DialogHeader>
//           <DialogTitle>Cluster Details</DialogTitle>
//           <DialogClose />
//         </DialogHeader>
//         <div className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="rounded-lg bg-background p-4 shadow max-w-md">
//               <h3 className="text-lg font-semibold mb-2">Funding Overview</h3>
//               <div className="flex justify-between mb-1">
//                 <span>Total SOL Funded</span>
//                 <span className="font-bold">{funded.toFixed(1)} SOL</span>
//               </div>
//               <div className="flex justify-between mb-1">
//                 <span>SOL Spent</span>
//                 <span className="font-bold">{spent.toFixed(1)} SOL</span>
//               </div>
//               <div className="flex justify-between mb-2">
//                 <span>SOL Remaining</span>
//                 <span className="font-bold text-yellow-500">{remaining.toFixed(1)} SOL</span>
//               </div>
//               <Progress value={percentComplete} className="h-2 mb-1" />
//               <div className="text-sm mb-1">{Math.round(percentComplete)}% Complete</div>
//               <div className="text-sm">Est. {estTime}</div>
//             </div>
//             <div className="rounded-lg bg-background p-4 shadow max-w-xs">
//               <h3 className="text-lg font-semibold mb-2"></h3>
//               <div className="flex justify-center mb-2">
//                 <div className="rounded-full bg-green-400 w-16 h-16 flex items-center justify-center text-white text-2xl font-bold border-4 border-green-600">
//                   {healthScore}
//                 </div>
//               </div>
//               <div className="text-center text-green-500 font-semibold">{healthLabel}</div>
//             </div>
//           </div>
//           <div className="rounded-lg bg-background p-4 shadow w-full max-w-[calc(40rem+1rem)]">
//             <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
//             <div className="grid grid-cols-2 gap-2 text-sm">
//               <div>Active Wallets</div>
//               <div className="font-bold">
//               <div className="flex items-center justify-between">
              
//               <span>{activeCount} / {cluster.children_count}</span>
                
//                 <Button size="sm" onClick={() => setDialogOpen(true)}>     View</Button>
//               </div>
//               </div>
//               <div>Token mint</div>
//               <div className="font-bold">
//                 {tokenMintsToShow.length > 0 ? (
//                   tokenMintsToShow.map((mint, i) => (
//                     <div key={i} className="flex items-center mb-2 justify-between">
//                       <span className="font-mono">{mint.slice(0, 3) + "..." + mint.slice(-3)}</span>
//                       <Button size="sm" onClick={() => copyToClipboard(mint)}>Copy</Button>
//                     </div>
//                   ))
//                 ) : (
//                   'N/A'
//                 )}
//               </div>
//               <div>DEX Used</div>
//               <div className="font-bold">{dexUsed}</div>
//             </div>
//           </div>
//           <div className="rounded-lg bg-background p-4 shadow w-full max-w-[calc(40rem+1rem)]">
//             <h3 className="text-lg font-semibold mb-2">Child Wallets Activity</h3>
//             {childrenToShow.map((addr, i) => {
//               const abbr = addr.slice(0, 3) + "..." + addr.slice(-3);
//               return (
//                 <div key={i} className="flex items-center mb-2 justify-between">
//                   <div className="font-mono">{abbr}</div>
//                   <Button size="sm" onClick={() => copyToClipboard(addr)}>Copy</Button>
//                 </div>
//               );
//             })}
//           </div>

//           <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Active Child Wallets</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-2 max-h-96 overflow-y-auto">
//                 {cluster.recipients.map((addr, i) => (
//                   <div key={i} className="flex items-center justify-between p-2 border-b">
//                     <div className="font-mono text-sm truncate max-w-xs">{addr}</div>
//                     <Button size="sm" onClick={() => copyToClipboard(addr)}>Copy</Button>
//                   </div>
//                 ))}
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export function ClusterDashboard() {
//   const [data, setData] = useState<ApiResponse | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState<"all" | "active" | "forming">("all")
//   const [isPolling, setIsPolling] = useState(false)
//   const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)
//   const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
//   const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected")
//   const [sortBy, setSortBy] = useState<
//     "total_sol_funded" | "total_sol_remaining" | "children_count" | "cluster_age_sec"
//   >("total_sol_funded")
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
//   const [minSolFilter, setMinSolFilter] = useState<string>("")
//   const [minChildrenFilter, setMinChildrenFilter] = useState<string>("")
//   const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null)
//   const { toast } = useToast()

//   const API_BASE = "https://dec-clust-1.onrender.com"

//   const fetchData = async () => {
//     try {
//       setConnectionStatus("connecting")
//       console.log("[v0] Attempting to fetch data from:", `${API_BASE}/clusters`)

//       const response = await fetch(`${API_BASE}/clusters`)
//       console.log("[v0] Response status:", response.status)
//       console.log("[v0] Response ok:", response.ok)

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`)
//       }

//       const json: ApiResponse = await response.json()
//       console.log("[v0] Successfully fetched data:", json)

//       setData(json)
//       setLoading(false)
//       setError(null)
//       setConnectionStatus("connected")
//       setLastUpdateTime(new Date())
//     } catch (err) {
//       console.error("[v0] Fetch error:", err)
//       const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
//       setError(`Connection failed: ${errorMessage}`)
//       setLoading(false)
//       setConnectionStatus("disconnected")

//       toast({
//         title: "Connection Error",
//         description: `Unable to connect to API: ${errorMessage}`,
//         variant: "destructive",
//       })
//     }
//   }

//   const startPolling = async () => {
//     if (!isPolling) {
//       await fetchData()
//       const interval = setInterval(fetchData, 5000)
//       setPollInterval(interval)
//       setIsPolling(true)
//       toast({
//         title: "Polling Started",
//         description: "Real-time monitoring is now active",
//       })
//     }
//   }

//   const stopPolling = async () => {
//     if (isPolling) {
//       if (pollInterval) {
//         clearInterval(pollInterval)
//         setPollInterval(null)
//       }
//       try {
//         const response = await fetch(`${API_BASE}/stop-polling`, {
//           method: "POST",
//         })
//         if (!response.ok) {
//           throw new Error("Failed to stop backend polling")
//         }
//         toast({
//           title: "Polling Stopped",
//           description: "Real-time monitoring has been paused",
//         })
//       } catch (err) {
//         console.error("Error stopping backend polling:", err)
//         setError("Failed to stop backend polling")
//       }
//       setIsPolling(false)
//     }
//   }

//   useEffect(() => {
//     return () => {
//       if (pollInterval) {
//         clearInterval(pollInterval)
//       }
//     }
//   }, [pollInterval])

//   const toggleExpand = (cluster: Cluster) => {
//     setSelectedCluster(cluster)
//   };

//   const closeClusterDetail = () => {
//     setSelectedCluster(null)
//   }

//   const filteredAndSortedClusters =
//     data?.clusters
//       .filter((cluster) => {
//         const matchesSearch = cluster.funding_wallet.toLowerCase().includes(searchTerm.toLowerCase())
//         const matchesStatus = statusFilter === "all" || cluster.status === statusFilter
//         const matchesMinSol = !minSolFilter || cluster.total_sol_remaining >= Number.parseFloat(minSolFilter)
//         const matchesMinChildren = !minChildrenFilter || cluster.children_count >= Number.parseInt(minChildrenFilter)
//         return matchesSearch && matchesStatus && matchesMinSol && matchesMinChildren
//       })
//       .sort((a, b) => {
//         const aValue = a[sortBy]
//         const bValue = b[sortBy]
//         const multiplier = sortOrder === "desc" ? -1 : 1
//         return (aValue > bValue ? 1 : -1) * multiplier
//       }) || []

//   const exportToCSV = () => {
//     if (!filteredAndSortedClusters.length) {
//       toast({
//         title: "No Data",
//         description: "No clusters to export",
//         variant: "destructive",
//       })
//       return
//     }

//     const headers = [
//       "Funding Wallet",
//       "Children Count",
//       "Total SOL Funded",
//       "Remaining SOL",
//       "Spend Rate (SOL/min)",
//       "Time Remaining (sec)",
//       "Status",
//       "Age (sec)",
//       "Token Mints",
//       "DEX Programs",
//     ]

//     const csvContent = [
//       headers.join(","),
//       ...filteredAndSortedClusters.map((cluster) =>
//         [
//           cluster.funding_wallet,
//           cluster.children_count,
//           cluster.total_sol_funded.toFixed(2),
//           cluster.total_sol_remaining.toFixed(2),
//           cluster.spend_rate_sol_per_min?.toFixed(2) ?? "N/A",
//           cluster.time_remaining_sec ?? "N/A",
//           cluster.status,
//           cluster.cluster_age_sec,
//           `"${cluster.token_mints.join(", ")}"`,
//           `"${cluster.common_patterns.dex_programs.join(", ")}"`,
//         ].join(","),
//       ),
//     ].join("\n")

//     const blob = new Blob([csvContent], { type: "text/csv" })
//     const url = window.URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = `solana-clusters-${new Date().toISOString().split("T")[0]}.csv`
//     a.click()
//     window.URL.revokeObjectURL(url)

//     toast({
//       title: "Export Complete",
//       description: "Cluster data exported to CSV",
//     })
//   }

//   const clearFilters = () => {
//     setSearchTerm("")
//     setStatusFilter("all")
//     setMinSolFilter("")
//     setMinChildrenFilter("")
//     setSortBy("total_sol_funded")
//     setSortOrder("desc")
//   }

//   const getStatusBadge = (status: string) => {
//     return status === "active" ? (
//       <Badge variant="default" className="bg-green-500 hover:bg-green-600">
//         {status.toUpperCase()}
//       </Badge>
//     ) : (
//       <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black">
//         {status.toUpperCase()}
//       </Badge>
//     )
//   }

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard
//       .writeText(text)
//       .then(() => {
//         toast({
//           title: "Copied!",
//           description: "Address copied to clipboard",
//         })
//       })
//       .catch((err) => {
//         console.error("Failed to copy:", err)
//         toast({
//           title: "Copy Failed",
//           description: "Unable to copy to clipboard",
//           variant: "destructive",
//         })
//       })
//   }

//   const summaryStats = {
//     totalClusters: filteredAndSortedClusters.length,
//     totalSolFunded: filteredAndSortedClusters.reduce((sum, cluster) => sum + cluster.total_sol_funded, 0),
//     totalSolRemaining: filteredAndSortedClusters.reduce((sum, cluster) => sum + cluster.total_sol_remaining, 0),
//     averageChildren:
//       filteredAndSortedClusters.length > 0
//         ? filteredAndSortedClusters.reduce((sum, cluster) => sum + cluster.children_count, 0) /
//           filteredAndSortedClusters.length
//         : 0,
//     activeClusters: filteredAndSortedClusters.filter((c) => c.status === "active").length,
//     formingClusters: filteredAndSortedClusters.filter((c) => c.status === "forming").length,
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-5 bg-background rounded-lg shadow-lg space-y-5">
//       {selectedCluster && <ClusterDetail cluster={selectedCluster} onClose={closeClusterDetail} />}
//       {/* Header */}
//       <header className="text-center mb-5">
//         <h1 className="text-primary text-2xl font-bold mb-2">Solana Funding Cluster Dashboard</h1>
//         <p className="text-muted-foreground text-base">
//           Real-time monitoring of active funding clusters (≥5 children, ≥20 SOL total, 10s window). Total Active:{" "}
//           <span className="text-green-500 font-semibold">{data?.metadata.total_active}</span> | Tracked:{" "}
//           <span className="text-blue-500 font-semibold">{data?.metadata.total_tracked}</span> | Last Updated:{" "}
//           <span className="font-semibold">
//             {lastUpdateTime?.toLocaleString() || new Date(data?.metadata.timestamp || "").toLocaleString()}
//           </span>
//         </p>
//         {error && <p className="text-destructive text-base mt-2">{error}</p>}
//       </header>

//       {/* Controls */}
//       <div className="flex flex-col lg:flex-row justify-between mb-4 gap-2">
//         <Input
//           type="text"
//           placeholder="Search by Funding Wallet..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="flex-1 lg:w-1/2 p-2 text-base border border-border rounded"
//         />

//         <Select value={statusFilter} onValueChange={(value: "all" | "active" | "forming") => setStatusFilter(value)}>
//           <SelectTrigger className="lg:w-1/4 p-2 text-base border border-border rounded bg-background">
//             <SelectValue placeholder="Status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Statuses</SelectItem>
//             <SelectItem value="active">Active Only</SelectItem>
//             <SelectItem value="forming">Forming Only</SelectItem>
//           </SelectContent>
//         </Select>

//         <div className="flex gap-2">
//           <Button
//             onClick={startPolling}
//             disabled={isPolling}
//             className={`w-32 p-2 text-base rounded cursor-pointer transition-colors ${
//               isPolling
//                 ? "bg-muted hover:bg-muted/80 text-foreground"
//                 : "bg-green-500 text-white hover:bg-green-600"
//             } ${isPolling ? "" : "hover:brightness-85"}`}
//           >
//             Start Polling
//           </Button>
//           <Button
//             onClick={stopPolling}
//             disabled={!isPolling}
//             className={`w-32 p-2 text-base rounded cursor-pointer transition-colors ${
//               !isPolling
//                 ? "bg-muted hover:bg-muted/80 text-foreground"
//                 : "bg-red-500 text-white hover:bg-red-600"
//             } ${!isPolling ? "" : "hover:brightness-85"}`}
//           >
//             Stop Polling
//           </Button>
//         </div>
//       </div>

//       {/* Clusters Table */}
//       <div className="overflow-x-auto">
//         <Table className="w-full border-collapse bg-card rounded-lg overflow-hidden shadow-sm">
//           <TableHeader>
//             <TableRow className="bg-primary text-primary-foreground">
//               <TableHead className="p-3 text-left font-bold text-sm text-primary-foreground">Funding Wallet</TableHead>
//               <TableHead className="p-3 text-left font-bold text-sm text-primary-foreground">Children</TableHead>
//               <TableHead className="p-3 text-left font-bold text-sm text-primary-foreground">
//                 Total Funded SOL
//               </TableHead>
//               <TableHead className="p-3 text-left font-bold text-sm text-primary-foreground">Remaining SOL</TableHead>
//               <TableHead className="p-3 text-left font-bold text-sm text-primary-foreground">
//                 Spend Rate (SOL/min)
//               </TableHead>
//               <TableHead className="p-3 text-left font-bold text-sm text-primary-foreground">
//                 Time Remaining (sec)
//               </TableHead>
//               <TableHead className="p-3 text-left font-bold text-sm text-primary-foreground">Token Mints</TableHead>
//               <TableHead className="p-3 text-left font-bold text-sm text-primary-foreground">DEX Programs</TableHead>
//               <TableHead className="p-3 text-left font-bold text-sm text-primary-foreground">Fan Out Slot</TableHead>
//               <TableHead className="p-3 text-left font-bold text-sm text-primary-foreground">Status</TableHead>
//               <TableHead className="p-3 text-left font-bold text-sm text-primary-foreground">Age (sec)</TableHead>
//               <TableHead className="p-3 text-left font-bold text-sm text-primary-foreground">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredAndSortedClusters.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={12} className="text-center text-muted-foreground p-5">
//                   No clusters match your filters
//                 </TableCell>
//               </TableRow>
//             ) : (
//               filteredAndSortedClusters.map((cluster, index) => (
//                 <TableRow key={index} className="hover:bg-muted/30 transition-colors border-b border-border">
//                   <TableCell className="p-3 text-left text-sm">{cluster.funding_wallet}</TableCell>
//                   <TableCell className="p-3 text-left text-sm">
//                     <div className="flex items-center gap-2">
//                       <span>{cluster.children_count}</span>
//                     </div>
//                   </TableCell>
//                   <TableCell className="p-3 text-left text-sm">{cluster.total_sol_funded.toFixed(2)}</TableCell>
//                   <TableCell
//                     className={`p-3 text-left text-sm font-semibold ${cluster.total_sol_remaining < 1 ? "text-destructive" : ""}`}
//                   >
//                     {cluster.total_sol_remaining.toFixed(2)}
//                   </TableCell>
//                   <TableCell className="p-3 text-left text-sm">
//                     {cluster.spend_rate_sol_per_min?.toFixed(2) ?? "N/A"}
//                   </TableCell>
//                   <TableCell className="p-3 text-left text-sm">{cluster.time_remaining_sec ?? "N/A"}</TableCell>
//                   <TableCell className="p-3 text-left text-sm">{cluster.token_mints.join(", ") || "None"}</TableCell>
//                   <TableCell className="p-3 text-left text-sm">
//                     {cluster.common_patterns.dex_programs.join(", ") || "None"}
//                   </TableCell>
//                   <TableCell className="p-3 text-left text-sm">{cluster.fan_out_slot}</TableCell>
//                   <TableCell className="p-3 text-left text-sm">
//                     <span
//                       className={`font-semibold ${cluster.status === "active" ? "text-green-500" : "text-yellow-500"}`}
//                     >
//                       {cluster.status.toUpperCase()}
//                     </span>
//                   </TableCell>
//                   <TableCell className="p-3 text-left text-sm">{cluster.cluster_age_sec}</TableCell>
//                   <TableCell className="p-3 text-left text-sm">
//                     <Button
//                       size="sm"
//                       onClick={() => toggleExpand(cluster)}
//                       className="bg-primary text-primary-foreground hover:bg-primary/90 px-2 py-1 rounded text-xs transition-colors"
//                     >
//                       Expand
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
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
