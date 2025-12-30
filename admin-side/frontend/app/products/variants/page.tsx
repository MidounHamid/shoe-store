"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layouts/layout"
import DataTable from "@/components/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

export type ProductVariant = {
  id: number
  product_id: number
  product_name?: string
  sku: string
  size_id: number | null
  size_name?: string
  color: string | null
  price: number
  original_price: number | null
  stock: number
  attributes: any
  created_at: string
  updated_at: string
}

const columns: ColumnDef<ProductVariant>[] = [
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
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "size_name",
    header: "Size",
    cell: ({ row }) => row.original.size_name || "-",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => row.original.color || "-",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `$${parseFloat(row.original.price.toString()).toFixed(2)}`,
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <Badge variant={row.original.stock > 0 ? "default" : "destructive"}>
        {row.original.stock}
      </Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function ProductVariantsPage() {
  const [data, setData] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState<ProductVariant | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchVariants()
  }, [])

  const fetchVariants = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-variants`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch product variants")

      const result = await response.json()
      const variants = result.data || result
      setData(Array.isArray(variants) ? variants : [])
    } catch (error) {
      console.error("Error fetching product variants:", error)
      toast({
        title: "Error",
        description: "Failed to load product variants",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (variant: ProductVariant) => {
    router.push(`/products/${variant.product_id}`)
  }

  const handleEdit = (variant: ProductVariant) => {
    router.push(`/products/variants/edit/${variant.id}`)
  }

  const onAddRowButton = () => {
    router.push("/products/variants/add")
  }

  const handleDelete = (variant: ProductVariant) => {
    setVariantToDelete(variant)
    setOpenDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!variantToDelete) return

    try {
      const token = getAuthToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product-variants/${variantToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      )

      if (!response.ok) throw new Error("Failed to delete product variant")

      setData((prev) => prev.filter((v) => v.id !== variantToDelete.id))
      toast({
        title: "Success",
        description: "Product variant deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting product variant:", error)
      toast({
        title: "Error",
        description: "Failed to delete product variant",
        variant: "destructive",
      })
    } finally {
      setOpenDeleteDialog(false)
      setVariantToDelete(null)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="sku"
          title="Product Variants"
          searchPlaceholder="Search by SKU or product name..."
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddRowButton={onAddRowButton}
          service="products"
          serviceName="Variant"
        />
      </div>

      <Dialog
        open={openDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDeleteDialog(false)
            setVariantToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete variant <strong>{variantToDelete?.sku}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false)
                setVariantToDelete(null)
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

