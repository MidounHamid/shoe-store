"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
// import { useRouter } from "next/navigation";
// import { getAuthToken } from "@/lib/auth";

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

interface ReservationDetailsProps {
  initialData: Reservation;
}

const ReservationDetails: React.FC<ReservationDetailsProps> = ({ initialData }) => {
  // const router = useRouter();
  // const [loading, setLoading] = React.useState(false);

  // const handleConvert = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${initialData.id}/convert`, {
  //       method: "POST",
  //       headers: {
  //           Authorization: `Bearer ${getAuthToken()}`,
  //           "Content-Type": "application/json",
  //           Accept: "application/json",
  //         }
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       throw new Error(data.message || "Erreur inconnue.");
  //     }

  //     router.push(`/contrat/details/${data.contract_id}`);
  //   } catch (error) {
  //     alert(`Erreur lors de la conversion: ${error instanceof Error && error.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="ID Réservation" value={initialData.id} />
        <DetailItem label="Client" value={`#${initialData.client_id} - ${initialData.client_name}`} />
        <DetailItem label="Marque du véhicule" value={initialData.marque} />
        <DetailItem label="Nom du véhicule" value={initialData.name} />  {/* changed from Modèle */}
        <DetailItem label="Série du véhicule" value={initialData.serie} />
        <DetailItem label="Date de Réservation" value={format(initialData.date_reservation, "dd/MM/yyyy")} />
        <DetailItem label="Début" value={`${format(initialData.date_debut, "dd/MM/yyyy")} à ${initialData.heure_debut}`} />
        <DetailItem label="Fin" value={`${format(initialData.date_fin, "dd/MM/yyyy")} à ${initialData.heure_fin}`} />
        <DetailItem label="Lieu de Départ" value={initialData.lieu_depart} />
        <DetailItem label="Lieu d’Arrivée" value={initialData.lieu_arrivee} />
        <DetailItem label="Nombre de jours" value={initialData.nbr_jours} />
        <DetailItem label="Prix par jour" value={`${initialData.prix_jour} MAD`} />
        <DetailItem label="TVA" value={`${initialData.tva}%`} />
        <DetailItem label="Avance" value={`${initialData.avance} MAD`} />
        <DetailItem label="Total HT" value={`${initialData.total_ht} MAD`} />
        <DetailItem label="Total TTC" value={`${initialData.total_ttc} MAD`} />
        <DetailItem label="Statut" value={initialData.statut} />
      </div>
            <div className="pt-6 flex flex-wrap gap-4">
        <Button variant="default" onClick={() => window.history.back()}>
          Retour
        </Button>

        {/* <Button variant="secondary" disabled={loading} onClick={handleConvert}>
          {loading ? "Conversion..." : "Convertir en Contrat"}
        </Button> */}
      </div>
    </div>
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-base font-medium text-gray-800 dark:text-gray-100">{value}</p>

  </div>
);

export default ReservationDetails;
