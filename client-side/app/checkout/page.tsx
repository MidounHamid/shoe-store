"use client"

import type React from "react"

import { CanvasBackground } from "@/components/canvas-background"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/lib/cart-context"
import { CreditCard, Lock, MapPin, Package, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  const shipping = items.length > 0 ? 15.0 : 0
  const tax = totalPrice * 0.08
  const total = totalPrice + shipping + tax

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setOrderComplete(true)
    clearCart()

    // Redirect after 3 seconds
    setTimeout(() => {
      router.push("/")
    }, 3000)
  }

  if (items.length === 0 && !orderComplete) {
    router.push("/cart")
    return null
  }

  if (orderComplete) {
    return (
      <>
        <CanvasBackground />
        <Header />
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
          <div className="animate-in zoom-in duration-700 rounded-full bg-green-500/20 p-8 backdrop-blur-sm">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="mb-2 mt-6 text-3xl font-bold animate-in slide-in-from-bottom-4 duration-500 delay-300">
            Order Placed Successfully!
          </h2>
          <p className="mb-4 text-muted-foreground animate-in slide-in-from-bottom-4 duration-500 delay-500">
            Thank you for your purchase. Your order confirmation has been sent to your email.
          </p>
          <p className="text-sm text-muted-foreground animate-in slide-in-from-bottom-4 duration-500 delay-700">
            Redirecting to homepage...
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <CanvasBackground />
      <Header />

      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold md:text-4xl animate-in slide-in-from-left duration-500">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* Shipping Information */}
              <Card className="border-border/40 bg-card/50 p-6 backdrop-blur-sm animate-in slide-in-from-left duration-500">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Shipping Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        required
                        placeholder="John Doe"
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      required
                      placeholder="123 Main Street, Apt 4B"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        required
                        placeholder="New York"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        required
                        placeholder="NY"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        required
                        placeholder="10001"
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="border-border/40 bg-card/50 p-6 backdrop-blur-sm animate-in slide-in-from-left duration-500 delay-200">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Payment Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      required
                      placeholder="1234 5678 9012 3456"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                      className="bg-background/50"
                      maxLength={19}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name *</Label>
                    <Input
                      id="cardName"
                      required
                      placeholder="John Doe"
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date *</Label>
                      <Input
                        id="expiryDate"
                        required
                        placeholder="MM/YY"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                        className="bg-background/50"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        required
                        placeholder="123"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                        className="bg-background/50"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Your payment information is secure and encrypted</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="animate-in slide-in-from-right duration-500 delay-300">
              <Card className="sticky top-20 border-border/40 bg-card/50 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Order Summary</h2>
                </div>

                <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                        <Image
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-balance leading-tight">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: {item.size} | Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-border py-4 text-lg font-bold">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30"
                  size="lg"
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
