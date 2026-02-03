export interface Product {
  id: number
  name: string
  brand: string
  price: number
  originalPrice?: number | null
  image: string | null
  images?: string[]
  rating: number
  reviews: number
  isNew?: boolean
  category?: string | null
  sizes: string[]
  colors: string[]
  description: string
  features: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type ListProductsParams = {
  per_page?: number
  page?: number
  sort?: "featured" | "price-low" | "price-high" | "rating" | "name"
  brand?: string
  category?: string
  min_price?: number
  max_price?: number
  q?: string
}

/**
 * FIXED: Changed localhost to 127.0.0.1 to prevent "fetch failed" 
 * errors caused by IPv6 resolution issues in Node.js/Next.js.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

function buildQuery(params?: Record<string, string | number | undefined | null>) {
  const qs = new URLSearchParams()
  if (!params) return ""
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue
    qs.set(k, String(v))
  }
  const str = qs.toString()
  return str ? `?${str}` : ""
}

// Helper to handle fetch errors more gracefully
async function fetcher(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })
    return res
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error)
    throw new Error("Network error: Is the backend server running?")
  }
}

export async function listProducts(params?: ListProductsParams): Promise<PaginatedResponse<Product>> {
  const res = await fetcher(`${API_URL}/api/shop/products${buildQuery(params as any)}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to load products")
  return res.json()
}

export async function getProductById(id: string | number): Promise<Product | null> {
  const res = await fetcher(`${API_URL}/api/shop/products/${id}`, { cache: "no-store" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Failed to load product")
  return res.json()
}

export type BrandListItem = {
  id: number
  name: string
  slug: string
  productCount: number
}

export async function listBrands(): Promise<BrandListItem[]> {
  const res = await fetcher(`${API_URL}/api/shop/brands`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to load brands")
  return res.json()
}

export interface ShopFilters {
  brands: BrandListItem[]
  categories: { id: number; name: string; slug: string; productCount: number }[]
  colors: string[]
  sizes: string[]
  price_range: { min_price: number; max_price: number }
}

export async function getShopFilters(): Promise<ShopFilters> {
  const res = await fetcher(`${API_URL}/api/shop/filters`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to load filters")
  return res.json()
}