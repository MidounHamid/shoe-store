"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"

import { Layout } from "@/components/layouts/layout"
import ClientTable from "@/components/client/ClientTable"
import { Client } from "../list/page"

function useClients({ blocked = false }: { blocked?: boolean } = {}) {
  const [data, setData] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  const fetchClients = useCallback(async () => {
    if (!token) return

    setLoading(true)
    try {
      const url = blocked
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/clients?blocked=true`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/clients`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const result = await response.json()
      const clients = result.data ?? result

      // Filter based on blocked status
      const filteredClients = blocked
        ? clients.filter((client: Client) => client.bloquer)
        : clients.filter((client: Client) => !client.bloquer)

      setData(filteredClients)
    } catch (err) {
      console.error("Failed to fetch clients", err)
    } finally {
      setLoading(false)
    }
  }, [token, blocked])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const updateClient = useCallback((updatedClient: Client) => {
    setData((prev) => prev.map((client) => (client.id === updatedClient.id ? updatedClient : client)))
  }, [])

  const removeClient = useCallback((clientId: number) => {
    setData((prev) => prev.filter((client) => client.id !== clientId))
  }, [])

  const addClient = useCallback((newClient: Client) => {
    setData((prev) => [newClient, ...prev])
  }, [])

  return {
    data,
    loading,
    refetch: fetchClients,
    updateClient,
    removeClient,
    addClient,
  }
}

export default function BlockedClientsPage() {
  const { data, loading, removeClient } = useClients({ blocked: true })

  return (
    <Layout>
      <ClientTable
        data={data}
        loading={loading}
        title="Clients Bloqués"
        //showAddButton={false}
        isBlockedList={true}
        //onClientUpdate={updateClient}
        onClientRemove={removeClient}
      />
    </Layout>
  )
}
