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

export type Tag = {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
}

const columns: ColumnDef<Tag>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "slug", header: "Slug" },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function TagsListPage() {
  const [data, setData] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
      if (!response.ok) throw new Error("Failed to fetch tags")
      const result = await response.json()
      const tags = result.data || result
      setData(Array.isArray(tags) ? tags : [])
    } catch (error) {
      console.error("Error fetching tags:", error)
      toast({ title: "Error", description: "Failed to load tags", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (tag: Tag) => router.push(`/tags/${tag.id}`)
  const handleEdit = (tag: Tag) => router.push(`/tags/edit/${tag.id}`)
  const handleDelete = (tag: Tag) => {
    setTagToDelete(tag)
    setOpenDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!tagToDelete) return
    try {
      const token = getAuthToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tags/${tagToDelete.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
      )
      if (!response.ok) throw new Error("Failed to delete tag")
      setData((prev) => prev.filter((t) => t.id !== tagToDelete.id))
      toast({ title: "Success", description: "Tag deleted successfully" })
    } catch (error) {
      console.error("Error deleting tag:", error)
      toast({ title: "Error", description: "Failed to delete tag", variant: "destructive" })
    } finally {
      setOpenDeleteDialog(false)
      setTagToDelete(null)
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
          title="Tags List"
          searchPlaceholder="Search by name..."
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddRowButton={() => router.push("/tags/add")}
          service="tags"
        />
      </div>
      <Dialog open={openDeleteDialog} onOpenChange={(open) => !open && (setOpenDeleteDialog(false), setTagToDelete(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>Are you sure you want to delete tag <strong>{tagToDelete?.name}</strong>? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button variant="outline" onClick={() => (setOpenDeleteDialog(false), setTagToDelete(null))}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Yes, Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

