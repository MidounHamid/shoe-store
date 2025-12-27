"use client"


import { useRouter } from 'next/navigation'
import { Eye } from 'lucide-react'
import { Badge } from '../ui/badge'
// import { parseISO } from 'date-fns'
import { formatFrenchDate } from '@/lib/utils'
import DataTable from '../data-table'
// import { HighlightedCalendar } from '../highlighted-calendar'
import { ColumnDef, /*Row*/ } from '@tanstack/react-table'
// import { useState } from 'react'


type Log = {
    log_name: string;
    description: string;
    created_at: string; // or Date if you're parsing it
};

interface UserData {
    id: number,
    name: string,
    email: string,
    role: string
    role_id: number
    email_verified_at: string | null
    created_at: string
    updated_at: string
    activity_logs: Log[]
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

const columns: ColumnDef<Log>[] = [
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
    },
    {
        accessorKey: "log_name",
        header: "Action",
    },
    {
        accessorKey: "description",
        header: "Details",
    },
];



export default function UserDetails({ initialData }: { initialData: UserData }) {
    // const [activeDate, setActiveDate] = useState<Date | null>(null);
    // const [activeRowIndexes, setActiveRowIndexes] = useState<number[]>([]);
    const router = useRouter();

    // const uniquePeriodMap = new Map<string, Date>();
    // initialData.activity_logs.forEach((log) => {
    //     const createdAt = parseISO(log.created_at);
    //     const dayKey = createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
    //     if (!uniquePeriodMap.has(dayKey)) {
    //         uniquePeriodMap.set(dayKey, createdAt);
    //     }
    // });

    // const periods = Array.from(uniquePeriodMap.values()).map((day) => ({
    //     start: day,
    //     end: day,
    //     color: "#22c55e", // green-500
    // }));

    // const onRowClick = (row: Row<Log>) => {
    //     const clickedDate = parseISO(row.original.created_at);

    //     const isSameDate =
    //         activeDate?.toDateString() === clickedDate.toDateString();
    //     const isSameRow = activeRowIndexes.length === 1 && activeRowIndexes[0] === row.index;

    //     if (isSameDate && isSameRow) {
    //         // Deselect if the same row was clicked again
    //         setActiveDate(null);
    //         setActiveRowIndexes([]);
    //     } else {
    //         // Select the clicked row
    //         setActiveDate(clickedDate);
    //         setActiveRowIndexes([row.index]);
    //     }
    // };


    // const setActiveIndex = (index: number | null) => {
    //     console.log(index);

    //     if (index === null || index < 0 || index >= periods.length) {
    //         setActiveDate(null);
    //         setActiveRowIndexes([]);
    //         return;
    //     }

    //     const clickedDate = periods[index].start;

    //     // If the clicked date is the same as the current one, deselect
    //     if (activeDate && activeDate.toDateString() === clickedDate.toDateString()) {
    //         setActiveDate(null);
    //         setActiveRowIndexes([]);
    //     } else {
    //         setActiveDate(clickedDate);

    //         // Select all rows matching that date
    //         const matching = initialData.activity_logs.reduce<number[]>((acc, log, i) => {
    //             const logDate = parseISO(log.created_at);
    //             if (logDate.toDateString() === clickedDate.toDateString()) {
    //                 acc.push(i);
    //             }
    //             return acc;
    //         }, []);
    //         setActiveRowIndexes(matching);
    //     }
    // };



    return (
        <div className="flex flex-col gap-2">
            <div className="bg-background shadow rounded-xl p-6 space-y-4 dark:border-2">
                <h2 className='text-xl font-semibold'>Informations Principales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem label="Nom d'utilisateur" value={initialData.name} />
                    <DetailItem label="Email" value={`${initialData.email}`} />
                    <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <div className="flex items-center gap-2">
                            <p className="text-base font-medium text-gray-800 dark:text-white">{initialData.role}</p>
                            <button
                                onClick={() => router.push(`/admin/role/${initialData.role_id}`)}
                                className="cursor-pointer text-gray-500 hover:text-gray-800 transition"
                                title="Voir le rôle"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Vérification Email</p>
                        {initialData.email_verified_at ? (
                            <div className="flex items-center gap-2">
                                <p className="text-base font-medium text-gray-800 dark:text-white">
                                    {formatFrenchDate(initialData.email_verified_at)}
                                </p>
                                <Badge variant="secondary" className="text-green-700 bg-green-100 border-green-200">
                                    Vérifié
                                </Badge>
                            </div>
                        ) : (
                            <Badge variant="destructive">Non vérifié</Badge>
                        )}
                    </div>
                </div>
                <div className="w-full h-0.5 my-4 border" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem label="Créé à" value={formatFrenchDate(initialData.created_at)} />
                    <DetailItem label="Dernière Modification" value={formatFrenchDate(initialData.updated_at)} />
                </div>

            </div>
            <div className="bg-background shadow rounded-xl p-6 space-y-4 dark:border-2">
                <h2 className='text-xl font-semibold'>Activités Recents</h2>
                <div className="flex gap-6">
                    <DataTable
                        columns={columns}
                        data={initialData.activity_logs}
                        isDataTable={false}
                        defaultPageSize={5}
                        // activeRowIndex={activeRowIndexes}
                        // onRowClick={onRowClick}
                    />
                    {/* <HighlightedCalendar
                        periods={periods}
                        activeIndex={
                            activeDate ? periods.findIndex(
                                (p) => p.start.toDateString() === activeDate.toDateString()
                            )
                                : null}
                        setActiveIndex={setActiveIndex}
                    /> */}

                </div>
            </div>
        </div>  
    )
}