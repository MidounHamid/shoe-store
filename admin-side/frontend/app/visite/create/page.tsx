"use client"
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";
import { FormMode, PreviewFile } from "@/lib/utils";
import VisiteForm from "@/components/visite/VisiteForm";
import { Loading } from "@/components/ui/loading";
import { useEffect, useState } from "react";
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


export default function CreateChargePage() {
    const [VisiteData, setVisiteData] = useState<VisiteData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVehicules() {
            const token = getAuthToken();
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/visites/vehicules`, {
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
                console.log(mappedVehicules)

                setVisiteData({
                    id: 0,
                    vehicule_id: "",
                    date: "",
                    prix: 0,
                    kilometrage_actuel: 0,
                    kilometrage_prochain: 0,
                    fichier: null,
                    description: "",
                    availableVehicules: mappedVehicules
                });
            } catch (error) {
                console.error(error)
                toast({ title: "Error", description: "Failed to load charge data." });
            } finally {
                setLoading(false);
            }
        }

        fetchVehicules();
    }, []);
    const handleSuccess = () => {
        toast({
            title: "Success",
            description: "Visite created successfully!",
        });
    };
    return (
        <Layout>
            {loading ?
                <div className="flex items-center justify-center h-screen">
                    <Loading />
                </div> :
                <div className="max-w-8xl mx-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Ajouter une nouvelle visite technique</h1>
                    </div>
                    <VisiteForm
                        formMode={FormMode.CREATE}
                        onSuccess={handleSuccess}
                        defaultValues={VisiteData}
                    />
                </div>
            }

        </Layout>
    )
}