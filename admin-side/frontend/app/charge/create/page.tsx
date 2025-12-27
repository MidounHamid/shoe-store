"use client"
import { Layout } from "@/components/layouts/layout";
import { toast } from "@/components/ui/use-toast";
import ChargeForm from "@/components/charge/ChargeForm";
import { FormMode } from "@/lib/utils";


export default function CreateChargePage() {
    const handleSuccess = () => {
        toast({
            title: "Success",
            description: "Charge created successfully!",
        });
    };
    return (
        <Layout>
            <div className="max-w-8xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Créer une nouvelle charge</h1>
                </div>
                <ChargeForm
                    formMode={FormMode.CREATE}
                    onSuccess={handleSuccess}
                />
            </div>

        </Layout>
    )
}