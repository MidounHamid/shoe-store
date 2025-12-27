"use client"
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import UserForm from "@/components/admin/UserForm";
import { FormMode } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { Loading } from "@/components/ui/loading";
interface UserData {
    id?: number;
    role_id: number | null
    name: string,
    email: string,
    role: string,
    availableRoles: { id: number, name: string }[]
}
type Role = {
    id: number;
    name: string;
};
export default function CreateUserPage() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const handleSuccess = () => {
        toast({
            title: "Success",
            description: "Utilisateur créé avec succès !",
        });
    };

    useEffect(() => {
        async function fetchCharge() {
            const token = getAuthToken();
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`, {
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
                    id: 0,             // placeholder, since you're creating a new user
                    name: "",
                    email: "",
                    role_id: null,
                    role: "",          // no role selected yet
                    availableRoles: mappedRoles,
                });
            } catch (error) {
                console.error(error);
                toast({ title: "Error", description: "Failed to load charge data." });
            } finally {
                setLoading(false);
            }
        }

        fetchCharge();

    }, []);
    return (
        <Layout>
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <Loading />
                </div>
            ) : userData && <div className="max-w-8xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Créer un nouveau utilisateur</h1>
                </div>
                <UserForm
                    formMode={FormMode.CREATE}
                    onSuccess={handleSuccess}
                    defaultValues={userData}
                />
            </div>}
        </Layout>
    )
}