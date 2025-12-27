"use client"

import { useState, useEffect, type ChangeEvent, useCallback, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, FileText, Trash2, RefreshCw, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { format } from "date-fns"
import { Calendar } from "../highlighted-calendar"
import { fr } from "date-fns/locale"



// Organisation logique des champs par groupes
const FIELD_GROUPS = {
  client: [
    // Première ligne - Informations de base
    [
      { name: "nom", label: "Nom", required: true, type: "text" },
      { name: "prenom", label: "Prénom", required: false, type: "text" },
    ],
    // Deuxième ligne - Contact
    [
      { name: "email", label: "Email", required: false, type: "email" },
      { name: "telephone", label: "Téléphone", required: false, type: "tel" },
    ],
    // Troisième ligne - Naissance
    [
      { name: "date_naissance", label: "Date de naissance", required: false, type: "date" },
      { name: "lieu_de_naissance", label: "Lieu de naissance", required: false, type: "text" },
    ],
    // Quatrième ligne - Adresse
    [
      { name: "adresse", label: "Adresse", required: false, type: "text" },
      { name: "ville", label: "Ville", required: false, type: "text" },
    ],
    // Cinquième ligne - Code postal et nationalité
    [
      { name: "postal_code", label: "Code postal", required: false, type: "text" },
      { name: "nationalite", label: "Nationalité", required: false, type: "text" },
    ],
    // Sixième ligne - CIN
    [
      { name: "numero_cin", label: "Numéro CIN", required: false, type: "text" },
      { name: "date_cin_expiration", label: "Date expiration CIN", required: false, type: "date" },
    ],
    // Septième ligne - Permis
    [
      { name: "numero_permis", label: "Numéro permis", required: false, type: "text" },
      { name: "date_permis", label: "Date permis", required: false, type: "date" },
    ],
    // Huitième ligne - Passeport
    [
      { name: "passport", label: "Passeport", required: false, type: "text" },
      { name: "date_passport", label: "Date passeport", required: false, type: "date" },
    ],
  ],
  societe: [
    // Première ligne - Informations de base
    [
      { name: "nom", label: "Nom", required: true, type: "text" },
      { name: "prenom", label: "Prénom", required: false, type: "text" },
    ],
    // Deuxième ligne - Société
    [
      { name: "nom_societe", label: "Nom de la société", required: false, type: "text" },
      { name: "ice_societe", label: "ICE Société", required: false, type: "text" },
    ],
    // Troisième ligne - Contact
    [
      { name: "email", label: "Email", required: false, type: "email" },
      { name: "telephone", label: "Téléphone", required: false, type: "tel" },
    ],
    // Quatrième ligne - Naissance
    [
      { name: "date_naissance", label: "Date de naissance", required: false, type: "date" },
      { name: "lieu_de_naissance", label: "Lieu de naissance", required: false, type: "text" },
    ],
    // Cinquième ligne - Adresse
    [
      { name: "adresse", label: "Adresse", required: false, type: "text" },
      { name: "ville", label: "Ville", required: false, type: "text" },
    ],
    // Sixième ligne - Code postal et nationalité
    [
      { name: "postal_code", label: "Code postal", required: false, type: "text" },
      { name: "nationalite", label: "Nationalité", required: false, type: "text" },
    ],
    // Septième ligne - CIN
    [
      { name: "numero_cin", label: "Numéro CIN", required: false, type: "text" },
      { name: "date_cin_expiration", label: "Date expiration CIN", required: false, type: "date" },
    ],
    // Huitième ligne - Permis
    [
      { name: "numero_permis", label: "Numéro permis", required: false, type: "text" },
      { name: "date_permis", label: "Date permis", required: false, type: "date" },
    ],
    // Neuvième ligne - Passeport
    [
      { name: "passport", label: "Passeport", required: false, type: "text" },
      { name: "date_passport", label: "Date passeport", required: false, type: "date" },
    ],
  ],
}

export type ClientData = {
  id?: number
  type: "client" | "societe"
  nom: string
  prenom?: string
  ice_societe?: string
  nom_societe?: string
  date_naissance?: string
  lieu_de_naissance?: string
  adresse?: string
  telephone?: string
  ville?: string
  postal_code?: string
  email?: string
  nationalite?: string
  numero_cin?: string
  date_cin_expiration?: string
  numero_permis?: string
  date_permis?: string
  passport?: string
  date_passport?: string
  description?: string
  bloquer?: boolean
  documents?: File[] | string
}

type ClientFormProps = {
  onSuccess?: () => void
  initialData?: ClientData
  isEditMode?: boolean
}

type DocumentItem = {
  id: string
  name: string
  path?: string // Pour les documents existants
  file?: File // Pour les nouveaux fichiers
  isExisting: boolean
  isImage: boolean
  previewUrl?: string
  toDelete?: boolean
  toReplace?: boolean
}

const useObjectURLs = () => {
  const urlsRef = useRef<string[]>([])

  const createObjectURL = (file: File): string => {
    const url = URL.createObjectURL(file)
    urlsRef.current.push(url)
    return url
  }

  const revokeAll = () => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    urlsRef.current = []
  }

  useEffect(() => () => revokeAll(), [])
  return { createObjectURL, revokeAll }
}

