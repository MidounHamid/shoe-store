"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface Mail {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

interface MailDetailsProps {
  initialData: Mail;
}

const MailDetails: React.FC<MailDetailsProps> = ({ initialData }) => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="bg-background dark:border-2 shadow rounded-xl p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="ID" value={initialData.id} />
        <DetailItem label="Email" value={initialData.email} />
        <DetailItem
          label="Date d'ajout"
          value={new Date(initialData.created_at).toLocaleString("fr-FR")}
        />
        {/* <DetailItem
          label="Dernière modification"
          value={new Date(initialData.updated_at).toLocaleString("fr-FR")}
        /> */}
      </div>

      <div className="pt-6">
        <Button variant="default" onClick={handleGoBack}>
          Retour
        </Button>
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
    <p className="text-base font-medium text-gray-800 dark:text-white">{value}</p>
  </div>
);

export default MailDetails;