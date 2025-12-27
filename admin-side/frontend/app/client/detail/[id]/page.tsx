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
import {
  ArrowLeft,
  User,
  Building2,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Car,
  FileCheck,
} from "lucide-react"
import Image from "next/image"
import { Client } from "../../list/page"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import PdfViewer from "@/components/pdf-viewer";

type Reservation = {
  id: number
  vehicule_id: number
  date_debut: string
  date_fin: string
  status: string
  prix_total: number
  created_at: string
}

type Contrat = {
  id: number
  vehicule_id: number
  date_debut: string
  date_fin: string
  status: string
  prix_total: number
  type_contrat: string
  created_at: string
}

type ClientDetails = {
  client: Client
  reservations: Reservation[]
  contrats: Contrat[]
}

export default function ClientDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token, isAuthenticated, isLoading } = useAuth()
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openedFile, setOpenedFile] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [clientDocuments, setClientDocuments] = useState<{ url: string, name: string }[]>([]);

  const fetchClientDetails = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `Erreur HTTP: ${response.status}`)
      }

      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la récupération des détails du client")
      }

      setClientDetails(result.data)
      // Mapping documents_urls en PreviewFile
      if (result.data && result.data.client && Array.isArray(result.data.client.documents_urls)) {
        setClientDocuments(
          result.data.client.documents_urls.map((url: string) => ({
            url,
            name: url.split("/").pop() || "document.pdf"
          }))
        );
      } else {
        setClientDocuments([]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Impossible de charger les détails de l'assurance"
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

    fetchClientDetails()
  }, [id, token, isAuthenticated, isLoading, router, fetchClientDetails])

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Actif", variant: "default" as const },
      pending: { label: "En attente", variant: "secondary" as const },
      completed: { label: "Terminé", variant: "outline" as const },
      cancelled: { label: "Annulé", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
    }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getDocumentName = (path: string) => {
    return path.split("/").pop() || path
  }

  const isImageFile = (path: string) => {
    const extension = path.split(".").pop()?.toLowerCase()
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")
  }

  // const getPdfUrl = (docPath: string) => {
  //   const filename = getDocumentName(docPath)
  //   return `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${id}/documents/${filename}`
  // }

  const getImageUrl = (docPath: string) => {
    const filename = getDocumentName(docPath)
    return `${process.env.NEXT_PUBLIC_API_URL}/storage/clients/documents/${filename}`
  }

  const handleRetry = () => {
    fetchClientDetails()
  }

  const fetchAndOpenPdf = async (docPath: string) => {
    const filename = getDocumentName(docPath);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${id}/documents/${filename}`;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf',
        },
      });
      if (!res.ok) throw new Error('Erreur lors de la récupération du PDF');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPdfBlobUrl(blobUrl);
      setOpenedFile(blobUrl);
    } catch (e) {
      console.error(e)
      toast({ title: 'Erreur', description: 'Impossible de prévisualiser le PDF.' });
    }
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <div>Chargement des détails du client...</div>
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
            <div className="space-x-4">
              <Button onClick={handleRetry} className="bg-blue-500 hover:bg-blue-600 text-white">
                Réessayer
              </Button>
              <Button onClick={() => router.push("/client/list")} variant="outline">
                Retour à la liste
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!clientDetails) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center text-red-600">
            <div>Aucune donnée client trouvée</div>
            <Button onClick={() => router.push("/client/list")} className="mt-4" variant="outline">
              Retour à la liste
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const { client, reservations, contrats } = clientDetails
  const documents = client.documents ? JSON.parse(client.documents) : []

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/client/list")} variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {client.type === "client" ? <User className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                {client.nom} {client.prenom || ""}
              </h1>
              <p className="text-gray-600">
                {client.type === "client" ? "Client particulier" : "Société"} 
              </p>
            </div>
          </div>
          <Badge variant={client.type === "client" ? "default" : "secondary"} className="text-sm">
            {client.type === "client" ? "Particulier" : "Société"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations personnelles */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom</label>
                    <p className="text-sm">{client.nom || "N/A"}</p>
                  </div>
                  {client.prenom && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Prénom</label>
                      <p className="text-sm">{client.prenom}</p>
                    </div>
                  )}
                  {client.nom_societe && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nom de la société</label>
                      <p className="text-sm">{client.nom_societe}</p>
                    </div>
                  )}
                  {client.ice_societe && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">ICE Société</label>
                      <p className="text-sm">{client.ice_societe}</p>
                    </div>
                  )}
                  {client.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </label>
                      <p className="text-sm">{client.email}</p>
                    </div>
                  )}
                  {client.telephone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Téléphone
                      </label>
                      <p className="text-sm">{client.telephone}</p>
                    </div>
                  )}
                  {client.date_naissance && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Date de naissance
                      </label>
                      <p className="text-sm">{formatDate(client.date_naissance)}</p>
                    </div>
                  )}
                  {client.lieu_de_naissance && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Lieu de naissance</label>
                      <p className="text-sm">{client.lieu_de_naissance}</p>
                    </div>
                  )}
                  {client.nationalite && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nationalité</label>
                      <p className="text-sm">{client.nationalite}</p>
                    </div>
                  )}
                </div>

                {(client.adresse || client.ville || client.postal_code) && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-1 mb-2">
                        <MapPin className="h-3 w-3" />
                        Adresse
                      </label>
                      <div className="space-y-1">
                        {client.adresse && <p className="text-sm">{client.adresse}</p>}
                        <div className="flex gap-2 text-sm">
                          {client.postal_code && <span>{client.postal_code}</span>}
                          {client.ville && <span>{client.ville}</span>}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {(client.numero_cin ||
                  client.date_cin_expiration ||
                  client.numero_permis ||
                  client.date_permis ||
                  client.passport ||
                  client.date_passport) && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-gray-500 flex items-center gap-1 mb-2">
                          <CreditCard className="h-3 w-3" />
                          Documents d&apos;identité
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {client.numero_cin && (
                            <div>
                              <label className="text-xs font-medium text-gray-400">N° CIN</label>
                              <p className="text-sm">{client.numero_cin}</p>
                              {client.date_cin_expiration && (
                                <p className="text-xs text-gray-500">
                                  Expire le {formatDate(client.date_cin_expiration)}
                                </p>
                              )}
                            </div>
                          )}
                          {client.numero_permis && (
                            <div>
                              <label className="text-xs font-medium text-gray-400">N° Permis</label>
                              <p className="text-sm">{client.numero_permis}</p>
                              {client.date_permis && (
                                <p className="text-xs text-gray-500">Délivré le {formatDate(client.date_permis)}</p>
                              )}
                            </div>
                          )}
                          {client.passport && (
                            <div>
                              <label className="text-xs font-medium text-gray-400">Passeport</label>
                              <p className="text-sm">{client.passport}</p>
                              {client.date_passport && (
                                <p className="text-xs text-gray-500">Délivré le {formatDate(client.date_passport)}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                {client.description && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{client.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
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
                      const isPdf = docPath.toLowerCase().endsWith('.pdf')
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
                                      <div class=\"flex items-center justify-center h-20 bg-gray-100 rounded\">
                                        <svg class=\"h-8 w-8 text-gray-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                                          <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\"></path>
                                        </svg>
                                      </div>
                                    `
                                  }
                                }}
                              />
                            </div>
                          ) : isPdf ? (
                            <div
                              className="flex items-center justify-center h-20 bg-red-500/70 rounded cursor-pointer hover:bg-red-500/90 text-white gap-2"
                              onClick={() => fetchAndOpenPdf(docPath)}
                              title={documentName}
                            >
                              <Image
                                src="/pdf-icon.svg"
                                alt="pdf icon"
                                width={24}
                                height={24}
                              />
                              <span className="text-xs truncate">{documentName}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-20 bg-gray-100 rounded">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Réservations et Contrats */}
          <div className="space-y-6">
            {/* Réservations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Réservations ({reservations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reservations.length > 0 ? (
                  <div className="space-y-3">
                    {reservations.slice(0, 5).map((reservation) => (
                      <div key={reservation.id} className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">Réservation #{reservation.id}</span>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>
                            Du {formatDate(reservation.date_debut)} au {formatDate(reservation.date_fin)}
                          </p>
                          <p className="font-medium">{formatCurrency(reservation.prix_total)}</p>
                        </div>
                      </div>
                    ))}
                    {reservations.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{reservations.length - 5} autres réservations
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Aucune réservation</p>
                )}
              </CardContent>
            </Card>

            {/* Contrats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Contrats ({contrats.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contrats.length > 0 ? (
                  <div className="space-y-3">
                    {contrats.slice(0, 5).map((contrat) => (
                      <div key={contrat.id} className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">Contrat #{contrat.id}</span>
                          {getStatusBadge(contrat.status)}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>{contrat.type_contrat}</p>
                          <p>
                            Du {formatDate(contrat.date_debut)} au {formatDate(contrat.date_fin)}
                          </p>
                          <p className="font-medium">{formatCurrency(contrat.prix_total)}</p>
                        </div>
                      </div>
                    ))}
                    {contrats.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">+{contrats.length - 5} autres contrats</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Aucun contrat</p>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
      {/* Documents PDF du client */}
      {clientDocuments.length > 0 && (
        <div className="max-w-4xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents ({clientDocuments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clientDocuments.map((doc, idx) => (
                  <div
                    key={doc.url + idx}
                    className="relative rounded-md flex items-center gap-4 w-full"
                    onClick={() => setOpenedFile(doc.url)}
                  >
                    <div className="cursor-pointer hover:bg-red-500/90 flex items-center gap-2 w-full py-3 px-4 rounded-lg h-[60px] bg-red-500/70 text-white">
                      <Image
                        src="/pdf-icon.svg"
                        alt="pdf icon"
                        title="pdf-icon"
                        className="h-full"
                        width={24}
                        height={24}
                      />
                      <span className="text-sm">{doc.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <Dialog open={!!openedFile} onOpenChange={() => {
        setOpenedFile(null);
        if (pdfBlobUrl) {
          URL.revokeObjectURL(pdfBlobUrl);
          setPdfBlobUrl(null);
        }
      }}>
        <DialogContent className="min-w-[90%]">
          <DialogHeader>
            <DialogTitle>Prévisualisation PDF</DialogTitle>
            <DialogDescription asChild>
              <div className={`w-full h-[70vh] overflow-auto`}>
                {openedFile && <PdfViewer fileUrl={openedFile} />}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
