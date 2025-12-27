"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";
import { HighlightedCalendar } from "../highlighted-calendar";
import DataTable from "../data-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { ColumnDef, Row } from "@tanstack/react-table";


type VehicleDetailsData = {
  id: number;
  name: string;
  matricule: string;
  nombre_cylindre: number;
  nbr_place: number;
  reference: string;
  serie: string;
  fournisseur: string;
  numero_facture: string;
  prix_achat: number;
  prix: number;
  duree_vie: number;
  kilometrage_actuel: number;
  kilometrage_location: number;
  type_assurance: string;
  marque_name: string;
  categorie_vehicule: string;
  type_carburant: string;
  gear: string;
  status: string;
  couleur: string;
  description?: string;
  image?: string;
  images?: string | string[];

  reservations?: {
    id: number;
    date_debut: string;
    date_fin: string;
    client_id: number | string;
    nbr_jours: number;
    statut: string;
  }[];

  contracts?: {
    id: number;
    date_depart: string;
    date_retour: string;
    client_one_id: number | string;
    nbr_jours: number;
    etat_contrat: string;
  }[];
};

type ReservationEntry = {
  id: number;
  date_debut: string;
  date_fin: string;
  client_id: number | string;
  nbr_jours: number;
  statut: string;
};

type ContractEntry = {
  id: number;
  date_depart: string;
  date_retour: string;
  client_one_id: number | string;
  nbr_jours: number;
  etat_contrat: string;
};


// Helpers
const FUEL_TYPES = [
  { value: "essence", label: "Essence" },
  { value: "diesel", label: "Diesel" },
  { value: "hybride", label: "Hybride" },
  { value: "electrique", label: "Électrique" },
];

const CATEGORIES = ["A", "B", "C", "D", "E"].map((c) => ({
  id: c,
  label: `Catégorie ${c}`,
}));

const GEARS = [
  { value: "automatic", label: "Automatique" },
  { value: "manual", label: "Manuelle" },
];

const getLabel = (
  arr: { value?: string; id?: string; label: string }[],
  value: string
) => arr.find((item) => item.value === value || item.id === value)?.label || value;

const getImageUrl = (imagePath: string): string => {
  if (!imagePath?.trim()) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return "";
  const cleanPath = imagePath.replace(/^\/+/, "");
  return `${baseUrl}/storage/${cleanPath}`;
};

// Shared display item
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

type ContractReservation = {
  id: number;
  type: "reservation" | "contrat",
  client: string,
  date: string,
  duration: string,
  status: string
};

// Inside DataTable component
const columns: ColumnDef<ContractReservation>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <span
          className={
            value === "reservation"
              ? "text-blue-600 font-semibold"
              : "text-orange-400 font-semibold"
          }
        >
          {value}
        </span>
      );
    },
  },
  {
    accessorKey: "client",
    header: "Client",
  },
  {
    accessorKey: "date",
    header: "Date début",
  },
  {
    accessorKey: "duration",
    header: "Durée",
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span className="capitalize">{value}</span>;
    },
  },
  {
    id: "details",
    header: "Détails",
    cell: ({ row }) => {
      const type = row.original.type;
      const id = row.original.id;
      const href = `/${type}/details/${id}`;

      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Link
            href={href}
            className="flex gap-2 items-center text-sm text-primary hover:text-muted-foreground"
          >
            <Eye size={18} />
            Voir
          </Link>
        </div>
      );
    },
  }
];



