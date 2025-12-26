import { CanvasBackground } from "@/components/canvas-background"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Truck, Shield, Heart } from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: Package,
      title: "Premium Quality",
      description: "Every shoe in our collection is authentic and sourced directly from authorized retailers.",
    },
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Free express shipping on orders over $150. Get your sneakers delivered within 2-3 business days.",
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Shop with confidence. All transactions are encrypted and your data is protected.",
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Our dedicated support team is here to help you find the perfect pair for your style.",
    },
  ]

  return (
    <>
      <CanvasBackground />
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl lg:text-6xl">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SneakHub</span>
          </h1>
          <p className="mx-auto max-w-3xl text-pretty text-lg text-muted-foreground md:text-xl">
            Your ultimate destination for premium sneakers from the world's most iconic brands. We're passionate about
            helping you find the perfect shoes that match your style and elevate your game.
          </p>
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <Card className="border-border/40 bg-card/50 p-8 backdrop-blur-sm md:p-12">
            <h2 className="mb-6 text-3xl font-bold">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in 2025, SneakHub was born from a simple idea: make premium sneakers accessible to everyone who
                loves great footwear. What started as a small passion project has grown into a trusted destination for
                sneaker enthusiasts worldwide.
              </p>
              <p>
                We partner directly with Nike, Adidas, Puma, New Balance, Jordan, Reebok, and other leading brands to
                bring you an curated collection of the latest releases, timeless classics, and hard-to-find gems. Every
                product in our store is 100% authentic and backed by our satisfaction guarantee.
              </p>
              <p>
                Whether you're a serious collector, a casual wearer, or an athlete looking for performance footwear,
                we're here to help you find exactly what you need. Our team of sneaker experts carefully selects each
                product to ensure we offer only the best quality and style.
              </p>
            </div>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-bold">Why Choose SneakHub</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card
                key={value.title}
                className="border-border/40 bg-card/50 p-6 backdrop-blur-sm transition-all hover:scale-105 hover:border-primary/50"
              >
                <CardContent className="p-0">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{value.title}</h3>
                  <p className="text-pretty text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <Card className="border-border/40 bg-card/50 p-8 backdrop-blur-sm md:p-12">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <p className="mb-2 text-4xl font-bold text-primary">50K+</p>
              <p className="text-sm text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <p className="mb-2 text-4xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Premium Products</p>
            </div>
            <div>
              <p className="mb-2 text-4xl font-bold text-primary">6</p>
              <p className="text-sm text-muted-foreground">Iconic Brands</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
