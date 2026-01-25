"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Star, TrendingUp, Heart } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFavorites } from "@/lib/favorites-context"
import type { Product } from "@/lib/products"

interface ProductCardProps {
id: number
  name: string
  brand: string
  price: number
  image: string | null
  rating: number
  reviews: number
  isNew?: boolean
  category?: string | null; // Changed: allowed null
  sizes?: string[]
  colors?: string[]
  description?: string
  features?: string[]
  images?: string[]
  originalPrice?: number | null; // Changed: allowed null
}

export function ProductCard({
  id,
  name,
  brand,
  price,
  image,
  rating,
  reviews,
  isNew,
  category = "Lifestyle",
  sizes = ["7", "8", "9", "10", "11", "12"],
  colors = ["Default"],
  description = "",
  features = [],
  images = [],
  originalPrice,
}: ProductCardProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const isInFavorites = isFavorite(id)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const product: Product = {
      id,
      name,
      brand,
      price,
      image,
      rating,
      reviews,
      isNew,
      category,
      sizes,
      colors,
      description,
      features,
      images,
      originalPrice,
    }

    if (isInFavorites) {
      removeFavorite(id)
    } else {
      addFavorite(product)
    }
  }

  return (
    <Card className="group overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 animate-in fade-in zoom-in-95 duration-700">
      <Link href={`/product/${id}`}>
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden bg-secondary">
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              unoptimized={true}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-125 group-hover:rotate-2"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <button
              onClick={handleFavoriteClick}
              className="absolute left-2 top-2 z-10 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-background"
            >
              <Heart
                className={`h-5 w-5 transition-all duration-300 ${
                  isInFavorites ? "fill-red-500 text-red-500 scale-110" : "text-foreground hover:text-red-500"
                }`}
              />
            </button>
            {isNew && (
              <Badge className="absolute right-2 top-2 animate-in slide-in-from-right-5 bg-accent text-accent-foreground shadow-lg backdrop-blur-sm duration-500 delay-200">
                <TrendingUp className="mr-1 h-3 w-3" />
                New
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 p-4">
          <div className="w-full">
            <p className="text-xs font-medium uppercase tracking-wider text-primary transition-all group-hover:text-accent">
              {brand}
            </p>
            <h3 className="text-pretty text-sm font-semibold text-foreground line-clamp-2 transition-all group-hover:text-primary">
              {name}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 transition-all duration-300 ${
                    i < Math.floor(rating)
                      ? "fill-accent text-accent group-hover:scale-110"
                      : "text-muted-foreground group-hover:text-muted-foreground/70"
                  }`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
              ({reviews})
            </span>
          </div>
          <div className="flex w-full items-center justify-between">
            <span className="bg-gradient-to-br from-foreground to-primary bg-clip-text text-lg font-bold text-transparent transition-all group-hover:scale-110">
              ${price}
            </span>
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
            >
              Add to Cart
            </Button>
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}
