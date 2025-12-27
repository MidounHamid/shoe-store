"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layouts/layout";
import DataTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { getAuthToken } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type RetourContrat = {
  id: number;
  contrat_id: number;
  number_contrat: string;
  vehicule_name: string;
  client_name: string;
  date_retour: string;
  lieu_livraison: string;
  km_retour: number;
  position_reservoir: string;
  etat_regelement: "paye" | "non paye";
  observation: string; // Now required field
  heure_retour: string;
  kilm_parcoru: string;
  prolongation: "non" | "oui";
};

const columns: ColumnDef<RetourContrat>[] = [
  {
    accessorKey: "number_contrat",
    header: "N° Contrat",
  },
  {
    accessorKey: "vehicule_name",
    header: "Véhicule",
  },
  {
    accessorKey: "client_name",
    header: "Client",
  },
  {
    accessorKey: "date_retour",
    header: "Date de retour",
    cell: ({ row }) =>
      new Date(row.getValue("date_retour")).toLocaleDateString("fr-FR"),
  },
  {
    accessorKey: "lieu_livraison",
    header: "Lieu de livraison",
  },
  {
    accessorKey: "km_retour",
    header: "KM Retour",
    cell: ({ row }) => `${row.getValue("km_retour")} km`,
  },
  {
    accessorKey: "position_reservoir",
    header: "Niveau Carburant",
    cell: ({ row }) => {
      const niveau = row.getValue("position_reservoir");
      return niveau === "0" ? "Vide" : niveau;
    },
  },
  {
    accessorKey: "observation",
    header: "Observation",
    cell: ({ row }) => {
      const observation = row.getValue("observation") as string;
      return observation.length > 50
        ? `${observation.substring(0, 50)}...`
        : observation;
    },
  },
  {
    accessorKey: "etat_regelement",
    header: "Règlement",
    cell: ({ row }) => {
      const status = row.getValue("etat_regelement");
      return status === "paye" ? (
        <Badge className="bg-green-600 text-white hover:bg-green-600">
          Payé
        </Badge>
      ) : (
        <Badge className="bg-red-600 text-white hover:bg-red-600">
          Non payé
        </Badge>
      );
    },
  },
];

export default function RetourContratListPage() {
  const [data, setData] = useState<RetourContrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [retourToDelete, setRetourToDelete] = useState<RetourContrat | null>(
    null
  );
  const router = useRouter();

  // Use a ref to avoid fetching data multiple times on re-renders
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    async function fetchRetourContrats() {
      setLoading(true);
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/retour-contrats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Erreur de chargement des retours");

        const result = await response.json();
        setData(result.data ?? []);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRetourContrats();
  }, []);

  const handleViewDetails = (retour: RetourContrat) => {
    router.push(`/retour_contrat/details/${retour.id}`);
  };

  const handleEdit = (retour: RetourContrat) => {
    router.push(`/retour_contrat/edit/${retour.id}`);
  };

  const handleDelete = (retour: RetourContrat) => {
    setRetourToDelete(retour);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!retourToDelete) return;
    const token = getAuthToken();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/retour-contrats/${retourToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setData((prev) => prev.filter((r) => r.id !== retourToDelete.id));
    } catch (err) {
      console.error("Suppression échouée:", err);
    } finally {
      setOpenDeleteDialog(false);
      setRetourToDelete(null);
    }
  };

  const onAddRowButton = () => {
    router.push(`/retour_contrat/create`);
  };
  return (
    <Layout>
      <div className="container mx-auto ">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="number_contrat"
          title="Liste des Retours de Contrats"
          searchPlaceholder="Rechercher par numéro de contrat..."
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          service="retour_contract"
          serviceName="retour contrat"
          onAddRowButton={onAddRowButton}
        />
      </div>

      <Dialog
        open={openDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDeleteDialog(false);
            setRetourToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer le retour pour le contrat{" "}
              <strong>#{retourToDelete?.number_contrat}</strong> ? Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false);
                setRetourToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Oui, supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
