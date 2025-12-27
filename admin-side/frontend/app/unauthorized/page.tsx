"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold mb-2">403 - Accès refusé</h1>
            <p className="text-muted-foreground mb-6">
                Vous n’avez pas la permission d’accéder à cette page.<br />
                Soit vous n’êtes pas administrateur, soit quelqu’un a oublié de vous donner les droits d’accès.
            </p>
            <Link href="/">
                <Button>Retour à l’accueil</Button>
            </Link>
        </div>
    );
}
