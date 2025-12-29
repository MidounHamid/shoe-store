"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layouts/layout"
import DataTable from "@/components/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

export type Favorite = {
  id: number
  user_id: number
  product_id: number
  user_name?: string
  product_name?: string
  created_at: string
}

const columns: ColumnDef<Favorite>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "user_name",
    header: "User",
    cell: ({ row }) => row.original.user_name || `User #${row.original.user_id}`,
  },
  {
    accessorKey: "product_name",
    header: "Product",
    cell: ({ row }) => row.original.product_name || `Product #${row.original.product_id}`,
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function FavoritesListPage() {
  const [data, setData] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
      if (!response.ok) throw new Error("Failed to fetch favorites")
      const result = await response.json()
      const favorites = result.data || result
      setData(Array.isArray(favorites) ? favorites : [])
    } catch (error) {
      console.error("Error fetching favorites:", error)
      toast({ title: "Error", description: "Failed to load favorites", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (favorite: Favorite) => router.push(`/favorites/${favorite.id}`)

  return (
    <Layout>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="user_name"
          title="Favorites List"
          searchPlaceholder="Search by user..."
          onViewDetails={handleViewDetails}
          service="favorites"
        />
      </div>
    </Layout>
  )
}

