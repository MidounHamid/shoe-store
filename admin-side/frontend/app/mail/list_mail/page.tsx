"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layouts/layout";
import DataTable from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAuthToken } from "@/lib/auth";

export type Mail = {
  id: number;
  email: string;
  created_at: string;
};

const columns: ColumnDef<Mail>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => `#${row.getValue("id")}`,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return date.toLocaleDateString("fr-FR");
    },
  },
];

export default function MailListPage() {
  const [data, setData] = useState<Mail[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [mailToDelete, setMailToDelete] = useState<Mail | null>(null);
  const router = useRouter();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchMails = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mails`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const result = await response.json();
        setData(result.data ?? result);
      } catch (error) {
        console.error("Erreur de chargement des emails", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMails();
  }, []);

//   const onAddRowButton = () => {
//     router.push(`/mail/create`);
//   };
const handleViewDetails = (mail: Mail) => {
    
  router.push(`/mail/details/${mail.id}`);
};

  const handleDelete = (mail: Mail) => {
    setMailToDelete(mail);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!mailToDelete) return;
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mails/${mailToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur de suppression");
      }

      setData((prev) => prev.filter((m) => m.id !== mailToDelete.id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    } finally {
      setOpenDeleteDialog(false);
      setMailToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          title="Liste des Emails"
          searchColumn="email"
          searchPlaceholder="Rechercher par email..."
          onDelete={handleDelete}
        //   onAddRowButton={onAddRowButton}
          onViewDetails={handleViewDetails}
          service="mail"
        />
      </div>

      <Dialog
        open={openDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDeleteDialog(false);
            setMailToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l’email{" "}
              <strong>{mailToDelete?.email}</strong> ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false);
                setMailToDelete(null);
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
