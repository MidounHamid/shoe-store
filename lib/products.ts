export interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  rating: number
  reviews: number
  isNew?: boolean
  category: string
  sizes: string[]
  colors: string[]
  description: string
  features: string[]
}

export const products: Product[] = [
  {
    id: "1",
    name: "Air Max 270 Premium",
    brand: "Nike",
    price: 189.99,
    image: "/nike-air-max-270-white-blue-sneakers.jpg",
    images: ["/nike-air-max-270-white-blue-sneakers-front.jpg", "/nike-air-max-270-white-blue-sneakers-side.jpg", "/nike-air-max-270-white-blue-sneakers-back.jpg"],
    rating: 4.5,
    reviews: 328,
    isNew: true,
    category: "Running",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["White/Blue", "Black", "Red"],
    description:
      "The Nike Air Max 270 Premium delivers unrivaled comfort and a unique Air unit heel design that's sure to turn heads. Built for all-day comfort with breathable mesh and plush cushioning.",
    features: [
      "Max Air unit provides exceptional cushioning",
      "Breathable mesh upper for ventilation",
      "Lightweight foam midsole",
      "Durable rubber outsole for traction",
    ],
  },
  {
    id: "2",
    name: "Ultraboost 23",
    brand: "Adidas",
    price: 219.99,
    image: "/adidas-ultraboost-23-black-running-shoes.jpg",
    images: ["/adidas-ultraboost-23-black-running-shoes-front.jpg", "/adidas-ultraboost-23-black-running-shoes-side.jpg", "/adidas-ultraboost-23-black-running-shoes-back.jpg"],
    rating: 4.8,
    reviews: 456,
    isNew: true,
    category: "Running",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["Black", "White", "Grey"],
    description:
      "Experience premium running performance with the Adidas Ultraboost 23. Featuring responsive Boost cushioning and a supportive Primeknit upper, these shoes deliver unmatched energy return with every stride.",
    features: [
      "Boost midsole for exceptional energy return",
      "Primeknit upper adapts to your foot",
      "Continental rubber outsole for superior grip",
      "Supportive heel counter",
    ],
  },
  {
    id: "3",
    name: "RS-X Tech",
    brand: "Puma",
    price: 149.99,
    image: "/puma-rs-x-tech-colorful-chunky-sneakers.jpg",
    images: ["/puma-rs-x-tech-colorful-chunky-sneakers-front.jpg", "/puma-rs-x-tech-colorful-chunky-sneakers-side.jpg", "/puma-rs-x-tech-colorful-chunky-sneakers-back.jpg"],
    rating: 4.3,
    reviews: 203,
    category: "Lifestyle",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["Multi", "Black/White", "Navy"],
    description:
      "Make a bold statement with the Puma RS-X Tech. This chunky sneaker combines retro aesthetics with modern comfort, featuring a mix of mesh, leather, and suede materials in eye-catching color combinations.",
    features: [
      "Chunky RS foam midsole for comfort",
      "Mix of premium materials",
      "Bold colorways and design",
      "Padded tongue and collar",
    ],
  },
  {
    id: "4",
    name: "990v6 Made in USA",
    brand: "New Balance",
    price: 199.99,
    image: "/new-balance-990v6-grey-premium-sneakers.jpg",
    images: ["/new-balance-990v6-grey-premium-sneakers-front.jpg", "/new-balance-990v6-grey-premium-sneakers-side.jpg", "/placeholder.svg?height=600&width=600"],
    rating: 4.7,
    reviews: 412,
    category: "Lifestyle",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"],
    colors: ["Grey", "Navy", "Black"],
    description:
      "The New Balance 990v6 represents the pinnacle of American craftsmanship. Made in the USA with premium materials, this heritage runner delivers exceptional comfort and timeless style.",
    features: [
      "Made in USA with premium materials",
      "ENCAP midsole technology",
      "Pigskin and mesh upper",
      "Blown rubber outsole",
    ],
  },
  {
    id: "5",
    name: "Air Jordan 1 Retro High",
    brand: "Jordan",
    price: 179.99,
    image: "/placeholder.svg?height=400&width=400",
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    rating: 4.9,
    reviews: 892,
    isNew: true,
    category: "Basketball",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"],
    colors: ["Black/Red", "White/Black", "Royal Blue"],
    description:
      "An icon since 1985, the Air Jordan 1 Retro High features premium leather, Nike Air cushioning, and the timeless silhouette that started it all. A must-have for sneaker collectors and basketball enthusiasts.",
    features: [
      "Premium leather upper",
      "Nike Air cushioning",
      "Iconic high-top design",
      "Padded collar for ankle support",
    ],
  },
  {
    id: "6",
    name: "Club C 85 Vintage",
    brand: "Reebok",
    price: 89.99,
    image: "/placeholder.svg?height=400&width=400",
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    rating: 4.4,
    reviews: 167,
    category: "Lifestyle",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["White/Green", "White/Navy", "Black"],
    description:
      "The Reebok Club C 85 Vintage is a timeless classic that brings retro tennis style to your everyday wardrobe. Featuring soft leather and a low-profile design, it pairs perfectly with any outfit.",
    features: [
      "Soft garment leather upper",
      "Low-cut design for mobility",
      "EVA midsole for lightweight cushioning",
      "High abrasion rubber outsole",
    ],
  },
  {
    id: "7",
    name: "ZoomX Vaporfly Next% 3",
    brand: "Nike",
    price: 259.99,
    image: "/placeholder.svg?height=400&width=400",
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    rating: 4.8,
    reviews: 534,
    category: "Running",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["Neon Green", "Pink", "White/Black"],
    description:
      "The Nike ZoomX Vaporfly Next% 3 is engineered for racing and speed. With ZoomX foam and a carbon fiber plate, this shoe delivers maximum energy return and propulsion for elite performance.",
    features: [
      "ZoomX foam for lightweight responsiveness",
      "Carbon fiber plate for propulsion",
      "Flyknit upper with engineered mesh",
      "Designed for marathon racing",
    ],
  },
  {
    id: "8",
    name: "Stan Smith Vegan",
    brand: "Adidas",
    price: 119.99,
    image: "/placeholder.svg?height=400&width=400",
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    rating: 4.6,
    reviews: 721,
    category: "Lifestyle",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["White/Green", "White/Navy", "All White"],
    description:
      "The iconic Adidas Stan Smith gets a sustainable update with vegan materials. This timeless tennis shoe maintains its classic look while being kinder to the planet.",
    features: [
      "Vegan-friendly materials",
      "Classic tennis shoe design",
      "Perforated 3-Stripes",
      "Rubber cupsole for durability",
    ],
  },
  {
    id: "9",
    name: "Gel-Kayano 30",
    brand: "Asics",
    price: 169.99,
    originalPrice: 189.99,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.7,
    reviews: 289,
    category: "Running",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["Blue", "Black", "Grey"],
    description:
      "The Asics Gel-Kayano 30 provides premium stability and comfort for long-distance runners. With enhanced cushioning and support features, it's perfect for overpronators seeking a smooth ride.",
    features: [
      "FF BLAST PLUS ECO cushioning",
      "4D GUIDANCE SYSTEM for stability",
      "Engineered mesh upper",
      "AHAR PLUS rubber outsole",
    ],
  },
  {
    id: "10",
    name: "Speedgoat 5",
    brand: "Hoka",
    price: 154.99,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.6,
    reviews: 312,
    category: "Trail Running",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["Orange", "Black/Yellow", "Grey"],
    description:
      "Named after ultra-runner Karl Meltzer, the Hoka Speedgoat 5 is built for aggressive trail running. With maximum cushioning and grippy Vibram outsoles, conquer any terrain with confidence.",
    features: [
      "Maximum cushioning for trail comfort",
      "Vibram Megagrip outsole",
      "Protective toe rand",
      "Breathable mesh upper",
    ],
  },
  {
    id: "11",
    name: "574 Core",
    brand: "New Balance",
    price: 84.99,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.5,
    reviews: 623,
    category: "Lifestyle",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["Grey/Burgundy", "Navy", "Black"],
    description:
      "The New Balance 574 Core is an everyday classic that never goes out of style. With its versatile design and comfortable ENCAP cushioning, it's the perfect all-around sneaker.",
    features: ["ENCAP midsole cushioning", "Suede and mesh upper", "Classic lifestyle design", "Rubber outsole"],
  },
  {
    id: "12",
    name: "Court Vision Low",
    brand: "Nike",
    price: 69.99,
    image: "/placeholder.svg?height=400&width=400",
    rating: 4.3,
    reviews: 445,
    category: "Lifestyle",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["White/Black", "All White", "Black"],
    description:
      "Inspired by classic basketball shoes from the '80s, the Nike Court Vision Low brings vintage style to modern streetwear. Its clean design makes it a versatile choice for any occasion.",
    features: [
      "Basketball-inspired design",
      "Leather and synthetic upper",
      "Foam midsole for comfort",
      "Rubber outsole with pivot circle",
    ],
  },
]

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getProductsByBrand(brand: string): Product[] {
  return products.filter((product) => product.brand.toLowerCase() === brand.toLowerCase())
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category.toLowerCase() === category.toLowerCase())
}
