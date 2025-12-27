"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, X } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";
import { FormMode } from "@/lib/utils";

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
// import { Badge } from "../ui/badge";
import { fr } from "date-fns/locale";
import Image from "next/image";
import { VehicleSelect } from "../ui/vehicle-select";

interface VisiteData {
    id: number;
    vehicule_id: string;
    date: string;
    prix: number;
    kilometrage_actuel: number;
    kilometrage_prochain: number;
    fichier?: File[] | string[] | PreviewFile[] | null;
    description?: string;
    availableVehicules: { id: number; name: string; matricule: string }[];
}

type VisiteFormProps = {
    formMode: FormMode;
    defaultValues?: VisiteData | null;
    onSuccess?: () => void;
};



const FORM_FIELDS = [
    { name: "vehicule_id", label: "Vehicule", required: true, type: "select" },
    { name: "date", label: "Date", required: true, type: "date" },
    { name: "prix", label: "Prix", required: true, type: "number" },
    {
        name: "kilometrage_actuel",
        label: "Kilometrage actuel",
        required: true,
        type: "number",
    },
    {
        name: "kilometrage_prochain",
        label: "Kilometrage prochain",
        required: true,
        type: "number",
    },
    { name: "fichier", label: "Fichier", required: false, type: "file" },
    {
        name: "description",
        label: "Description",
        required: false,
        type: "textarea",
    },
];

type PreviewFile = {
    url: string;
    name: string;
};

