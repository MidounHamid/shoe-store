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

export type Brand = {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
}

const columns: ColumnDef<Brand>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "slug", header: "Slug" },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function BrandsListPage() {
  const [data, setData] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brands`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch brands")
      const result = await response.json()
      const brands = result.data || result
      setData(Array.isArray(brands) ? brands : [])
    } catch (error) {
      console.error("Error fetching brands:", error)
      toast({ title: "Error", description: "Failed to load brands", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (brand: Brand) => router.push(`/brands/${brand.id}`)
  const handleEdit = (brand: Brand) => router.push(`/brands/edit/${brand.id}`)
  const handleDelete = (brand: Brand) => {
    setBrandToDelete(brand)
    setOpenDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!brandToDelete) return
    try {
      const token = getAuthToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brandToDelete.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
      )
      if (!response.ok) throw new Error("Failed to delete brand")
      setData((prev) => prev.filter((b) => b.id !== brandToDelete.id))
      toast({ title: "Success", description: "Brand deleted successfully" })
    } catch (error) {
      console.error("Error deleting brand:", error)
      toast({ title: "Error", description: "Failed to delete brand", variant: "destructive" })
    } finally {
      setOpenDeleteDialog(false)
      setBrandToDelete(null)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="name"
          title="Brands List"
          searchPlaceholder="Search by name..."
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddRowButton={() => router.push("/brands/add")}
          service="brands"
        />
      </div>
      <Dialog open={openDeleteDialog} onOpenChange={(open) => !open && (setOpenDeleteDialog(false), setBrandToDelete(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>Are you sure you want to delete brand <strong>{brandToDelete?.name}</strong>? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button variant="outline" onClick={() => (setOpenDeleteDialog(false), setBrandToDelete(null))}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Yes, Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

