"use client"

import ClientForm from "@/components/client/ClientForm"
import { Layout } from "@/components/layouts/layout"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AddClientPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  const handleSuccess = () => {
    toast({
      title: "Succès",
      description: "Client créé avec succès!",
    })
  }

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
      <div className="max-w-8xl mx-auto p-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold ">Ajouter un nouveau client</h1>
          
        </div>
        <ClientForm onSuccess={handleSuccess} />
      </div>
    </Layout>
  )
}
