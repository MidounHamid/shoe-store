"use client"
import { Layout } from "@/components/layouts/layout";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";
import { PreviewFile } from "@/lib/utils";
import { useParams } from "next/navigation";
import { Loading } from "@/components/ui/loading";
import VisiteDetails from "@/components/visite/VisiteDetails";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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

export default function ViewVisiteDetailsPage() {

    const { id } = useParams();
    const [visiteData, setVisiteData] = useState<VisiteData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter()

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

    return (
        <Layout>
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <Loading />
                </div>
            ) : visiteData ? (
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
                            <h1 className="text-2xl font-bold flex">
                                Detail de visite technique de <pre> - </pre>
                                {(() => {
                                    const vehicule = visiteData.availableVehicules.find(
                                        (v) => v.id.toString() === visiteData.vehicule_id.toString()
                                    );
                                    return vehicule ? (
                                        <div className="flex gap-2">
                                            <span className="font-semibold">{` ${vehicule.name}`}</span>
                                            <Badge variant={"secondary"}>{vehicule.matricule}</Badge>

                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground italic">Véhicule inconnu</span>
                                    );
                                })()}
                            </h1>
                            <p className="text-gray-600">
                                Vous trouverez ci-dessous les détails de cette visite.
                            </p>
                        </div>
                    </div>
                    {/* Remove id prop here */}
                    <VisiteDetails initialData={visiteData} />
                </div>
            ) : (
                <div className="flex items-center justify-center h-screen">
                    <p className="text-red-500">Visite not found.</p>
                </div>
            )}
        </Layout>
    );
}