"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {  FileText, Calculator } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Loading } from "@/components/ui/loading"
import { getAuthToken } from "@/lib/auth"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Contrat {
  id: number
  number_contrat: string

  client_name: string
  vehicule_name: string
  vehicule_serie?: string
  date_contrat: string
  nbr_jours: number
  prix: number
  total_ttc: number
  etat_contrat: string
  lieu_depart: string
  lieu_livraison: string
}

interface ContratsListProps {
  period: { start: string; end: string }
}

export default function ContratsList({ period }: ContratsListProps) {
  const [contrats, setContrats] = useState<Contrat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContrats = async () => {
      if (!period.start || !period.end) return

      setLoading(true)
      setError(null)

      try {
        const token = getAuthToken()
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/contrats/by-date-range?start=${period.start}&end=${period.end}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        )

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const result = await response.json()
        setContrats(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
        console.error("Erreur lors de la récupération des contrats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchContrats()
  }, [period])

  // Calcul du total général
  const totalGeneral = contrats.reduce((sum, contrat) => sum + (contrat.nbr_jours * contrat.prix), 0)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contrats de la période
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loading />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contrats de la période
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contrats de la période
        </CardTitle>
        <CardDescription>
          {contrats.length} contrat{contrats.length > 1 ? "s" : ""} du{" "}
          {format(new Date(period.start), "d MMMM yyyy", { locale: fr })} au{" "}
          {format(new Date(period.end), "d MMMM yyyy", { locale: fr })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {contrats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun contrat trouvé pour cette période</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Total général en haut */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">Total Général</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "MAD",
                  }).format(totalGeneral)}
                </div>
              </div>
            </div>

            {/* Tableau des contrats */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Contrat</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Véhicule</TableHead>
                    <TableHead className="text-center">Nombre de jours</TableHead>
                    <TableHead className="text-right">Prix (par jour)</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contrats.map((contrat) => {
                    const total = contrat.nbr_jours * contrat.prix
                    return (
                      <TableRow key={contrat.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {contrat.number_contrat}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            
                            {contrat.client_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                           
                            <span>
                              {contrat.vehicule_name}
                              {contrat.vehicule_serie && ` - ${contrat.vehicule_serie}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            
                            {contrat.nbr_jours}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            
                            {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "MAD",
                            }).format(contrat.prix)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "MAD",
                          }).format(total)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Résumé en bas */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{contrats.length}</div>
                  <div className="text-muted-foreground">Contrat{contrats.length > 1 ? "s" : ""}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">
                    {contrats.reduce((sum, contrat) => sum + contrat.nbr_jours, 0)}
                  </div>
                  <div className="text-muted-foreground">Jours total</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-primary">
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "MAD",
                    }).format(totalGeneral)}
                  </div>
                  <div className="text-muted-foreground">Chiffre d&apos;affaires</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}