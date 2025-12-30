"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Layout } from "@/components/layouts/layout"
import DataTable from "@/components/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

export type Order = {
  id: number
  order_number: string
  user_id: number
  user_name?: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  updated_at: string
}

const columns: ColumnDef<Order>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "order_number", header: "Order Number" },
  {
    accessorKey: "user_name",
    header: "Customer",
    cell: ({ row }) => row.original.user_name || `User #${row.original.user_id}`,
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => `$${parseFloat(row.original.total_amount.toString()).toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "completed" ? "default" : "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "payment_status",
    header: "Payment",
    cell: ({ row }) => (
      <Badge variant={row.original.payment_status === "paid" ? "default" : "destructive"}>
        {row.original.payment_status}
      </Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function OrdersListPage() {
  const [data, setData] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchOrders()
  }, [searchParams])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const status = searchParams.get("status")
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`)
      if (status) {
        url.searchParams.append("status", status)
      }
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
      if (!response.ok) throw new Error("Failed to fetch orders")
      const result = await response.json()
      const orders = result.data || result
      setData(Array.isArray(orders) ? orders : [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (order: Order) => router.push(`/orders/${order.id}`)
  const handleDelete = (order: Order) => {
    setOrderToDelete(order)
    setOpenDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!orderToDelete) return
    try {
      const token = getAuthToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderToDelete.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
      )
      if (!response.ok) throw new Error("Failed to delete order")
      setData((prev) => prev.filter((o) => o.id !== orderToDelete.id))
      toast({ title: "Success", description: "Order deleted successfully" })
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({ title: "Error", description: "Failed to delete order", variant: "destructive" })
    } finally {
      setOpenDeleteDialog(false)
      setOrderToDelete(null)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="order_number"
          title="Orders List"
          searchPlaceholder="Search by order number..."
          onViewDetails={handleViewDetails}
          onDelete={handleDelete}
          service="orders"
        />
      </div>
      <Dialog open={openDeleteDialog} onOpenChange={(open) => !open && (setOpenDeleteDialog(false), setOrderToDelete(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>Are you sure you want to delete order <strong>{orderToDelete?.order_number}</strong>? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button variant="outline" onClick={() => (setOpenDeleteDialog(false), setOrderToDelete(null))}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Yes, Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

