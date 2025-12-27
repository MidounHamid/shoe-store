"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layouts/layout";
import DataTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { getAuthToken } from "@/lib/auth";
// import { set, get } from 'idb-keyval';

// import { Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

export type Contrat = {
  id: number;
  number_contrat: string;
  vehicule_name?: string;
  client_one_name?: string;
  total_ttc?: number;
  date_contrat: string;
  lieu_depart: string;
  nbr_jours: number;
  etat_contrat: "en cours" | "termine";
};

const columns: ColumnDef<Contrat>[] = [
  {
    accessorKey: "number_contrat",
    header: "N° Contrat",
  },
  {
    accessorKey: "vehicule_name",
    header: "Véhicule",
  },
  {
    accessorKey: "client_one_name",
    header: "Client",
  },
  {
    accessorKey: "date_contrat",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.getValue("date_contrat")).toLocaleDateString("fr-FR"),
  },
  {
    accessorKey: "total_ttc",
    header: "Prix Total",
    cell: ({ row }) => {
      const prixRaw = row.getValue("total_ttc");
      const prix = typeof prixRaw === "number" ? prixRaw : undefined;
      return prix !== undefined
        ? prix.toLocaleString("fr-FR", { style: "currency", currency: "MAD" })
        : "—";
    },
  },

  {
    accessorKey: "lieu_depart",
    header: "Lieu de départ",
    cell: ({ row }) => row.getValue("lieu_depart") ?? "—",
  },
  {
    accessorKey: "nbr_jours",
    header: "Durée",
    cell: ({ row }) => `${row.getValue("nbr_jours")} jour(s)`,
  },
  {
    accessorKey: "etat_contrat",
    header: "État",
    cell: ({ row }) => {
      const status = row.getValue("etat_contrat");
      return status === "termine" ? (
        <Badge className="bg-green-600 text-white hover:bg-green-600">
          Terminé
        </Badge>
      ) : (
        <Badge className="bg-blue-600 text-white hover:bg-blue-600">
          En cours
        </Badge>
      );
    },
  },
];

export default function ContratListPage() {
  const [data, setData] = useState<Contrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [contratToDelete, setContratToDelete] = useState<Contrat | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const hasFetched = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    console.log(router);

    async function fetchContrats() {
      setLoading(true);
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/contrats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Erreur de chargement des contrats");

        const result = await response.json();
        setData(result.data ?? []);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchContrats();
  }, [router]);

  const handleViewDetails = (contrat: Contrat) => {
    router.push(`/contrat/details/${contrat.id}`);
  };
  const onAddRowButton = () => {
    router.push(`/contrat/create`);
  };

  const handleEdit = (contrat: Contrat) => {
    router.push(`/contrat/edit/${contrat.id}`);
  };

  const handlePrint = async (contrat: Contrat) => {
    const id = contrat.id;
    setPdfLoading(true);

    try {
      window.open(`/contrat/pdf-viewer/${id}`, "_blank");
      // router.push(`/contrat/pdf-viewer/${id}`);
    } catch (err) {
      console.error("Erreur PDF:", err);
      toast({
        title: "Erreur",
        description: "Impossible de charger la page d'impression.",
        variant: "destructive",
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDelete = (contrat: Contrat) => {
    setContratToDelete(contrat);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!contratToDelete) return;
    const token = getAuthToken();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contrats/${contratToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setData((prev) => prev.filter((c) => c.id !== contratToDelete.id));
    } catch (err) {
      console.error("Suppression échouée:", err);
    } finally {
      setOpenDeleteDialog(false);
      setContratToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto ">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="number_contrat"
          title="Liste des Contrats"
          searchPlaceholder="Rechercher par numéro de contrat..."
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPrint={handlePrint}
          service="contract"
          // service="contract"
          serviceName="contrat"
          onAddRowButton={onAddRowButton}
        />
      </div>

      <Dialog
        open={openDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDeleteDialog(false);
            setContratToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer le contrat{" "}
              <strong>#{contratToDelete?.number_contrat}</strong> ? Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false);
                setContratToDelete(null);
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
      {pdfLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-white text-lg font-medium animate-pulse">
            Génération du PDF en cours...
          </div>
        </div>
      )}
    </Layout>
  );
}
