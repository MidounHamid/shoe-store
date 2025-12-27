"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAuthToken } from "@/lib/auth";

export default function PdfViewerPage() {
    const { id } = useParams();
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const token = getAuthToken();
                const res = await fetch(`/api/contracts/${id}/pdf`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store", // not necessary, but forces no caching
                });

                if (!res.ok) {
                    throw new Error("Échec lors de la récupération du PDF.");
                }

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            } catch (e) {
                console.error("Erreur PDF:", e);
                setError("PDF introuvable ou erreur de génération.");
            }
        }

        load();
    }, [id]);

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500 mb-4">{error}</p>
            </div>
        );
    }

    if (!pdfUrl) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="text-white text-lg font-medium animate-pulse">
                    Génération du PDF en cours...
                </div>
            </div>
        );
    }

    return (
        <iframe
            src={pdfUrl}
            title={`Contrat PDF ${id}`}
            className="w-full h-screen border-0"
        />
    );
}
