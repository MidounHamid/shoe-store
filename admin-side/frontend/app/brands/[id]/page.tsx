"use client"

import { Layout } from "@/components/layouts/layout"
import BrandDetails from "@/components/brands/BrandDetails"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth"
import { Loading } from "@/components/ui/loading"
import { toast } from "@/components/ui/use-toast"

export type Brand = {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export default function BrandDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBrand() {
      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brands/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        })
        if (!response.ok) throw new Error("Failed to fetch brand")
        setBrand(await response.json())
      } catch (error) {
        console.error("Error fetching brand:", error)
        toast({ title: "Error", description: "Failed to load brand", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchBrand()
  }, [id])

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen"><Loading /></div>
      ) : brand ? (
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 flex items-center gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Brand Details</h1>
              <p className="text-gray-600">View brand information</p>
            </div>
          </div>
          <BrandDetails brand={brand} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen"><p className="text-red-500">Brand not found</p></div>
      )}
    </Layout>
  )
}

