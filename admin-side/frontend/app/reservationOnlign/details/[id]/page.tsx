//app/reservationOnlign/details/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";
import ReservationOnlignDetails from "@/components/reservationOnlign/reservationDetails";
import { getAuthToken } from "@/lib/auth";



export interface ReservationByWebsite {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  special_requests?: string;
  car_id: number;
  vehicule_name: string;
  marque_nom: string;
  matricule: string;
  prix: string;
  created_at: string;
  status: string;
}

export default function ReservationOnlignDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState<ReservationByWebsite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservation() {
      try {
    const token = getAuthToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-by-websites/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Erreur de chargement");

        const result = await response.json();
        const res = result.data || result;

        setData(res);
      } catch (err) {
        console.error("Erreur de récupération:", err);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de la réservation.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchReservation();
  }, [id]);

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loading />
        </div>
      ) : data ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">
            Détails de la réservation #{data.id}
          </h1>
          <ReservationOnlignDetails initialData={data} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Réservation introuvable.</p>
        </div>
      )}
    </Layout>
  );
}
