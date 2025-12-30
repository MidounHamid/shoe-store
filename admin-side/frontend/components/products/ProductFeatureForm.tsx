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
import { toast } from "@/components/ui/use-toast"
import { getAuthToken } from "@/lib/auth"

const featureSchema = z.object({
  product_id: z.number().min(1, "Product is required"),
  feature_text: z.string().min(1, "Feature text is required"),
  display_order: z.number().min(0, "Display order must be non-negative").default(0),
})

type FeatureFormValues = z.infer<typeof featureSchema>

interface ProductFeatureFormProps {
  initialData?: {
    id: number
    product_id: number
    feature_text: string
    display_order: number
  }
}

export default function ProductFeatureForm({ initialData }: ProductFeatureFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<{ id: number; name: string }[]>([])
  const isEdit = !!initialData

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        const productsData = result.data || result
        setProducts(Array.isArray(productsData) ? productsData : [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const form = useForm<FeatureFormValues>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      product_id: initialData?.product_id || 0,
      feature_text: initialData?.feature_text || "",
      display_order: initialData?.display_order || 0,
    },
  })

  const onSubmit = async (values: FeatureFormValues) => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/product-features/${initialData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/product-features`

      const body = {
        product_id: values.product_id,
        feature_text: values.feature_text,
        display_order: values.display_order,
      }

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save product feature")
      }

      toast({
        title: "Success",
        description: isEdit ? "Product feature updated successfully" : "Product feature created successfully",
      })

      router.push("/products/features")
    } catch (error: any) {
      console.error("Error saving product feature:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save product feature",
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
            name="product_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                  disabled={isEdit}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
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
            name="display_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="feature_text"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Feature Text *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Free Shipping, 30-Day Return Policy, Warranty Included"
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Feature" : "Create Feature"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

