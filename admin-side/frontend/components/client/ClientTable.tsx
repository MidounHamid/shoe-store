"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";

import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Client } from "@/app/client/list/page";

function useClientActions() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const toggleBlock = async (
    client: Client,
    onSuccess?: (updatedClient: Client) => void
  ) => {
    const action = client.bloquer ? "débloquer" : "bloquer";

    if (
      !confirm(
        `Êtes-vous sûr de vouloir ${action} le client ${client.nom} ${
          client.prenom || ""
        }?`
      )
    ) {
      return false;
    }

    setLoading(true);
    try {
      // Prepare clean data for the API - only send necessary fields
      const updateData = {
        type: client.type,
        nom: client.nom,
        prenom: client.prenom || "",
        ice_societe: client.ice_societe || "",
        nom_societe: client.nom_societe || "",
        date_naissance: client.date_naissance || "",
        lieu_de_naissance: client.lieu_de_naissance || "",
        adresse: client.adresse || "",
        telephone: client.telephone || "",
        ville: client.ville || "",
        postal_code: client.postal_code || "",
        email: client.email || "",
        nationalite: client.nationalite || "",
        numero_cin: client.numero_cin || "",
        date_cin_expiration: client.date_cin_expiration || "",
        numero_permis: client.numero_permis || "",
        date_permis: client.date_permis || "",
        passport: client.passport || "",
        date_passport: client.date_passport || "",
        description: client.description || "",
        bloquer: !client.bloquer, // Toggle the blocked status
        // Don't send documents field as it requires special handling
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${client.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} client`);
      }

      const updatedClient = { ...client, bloquer: !client.bloquer };

      toast({
        title: "Succès",
        description: `Client "${client.nom}" ${action}é avec succès.`,
      });

      if (onSuccess) {
        onSuccess(updatedClient);
      }

      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Erreur lors du ${action}: ${
          error instanceof Error && error.message
        }`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (client: Client, onSuccess?: () => void) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer le client ${client.nom} ${
          client.prenom || ""
        }?`
      )
    ) {
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${client.id}`,
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
        throw new Error(errorData.message || "Failed to delete client");
      }

      toast({
        title: "Succès",
        description: `Client "${client.nom}" supprimé avec succès.`,
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
    toggleBlock,
    deleteClient,
    loading,
  };
}

const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "nom",
    header: "Nom",
  },
  {
    accessorKey: "prenom",
    header: "Prénom",
    cell: ({ row }) => row.getValue("prenom") || "N/A",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return type === "client" ? (
        // <Badge variant="secondary" className="bg-green-600 text-white hover:bg-green-600">
        //   Client
        // </Badge>
        <Badge variant="secondary">Particulier </Badge>
      ) : (
        <Badge variant="outline">Société</Badge>
      );
    },
  },
  {
    accessorKey: "telephone",
    header: "Téléphone",
    cell: ({ row }) => row.getValue("telephone") || "N/A",
  },
  {
    accessorKey: "ville",
    header: "Ville",
    cell: ({ row }) => row.getValue("ville") || "N/A",
  },
  {
    accessorKey: "adresse",
    header: "Adresse",
    cell: ({ row }) => {
      const adresse = row.getValue("adresse") as string;
      return adresse
        ? adresse.length > 30
          ? `${adresse.substring(0, 30)}...`
          : adresse
        : "N/A";
    },
  },
  {
    accessorKey: "date_naissance",
    header: "Date de naissance",
    cell: ({ row }) => {
      const date = row.getValue("date_naissance") as string;
      return date ? new Date(date).toLocaleDateString("fr-FR") : "N/A";
    },
  },
  // Colonnes cachées par défaut
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.getValue("email") || "N/A",
  },
  {
    accessorKey: "nationalite",
    header: "Nationalité",
    cell: ({ row }) => row.getValue("nationalite") || "N/A",
  },
  {
    accessorKey: "lieu_de_naissance",
    header: "Lieu de naissance",
    cell: ({ row }) => row.getValue("lieu_de_naissance") || "N/A",
  },
  {
    accessorKey: "numero_cin",
    header: "N° CIN",
    cell: ({ row }) => row.getValue("numero_cin") || "N/A",
  },
  {
    accessorKey: "numero_permis",
    header: "N° Permis",
    cell: ({ row }) => row.getValue("numero_permis") || "N/A",
  },
  {
    accessorKey: "passport",
    header: "Passeport",
    cell: ({ row }) => row.getValue("passport") || "N/A",
  },
  {
    accessorKey: "nom_societe",
    header: "Nom Société",
    cell: ({ row }) => row.getValue("nom_societe") || "N/A",
  },
  {
    accessorKey: "ice_societe",
    header: "ICE Société",
    cell: ({ row }) => row.getValue("ice_societe") || "N/A",
  },
];

interface ClientTableProps {
  data: Client[];
  loading: boolean;
  title: string;
  // showAddButton?: boolean
  isBlockedList?: boolean;
  // onClientUpdate: (client: Client) => void
  onClientRemove: (clientId: number) => void;
}

export default function ClientTable({
  data,
  loading,
  title,
  // showAddButton = false,
  isBlockedList = false,
  // onClientUpdate,
  onClientRemove,
}: ClientTableProps) {
  const router = useRouter();
  const {
    toggleBlock,
    deleteClient,
    loading: actionLoading,
  } = useClientActions();

  // Action handlers
  const handleViewDetails = (client: Client) => {
    router.push(`/client/detail/${client.id}`);
  };

  const handleEdit = (client: Client) => {
    router.push(`/client/edit/${client.id}`);
  };

  const handleDelete = async (client: Client) => {
    await deleteClient(client, () => {
      onClientRemove(client.id);
    });
  };

  const handleBlockToggle = async (client: Client) => {
    await toggleBlock(client, () => {
      // Remove from current list since status changed
      onClientRemove(client.id);
    });
  };

  return (
    <div className="container mx-auto ">
      {/* <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showAddButton && (
          <Button onClick={() => router.push("/client/add")} className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter Client
          </Button>
        )}
      </div> */}

      <DataTable
        title={title}
        columns={columns}
        data={data}
        loading={loading || actionLoading}
        searchColumn="nom"
        searchPlaceholder="Rechercher par nom..."
        service="client"
        onAddRowButton={() => router.push("/client/add")}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBlock={handleBlockToggle}
        isBlockedList={isBlockedList}
        initialColumnVisibility={{
          email: false,
          nationalite: false,
          lieu_de_naissance: false,
          numero_cin: false,
          numero_permis: false,
          passport: false,
          nom_societe: false,
          ice_societe: false,
        }}
      />
    </div>
  );
}
