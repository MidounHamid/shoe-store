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
  main_image: string | null  // Full URL from Controller
  second_images: string[] | null  // Array of full URLs from Controller
  display_order: number
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
    accessorKey: "main_image",
    header: "Main Image",
    cell: ({ row }) => (
      <div className="w-16 h-16 relative border rounded overflow-hidden bg-gray-50">
        {row.original.main_image ? (
          <Image
            src={row.original.main_image}
            alt="Main"
            fill
            className="object-contain"
            sizes="64px"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[10px] text-gray-400">No Image</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "second_images",
    header: "Secondary Images",
    cell: ({ row }) => {
      const images = row.original.second_images
      const count = Array.isArray(images) ? images.length : 0
      
      return (
        <div className="flex items-center gap-2">
          <Badge variant={count > 0 ? "default" : "secondary"}>
            {count} {count === 1 ? 'image' : 'images'}
          </Badge>
          {count > 0 && (
            <div className="flex -space-x-2">
              {images!.slice(0, 3).map((url, idx) => (
                <div key={idx} className="w-8 h-8 relative border-2 border-white rounded-full overflow-hidden bg-gray-50">
                  <Image
                    src={url}
                    alt={`Thumb ${idx}`}
                    fill
                    className="object-cover"
                    sizes="32px"
                    unoptimized
                  />
                </div>
              ))}
              {count > 3 && (
                <div className="w-8 h-8 flex items-center justify-center border-2 border-white rounded-full bg-gray-200 text-[10px] font-semibold">
                  +{count - 3}
                </div>
              )}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "display_order",
    header: "Order",
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
      const images = Array.isArray(result) ? result : (result.data || [])
      setData(images)
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
        description: "Image set deleted successfully",
      })
    } catch (error) {
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
          searchColumn="product_name"
          title="Product Image Management"
          searchPlaceholder="Search by product name..."
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddRowButton={onAddRowButton}
          service="products"
          serviceName="Image Set"
        />
      </div>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Image Set?</DialogTitle>
            <DialogDescription>
              This will permanently delete the Main Image and all associated Secondary Images for this entry.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Confirm Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}