"use client"

import { useState, useRef, useEffect, useCallback, type ChangeEvent } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Upload, FileText, Trash2, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Layout } from "@/components/layouts/layout"
import Image from "next/image"

import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/highlighted-calendar"
import { fr } from "date-fns/locale"
import { VehicleSelect, type Vehicle } from "@/components/ui/vehicle-select"

const formSchema = z.object({
  vehicule_id: z.string().min(1, "Le véhicule est requis"),
  numero: z.string().min(1, "Le numéro est requis"),
  date: z.date(),
  date_prochaine: z.date(),
  date_reglement: z.date().optional(),
  prix: z.string().min(1, "Le prix est requis"),
  description: z.string().optional(),
})

type DocumentItem = {
  id: string
  name: string
  file: File
  isImage: boolean
  previewUrl?: string
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

export default function AddVignettePage() {
  const router = useRouter()
  const { token, isAuthenticated, isLoading } = useAuth()
  const { createObjectURL, revokeAll } = useObjectURLs()
  const [loading, setLoading] = useState(false)
  const [vehicules, setVehicules] = useState<Vehicle[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const documentsInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicule_id: "",
      numero: "",
      date: new Date(),
      date_prochaine: new Date(),
      date_reglement: undefined,
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
  }, [dateForm,dateReglement, dateProchain, form]);

  useEffect(() => {
    const fetchVehicules = async () => {
      if (!token) return
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicules`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        const result = await response.json()
        const vehiculesData = result.data ?? result
        setVehicules(vehiculesData || [])
      } catch (error) {
        console.error("Error fetching vehicules:", error)
      }
    }
    fetchVehicules()
  }, [token])

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

  const removeDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId))
  }

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setLoading(true)
      try {
        if (!token) {
          throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.")
        }

        const formData = new FormData()
        formData.append("vehicule_id", values.vehicule_id)
        formData.append("numero", values.numero)
        formData.append("date", format(values.date, "yyyy-MM-dd"))
        formData.append("date_prochaine", format(values.date_prochaine, "yyyy-MM-dd"))
        if (values.date_reglement) {
          formData.append("date_reglement", format(values.date_reglement, "yyyy-MM-dd"))
        }
        formData.append("prix", values.prix)
        if (values.description) {
          formData.append("description", values.description)
        }

        documents.forEach((doc) => {
          formData.append("fichiers[]", doc.file)
        })

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vignettes`, {
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
          description: "Vignette créée avec succès!",
        })

        // Reset form and documents
        form.reset()
        setDocuments([])
        revokeAll()
        router.push("/vignette/list")
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
    [documents, token, router, form, revokeAll],
  )

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">Chargement...</div>
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Layout>
      <div className="max-w-8xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Ajouter une nouvelle vignette</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Utilisation du VehicleSelect personnalisé */}
              <FormField
                control={form.control}
                name="vehicule_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Véhicule <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <VehicleSelect
                        vehicles={vehicules}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Rechercher et sélectionner un véhicule..."
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
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro de vignette" {...field} disabled={loading} />
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
                    <FormLabel>Date  <span className="text-red-500"> *</span></FormLabel>
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
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}

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
                    <FormLabel>Date prochaine  <span className="text-red-500"> *</span></FormLabel>
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
                            console.log(date)
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
                    <FormLabel>Date règlement</FormLabel>
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
                            console.log(date)
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
                name="prix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix <span className="text-red-500">*</span></FormLabel>
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
                        placeholder="Description de la vignette..."
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Documents ({documents.length})</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {documents.map((doc) => (
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
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-20 bg-gray-100 rounded">
                                <FileText className="h-8 w-8 text-gray-400" />
                              </div>
                            )}

                            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                              Nouveau
                            </div>

                            <button
                              type="button"
                              onClick={() => removeDocument(doc.id)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                              disabled={loading}
                              title="Supprimer"
                            >
                              <Trash2 size={12} />
                            </button>

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
                {loading ? "Traitement..." : "Créer la vignette"}
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