"use client"

import { Layout } from "@/components/layouts/layout"
import ProductForm from "@/components/products/ProductForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth"
import { Loading } from "@/components/ui/loading"
import { toast } from "@/components/ui/use-toast"

// UPDATED TYPE: Removed default_image, added main_image and second_images
export type Product = {
  id: number
  brand_id: number
  name: string
  slug: string
  short_description: string | null
  description: string | null
  main_image: string | null
  second_images?: string[] | null
  is_active: boolean
  brand_name?: string
  created_at: string
  updated_at: string
}

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (!response.ok) throw new Error("Failed to fetch product")

        const data = await response.json()
        
        // Ensure the component handles the data correctly
        setProduct(data)
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Error",
          description: "Failed to load product",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-[calc(100-64px)] min-h-[400px]">
          <Loading />
        </div>
      ) : product ? (
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Product</h1>
              <p className="text-sm text-muted-foreground">
                Updating: <span className="font-medium text-foreground">{product.name}</span>
              </p>
            </div>
          </div>
          
          {/* ProductForm will receive 'main_image' inside the initialData now */}
          <ProductForm initialData={product} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
          <p className="text-destructive font-medium">Product not found</p>
          <Button onClick={() => router.push("/products/list")}>
            Return to list
          </Button>
        </div>
      )}
    </Layout>
  )
}