import ContractTemplate from "@/components/contrat/ContratTemplate";
import ConditionsGenerales from "@/components/contrat/ConditionsGenerales";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

// Use force-dynamic if you want fresh data every request
export const dynamic = "force-dynamic";

async function getContractData(id: string, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/contrats/${id}/print`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const json = await res.json();
  if (!json?.data) return null;
  // console.log(json.data)

  const contrat = json.data;

  const data = {
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
    date_debut: contrat.date_depart || "N/A",
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
      ? [{ date_heure: contrat.prolongation, jours: 0 }]
      : undefined,
    agence: {
      ville: json.agence.ville,
      nom_agence: json.agence.nom_agence,
      telephone: json.agence.telephone,
      Adresse: json.agence.Adresse,
      logo: json.agence.logo,
    },
  };

  return data;
}

export default async function PrintableContractPage({ params }: { params: Promise<{ id: string }> }) {
  const headersList = await headers();
  const token = headersList.get("x-auth-proxy")?.replace("Bearer ", "");
  // console.log("here1")
  if (!token) return notFound();
  const { id } = await params;
  // console.log("here2")

  const data = await getContractData(id, token);

  // console.log("here3")
  if (!data) return notFound();
  // console.log("here4")
  // console.log(data)

  return (
    <div className="p-4">
      <>
        <ContractTemplate data={data} />
        <div className="page-break" />
        {/* <div>HAHAHA</div> */}
        <ConditionsGenerales />
      </>
      <style>{` 
                @page {
          size: A4;
          margin: 10mm 5mm;
        }

        html, body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .page-break {
          break-before: page;
        }
  `}</style>
    </div>
  );
}
