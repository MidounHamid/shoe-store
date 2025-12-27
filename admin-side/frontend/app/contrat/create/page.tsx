// app/reservation/add/page.tsx
"use client";

import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
// import  ReservationForm  from "@/components/reservation/ReservationForm";
import  ContratForm  from "@/components/contrat/ContratForm";


export default function AddContratPage() {
  const handleSuccess = () => {
    toast({
      title: "Succès",
      description: "Réservation créée avec succès !",
    });
  };

  return (
    <Layout>
      <div className="max-w-8xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Ajouter une nouvelle contrat</h1>
        </div>

        <ContratForm onSuccess={handleSuccess} isEditMode={false} />
      </div>
    </Layout>
  );
}
