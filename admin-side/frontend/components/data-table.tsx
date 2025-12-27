"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Eye,
  Edit,
  Ban,
  Shield,
  Plus,
  ChevronDown,
  MoreHorizontal,
  Printer,
  Repeat,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  searchColumn?: string;
  searchPlaceholder?: string;
  title?: string;
  onViewDetails?: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onPrint?: (row: TData) => void;
  onDeleteRows?: (ids: number[]) => void;
  onBlock?: (row: TData) => void;
  customActions?: (row: TData) => React.ReactNode;
  initialColumnVisibility?: VisibilityState;
  isBlockedList?: boolean;
  onAddRow?: () => void;
  onAddRowButton?: () => void;
  onRowClick?: (row: Row<TData>) => void;
  onConvert?: (row: TData) => void;
  service?: string;
  serviceName?: string;
  isDataTable?: boolean;
  activeRowIndex?: number[];
  defaultPageSize?: number;

  onConfirm?: (id: number) => void;
  onCancel?: (id: number) => void;
}
type Permission = {
  service: string;
  read?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
};

export default function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  searchColumn,
  searchPlaceholder = "Search...",
  title,
  onViewDetails,
  onEdit,
  onDelete,
  onPrint,
  onDeleteRows,
  onBlock,
  customActions,
  initialColumnVisibility = {},
  isBlockedList = false,
  onAddRow,
  onAddRowButton,
  onConvert,
  service,
  isDataTable = true,
  onRowClick,
  activeRowIndex,
  defaultPageSize,
  serviceName,
  onConfirm,
  onCancel,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: defaultPageSize ?? 10,
  });

  const { user } = useAuth();
  const [servicePermissions, setServicePermissions] = React.useState({
    read: true,
    create: true,
    update: true,
    delete: true,
  });

  React.useEffect(() => {
    if (!service || !user?.role?.permissions) return;

    const match = user.role.permissions.find(
      (p: Permission) => p.service === service
    );
    if (match) {
      setServicePermissions({
        read: !!match.read,
        create: !!match.create,
        update: !!match.update,
        delete: !!match.delete,
      });
    } else {
      setServicePermissions({
        read: false,
        create: false,
        update: false,
        delete: false,
      });
    }
  }, [user, service]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onPaginationChange: setPagination,
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        {onAddRowButton && servicePermissions.create && (
          <Button
            onClick={() => {
              onAddRowButton();
            }}
            variant={"default"}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter {serviceName ?? service}
          </Button>
        )}
      </div>

      <div className="flex items-center py-4">
        {searchColumn && (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}

        {onDeleteRows &&
          servicePermissions.delete &&
          table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              variant="ghost"
              className="ml-4"
              onClick={() => {
                const selectedIds = table
                  .getFilteredSelectedRowModel()
                  .rows.map(
                    (row) => (row.original as TData & { id: number })?.id
                  );
                onDeleteRows(selectedIds);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer sélection
            </Button>
          )}

        {onAddRow && servicePermissions.create && (
          <Button variant="ghost" className="ml-4" onClick={onAddRow}>
            <Plus className="h-4 w-4" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
              Colonnes <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuItem
                  key={column.id}
                  onClick={() =>
                    column.toggleVisibility(!column.getIsVisible())
                  }
                  className="capitalize flex items-center"
                >
                  <Checkbox
                    checked={column.getIsVisible()}
                    onCheckedChange={() =>
                      column.toggleVisibility(!column.getIsVisible())
                    }
                    className="mr-2"
                  />
                  {column.id}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Chargement...</span>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <TableHead>
                    {isDataTable && (
                      <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) =>
                          table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                      />
                    )}
                  </TableHead>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <ArrowUp className="w-3 h-3" />
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <ArrowDown className="w-3 h-3" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead />
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      activeRowIndex?.includes(row.index)
                        ? "bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <TableCell>
                      {isDataTable && (
                        <Checkbox
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) =>
                            row.toggleSelected(!!value)
                          }
                          aria-label="Select row"
                        />
                      )}
                    </TableCell>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                    {isDataTable && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {customActions && customActions(row.original)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>

                              {onConfirm &&
                                (row.original as { status: string }).status !== "confirmed" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      onConfirm((row.original as { id: number }).id)
                                    }
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Confirmer
                                  </DropdownMenuItem>
                                )}


                              {onViewDetails && (
                                <DropdownMenuItem
                                  onClick={() => onViewDetails(row.original)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir Détails
                                </DropdownMenuItem>
                              )}

                              {onPrint && servicePermissions.read && (
                                <DropdownMenuItem
                                  onClick={() => onPrint(row.original)}
                                >
                                  <Printer className="mr-2 h-4 w-4" />
                                  Imprimer
                                </DropdownMenuItem>
                              )}

                              {onEdit && servicePermissions.update && (row.original as { statut: string }).statut !== "terminee" && (
                                <DropdownMenuItem
                                  onClick={() => onEdit(row.original)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                              )}

                              {onBlock && (
                                <DropdownMenuItem
                                  onClick={() => onBlock(row.original)}
                                >
                                  {isBlockedList ? (
                                    <>
                                      <Shield className="mr-2 h-4 w-4" />
                                      Débloquer
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="mr-2 h-4 w-4" />
                                      Bloquer
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              {onConvert &&
                                (row.original as { statut: string }).statut === "en cours" && (
                                  <DropdownMenuItem onClick={() => onConvert(row.original)}>
                                    <Repeat className="mr-2 h-4 w-4" />
                                    Convertir
                                  </DropdownMenuItem>
                                )}


                              {onCancel &&
                                (row.original as { status: string }).status !== "Annulé" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      onCancel((row.original as { id: number }).id)
                                    }
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Annuler
                                  </DropdownMenuItem>
                                )}


                              
                              {onDelete && servicePermissions.delete && (row.original as { statut: string }).statut !== "terminee" && (
                                <DropdownMenuSeparator />
                              )}

                              {onDelete && servicePermissions.delete && (row.original as { statut: string }).statut !== "terminee" && (
                                <DropdownMenuItem
                                  onClick={() => onDelete(row.original)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 2}
                    className="h-24 text-center"
                  >
                    {isBlockedList
                      ? `Aucun ${service ? service : "objet"} bloqué.`
                      : `Aucun ${service ? service : "objet"} trouvé.`}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-end space-x-2 py-4">
        {isDataTable && (
          <div className="text-sm text-muted-foreground flex-1">
            {table.getFilteredSelectedRowModel().rows.length} sur{" "}
            {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
          </div>
        )}
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
