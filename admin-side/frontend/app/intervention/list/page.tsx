"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Layout } from "@/components/layouts/layout"
import InterventionTable from "@/components/intervention/InterventionTable"

export type Intervention = {
  id: number
  vehicule_id: number
  date: string
  prix: number
  fichier?: string
  description?: string
  created_at?: string
  vehicule_name?: string
  vehicule_matricule?: string
}

function useInterventions() {
  const [data, setData] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  const fetchInterventions = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interventions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      const result = await response.json()
      const interventions = result.data ?? result
      setData(interventions)
    } catch (err) {
      console.error("Failed to fetch interventions", err)
    } finally {
      setLoading(false)
    }
  }, [token])

  const removeIntervention = useCallback((interventionId: number) => {
    setData((prev) => prev.filter((intervention) => intervention.id !== interventionId))
  }, [])

  useEffect(() => {
    fetchInterventions()
  }, [fetchInterventions])

  return { data, loading, removeIntervention }
}

export default function InterventionListPage() {
  const { data, loading, removeIntervention } = useInterventions()

  return (
    <Layout>
      <InterventionTable
        data={data}
        loading={loading}
        title="Liste des Interventions"
        // showAddButton={true}
        onInterventionRemove={removeIntervention}
      />
    </Layout>
  )
}
