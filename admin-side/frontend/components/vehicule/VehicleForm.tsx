"use client";

import { useState, useEffect, ChangeEvent, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandSelect } from "@/components/ui/BrandSelect";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";
import { Loading } from "@/components/ui/loading";

const FUEL_TYPES = [
  { value: "essence", label: "Essence" },
  { value: "diesel", label: "Diesel" },
  { value: "hybride", label: "Hybride" },
  { value: "electrique", label: "Électrique" },
];

const CATEGORIES = ["A", "B", "C", "D", "E"].map((c) => ({
  id: c,
  label: `Catégorie ${c}`,
}));

const GEARS = [
  { value: "automatic", label: "Automatique" }, { value: "manual", label: "Manuelle" },
];
const ASSURANCE_TYPES = [
  { value: "RC", label: "RC" },
  { value: "tous risques", label: "Tous Risques" },
];

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom du véhicule est requis")
    .max(100, "Nom trop long"),
  status: z.enum(["disponible", "no disponible", "reserver", "en location"]),
  marque_id: z.string().min(1, "La marque est requise"),
  matricule: z
    .string()
    .min(1, "Le matricule est requis")
    .max(50, "Matricule trop long"),
  type_carburant: z.string().min(1, "Le type de carburant est requis"),
  gear: z.enum(["automatic", "manual"], {
    required_error: "La boîte de vitesses est requise",
  }),
  nombre_cylindre: z.coerce
    .number()
    .min(0, "Doit être un nombre positif")
    .max(20, "Trop de cylindres"),
  nbr_place: z.coerce
    .number()
    .min(1, "Doit être au moins 1")
    .max(50, "Trop de places"),
  reference: z.string().optional(),
  serie: z.string().optional(),
  fournisseur: z.string().optional(),
  numero_facture: z.string().optional(),
  prix_achat: z.coerce.number().min(0, "Le prix doit être positif"),
  prix: z.coerce.number().min(0, "Le prix de location doit être positif"), // Add this

  duree_vie: z.string().optional(),
  kilometrage_actuel: z.coerce
    .number()
    .min(0, "Le kilométrage doit être positif"),
  categorie_vehicule: z.string().optional(),
  couleur: z.string().optional(),
  image: z.any().optional().nullable(),
  images: z.any().optional().nullable(),
  kilometrage_location: z.string().optional(),
  type_assurance: z.enum(["RC", "tous risques"]),
  description: z.string().max(1000, "Description trop longue").optional(),
});

const FORM_FIELDS = [
  { name: "name", label: "Nom du véhicule", required: true, type: "text" },
  { name: "matricule", label: "Matricule", required: true, type: "text" },
  {
    name: "nombre_cylindre",
    label: "Nombre de cylindres",
    required: true,
    type: "number",
  },
  {
    name: "nbr_place",
    label: "Nombre de places",
    required: true,
    type: "number",
  },
  { name: "reference", label: "Référence", required: false, type: "text" },
  { name: "serie", label: "Série", required: false, type: "text" },
  { name: "fournisseur", label: "Fournisseur", required: false, type: "text" },
  {
    name: "numero_facture",
    label: "Numéro de facture",
    required: false,
    type: "text",
  },
  { name: "prix_achat", label: "Prix d'achat", required: true, type: "number" },
  { name: "prix", label: "Prix de location", required: true, type: "number" },
  { name: "duree_vie", label: "Durée de vie", required: false, type: "text" },
  {
    name: "kilometrage_actuel",
    label: "Kilométrage actuel",
    required: true,
    type: "number",
  },
  {
    name: "kilometrage_location",
    label: "Kilométrage location",
    required: false,
    type: "text",
  },
  // {
  //   name: "type_assurance",
  //   label: "Type d'assurance",
  //   required: false,
  //   type: "text",
  // },
];

export type VehicleData = {
  id?: number;
  name: string;
  status: "disponible" | "no disponible" | "reserver" | "en location";
  marque_id: string;
  matricule: string;
  type_carburant: string;
  gear: "automatic" | "manual";
  nombre_cylindre: number;
  nbr_place: number;
  reference?: string;
  serie?: string;
  fournisseur?: string;
  numero_facture?: string;
  prix_achat: number;
  prix: number;
  duree_vie?: string;
  kilometrage_actuel: number;
  categorie_vehicule?: string;
  couleur?: string;
  image?: string | null;
  images?: string[] | null;
  kilometrage_location?: string;
  type_assurance?: "RC" | "tous risques";
  description?: string;
};

