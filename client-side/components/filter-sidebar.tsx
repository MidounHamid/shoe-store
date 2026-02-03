"use client"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { getShopFilters, type ShopFilters } from "@/lib/products"
import { useRouter, useSearchParams } from "next/navigation"

export function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<ShopFilters | null>(null)
  // Local state for slider to allow smooth dragging
  const [priceRange, setPriceRange] = useState([0, 500])
  const [loading, setLoading] = useState(true)

  // Sync from URL on mount
  useEffect(() => {
    const min = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : 0
    const max = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : 500
    setPriceRange([min, max])
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await getShopFilters()
        if (!cancelled) {
            setFilters(res)
            // If no price params in URL, use defaults from DB
            if (!searchParams.has("min_price") && !searchParams.has("max_price") && res.price_range) {
                setPriceRange([Number(res.price_range.min_price) || 0, Number(res.price_range.max_price) || 500])
            }
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, []) // Remove searchParams dependency here to avoid reloading filters on URL change

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset page on filter change
    params.delete("page")
    router.push(`/products?${params.toString()}`)
  }

  // Handle Price Range Change (Debounced ideally, but onCommit for now)
  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
  }

  const handlePriceCommit = (value: number[]) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("min_price", value[0].toString())
    params.set("max_price", value[1].toString())
    params.delete("page")
    router.push(`/products?${params.toString()}`)
  }

  const resetFilters = () => {
    router.push("/products")
    if (filters?.price_range) {
        setPriceRange([Number(filters.price_range.min_price), Number(filters.price_range.max_price)])
    } else {
        setPriceRange([0, 500])
    }
  }

  if (loading && !filters) {
    return <div className="space-y-4 text-sm text-muted-foreground">Loading filters...</div>
  }

  const safeFilters = filters || { brands: [], categories: [], colors: [], sizes: [], price_range: { min_price: 0, max_price: 500 } }
  const currentBrand = searchParams.get("brand")
  const currentState = searchParams.get("size")
  const currentColor = searchParams.get("color")

  return (
    <div className="space-y-4">
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Brand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {safeFilters.brands.length === 0 ? <p className="text-xs text-muted-foreground">No brands</p> : null}
          {safeFilters.brands.map((brand) => (
            <div key={brand.id} className="flex items-center gap-2">
              <Checkbox 
                id={`brand-${brand.slug}`} 
                checked={currentBrand === brand.slug}
                onCheckedChange={(checked) => updateParam("brand", checked ? brand.slug : null)}
              />
              <Label htmlFor={`brand-${brand.slug}`} className="text-sm font-normal cursor-pointer">
                {brand.name} ({brand.productCount})
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {safeFilters.sizes.length === 0 ? <p className="col-span-4 text-xs text-muted-foreground">No sizes</p> : null}
            {safeFilters.sizes.map((size) => (
              <Button
                key={size}
                variant={currentState === size ? "default" : "outline"}
                size="sm"
                className={`hover:bg-primary hover:text-primary-foreground ${currentState === size ? "" : "bg-transparent"}`}
                onClick={() => updateParam("size", currentState === size ? null : size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            onValueCommit={handlePriceCommit}
            min={Number(safeFilters.price_range.min_price) || 0}
            max={Number(safeFilters.price_range.max_price) || 500}
            step={1}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Color</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {safeFilters.colors.length === 0 ? <p className="text-xs text-muted-foreground">No colors</p> : null}
          {safeFilters.colors.map((color) => (
            <div key={color} className="flex items-center gap-2">
              <Checkbox 
                id={`color-${color}`} 
                checked={currentColor === color}
                onCheckedChange={(checked) => updateParam("color", checked ? color : null)}
              />
              <Label htmlFor={`color-${color}`} className="text-sm font-normal cursor-pointer">
                {color}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full bg-transparent" variant="outline" onClick={resetFilters}>
        Reset Filters
      </Button>
    </div>
  )
}
