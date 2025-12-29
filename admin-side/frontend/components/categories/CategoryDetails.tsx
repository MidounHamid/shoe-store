"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { useRouter } from "next/navigation"

export type Category = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  created_at: string
  updated_at: string
}

interface CategoryDetailsProps {
  category: Category
}

export default function CategoryDetails({ category }: CategoryDetailsProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>Category details</CardDescription>
          </div>
          <Button onClick={() => router.push(`/categories/edit/${category.id}`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">ID</label>
            <p className="text-lg">{category.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-lg">{category.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Slug</label>
            <p className="text-lg">{category.slug}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Parent Category</label>
            <p className="text-lg">{category.parent_id ? `ID: ${category.parent_id}` : "Root"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-lg">{new Date(category.created_at).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

