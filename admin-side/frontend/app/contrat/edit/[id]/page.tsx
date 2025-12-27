"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ContratForm, { ContratFormProps } from "@/components/contrat/ContratForm";
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";
import { getAuthToken } from "@/lib/auth";

export default function EditContratPage() {
  const { id } = useParams();
  const [contratData, setContratData] = useState<ContratFormProps["initialData"] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchContrat() {
      setLoading(true);
      try {
        const token = getAuthToken();
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
          throw new Error("Failed to fetch contrat data");
        }

        const result = await response.json();
        const data = result.data || result;
        setContratData(data);
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
      fetchContrat();
    }
  }, [id]);

  const handleUpdateSuccess = () => {
    toast({
      title: "Succès",
      description: "Contrat mis à jour avec succès !",
    });
    router.push("/contrat/list_contrat"); // change this to your actual list route
  };

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
              Modifier le contrat {contratData.number_contrat && `: ${contratData.number_contrat}`}
            </h1>
            <p className="text-gray-600">Modifiez les informations ci-dessous</p>
          </div>
          <ContratForm
            initialData={contratData}
            onSuccess={handleUpdateSuccess}
            isEditMode={true}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Contrat introuvable.</p>
        </div>
      )}
    </Layout>
  );
}
