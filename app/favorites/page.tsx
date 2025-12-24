"use client"

import { useFavorites } from "@/lib/favorites-context"
import { useCart } from "@/lib/cart-context"
import { Header } from "@/components/header"
import { CanvasBackground } from "@/components/canvas-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, X, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites()
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>({})

  const handleAddToCart = (productId: string) => {
    const product = favorites.find((p) => p.id === productId)
    if (product) {
      const size = selectedSize[productId] || product.sizes[0]
      const color = product.colors[0]
      addItem(product, size, color, 1)
    }
  }

  if (favorites.length === 0) {
    return (
      <>
        <CanvasBackground />
        <Header />
        <main className="relative min-h-screen">
          <div className="container mx-auto px-4 py-16">
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-6 backdrop-blur-sm">
                <Heart className="h-16 w-16 text-primary" />
              </div>
              <h1 className="mt-6 text-3xl font-bold">Your Favorites is Empty</h1>
              <p className="mt-2 text-muted-foreground">Start adding shoes you love to your favorites!</p>
              <Link href="/products">
                <Button className="mt-6 bg-gradient-to-r from-primary to-accent">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <CanvasBackground />
      <Header />
      <main className="relative min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">My Favorites</h1>
            <p className="mt-2 text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? "item" : "items"} in your wishlist
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((product, index) => (
              <Card
                key={product.id}
                className="group overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <Link href={`/product/${product.id}`}>
                      <div className="relative aspect-square overflow-hidden bg-secondary">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                        />
                      </div>
                    </Link>
                    <button
                      onClick={() => removeFavorite(product.id)}
                      className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-4">
                    <Link href={`/product/${product.id}`}>
                      <p className="text-xs font-medium uppercase tracking-wider text-primary">{product.brand}</p>
                      <h3 className="text-pretty text-sm font-semibold text-foreground line-clamp-2">{product.name}</h3>
                    </Link>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">${product.price}</span>
                    </div>

                    <div className="mt-3">
                      <label className="text-xs text-muted-foreground">Size:</label>
                      <select
                        value={selectedSize[product.id] || product.sizes[0]}
                        onChange={(e) => setSelectedSize((prev) => ({ ...prev, [product.id]: e.target.value }))}
                        className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                      >
                        {product.sizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      className="mt-3 w-full bg-gradient-to-r from-primary to-accent transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
