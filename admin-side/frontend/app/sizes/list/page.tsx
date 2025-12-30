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

export type Size = {
  id: number
  name: string
  code: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

const columns: ColumnDef<Size>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => row.original.code || "-",
  },
  {
    accessorKey: "display_order",
    header: "Display Order",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "secondary"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function SizesListPage() {
  const [data, setData] = useState<Size[]>([])
  const [loading, setLoading] = useState(true)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [sizeToDelete, setSizeToDelete] = useState<Size | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchSizes()
  }, [])

  const fetchSizes = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sizes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch sizes")

      const result = await response.json()
      const sizes = result.data || result
      setData(Array.isArray(sizes) ? sizes : [])
    } catch (error) {
      console.error("Error fetching sizes:", error)
      toast({
        title: "Error",
        description: "Failed to load sizes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (size: Size) => {
    router.push(`/sizes/${size.id}`)
  }

  const handleEdit = (size: Size) => {
    router.push(`/sizes/edit/${size.id}`)
  }

  const handleDelete = (size: Size) => {
    setSizeToDelete(size)
    setOpenDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!sizeToDelete) return

    try {
      const token = getAuthToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sizes/${sizeToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      )

      if (!response.ok) throw new Error("Failed to delete size")

      setData((prev) => prev.filter((s) => s.id !== sizeToDelete.id))
      toast({
        title: "Success",
        description: "Size deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting size:", error)
      toast({
        title: "Error",
        description: "Failed to delete size",
        variant: "destructive",
      })
    } finally {
      setOpenDeleteDialog(false)
      setSizeToDelete(null)
    }
  }

  const onAddRowButton = () => {
    router.push("/sizes/add")
  }

  return (
    <Layout>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="name"
          title="Sizes List"
          searchPlaceholder="Search by name or code..."
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddRowButton={onAddRowButton}
          service="sizes"
          serviceName="Size"
        />
      </div>

      <Dialog
        open={openDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDeleteDialog(false)
            setSizeToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete size <strong>{sizeToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false)
                setSizeToDelete(null)
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

