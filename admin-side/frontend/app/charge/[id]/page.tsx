"use client";

import { Layout } from "@/components/layouts/layout";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { PreviewFile } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";
import { getAuthToken } from "@/lib/auth";
import ChargeDetails from "@/components/charge/ChargeDetails";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation'



interface ChargeData {
    id: number;
    designation: string;
    date: string;
    montant: number;
    fichier?: File | string | PreviewFile | null;
    description?: string;
}

export default function ViewChargePage() {
    const { id } = useParams();
    const [chargeData, setChargeData] = useState<ChargeData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter()
    const isFetched = useRef<boolean>(false);

    useEffect(() => {
        async function fetchCharge() {
            if(isFetched.current) return
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
                } else {
                    setChargeData(json.data);
                }
                isFetched.current = true

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
                                Detail de charge {chargeData.designation ? `: ${chargeData.designation}` : ""}
                            </h1>
                            <p className="text-gray-600">
                                Vous trouverez ci-dessous les détails de cette charge. 
                            </p>
                        </div>
                    </div>
                    {/* Remove id prop here */}
                    <ChargeDetails initialData={chargeData} />
                </div>
            ) : (
                <div className="flex items-center justify-center h-screen">
                    <p className="text-red-500">Charge not found.</p>
                </div>
            )}
        </Layout>
    );
}
