"use client"

import { useEffect, useState } from "react"
import DataTable from "../data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useForm } from "react-hook-form"
import { getAuthToken } from "@/lib/auth"

export interface Equipment {
    id: number
    name: string
    price_per_day: string
    created_at?: string
    updated_at?: string
}

export const equipmentColumns: ColumnDef<Equipment>[] = [
    {
        accessorKey: "name",
        header: "Nom",
        cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
        accessorKey: "price_per_day",
        header: "Prix / jour (DH)",
        cell: ({ row }) => <div>{row.original.price_per_day} DH</div>,
    },
];

export default function EquipmentHandling() {
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
    const [loading, setLoading] = useState(true)


    const [viewItem, setViewItem] = useState<Equipment | null>(null)
    const [editItem, setEditItem] = useState<Equipment | null>(null)
    const [addItem, setAddItem] = useState<boolean>(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);


    useEffect(() => {
        const fetchEquipments = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/equipment`)
                const data = await res.json()
                setEquipmentList(data)
            } catch (error) {
                console.error("Failed to fetch equipment:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchEquipments()
    }, [])

    const updateEquipmentLocally = (updated: Equipment) => {
        setEquipmentList((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
        )
    }
    const createEquipmentLocally = (created: Equipment) => {
        setEquipmentList((prev) => [...prev, created])
    }
    const handleDelete = (equipment: Equipment) => {
        setEquipmentToDelete(equipment);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!equipmentToDelete) return;

        try {
            const token = getAuthToken();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/equipment/${equipmentToDelete.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Échec de la suppression");
            }

            setEquipmentList((prev) => prev.filter((v) => v.id !== equipmentToDelete.id));
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        } finally {
            setOpenDeleteDialog(false);
            setEquipmentToDelete(null);
        }
    };

    return (
        <div>
            <DataTable
                columns={equipmentColumns}
                data={equipmentList}
                loading={loading}
                searchColumn="name"
                searchPlaceholder="Rechercher un équipement"
                title="Liste des équipements"
                service="settings"
                serviceName="équipement"
                onViewDetails={(row) => setViewItem(row)}
                onEdit={(row) => setEditItem(row)}
                onAddRow={() => { setAddItem(true) }}
                onDelete={handleDelete}
            />

            <ViewDetailsModal
                open={!!viewItem}
                onClose={() => setViewItem(null)}
                equipment={viewItem}
            />

            <EditEquipmentModal
                open={!!editItem}
                onClose={() => setEditItem(null)}
                equipment={editItem}
                onUpdate={updateEquipmentLocally}
            />
            <CreateEquipmentModal
                open={!!addItem}
                onClose={() => setAddItem(false)}
                onCreate={createEquipmentLocally}
            />
            <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">
                            Confirmer la suppression
                        </DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer le véhicule{" "}
                            <strong>{equipmentToDelete?.name}</strong> ? Cette action est
                            irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOpenDeleteDialog(false);
                                setEquipmentToDelete(null);
                            }}
                        >
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Oui, supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div >
    )
}


interface ViewProps {
    open: boolean
    onClose: () => void
    equipment: Equipment | null
}

function ViewDetailsModal({ open, onClose, equipment }: ViewProps) {
    if (!equipment) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Détails de l&apos;équipement</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <p><strong>Nom:</strong> {equipment.name}</p>
                    <p><strong>Prix par jour:</strong> {equipment.price_per_day} DH</p>
                    <p><strong>Créé le:</strong> {equipment.created_at}</p>
                    <p><strong>Mis à jour le:</strong> {equipment.updated_at}</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}


interface Props {
    open: boolean
    onClose: () => void
    equipment?: Equipment | null
    onUpdate?: (updated: Equipment) => void
    onCreate?: (created: Equipment) => void
}

type EquipmentFormData = {
    name: string;
    price_per_day: string;
};



export function CreateEquipmentModal({ open, onClose, onCreate }: Props) {
    const { register, handleSubmit } = useForm<EquipmentFormData>({
        defaultValues: {
            name: "",
            price_per_day: "",
        },
    })

    const onSubmit = async (data: EquipmentFormData) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/equipment`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(data),
        })

        if (res.ok) {
            const updated = await res.json()
            if (onCreate) onCreate(updated)
            onClose()
        } else {
            console.error("Update failed")
        }
    }


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier l&apos;équipement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input {...register("name")} placeholder="Nom de l'équipement" />
                    <Input {...register("price_per_day")} placeholder="Prix par jour" type="number" step="0.01" />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
                        <Button type="submit">Enregistrer</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )


}

export function EditEquipmentModal({ open, onClose, equipment, onUpdate }: Props) {
    const { register, handleSubmit, reset } = useForm<EquipmentFormData>({
        defaultValues: {
            name: equipment?.name || "",
            price_per_day: equipment?.price_per_day || "",
        },
    })

    useEffect(() => {
        if (equipment) {
            reset({
                name: equipment.name,
                price_per_day: equipment.price_per_day,
            })
        }
    }, [equipment, reset])

    const onSubmit = async (data: EquipmentFormData) => {
        if (!equipment) return
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/equipment/${equipment.id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(data),
        })

        if (res.ok) {
            const updated = await res.json()
            if (onUpdate) onUpdate(updated)
            onClose()
        } else {
            console.error("Update failed")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier l&apos;équipement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input {...register("name")} placeholder="Nom de l'équipement" />
                    <Input {...register("price_per_day")} placeholder="Prix par jour" type="number" step="0.01" />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
                        <Button type="submit">Enregistrer</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}