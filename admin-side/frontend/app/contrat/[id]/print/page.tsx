"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ContractTemplate from "@/components/contrat/ContratTemplate";
import ConditionsGenerales from "@/components/contrat/ConditionsGenerales";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/auth";

interface Client {
  nom: string;
  nationalite: string;
  adresse: string;
  cin: string;
  permis: string;
  passeport: string;
  date_naissance?: string;
  lieu_de_naissance?: string;
  telephone?: string;
  date_entree_maroc?: string;
}

interface Vehicule {
  marque: string;
  immatriculation: string;
  km_depart: number;
  km_retour: number;
  lieu_livraison?: string;
  lieu_retour?: string;
}

interface PaymentInfo {
  mode: string;
  avance: number;
  reste: number;
  total: number;
  franchise: string;
  caution: boolean;
}

interface Equipment {
  gps: boolean;
  siege_enfant: boolean;
  kit_secours: boolean;
  brise_glace: boolean;
  cinq_doc: boolean;
  assistance: boolean;
  lavage: boolean;
  autres?: string;
}

interface Inspection {
  rayures: boolean;
  bosses: boolean;
  eclates: boolean;
  cassures: boolean;
}

interface ContractData {
  number: string;
  client: Client;
  client2?: Client;
  vehicule: Vehicule;
  date_debut: string;
  date_fin: string;
  heure_debut: string;
  heure_fin: string;
  duree: string;
  payment: PaymentInfo;
  equipment: Equipment;
  inspection: Inspection;
  note?: string;
  prolongations?: {
    date_heure: string;
    jours: number;
  }[];
  agence: {
    ville: string;
    nom_agence: string;
    telephone: string;
    Adresse: string;
    logo: string;
  };
}

export default function ContractPrintPage() {
  const { id } = useParams();
  const [data, setData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);
  const originalTitleRef = useRef<string>("");

  const downloadPDFWithPuppeteer = async () => {
    const token = getAuthToken(); // still works on client
    if (!token) {
      toast({
        title: "Erreur",
        description: "Token manquant.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(`/api/contracts/${id}/pdf`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Échec de génération PDF");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      // window.open(url, "_blank");
      window.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } catch (err) {
      console.error("Erreur Puppeteer PDF:", err);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF.",
        variant: "destructive",
      });
    }
  };


  useEffect(() => {
    originalTitleRef.current = document.title;
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: "@media print { body { -webkit-print-color-adjust: exact; } }",
    onBeforePrint: () => {
      if (data) {
        const currentDate = new Date().toISOString().split("T")[0];
        document.title = `${currentDate}_Contrat_${data.number}`;
      }
      return Promise.resolve();
    },
    onAfterPrint: () => {
      document.title = originalTitleRef.current;
    },
    onPrintError: (errorLocation, error) => {
      console.error("Print error:", errorLocation, error);
      toast({
        title: "Erreur d'impression",
        description: "Une erreur s'est produite lors de l'impression.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    async function fetchContract() {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Token JWT manquant");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/contrats/${id}/print`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!res.ok) throw new Error(`Erreur API: ${res.status}`);

        const json = await res.json();
        if (!json.data) throw new Error("Contrat introuvable");

        const contrat = json.data;
        // Get agence from the root level, not from contrat
        // const agence = json.agence;

        const contractInfo: ContractData = {
          number: contrat.number_contrat,
          client: {
            nom: contrat.client_one_name,
            nationalite: contrat.client_one_nationalite,
            adresse: contrat.client_one_adresse,
            cin: contrat.client_one_cin,
            permis: contrat.client_one_permis,
            passeport: contrat.client_one_passport,
            date_naissance: contrat.client_one_dob,
            lieu_de_naissance: contrat.client_one_birthplace,
            telephone: contrat.client_one_telephone || "",
            date_entree_maroc: contrat.client_one_date_entree_maroc,
          },
          client2: contrat.client_two_name
            ? {
              nom: contrat.client_two_name,
              nationalite: contrat.client_two_nationalite || "",
              adresse: contrat.client_two_adresse || "",
              cin: contrat.client_two_cin || "",
              permis: contrat.client_two_permis || "",
              passeport: contrat.client_two_passport || "",
              date_naissance: contrat.client_two_dob || "",
              lieu_de_naissance: contrat.client_two_birthplace || "",
              telephone: contrat.client_two_telephone || "",
              date_entree_maroc: contrat.client_two_date_entree_maroc || "",
            }
            : undefined,
          vehicule: {
            marque: contrat.marque_name || "N/A",
            immatriculation: contrat.vehicule_serie || "N/A",
            km_depart: Number(contrat.km_depart) || 0,
            km_retour: Number(contrat.km_retour) || 0,
            lieu_livraison: contrat.lieu_livraison || "",
            lieu_retour: contrat.lieu_retour || "",
          },
          date_debut: contrat.date_contrat || "N/A",
          date_fin: contrat.date_retour || "N/A",
          heure_debut: contrat.heure_contrat || "",
          heure_fin: contrat.heure_retour || "",
          duree: `${contrat.nbr_jours ?? "N/A"} jours`,
          payment: {
            mode: contrat.mode_reglement || "",
            avance: contrat.avance || 0,
            reste: contrat.reste || 0,
            total: contrat.total_ttc || 0,
            franchise: contrat.caution_assurance || "",
            caution: !!contrat.caution_assurance,
          },
          equipment: {
            gps: contrat.gps || false,
            siege_enfant: contrat.siege_enfant || false,
            kit_secours: contrat.cric || false,
            brise_glace: contrat.brise_glace || false,
            cinq_doc: contrat.documents || false,
            assistance: contrat.assistance || false,
            lavage: contrat.lavage || false,
            autres: contrat.autres_equipment || "",
          },
          inspection: {
            rayures: contrat.rayures || false,
            bosses: contrat.bosses || false,
            eclates: contrat.eclates || false,
            cassures: contrat.cassures || false,
          },
          note: contrat.note || "",
          prolongations: contrat.prolongation
            ? [
              {
                date_heure: contrat.prolongation,
                jours: 0,
              },
            ]
            : undefined,
          // Use agence from the root level with null check
          agence: {
            ville: json.agence.ville,
            nom_agence: json.agence.nom_agence,
            telephone: json.agence.telephone,
            Adresse: json.agence.Adresse,
            logo: json.agence.logo
          }
          ,
        };

        setData(contractInfo);
      } catch (error) {
        console.error("Erreur:", error);
        toast({
          title: "Erreur",
          description: "Échec de chargement du contrat pour impression.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchContract();
  }, [id]);

  const onPrintClick = () => {
    if (!data) {
      toast({
        title: "Erreur",
        description: "Aucun contrat à imprimer.",
        variant: "destructive",
      });
      return;
    }

    if (!printRef.current) {
      toast({
        title: "Erreur",
        description: "Élément d'impression non trouvé.",
        variant: "destructive",
      });
      return;
    }

    handlePrint();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );

  if (!data)
    return (
      <div className="text-center text-red-500">
        Contrat introuvable pour impression.
      </div>
    );

  return (
    <div className="p-4">
      <div ref={printRef}>
        <ContractTemplate data={data} />
        <div className="mt-10 print:break-before-page">
          <ConditionsGenerales />
        </div>
      </div>

      <div className="text-center mt-6 print:hidden">
        <Button variant="outline" onClick={onPrintClick}>
          Imprimer le contrat
        </Button>
        <Button onClick={downloadPDFWithPuppeteer} variant="default">
          Télécharger PDF (Puppeteer)
        </Button>
      </div>
    </div>
  );
}
