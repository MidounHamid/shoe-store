"use client"

import { Layout } from "@/components/layouts/layout"
import EquipmentHandling from "@/components/settings/EquipmentHandler"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function SettingsPage() {
    return (
        <Layout>
            <Tabs defaultValue="equipment" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="equipment">Equipments</TabsTrigger>
                    <TabsTrigger value="coupon">Coupons</TabsTrigger>
                </TabsList>

                <TabsContent value="equipment" className="space-y-4 p-4">
                    <EquipmentHandling />
                </TabsContent>

                <TabsContent value="coupon" className="p-4">
                    Still under development
                </TabsContent>
            </Tabs>
        </Layout>
    )
}
