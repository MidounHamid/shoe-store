'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Zap, Star } from 'lucide-react'
// Import the function and the Type from your lib
import { listProducts, type Product, type PaginatedResponse } from '@/lib/products'

export function HotDrops() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Fetch real data from your API on component mount
  useEffect(() => {
    async function loadHotDrops() {
      try {
        const response: PaginatedResponse<Product> = await listProducts({ 
          per_page: 10,
          sort: "rating" // Fetch high-rated items for "Hot Drops"
        })
        setProducts(response.data)
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadHotDrops()
  }, [])

  // Filter logic: Items marked new or highly rated
  const trendingProducts = products.filter(p => p.isNew || p.rating >= 4.5).slice(0, 8)

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 400
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount

    container.scrollLeft = newPosition
    setScrollPosition(newPosition)
  }

  // Loading State UI
  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
          <p className="text-muted-foreground">Fetching the latest heat...</p>
        </div>
      </div>
    )
  }

  // Hide section if no products found
  if (trendingProducts.length === 0) return null

  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-3xl my-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">Hot Drops</h2>
            <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold">Trending</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {trendingProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <div className="flex-shrink-0 w-72 group cursor-pointer">
                <div className="relative mb-4 rounded-2xl overflow-hidden bg-secondary h-64">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.isNew && (
                    <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                      New Arrival
                    </div>
                  )}
                  {product.originalPrice && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Sale
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                  <h3 className="font-bold text-lg mt-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{product.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-primary">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm line-through text-muted-foreground">${product.originalPrice}</span>
                    )}
                  </div>
                  <Button className="w-full">Quick Add</Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}