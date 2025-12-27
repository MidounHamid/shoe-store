"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layouts/layout"
import Statics from "@/components/statics"
import { getAuthToken } from "@/lib/auth"
import { Loading } from "@/components/ui/loading"

interface DashboardStats {
  total_revenue: number
  revenue_growth: number
  active_users: number
  users_growth: number
  orders: number
  orders_growth: number
  conversion_rate: number
  conversion_growth: number
  monthly_revenue_curve: {
    month: string;
    revenue: number;
  }[];
  recent_activities: {
    description: string;
    log_name: string;
    created_at: string;
    user_name: string;
  }[];
}



export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [period, setPeriod] = useState({
    start: `${currentYear}-01-01`,
    end: `${currentYear}-12-31`,
  });
  const [loading, setLoading] = useState(true);

  const updatePeriod = (newPeriod: { start: string, end: string }) => {
    if (newPeriod.start !== period.start || newPeriod.end !== period.end) {
      setPeriod(newPeriod);
      
      // isFetched.current = false
    }
  };


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getAuthToken()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard?start=${period.start}&end=${period.end}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch dashboard stats")
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false);
      }
    }

    fetchStats()
  }, [period])

  return (
    <ProtectedRoute>
      <Layout>
        {loading ? (
          <div className="flex items-center justify-center h-screen"><Loading /></div>
        ) : stats ? (
          <main className="overflow-hidden">
            <Statics stats={stats} period={period} setPeriod={updatePeriod} />
          </main>
        ) : (
          <div className="text-center text-destructive py-10">
            Erreur lors du chargement des données.
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  )
}
