"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Layout } from "@/components/layouts/layout"
import AssuranceTable from "@/components/assurance/AssuranceTable"

export type Assurance = {
  id: number
  vehicule_id: number
  numero_assurance: string
  numero_de_police?: string
  date: string
  date_prochaine?: string
  date_reglement?: string
  periode?: string
  prix: number
  fichiers?: string
  description?: string
  created_at?: string
  vehicule_name?: string
  vehicule_matricule?: string
}

function useAssurances() {
  const [data, setData] = useState<Assurance[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  const fetchAssurances = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assurances`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      const result = await response.json()
      const assurances = result.data ?? result
      setData(assurances)
    } catch (err) {
      console.error("Failed to fetch assurances", err)
    } finally {
      setLoading(false)
    }
  }, [token])

  const removeAssurance = useCallback((assuranceId: number) => {
    setData((prev) => prev.filter((assurance) => assurance.id !== assuranceId))
  }, [])

  useEffect(() => {
    fetchAssurances()
  }, [fetchAssurances])

  return { data, loading, removeAssurance }
}

export default function AssuranceListPage() {
  const { data, loading, removeAssurance } = useAssurances()

  return (
    <Layout>
      <AssuranceTable
        data={data}
        loading={loading}
        title="Liste des Assurances"
        // showAddButton={true}
        onAssuranceRemove={removeAssurance}
      />
    </Layout>
  )
}
