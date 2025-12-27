// app/(dashboard)/retour-contrat/edit/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RetourContratForm, { RetourContratFormProps } from "@/components/retour-contrat/RetourContratForm";
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";

export default function EditRetourContratPage() {
  const { id } = useParams();
  const [retourData, setRetourData] = useState<RetourContratFormProps["initialData"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchRetourContrat() {
      setLoading(true);
      setError(null);
      
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/retour-contrats/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch retour contrat data");
        }

        const data = result.data || result;
        
        // Transform date strings to Date objects
        const transformedData = {
          ...data,
          date_retour: data.date_retour ? new Date(data.date_retour) : new Date(),
        };
        
        setRetourData(transformedData);
      } catch (err) {
        console.error("Error fetching retour contrat:", err);
        setError(err instanceof Error ? err.message : "Failed to load retour contrat data");
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load retour contrat data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchRetourContrat();
    }
  }, [id]);

  const handleUpdateSuccess = () => {
    toast({
      title: "Success",
      description: "Retour contrat updated successfully!",
    });
    router.push("/retour_contrat/list_retour_contrat");
  };

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loading />
        </div>
      ) : retourData ? (
        <div className="max-w-8xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Edit Retour Contrat {retourData.contrat_id ? `#${retourData.contrat_id}` : ""}
            </h1>
            <p className="text-gray-600">Update the retour contrat details below</p>
          </div>
          <RetourContratForm
            initialData={retourData}
            onSuccess={handleUpdateSuccess}
            isEditMode={true}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <p className="text-red-500">Retour contrat not found.</p>
          )}
        </div>
      )}
    </Layout>
  );
}