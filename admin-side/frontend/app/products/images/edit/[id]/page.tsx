"use client"

import { Layout } from "@/components/layouts/layout"
import ProductImageForm from "@/components/products/ProductImageForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth"
import { Loading } from "@/components/ui/loading"
import { toast } from "@/components/ui/use-toast"

export type ProductImage = {
  id: number
  product_id: number
  variant_id: number | null
  image_url: string
  display_order: number
  is_principal: boolean
}

export default function EditProductImagePage() {
  const { id } = useParams()
  const router = useRouter()
  const [image, setImage] = useState<ProductImage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchImage() {
      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-images/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (!response.ok) throw new Error("Failed to fetch product image")

        const data = await response.json()
        setImage(data)
      } catch (error) {
        console.error("Error fetching product image:", error)
        toast({
          title: "Error",
          description: "Failed to load product image",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchImage()
    }
  }, [id])

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loading />
        </div>
      ) : image ? (
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
              <h1 className="text-2xl font-bold">Edit Product Image</h1>
              <p className="text-gray-600">Update image information</p>
            </div>
          </div>
          <ProductImageForm initialData={image} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Product image not found</p>
        </div>
      )}
    </Layout>
  )
}

