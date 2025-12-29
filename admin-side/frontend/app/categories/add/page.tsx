"use client"

import { Layout } from "@/components/layouts/layout"
import CategoryForm from "@/components/categories/CategoryForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AddCategoryPage() {
  const router = useRouter()
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add New Category</h1>
            <p className="text-gray-600">Create a new category</p>
          </div>
        </div>
        <CategoryForm />
      </div>
    </Layout>
  )
}

