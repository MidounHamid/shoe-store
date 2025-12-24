"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/products"

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "")
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const router = useRouter()

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size")
      return
    }
    addItem(product, selectedSize, selectedColor, quantity)
    router.push("/cart")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
            <div className="relative aspect-square">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
          </Card>
          <div className="grid grid-cols-4 gap-4">
            {(product.images || [product.image, product.image, product.image, product.image])
              .slice(0, 4)
              .map((img, i) => (
                <Card
                  key={i}
                  className="cursor-pointer overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            {product.isNew && <Badge className="mb-2 bg-accent text-accent-foreground">New Arrival</Badge>}
            <h1 className="text-3xl font-bold md:text-4xl">{product.name}</h1>
            <p className="mt-2 text-xl text-primary">{product.brand}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold">${product.price.toFixed(2)}</div>
            {product.originalPrice && (
              <div className="text-xl text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-3 block text-sm font-semibold">Select Color</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    onClick={() => setSelectedColor(color)}
                    className={selectedColor === color ? "bg-primary text-primary-foreground" : ""}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold">Select Size</label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className={selectedSize === size ? "bg-primary text-primary-foreground" : ""}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold">Quantity</label>
              <div className="flex w-32 items-center gap-2 rounded-lg border border-border bg-secondary p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <span className="flex-1 text-center font-medium">{quantity}</span>
                <Button variant="ghost" size="sm" onClick={() => setQuantity(quantity + 1)} className="h-8 w-8 p-0">
                  +
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Card className="border-border/40 bg-card/50 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-lg font-semibold">Product Details</h3>
            <p className="text-pretty text-muted-foreground">{product.description}</p>
            <ul className="mt-4 space-y-2">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="flex items-center gap-3 border-border/40 bg-card/50 p-4 backdrop-blur-sm">
              <Truck className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-semibold">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over $100</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 border-border/40 bg-card/50 p-4 backdrop-blur-sm">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-semibold">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% protected</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 border-border/40 bg-card/50 p-4 backdrop-blur-sm">
              <RotateCcw className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-semibold">Easy Returns</p>
                <p className="text-xs text-muted-foreground">30-day return policy</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
