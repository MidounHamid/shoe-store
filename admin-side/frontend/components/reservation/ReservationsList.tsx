"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Car, User, MapPin, Clock, DollarSign, Phone } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Loading } from "@/components/ui/loading"
import { getAuthToken } from "@/lib/auth"

interface Reservation {
  id: number
  client_name: string
  client_telephone: string
  client_email: string
  vehicule_marque: string
  vehicule_name: string
  vehicule_serie: string
  date_reservation: string
  date_debut: string
  date_fin: string
  heure_debut: string
  heure_fin: string
  lieu_depart: string
  lieu_arrivee: string
  nbr_jours: number
  prix_jour: number
  total_ttc: number
  statut: string
}

interface ReservationsListProps {
  period: { start: string; end: string }
  statusFilter?: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "en cours":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "terminee":
      return "bg-green-100 text-green-800 border-green-200"
    case "annulee":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "en cours":
      return "En cours"
    case "terminee":
      return "Terminée"
    case "annulee":
      return "Annulée"
    default:
      return status
  }
}

export default function ReservationsList({ period, statusFilter = "tous" }: ReservationsListProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReservations = async () => {
      if (!period.start || !period.end) return

      setLoading(true)
      setError(null)

      try {
        const token = getAuthToken()
        const url = statusFilter === "tous" 
          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reservations/by-date-range?start=${period.start}&end=${period.end}`
          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reservations/by-date-range?start=${period.start}&end=${period.end}&status=${statusFilter}`
        const response = await fetch(url,
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
        setReservations(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
        console.error("Erreur lors de la récupération des réservations:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [period, statusFilter])

  // Plus besoin de filtrage côté client car le serveur fait le filtrage
  const filteredReservations = reservations

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Réservations de la période
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
            <Calendar className="h-5 w-5" />
            Réservations de la période
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
          <Calendar className="h-5 w-5" />
          Réservations de la période
        </CardTitle>
        <CardDescription>
          {filteredReservations.length} réservation{filteredReservations.length > 1 ? "s" : ""} 
          {statusFilter !== "tous" && ` (${getStatusLabel(statusFilter)})`} du{" "}
          {format(new Date(period.start), "d MMMM yyyy", { locale: fr })} au{" "}
          {format(new Date(period.end), "d MMMM yyyy", { locale: fr })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredReservations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune réservation {statusFilter !== "tous" ? getStatusLabel(statusFilter).toLowerCase() : ""} trouvée pour cette période</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredReservations.map((reservation) => (
              <div key={reservation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{reservation.client_name}</span>
                    <Badge className={getStatusColor(reservation.statut)}>{getStatusLabel(reservation.statut)}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "MAD",
                      }).format(reservation.total_ttc)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reservation.nbr_jours} jour{reservation.nbr_jours > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-500" />
                      <span>
                        {reservation.vehicule_marque} {reservation.vehicule_name}
                        {reservation.vehicule_serie && ` - ${reservation.vehicule_serie}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        Du {format(new Date(reservation.date_debut), "d MMM yyyy", { locale: fr })} au{" "}
                        {format(new Date(reservation.date_fin), "d MMM yyyy", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>
                        {reservation.heure_debut} - {reservation.heure_fin}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="truncate">
                        {reservation.lieu_depart} → {reservation.lieu_arrivee}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "MAD",
                        }).format(reservation.prix_jour)}{" "}
                        / jour
                      </span>
                    </div>
                    {reservation.client_telephone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{reservation.client_telephone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}