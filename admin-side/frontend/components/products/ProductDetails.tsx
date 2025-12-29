"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export type Product = {
  id: number
  brand_id: number
  name: string
  slug: string
  short_description: string | null
  description: string | null
  default_image: string | null
  is_active: boolean
  brand_name?: string
  categories?: any[]
  tags?: any[]
  created_at: string
  updated_at: string
}

interface ProductDetailsProps {
  product: Product
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Product details and specifications</CardDescription>
            </div>
            <Button onClick={() => router.push(`/products/edit/${product.id}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {product.default_image && (
            <div className="mb-4">
              <Image
                src={product.default_image}
                alt={product.name}
                width={300}
                height={300}
                className="rounded-lg object-cover"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">ID</label>
              <p className="text-lg">{product.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg">{product.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Slug</label>
              <p className="text-lg">{product.slug}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Brand</label>
              <p className="text-lg">{product.brand_name || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Created At</label>
              <p className="text-lg">{new Date(product.created_at).toLocaleString()}</p>
            </div>
          </div>
          {product.short_description && (
            <div>
              <label className="text-sm font-medium text-gray-500">Short Description</label>
              <p className="text-lg mt-1">{product.short_description}</p>
            </div>
          )}
          {product.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-lg mt-1 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
          {product.categories && product.categories.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Categories</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.categories.map((cat: any) => (
                  <Badge key={cat.id} variant="outline">{cat.name}</Badge>
                ))}
              </div>
            </div>
          )}
          {product.tags && product.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.tags.map((tag: any) => (
                  <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

