"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";

const services = ["dashboard", "users", "products", "brands", "categories", "sizes", "tags", "orders", "payments", "carts", "favorites", "reviews", "addresses", "settings"];

interface RoleData {
    id: number,
    name: string,
    user_count: number
    permissions: PermissionData[]
}
interface PermissionData {
    service: string,
    read: boolean,
    create: boolean,
    update: boolean,
    delete: boolean
}
const DetailItem = ({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) => (
    <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-base font-medium text-gray-800 dark:text-white">{value}</p>
    </div>
);

export default function RoleDetails({ initialData }: { initialData: RoleData }) {
    return (
        <div className="bg-background shadow rounded-xl p-6 space-y-4 dark:border-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem label="Nom de role" value={initialData.name} />
                <DetailItem label="Nombre des utilisateurs" value={initialData.user_count} />
            </div>
            <div className="w-full h-0.5 my-4 border" />
            <p className="text-sm text-gray-500">Permissions</p>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-center">Read</TableHead>
                        <TableHead className="text-center">Create</TableHead>
                        <TableHead className="text-center">Update</TableHead>
                        <TableHead className="text-center">Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {services.map((service) => {
                        const permission = initialData.permissions.find((p) => p.service === service);

                        return (
                            <TableRow key={service}>
                                <TableCell className="font-medium capitalize">{service.replace(/_/g, " ")}</TableCell>

                                {["read", "create", "update", "delete"].map((perm) => {
                                    if (service === "dashboard" && perm !== "read") {
                                        return (
                                            <TableCell key={perm} className="text-center text-gray-400">--</TableCell>
                                        );
                                    }

                                    const isAllowed = permission ? permission[perm as keyof PermissionData] : false;
                                    
                                    return (
                                        <TableCell key={perm} className="text-center">
                                            {isAllowed ? (
                                                <Check className="text-green-500 w-4 h-4 mx-auto" />
                                            ) : (
                                                <X className="text-red-500 w-4 h-4 mx-auto" />
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>

            </Table>

        </div>
    )
}