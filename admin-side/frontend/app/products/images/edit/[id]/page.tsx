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

export type ProductImageSet = {
  id: number
  product_id: number
  variant_id: number | null
  main_image: string | null // Full URL from Controller
  second_images: string[] | null // Array of full URLs from Controller
  display_order: number
}

export default function EditProductImagePage() {
  const { id } = useParams()
  const router = useRouter()
  const [imageSet, setImageSet] = useState<ProductImageSet | null>(null)
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

        if (!response.ok) throw new Error("Failed to fetch image data")

        const data = await response.json()
        
        // Ensure second_images is an array
        if (data.second_images && typeof data.second_images === 'string') {
          data.second_images = JSON.parse(data.second_images)
        }
        
        setImageSet(data)
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "Failed to load product images",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchImage()
  }, [id])

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen"><Loading /></div>
      ) : imageSet ? (
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Product Images</h1>
              <p className="text-gray-600">Update main and secondary images</p>
            </div>
          </div>
          <ProductImageForm initialData={imageSet} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Image set not found</p>
        </div>
      )}
    </Layout>
  )
}