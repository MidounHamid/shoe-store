"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layouts/layout"
import DataTable from "@/components/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

export type Review = {
  id: number
  product_id: number
  user_id: number
  rating: number
  title: string | null
  body: string | null
  product_name?: string
  user_name?: string
  created_at: string
}

const columns: ColumnDef<Review>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "product_name",
    header: "Product",
    cell: ({ row }) => row.original.product_name || `Product #${row.original.product_id}`,
  },
  {
    accessorKey: "user_name",
    header: "User",
    cell: ({ row }) => row.original.user_name || `User #${row.original.user_id}`,
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <Badge variant="default">{row.original.rating}/5</Badge>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => row.original.title || "-",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function ReviewsListPage() {
  const [data, setData] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-reviews`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
      if (!response.ok) throw new Error("Failed to fetch reviews")
      const result = await response.json()
      const reviews = result.data || result
      setData(Array.isArray(reviews) ? reviews : [])
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast({ title: "Error", description: "Failed to load reviews", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (review: Review) => router.push(`/reviews/${review.id}`)

  return (
    <Layout>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="title"
          title="Product Reviews List"
          searchPlaceholder="Search by title..."
          onViewDetails={handleViewDetails}
          service="product-reviews"
        />
      </div>
    </Layout>
  )
}

