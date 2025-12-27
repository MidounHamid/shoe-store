"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ContratDetails from "@/components/contrat/ContratDetails";
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";

type ContratStatus = "en cours" | "termine";
type FuelLevel = '0' | '1/4' | '1/2' | '3/4' | '4/4';
type PaymentMethod = "cheque" | "espece" | "tpe" | "versement";

interface Contrat {
  id: number;
  vehicule_id: number;
  vehicule_marque: string;
  vehicule_modele: string;
  vehicule_serie: string;
  client_one_id: number;
  client_one_name: string;
  client_two_id?: number | null;
  client_two_name?: string | null;
  number_contrat: string;
  numero_document: string;
  etat_contrat: ContratStatus | null;
  date_contrat: string | null;
  heure_contrat: string | null;
  km_depart: string | null;
  heure_depart: string | null;
  lieu_depart: string | null;
  date_retour: string | null;
  heure_retour: string | null;
  lieu_livraison: string | null;
  nbr_jours: number | null;
  prix: number | null;
  total_ht: number | null;
  total_ttc: number | null;
  avance: number;
  mode_reglement: PaymentMethod | null;
  caution_assurance: string | null;
  position_reservoir: FuelLevel;
  prolongation: string | null;
  documents: boolean;
  cric: boolean;
  siege_enfant: boolean;
  roue_secours: boolean;
  poste_radio: boolean;
  plaque_panne: boolean;
  gillet: boolean;
  extincteur: boolean;
  autre_fichier: string | null;
  description: string | null;
  date_depart: string;
  autre_fichier_url: string;
}

export default function ContratDetailsPage() {
  const { id } = useParams();
  const [contratData, setContratData] = useState<Contrat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContrat = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/contrats/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Échec de la récupération des données du contrat");
        }

        const result = await response.json();
        const data = result.data || result;

        const formattedData: Contrat = {
          ...data,
          client_one_name: data.client_one?.name || "Client principal inconnu",
          client_two_name: data.client_two?.name || "",
          vehicule_marque: data.vehicule?.marque || "Inconnue",
          vehicule_modele: data.vehicule?.modele || "Inconnu",
          vehicule_serie: data.vehicule?.serie || "N/A",
        };

        setContratData(formattedData);
      } catch (error) {
        console.error("Erreur lors de la récupération du contrat:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du contrat.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchContrat();
  }, [id]);

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loading />
        </div>
      ) : contratData ? (
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Détails du contrat
              {contratData.number_contrat ? ` #${contratData.number_contrat}` : ""}
            </h1>
            <p className="text-gray-600">
              Informations complètes sur ce contrat de location.
            </p>
          </div>
          <ContratDetails initialData={contratData} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Contrat introuvable.</p>
        </div>
      )}
    </Layout>
  );
}
