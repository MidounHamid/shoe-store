"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layouts/layout"
import DataTable from "@/components/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

export type Address = {
  id: number
  user_id: number
  label: string
  full_name: string
  street_address: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string | null
  is_default: boolean
  user_name?: string
  created_at: string
}

const columns: ColumnDef<Address>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "user_name",
    header: "User",
    cell: ({ row }) => row.original.user_name || `User #${row.original.user_id}`,
  },
  { accessorKey: "label", header: "Label" },
  { accessorKey: "full_name", header: "Full Name" },
  { accessorKey: "city", header: "City" },
  { accessorKey: "country", header: "Country" },
  {
    accessorKey: "is_default",
    header: "Default",
    cell: ({ row }) => (
      <Badge variant={row.original.is_default ? "default" : "secondary"}>
        {row.original.is_default ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function AddressesListPage() {
  const [data, setData] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
      if (!response.ok) throw new Error("Failed to fetch addresses")
      const result = await response.json()
      const addresses = result.data || result
      setData(Array.isArray(addresses) ? addresses : [])
    } catch (error) {
      console.error("Error fetching addresses:", error)
      toast({ title: "Error", description: "Failed to load addresses", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (address: Address) => router.push(`/addresses/${address.id}`)

  return (
    <Layout>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="full_name"
          title="Addresses List"
          searchPlaceholder="Search by name..."
          onViewDetails={handleViewDetails}
          service="addresses"
        />
      </div>
    </Layout>
  )
}

