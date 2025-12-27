"use client"
import { Layout } from "@/components/layouts/layout";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";
import { FormMode, PreviewFile } from "@/lib/utils";
import VisiteForm from "@/components/visite/VisiteForm";
import { useParams } from "next/navigation";
import { Loading } from "@/components/ui/loading";
import { useRouter } from "next/navigation";
import { Vehicle } from "@/components/ui/vehicle-select";

interface VisiteData {
    id: number,
    vehicule_id: string,
    date: string,
    prix: number,
    kilometrage_actuel: number,
    kilometrage_prochain: number,
    fichier?: File[] | string[] | PreviewFile[] | null,
    description?: string
    availableVehicules: { id: number, name: string, matricule: string }[]
}

export default function EditVisitePage() {

    const { id } = useParams();
    const [VisiteData, setVisiteData] = useState<VisiteData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchVisite() {
            const token = getAuthToken();
            try {
                let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/visites/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                const originalData = await res.json();
                const files: PreviewFile[] = []

                if (originalData.data.fichier) {
                    for (const element of originalData.data.fichier) {
                        const res = await fetch(element, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });

                        if (!res.ok) throw new Error("Failed to fetch file");

                        const blob = await res.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        const newFile = {
                            url: blobUrl,
                            name: element.split('/').pop() || "file"
                        };
                        files.push(newFile);
                    }
                }
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/visites/vehicules`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                const vehicules = await res.json();


                const mappedVehicules = vehicules.data.map((v: Vehicle) => ({
                    id: v.id,
                    name: v.name,
                    matricule: v.matricule 
                }));

                setVisiteData({
                    ...originalData.data,
                    fichier: originalData.data.fichier ? files : null,
                    availableVehicules: mappedVehicules
                });
            } catch (error) {
                console.error(error)
                toast({ title: "Error", description: "Failed to load charge data." });
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchVisite();
        }
    }, [id]);

    const handleSuccess = () => {
        toast({
            title: "Success",
            description: "Visite updated successfully!",
        });
        router.push("/visite")
    };
    return (
        <Layout>
            {loading ?
                <div className="flex items-center justify-center h-screen">
                    <Loading />
                </div> :
                <div className="max-w-8xl mx-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Modifier la visite technique</h1>
                    </div>
                    <VisiteForm
                        formMode={FormMode.EDIT}
                        onSuccess={handleSuccess}
                        defaultValues={VisiteData}
                    />
                </div>
            }
        </Layout>
    )
}