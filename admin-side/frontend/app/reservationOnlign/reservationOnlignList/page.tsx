"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layouts/layout";
import DataTable from "@/components/data-table";
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
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export type ReservationByWebsite = {
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
  status: "En cours" | "Validée" | "Annulée";
};

export default function ReservationByWebsiteListPage() {
  const [data, setData] = useState<ReservationByWebsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reservationToDelete, setReservationToDelete] =
    useState<ReservationByWebsite | null>(null);

  const hasFetched = useRef(false);
  const router = useRouter();

  // ✅ Confirm reservation status handler
  const handleConfirmStatus = async (id: number) => {
    const token = getAuthToken();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-by-websites/${id}/confirm`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Erreur");

      toast({ title: "Réservation confirmée" });

      setData((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Validée" } : r))
      );
    } catch (err) {
      console.error("Confirmation échouée:", err);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer.",
        variant: "destructive",
      });
    }
  };

  const handleCanceledStatus = async (id: number) => {
    const token = getAuthToken();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-by-websites/${id}/canceled`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Erreur");

      toast({ title: "Réservation Annulée" });

      setData((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Annulée" } : r))
      );
    } catch (err) {
      console.error("Confirmation échouée:", err);
      toast({
        title: "Erreur",
        description: "Impossible de Annuler.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<ReservationByWebsite>[] = [
    {
      accessorKey: "vehicule_info",
      header: "Véhicule",
      cell: ({ row }) => {
        const vehicule = row.original.vehicule_name;
        const matricule = row.original.matricule;
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{vehicule}</span>
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 rounded-md"
            >
              {matricule}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.original.status;
        return status === "En cours" ? (
          <Badge className="bg-yellow-600 text-white hover:bg-yellow-600">
            En cours
          </Badge>
        ) : status === "Validée" ? (
          <Badge className="bg-green-600 text-white hover:bg-green-600">
            Validée
          </Badge>
        ) : (
          <Badge className="bg-red-600 text-white hover:bg-red-600">
            Annulée
          </Badge>
        );
      },
    },
    {
      accessorKey: "first_name",
      header: "Nom et prénom",
      cell: ({ row }) =>
        `${row.getValue("first_name")} ${row.original.last_name}`,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Téléphone",
    },
    {
      accessorKey: "pickup_date",
      header: "Date de début",
      cell: ({ row }) =>
        new Date(row.getValue("pickup_date")).toLocaleDateString("fr-FR"),
    },
    {
      accessorKey: "return_date",
      header: "Date de retour",
      cell: ({ row }) =>
        new Date(row.getValue("return_date")).toLocaleDateString("fr-FR"),
    },
    {
      accessorKey: "pickup_location",
      header: "Lieu de prise en charge",
    },
    {
      accessorKey: "special_requests",
      header: "Demandes spéciales",
      cell: ({ row }) => row.getValue("special_requests") || "—",
    },
  ];

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchReservations() {
      setLoading(true);
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-by-websites`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok)
          throw new Error("Erreur de chargement des réservations");

        const result = await response.json();
        setData(result.data ?? []);
      } catch (err) {
        console.error("Erreur:", err);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des réservations.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchReservations();
  }, [router]);

  const handleViewDetails = (reservation: ReservationByWebsite) => {
    router.push(`/reservationOnlign/details/${reservation.id}`);
  };

  const handleDelete = (reservation: ReservationByWebsite) => {
    setReservationToDelete(reservation);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;
    const token = getAuthToken();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-by-websites/${reservationToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setData((prev) => prev.filter((r) => r.id !== reservationToDelete.id));
    } catch (err) {
      console.error("Suppression échouée:", err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la réservation.",
        variant: "destructive",
      });
    } finally {
      setOpenDeleteDialog(false);
      setReservationToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="first_name"
          title="Liste des réservations en ligne"
          searchPlaceholder="Rechercher par prénom ou email..."
          onViewDetails={handleViewDetails}
          onDelete={handleDelete}
          onConfirm={handleConfirmStatus}
          onCancel={handleCanceledStatus}
          service="reservation_online"
          serviceName="réservation"
        />
      </div>

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
              Voulez-vous vraiment supprimer la réservation de{" "}
              <strong>
                {reservationToDelete?.first_name}{" "}
                {reservationToDelete?.last_name}
              </strong>{" "}
              ? Cette action est irréversible.
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
