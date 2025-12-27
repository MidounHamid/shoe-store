"use client"
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, X } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";
import { FormMode, PreviewFile } from "@/lib/utils";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import PdfViewer from "../pdf-viewer";
import { fr } from "date-fns/locale";
import Image from "next/image";


interface ChargeData {
    id: number,
    designation: string,
    date: string,
    montant: number,
    fichier?: File | string | PreviewFile | null,
    description?: string
}


type ChargeFormProps = {
    formMode: FormMode,
    defaultValues?: ChargeData;
    onSuccess?: () => void;
};

const previewFileSchema = z.object({
    url: z.string(),
    name: z.string(),
    type: z.enum(["pdf", "image"]).optional(),
});

const formSchema = z.object({
    designation: z.string().min(1, "Designation is required"),
    date: z.date(),
    montant: z.number().min(1),
    fichier: z.union([z.instanceof(File), previewFileSchema]).optional().nullable(),
    description: z.string().optional().nullable()
})

const FORM_FIELDS = [
    { name: "designation", label: "Designation", required: true, type: "text" },
    // { name: "date", label: "Date", required: true, type: "date" },
    { name: "montant", label: "Montant", required: true, type: "number" },
]

export default function ChargeForm({
    formMode,
    defaultValues,
    onSuccess
}: ChargeFormProps) {
    const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
    const fieldsDisabled = formMode == FormMode.VIEW;
    const [showFileModal, setShowFileModal] = useState(false);
    const [deleteFile, setDeleteFile] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            designation: "",
            date: new Date(),
            montant: 0,
            fichier: null,
            description: "",
        }
    })
    useEffect(() => {
        if (defaultValues) {
            if (defaultValues.fichier) setPreviewFile(defaultValues.fichier as PreviewFile);
            form.reset({
                designation: defaultValues.designation ?? "",
                date: defaultValues.date ? new Date(defaultValues.date) : new Date(),
                montant: defaultValues.montant ?? 0,
                fichier: null, // keep null to force re-selection for file
                description: defaultValues.description ?? "",
            });
        }
    }, [defaultValues, form]);

    useEffect(() => {
        return () => {
            if (previewFile?.url?.startsWith("blob:")) {
                URL.revokeObjectURL(previewFile.url);
            }
        };
    }, [previewFile?.url]);


    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            form.setValue('fichier', file)
            const fileType = file.type;
            if (fileType.startsWith("image/")) {
                setPreviewFile({ url: URL.createObjectURL(file), type: "image", name: file.name });
            } else if (fileType === "application/pdf") {
                setPreviewFile({ url: URL.createObjectURL(file), type: "pdf", name: file.name });
            }
        }
    }
    const handleDeleteFile = () => {
        if (previewFile?.url && previewFile.url.startsWith("blob:")) {
            URL.revokeObjectURL(previewFile.url); // free memory if it was a blob
        }
        setPreviewFile(null);                     // remove from preview
        form.setValue("fichier", null);           // clear react-hook-form value

        // Optional: force reset file input value if needed
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        setDeleteFile(true);
    }


    const handleSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const formData = new FormData()
            Object.entries(values).forEach(([key, value]) => {
                if (key === 'fichier' && value instanceof File) {
                    console.log("Appending file:", value)
                    formData.append('fichier', value)
                }
                else if (key === 'date' && value !== null && value !== undefined && value instanceof Date) {
                    // console.log("Appnding date : " + format(value, 'yyyy-MM-dd'))
                    formData.append('date', format(value, 'yyyy-MM-dd'))
                }
                else if (key === 'montant' && value !== null && value !== undefined) {
                    console.log("hmmmmmmmmm")
                    formData.append('montant', Number(value).toString());
                }

                else if (value !== null && value !== undefined) {
                    formData.append(key, value.toString())
                }


            })
            if (deleteFile) {
                formData.append("delete_file", "1");
            }
            console.log("==========================")
            for (const [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }
            console.log("==========================")



            const token = getAuthToken();
            const isEditMode = formMode === FormMode.EDIT;
            const chargeId = defaultValues?.id;

            const url = isEditMode
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/charges/${chargeId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/charges`;
            if (isEditMode) formData.append('_method', 'PUT');
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                setLoading(false);
                throw new Error(result.message || `HTTP error! status: ${response.status}`)

            }

            if (onSuccess) onSuccess()

            form.reset({
                designation: "",
                date: new Date(),
                montant: 0,
                fichier: null,
                description: "",
            });
            setDeleteFile(false);
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = "";
            if (previewFile?.url?.startsWith("blob:")) {
                URL.revokeObjectURL(previewFile.url);
            }
            setPreviewFile(null);
        } catch (error) {
            console.error("Submission error:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Submission failed",
                variant: "destructive"
            })
        }
        setLoading(false);
    }, [previewFile, defaultValues, deleteFile, form, formMode, onSuccess])
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-8"
                encType="multipart/form-data"
            >

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/**Designation et montant */}
                    {FORM_FIELDS.map(({ name, label, required, type }) => (
                        <FormField
                            key={name}
                            control={form.control}
                            name={name as keyof z.infer<typeof formSchema>}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{label} {required && <span className="text-red-500">*</span>}</FormLabel>
                                    <FormControl>
                                        <Input
                                            readOnly={fieldsDisabled}
                                            type={type}
                                            placeholder={formMode === FormMode.VIEW ? "" : label}
                                            {...field}
                                            onChange={(e) => {
                                                const value = type === 'number' && e.target.value !== ''
                                                    ? Number(e.target.value)
                                                    : e.target.value;
                                                field.onChange(value);
                                            }}
                                            value={
                                                typeof field.value === "string" || typeof field.value === "number"
                                                    ? field.value
                                                    : ""
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                    {/**Date field */}
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date<span className="text-red-500">*</span></FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                // disabled={fieldsDisabled}
                                                variant={"outline"}
                                            >
                                                {field.value ? (
                                                    format(field.value, "yyyy/MM/dd")
                                                ) : (
                                                    <span>Selectionner la date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        {!fieldsDisabled && <Calendar
                                            locale={fr}
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            // captionLayout="dropdown"
                                            disabled={(date) => {
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                const defaultDate = defaultValues?.date ? new Date(defaultValues.date) : null;
                                                if (defaultDate) defaultDate.setHours(0, 0, 0, 0);
                                                let minDate = today;
                                                if (formMode === FormMode.EDIT && defaultDate) {
                                                    minDate = defaultDate < today ? defaultDate : today;
                                                }
                                                return date < minDate;
                                            }}
                                        />}
                                    </PopoverContent>
                                </Popover>
                            </FormItem>
                        )}

                    />


                    {/**File field */}
                    <FormField
                        control={form.control}
                        name="fichier"
                        render={() => (
                            <FormItem>
                                <FormLabel>Fichier</FormLabel>
                                <FormControl>
                                    <div className="flex flex-col gap-4">
                                        {formMode !== FormMode.VIEW && <Input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            disabled={fieldsDisabled}
                                            onChange={handleFileChange}

                                        />}


                                        {previewFile && (
                                            <div className={`relative rounded-md items-center flex gap-4 min-w-fit ${previewFile.type === "image" ? "w-fit" : "w-full"}`} onClick={() => setShowFileModal(true)}>
                                                {previewFile.type === "image" ? (
                                                    <Image
                                                        src={previewFile.url}
                                                        alt="Preview"
                                                        width={128} // same as h-32 (8rem)
                                                        height={128}
                                                        className="object-cover rounded"
                                                    />

                                                ) : (
                                                    <div className="cursor-pointer hover:bg-red-500/90 flex items-center gap-2 w-full py-3 px-4 rounded-lg h-[60px] bg-red-500/70 text-white">
                                                        <div className="h-full">
                                                            <Image
                                                                src="/pdf-icon.svg"
                                                                alt="pdf-icon"
                                                                width={40}
                                                                height={40}
                                                                className="h-full"
                                                            />
                                                        </div>
                                                        <span className="text-sm">{previewFile.name}</span>
                                                    </div>
                                                )}
                                                {formMode !== FormMode.VIEW && <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteFile();
                                                    }}

                                                    className="absolute top-1 right-1 text-white rounded-full p-1 transition-colors"
                                                    aria-label="Delete image"
                                                //disabled={loading}
                                                >
                                                    <X size={16} />
                                                </button>}
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    {/**Description field */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={formMode === FormMode.VIEW ? "" : "Entrez la description de charge"}
                                        className="min-h-[100px]"
                                        readOnly={fieldsDisabled}
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {formMode !== FormMode.VIEW && <Button type="submit" disabled={loading}>
                    {loading === true ? "...Traitement en cours" : formMode === FormMode.EDIT ? "Modifier" : "Créer"}
                </Button>}
            </form>
            <Dialog open={showFileModal} onOpenChange={setShowFileModal}>
                <DialogContent className="min-w-[90%]">
                    <DialogHeader>
                        <DialogTitle>File Preview</DialogTitle>
                        <DialogDescription asChild>
                            <div className={`w-full h-[70vh] overflow-auto ${previewFile?.type === "image" ? "flex justify-center items-center" : ""}`}>
                                {previewFile?.type === "pdf" ? (
                                    <PdfViewer fileUrl={previewFile.url} />
                                ) : (
                                    <Image
                                        src={previewFile?.url ?? ""}
                                        alt="Preview"
                                        width={600} // approximate width
                                        height={800}
                                        className="max-h-[70vh] rounded shadow object-contain"
                                    />

                                )}
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    {/* You can put preview or controls here later */}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Form>
    )
}