export default function ClientForm({ onSuccess, initialData, isEditMode = false }: ClientFormProps) {
  const router = useRouter()
  const { token } = useAuth()
  const { createObjectURL, revokeAll } = useObjectURLs()
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const documentsInputRef = useRef<HTMLInputElement>(null)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formSchema = z.object({
    type: z.enum(["client", "societe"], { required_error: "Le type est requis" }),
    nom: z.string().min(1, "Le nom est requis").max(255, "Nom trop long"),
    prenom: z.string().optional(),
    ice_societe: z.string().optional(),
    nom_societe: z.string().optional(),
    date_naissance: z
      .date()
      .optional()
      .refine((date) => !date || date <= today, {
        message: "La date de naissance doit être dans le passé",
      }),
    lieu_de_naissance: z.string().optional(),
    adresse: z.string().optional(),
    telephone: z.string().optional(),
    ville: z.string().optional(),
    postal_code: z.string().optional(),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    nationalite: z.string().optional(),
    numero_cin: z.string().optional(),
    date_cin_expiration: z
    .date()
    .optional()
    .refine((date) => !date || date >= today, {
      message: "La date d'expiration CIN doit être dans le futur",
    }),
    numero_permis: z.string().optional(),
    date_permis: z
    .date()
    .optional()
    .refine((date) => !date || date >= today, {
      message: "La date de permis doit être dans le futur",
    }),
    passport: z.string().optional(),
    date_passport: z
    .date()
    .optional()
    .refine((date) => !date || date >= today, {
      message: "La date de permis doit être dans le futur",
    }),
    description: z.string().max(1000, "Description trop longue").optional(),
    documents: z.any().optional(),
  })

  const getDefaultValues = () => ({
    type: initialData?.type || ("client" as const),
    nom: initialData?.nom || "",
    prenom: initialData?.prenom || "",
    nom_societe: initialData?.nom_societe || "",
    ice_societe: initialData?.ice_societe || "",
    email: initialData?.email || "",
    telephone: initialData?.telephone || "",
    date_naissance: initialData?.date_naissance ? new Date(initialData?.date_naissance) : undefined,
    lieu_de_naissance: initialData?.lieu_de_naissance || "",
    adresse: initialData?.adresse || "",
    ville: initialData?.ville || "",
    postal_code: initialData?.postal_code || "",
    nationalite: initialData?.nationalite || "",
    numero_cin: initialData?.numero_cin || "",
    date_cin_expiration: initialData?.date_cin_expiration ? new Date(initialData?.date_cin_expiration) : undefined,
    numero_permis: initialData?.numero_permis || "",
    date_permis: initialData?.date_permis ? new Date(initialData?.date_permis) : undefined,
    passport: initialData?.passport || "",
    date_passport: initialData?.date_passport ? new Date(initialData?.date_passport) : undefined,
    description: initialData?.description || "",
    documents: undefined,
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  })

  const watchedType = form.watch("type")

  // Helper functions
  const getDocumentName = (path: string) => {
    return path.split("/").pop() || path
  }

  const isImageFile = (path: string) => {
    const extension = path.split(".").pop()?.toLowerCase()
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")
  }



  // Load existing documents in edit mode
  useEffect(() => {
    const getImageUrl = (docPath: string) => {
      const filename = getDocumentName(docPath)
      // Utiliser l'URL publique directe vers le storage
      return `${process.env.NEXT_PUBLIC_API_URL}/storage/clients/documents/${filename}`
    }
    if (isEditMode && initialData?.documents) {
      try {
        const docs =
          typeof initialData.documents === "string" ? JSON.parse(initialData.documents) : initialData.documents
        if (Array.isArray(docs)) {
          const existingDocs: DocumentItem[] = docs.map((docPath, index) => {
            const isImage = isImageFile(docPath)
            console.log("Loading document:", docPath, "isImage:", isImage)

            return {
              id: `existing-${index}`,
              name: getDocumentName(docPath),
              path: docPath,
              isExisting: true,
              isImage,
              previewUrl: isImage ? getImageUrl(docPath) : undefined,
            }
          })

          console.log("Loaded existing documents:", existingDocs)
          setDocuments(existingDocs)
        }
      } catch (error) {
        console.error("Error parsing existing documents:", error)
      }
    }
  }, [isEditMode, initialData])

  const handleDocumentsChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (!files.length) return

      const validFiles = files.filter((file) => {
        const allowedTypes = [
          "application/pdf",
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]
        const maxSize = 5 * 1024 * 1024 // 5MB

        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Type de fichier invalide",
            description: `${file.name} n'est pas un type de fichier autorisé.`,
            variant: "destructive",
          })
          return false
        }

        if (file.size > maxSize) {
          toast({
            title: "Fichier trop volumineux",
            description: `${file.name} dépasse la taille maximale de 5MB.`,
            variant: "destructive",
          })
          return false
        }

        return true
      })

      if (validFiles.length > 0) {
        const newDocs: DocumentItem[] = validFiles.map((file, index) => ({
          id: `new-${Date.now()}-${index}`,
          name: file.name,
          file,
          isExisting: false,
          isImage: file.type.startsWith("image/"),
          previewUrl: file.type.startsWith("image/") ? createObjectURL(file) : undefined,
        }))

        setDocuments((prev) => [...prev, ...newDocs])
        form.setValue("documents", [...documents, ...newDocs])
      }

      // Reset input
      if (documentsInputRef.current) {
        documentsInputRef.current.value = ""
      }
    },
    [documents, createObjectURL, form],
  )

  const handleRemoveDocument = useCallback((docId: string) => {
    setDocuments((prev) => {
      const doc = prev.find((d) => d.id === docId)
      if (doc?.isExisting) {
        // Mark existing document for deletion
        return prev.map((d) => (d.id === docId ? { ...d, toDelete: true } : d))
      } else {
        // Remove new document completely
        return prev.filter((d) => d.id !== docId)
      }
    })
  }, [])

  const handleReplaceDocument = useCallback(
    (docId: string) => {
      // Trigger file input for replacement
      const input = document.createElement("input")
      input.type = "file"
      input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ]
          const maxSize = 5 * 1024 * 1024 // 5MB

          if (!allowedTypes.includes(file.type)) {
            toast({
              title: "Type de fichier invalide",
              description: `${file.name} n'est pas un type de fichier autorisé.`,
              variant: "destructive",
            })
            return
          }

          if (file.size > maxSize) {
            toast({
              title: "Fichier trop volumineux",
              description: `${file.name} dépasse la taille maximale de 5MB.`,
              variant: "destructive",
            })
            return
          }

          setDocuments((prev) =>
            prev.map((doc) => {
              if (doc.id === docId) {
                return {
                  ...doc,
                  name: file.name,
                  file,
                  isImage: file.type.startsWith("image/"),
                  previewUrl: file.type.startsWith("image/") ? createObjectURL(file) : undefined,
                  toReplace: doc.isExisting,
                }
              }
              return doc
            }),
          )
        }
      }
      input.click()
    },
    [createObjectURL],
  )

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setLoading(true)
      try {
        if (!token) {
          throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.")
        }

        // Validation conditionnelle
        if (values.type === "client" && !values.prenom) {
          toast({
            title: "Erreur de validation",
            description: "Le prénom est requis pour un client particulier.",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        if (values.type === "societe") {
          if (!values.nom_societe) {
            toast({
              title: "Erreur de validation",
              description: "Le nom de la société est requis pour une société.",
              variant: "destructive",
            })
            setLoading(false)
            return
          }

          if (!values.ice_societe) {
            toast({
              title: "Erreur de validation",
              description: "L'ICE de la société est requis pour une société.",
              variant: "destructive",
            })
            setLoading(false)
            return
          }
        }

        const formData = new FormData()

        // Ajouter tous les champs
        Object.entries(values).forEach(([key, value]) => {
          if (key === "documents") return // Géré séparément
          if (key.startsWith("date") && value != null && value != undefined) {
            formData.append(key, format(value, "yyyy-MM-dd"))
          }
          else if (value != null && value !== "") {
            formData.append(key, value.toString())
          }
        })

        // Gérer les documents
        const documentsToRemove: string[] = []
        const newFiles: File[] = []

        documents.forEach((doc) => {
          if (doc.toDelete && doc.isExisting && doc.path) {
            documentsToRemove.push(doc.path)
          } else if (doc.file) {
            newFiles.push(doc.file)
          }
        })

        // Ajouter les nouveaux documents
        if (newFiles.length > 0) {
          // newFiles.forEach((file) => {
          //   formData.append("documents[]", file)

          // })
          newFiles.forEach((file, index) => {
            formData.append(`documents[${index}]`, file)
          })

        }

        // Ajouter les documents à supprimer (comme array de strings)
        if (documentsToRemove.length > 0) {
          documentsToRemove.forEach((path) => {
            formData.append("remove_documents[]", path)
          })
        }

        const url =
          isEditMode && initialData?.id
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${initialData.id}`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/clients`

        if (isEditMode) {
          formData.append("_method", "PUT")
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
          if (response.status === 422 && result.errors) {
            const errorMessages = Object.values(result.errors).flat().join(", ")
            throw new Error(errorMessages)
          }
          throw new Error(result.message || `Erreur serveur: ${response.status}`)
        }

        toast({
          title: "Succès",
          description: isEditMode ? "Client mis à jour avec succès!" : "Client créé avec succès!",
        })

        if (!isEditMode) {
          // Reset form and files
          form.reset()
          setDocuments([])
          revokeAll()
          if (documentsInputRef.current) {
            documentsInputRef.current.value = ""
          }
        }

        if (onSuccess) onSuccess()
      } catch (error) {
        toast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [form, onSuccess, isEditMode, initialData, revokeAll, documents, token],
  )

  // Filter documents to show (hide deleted ones)
  const visibleDocuments = documents.filter((doc) => !doc.toDelete)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full" encType="multipart/form-data">

        {/* Champ Type de client - En haut, hors grille */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="max-w-sm">
              <FormLabel>Type de client<span className="text-red-500">*</span> </FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="client">Particulier</SelectItem>
                  <SelectItem value="societe">Société</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Champs organisés en grille logique */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FIELD_GROUPS[watchedType].map((fieldGroup) => (
            fieldGroup.map(({ name, label, required, type }) => (
              <FormField
                key={name}
                control={form.control}
                name={name as keyof z.infer<typeof formSchema>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {label}
                      {required && <span className="text-red-500"> *</span>}
                    </FormLabel>

                    {type === "date" ? (
                      // Placeholder for date-specific component
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              // disabled={fieldsDisabled}
                              variant={"outline"}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selectionner la date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            locale={fr}
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            // captionLayout="dropdown"
                            disabled={(date) => {
                              const today = new Date();
                              const fieldName = name;
                              const pastFields = ["date_naissance"]
                              if (pastFields.includes(fieldName)) {
                                return date > new Date(today.setHours(0, 0, 0, 0));
                              } else {
                                return date < new Date(today.setHours(0, 0, 0, 0));
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <FormControl>
                        <Input
                          type={type}
                          {...field}
                          value={field.value ?? ""}
                          disabled={loading}
                        />
                      </FormControl>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />

            ))
          ))}
        </div>


        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[100px]"
                  placeholder="Description du client..."
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="documents"
          render={() => (
            <FormItem>
              <FormLabel>Documents</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-4">
                  {/* Upload section */}
                  <div className="flex items-center gap-4">
                    <Input
                      ref={documentsInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                      multiple
                      onChange={handleDocumentsChange}
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => documentsInputRef.current?.click()}
                      disabled={loading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>

                  {/* All documents display */}
                  {visibleDocuments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Documents ({visibleDocuments.length})</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {visibleDocuments.map((doc) => (
                          <div key={doc.id} className="relative border rounded-lg p-2 bg-gray-50">
                            {doc.isImage && doc.previewUrl ? (
                              <div className="relative">
                                <Image
                                  src={doc.previewUrl || "/placeholder.svg"}
                                  alt={doc.name}
                                  width={100}
                                  height={100}
                                  className="object-cover rounded w-full h-30"
                                  unoptimized
                                  onError={(e) => {
                                    console.error("Image failed to load:", doc.previewUrl)
                                    // Fallback to file icon if image fails to load
                                    const target = e.target as HTMLImageElement
                                    target.style.display = "none"
                                    const parent = target.parentElement
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div class="flex items-center justify-center h-20 bg-gray-100 rounded">
                                          <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                          </svg>
                                        </div>
                                      `
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-20 bg-gray-100 rounded">
                                <FileText className="h-8 w-8 text-gray-400" />
                              </div>
                            )}

                            {/* Status indicator */}
                            {doc.toReplace && (
                              <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                                Remplacé
                              </div>
                            )}
                            {!doc.isExisting && (
                              <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                                Nouveau
                              </div>
                            )}

                            <div className="absolute -top-2 -right-2 flex gap-1">
                              {/* Replace button */}
                              <button
                                type="button"
                                onClick={() => handleReplaceDocument(doc.id)}
                                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1 transition-colors"
                                disabled={loading}
                                title="Remplacer"
                              >
                                <RefreshCw size={12} />
                              </button>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(doc.id)}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                disabled={loading}
                                title="Supprimer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Boutons */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Traitement..." : isEditMode ? "Mettre à jour" : "Créer le client"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  )
}