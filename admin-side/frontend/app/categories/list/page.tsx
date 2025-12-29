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

export type Category = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  parent_name?: string
  created_at: string
  updated_at: string
}

const columns: ColumnDef<Category>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "slug", header: "Slug" },
  {
    accessorKey: "parent_name",
    header: "Parent",
    cell: ({ row }) => row.original.parent_name || "Root",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function CategoriesListPage() {
  const [data, setData] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
      if (!response.ok) throw new Error("Failed to fetch categories")
      const result = await response.json()
      const categories = result.data || result
      setData(Array.isArray(categories) ? categories : [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({ title: "Error", description: "Failed to load categories", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (category: Category) => router.push(`/categories/${category.id}`)
  const handleEdit = (category: Category) => router.push(`/categories/edit/${category.id}`)
  const handleDelete = (category: Category) => {
    setCategoryToDelete(category)
    setOpenDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return
    try {
      const token = getAuthToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryToDelete.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
      )
      if (!response.ok) throw new Error("Failed to delete category")
      setData((prev) => prev.filter((c) => c.id !== categoryToDelete.id))
      toast({ title: "Success", description: "Category deleted successfully" })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" })
    } finally {
      setOpenDeleteDialog(false)
      setCategoryToDelete(null)
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
          title="Categories List"
          searchPlaceholder="Search by name..."
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddRowButton={() => router.push("/categories/add")}
          service="categories"
        />
      </div>
      <Dialog open={openDeleteDialog} onOpenChange={(open) => !open && (setOpenDeleteDialog(false), setCategoryToDelete(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>Are you sure you want to delete category <strong>{categoryToDelete?.name}</strong>? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button variant="outline" onClick={() => (setOpenDeleteDialog(false), setCategoryToDelete(null))}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Yes, Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

