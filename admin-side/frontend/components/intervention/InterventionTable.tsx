"use client";

import { useRouter } from "next/navigation";
import DataTable from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";

export type Intervention = {
  id: number;
  vehicule_id: number;
  date: string;
  prix: number;
  fichier?: string;
  description?: string;
  created_at?: string;
  vehicule_name?: string;
  vehicule_matricule?: string;
};

const columns: ColumnDef<Intervention>[] = [
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

function useInterventionActions() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const deleteIntervention = async (
    intervention: Intervention,
    onSuccess?: () => void
  ) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer l'intervention du ${new Date(
          intervention.date
        ).toLocaleDateString("fr-FR")}?`
      )
    ) {
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interventions/${intervention.id}`,
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
        throw new Error(result.message || "Failed to delete intervention");
      }

      toast({
        title: "Succès",
        description: "Intervention supprimée avec succès.",
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
    deleteIntervention,
    loading,
  };
}

interface InterventionTableProps {
  data: Intervention[];
  loading: boolean;
  title: string;
  // showAddButton?: boolean
  onInterventionRemove?: (interventionId: number) => void;
}

export default function InterventionTable({
  data,
  loading,
  title,
  // showAddButton = false,
  onInterventionRemove,
}: InterventionTableProps) {
  const router = useRouter();
  const { deleteIntervention, loading: actionLoading } =
    useInterventionActions();

  // Action handlers
  const handleViewDetails = (intervention: Intervention) => {
    router.push(`/intervention/detail/${intervention.id}`);
  };

  const handleEdit = (intervention: Intervention) => {
    router.push(`/intervention/edit/${intervention.id}`);
  };

  const handleDelete = async (intervention: Intervention) => {
    await deleteIntervention(intervention, () => {
      if (onInterventionRemove) {
        onInterventionRemove(intervention.id);
      }
    });
  };

  return (
    <div className="container mx-auto ">
      {/* <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showAddButton && (
          <Button onClick={() => router.push("/intervention/add")} className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter Intervention
          </Button>
        )}
      </div> */}
      <DataTable
        title={title}
        columns={columns}
        data={data}
        loading={loading || actionLoading}
        searchColumn="description"
        searchPlaceholder="Rechercher par description..."
        onAddRowButton={() => router.push("/intervention/add")}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        service="intervention"
      />
    </div>
  );
}
