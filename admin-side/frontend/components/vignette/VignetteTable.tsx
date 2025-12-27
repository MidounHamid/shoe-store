"use client";

import { useRouter } from "next/navigation";

import DataTable from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";

export type Vignette = {
  id: number;
  vehicule_id: number;
  numero: string;
  date: string;
  date_prochaine: string;
  date_reglement?: string;
  prix: number;
  fichiers?: string;
  description?: string;
  created_at?: string;
  vehicule_name?: string;
  vehicule_matricule?: string;
};

const columns: ColumnDef<Vignette>[] = [
  {
    accessorKey: "numero",
    header: "Numéro",
    cell: ({ row }) => {
      const numero = row.getValue("numero") as string;
      return numero || "N/A";
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      return date ? new Date(date).toLocaleDateString("fr-FR") : "N/A";
    },
  },
  {
    accessorKey: "date_prochaine",
    header: "Date prochaine",
    cell: ({ row }) => {
      const date = row.getValue("date_prochaine") as string;
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

function useVignetteActions() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const deleteVignette = async (vignette: Vignette, onSuccess?: () => void) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer la vignette ${vignette.numero}?`
      )
    ) {
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vignettes/${vignette.id}`,
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
        throw new Error(result.message || "Failed to delete vignette");
      }

      toast({
        title: "Succès",
        description: "Vignette supprimée avec succès.",
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
    deleteVignette,
    loading,
  };
}

interface VignetteTableProps {
  data: Vignette[];
  loading: boolean;
  title: string;
  // showAddButton?: boolean
  onVignetteRemove?: (vignetteId: number) => void;
}

export default function VignetteTable({
  data,
  loading,
  title,
  // showAddButton = false,
  onVignetteRemove,
}: VignetteTableProps) {
  const router = useRouter();
  const { deleteVignette, loading: actionLoading } = useVignetteActions();

  // Action handlers
  const handleViewDetails = (vignette: Vignette) => {
    router.push(`/vignette/detail/${vignette.id}`);
  };

  const handleEdit = (vignette: Vignette) => {
    router.push(`/vignette/edit/${vignette.id}`);
  };

  const handleDelete = async (vignette: Vignette) => {
    await deleteVignette(vignette, () => {
      if (onVignetteRemove) {
        onVignetteRemove(vignette.id);
      }
    });
  };

  return (
    <div className="container mx-auto ">
      {/* <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showAddButton && (
          <Button onClick={() => router.push("/vignette/add")} className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter Vignette
          </Button>
        )}
      </div> */}
      <DataTable
        title={title}
        columns={columns}
        data={data}
        loading={loading || actionLoading}
        searchColumn="numero"
        searchPlaceholder="Rechercher par numéro..."
        onAddRowButton={() => router.push("/vignette/add")}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        service="vignette"
      />
    </div>
  );
}
