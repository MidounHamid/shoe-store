"use client"

import { Layout } from "@/components/layouts/layout"
import SizeForm from "@/components/sizes/SizeForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth"
import { Loading } from "@/components/ui/loading"
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

export default function EditSizePage() {
  const { id } = useParams()
  const router = useRouter()
  const [size, setSize] = useState<Size | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSize() {
      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sizes/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        })
        if (!response.ok) throw new Error("Failed to fetch size")
        setSize(await response.json())
      } catch (error) {
        console.error("Error fetching size:", error)
        toast({ title: "Error", description: "Failed to load size", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchSize()
  }, [id])

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen"><Loading /></div>
      ) : size ? (
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 flex items-center gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Size</h1>
              <p className="text-gray-600">Update size information</p>
            </div>
          </div>
          <SizeForm initialData={size} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen"><p className="text-red-500">Size not found</p></div>
      )}
    </Layout>
  )
}

