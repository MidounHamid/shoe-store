"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";

const variantSchema = z.object({
  product_id: z.number().min(1, "Product is required"),
  sku: z.string().optional().nullable(),
  size_id: z.number().optional().nullable(),
  color: z.string().max(100).optional().nullable(),
  price: z.number().min(0, "Price must be positive"),
  original_price: z.number().min(0).optional().nullable(),
  stock: z.number().min(0, "Stock must be non-negative").default(0),
});

type VariantFormValues = z.infer<typeof variantSchema>;

interface ProductVariantFormProps {
  initialData?: {
    id: number;
    product_id: number;
    sku: string;
    size_id: number | null;
    color: string | null;
    price: number;
    original_price: number | null;
    stock: number;
  };
}

export default function ProductVariantForm({
  initialData,
}: ProductVariantFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [sizes, setSizes] = useState<{ id: number; name: string }[]>([]);
  const isEdit = !!initialData;

  useEffect(() => {
    fetchProducts();
    fetchSizes();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const productsData = result.data || result;
        setProducts(Array.isArray(productsData) ? productsData : []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchSizes = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sizes?is_active=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSizes(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      console.error("Error fetching sizes:", error);
    }
  };

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      product_id: initialData?.product_id || 0,
      sku: initialData?.sku || "",
      size_id: initialData?.size_id || null,
      color: initialData?.color || "",
      price: initialData?.price || 0,
      original_price: initialData?.original_price || null,
      stock: initialData?.stock || 0,
    },
  });

  const onSubmit = async (values: VariantFormValues) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/product-variants/${initialData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/product-variants`;

      const body = {
        product_id: values.product_id,
        sku: values.sku || null,
        size_id: values.size_id || null,
        color: values.color || null,
        price: values.price,
        original_price: values.original_price || null,
        stock: values.stock,
      };

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save product variant");
      }

      toast({
        title: "Success",
        description: isEdit
          ? "Product variant updated successfully"
          : "Product variant created successfully",
      });

      router.push("/products/variants");
    } catch (error: any) {
      console.error("Error saving product variant:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product variant",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
                      <SelectItem
                        key={product.id}
                        value={product.id.toString()}
                      >
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
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU (Auto-generated if empty)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Leave empty for auto-generation"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="size_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === "__none" ? null : parseInt(value))
                  }
                  value={
                    field.value === null ? "__none" : field.value?.toString()
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none">None</SelectItem>
                    {sizes.map((size) => (
                      <SelectItem key={size.id} value={size.id.toString()}>
                        {size.name}
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
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Red, Blue, Green, etc."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="original_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Original Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Variant"
              : "Create Variant"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
