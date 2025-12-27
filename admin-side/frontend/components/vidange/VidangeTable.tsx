"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DataTable from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";

export type Vidange = {
  id: number;
  vehicule_id: number;
  date: string;
  kilometrage_actuel: number;
  kilometrage_prochain: number;
  prix: number;
  fichier?: string;
  description?: string;
  created_at?: string;
  vehicule_name?: string;
  vehicule_matricule?: string;
};

const columns: ColumnDef<Vidange>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      return date ? new Date(date).toLocaleDateString("fr-FR") : "N/A";
    },
  },
  {
    accessorKey: "vehicule_name",
    header: "Véhicule",
    cell: ({ row }) => {
      const name = row.getValue("vehicule_name") as string;
      const matricule = row.original.vehicule_matricule;
      return name ? (
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
          <span className="text-sm text-gray-500">{matricule}</span>
        </div>
      ) : (
        "N/A"
      );
    },
  },
  {
    accessorKey: "kilometrage_actuel",
    header: "Km Actuel",
    cell: ({ row }) => {
      const km = row.getValue("kilometrage_actuel") as number;
      return km ? new Intl.NumberFormat("fr-FR").format(km) + " km" : "N/A";
    },
  },
  {
    accessorKey: "kilometrage_prochain",
    header: "Km Prochain",
    cell: ({ row }) => {
      const km = row.getValue("kilometrage_prochain") as number;
      return km ? new Intl.NumberFormat("fr-FR").format(km) + " km" : "N/A";
    },
  },
  {
    accessorKey: "prix",
    header: "Prix",
    cell: ({ row }) => {
      const prix = row.getValue("prix") as number;
      return prix
        ? new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "MAD",
          }).format(prix)
        : "N/A";
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return description
        ? description.length > 50
          ? `${description.substring(0, 50)}...`
          : description
        : "N/A";
    },
  },
];

function useVidangeActions() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const deleteVidange = async (vidange: Vidange, onSuccess?: () => void) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer la vidange du ${new Date(
          vidange.date
        ).toLocaleDateString("fr-FR")}?`
      )
    ) {
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vidanges/${vidange.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete vidange");
      }

      toast({
        title: "Succès",
        description: "Vidange supprimée avec succès.",
      });

      if (onSuccess) {
        onSuccess();
      }
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${
          error instanceof Error && error.message
        }`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteVidange,
    loading,
  };
}

interface VidangeTableProps {
  data: Vidange[];
  loading: boolean;
  title: string;
  showAddButton?: boolean;
  onVidangeRemove?: (vidangeId: number) => void;
}

export default function VidangeTable({
  data,
  loading,
  title,
  showAddButton = false,
  onVidangeRemove,
}: VidangeTableProps) {
  const router = useRouter();
  const { deleteVidange, loading: actionLoading } = useVidangeActions();

  // Action handlers
  const handleViewDetails = (vidange: Vidange) => {
    router.push(`/vidange/detail/${vidange.id}`);
  };

  const handleEdit = (vidange: Vidange) => {
    router.push(`/vidange/edit/${vidange.id}`);
  };

  const handleDelete = async (vidange: Vidange) => {
    await deleteVidange(vidange, () => {
      if (onVidangeRemove) {
        onVidangeRemove(vidange.id);
      }
    });
  };

  return (
    <div className="container mx-auto ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showAddButton && (
          <Button
            onClick={() => router.push("/vidange/add")}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter Vidange
          </Button>
        )}
      </div>
      <DataTable
        columns={columns}
        data={data}
        loading={loading || actionLoading}
        searchColumn="description"
        searchPlaceholder="Rechercher par description..."
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        service="vidange"
      />
    </div>
  );
}
