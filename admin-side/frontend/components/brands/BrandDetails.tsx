"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { useRouter } from "next/navigation"

export type Brand = {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
}

interface BrandDetailsProps {
  brand: Brand
}

export default function BrandDetails({ brand }: BrandDetailsProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Brand Information</CardTitle>
            <CardDescription>Brand details</CardDescription>
          </div>
          <Button onClick={() => router.push(`/brands/edit/${brand.id}`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">ID</label>
            <p className="text-lg">{brand.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-lg">{brand.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Slug</label>
            <p className="text-lg">{brand.slug}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-lg">{new Date(brand.created_at).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

