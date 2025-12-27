"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layouts/layout";
import MailDetails from "@/components/mail/MailDetails";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";
import { getAuthToken } from "@/lib/auth";

interface Mail {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

export default function MailDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [mailData, setMailData] = useState<Mail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMail() {
      try {
        setLoading(true);
        const token = getAuthToken();
        if (!token) throw new Error("Token d'authentification manquant");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/mails/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Échec de la récupération des données du mail");
        }

        const result = await response.json();
        const data = result.data || result;

        setMailData(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de l'email.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchMail();
    }
  }, [id]);

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loading />
        </div>
      ) : mailData ? (
        <div className="max-w-3xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Détails de l&apos;Email #{mailData.id}
            </h1>
            <p className="text-gray-600">Informations sur cet enregistrement email.</p>
          </div>
          <MailDetails initialData={mailData} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Email introuvable.</p>
        </div>
      )}
    </Layout>
  );
}
