"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { getAuthToken } from "@/lib/auth"
import { useState } from "react"

const brandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
})

type BrandFormValues = z.infer<typeof brandSchema>

interface BrandFormProps {
  initialData?: {
    id: number
    name: string
    slug: string
  }
}

export default function BrandForm({ initialData }: BrandFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEdit = !!initialData

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
    },
  })

  const onSubmit = async (values: BrandFormValues) => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${initialData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/brands`

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save brand")
      }

      toast({
        title: "Success",
        description: isEdit ? "Brand updated successfully" : "Brand created successfully",
      })

      router.push("/brands/list")
    } catch (error: any) {
      console.error("Error saving brand:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save brand",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Brand name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="brand-slug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Brand" : "Create Brand"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

