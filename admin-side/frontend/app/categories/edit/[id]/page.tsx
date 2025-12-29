"use client"

import { Layout } from "@/components/layouts/layout"
import CategoryForm from "@/components/categories/CategoryForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth"
import { Loading } from "@/components/ui/loading"
import { toast } from "@/components/ui/use-toast"

export type Category = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  created_at: string
  updated_at: string
}

export default function EditCategoryPage() {
  const { id } = useParams()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategory() {
      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        })
        if (!response.ok) throw new Error("Failed to fetch category")
        setCategory(await response.json())
      } catch (error) {
        console.error("Error fetching category:", error)
        toast({ title: "Error", description: "Failed to load category", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchCategory()
  }, [id])

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen"><Loading /></div>
      ) : category ? (
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 flex items-center gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Category</h1>
              <p className="text-gray-600">Update category information</p>
            </div>
          </div>
          <CategoryForm initialData={category} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen"><p className="text-red-500">Category not found</p></div>
      )}
    </Layout>
  )
}

