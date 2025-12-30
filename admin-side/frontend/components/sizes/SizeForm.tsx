"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { getAuthToken } from "@/lib/auth"
import { useState } from "react"

const sizeSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  code: z.string().max(20, "Code too long").optional().nullable(),
  display_order: z.number().min(0, "Display order must be non-negative").default(0),
  is_active: z.boolean().default(true),
})

type SizeFormValues = z.infer<typeof sizeSchema>

interface SizeFormProps {
  initialData?: {
    id: number
    name: string
    code: string | null
    display_order: number
    is_active: boolean
  }
}

export default function SizeForm({ initialData }: SizeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEdit = !!initialData

  const form = useForm<SizeFormValues>({
    resolver: zodResolver(sizeSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      display_order: initialData?.display_order || 0,
      is_active: initialData?.is_active ?? true,
    },
  })

  const onSubmit = async (values: SizeFormValues) => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/sizes/${initialData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/sizes`

      const body = {
        name: values.name,
        code: values.code || null,
        display_order: values.display_order,
        is_active: values.is_active,
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
        throw new Error(error.message || "Failed to save size")
      }

      toast({
        title: "Success",
        description: isEdit ? "Size updated successfully" : "Size created successfully",
      })

      router.push("/sizes/list")
    } catch (error: any) {
      console.error("Error saving size:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save size",
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
                <FormLabel>Size Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Small, Medium, Large, XS, S, M, L, XL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., S, M, L, XL" {...field} value={field.value || ""} />
                </FormControl>
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
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Inactive sizes won't appear in dropdowns
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Size" : "Create Size"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

