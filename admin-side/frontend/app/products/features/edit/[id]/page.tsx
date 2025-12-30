"use client"

import { Layout } from "@/components/layouts/layout"
import ProductFeatureForm from "@/components/products/ProductFeatureForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth"
import { Loading } from "@/components/ui/loading"
import { toast } from "@/components/ui/use-toast"

export type ProductFeature = {
  id: number
  product_id: number
  feature_text: string
  display_order: number
}

export default function EditProductFeaturePage() {
  const { id } = useParams()
  const router = useRouter()
  const [feature, setFeature] = useState<ProductFeature | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeature() {
      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-features/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (!response.ok) throw new Error("Failed to fetch product feature")

        const data = await response.json()
        setFeature(data)
      } catch (error) {
        console.error("Error fetching product feature:", error)
        toast({
          title: "Error",
          description: "Failed to load product feature",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchFeature()
    }
  }, [id])

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loading />
        </div>
      ) : feature ? (
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Product Feature</h1>
              <p className="text-gray-600">Update feature information</p>
            </div>
          </div>
          <ProductFeatureForm initialData={feature} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Product feature not found</p>
        </div>
      )}
    </Layout>
  )
}

