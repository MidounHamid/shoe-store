"use client";
import DataTable from "@/components/data-table";
import { Layout } from "@/components/layouts/layout";
import { Badge } from "@/components/ui/badge";
import { getAuthToken } from "@/lib/auth";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

//breaf view of user table
export type User = {
  id: number;
  name: string;
  email_verified_at: string;
  role: string;
};

const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "email_verified_at",
    header: "Is Verified",
    cell: ({ row }) => {
      const date = row.getValue("email_verified_at");

      return date ? (
        <Badge
          variant="secondary"
          className="bg-blue-600 text-white hover:bg-blue-600"
        >
          Verified
        </Badge>
      ) : (
        <Badge variant="destructive">Not Verified</Badge>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
  },
];

export type Role = {
  id: number;
  name: string;
  user_count: number;
};

const roleColumns: ColumnDef<Role>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "user_count",
    header: "Number of users",
  },
];
export default function UsersPage() {
  const [usersData, setUsersData] = useState<User[]>([]);
  const [roleData, setRoleData] = useState<Role[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTypeToDelete, setSelectedTypeToDelete] = useState<
    "user" | "role" | null
  >(null);
  const [selectedIdsToDelete, setSelectedIdsToDelete] = useState<number[]>([]);
  const router = useRouter();
  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();
      setUsersData(result.data ?? result);
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
    } finally {
      setUserLoading(false);
    }
  };
  const fetchRoles = async () => {
    setRoleLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();
      console.log(result);
      setRoleData(result.data ?? result);
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const onViewUserRow = (row: User) => {
    router.push(`/admin/user/${row.id}`);
  };
  const onViewRoleRow = (row: Role) => {
    router.push(`/admin/role/${row.id}`);
  };

  const onAddUserRow = () => {
    router.push(`/admin/create/user`);
  };
  const onAddRoleRow = () => {
    router.push(`/admin/create/role`);
  };
  const onEditUserRow = (row: User) => {
    const id = row.id;
    router.push(`/admin/edit/user/${id}`);
  };
  const onEditRoleRow = (row: Role) => {
    const id = row.id;
    router.push(`/admin/edit/role/${id}`);
  };

  return (
    <Layout>
      <div className="container mx-auto ">
        <DataTable
          columns={roleColumns}
          data={roleData}
          loading={roleLoading}
          searchColumn="name"
          title="Liste des roles"
          searchPlaceholder="chercher par nom..."
          onViewDetails={onViewRoleRow}
          onAddRow={onAddRoleRow}
          onEdit={onEditRoleRow}
          onDeleteRows={(ids) => {
            setSelectedTypeToDelete("role");
            setSelectedIdsToDelete(ids);
            setOpenDeleteDialog(true);
          }}
        />
      </div>
      <div className="container mx-auto ">
        <DataTable
          columns={userColumns}
          data={usersData}
          loading={userLoading}
          searchColumn="name"
          title="Liste des utilisateurs"
          searchPlaceholder="chercher par nom..."
          onViewDetails={onViewUserRow}
          onAddRow={onAddUserRow}
          onEdit={onEditUserRow}
          onDeleteRows={(ids) => {
            setSelectedTypeToDelete("user");
            setSelectedIdsToDelete(ids);
            setOpenDeleteDialog(true);
          }}
        />
      </div>
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Confirmation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIdsToDelete.length}{" "}
              selected {selectedTypeToDelete === "user" ? "user(s)" : "role(s)"}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false);
                setSelectedIdsToDelete([]);
                setSelectedTypeToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  const token = getAuthToken();
                  const endpoint =
                    selectedTypeToDelete === "user"
                      ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`
                      : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/roles`;

                  const response = await fetch(endpoint, {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                      Accept: "application/json",
                    },
                    body: JSON.stringify({ ids: selectedIdsToDelete }),
                  });

                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Failed to delete items");
                  }

                  // if (selectedTypeToDelete === "user") {
                  //     setUsersData((prev) =>
                  //         prev.filter((user) => !selectedIdsToDelete.includes(user.id))
                  //     );
                  // } else {
                  //     setRoleData((prev) =>
                  //         prev.filter((role) => !selectedIdsToDelete.includes(role.id))
                  //     );
                  // }
                  await fetchUsers();
                  await fetchRoles();
                } catch (error) {
                  console.error("Error deleting items:", error);
                } finally {
                  setOpenDeleteDialog(false);
                  setSelectedIdsToDelete([]);
                  setSelectedTypeToDelete(null);
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
