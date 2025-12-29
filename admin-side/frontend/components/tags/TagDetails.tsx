"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { useRouter } from "next/navigation"

export type Tag = {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
}

interface TagDetailsProps {
  tag: Tag
}

export default function TagDetails({ tag }: TagDetailsProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tag Information</CardTitle>
            <CardDescription>Tag details</CardDescription>
          </div>
          <Button onClick={() => router.push(`/tags/edit/${tag.id}`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">ID</label>
            <p className="text-lg">{tag.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-lg">{tag.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Slug</label>
            <p className="text-lg">{tag.slug}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-lg">{new Date(tag.created_at).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