export default function VisiteForm({
    formMode,
    defaultValues,
    onSuccess,
}: VisiteFormProps) {
    const [openedFile, setOpenedFile] = useState<string | null>(null);
    const [availableVehicules, setAvailableVehicules] = useState<
        { id: number; name: string; matricule: string }[]
    >([]);
    const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
    const [originalFilesLength, setOriginalFilesLength] = useState(0);
    const [deletedFiles, setDeletedFiles] = useState<string[]>([]);

    const fieldsDisabled = formMode == FormMode.VIEW;
    // const [showFileModal, setShowFileModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const formSchema = z
        .object({
            vehicule_id: z.string().min(1),
            // date: z.date(),
            date: z.date().refine((val) => {
                if (formMode === FormMode.CREATE) {
                    return val >= today;
                } else if (formMode === FormMode.EDIT && defaultValues?.date) {
                    const min = new Date(defaultValues.date);
                    min.setHours(0, 0, 0, 0);
                    return val >= min;
                }
                return true;
            }, {
                message: "Date doit etre supérieur d'aujourd'hui ou de date par defaut.",
            }),

            prix: z.number().min(1),
            kilometrage_actuel: z.number().min(0),
            kilometrage_prochain: z.number().min(0),
            fichier: z.any().optional().nullable(),
            description: z.string().optional().nullable(),
        })
        .superRefine((data, ctx) => {
            if (data.kilometrage_prochain <= data.kilometrage_actuel) {
                ctx.addIssue({
                    path: ["kilometrage_prochain"],
                    code: z.ZodIssueCode.custom,
                    message: "Kilométrage prochain doit etre plus grand actuel",
                });
            }
        });




    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vehicule_id: "",
            date: new Date(),
            prix: 0.0,
            kilometrage_actuel: 0.0,
            kilometrage_prochain: 0.0,
            fichier: null,
            description: "",
        },
    });

    useEffect(() => {
        if (defaultValues && defaultValues?.fichier) {
            setPreviewFiles(defaultValues.fichier as PreviewFile[]);
            setOriginalFilesLength(defaultValues.fichier.length);
        }
        if (defaultValues && defaultValues.availableVehicules) {
            setAvailableVehicules(defaultValues.availableVehicules);
        }
    }, [defaultValues]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newPreviews = files.map((file) => ({
            url: URL.createObjectURL(file),
            name: file.name,
        }));
        setPreviewFiles((prev) => [...prev, ...newPreviews]);
        form.setValue("fichier", [...(form.getValues("fichier") || []), ...files]);
    };

    const handleDeleteFile = (index: number) => {
        const updatedPreviews = [...previewFiles];
        URL.revokeObjectURL(updatedPreviews[index].url);
        updatedPreviews.splice(index, 1);
        setPreviewFiles(updatedPreviews);
        if (index < originalFilesLength) {
            setDeletedFiles((prev) => [...prev, previewFiles[index].name]);
            setOriginalFilesLength((prev) => prev - 1);
        }

        const currentFiles = form.getValues("fichier") || [];
        currentFiles.splice(index, 1);
        form.setValue("fichier", currentFiles);
    };
    const handleSubmit = useCallback(
        async (values: z.infer<typeof formSchema>) => {
            setLoading(true);
            try {
                const formData = new FormData();
                Object.entries(values).forEach(([key, value]) => {
                    if (key === "fichier") {
                        const fichiers = values.fichier as File[];
                        if (Array.isArray(fichiers)) {
                            const newFilesOnly = fichiers.slice(originalFilesLength);
                            newFilesOnly.forEach((file) => {
                                formData.append("fichier[]", file);
                            });
                        }
                    } else if (key === "date" && value !== null && value !== undefined) {
                        // console.log("Appnding date : " + format(value, 'yyyy-MM-dd'))
                        formData.append("date", format(value, "yyyy-MM-dd"));
                    } else if (key === "prix" && value !== null && value !== undefined) {
                        formData.append("prix", Number(value).toString());
                    } else if (value !== null && value !== undefined) {
                        formData.append(key, value.toString());
                    }
                });
                deletedFiles.forEach((name) => {
                    formData.append("deleted_files[]", name);
                });

                // if (deleteFile) {
                //     formData.append("delete_file", "1");
                // }
                console.log("==========================");
                for (const [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }
                console.log("==========================");

                const token = getAuthToken();
                const isEditMode = formMode === FormMode.EDIT;
                const chargeId = defaultValues?.id;
                const url = isEditMode
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/visites/${chargeId}`
                    : `${process.env.NEXT_PUBLIC_API_URL}/api/visites`;
                if (isEditMode) formData.append("_method", "PUT");
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    body: formData,
                });

                const result = await response.json();

                if (!response.ok) {
                    setLoading(false);
                    throw new Error(
                        result.message || `HTTP error! status: ${response.status}`
                    );
                }
                if (onSuccess) onSuccess();
                form.reset({
                    vehicule_id: "",
                    date: new Date(),
                    prix: 0.0,
                    kilometrage_actuel: 0.0,
                    kilometrage_prochain: 0.0,
                    fichier: null,
                    description: "",
                });
                // setDeleteFile(false);
                const fileInput = document.querySelector(
                    'input[type="file"]'
                ) as HTMLInputElement;
                if (fileInput) fileInput.value = "";
                if (previewFiles && previewFiles.length > 0) {
                    previewFiles.forEach((file) => {
                        if (file.url) {
                            URL.revokeObjectURL(file.url);
                        }
                    });
                    setPreviewFiles([]); // Clear them after revoking
                }
            } catch (error) {
                console.error("Submission error:", error);
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Submission failed",
                    variant: "destructive",
                });
            }
            setLoading(false);
        },
        [previewFiles, defaultValues, deletedFiles, form, formMode, onSuccess, originalFilesLength]
    );
    useEffect(() => {
        if (defaultValues) {
            form.reset({
                vehicule_id: defaultValues.vehicule_id.toString(),
                date: defaultValues.date ? new Date(defaultValues.date) : new Date(),
                prix: defaultValues.prix,
                kilometrage_actuel: defaultValues.kilometrage_actuel,
                kilometrage_prochain: defaultValues.kilometrage_prochain,
                fichier: defaultValues.fichier,
                description: defaultValues.description,
            });
        }
    }, [availableVehicules, defaultValues, form]);
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-8"
                encType="multipart/form-data"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {FORM_FIELDS.map(({ name, label, required, type }) => (
                        <FormField
                            key={name}
                            control={form.control}
                            name={name as keyof z.infer<typeof formSchema>}
                            render={({ field }) => (
                                <FormItem
                                    className={type === "textarea" ? "md:col-span-2" : ""}
                                >
                                    <FormLabel>
                                        {label}{" "}
                                        {required && <span className="text-red-500">*</span>}
                                    </FormLabel>

                                    {type === "text" || type === "number" ? (
                                        <FormControl>
                                            <Input
                                                readOnly={fieldsDisabled}
                                                type={type}
                                                placeholder={formMode === FormMode.VIEW ? "" : label}
                                                {...field}
                                                onChange={(e) => {
                                                    const value =
                                                        type === "number" && e.target.value !== ""
                                                            ? Number(e.target.value)
                                                            : e.target.value;
                                                    field.onChange(value);
                                                }}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                    ) : type === "textarea" ? (
                                        <FormControl>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={
                                                        formMode === FormMode.VIEW
                                                            ? ""
                                                            : "Enter charge description"
                                                    }
                                                    className="min-h-[100px]"
                                                    readOnly={fieldsDisabled}
                                                    {...field}
                                                    value={field.value ?? ""}
                                                />
                                            </FormControl>
                                        </FormControl>
                                    ) : type === "select" ? (
                                        // <Select onValueChange={field.onChange} value={field.value}>
                                        //     <FormControl>
                                        //         <SelectTrigger
                                        //             className="w-full"
                                        //             disabled={fieldsDisabled || loading}
                                        //         >
                                        //             <SelectValue
                                        //                 placeholder="Sélectionner un véhicule"
                                        //                 className="truncate"
                                        //             >
                                        //                 {
                                        //                     availableVehicules.find(
                                        //                         (v) => v.id.toString() === field.value
                                        //                     )?.name
                                        //                 }
                                        //                 {" - "}
                                        //                 {
                                        //                     availableVehicules.find(
                                        //                         (v) => v.id.toString() === field.value
                                        //                     )?.matricule
                                        //                 }
                                        //             </SelectValue>
                                        //         </SelectTrigger>
                                        //     </FormControl>
                                        //     <SelectContent className="max-h-60 overflow-auto">
                                        //         {availableVehicules
                                        //             .slice()
                                        //             .sort((a, b) => a.id - b.id)
                                        //             .map((role) => (
                                        //                 <SelectItem
                                        //                     key={role.id}
                                        //                     value={role.id.toString()}
                                        //                 >
                                        //                     <span>{role.name}</span>
                                        //                     <Badge variant={"secondary"}>
                                        //                         {role.matricule}
                                        //                     </Badge>
                                        //                 </SelectItem>
                                        //             ))}
                                        //     </SelectContent>
                                        // </Select>
                                        <VehicleSelect
                                            vehicles={availableVehicules}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={loading}
                                            placeholder="Rechercher et sélectionner un véhicule..."
                                        />
                                    ) : type === "date" ? (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        // disabled={fieldsDisabled}
                                                        variant={"outline"}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>Selectionner la date</span>
                                                        )}

                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                {!fieldsDisabled && (
                                                    <Calendar
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

                                                    />
                                                )}
                                            </PopoverContent>
                                        </Popover>
                                    ) : type === "file" ? (
                                        <FormControl>
                                            <div className="flex flex-col gap-4">
                                                {formMode !== FormMode.VIEW && (
                                                    <Input
                                                        type="file"
                                                        multiple
                                                        accept="application/pdf"
                                                        disabled={fieldsDisabled}
                                                        onChange={handleFileChange}
                                                    />
                                                )}

                                                {previewFiles.length > 0 && (
                                                    <div className="flex flex-col gap-2">
                                                        {previewFiles.map((file, index) => (
                                                            <div
                                                                key={file.url + index}
                                                                className={`relative rounded-md items-center flex gap-4 min-w-fit w-full`}
                                                                onClick={() => setOpenedFile(file.url)}
                                                            >
                                                                <div className="cursor-pointer hover:bg-red-500/90 flex items-center gap-2 w-full py-3 px-4 rounded-lg h-[60px] bg-red-500/70 text-white">
                                                                    <Image
                                                                        src="/pdf-icon.svg"
                                                                        alt="pdf icon"
                                                                        title="pdf-icon"
                                                                        className="h-full"
                                                                        width={24}
                                                                        height={24}
                                                                    />
                                                                    <span className="text-sm">{file.name}</span>
                                                                    {formMode !== FormMode.VIEW && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteFile(index);
                                                                            }}
                                                                            className="absolute top-1 right-1 text-white rounded-full p-1 transition-colors"
                                                                            aria-label="Delete image"
                                                                        //disabled={loading}
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                    ) : (
                                        <div className="text-muted-foreground italic">
                                            placeholder
                                        </div>
                                    )}

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
                {formMode !== FormMode.VIEW && (
                    <Button type="submit" disabled={loading}>
                        {loading === true
                            ? "...Traitement en cours"
                            : formMode === FormMode.EDIT
                                ? "Modifier"
                                : "Créer"}
                    </Button>
                )}
            </form>
            <Dialog open={!!openedFile} onOpenChange={() => setOpenedFile(null)}>
                <DialogContent className="min-w-[90%]">
                    <DialogHeader>
                        <DialogTitle>File Preview</DialogTitle>
                        <DialogDescription asChild>
                            <div className={`w-full h-[70vh] overflow-auto`}>
                                {openedFile && <PdfViewer fileUrl={openedFile} />}
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
    );
}
