"use client";

import { Layout } from "@/components/layouts/layout";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ChargeForm from "@/components/charge/ChargeForm";
import { FormMode, PreviewFile } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";
import { getAuthToken } from "@/lib/auth";

interface ChargeData {
    id: number;
    designation: string;
    date: string;
    montant: number;
    fichier?: File | string | PreviewFile | null;
    description?: string;
}

export default function EditChargePage() {
    const { id } = useParams();
    const [chargeData, setChargeData] = useState<ChargeData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const isFetched = useRef<boolean>(false);

    const handleUpdateSuccess = () => {
        toast({
            title: "Success",
            description: "Charge updated successfully!",
        });
        router.push("/charge");

    };

    useEffect(() => {
        async function fetchCharge() {
            if (isFetched.current) return;

            const token = getAuthToken();
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/charges/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                const json = await res.json();
                if (json.data.fichier) {
                    const resBlob = await fetch(json.data.fichier, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    const blob = await resBlob.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    const isPDF = blob.type === "application/pdf";
                    const previewFile: PreviewFile = {
                        url: blobUrl,
                        type: isPDF ? "pdf" : "image",
                        name: json.data.fichier?.split("/")?.pop() ?? "fichier inconnu",
                    };

                    setChargeData({
                        ...json.data,
                        fichier: previewFile
                    });
                    isFetched.current = true
                } else {
                    setChargeData(json.data);
                }
            } catch (error) {
                console.error(error)
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
            ) : chargeData ? (
                <div className="max-w-8xl mx-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Modifier la charge</h1>
                    </div>
                    <ChargeForm formMode={FormMode.EDIT} defaultValues={chargeData} onSuccess={handleUpdateSuccess} />
                </div>
            ) : (
                <div className="flex items-center justify-center h-screen">
                    <p className="text-red-500 text-lg">Charge not found.</p>
                </div>
            )}
        </Layout>
    );
}
