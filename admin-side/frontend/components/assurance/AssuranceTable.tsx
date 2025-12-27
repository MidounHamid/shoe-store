"use client";

import { useRouter } from "next/navigation";

import DataTable from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export type Assurance = {
  id: number;
  vehicule_id: number;
  numero_assurance: string;
  numero_de_police?: string;
  date: string;
  date_prochaine?: string;
  date_reglement?: string;
  periode?: string;
  prix: number;
  fichiers?: string;
  description?: string;
  created_at?: string;
  vehicule_name?: string;
  vehicule_matricule?: string;
};

const columns: ColumnDef<Assurance>[] = [
  {
    accessorKey: "numero_assurance",
    header: "N° Assurance",
    cell: ({ row }) => {
      const numero = row.getValue("numero_assurance") as string;
      return numero ? (
        <Badge variant="outline" className="font-mono">
          {numero}
        </Badge>
      ) : (
        "N/A"
      );
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
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      return date ? new Date(date).toLocaleDateString("fr-FR") : "N/A";
    },
  },
  {
    accessorKey: "date_prochaine",
    header: "Prochaine échéance",
    cell: ({ row }) => {
      const date = row.getValue("date_prochaine") as string;
      if (!date) return "N/A";

      const echeance = new Date(date);
      const today = new Date();
      const diffTime = echeance.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let variant: "default" | "destructive" | "secondary" | "outline" =
        "default";
      if (diffDays < 0) variant = "destructive";
      else if (diffDays <= 30) variant = "secondary";

      return (
        <div className="flex flex-col">
          <span>{echeance.toLocaleDateString("fr-FR")}</span>
          <Badge variant={variant} className="text-xs w-fit">
            {diffDays < 0
              ? `Expiré depuis ${Math.abs(diffDays)} j`
              : diffDays === 0
              ? "Expire aujourd'hui"
              : `Dans ${diffDays} jour${diffDays > 1 ? "s" : ""}`}
          </Badge>
        </div>
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
    accessorKey: "periode",
    header: "Période",
    cell: ({ row }) => {
      const periode = row.getValue("periode") as string;
      return periode || "N/A";
    },
  },
];

function useAssuranceActions() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const deleteAssurance = async (
    assurance: Assurance,
    onSuccess?: () => void
  ) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer l'assurance ${assurance.numero_assurance}?`
      )
    ) {
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/assurances/${assurance.id}`,
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
        throw new Error(result.message || "Failed to delete assurance");
      }

      toast({
        title: "Succès",
        description: "Assurance supprimée avec succès.",
      });

      if (onSuccess) {
        onSuccess();
      }
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${
          error instanceof Error ? error.message : ""
        }`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteAssurance,
    loading,
  };
}

interface AssuranceTableProps {
  data: Assurance[];
  loading: boolean;
  title: string;
  // showAddButton?: boolean
  onAssuranceRemove?: (assuranceId: number) => void;
}

export default function AssuranceTable({
  data,
  loading,
  title,
  // showAddButton = false,
  onAssuranceRemove,
}: AssuranceTableProps) {
  const router = useRouter();
  const { deleteAssurance, loading: actionLoading } = useAssuranceActions();

  // Action handlers
  const handleViewDetails = (assurance: Assurance) => {
    router.push(`/assurance/detail/${assurance.id}`);
  };

  const handleEdit = (assurance: Assurance) => {
    router.push(`/assurance/edit/${assurance.id}`);
  };

  const handleDelete = async (assurance: Assurance) => {
    await deleteAssurance(assurance, () => {
      if (onAssuranceRemove) {
        onAssuranceRemove(assurance.id);
      }
    });
  };

  return (
    <div className="container mx-auto ">
      {/* <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showAddButton && (
          <Button onClick={() => router.push("/assurance/add")} className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter Assurance
          </Button>
        )}
      </div> */}
      <DataTable
        title={title}
        columns={columns}
        data={data}
        loading={loading || actionLoading}
        searchColumn="numero_assurance"
        searchPlaceholder="Rechercher par numéro d'assurance..."
        onAddRowButton={() => router.push("/assurance/add")}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        service="assurance"
      />
    </div>
  );
}
