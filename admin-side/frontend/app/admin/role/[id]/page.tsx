"use client"

import RoleDetails from "@/components/admin/RoleDetails";
import { Layout } from "@/components/layouts/layout"
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


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

export default function ShowRolePage() {
    const { id } = useParams();
    const [roleData, setRoleData] = useState<RoleData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchCharge() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/roles/${id}`, {
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
            ) : roleData ? (
                <div className="max-w-8xl mx-auto p-6">
                    <div className="mb-6 flex items-center gap-4">
                        <div>
                            <Button
                                type="button"
                                variant={"outline"}
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Retour
                            </Button>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">
                                Detail du role {roleData.name ? `: ${roleData.name}` : ""}
                            </h1>
                            <p className="text-gray-600">
                                Vous trouverez ci-dessous les détails de ce role.
                            </p>
                        </div>
                    </div>
                    {/* Remove id prop here */}
                    <RoleDetails initialData={roleData} />
                </div>
            ) : (
                <div className="flex items-center justify-center h-screen">
                    <p className="text-red-500">User not found.</p>
                </div>
            )}
        </Layout>
    )
}