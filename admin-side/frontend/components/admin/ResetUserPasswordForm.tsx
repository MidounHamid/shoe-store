"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "../ui/use-toast"
import { getAuthToken } from "@/lib/auth"
import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useParams } from "next/navigation"



const formSchema = z.object({
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
})


const FORM_FIELDS = [
    { name: "password", label: "Mot de passe", required: true, type: "password" },
    { name: "password_confirmation", label: "Confirmer le mot de passe", required: true, type: "password" },

]

export default function ResetUserPasswordForm() {
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            password_confirmation: ""
        }
    })

    const handleSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        const userId = params.id;
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reset-password/${userId}`;
        const token = getAuthToken();
        const formData = new FormData();

        try {
            Object.entries(values).forEach(([key, value]) => {
                if (key == "password" && value !== null && value !== undefined) {
                    formData.append(key, value.toString())
                }


            })
            await fetch(url, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData
            })

            toast({
                title: "Success",
                description: "Password Changed successfully!",
            });
            router.push("/admin")
            

        } catch (error) {
            console.error("Submission error:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Submission failed",
                variant: "destructive"
            })
        }
        setLoading(false);
    }, [params, router])
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-8"
                encType="multipart/form-data">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {FORM_FIELDS.map(({ name, label, required, type }) => {
                        return (
                            <FormField

                                key={name}
                                control={form.control}
                                name={name as keyof z.infer<typeof formSchema>}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {label}
                                            {required && <span className="text-red-500"> *</span>}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type={type}
                                                {...field}
                                                onChange={(e) => {
                                                    const value = type === "number" && e.target.value
                                                        ? Number(e.target.value)
                                                        : e.target.value;
                                                    field.onChange(value);
                                                }}
                                                value={field.value ?? ""}
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )
                    })}
                </div>
                <Button type="submit" disabled={loading}>
                    {loading === true ? "...Traitement en cours" : "Réinitialiser le mot de passe"}
                </Button>

            </form>
        </Form>
    )
}