import { CanvasBackground } from "@/components/canvas-background"
import { Header } from "@/components/header"
import { BrandLogos } from "@/components/brand-logos"
import { ProductCard } from "@/components/product-card"
import { FilterSidebar } from "@/components/filter-sidebar"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp } from "lucide-react"
import { products } from "@/lib/products"
import Image from "next/image"

const featuredProducts = products.slice(0, 8)

export default function HomePage() {
  return (
    <>
      <CanvasBackground />
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="flex flex-col items-start gap-12 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Content */}
            <div className="flex-1 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
                <TrendingUp className="h-4 w-4" />
                <span>New Arrivals Available</span>
              </div>
              <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl xl:text-8xl mb-6 leading-tight">
                Find Your{" "}
                <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Perfect</span>{" "}
                Shoes
              </h1>
              <p className="text-pretty text-lg text-muted-foreground md:text-xl max-w-2xl mb-10">
                Discover premium sneakers from the world's most iconic brands. Elevate your style with our curated
                collection.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="px-8 bg-transparent">
                  View Collections
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-1 flex justify-center lg:justify-end w-full">
              <div className="relative w-full max-w-2xl aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-primary/20">
                <Image
                  src="data:image/jpeg;base64,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"
                  alt="Nike Air Jordan sneakers with basketball"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Logos */}
      <BrandLogos />

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-4xl font-bold md:text-5xl">Discount:</h2>
          </div>

          <div className="mb-12 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold md:text-3xl">Featured Products</h3>
              <p className="mt-2 text-muted-foreground">Handpicked selections from our premium collection</p>
            </div>
            <Button variant="ghost" className="hidden md:flex">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="w-full lg:w-64 lg:shrink-0">
              <div className="sticky top-20">
                <FilterSidebar />
              </div>
            </aside>

            <div className="flex-1">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold">SneakHub</h3>
              <p className="text-sm text-muted-foreground">
                Your destination for premium sneakers from the world's top brands.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>New Arrivals</li>
                <li>Best Sellers</li>
                <li>Sale</li>
                <li>Collections</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Contact Us</li>
                <li>Shipping Info</li>
                <li>Returns</li>
                <li>Size Guide</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            © 2025 SneakHub. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  )
}
