"use client"

import { ClusterDashboard } from "@/components/cluster-dashboard"
import { Navigation } from "@/components/navigation"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Dashboard Content */}
      <div className="p-6">
        <ClusterDashboard />
      </div>
    </div>
  )
}
