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
import { VehicleSelect, type Vehicle } from "@/components/ui/vehicle-select"
import Image from "next/image"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/highlighted-calendar"
import { fr } from "date-fns/locale"
import { Assurance } from "@/components/assurance/AssuranceTable"

const formSchema = z.object({
  vehicule_id: z.string().min(1, "Le véhicule est requis"),
  numero_assurance: z.string().min(1, "Le numéro d'assurance est requis"),
  numero_de_police: z.string().optional(),
  date: z.date(),
  date_prochaine: z.date(),
  date_reglement: z.date().optional(),
  periode: z.string().optional(),
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
  replacedPath?: string
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

export default function EditAssurancePage() {
  const { id } = useParams()
  const router = useRouter()
  const { token, isAuthenticated, isLoading } = useAuth()
  const { createObjectURL } = useObjectURLs()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [vehicules, setVehicules] = useState<Vehicle[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [assurance, setAssurance] = useState<Assurance>()
  const documentsInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicule_id: "",
      numero_assurance: "",
      numero_de_police: "",
      date: new Date(),
      date_prochaine: new Date(),
      date_reglement: undefined,
      periode: "",
      prix: "",
      description: "",
    },
  })

  const dateForm = form.watch("date");
  const dateProchain = form.watch("date_prochaine");
  const dateReglement = form.watch("date_reglement");

  useEffect(() => {
    if (dateForm && dateProchain && dateProchain < dateForm) {
      form.setValue("date_prochaine", dateForm);
    }
    if (dateForm && dateReglement && dateReglement < dateForm) {
      form.setValue("date_reglement", dateForm);
    }
  }, [dateForm, dateReglement, dateProchain, form]);

  const fetchData = useCallback(async () => {
    setFetchLoading(true)
    setError(null)
    try {
      // Fetch assurance data
      const assuranceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assurances/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      const assuranceResult = await assuranceResponse.json()

      if (!assuranceResponse.ok) {
        throw new Error(assuranceResult.message || "Erreur lors de la récupération de l'assurance")
      }

      const assurance = assuranceResult.data
      setAssurance(assuranceResult.data)
      form.reset({
        vehicule_id: assurance.vehicule_id.toString(),
        numero_assurance: assurance.numero_assurance,
        numero_de_police: assurance.numero_de_police || "",
        date: new Date(assurance.date),
        date_prochaine: new Date(assurance.date_prochaine),
        date_reglement: assurance.date_reglement ? new Date(assurance.date_reglement) : undefined,
        periode: assurance.periode || "",
        prix: assurance.prix.toString(),
        description: assurance.description || "",
      })

      // Load existing documents
      if (assurance.fichiers) {
        try {
          const docs = JSON.parse(assurance.fichiers)
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

      // Fetch vehicules
      const vehiculesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicules`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      const vehiculesResult = await vehiculesResponse.json()
      const vehiculesData = vehiculesResult.data ?? vehiculesResult

      const transformedVehicules: Vehicle[] = (vehiculesData || []).map((v: Vehicle) => ({
        id: v.id,
        name: v.name || `${v.marque || ""} ${v.modele || ""}`.trim(),
        matricule: v.matricule || v.immatriculation || "",
        marque: v.marque,
        modele: v.modele,
      }))

      setVehicules(transformedVehicules)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de charger les détails de l'assurance"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setFetchLoading(false)
    }
  }, [form, id, token])

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
                  replacedPath: doc.isExisting ? doc.path : undefined,
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
      formData.append("numero_assurance", values.numero_assurance)
      if (values.numero_de_police) formData.append("numero_de_police", values.numero_de_police)
      formData.append("date", format(values.date, "yyyy-MM-dd"))
      if (values.date_prochaine) formData.append("date_prochaine", format(values.date_prochaine, "yyyy-MM-dd"))
      if (values.date_reglement) formData.append("date_reglement", format(values.date_reglement, "yyyy-MM-dd"))
      if (values.periode) formData.append("periode", values.periode)
      formData.append("prix", values.prix)
      if (values.description) formData.append("description", values.description)

      // Handle documents
      const documentsToRemove: string[] = []
      const newFiles: File[] = []
      const replacedFiles: string[] = []

      documents.forEach((doc) => {
        if (doc.toDelete && doc.isExisting && doc.path) {
          documentsToRemove.push(doc.path)
        } else if (doc.file) {
          newFiles.push(doc.file)
          if (doc.replacedPath) {
            replacedFiles.push(doc.replacedPath)
          }
        }
      })

      // Add files to remove (deleted + replaced)
      const allFilesToRemove = [...documentsToRemove, ...replacedFiles]
      if (allFilesToRemove.length > 0) {
        allFilesToRemove.forEach((path) => {
          formData.append("remove_fichiers[]", path)
        })
      }

      // Add new files
      if (newFiles.length > 0) {
        newFiles.forEach((file) => {
          formData.append("fichiers[]", file)
        })
      }

      formData.append("_method", "PUT")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assurances/${id}`, {
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
        description: "Assurance mise à jour avec succès!",
      })

      router.push("/assurance/list")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de charger les détails de l'assurance"
      setError(errorMessage)
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
            <Button onClick={() => router.push("/assurance/list")} variant="outline">
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
          <h1 className="text-2xl font-bold">Modifier l&apos;assurance</h1>

        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="vehicule_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Véhicule <span className="text-red-500"> *</span></FormLabel>
                    <FormControl>
                      <VehicleSelect
                        vehicles={vehicules}
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={loading}
                        placeholder="Rechercher et sélectionner un véhicule..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero_assurance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro d&apos;assurance <span className="text-red-500"> *</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: ASS-2024-001" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero_de_police"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de police</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: POL-2024-001" {...field} disabled={loading} />
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
                    <FormLabel>Date <span className="text-red-500"> *</span></FormLabel>
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
                            const vignetteDate = assurance?.date ? new Date(assurance.date) : null;
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
                name="date_prochaine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date prochaine échéance</FormLabel>
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
                            // console.log(date)
                            return (
                              date < new Date(new Date(format(new Date(dateForm), "yyyy-MM-dd")).setHours(0, 0, 0, 0))
                            );
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
                name="date_reglement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de règlement</FormLabel>
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
                            // console.log(date)
                            return (
                              date < new Date(new Date(format(new Date(dateForm), "yyyy-MM-dd")).setHours(0, 0, 0, 0))
                            );
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
                name="periode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Période</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 12 mois, Annuelle..." {...field} disabled={loading} />
                    </FormControl>
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
                        placeholder="Description de l&apos;assurance..."
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
                                  className="object-cover rounded w-full h-30"
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
