"use client"

import { CanvasBackground } from "@/components/canvas-background"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Minus, Plus, Trash2, ShoppingBag, Package, Truck, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()

  const shipping = items.length > 0 ? 15.0 : 0
  const tax = totalPrice * 0.08
  const total = totalPrice + shipping + tax

  if (items.length === 0) {
    return (
      <>
        <CanvasBackground />
        <Header />
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 animate-in fade-in duration-500">
          <div className="rounded-full bg-secondary/50 p-8 backdrop-blur-sm animate-in zoom-in duration-700 delay-150">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="mb-2 mt-6 text-2xl font-bold animate-in slide-in-from-bottom-4 duration-500 delay-300">
            Your cart is empty
          </h2>
          <p className="mb-6 text-muted-foreground animate-in slide-in-from-bottom-4 duration-500 delay-500">
            Add some shoes to get started!
          </p>
          <Link href="/products" className="animate-in slide-in-from-bottom-4 duration-500 delay-700">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Continue Shopping</Button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <CanvasBackground />
      <Header />

      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold md:text-4xl animate-in slide-in-from-left duration-500">
          Shopping Cart
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item, index) => (
              <Card
                key={`${item.product.id}-${item.size}-${item.color}`}
                className="group border-border/40 bg-card/50 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 animate-in slide-in-from-left duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-secondary ring-2 ring-border/40 transition-all group-hover:ring-primary/50">
                    <Image
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase text-primary">{item.product.brand}</p>
                      <h3 className="font-semibold text-balance">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size} | Color: {item.color}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 backdrop-blur-sm transition-all hover:border-primary/50">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 transition-all hover:scale-110 hover:text-primary"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 transition-all hover:scale-110 hover:text-primary"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground transition-all hover:scale-110 hover:text-destructive"
                        onClick={() => removeItem(item.product.id, item.size, item.color)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="bg-gradient-to-br from-primary to-accent bg-clip-text text-lg font-bold text-transparent">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} each</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="animate-in slide-in-from-right duration-500 delay-300">
            <Card className="sticky top-20 border-border/40 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <h2 className="mb-6 text-xl font-bold">Order Summary</h2>

              <div className="space-y-3 border-b border-border pb-4">
                <div className="flex justify-between text-sm transition-colors hover:text-foreground">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm transition-colors hover:text-foreground">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm transition-colors hover:text-foreground">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between py-4 text-lg font-bold">
                <span>Total</span>
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Link href="/checkout">
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
              </Link>

              <Link href="/products">
                <Button
                  variant="outline"
                  className="mt-3 w-full bg-transparent transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
                >
                  Continue Shopping
                </Button>
              </Link>

              <div className="mt-6 space-y-3 border-t border-border pt-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Free shipping on orders over $100</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Easy 30-day returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Secure checkout guaranteed</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
