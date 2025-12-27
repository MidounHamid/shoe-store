"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReservationForm, { ReservationFormProps } from "@/components/reservation/ReservationForm";
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";
import { getAuthToken } from "@/lib/auth";

// Correct TypeScript type


export default function EditReservationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [reservationData, setReservationData] = useState<ReservationFormProps["initialData"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservation() {
      setLoading(true);
      try {
        const token = getAuthToken();
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
          description: "Impossible de charger la réservation.",
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchReservation();
  }, [id]);

  const handleUpdateSuccess = () => {
    toast({
      title: "Succès",
      description: "Réservation mise à jour avec succès !",
    });
    router.push("/reservation/list_reservation");
  };

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
              Modifier Réservation #{reservationData.id}
            </h1>
            <p className="text-gray-600">
              Mettez à jour les informations de la réservation ci-dessous
            </p>
          </div>
          <ReservationForm
            initialData={reservationData}
            onSuccess={handleUpdateSuccess}
            isEditMode={true}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Réservation introuvable.</p>
        </div>
      )}
    </Layout>
  );
}
