"use client";

import { Layout } from "@/components/layouts/layout";
import ProductDetails from "@/components/products/ProductDetails";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { Loading } from "@/components/ui/loading";
import { toast } from "@/components/ui/use-toast";

// UPDATED TYPE: mirrors the leftJoin result from Laravel
export type Product = {
  id: number;
  brand_id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  main_image: string | null; // From image_principale
  second_images: string[] | null; // From JSON column
  is_active: boolean;
  brand_name?: string;
  categories?: any[];
  tags?: any[];
  created_at: string;
  updated_at: string;
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch product");

        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to load product",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loading />
        </div>
      ) : product ? (
        <div className="max-w-5xl mx-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Product Details</h1>
                <p className="text-sm text-muted-foreground">
                  Detailed view of {product.name}
                </p>
              </div>
            </div>
            <Badge variant={product.is_active ? "default" : "secondary"}>
              {product.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <ProductDetails product={product} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <p className="text-red-500 mb-4">Product not found</p>
          <Button onClick={() => router.push("/products/list")}>
            Go to Products List
          </Button>
        </div>
      )}
    </Layout>
  );
}
