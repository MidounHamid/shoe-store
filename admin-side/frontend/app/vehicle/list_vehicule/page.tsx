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

export type Vehicle = {
  id: number;
  name: string;
  status: "disponible" | "no disponible" | "reserver" | "en location";
  marque_id: number;
  marque_name?: string;
  matricule: string;
  type_carburant: string;
  nombre_cylindre: number;
  nbr_place: number;
};

const columns: ColumnDef<Vehicle>[] = [
  { accessorKey: "name", header: "Nom" },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusBadge = (status: string) => {
        console.log(status);
        switch (status) {
          case "disponible":
            return (
              <Badge
                variant="secondary"
                className="bg-green-600 text-white hover:bg-green-600"
              >
                Disponible
              </Badge>
            );
          case "no disponible":
            return <Badge variant="destructive">Non Disponible</Badge>;
          case "reserver":
            return (
              <Badge
                variant="secondary"
                className="bg-yellow-600 text-white hover:bg-yellow-600"
              >
                Réservé
              </Badge>
            );
          case "en location":
            return (
              <Badge
                variant="secondary"
                className="bg-blue-600 text-white hover:bg-blue-600"
              >
                En Location
              </Badge>
            );
          default:
            return <Badge variant="outline">{status}</Badge>;
        }
      };
      return getStatusBadge(status);
    },
  },

  {
    accessorKey: "marque_name",
    header: "Marque",
    cell: ({ row }) => row.getValue("marque_name") ?? "N/A",
  },
  { accessorKey: "matricule", header: "Matricule" },
  { accessorKey: "type_carburant", header: "Type de carburant" },
  { accessorKey: "nombre_cylindre", header: "Cylindres" },
  { accessorKey: "nbr_place", header: "Places" },
];

export default function VehicleListPage() {
  const [data, setData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const router = useRouter();

  // Use a ref to avoid fetching data multiple times on re-renders
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchVehicles() {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Missing token");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/vehicules`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();
        setData(result.data ?? result);
      } catch (err) {
        console.error("Échec du chargement des véhicules", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  const handleViewDetails = (vehicle: Vehicle) => {
    router.push(`/vehicle/details/${vehicle.id}`);
  };

  const handleEdit = (vehicle: Vehicle) => {
    router.push(`/vehicle/edit/${vehicle.id}`);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setOpenDeleteDialog(true);
  };
  const onAddRowButton = () => {
    router.push(`/vehicle/create`);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      const token = getAuthToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vehicules/${vehicleToDelete.id}`,
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

      setData((prev) => prev.filter((v) => v.id !== vehicleToDelete.id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    } finally {
      setOpenDeleteDialog(false);
      setVehicleToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto ">
        {/* <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Liste des Véhicules</h1>
          <Button onClick={() => router.push("/vehicle/create")} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ajouter un véhicule
          </Button>
        </div> */}

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="matricule"
          title="Liste des Véhicules"
          searchPlaceholder="Rechercher par matricule..."
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddRowButton={onAddRowButton}
          service="vehicule"
        />
      </div>

      {/* Dialog for delete confirmation */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le véhicule{" "}
              <strong>{vehicleToDelete?.name}</strong> ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false);
                setVehicleToDelete(null);
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
