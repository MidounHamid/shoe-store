"use client";

import React, { useEffect, useRef, useState } from "react";

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

export type Reservation = {
  id: number;
  vehicule_id: number;
  client_id: number;
  vehicule_name?: string;
  client_name?: string;
  date_reservation: string;
  date_debut: string;
  date_fin: string;
  heure_debut: string;
  heure_fin: string;
  lieu_depart: string;
  lieu_arrivee: string;
  nbr_jours: number;
  tva: "0" | "13" | "20";
  prix_jour: number;
  avance: number;
  total_ht: number;
  total_ttc: number;
  statut: "en cours" | "terminee" | "annulee";
  kilometrage_actuel?: number
};

const columns: ColumnDef<Reservation>[] = [
  {
    accessorKey: "id",
    header: "N° Réservation",
    cell: ({ row }) => `#${row.getValue("id")}`,
  },
  {
    accessorKey: "client_name",
    header: "Client",
    cell: ({ row }) => row.getValue("client_name") ?? "N/A",
  },
  {
    accessorKey: "vehicule_name",
    header: "Véhicule",
    cell: ({ row }) => row.getValue("vehicule_name") ?? "N/A",
  },
  {
    accessorKey: "date_debut",
    header: "Date Début",
    cell: ({ row }) => {
      const date = row.getValue("date_debut") as string;
      return new Date(date).toLocaleDateString("fr-FR");
    },
  },
  {
    accessorKey: "date_fin",
    header: "Date Fin",
    cell: ({ row }) => {
      const date = row.getValue("date_fin") as string;
      return new Date(date).toLocaleDateString("fr-FR");
    },
  },
  {
    accessorKey: "nbr_jours",
    header: "Durée",
    cell: ({ row }) => `${row.getValue("nbr_jours")} jour(s)`,
  },
  {
    accessorKey: "lieu_depart",
    header: "Lieu Départ",
  },
  {
    accessorKey: "lieu_arrivee",
    header: "Lieu Arrivée",
  },
  {
    accessorKey: "total_ttc",
    header: "Total TTC",
    cell: ({ row }) => {
      const amount = row.getValue("total_ttc") as number;
      return `${amount.toFixed(2)} DH`;
    },
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("statut") as string;
      switch (status) {
        case "en cours":
          return (
            <Badge
              variant="secondary"
              className="bg-blue-600 text-white hover:bg-blue-600"
            >
              En Cours
            </Badge>
          );
        case "terminee":
          return (
            <Badge
              variant="secondary"
              className="bg-green-600 text-white hover:bg-green-600"
            >
              Terminée
            </Badge>
          );
        case "annulee":
          return <Badge variant="destructive">Annulée</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    },
  },
];

export default function ReservationListPage() {
  const [data, setData] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reservationToDelete, setReservationToDelete] =
    useState<Reservation | null>(null);
  const router = useRouter();

  // Use a ref to avoid fetching data multiple times on re-renders
  const hasFetched = useRef(false);

  useEffect(() => {
    //fetching data only once
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchReservations() {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Missing token");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch reservations");

        const result = await response.json();
        setData(result.data ?? result);
      } catch (err) {
        console.error("Échec du chargement des réservations", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReservations();
  }, []);

  const handleViewDetails = (reservation: Reservation) => {
    router.push(`/reservation/details/${reservation.id}`);
  };

  const handleEdit = (reservation: Reservation) => {
    router.push(`/reservation/edit/${reservation.id}`);
  };
  const onAddRowButton = () => {
    router.push(`/reservation/create`);
  };
  const onConvertReservation = (reservation: Reservation) => {
    router.push(`/reservation/convert/${reservation.id}`);
  };


  const handleDelete = (reservation: Reservation) => {
    setReservationToDelete(reservation);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;
    const token = getAuthToken();
    if (!token) {
      console.error("Missing auth token for deletion");
      setOpenDeleteDialog(false);
      setReservationToDelete(null);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${reservationToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de la suppression");
      }

      setData((prev) => prev.filter((r) => r.id !== reservationToDelete.id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    } finally {
      setOpenDeleteDialog(false);
      setReservationToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto ">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="client_name"
          title="Liste des Réservations"
          searchPlaceholder="Rechercher par client..."
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddRowButton={onAddRowButton}
          onConvert={onConvertReservation} 
          service="reservation"
        />
      </div>

      {/* Dialog for delete confirmation */}
      <Dialog
        open={openDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDeleteDialog(false);
            setReservationToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la réservation{" "}
              <strong>#{reservationToDelete?.id}</strong> ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false);
                setReservationToDelete(null);
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
