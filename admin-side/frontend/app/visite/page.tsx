"use client";

import DataTable from "@/components/data-table";
import { Layout } from "@/components/layouts/layout";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type Visite = {
  id: number;
  date: string;
  prix: number;
  vehicule_matricule: string;
  vehicule_name: string;
};

const columns: ColumnDef<Visite>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    header: "Véhicule",
    id: "vehicule_info",
    accessorFn: (row) => `${row.vehicule_name} ${row.vehicule_matricule}`,
    cell: ({ row }) => {
      const name = row.original.vehicule_name;
      const matricule = row.original.vehicule_matricule;
      return (
        <div className="flex gap-2 items-center">
          <span>{name}</span>
          <Badge variant="secondary" className="w-fit">
            {matricule}
          </Badge>
        </div>
      );
    },
  },

  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "prix",
    header: "Prix",
    cell: ({ row }) => {
      const value = row.getValue("prix") as number;
      return `${value?.toFixed(2)} DH`;
    },
  },
];
export default function VisiteListPage() {
  const [data, setData] = useState<Visite[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedIdsToDelete, setSelectedIdsToDelete] = useState<number[]>([]);

  const router = useRouter();

  useEffect(() => {
    async function fetchVisites() {
      setLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/visites`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();
        console.log(result);
        setData(result.data ?? result);
      } catch (err) {
        console.error("Failed to fetch vehicles", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVisites();
  }, []);

  const onShowRow = (row: Visite) => {
    const id = row.id;
    router.push(`/visite/${id}`);
  };
  const onEditRow = (row: Visite) => {
    const id = row.id;
    router.push(`/visite/${id}/edit`);
  };
  const onAddRowButton = () => {
    router.push(`/visite/create`);
  };
  const onDeleteRows = (ids: number[]) => {
    setSelectedIdsToDelete(ids); // Just store the IDs
    setOpenDeleteDialog(true); // Open dialog
  };

  return (
    <Layout>
      <div className="container mx-auto ">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchColumn="vehicule_info"
          title="Liste des visites techniques"
          searchPlaceholder="chercher par vehicule..."
          onViewDetails={onShowRow}
          onEdit={onEditRow}
          onDeleteRows={onDeleteRows}
          onAddRowButton={onAddRowButton}
          service="visite"
          // service="charge"
        />
      </div>
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Charges</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIdsToDelete.length}{" "}
              selected charge(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false);
                setSelectedIdsToDelete([]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  const token = localStorage.getItem("auth_token");
                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/visites`,
                    {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                      },
                      body: JSON.stringify({ ids: selectedIdsToDelete }),
                    }
                  );

                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(
                      error.message || "Failed to delete charges"
                    );
                  }

                  setData((prev) =>
                    prev.filter(
                      (charge) => !selectedIdsToDelete.includes(charge.id)
                    )
                  );
                } catch (error) {
                  console.error("Error deleting charges:", error);
                  // optional toast here
                } finally {
                  setOpenDeleteDialog(false);
                  setSelectedIdsToDelete([]);
                }
              }}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
