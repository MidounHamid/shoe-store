// app/vehicle/add/page.tsx
"use client";

import  VehicleForm  from "@/components/vehicule/VehicleForm";
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";

export default function AddVehiclePage() {

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Vehicle created successfully!",
    });
  };

  return (
    <Layout>
      <div className="max-w-8xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Ajouter un nouveau véhicule</h1>
        </div>

        <VehicleForm onSuccess={handleSuccess} />
      </div>
    </Layout>
  );
}
