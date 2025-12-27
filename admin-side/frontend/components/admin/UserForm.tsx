"use client"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FormMode } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getAuthToken } from "@/lib/auth";
import { toast } from "../ui/use-toast";

interface UserData {
    id?: number,
    name: string,
    email: string,
    password?: string,
    password_confirmation?: string
    role: string
    role_id: number | null
    availableRoles: { id: number, name: string }[]
}




const createFormSchema = z.object({
    name: z.string().min(1).max(255),
    email: z.string().min(1).email(),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
    role: z.string().min(1)
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
})

const updateFormSchema = z.object({
    name: z.string().min(1).max(255),
    email: z.string().min(1).email(),
    role: z.string().min(1)
})

const FORM_FIELDS = [
    { name: "name", label: "Nom d'utilisateur", required: true, type: "text" },
    { name: "email", label: "Email d'utilisateur", required: true, type: "email" },
    { name: "password", label: "Mot de passe", required: true, type: "password" },
    { name: "password_confirmation", label: "Confirmer le mot de passe", required: true, type: "password" },

]

type UserFormProps = {
    formMode?: FormMode,
    defaultValues?: UserData;
    onSuccess?: () => void;
};


export default function UserForm({
    formMode,
    defaultValues,
    onSuccess
}: UserFormProps) {
    const [availableRoles, setAvailableRoles] = useState<{ id: number, name: string }[]>([]);
    const formSchema = formMode === FormMode.CREATE ? createFormSchema : updateFormSchema;
    const fieldsDisabled= formMode == FormMode.VIEW
    const [loading, setLoading] = useState(false);
    useEffect(()=>{
        if (defaultValues && defaultValues.availableRoles) {
            setAvailableRoles(defaultValues.availableRoles);
        }
    },[defaultValues])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
            role: "",
            
        }
    })
    
    useEffect(() => {
        if (defaultValues && formMode !== FormMode.CREATE) {
            console.log(defaultValues.role_id)
            form.reset({
                name: defaultValues.name,
                email: defaultValues.email,
                password: "",
                password_confirmation: "",
                role: defaultValues.role_id?.toString(),
            });
        }
        console.log("Form role value:", form.watch("role"));
    }, [availableRoles, form, defaultValues, formMode]);





    const handleSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        const isEditMode = formMode === FormMode.EDIT;
        const userId = defaultValues?.id;
        const url = isEditMode ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}` : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`;
        const token = getAuthToken();
        const formData = new FormData();

        try {
            Object.entries(values).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value.toString())
                }


            })
            if (isEditMode) formData.append('_method', 'PUT');
            await fetch(url, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData
            })

            if (onSuccess) onSuccess()

            form.reset({
                name: "",
                email: "",
                password: "",
                password_confirmation: "",
                role: "",
            });

        } catch (error) {
            console.error("Submission error:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Submission failed",
                variant: "destructive"
            })
        }
        setLoading(false);
    }, [defaultValues, form, formMode, onSuccess])

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-8"
                encType="multipart/form-data">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {FORM_FIELDS.map(({ name, label, required, type }) => {
                        if (formMode !== FormMode.CREATE && (name === "password" || name === "password_confirmation")) return null
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
                                                readOnly={fieldsDisabled}
                                                disabled={loading}
                                                type={type}
                                                {...field}
                                                onChange={(e) => {
                                                    const value = type === "number" && e.target.value
                                                        ? Number(e.target.value)
                                                        : e.target.value;
                                                    field.onChange(value);
                                                }}
                                                value={field.value ?? ""}
                                            // disabled={loading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )
                    })}

                    <FormField

                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role <span className="text-red-500"> *</span></FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full" disabled={fieldsDisabled || loading}>
                                            <SelectValue placeholder={
                                                "Select role"
                                            }  />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {defaultValues?.availableRoles && defaultValues?.availableRoles.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {formMode !== FormMode.VIEW && <Button type="submit" disabled={loading}>
                    {loading === true ? "...Traitement en cours" : formMode === FormMode.EDIT ? "Modifier" : "Créer"}
                </Button>}


            </form>
        </Form>
    )
}