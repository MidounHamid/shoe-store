"use client"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormMode } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";
import { useCallback, useEffect, useState } from "react";
const services = ["home", "client", "vehicule", "visite", "contract", "reservation", "intervention", "charge", "rapport","retour_contract", "assurance", "vidange", "vignette", 'reservation_online', 'mail', 'settings'];

interface RoleData {
    id: number,
    name: string,
    permissions: PermissionData[]
}

type PermissionType = "read" | "create" | "update" | "delete";

interface PermissionData {
    service: string,
    read: boolean,
    create: boolean,
    update: boolean,
    delete: boolean
}
const permissionSchema = z.object({
    service: z.enum(services as [string, ...string[]]),
    read: z.boolean(),
    create: z.boolean(),
    update: z.boolean(),
    delete: z.boolean(),
});

const formSchema = z.object({
    name: z.string().min(1).max(255),
    permissions: z.array(permissionSchema).length(services.length),
})


const FORM_FIELDS = [
    { name: "name", label: "Nom de role", required: true, type: "text" },
]

type RoleFormProps = {
    formMode?: FormMode,
    defaultValues?: RoleData;
    onSuccess?: () => void;
};



export default function RoleForm({
    formMode,
    defaultValues,
    onSuccess
}: RoleFormProps) {
    const [allSelected, setAllSelected] = useState(false);
    const fieldsDisabled= formMode == FormMode.VIEW
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            permissions: services.map(service => ({
                service,
                read: false,
                create: false,
                update: false,
                delete: false,
                // ...defaultValues
            })),
        }
    })

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                name: defaultValues.name,
                permissions: services.map(service => {
                    const match = defaultValues.permissions.find(p => p.service === service);
                    return {
                        service,
                        read: !!match?.read,
                        create: !!match?.create,
                        update: !!match?.update,
                        delete: !!match?.delete,
                    };
                })
            });
        }
    }, [defaultValues, form]);
    const handleSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        const isEditMode = formMode === FormMode.EDIT;
        const roleId = defaultValues?.id;
        const url = isEditMode ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/roles/${roleId}` : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/roles`;
        const token = getAuthToken();
        const formData = new FormData();

        try {
            Object.entries(values).forEach(([key, value]) => {
                if (key === "permissions") {
                    formData.append("permissions", JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
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
                permissions: services.map(service => ({
                    service,
                    read: false,
                    create: false,
                    update: false,
                    delete: false,
                    // ...defaultValues
                })),
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
                <div className="grid grid-cols-1 gap-6">
                    {FORM_FIELDS.map(({ name, label, required, type }) => (
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
                                            type={type}
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                            }}
                                            value={field.value as string?? ""}
                                        // disabled={loading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                    <div className="flex items-center justify-between">
                        <Label>Permissions</Label>
                        <Button
                            type="button"
                            variant="outline"
                            className="text-xs"
                            onClick={() => {
                                const newValue = !allSelected;
                                setAllSelected(newValue);

                                form.setValue("permissions", services.map(service => ({
                                    service,
                                    read: newValue,
                                    create: (service === "home" || service === "rapport") ? false : newValue,
                                    update: (service === "home" || service === "rapport") ? false : newValue,
                                    delete: (service === "home" || service === "rapport") ? false : newValue,
                                })));
                            }}
                        >
                            {allSelected ? "Deselect All" : "Select All"}
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>Read</TableHead>
                                <TableHead>Create</TableHead>
                                <TableHead>Update</TableHead>
                                <TableHead>Delete</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((service, index) => (
                                <TableRow key={service}>
                                    <TableCell className="font-medium capitalize">{service}</TableCell>

                                    {(["read", "create", "update", "delete"] as PermissionType[]).map((perm) => (
                                        <TableCell key={perm}>
                                            <FormField
                                                control={form.control}
                                                name={`permissions.${index}.${perm}` as const}
                                                render={({ field }) => (
                                                    <FormControl>
                                                        <Checkbox
                                                            disabled={fieldsDisabled || ((service === "home" || service === "rapport") && perm !== "read") || loading}
                                                            checked={((service === "home" || service === "rapport") && perm !== "read") ? false : !!field.value}
                                                            onCheckedChange={(checked) => {
                                                                if ((service === "home" || service === "rapport") && perm !== "read") return;

                                                                const path = `permissions.${index}` as const;

                                                                const currentValues = form.getValues(path);

                                                                // When changing "read"
                                                                if (perm === "read") {
                                                                    // If disabling "read", also disable all actions
                                                                    if (!checked) {
                                                                        form.setValue(path, {
                                                                            ...currentValues,
                                                                            read: false,
                                                                            create: false,
                                                                            update: false,
                                                                            delete: false,
                                                                        });
                                                                    } else {
                                                                        form.setValue(`${path}.read`, true);
                                                                    }
                                                                }

                                                                // When changing "create", "update", "delete"
                                                                else {
                                                                    if (checked) {
                                                                        // Auto-enable read if one of the others is turned on
                                                                        form.setValue(path, {
                                                                            ...currentValues,
                                                                            [perm]: true,
                                                                            read: true,
                                                                        });
                                                                    } else {
                                                                        // Just disable the current action
                                                                        form.setValue(`${path}.${perm}`, false);
                                                                    }
                                                                }
                                                            }}
                                                            className="w-4 h-4"
                                                        />
                                                    </FormControl>
                                                )}
                                            />
                                        </TableCell>
                                    ))}

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </div>

                {formMode !== FormMode.VIEW && <Button type="submit" disabled={loading}>
                    {loading === true ? "...Traitement en cours" : formMode === FormMode.EDIT ? "Modifier" : "Créer"}
                </Button>}

            </form>
        </Form>
    )
}