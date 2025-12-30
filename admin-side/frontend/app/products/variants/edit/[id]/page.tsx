"use client"

import { Layout } from "@/components/layouts/layout"
import ProductVariantForm from "@/components/products/ProductVariantForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth"
import { Loading } from "@/components/ui/loading"
import { toast } from "@/components/ui/use-toast"

export type ProductVariant = {
  id: number
  product_id: number
  sku: string
  size_id: number | null
  color: string | null
  price: number
  original_price: number | null
  stock: number
}

export default function EditProductVariantPage() {
  const { id } = useParams()
  const router = useRouter()
  const [variant, setVariant] = useState<ProductVariant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVariant() {
      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-variants/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (!response.ok) throw new Error("Failed to fetch product variant")

        const data = await response.json()
        setVariant(data)
      } catch (error) {
        console.error("Error fetching product variant:", error)
        toast({
          title: "Error",
          description: "Failed to load product variant",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchVariant()
    }
  }, [id])

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loading />
        </div>
      ) : variant ? (
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
              <h1 className="text-2xl font-bold">Edit Product Variant</h1>
              <p className="text-gray-600">Update variant information</p>
            </div>
          </div>
          <ProductVariantForm initialData={variant} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Product variant not found</p>
        </div>
      )}
    </Layout>
  )
}

