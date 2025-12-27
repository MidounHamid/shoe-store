"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReservationDetails from "@/components/reservation/ReservationDetails";
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";

type ReservationStatus = "en cours" | "terminee" | "annulee";

interface Reservation {
  id: number;
  vehicule_id: number;
  client_id: number;
  client_name: string;
  marque: string;
  name: string;       // changed from modele to name
  serie: string;
  date_reservation: string;
  date_debut: string;
  date_fin: string;
  heure_debut: string;
  heure_fin: string;
  lieu_depart: string;
  lieu_arrivee: string;
  nbr_jours: number;
  tva: "0" | "13" | "20";
  prix_jour: number;
  avance: number;
  total_ht: number;
  total_ttc: number;
  statut: ReservationStatus;
  created_at?: string;
  updated_at?: string;
}

export default function ReservationDetailsPage() {
  const { id } = useParams();
  const [reservationData, setReservationData] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservation() {
      setLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch reservation data");
        }

        const result = await response.json();
        const data = result.data || result;
        setReservationData(data);
      } catch (error) {
        console.error("Error fetching reservation:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de la réservation.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchReservation();
    }
  }, [id]);

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loading />
        </div>
      ) : reservationData ? (
        <div className="max-w-8xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Détails de la réservation{reservationData.id ? ` #${reservationData.id}` : ""}
            </h1>
            <p className="text-gray-600">Voici les détails de cette réservation.</p>
          </div>
          <ReservationDetails initialData={reservationData} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Réservation introuvable.</p>
        </div>
      )}
    </Layout>
  );
}
