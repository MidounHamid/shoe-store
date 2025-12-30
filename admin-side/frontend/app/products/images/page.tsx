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
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export type ProductImage = {
  id: number
  product_id: number
  product_name?: string
  variant_id: number | null
  image_url: string
  display_order: number
  is_principal: boolean
  created_at: string
  updated_at: string
}

const columns: ColumnDef<ProductImage>[] = [
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
    accessorKey: "variant_id",
    header: "Variant ID",
    cell: ({ row }) => row.original.variant_id || "-",
  },
  {
    accessorKey: "image_url",
    header: "Image",
    cell: ({ row }) => (
      <div className="w-16 h-16 relative border rounded overflow-hidden">
        <Image
          src={row.original.image_url}
          alt="Product image"
          fill
          className="object-cover"
          sizes="64px"
          unoptimized
        />
      </div>
    ),
  },
  {
    accessorKey: "display_order",
    header: "Display Order",
  },
  {
    accessorKey: "is_principal",
    header: "Principal",
    cell: ({ row }) => (
      <Badge variant={row.original.is_principal ? "default" : "secondary"}>
        {row.original.is_principal ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function ProductImagesPage() {
  const [data, setData] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<ProductImage | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-images`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch product images")

      const result = await response.json()
      const images = result.data || result
      setData(Array.isArray(images) ? images : [])
    } catch (error) {
      console.error("Error fetching product images:", error)
      toast({
        title: "Error",
        description: "Failed to load product images",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (image: ProductImage) => {
    router.push(`/products/${image.product_id}`)
  }

  const handleEdit = (image: ProductImage) => {
    router.push(`/products/images/edit/${image.id}`)
  }

  const onAddRowButton = () => {
    router.push("/products/images/add")
  }

  const handleDelete = (image: ProductImage) => {
    setImageToDelete(image)
    setOpenDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!imageToDelete) return

    try {
      const token = getAuthToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product-images/${imageToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      )

      if (!response.ok) throw new Error("Failed to delete product image")

      setData((prev) => prev.filter((img) => img.id !== imageToDelete.id))
      toast({
        title: "Success",
        description: "Product image deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting product image:", error)
      toast({
        title: "Error",
        description: "Failed to delete product image",
        variant: "destructive",
      })
    } finally {
      setOpenDeleteDialog(false)
      setImageToDelete(null)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="image_url"
          title="Product Images"
          searchPlaceholder="Search by image URL..."
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddRowButton={onAddRowButton}
          service="products"
          serviceName="Image"
        />
      </div>

      <Dialog
        open={openDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDeleteDialog(false)
            setImageToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false)
                setImageToDelete(null)
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

