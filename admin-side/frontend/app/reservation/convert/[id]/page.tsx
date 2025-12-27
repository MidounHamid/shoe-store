"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ContratForm, { ContratFormProps } from "@/components/contrat/ContratForm";
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";
import { getAuthToken } from "@/lib/auth";
import { Reservation } from "../../list_reservation/page";
// import { describe } from "node:test";

export default function ConvertToContratPage() {
    const { id } = useParams();
    const [contratData, setContratData] = useState<ContratFormProps["initialData"] | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
                    throw new Error("Failed to fetch contrat data");
                }

                const result = await response.json();

                const data: Reservation = result.data || result;
                console.log(data)
                setContratData({
                    client_one_id: data.client_id.toString(),
                    vehicule_id: data.vehicule_id.toString(),
                    date_contrat: new Date(data.date_reservation) as Date & string,
                    date_depart: new Date(data.date_debut) as Date & string,
                    date_retour: new Date(data.date_fin) as Date & string,
                    heure_depart: data.heure_debut,
                    heure_retour: data.heure_fin,
                    prix: data.prix_jour,
                    lieu_depart: data.lieu_depart,
                    lieu_livraison: data.lieu_arrivee,
                    total_ht: data.total_ht,
                    total_ttc: data.total_ttc,
                    tva: data.tva,
                    avance: data.avance,
                    nbr_jours: data.nbr_jours,
                    km_depart: data.kilometrage_actuel?.toString() || ""
                });

            } catch (error) {
                console.error("Error fetching contrat:", error);
                toast({
                    title: "Erreur",
                    description: "Échec du chargement du contrat",
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

    const handleUpdateSuccess = () => {
        toast({
            title: "Succès",
            description: "Contrat mis à jour avec succès !",
        });
        router.push("/contrat/list_contrat");  
    };
    useEffect(() => {
        console.log(contratData)
    }, [contratData])

    return (
        <Layout>
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <Loading />
                </div>
            ) : contratData ? (
                <div className="max-w-8xl mx-auto p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">
                            Convertir réservation au contrat {contratData.number_contrat && `: ${contratData.number_contrat}`}
                        </h1>
                        <p className="text-gray-600">Modifiez les informations ci-dessous si  besoin</p>
                    </div>
                    <ContratForm
                        initialData={contratData}
                        onSuccess={handleUpdateSuccess}
                        isEditMode={false}
                    />
                </div>
            ) : (
                <div className="flex items-center justify-center h-screen">
                    <p className="text-red-500">Reservation introuvable.</p>
                </div>
            )}
        </Layout>
    );
}
