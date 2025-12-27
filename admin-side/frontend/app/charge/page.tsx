"use client";

import DataTable from "@/components/data-table";
import { Layout } from "@/components/layouts/layout";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
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

export type Charge = {
  id: number;
  designation: string;
  date: string;
  montant: number;
};

const columns: ColumnDef<Charge>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "designation",
    header: "Designation",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "montant",
    header: "Montant",
    cell: ({ row }) => {
      const value = row.getValue("montant") as number;
      return `${value.toFixed(2)} DH`;
    },
  },
];
export default function ChargeListPage() {
  const [data, setData] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedIdsToDelete, setSelectedIdsToDelete] = useState<number[]>([]);
  const isFetched = useRef<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchCharges() {
      console.log(isFetched.current);
      if (isFetched.current) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/charges`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();
        setData(result.data ?? result);
        isFetched.current = true;
        console.log(isFetched.current);
      } catch (err) {
        console.error("Failed to fetch vehicles", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCharges();
  }, []);

  // useEffect(() => {
  //     console.log(data)
  // }, [data])

  const onShowRow = (row: Charge) => {
    const id = row.id;
    router.push(`/charge/${id}`);
  };
  const onEditRow = (row: Charge) => {
    const id = row.id;
    router.push(`/charge/${id}/edit`);
  };
  const onAddRowButton = () => {
    router.push(`/charge/create`);
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
          searchColumn="designation"
          title="Liste des charges"
          searchPlaceholder="chercher par designation..."
          onViewDetails={onShowRow}
          onEdit={onEditRow}
          onDeleteRows={onDeleteRows}
          onAddRowButton={onAddRowButton}
          service="charge"
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
                    `${process.env.NEXT_PUBLIC_API_URL}/api/charges`,
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
