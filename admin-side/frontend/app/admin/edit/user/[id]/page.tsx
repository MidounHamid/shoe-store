"use client"
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import UserForm from "@/components/admin/UserForm";
import { FormMode } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import ResetUserPasswordForm from "@/components/admin/ResetUserPasswordForm";
import { Loading } from "@/components/ui/loading";

interface UserData {
    id: number;
    name: string,
    email: string,
    role: string,
    role_id: number
    availableRoles: { id: number, name: string }[]
}

type Role = {
    id: number;
    name: string;
};

export default function EditUserPage() {
    const { id } = useParams();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const handleUpdateSuccess = () => {
        toast({
            title: "Success",
            description: "Utilisateur Modifié avec succès !",
        });
        router.push("/admin");

    };

    useEffect(() => {
        async function fetchCharge() {
            const token = getAuthToken();
            try {
                let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                const userRes = await res.json();
                console.log(userRes)
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                const roles = await res.json();


                const mappedRoles = roles.data.map((role: Role) => ({
                    id: role.id,
                    name: role.name,
                }));


                setUserData({
                    ...userRes,
                    availableRoles: mappedRoles,
                });
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
            ) : userData && <div className="max-w-8xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Modifier l&apos;utilisateur</h1>
                </div>
                <UserForm
                    formMode={FormMode.EDIT}
                    onSuccess={handleUpdateSuccess}
                    defaultValues={userData}
                />
            </div>}
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <Loading />
                </div>
            ) : userData && <div className="max-w-8xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Changer le mot de passe</h1>

                </div>
                <ResetUserPasswordForm />
            </div>}
        </Layout>
    )
}