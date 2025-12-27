"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ClientForm from "@/components/client/ClientForm"
import { Layout } from "@/components/layouts/layout"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import type { ClientData } from "@/components/client/ClientForm"

export default function EditClientPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token, isAuthenticated, isLoading } = useAuth()
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchClientData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching client with ID:", id)
      console.log("API URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${id}`)
      console.log("Token:", token ? "Present" : "Missing")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)

      const result = await response.json()
      console.log("Response data:", result)

      if (!response.ok) {
        throw new Error(result.message || `Erreur HTTP: ${response.status}`)
      }

      if (!result.success) {
        throw new Error(result.message || "Erreur lors de la récupération du client")
      }

      const client = result.data?.client || result.data || result

      if (!client) {
        throw new Error("Données client manquantes dans la réponse")
      }

      console.log("Client data loaded:", client)

      setClientData({
        id: client.id,
        type: client.type || "client",
        nom: client.nom || "",
        prenom: client.prenom || "",
        ice_societe: client.ice_societe || "",
        nom_societe: client.nom_societe || "",
        date_naissance: client.date_naissance || "",
        lieu_de_naissance: client.lieu_de_naissance || "",
        adresse: client.adresse || "",
        telephone: client.telephone || "",
        ville: client.ville || "",
        postal_code: client.postal_code || "",
        email: client.email || "",
        nationalite: client.nationalite || "",
        numero_cin: client.numero_cin || "",
        date_cin_expiration: client.date_cin_expiration || "",
        numero_permis: client.numero_permis || "",
        date_permis: client.date_permis || "",
        passport: client.passport || "",
        date_passport: client.date_passport || "",
        description: client.description || "",
        bloquer: client.bloquer || false,
        documents: client.documents || "",
      })
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

    fetchClientData()
  }, [id, token, isAuthenticated, isLoading, router, fetchClientData])



  const handleSuccess = () => {
    toast({
      title: "Succès",
      description: "Client mis à jour avec succès!",
    })
    router.push("/client/list")
  }

  const handleRetry = () => {
    fetchClientData()
  }

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <div>Chargement des données du client...</div>
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
              <button onClick={handleRetry} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Réessayer
              </button>
              <button
                onClick={() => router.push("/client/list")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Retour à la liste
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!clientData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center text-red-600">
            <div>Aucune donnée client trouvée</div>
            <button
              onClick={() => router.push("/client/list")}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-8xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Modifier le client</h1>
          {/* <p className="text-gray-600">
            Modifiez les informations du client {clientData.nom} {clientData.prenom || ""}
          </p> */}
        </div>
        <ClientForm onSuccess={handleSuccess} initialData={clientData} isEditMode={true} />
      </div>
    </Layout>
  )
}
