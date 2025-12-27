"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReservationByWebsite {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  special_requests?: string;
  car_id: number;
  vehicule_name: string;
  matricule: string;
  prix: string;
  marque_nom: string;
    status: string;
}
interface Props {
  initialData: ReservationByWebsite;
}

const ReservationOnlignDetails: React.FC<Props> = ({ initialData }) => {
  return (
    <div className="flex flex-col ">
      <div className="bg-background shadow rounded-xl p-6 space-y-4 dark:border-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem label="Prénom" value={initialData.first_name} />
          <DetailItem label="Nom" value={initialData.last_name} />
          <DetailItem label="Email" value={initialData.email} />
          <DetailItem label="Téléphone" value={initialData.phone} />
          <DetailItem
            label="Date de prise"
            value={new Date(initialData.pickup_date).toLocaleString()}
          />
          <DetailItem
            label="Date de retour"
            value={new Date(initialData.return_date).toLocaleString()}
          />
          <DetailItem
            label="Lieu de prise"
            value={initialData.pickup_location}
          />
          <DetailItem label="Véhicule" value={initialData.vehicule_name} />
          <DetailItem label="Marque" value={initialData.marque_nom} />
          <DetailItem label="Matricule" value={initialData.matricule} />
          <DetailItem label="Prix" value={`${initialData.prix} MAD`} />
            <DetailItem label="Statut" value={initialData.status} /> 
        </div>

        {initialData.special_requests && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Demandes spéciales</p>
            <Textarea
              readOnly
              value={initialData.special_requests}
              className="bg-gray-50 min-h-[80px]"
            />
          </div>
        )}

        <div className="pt-4">
          <Button
            type="button"
            variant="default"
            onClick={() => window.history.back()}
          >
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-base font-medium text-gray-800 dark:text-white break-words">
      {value}
    </p>
  </div>
);

export default ReservationOnlignDetails;
