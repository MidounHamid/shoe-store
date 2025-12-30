"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Layout } from "@/components/layouts/layout"
import DataTable from "@/components/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

export type Payment = {
  id: number
  order_id: number
  amount: number
  payment_method: string
  status: string
  transaction_id: string | null
  order_number?: string
  created_at: string
}

const columns: ColumnDef<Payment>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "order_number",
    header: "Order",
    cell: ({ row }) => row.original.order_number || `Order #${row.original.order_id}`,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `$${parseFloat(row.original.amount.toString()).toFixed(2)}`,
  },
  { accessorKey: "payment_method", header: "Method" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "completed" ? "default" : row.original.status === "pending" ? "secondary" : "destructive"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "transaction_id",
    header: "Transaction ID",
    cell: ({ row }) => row.original.transaction_id || "-",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function PaymentsListPage() {
  const [data, setData] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchPayments()
  }, [searchParams])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const status = searchParams.get("status")
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`)
      if (status) {
        url.searchParams.append("status", status)
      }
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
      if (!response.ok) throw new Error("Failed to fetch payments")
      const result = await response.json()
      const payments = result.data || result
      setData(Array.isArray(payments) ? payments : [])
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast({ title: "Error", description: "Failed to load payments", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (payment: Payment) => router.push(`/payments/${payment.id}`)

  return (
    <Layout>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="transaction_id"
          title="Payments List"
          searchPlaceholder="Search by transaction ID..."
          onViewDetails={handleViewDetails}
          service="payments"
        />
      </div>
    </Layout>
  )
}

