"use client"

import RoleForm from "@/components/admin/RoleForm"
import { Layout } from "@/components/layouts/layout"
import { toast } from "@/components/ui/use-toast";
import { FormMode } from "@/lib/utils"

export default function CreateRolePage() {
    const handleSuccess = () => {
        toast({
            title: "Success",
            description: "Role créé avec succès !",
        });
    };
    return (
        <Layout>
            <div className="max-w-8xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Créer un nouveau role</h1>
                </div>
                <RoleForm
                    formMode={FormMode.CREATE}
                    onSuccess={handleSuccess}
                />
            </div>
        </Layout>
    )
}