"use client"

import { useEffect, useState, useRef, useCallback, type ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Layout } from "@/components/layouts/layout"
import { Upload, FileText, Trash2, RefreshCw, CalendarIcon } from "lucide-react"
import Image from "next/image"

import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/highlighted-calendar"
import { fr } from "date-fns/locale"
import { Vehicle, VehicleSelect } from "@/components/ui/vehicle-select"

const formSchema = z.object({
  vehicule_id: z.string().min(1, "Le véhicule est requis"),
  date: z.date(),
  prix: z.string().min(1, "Le prix est requis"),
  description: z.string().optional(),
})

type DocumentItem = {
  id: string
  name: string
  path?: string
  file?: File
  isExisting: boolean
  isImage: boolean
  previewUrl?: string
  toDelete?: boolean
  replacedPath?: string // Path of the file being replaced
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

export default function EditInterventionPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token, isAuthenticated, isLoading } = useAuth()
  const { createObjectURL } = useObjectURLs()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [vehicules, setVehicules] = useState<Vehicle[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const documentsInputRef = useRef<HTMLInputElement>(null)
  const [dateIntervention,setDateIntervention] = useState<Date>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicule_id: "",
      date: new Date(),
      prix: "",
      description: "",
    },
  })
  
  const fetchData = useCallback(async () => {
    setFetchLoading(true)
    setError(null)
    try {
      const interventionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interventions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      const interventionResult = await interventionResponse.json()

      if (!interventionResponse.ok) {
        throw new Error(interventionResult.message || "Erreur lors de la récupération de l'intervention")
      }

      const intervention = interventionResult.data
      setDateIntervention(intervention.date)
      form.reset({
        vehicule_id: intervention.vehicule_id.toString(),
        date: intervention.date,
        prix: intervention.prix.toString(),
        description: intervention.description || "",
      })

      if (intervention.fichier) {
        try {
          const docs = JSON.parse(intervention.fichier)
          if (Array.isArray(docs)) {
            const existingDocs: DocumentItem[] = docs.map((docPath, index) => {
              const isImage = isImageFile(docPath)
              return {
                id: `existing-${index}`,
                name: getDocumentName(docPath),
                path: docPath,
                isExisting: true,
                isImage,
                previewUrl: isImage ? getImageUrl(docPath) : undefined,
              }
            })
            setDocuments(existingDocs)
          }
        } catch (error) {
          console.error("Error parsing existing documents:", error)
        }
      }

      const vehiculesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicules`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      const vehiculesResult = await vehiculesResponse.json()
      setVehicules(vehiculesResult.data ?? vehiculesResult)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de charger les détails de l'intervention"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setFetchLoading(false)
    }
  }, [id, token, form])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }
    if (!token || !id) return
    fetchData()
  }, [id, token, isAuthenticated, isLoading, router, fetchData])

  // Helper functions
  const getDocumentName = (path: string) => {
    return path.split("/").pop() || path
  }

  const isImageFile = (path: string) => {
    const extension = path.split(".").pop()?.toLowerCase()
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")
  }

  const getImageUrl = (docPath: string) => {
    return `${process.env.NEXT_PUBLIC_API_URL}/storage/${docPath}`
  }

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
        const maxSize = 5 * 1024 * 1024

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
      }

      // Reset input
      if (documentsInputRef.current) {
        documentsInputRef.current.value = ""
      }
    },
    [createObjectURL],
  )

  const handleRemoveDocument = useCallback((docId: string) => {
    setDocuments((prev) => {
      const doc = prev.find((d) => d.id === docId)
      if (doc?.isExisting) {
        return prev.map((d) => (d.id === docId ? { ...d, toDelete: true } : d))
      } else {
        return prev.filter((d) => d.id !== docId)
      }
    })
  }, [])

  const handleReplaceDocument = useCallback(
    (docId: string) => {
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
          const maxSize = 5 * 1024 * 1024

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
                  replacedPath: doc.isExisting ? doc.path : undefined, // Store the path of the file being replaced
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("vehicule_id", values.vehicule_id)
      formData.append("date", format(values.date,"yyyy-MM-dd"))
      formData.append("prix", values.prix)
      if (values.description) {
        formData.append("description", values.description)
      }

      // Handle documents
      const documentsToRemove: string[] = []
      const newFiles: File[] = []
      const replacedFiles: string[] = []

      documents.forEach((doc) => {
        if (doc.toDelete && doc.isExisting && doc.path) {
          // Document marked for deletion
          documentsToRemove.push(doc.path)
        } else if (doc.file) {
          // New file or replacement file
          newFiles.push(doc.file)
          if (doc.replacedPath) {
            // This is a replacement, mark old file for deletion
            replacedFiles.push(doc.replacedPath)
          }
        }
      })

      // Add files to remove (deleted + replaced)
      const allFilesToRemove = [...documentsToRemove, ...replacedFiles]
      if (allFilesToRemove.length > 0) {
        allFilesToRemove.forEach((path) => {
          formData.append("remove_fichier[]", path)
        })
      }

      // Add new files
      if (newFiles.length > 0) {
        newFiles.forEach((file) => {
          formData.append("fichier[]", file)
        })
      }

      formData.append("_method", "PUT")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interventions/${id}`, {
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
        description: "Intervention mise à jour avec succès!",
      })

      router.push("/intervention/list")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer."
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter documents to show (hide deleted ones)
  const visibleDocuments = documents.filter((doc) => !doc.toDelete)

  if (isLoading || fetchLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <div>Chargement...</div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md">
            <div className="text-red-600 mb-4">
              <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
              <p>{error}</p>
            </div>
            <Button onClick={() => router.push("/intervention/list")} variant="outline">
              Retour à la liste
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-8xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Modifier l&apos;intervention</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="vehicule_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Véhicule *</FormLabel>
                    <FormControl>
                      <VehicleSelect
                        vehicles={vehicules}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner un véhicule..."
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    {/* <FormControl>
                      <Input type="date" {...field} disabled={loading} />
                    </FormControl> */}
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
                            today.setHours(0, 0, 0, 0);
                            const vignetteDate = dateIntervention ? new Date(dateIntervention) : null;
                            if (vignetteDate) vignetteDate.setHours(0, 0, 0, 0);

                            const minDate = vignetteDate && vignetteDate < today ? vignetteDate : today;
                            // console.log(minDate)
                            return date < minDate;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px]"
                        placeholder="Description de l'intervention..."
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Documents */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Documents</label>
                <div className="flex flex-col gap-4 mt-2">
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
                                  className="object-cover rounded w-full h-20"
                                  unoptimized
                                  onError={(e) => {
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

                            

                            {/* Action buttons */}
                            <div className="absolute -top-2 -right-2 flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleReplaceDocument(doc.id)}
                                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1 transition-colors"
                                disabled={loading}
                                title="Remplacer"
                              >
                                <RefreshCw size={12} />
                              </button>
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

                            <p className="text-xs mt-1 truncate" title={doc.name}>
                              {doc.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Traitement..." : "Mettre à jour"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  )
}
