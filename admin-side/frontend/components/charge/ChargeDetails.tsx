
"use client"

import { PreviewFile } from "@/lib/utils";
import { useState } from "react";

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
import { Button } from "../ui/button";
import Image from "next/image";
interface ChargeData {
    id: number;
    designation: string;
    date: string;
    montant: number;
    fichier?: File | string | PreviewFile | null;
    description?: string;
}
const DetailItem = ({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) => (
    <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-base font-medium text-gray-800 dark:text-white">{value}</p>
    </div>
);


export default function ChargeDetails({ initialData }: { initialData: ChargeData }) {
    const [showFileModal, setShowFileModal] = useState(false);
    const file = initialData.fichier as PreviewFile;
    return (
        <div className="flex flex-col gap-2">
            <div className="bg-background shadow rounded-xl p-6 space-y-4 dark:border-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem label="Designation" value={initialData.designation} />
                    <DetailItem label="Montant" value={`${initialData.montant} DH`} />
                    <DetailItem label="Date" value={initialData.date} />
                </div>
                <div className="w-full h-0.5 my-4 border" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <div
                    className="bg-muted border border-input text-muted-foreground rounded-md p-3 text-sm whitespace-pre-wrap"
                >
                    {initialData.description || "—"}
                </div>
            </div>
            {initialData.fichier && <div className="bg-background shadow rounded-xl p-6 space-y-4 dark:border-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fichier</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`relative rounded-md items-center flex gap-4 min-w-fit ${file.type === "image" ? "w-fit" : "w-full"}`} onClick={() => setShowFileModal(true)}>
                        {file.type === "image" ? (
                            <Image
                                src={file.url}
                                alt="Preview"
                                width={128} // adjust based on your layout (h-32 = 8rem = 128px)
                                height={128}
                                className="object-cover rounded"
                            />

                        ) : (
                            <div className="cursor-pointer hover:bg-red-500/90 flex items-center gap-2 w-full py-3 px-4 rounded-lg h-[60px] bg-red-500/70 text-white">
                                <div className="h-full">
                                    <Image
                                        src="/pdf-icon.svg"
                                        alt="pdf-icon"
                                        width={40} // or whatever size fits your layout
                                        height={40}
                                        className="h-full"
                                    />
                                </div>
                                <span className="text-sm">{file.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            }
            <Dialog open={showFileModal} onOpenChange={setShowFileModal}>
                <DialogContent className="min-w-[90%]">
                    <DialogHeader>
                        <DialogTitle>File Preview</DialogTitle>
                        <DialogDescription asChild>
                            <div className={`w-full h-[70vh] overflow-auto ${file?.type === "image" ? "flex justify-center items-center" : ""}`}>
                                {file?.type === "pdf" ? (
                                    <PdfViewer fileUrl={file.url} />
                                ) : (
                                    <Image
                                        src={file?.url} // fallback if missing
                                        alt="Preview"
                                        width={600} // or desired size
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
        </div>
    )
}