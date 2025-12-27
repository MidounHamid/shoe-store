"use client"

import RoleForm from "@/components/admin/RoleForm"
import { Layout } from "@/components/layouts/layout"
import { Loading } from "@/components/ui/loading";
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";
import { FormMode } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


interface RoleData {
    id: number,
    name: string,
    permissions: PermissionData[]
}


interface PermissionData {
    service: string,
    read: boolean,
    create: boolean,
    update: boolean,
    delete: boolean
}

export default function UpdateRolePage() {
    const { id } = useParams();
    const [roleData, setRoleData] = useState<RoleData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const handleSuccess = () => {
        toast({
            title: "Success",
            description: "Role Modifié avec succès !",
        });
        router.push("/admin")
    };
    useEffect(() => {
        async function fetchCharge() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/${id}`, {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                        Accept: "application/json",
                    },
                });
                const json = await res.json();
                setRoleData(json);
            } catch (error) {
                console.error(error);
                toast({ title: "Error", description: "Failed to load charge data." });
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchCharge();
        }
    }, [id]);
    return (
        <Layout>
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <Loading />
                </div>
            ) : roleData && <div className="max-w-8xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Modifier le role</h1>
                </div>
                <RoleForm
                    formMode={FormMode.EDIT}
                    onSuccess={handleSuccess}
                    defaultValues={roleData}
                />
            </div>}
        </Layout>
    )
}