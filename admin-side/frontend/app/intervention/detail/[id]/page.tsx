"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Layout } from "@/components/layouts/layout"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Car, FileText, Calendar, DollarSign, Settings } from "lucide-react"
import Image from "next/image"

type Intervention = {
  id: number
  vehicule_id: number
  date: string
  prix: number
  fichier?: string
  description?: string
  created_at?: string
  updated_at?: string
  vehicule_name?: string
  vehicule_matricule?: string
}

export default function InterventionDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token, isAuthenticated, isLoading } = useAuth()
  const [intervention, setIntervention] = useState<Intervention | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInterventionDetails = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interventions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `Erreur HTTP: ${response.status}`)
      }

      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la récupération des détails de l'intervention")
      }

      setIntervention(result.data)
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
  }, [id, token])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }
    if (!token || !id) return
    fetchInterventionDetails()
  }, [id, token, isAuthenticated, isLoading, router, fetchInterventionDetails])




  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD",
    }).format(amount)
  }

  const getDocumentName = (path: string) => {
    return path.split("/").pop() || path
  }

  const isImageFile = (path: string) => {
    const extension = path.split(".").pop()?.toLowerCase()
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")
  }

  const getImageUrl = (docPath: string) => {
    // const filename = getDocumentName(docPath)
    return `${process.env.NEXT_PUBLIC_API_URL}/storage/${docPath}`
  }

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <div>Chargement des détails de l&apos;intervention...</div>
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

  if (!intervention) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center text-red-600">
            <div>Aucune donnée intervention trouvée</div>
            <Button onClick={() => router.push("/intervention/list")} className="mt-4" variant="outline">
              Retour à la liste
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const documents = intervention.fichier ? JSON.parse(intervention.fichier) : []

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/intervention/list")} variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Intervention #{intervention.id}
              </h1>
              <p className="text-gray-600">
                {formatDate(intervention.date)} • {formatCurrency(intervention.prix)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/intervention/edit/${intervention.id}`)} variant="outline">
              Modifier
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Détails de l&apos;intervention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Date
                    </label>
                    <p className="text-sm">{formatDate(intervention.date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Prix
                    </label>
                    <p className="text-sm font-semibold">{formatCurrency(intervention.prix)}</p>
                  </div>
                  {/* {intervention.created_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Créé le</label>
                      <p className="text-sm">{formatDate(intervention.created_at)}</p>
                    </div>
                  )}
                  {intervention.updated_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Modifié le</label>
                      <p className="text-sm">{formatDate(intervention.updated_at)}</p>
                    </div>
                  )} */}
                </div>

                {intervention.description && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{intervention.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents ({documents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {documents.map((docPath: string, index: number) => {
                      const isImage = isImageFile(docPath)
                      const documentName = getDocumentName(docPath)
                      return (
                        <div key={index} className="border rounded-lg p-2 bg-gray-50">
                          {isImage ? (
                            <div className="relative">
                              <Image
                                src={getImageUrl(docPath) || "/placeholder.svg"}
                                alt={documentName}
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
                          <p className="text-xs mt-1 truncate" title={documentName}>
                            {documentName}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Véhicule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom</label>
                    <p className="text-sm font-semibold">{intervention.vehicule_name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Matricule</label>
                    <p className="text-sm">
                      <Badge variant="outline">{intervention.vehicule_matricule || "N/A"}</Badge>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
