import { CanvasBackground } from "@/components/canvas-background"
import { Header } from "@/components/header"
import { getProductById } from "@/lib/products"
import ProductDetail from "@/components/product-detail"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return (
      <>
        <CanvasBackground />
        <Header />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold">Product Not Found</h2>
            <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <CanvasBackground />
      <Header />
      <ProductDetail product={product} />
    </>
  )
}