export default function VehicleDetails({ initialData }: { initialData: VehicleDetailsData }) {
  const vehicle = initialData;
  const [activePeriodIndex, setActivePeriodIndex] = useState<number | null>(null);


  const calendarPeriods = [
    ...(vehicle.reservations || []).map((r: ReservationEntry) => ({
      start: new Date(r.date_debut),
      end: new Date(r.date_fin),
      color: "#3B82F6", // blue for reservation
    })),
    ...(vehicle.contracts || []).map((c: ContractEntry) => ({
      start: new Date(c.date_depart),
      end: new Date(c.date_retour),
      color: "#FB923C", // orange for contract
    })),
  ];

  const tableData: ContractReservation[] = [
    ...(vehicle.reservations || []).map((r: ReservationEntry) => ({
      id: r.id,
      type: "reservation" as const,
      client: r.client_id?.toString(),
      date: r.date_debut,
      duration: `${r.nbr_jours} jours`,
      status: r.statut,
    })),
    ...(vehicle.contracts || []).map((c: ContractEntry) => ({
      id: c.id,
      type: "contrat" as const,
      client: c.client_one_id?.toString(),
      date: c.date_depart,
      duration: `${c.nbr_jours} jours`,
      status: c.etat_contrat,
    })),
  ];



  const getAdditionalImages = () => {
    if (!vehicle.images) return [];
    if (typeof vehicle.images === "string") {
      try {
        return JSON.parse(vehicle.images);
      } catch {
        return [];
      }
    }
    return Array.isArray(vehicle.images) ? vehicle.images : [];
  };

  const additionalImages = getAdditionalImages();

  const onRowClick = (row: Row<ContractReservation>) => {
    const { type, id } = row.original;

    const index = calendarPeriods.findIndex((p) => {
      let original:
        | {
          date_debut: string;
          date_fin: string;
        }
        | {
          date_depart: string;
          date_retour: string;
        } | undefined;

      if (type === "reservation") {
        original = vehicle.reservations?.find((r) => r.id === id);
        if (!original) return false;

        const start = new Date(original.date_debut);
        const end = new Date(original.date_fin);

        return (
          p.start.toISOString() === start.toISOString() &&
          p.end.toISOString() === end.toISOString()
        );
      } else {
        original = vehicle.contracts?.find((c) => c.id === id);
        if (!original) return false;

        const start = new Date(original.date_depart);
        const end = new Date(original.date_retour);

        return (
          p.start.toISOString() === start.toISOString() &&
          p.end.toISOString() === end.toISOString()
        );
      }
    });

    if (activePeriodIndex === index) {
      setActivePeriodIndex(null);
    } else {
      setActivePeriodIndex(index);
    }
  };


  return (
    <div className="flex flex-col gap-2">
      <div className="bg-background shadow rounded-xl p-6 space-y-4 dark:border-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem label="Nom du véhicule" value={vehicle.name} />
          <DetailItem label="Matricule" value={vehicle.matricule} />
          <DetailItem label="Nombre de cylindres" value={vehicle.nombre_cylindre} />
          <DetailItem label="Nombre de places" value={vehicle.nbr_place} />
          <DetailItem label="Référence" value={vehicle.reference} />
          <DetailItem label="Série" value={vehicle.serie} />
          <DetailItem label="Fournisseur" value={vehicle.fournisseur} />
          <DetailItem label="Numéro de facture" value={vehicle.numero_facture} />
          <DetailItem label="Prix d'achat" value={`${vehicle.prix_achat} MAD`} />
           <DetailItem label="Prix de location" value={`${vehicle.prix} MAD`} />
          <DetailItem label="Durée de vie" value={`${vehicle.duree_vie} ans`} />
          <DetailItem label="Kilométrage actuel" value={`${vehicle.kilometrage_actuel} km`} />
          <DetailItem label="Kilométrage location" value={`${vehicle.kilometrage_location} km`} />
          <DetailItem label="Type d'assurance" value={vehicle.type_assurance} />
          <DetailItem label="Marque" value={vehicle.marque_name} />
          <DetailItem
            label="Catégorie"
            value={getLabel(CATEGORIES, vehicle.categorie_vehicule || "")}
          />
          <DetailItem
            label="Type de carburant"
            value={getLabel(FUEL_TYPES, vehicle.type_carburant || "")}
          />
          <DetailItem
            label="Transmission"
            value={getLabel(GEARS, vehicle.gear || "")}
          />
          <DetailItem label="Statut" value={vehicle.status || "disponible"} />
          <div>
            <p className="text-sm text-gray-500">Couleur</p>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full border"
                style={{ backgroundColor: vehicle.couleur || "#3b82f6" }}
              />
              <p className="text-base font-medium text-gray-800">
                {vehicle.couleur}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Description</p>
          <Textarea
            value={vehicle.description || ""}
            readOnly
            className="min-h-[100px] bg-gray-50"
          />
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Image principale</p>
          {vehicle.image ? (
            <Image
              src={getImageUrl(vehicle.image)}
              alt="Main"
              width={250}
              height={160}
              className="rounded border object-cover"
              unoptimized
            />
          ) : (
            <span className="text-gray-400">Aucune image</span>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Images supplémentaires</p>
          <div className="flex flex-wrap gap-3">
            {additionalImages.length > 0 ? (
              additionalImages.map((img: string, idx: number) => (
                <Image
                  key={idx}
                  src={getImageUrl(img)}
                  alt={`Image ${idx + 1}`}
                  width={160}
                  height={110}
                  className="rounded border object-cover"
                  unoptimized
                />
              ))
            ) : (
              <span className="text-gray-400">Aucune image supplémentaire</span>
            )}
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="button"
            variant={"default"}
            onClick={() => window.history.back()}
          >
            Retour
          </Button>
        </div>
      </div>
      <div className="bg-background shadow rounded-xl p-6 space-y-4 dark:border-2 flex gap-6">
        <DataTable
          data={tableData}
          columns={columns}
          title="Liste des contrats et reservations"
          isDataTable={false}
          onRowClick={onRowClick}
          activeRowIndex={activePeriodIndex !== null ? [activePeriodIndex] : []}
          defaultPageSize={5}
        />
        <HighlightedCalendar
          periods={calendarPeriods}
          activeIndex={activePeriodIndex}
          setActiveIndex={setActivePeriodIndex}
        />


      </div>
    </div>
  );
}
