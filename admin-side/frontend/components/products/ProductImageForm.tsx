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
import Image from "next/image";
import { X, AlertCircle } from "lucide-react";

const imageSchema = z.object({
  product_id: z.number().min(1, "Product is required"),
  variant_id: z.number().optional().nullable(),
  display_order: z.number().min(0).default(0),
});

interface ProductImageFormProps {
  initialData?: {
    id: number;
    product_id: number;
    variant_id: number | null;
    main_image: string | null;
    second_images: string[] | null;
    display_order: number;
  };
}

export default function ProductImageForm({ initialData }: ProductImageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [variants, setVariants] = useState<{ id: number; sku: string }[]>([]);
  
  // State for NEW Files
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [secondFiles, setSecondFiles] = useState<File[]>([]);

  // State for existing images (from database)
  const [existingMainImage, setExistingMainImage] = useState<string | null>(initialData?.main_image || null);
  const [existingSecondImages, setExistingSecondImages] = useState<string[]>(
    Array.isArray(initialData?.second_images) ? initialData.second_images : []
  );

  // State for new image previews
  const [newMainPreview, setNewMainPreview] = useState<string | null>(null);
  const [newSecondPreviews, setNewSecondPreviews] = useState<string[]>([]);

  // Track if main image should be deleted
  const [deleteMainImage, setDeleteMainImage] = useState(false);

  const isEdit = !!initialData;

  const form = useForm<z.infer<typeof imageSchema>>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      product_id: initialData?.product_id || 0,
      variant_id: initialData?.variant_id || null,
      display_order: initialData?.display_order || 0,
    },
  });

  const selectedProductId = form.watch("product_id");

  useEffect(() => {
    fetchProducts();
    if (initialData?.product_id) fetchVariants(initialData.product_id);
  }, []);

  useEffect(() => {
    if (selectedProductId && selectedProductId !== 0) {
      fetchVariants(selectedProductId);
    }
  }, [selectedProductId]);

  const fetchProducts = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${getAuthToken()}`, Accept: "application/json" }
    });
    if (res.ok) {
      const data = await res.json();
      setProducts(data.data || data);
    }
  };

  const fetchVariants = async (productId: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-variants?product_id=${productId}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}`, Accept: "application/json" }
    });
    if (res.ok) {
      const data = await res.json();
      setVariants(data.data || data);
    }
  };

  const handleMainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainFile(file);
      setNewMainPreview(URL.createObjectURL(file));
      setDeleteMainImage(false); // Cancel any deletion if new file selected
    }
  };

  const handleSecondariesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSecondFiles(prev => [...prev, ...filesArray]);
      const newPreviews = filesArray.map(f => URL.createObjectURL(f));
      setNewSecondPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeExistingSecondary = (url: string) => {
    setExistingSecondImages(prev => prev.filter(img => img !== url));
  };

  const removeNewSecondary = (index: number) => {
    setNewSecondPreviews(prev => prev.filter((_, i) => i !== index));
    setSecondFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeMainImage = () => {
    if (existingMainImage) {
      setDeleteMainImage(true);
      setExistingMainImage(null);
    }
    setMainFile(null);
    setNewMainPreview(null);
  };

  const onSubmit = async (values: z.infer<typeof imageSchema>) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("product_id", values.product_id.toString());
    formData.append("display_order", values.display_order.toString());
    if (values.variant_id) formData.append("variant_id", values.variant_id.toString());
    
    // Main image handling
    if (mainFile) {
      formData.append("main_image", mainFile);
    } else if (deleteMainImage) {
      formData.append("delete_main_image", "1");
    }

    // New secondary images
    secondFiles.forEach((file) => formData.append("second_images[]", file));

    // Keep existing secondary images (send URLs that should remain)
    if (isEdit && existingSecondImages.length > 0) {
      formData.append("keep_second_images", JSON.stringify(existingSecondImages));
    }

    if (isEdit) formData.append("_method", "PUT");

    try {
      const url = isEdit 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/product-images/${initialData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/product-images`;

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}`, Accept: "application/json" },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save images");

      toast({ title: "Success", description: "Product images saved successfully" });
      router.push("/products/images");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="product_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product *</FormLabel>
                <Select 
                  onValueChange={(v) => field.onChange(parseInt(v))} 
                  defaultValue={field.value?.toString()}
                  disabled={isEdit}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
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
                  onValueChange={(v) => field.onChange(v === "none" ? null : parseInt(v))} 
                  value={field.value?.toString() || "none"}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Select Variant" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">No Variant</SelectItem>
                    {variants.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.sku}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Image Section */}
          <div className="space-y-4">
            <FormLabel>Main Image</FormLabel>
            
            {/* Show existing main image */}
            {existingMainImage && !newMainPreview && (
              <div className="space-y-2">
                <div className="relative aspect-video w-full border rounded-md overflow-hidden bg-muted">
                  <Image src={existingMainImage} alt="Main" fill className="object-contain" unoptimized />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeMainImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Current image
                </p>
              </div>
            )}

            {/* Show new main image preview */}
            {newMainPreview && (
              <div className="space-y-2">
                <div className="relative aspect-video w-full border-2 border-blue-500 rounded-md overflow-hidden bg-muted">
                  <Image src={newMainPreview} alt="New Main" fill className="object-contain" unoptimized />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeMainImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> New image selected (will replace current)
                </p>
              </div>
            )}

            <Input 
              type="file" 
              accept="image/*" 
              onChange={handleMainChange}
            />
          </div>

          {/* Secondary Images Section */}
          <div className="space-y-4">
            <FormLabel>Secondary Images</FormLabel>
            <Input type="file" accept="image/*" multiple onChange={handleSecondariesChange} />
            
            <div className="grid grid-cols-3 gap-2">
              {/* Existing secondary images */}
              {existingSecondImages.map((url, i) => (
                <div key={`existing-${i}`} className="relative aspect-square border rounded-md overflow-hidden bg-muted group">
                  <Image src={url} alt={`Existing ${i}`} fill className="object-cover" unoptimized />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeExistingSecondary(url)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[8px] text-center py-0.5">
                    Current
                  </div>
                </div>
              ))}

              {/* New secondary images */}
              {newSecondPreviews.map((url, i) => (
                <div key={`new-${i}`} className="relative aspect-square border-2 border-blue-500 rounded-md overflow-hidden bg-muted group">
                  <Image src={url} alt={`New ${i}`} fill className="object-cover" unoptimized />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeNewSecondary(i)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[8px] text-center py-0.5">
                    New
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Green border = Current images | Blue border = New images to upload
            </p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="display_order"
          render={({ field }) => (
            <FormItem className="max-w-[200px]">
              <FormLabel>Display Order</FormLabel>
              <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Product Images"}</Button>
        </div>
      </form>
    </Form>
  );
}