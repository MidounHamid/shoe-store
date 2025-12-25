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
                  src="/images/image.png"
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
