"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Image as ImageIcon, Calendar, Tag, Layers } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

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

  // Helper function to validate URLs to prevent Next.js Image crash
  const isValidUrl = (url: string | null | undefined) => {
    if (!url || typeof url !== 'string' || url.trim() === "") return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      // If it's a relative path starting with /, it's valid for Next.js
      return url.startsWith('/');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* --- MEDIA SECTION --- */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              Product Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square rounded-md overflow-hidden border bg-muted">
              {isValidUrl(product.main_image) ? (
                <Image
                  src={product.main_image!}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={product.main_image?.startsWith('http')}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ImageIcon className="w-10 h-10 opacity-20" />
                  <span className="text-xs mt-2">No Image Available</span>
                </div>
              )}
            </div>

            {/* Gallery Grid with fix for empty/invalid strings */}
            {product.second_images && product.second_images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {product.second_images
                  .filter(img => isValidUrl(img)) // Filter out empty strings or bad URLs
                  .map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded border overflow-hidden bg-muted">
                      <Image
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        fill
                        className="object-cover hover:opacity-80 transition-opacity cursor-pointer"
                        unoptimized // Bypasses domain check to prevent crashing
                      />
                    </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Created:
              </span>
              <span className="font-medium">
                {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> ID:
              </span>
              <span className="font-mono">{product.id}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="h-full">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <CardDescription className="font-mono text-xs mt-1">
                  slug: {product.slug}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={product.is_active ? "default" : "secondary"} className="h-6">
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => router.push(`/products/edit/${product.id}`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Brand</h4>
                <p className="text-lg font-semibold text-blue-600">{product.brand_name || "Unbranded"}</p>
              </div>
            </div>

            <div className="space-y-6">
              {product.short_description && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Short Summary</h4>
                  <p className="text-slate-700 leading-relaxed italic border-l-4 pl-4 border-slate-200">
                    "{product.short_description}"
                  </p>
                </div>
              )}

              {product.description && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Full Description</h4>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" /> Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.categories && product.categories.length > 0 ? (
                    product.categories.map((cat) => (
                      <Badge key={cat.id} variant="secondary" className="rounded-sm">
                        {cat.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No categories assigned</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags && product.tags.length > 0 ? (
                    product.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        #{tag.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}