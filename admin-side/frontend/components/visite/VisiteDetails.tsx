"use client"
import { PreviewFile } from "@/lib/utils"
import { Badge } from "../ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";
import PdfViewer from "../pdf-viewer";
import { Button } from "../ui/button";
import Image from "next/image";


interface VisiteData {
    id: number,
    vehicule_id: string,
    date: string,
    prix: number,
    kilometrage_actuel: number,
    kilometrage_prochain: number,
    fichier?: File[] | string[] | PreviewFile[] | null,
    description?: string
    availableVehicules: { id: number, name: string, matricule: string }[]
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

function isPreviewFile(file: PreviewFile | string | undefined): file is PreviewFile {
    return typeof file === "object" && file !== null && "url" in file && "name" in file;
}

export default function VisiteDetails({ initialData }: { initialData: VisiteData }) {
    const [openedFile, setOpenedFile] = useState<string | null>(null);
    return (
        <div className="flex flex-col gap-2">
            <div className="bg-background shadow rounded-xl p-6 space-y-4 dark:border-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Véhicule</p>
                        {(() => {
                            const vehicule = initialData.availableVehicules.find(
                                (v) => v.id.toString() === initialData.vehicule_id.toString()
                            );
                            return vehicule ? (
                                <p className="text-base font-medium text-gray-800 dark:text-white flex items-center gap-2">
                                    {vehicule.name}
                                    <Badge variant={"secondary"}>
                                        {vehicule.matricule}
                                    </Badge>
                                </p>
                            ) : (
                                <p className="text-base italic text-gray-500 dark:text-gray-400">Véhicule inconnu</p>
                            );
                        })()}
                    </div>
                    <DetailItem label="Montant" value={`${initialData.prix} DH`} />
                    <DetailItem label="Date" value={initialData.date} />
                    <DetailItem label="Kilometre actuel" value={initialData.kilometrage_actuel} />
                    <DetailItem label="Kilometre prochain" value={initialData.kilometrage_prochain} />
                </div>
                <div className="w-full h-0.5 my-4 border" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <div className="bg-muted border border-input text-muted-foreground rounded-md p-3 text-sm whitespace-pre-wrap">
                    {initialData.description || "—"}
                </div>
            </div>
            {initialData.fichier && <div className="bg-background shadow rounded-xl p-6 space-y-4 dark:border-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Documents</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(initialData.fichier as (PreviewFile | undefined)[])
                        .filter((file): file is PreviewFile => isPreviewFile(file))
                        .map((file, index) => {


                            return (
                                <div
                                    key={file.url + index}
                                    className="relative rounded-md flex items-center gap-4 w-full"
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
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
            }
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
        </div>
    )
}