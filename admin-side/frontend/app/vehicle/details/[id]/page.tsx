"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import VehicleDetails from "@/components/vehicule/VehicleDetails";
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";
import { getAuthToken } from "@/lib/auth";

type VehicleDetailsData = {
  id: number;
  name: string;
  matricule: string;
  nombre_cylindre: number;
  nbr_place: number;
  reference: string;
  serie: string;
  fournisseur: string;
  numero_facture: string;
  prix_achat: number;
  prix:number;
  duree_vie: number;
  kilometrage_actuel: number;
  kilometrage_location: number;
  type_assurance: string;
  marque_name: string;
  categorie_vehicule: string;
  type_carburant: string;
  gear: "automatic" | "manual";
  status: string;
  couleur: string;
  description?: string;
  image?: string;
  images?: string | string[];

  reservations?: {
    id: number;
    date_debut: string;
    date_fin: string;
    client_id: number | string;
    nbr_jours: number;
    statut: string;
  }[];

  contracts?: {
    id: number;
    date_depart: string;
    date_retour: string;
    client_one_id: number | string;
    nbr_jours: number;
    etat_contrat: string;
  }[];
};


export default function VehicleDetailsPage() {
  const { id } = useParams();
  const [vehicleData, setVehicleData] = useState<VehicleDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicle() {
      setLoading(true);
      try {
        // const token = localStorage.getItem("auth_token");
        const token = getAuthToken();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/vehicules/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch vehicle data");
        }

        const result = await response.json();
        const data = result.data || result;
        setVehicleData(data);
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        toast({
          title: "Error",
          description: "Failed to load vehicle data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchVehicle();
    }
  }, [id]);

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loading />
        </div>
      ) : vehicleData ? (
        <div className="max-w-8xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Vehicle Details{vehicleData.name ? `: ${vehicleData.name}` : ""}
            </h1>
            <p className="text-gray-600">
              Below are the details for this vehicle.
            </p>
          </div>
          {/* Remove id prop here */}
          <VehicleDetails initialData={vehicleData} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Vehicle not found.</p>
        </div>
      )}
    </Layout>
  );
}
