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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";

const imageSchema = z.object({
  product_id: z.number().min(1, "Product is required"),
  variant_id: z.number().optional().nullable(),
  image_url: z
    .string()
    .min(1, "Image URL is required")
    .max(500, "URL too long"),
  display_order: z
    .number()
    .min(0, "Display order must be non-negative")
    .default(0),
  is_principal: z.boolean().default(false),
});

type ImageFormValues = z.infer<typeof imageSchema>;

interface ProductImageFormProps {
  initialData?: {
    id: number;
    product_id: number;
    variant_id: number | null;
    image_url: string;
    display_order: number;
    is_principal: boolean;
  };
}

export default function ProductImageForm({
  initialData,
}: ProductImageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [variants, setVariants] = useState<
    { id: number; sku: string; product_id: number }[]
  >([]);
  const isEdit = !!initialData;

  const form = useForm<ImageFormValues>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      product_id: initialData?.product_id || 0,
      variant_id: initialData?.variant_id || null,
      image_url: initialData?.image_url || "",
      display_order: initialData?.display_order || 0,
      is_principal: initialData?.is_principal || false,
    },
  });

  const selectedProductId = form.watch("product_id");

  useEffect(() => {
    fetchProducts();
    if (initialData?.product_id) {
      fetchVariants(initialData.product_id);
    }
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchVariants(selectedProductId);
    } else {
      setVariants([]);
    }
  }, [selectedProductId]);

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

  const fetchVariants = async (productId: number) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product-variants?product_id=${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const variantsData = result.data || result;
        setVariants(Array.isArray(variantsData) ? variantsData : []);
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
    }
  };

  const onSubmit = async (values: ImageFormValues) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/product-images/${initialData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/product-images`;

      const body = {
        product_id: values.product_id,
        variant_id: values.variant_id || null,
        image_url: values.image_url,
        display_order: values.display_order,
        is_principal: values.is_principal,
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
        throw new Error(error.message || "Failed to save product image");
      }

      toast({
        title: "Success",
        description: isEdit
          ? "Product image updated successfully"
          : "Product image created successfully",
      });

      router.push("/products/images");
    } catch (error: any) {
      console.error("Error saving product image:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product image",
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
                  onValueChange={(value) => {
                    field.onChange(parseInt(value));
                    form.setValue("variant_id", null);
                  }}
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
            name="variant_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variant (Optional)</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === "__none" ? null : parseInt(value))
                  }
                  value={
                    field.value === null ? "__none" : field.value?.toString()
                  }
                  disabled={!form.watch("product_id") || variants.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select variant (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none">None (Product Image)</SelectItem>
                    {variants.map((variant) => (
                      <SelectItem
                        key={variant.id}
                        value={variant.id.toString()}
                      >
                        {variant.sku}
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
            name="image_url"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Image URL *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
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

          <FormField
            control={form.control}
            name="is_principal"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 md:col-span-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Set as Principal Image</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Only one principal image per product. Setting this will
                    unset other principal images.
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Image" : "Create Image"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
