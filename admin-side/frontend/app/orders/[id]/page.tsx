"use client"

import { Layout } from "@/components/layouts/layout"
import OrderDetails from "@/components/orders/OrderDetails"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth"
import { Loading } from "@/components/ui/loading"
import { toast } from "@/components/ui/use-toast"

export type Order = {
  id: number
  order_number: string
  user_id: number
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  updated_at: string
}

export default function OrderDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        })
        if (!response.ok) throw new Error("Failed to fetch order")
        setOrder(await response.json())
      } catch (error) {
        console.error("Error fetching order:", error)
        toast({ title: "Error", description: "Failed to load order", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchOrder()
  }, [id])

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen"><Loading /></div>
      ) : order ? (
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 flex items-center gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-gray-600">View order information</p>
            </div>
          </div>
          <OrderDetails order={order} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen"><p className="text-red-500">Order not found</p></div>
      )}
    </Layout>
  )
}

