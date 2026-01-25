import { CanvasBackground } from "@/components/canvas-background"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { listBrands } from "@/lib/products"

const gradients = [
  "from-orange-500 to-red-600",
  "from-blue-500 to-cyan-600",
  "from-yellow-500 to-orange-600",
  "from-gray-500 to-slate-600",
  "from-red-500 to-black",
  "from-indigo-500 to-purple-600",
]

export default async function BrandsPage() {
  let brands: Awaited<ReturnType<typeof listBrands>> = []
  try {
    brands = await listBrands()
  } catch {
    brands = []
  }
  return (
    <>
      <CanvasBackground />
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Our Brands</h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Discover premium sneakers from the world's most iconic brands. Each one brings unique innovation, style, and
            heritage to your collection.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand, idx) => (
            <Card
              key={brand.name}
              className="group overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${
                      gradients[idx % gradients.length]
                    } text-xl font-bold text-white shadow-lg`}
                  >
                    {brand.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{brand.productCount}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                </div>

                <h2 className="mb-2 text-2xl font-bold">{brand.name}</h2>
                <p className="mb-4 text-pretty text-sm text-muted-foreground">
                  Explore all products from {brand.name}.
                </p>

                <Link href={`/products?brand=${brand.slug}`}>
                  <Button
                    variant="outline"
                    className="w-full gap-2 bg-transparent transition-all group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    Shop {brand.name}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