type VehicleFormProps = {
  onSuccess?: () => void;
  initialData?: VehicleData;
  isEditMode?: boolean;
};

const getImageUrl = (imagePath: string): string => {
  if (!imagePath?.trim()) return "";

  if (imagePath.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(imagePath);
      if (Array.isArray(parsed) && parsed.length > 0) {
        imagePath = parsed[0];
      }
    } catch (e) {
      console.error("Error parsing image path:", e);
    }
  }

  try {
    if (imagePath.startsWith("http")) return imagePath;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_API_URL not configured");
      return "";
    }

    const cleanPath = imagePath.replace(/^\/+/, "");
    return `${baseUrl}/storage/${cleanPath}`;
  } catch (error) {
    console.error("Error constructing image URL:", error);
    return "";
  }
};

const useObjectURLs = () => {
  const urlsRef = useRef<string[]>([]);
  const createObjectURL = (file: File): string => {
    const url = URL.createObjectURL(file);
    urlsRef.current.push(url);
    return url;
  };
  const revokeAll = () => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
  };
  useEffect(() => () => revokeAll(), []);
  return { createObjectURL, revokeAll };
};

export default function VehicleForm({
  onSuccess,
  initialData,
  isEditMode = false,
}: VehicleFormProps) {
  const router = useRouter();
  const { createObjectURL, revokeAll } = useObjectURLs();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [brands, setBrands] = useState<{ id: number; marque: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [removeMainImage, setRemoveMainImage] = useState(false);

  // Use a ref to avoid fetching data multiple times on re-renders
  const hasFetched = useRef(false);

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);

  const getDefaultValues = () => ({
    name: initialData?.name || "",
    status: initialData?.status || "disponible",
    marque_id: initialData?.marque_id?.toString() || "",
    matricule: initialData?.matricule || "",
    type_carburant: initialData?.type_carburant || "essence",
    gear: initialData?.gear || "automatic",
    nombre_cylindre: initialData?.nombre_cylindre || 0,
    nbr_place: initialData?.nbr_place || 1,
    reference: initialData?.reference || "",
    serie: initialData?.serie || "",
    fournisseur: initialData?.fournisseur || "",
    numero_facture: initialData?.numero_facture || "",
    prix_achat: initialData?.prix_achat || 0,
    prix: initialData?.prix || 0,
    duree_vie: initialData?.duree_vie || "",
    kilometrage_actuel: initialData?.kilometrage_actuel || 0,
    categorie_vehicule: initialData?.categorie_vehicule || "",
    couleur: initialData?.couleur || "#3b82f6",
    image: null,
    images: null,
    kilometrage_location: initialData?.kilometrage_location || "",
    type_assurance: initialData?.type_assurance || "RC",
    description: initialData?.description || "",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  const handleDeleteMainImage = useCallback(() => {
    setPreviewImage(null);
    setRemoveMainImage(true);
    form.setValue("image", null);
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = "";
    }
  }, [form]);

  const handleImageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      form.setValue("image", file);
      setPreviewImage(createObjectURL(file));
      setRemoveMainImage(false);
    },
    [form, createObjectURL]
  );

  const handleImagesChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const validFiles = files.filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          });
          return false;
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB.`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });
      if (validFiles.length > 0) {
        const updatedNewFiles = [...newImageFiles, ...validFiles];
        setNewImageFiles(updatedNewFiles);
        const newImageUrls = validFiles.map((file) => createObjectURL(file));
        setPreviewImages((prev) => [...prev, ...newImageUrls]);
        form.setValue("images", updatedNewFiles);
      }
    },
    [form, createObjectURL, newImageFiles]
  );

  const handleDeleteAdditionalImage = useCallback(
    (indexToDelete: number) => {
      const isExistingImage = indexToDelete < existingImages.length;
      if (isExistingImage) {
        setImagesToDelete((prev) => [...prev, indexToDelete]);
      } else {
        const newFileIndex = indexToDelete - existingImages.length;
        const updatedNewFiles = newImageFiles.filter(
          (_, index) => index !== newFileIndex
        );
        setNewImageFiles(updatedNewFiles);
        form.setValue(
          "images",
          updatedNewFiles.length > 0 ? updatedNewFiles : null
        );
      }
      setPreviewImages((prev) =>
        prev.filter((_, index) => index !== indexToDelete)
      );
      if (additionalImagesInputRef.current) {
        additionalImagesInputRef.current.value = "";
      }
    },
    [existingImages, newImageFiles, form]
  );

  useEffect(() => {
    if (isEditMode && initialData) {
      if (initialData.image) {
        const imageUrl = getImageUrl(initialData.image);
        if (imageUrl) setPreviewImage(imageUrl);
      }

      if (initialData.images) {
        let imagesArray: string[] = [];
        try {
          console.log("initialData.images", initialData.images);

          // Parse the JSON string to get the array of image paths
          if (typeof initialData.images === "string") {
            const parsed = JSON.parse(initialData.images);
            imagesArray = Array.isArray(parsed) ? parsed : [];
          } else if (Array.isArray(initialData.images)) {
            imagesArray = initialData.images;
          }

          const imageUrls = imagesArray
            .filter((img) => img && typeof img === "string" && img.trim())
            .map((img) => {
              const baseUrl = process.env.NEXT_PUBLIC_API_URL;
              if (!baseUrl) return "";
              const cleanPath = img.replace(/^\/+/, "");
              return `${baseUrl}/storage/${cleanPath}`;
            })
            .filter((url) => url);

          setExistingImages(imageUrls);
          setPreviewImages(imageUrls);
        } catch (error) {
          console.error("Error parsing images:", error);
          setExistingImages([]);
          setPreviewImages([]);
        }
      }

      setNewImageFiles([]);
      setImagesToDelete([]);
      setRemoveMainImage(false);
    }
  }, [isEditMode, initialData]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    async function fetchBrands() {
      try {
        setLoadingBrands(true);
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/marques`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        const brandsData = result.data ?? result;
        if (!Array.isArray(brandsData))
          throw new Error("Invalid brands data format");
        setBrands(brandsData);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load brands. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoadingBrands(false);
      }
    }
    fetchBrands();
  }, []);

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token)
          throw new Error(
            "Authentication token not found. Please login again."
          );
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (key === "image" && value instanceof File) {
            formData.append("image", value);
          } else if (key === "images" && Array.isArray(value)) {
            value.forEach((file) => {
              if (file instanceof File) {
                formData.append("images[]", file);
              }
            });
          } else if (value != null && value !== "" && key !== "images") {
            formData.append(key, value.toString());
          }
        });
        if (isEditMode && removeMainImage) {
          formData.append("remove_image", "1");
        }
        if (isEditMode && imagesToDelete.length > 0) {
          formData.append("images_to_delete", JSON.stringify(imagesToDelete));
        }
        if (isEditMode && existingImages.length > 0) {
          const imagesToKeep = existingImages.filter(
            (_, index) => !imagesToDelete.includes(index)
          );
          if (imagesToKeep.length > 0) {
            const imagePaths = imagesToKeep.map((url) => {
              if (url.includes("/storage/")) {
                return url.split("/storage/")[1];
              }
              return url;
            });
            formData.append("existing_images", JSON.stringify(imagePaths));
          }
        }
        const url =
          isEditMode && initialData?.id
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/vehicules/${initialData.id}`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/vehicules`;

        if (isEditMode) {
          formData.append("_method", "PUT");
        }
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        });
        const result = await response.json();
        if (!response.ok) {
          if (response.status === 422 && result.errors) {
            const errorMessages = Object.values(result.errors)
              .flat()
              .join(", ");
            throw new Error(errorMessages);
          }
          throw new Error(result.message || `Server error: ${response.status}`);
        }
        toast({
          title: "Success",
          description: isEditMode
            ? "Vehicle updated successfully!"
            : "Vehicle created successfully!",
        });
        if (!isEditMode) {
          form.reset();
          setPreviewImage(null);
          setPreviewImages([]);
          setNewImageFiles([]);
          setExistingImages([]);
          setImagesToDelete([]);
          setRemoveMainImage(false);
          revokeAll();
          if (mainImageInputRef.current) mainImageInputRef.current.value = "";
          if (additionalImagesInputRef.current)
            additionalImagesInputRef.current.value = "";
        } else {
          setRemoveMainImage(false);
        }
        if (onSuccess) onSuccess();
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Operation failed. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      form,
      onSuccess,
      isEditMode,
      initialData,
      revokeAll,
      imagesToDelete,
      existingImages,
      removeMainImage,
    ]
  );

  if (loadingBrands) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        encType="multipart/form-data"
      >
        {/* Vehicle Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Informations du véhicule</h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FORM_FIELDS.slice(0, 4).map(
                ({ name, label, required, type }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name as keyof z.infer<typeof formSchema>}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          {label}
                          {required && <span className="text-red-500"> *</span>}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type={type}
                            {...field}
                            onChange={(e) => {
                              const value =
                                type === "number" && e.target.value
                                  ? Number(e.target.value)
                                  : e.target.value;
                              field.onChange(value);
                            }}
                            value={field.value ?? ""}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              )}

              <FormField
                control={form.control}
                name="marque_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Marque *</FormLabel>
                    <FormControl>
                      <BrandSelect
                        brands={brands}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner une marque..."
                        disabled={loading}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type_carburant"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Type de carburant *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un carburant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FUEL_TYPES.map((fuel) => (
                          <SelectItem key={fuel.value} value={fuel.value}>
                            {fuel.label}
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
                name="categorie_vehicule"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Catégorie</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.label}
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
                name="couleur"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Couleur</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2 w-full">
                        <Input
                          type="color"
                          className="w-16 h-10 flex-shrink-0 p-1"
                          {...field}
                          disabled={loading}
                        />
                        <Input
                          type="text"
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="#3b82f6"
                          className="flex-grow"
                          disabled={loading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <div className="col-span-2"> 
              <FormField
                control={form.control}
                name="gear"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Boîte de vitesses *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner le type de boîte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GEARS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Informations d&apos;achat</h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* All previous fields before kilometrage_location */}
              {FORM_FIELDS.slice(4, -1).map(
                ({ name, label, required, type }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name as keyof z.infer<typeof formSchema>}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          {label}
                          {required && <span className="text-red-500"> *</span>}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type={type}
                            {...field}
                            onChange={(e) => {
                              const value =
                                type === "number" && e.target.value
                                  ? Number(e.target.value)
                                  : e.target.value;
                              field.onChange(value);
                            }}
                            value={field.value ?? ""}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              )}

              {/* Kilometrage location + Type assurance side-by-side */}
              <FormField
                control={form.control}
                name="kilometrage_location"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Kilométrage location</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type_assurance"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Type d&apos;assurance *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un type d'assurance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ASSURANCE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Images</h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Image */}
              <div className="space-y-4 w-full">
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormLabel>Image principale</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            ref={mainImageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={loading}
                          />
                          {previewImage && (
                            <div className="relative">
                              <div className="relative inline-block border rounded-lg overflow-hidden">
                                <Image
                                  src={previewImage}
                                  alt="Aperçu du véhicule"
                                  width={200}
                                  height={150}
                                  className="object-cover"
                                  unoptimized
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={handleDeleteMainImage}
                                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                  aria-label="Supprimer l'image"
                                  disabled={loading}
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              {isEditMode && (
                                <p className="text-sm text-gray-500 mt-2">
                                  Image actuelle (téléchargez une nouvelle pour
                                  remplacer)
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Images */}
              <div className="space-y-4 w-full">
                <FormField
                  control={form.control}
                  name="images"
                  render={() => (
                    <FormItem>
                      <FormLabel>Images supplémentaires</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            ref={additionalImagesInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImagesChange}
                            disabled={loading}
                          />
                          {previewImages.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {previewImages.map((src, idx) => (
                                  <div key={idx} className="relative">
                                    <div className="relative inline-block border rounded-lg overflow-hidden">
                                      <Image
                                        src={src}
                                        alt={`Image supplémentaire ${idx + 1}`}
                                        width={100}
                                        height={75}
                                        className="object-cover"
                                        unoptimized
                                        onError={(e) => {
                                          (
                                            e.currentTarget as HTMLImageElement
                                          ).style.display = "none";
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteAdditionalImage(idx)
                                        }
                                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                        aria-label={`Supprimer l'image ${
                                          idx + 1
                                        }`}
                                        disabled={loading}
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {isEditMode && (
                                <p className="text-sm text-gray-500">
                                  Les images existantes seront conservées.
                                  Ajoutez de nouvelles images pour compléter la
                                  collection.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-6 w-full">
          <h3 className="text-lg font-medium">Description</h3>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Textarea
                    className="min-h-[100px] w-full"
                    placeholder="Entrez la description du véhicule"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6">
          <Button type="submit" disabled={loading || loadingBrands}>
            {loading
              ? "Traitement..."
              : isEditMode
              ? "Mettre à jour le véhicule"
              : "Créer le véhicule"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
