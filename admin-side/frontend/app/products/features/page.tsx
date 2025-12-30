"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layouts/layout"
import DataTable from "@/components/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

export type ProductFeature = {
  id: number
  product_id: number
  product_name?: string
  feature_text: string
  display_order: number
  created_at: string
  updated_at: string
}

const columns: ColumnDef<ProductFeature>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "product_name",
    header: "Product",
    cell: ({ row }) => row.original.product_name || `Product #${row.original.product_id}`,
  },
  {
    accessorKey: "feature_text",
    header: "Feature",
    cell: ({ row }) => (
      <div className="max-w-md">
        <p className="truncate">{row.original.feature_text}</p>
      </div>
    ),
  },
  {
    accessorKey: "display_order",
    header: "Display Order",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function ProductFeaturesPage() {
  const [data, setData] = useState<ProductFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [featureToDelete, setFeatureToDelete] = useState<ProductFeature | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-features`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch product features")

      const result = await response.json()
      const features = result.data || result
      setData(Array.isArray(features) ? features : [])
    } catch (error) {
      console.error("Error fetching product features:", error)
      toast({
        title: "Error",
        description: "Failed to load product features",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (feature: ProductFeature) => {
    router.push(`/products/${feature.product_id}`)
  }

  const handleEdit = (feature: ProductFeature) => {
    router.push(`/products/features/edit/${feature.id}`)
  }

  const onAddRowButton = () => {
    router.push("/products/features/add")
  }

  const handleDelete = (feature: ProductFeature) => {
    setFeatureToDelete(feature)
    setOpenDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!featureToDelete) return

    try {
      const token = getAuthToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product-features/${featureToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      )

      if (!response.ok) throw new Error("Failed to delete product feature")

      setData((prev) => prev.filter((f) => f.id !== featureToDelete.id))
      toast({
        title: "Success",
        description: "Product feature deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting product feature:", error)
      toast({
        title: "Error",
        description: "Failed to delete product feature",
        variant: "destructive",
      })
    } finally {
      setOpenDeleteDialog(false)
      setFeatureToDelete(null)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="feature_text"
          title="Product Features"
          searchPlaceholder="Search by feature text..."
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddRowButton={onAddRowButton}
          service="products"
          serviceName="Feature"
        />
      </div>

      <Dialog
        open={openDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDeleteDialog(false)
            setFeatureToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the feature <strong>"{featureToDelete?.feature_text}"</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false)
                setFeatureToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

