"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";

type ContratStatus = "en cours" | "termine";
type FuelLevel = "0" | "1/4" | "1/2" | "3/4" | "4/4";
type PaymentMethod = "cheque" | "espece" | "tpe" | "versement";

interface Contrat {
  id: number;
  vehicule_id: number;
  vehicule_marque: string;
  vehicule_modele: string;
  vehicule_serie: string;
  client_one_id: number;
  client_one_name: string;
  client_two_id?: number | null;
  client_two_name?: string | null;
  number_contrat: string;
  numero_document: string;
  etat_contrat: ContratStatus | null;
  date_contrat: string | null;
  heure_contrat: string | null;
  km_depart: string | null;
  date_depart: string | null;
  heure_depart: string | null;
  lieu_depart: string | null;
  date_retour: string | null;
  heure_retour: string | null;
  lieu_livraison: string | null;
  nbr_jours: number | null;
  prix: number | null;
  total_ht: number | null;
  total_ttc: number | null;
  avance: number | null;
  mode_reglement: PaymentMethod | null;
  caution_assurance: string | null;
  position_reservoir: FuelLevel;
  prolongation: string | null;
  documents: boolean;
  cric: boolean;
  siege_enfant: boolean;
  roue_secours: boolean;
  poste_radio: boolean;
  plaque_panne: boolean;
  gillet: boolean;
  extincteur: boolean;
  autre_fichier: string | null;
  autre_fichier_url: string | null;
  description: string | null;
}

interface ContratDetailsProps {
  initialData: Contrat;
}

const ContratDetails: React.FC<ContratDetailsProps> = ({ initialData }) => {
  const isImageFile = (filename: string | null) => {
    if (!filename) return false;
    return /\.(jpe?g|png|gif|bmp|webp)$/i.test(filename);
  };

  const getFullUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="bg-background dark:border-2 shadow rounded-xl p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="ID Contrat" value={initialData.id} />
        <DetailItem label="Numéro de Contrat" value={initialData.number_contrat} />
        <DetailItem label="Numéro de Document" value={initialData.numero_document} />
        <DetailItem label="État" value={initialData.etat_contrat || "N/A"} />

        <DetailItem
          label="Date du contrat"
          value={
            initialData.date_contrat
              ? `${initialData.date_contrat} ${initialData.heure_contrat || ""}`
              : "N/A"
          }
        />
        <DetailItem
          label="Départ prévu"
          value={
            initialData.date_contrat || initialData.lieu_depart
              ? `${initialData.date_contrat || "?"} - ${initialData.lieu_depart || "?"} à ${
                  initialData.heure_depart || "?"
                }`
              : "N/A"
          }
        />
        <DetailItem
          label="Retour prévu"
          value={
            initialData.date_retour
              ? `${initialData.date_retour} à ${initialData.heure_retour || ""}`
              : "N/A"
          }
        />
        <DetailItem label="Lieu de livraison" value={initialData.lieu_livraison || "N/A"} />

        <DetailItem label="ID Véhicule" value={initialData.vehicule_id} />
        <DetailItem label="Marque" value={initialData.vehicule_marque} />
        <DetailItem label="Modèle" value={initialData.vehicule_modele} />
        <DetailItem label="Série" value={initialData.vehicule_serie} />

        <DetailItem
          label="Client Principal"
          value={`#${initialData.client_one_id} - ${initialData.client_one_name}`}
        />
        {initialData.client_two_id && (
          <DetailItem
            label="Client Secondaire"
            value={`#${initialData.client_two_id} - ${initialData.client_two_name}`}
          />
        )}

        <DetailItem label="Kilométrage de départ" value={initialData.km_depart || "N/A"} />
        <DetailItem label="Niveau carburant" value={initialData.position_reservoir} />
        <DetailItem label="Nombre de jours" value={initialData.nbr_jours || "N/A"} />
        <DetailItem label="Prix journalier" value={`${initialData.prix || 0} MAD`} />

        <DetailItem label="Avance" value={`${initialData.avance || 0} MAD`} />
        <DetailItem label="Total HT" value={`${initialData.total_ht || 0} MAD`} />
        <DetailItem label="Total TTC" value={`${initialData.total_ttc || 0} MAD`} />
        <DetailItem label="Mode de règlement" value={initialData.mode_reglement || "N/A"} />
        <DetailItem label="Caution assurance" value={initialData.caution_assurance || "N/A"} />

        <DetailItem label="Prolongation" value={initialData.prolongation || "Aucune"} />

        {/* Fichier joint */}
        <div className="col-span-full">
          <p className="text-sm text-gray-500 dark:text-gray-400">Fichier joint</p>
          {initialData.autre_fichier_url ? (
            <div
              className={`relative rounded-md items-center flex gap-4 min-w-fit mt-2 ${
                isImageFile(initialData.autre_fichier_url) ? "w-fit" : "w-full"
              }`}
            >
              {isImageFile(initialData.autre_fichier_url) ? (
                <div
                  className="cursor-pointer"
                  onClick={() => window.open(getFullUrl(initialData.autre_fichier_url)!, "_blank")}
                >
                  <img
                    src={getFullUrl(initialData.autre_fichier_url)!}
                    alt="Fichier"
                    className="h-32 object-cover rounded border"
                  />
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 bg-muted border w-full p-3 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => window.open(getFullUrl(initialData.autre_fichier_url)!, "_blank")}
                >
                  <FileIcon className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm truncate text-gray-800 dark:text-gray-100">
                    {initialData.autre_fichier_url.split("/").pop()}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-base font-medium text-gray-800 dark:text-gray-100 mt-2">Aucun fichier</p>
          )}
        </div>
      </div>

      {/* Équipements */}
      <div className="pt-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4 text-lg border-b pb-2">Équipements</h3>
        <div className="grid grid-cols-1 gap-3">
          <EquipmentItem label="Documents" checked={initialData.documents} />
          <EquipmentItem label="Cric" checked={initialData.cric} />
          <EquipmentItem label="Siège enfant" checked={initialData.siege_enfant} />
          <EquipmentItem label="Roue de secours" checked={initialData.roue_secours} />
          <EquipmentItem label="Poste radio" checked={initialData.poste_radio} />
          <EquipmentItem label="Plaque panne" checked={initialData.plaque_panne} />
          <EquipmentItem label="Gilet sécurité" checked={initialData.gillet} />
          <EquipmentItem label="Extincteur" checked={initialData.extincteur} />
        </div>
      </div>

      {/* Description */}
      {initialData.description && (
        <div className="pt-4">
          <DetailItem label="Description" value={initialData.description} fullWidth />
        </div>
      )}

      <div className="pt-6">
        <Button variant="default" onClick={() => window.history.back()}>
          Retour
        </Button>
      </div>
    </div>
  );
};

const DetailItem = ({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string | number | null;
  fullWidth?: boolean;
}) => (
  <div className={fullWidth ? "col-span-full" : ""}>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-base font-medium text-gray-800 dark:text-white">{value || "N/A"}</p>
  </div>
);

const EquipmentItem = ({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) => (
  <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md">
    <label className={`text-base font-medium ${checked ? "text-gray-800 dark:text-white" : "text-gray-400"}`}>
      {label}
    </label>
    <span className="ml-auto text-sm font-mono">
      {checked ? "✓ Présent" : "✗ Absent"}
    </span>
  </div>
);

export default ContratDetails;
