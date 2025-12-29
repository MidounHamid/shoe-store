"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layouts/layout"
import DataTable from "@/components/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

export type Cart = {
  id: number
  user_id: number
  user_name?: string
  items_count?: number
  total?: number
  created_at: string
  updated_at: string
}

const columns: ColumnDef<Cart>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "user_name",
    header: "User",
    cell: ({ row }) => row.original.user_name || `User #${row.original.user_id}`,
  },
  {
    accessorKey: "items_count",
    header: "Items",
    cell: ({ row }) => row.original.items_count || 0,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => row.original.total ? `$${parseFloat(row.original.total.toString()).toFixed(2)}` : "-",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function CartsListPage() {
  const [data, setData] = useState<Cart[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCarts()
  }, [])

  const fetchCarts = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/carts`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
      if (!response.ok) throw new Error("Failed to fetch carts")
      const result = await response.json()
      const carts = result.data || result
      setData(Array.isArray(carts) ? carts : [])
    } catch (error) {
      console.error("Error fetching carts:", error)
      toast({ title: "Error", description: "Failed to load carts", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (cart: Cart) => router.push(`/carts/${cart.id}`)

  return (
    <Layout>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="user_name"
          title="Carts List"
          searchPlaceholder="Search by user..."
          onViewDetails={handleViewDetails}
          service="carts"
        />
      </div>
    </Layout>
  )
}

