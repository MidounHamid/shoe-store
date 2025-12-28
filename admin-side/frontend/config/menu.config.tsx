import {
  ShoppingCart,
  Package,
  Users,
  ShoppingBag,
  Tag,
  Star,
  Heart,
  CreditCard,
  Home,
  Layers,
  FileText,
} from "lucide-react";

export const MENU = [
  {
    title: "Dashboard",
    icon: <Home />,
    isActive: true,
    service: "dashboard",
    pathname: "dashboard",
    url: "/dashboard",
  },
  {
    title: "Users",
    icon: <Users />,
    service: "users",
    pathname: "users",
    badge: "users",
    items: [
      { title: "List Users", url: "/users/list", method: "read" },
      { title: "Add User", url: "/users/add", method: "create" },
    ],
  },
  {
    title: "Products",
    icon: <Package />,
    service: "products",
    pathname: "products",
    badge: "products",
    items: [
      { title: "List Products", url: "/products/list", method: "read" },
      { title: "Add Product", url: "/products/add", method: "create" },
      { title: "Product Variants", url: "/products/variants", method: "read" },
      { title: "Product Images", url: "/products/images", method: "read" },
      { title: "Product Features", url: "/products/features", method: "read" },
    ],
  },
  {
    title: "Brands",
    icon: <Tag />,
    service: "brands",
    pathname: "brands",
    items: [
      { title: "List Brands", url: "/brands/list", method: "read" },
      { title: "Add Brand", url: "/brands/add", method: "create" },
    ],
  },
  {
    title: "Categories",
    icon: <Layers />,
    service: "categories",
    pathname: "categories",
    items: [
      { title: "List Categories", url: "/categories/list", method: "read" },
      { title: "Add Category", url: "/categories/add", method: "create" },
    ],
  },
  {
    title: "Tags",
    icon: <Tag />,
    service: "tags",
    pathname: "tags",
    items: [
      { title: "List Tags", url: "/tags/list", method: "read" },
      { title: "Add Tag", url: "/tags/add", method: "create" },
    ],
  },
  {
    title: "Orders",
    icon: <ShoppingBag />,
    service: "orders",
    pathname: "orders",
    badge: "orders",
    items: [
      { title: "List Orders", url: "/orders/list", method: "read" },
      { title: "Order Items", url: "/orders/items", method: "read" },
      { title: "Order Events", url: "/orders/events", method: "read" },
    ],
  },
  {
    title: "Payments",
    icon: <CreditCard />,
    service: "payments",
    pathname: "payments",
    items: [
      { title: "List Payments", url: "/payments/list", method: "read" },
    ],
  },
  {
    title: "Carts",
    icon: <ShoppingCart />,
    service: "carts",
    pathname: "carts",
    badge: "carts",
    items: [
      { title: "List Carts", url: "/carts/list", method: "read" },
      { title: "Cart Items", url: "/carts/items", method: "read" },
    ],
  },
  {
    title: "Favorites",
    icon: <Heart />,
    service: "favorites",
    pathname: "favorites",
    badge: "favorites",
    items: [
      { title: "List Favorites", url: "/favorites/list", method: "read" },
    ],
  },
  {
    title: "Reviews",
    icon: <Star />,
    service: "reviews",
    pathname: "reviews",
    badge: "reviews",
    items: [
      { title: "List Reviews", url: "/reviews/list", method: "read" },
      { title: "Review Votes", url: "/reviews/votes", method: "read" },
    ],
  },
  {
    title: "Addresses",
    icon: <FileText />,
    service: "addresses",
    pathname: "addresses",
    items: [
      { title: "List Addresses", url: "/addresses/list", method: "read" },
      { title: "Add Address", url: "/addresses/add", method: "create" },
    ],
  },
]
