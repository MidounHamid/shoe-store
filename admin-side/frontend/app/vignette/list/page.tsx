"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Layout } from "@/components/layouts/layout"
import VignetteTable from "@/components/vignette/VignetteTable"

export type Vignette = {
  id: number
  vehicule_id: number
  numero: string
  date: string
  date_prochaine: string
  date_reglement?: string
  prix: number
  fichiers?: string
  description?: string
  created_at?: string
  vehicule_name?: string
  vehicule_matricule?: string
}

function useVignettes() {
  const [data, setData] = useState<Vignette[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  const fetchVignettes = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vignettes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const result = await response.json()
      const vignettes = result.data ?? result
      setData(vignettes)
    } catch (err) {
      console.error("Failed to fetch vignettes", err)
    } finally {
      setLoading(false)
    }
  }, [token])

  const removeVignette = useCallback((vignetteId: number) => {
    setData((prev) => prev.filter((vignette) => vignette.id !== vignetteId))
  }, [])

  useEffect(() => {
    fetchVignettes()
  }, [fetchVignettes])

  return { data, loading, removeVignette }
}

export default function VignetteListPage() {
  const { data, loading, removeVignette } = useVignettes()

  return (
    <Layout>
      <VignetteTable
        data={data}
        loading={loading}
        title="Liste des Vignettes"
        //showAddButton={true}
        onVignetteRemove={removeVignette}
      />
    </Layout>
  )
}
