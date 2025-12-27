// app/vehicle/edit/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import VehicleForm, { VehicleData } from "@/components/vehicule/VehicleForm";
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";


export default function EditVehiclePage() {
  const { id } = useParams();
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();


  useEffect(() => {
    async function fetchVehicle() {
      setLoading(true);
      try {
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

  const handleUpdateSuccess = () => {
    toast({
      title: "Success",
      description: "Vehicle updated successfully!",
    });
      router.push("/vehicle/list_vehicule"); // change this path if your list route is different

  };

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
              Modifier le véhicule{vehicleData.name ? `: ${vehicleData.name}` : ""}
            </h1>
            <p className="text-gray-600">Mettez à jour les détails du véhicule ci-dessous</p>
          </div>
          <VehicleForm
            initialData={vehicleData}
            onSuccess={handleUpdateSuccess}
            isEditMode={true}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Véhicule non trouvé.</p>
        </div>
      )}
    </Layout>
  );
}
