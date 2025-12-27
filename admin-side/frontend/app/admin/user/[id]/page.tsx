"use client"
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import UserDetails from "@/components/admin/UserDetails";

type Log = {
    log_name: string;
    description: string;
    created_at: string; // or Date if you're parsing it
};

interface UserData {
    id: number;
    name: string,
    email: string,
    role: string,
    email_verified_at: string | null
    role_id: number,
    created_at: string
    updated_at: string
    activity_logs: Log[]
}



export default function EditUserPage() {
    const { id } = useParams();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchCharge() {
            const token = getAuthToken()
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                const userRes = await res.json();
                setUserData({
                    ...userRes,
                });
                // console.log(userRes);
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
            ) : userData ? (
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
                                Detail d&apos;utilisateur {userData.name ? `: ${userData.name}` : ""}
                            </h1>
                            <p className="text-gray-600">
                                Vous trouverez ci-dessous les détails de cet utilisateurs.
                            </p>
                        </div>
                    </div>
                    {/* Remove id prop here */}
                    <UserDetails initialData={userData} />
                </div>
            ) : (
                <div className="flex items-center justify-center h-screen">
                    <p className="text-red-500">User not found.</p>
                </div>
            )}
        </Layout>
    )
}