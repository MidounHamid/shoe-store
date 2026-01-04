"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { getAuthToken } from "@/lib/auth"

// 1. Removed main_image from Schema
const productSchema = z.object({
  brand_id: z.number().min(1, "Brand is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  short_description: z.string().max(512).optional().nullable(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  initialData?: {
    id: number
    brand_id: number
    name: string
    slug: string
    short_description: string | null
    description: string | null
    is_active: boolean
  }
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([])
  const isEdit = !!initialData

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brands`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        const brandsData = result.data || result
        setBrands(Array.isArray(brandsData) ? brandsData : [])
      }
    } catch (error) {
      console.error("Error fetching brands:", error)
    }
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      brand_id: initialData?.brand_id || 0,
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      short_description: initialData?.short_description || "",
      description: initialData?.description || "",
      is_active: initialData?.is_active ?? true,
    },
  })

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/products/${initialData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/products`

      // 2. Cleaned Payload (Matches your Migration)
      const productPayload = {
        brand_id: values.brand_id,
        name: values.name,
        slug: values.slug || undefined,
        short_description: values.short_description || null,
        description: values.description || null,
        is_active: values.is_active,
      }

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(productPayload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save product")
      }

      toast({
        title: "Success",
        description: isEdit ? "Product updated successfully" : "Product created successfully",
      })

      router.push("/products/list")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
        {/* Adjusted Grid to 3 columns for better fit now that image is gone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="brand_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Brand *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value !== 0 ? field.value?.toString() : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Product Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Premium Leather Watch" {...field} />
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
                <FormLabel className="font-semibold">URL Slug</FormLabel>
                <FormControl>
                  <Input placeholder="premium-leather-watch" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Main Image URL FormField has been deleted from here */}
        </div>

        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Short Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Summary for product cards..."
                  className="resize-none"
                  {...field}
                  value={field.value || ''}
                  maxLength={512}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Full Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed product specifications and story..."
                  {...field}
                  value={field.value || ''}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Product Visibility</FormLabel>
                <p className="text-sm text-muted-foreground">
                  This product will be visible to customers in the store.
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-4 border-t pt-6">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Discard Changes
          </Button>
          <Button type="submit" className="px-8" disabled={loading}>
            {loading ? "Processing..." : isEdit ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  )
}