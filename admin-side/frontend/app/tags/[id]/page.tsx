"use client"

import { Layout } from "@/components/layouts/layout"
import TagDetails from "@/components/tags/TagDetails"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth"
import { Loading } from "@/components/ui/loading"
import { toast } from "@/components/ui/use-toast"

export type Tag = {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export default function TagDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [tag, setTag] = useState<Tag | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTag() {
      try {
        const token = getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        })
        if (!response.ok) throw new Error("Failed to fetch tag")
        setTag(await response.json())
      } catch (error) {
        console.error("Error fetching tag:", error)
        toast({ title: "Error", description: "Failed to load tag", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchTag()
  }, [id])

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen"><Loading /></div>
      ) : tag ? (
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 flex items-center gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Tag Details</h1>
              <p className="text-gray-600">View tag information</p>
            </div>
          </div>
          <TagDetails tag={tag} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen"><p className="text-red-500">Tag not found</p></div>
      )}
    </Layout>
  )
}

