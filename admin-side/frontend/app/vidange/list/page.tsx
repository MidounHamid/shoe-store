"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Layout } from "@/components/layouts/layout"
import VidangeTable from "@/components/vidange/VidangeTable"

export type Vidange = {
  id: number
  vehicule_id: number
  date: string
  kilometrage_actuel: number
  kilometrage_prochain: number
  prix: number
  fichier?: string
  description?: string
  created_at?: string
  vehicule_name?: string
  vehicule_matricule?: string
}

function useVidanges() {
  const [data, setData] = useState<Vidange[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  const fetchVidanges = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vidanges`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const result = await response.json()
      const vidanges = result.data ?? result
      setData(vidanges)
    } catch (err) {
      console.error("Failed to fetch vidanges", err)
    } finally {
      setLoading(false)
    }
  }, [token])

  const removeVidange = useCallback((vidangeId: number) => {
    setData((prev) => prev.filter((vidange) => vidange.id !== vidangeId))
  }, [])

  useEffect(() => {
    fetchVidanges()
  }, [fetchVidanges])

  return { data, loading, removeVidange }
}

export default function VidangeListPage() {
  const { data, loading, removeVidange } = useVidanges()

  return (
    <Layout>
      <VidangeTable
        data={data}
        loading={loading}
        title="Liste des Vidanges"
        showAddButton={true}
        onVidangeRemove={removeVidange}
      />
    </Layout>
  )
}
