"use client"

import { useEffect, useState } from "react"
import { CanvasBackground } from "@/components/canvas-background"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { FilterSidebar } from "@/components/filter-sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listProducts, type Product } from "@/lib/products"
import { useSearchParams } from "next/navigation"

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState("featured")
  const searchParams = useSearchParams()
  const brand = searchParams.get("brand") || undefined

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await listProducts({ per_page: 60, sort: sortBy as any, brand })
        if (!cancelled) setProducts(res.data)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load products")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [sortBy, brand])

  return (
    <>
      <CanvasBackground />
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">All Shoes</h1>
          <p className="text-muted-foreground">Browse our complete collection of premium sneakers</p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${products.length} products found`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-card/50 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-64 lg:shrink-0">
            <div className="sticky top-20">
              <FilterSidebar />
            </div>
          </aside>

          <div className="flex-1">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {error ? (
                <div className="text-sm text-red-500">{error}</div>
              ) : (
                products.map((product) => <ProductCard key={product.id} {...product} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
