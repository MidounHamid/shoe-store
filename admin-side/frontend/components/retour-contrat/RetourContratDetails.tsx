"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type EtatReglement = "paye" | "non paye";
type Prolongation = "oui" | "non";
type PositionReservoir = "0" | "1/4" | "1/2" | "3/4" | "4/4";

interface RetourContrat {
  id: number;
  contrat_id: number;
  km_retour: number;
  kilm_parcoru: string;
  heure_retour: string;
  date_retour: string;
  position_reservoir: PositionReservoir;
  lieu_livraison: string;
  observation: string;
  etat_regelement: EtatReglement;
  prolongation: Prolongation;
  created_at?: string;
  updated_at?: string;
}

interface RetourContratDetailsProps {
  initialData: RetourContrat;
}

const RetourContratDetails: React.FC<RetourContratDetailsProps> = ({ initialData }) => {
  return (
    <div className="bg-white shadow rounded-xl p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="ID Retour" value={initialData.id} />
        <DetailItem label="Contrat lié" value={`#${initialData.contrat_id}`} />
        <DetailItem label="Kilométrage au retour" value={`${initialData.km_retour} km`} />
        <DetailItem label="Kilométrage parcouru" value={`${initialData.kilm_parcoru} km`} />
        <DetailItem label="Heure de retour" value={initialData.heure_retour} />
        <DetailItem label="Date de retour" value={initialData.date_retour} />
        <DetailItem label="Position du réservoir" value={formatReservoir(initialData.position_reservoir)} />
        <DetailItem label="Lieu de livraison" value={initialData.lieu_livraison} />
        <DetailItem label="État de règlement" value={initialData.etat_regelement === "paye" ? "Payé" : "Non payé"} />
        <DetailItem label="Prolongation" value={initialData.prolongation === "oui" ? "Oui" : "Non"} />
      </div>

      {initialData.observation && (
        <div className="pt-4">
          <DetailItem label="Observation" value={initialData.observation} fullWidth />
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
  value: string | number;
  fullWidth?: boolean;
}) => (
  <div className={fullWidth ? "col-span-full" : ""}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-base font-medium text-gray-800 break-words">{value}</p>
  </div>
);

// 🎯 Reservoir formatting for user readability
function formatReservoir(value: PositionReservoir): string {
  switch (value) {
    case "0":
      return "Vide";
    case "1/4":
      return "1/4";
    case "1/2":
      return "1/2";
    case "3/4":
      return "3/4";
    case "4/4":
      return "Plein";
    default:
      return value;
  }
}

export default RetourContratDetails;
