// app/(dashboard)/retour-contrat/add/page.tsx
"use client";

import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import RetourContratForm from "@/components/retour-contrat/RetourContratForm";

export default function AddRetourContratPage() {
  const handleSuccess = () => {
    toast({
      title: "Succès",
      description: "Retour de contrat créé avec succès !",
    });
  };

  return (
    <Layout>
      <div className="max-w-8xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Ajouter un retour de contrat</h1>
        </div>

        <RetourContratForm onSuccess={handleSuccess} isEditMode={false} />
      </div>
    </Layout>
  );
}