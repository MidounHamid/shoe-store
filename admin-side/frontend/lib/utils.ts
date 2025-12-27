import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export enum FormMode {
  CREATE = "create",
  EDIT = "edit",
  VIEW = "view",
}
// const serviceRoutes = {
//   home: { read: ["/dashboard"], create: [], update: [], delete: [] },
//   client: { read: [], create: [], update: [], delete: [] },
//   vehicule: { read: ["/vehicle/list_vehicule", "/vehicle/details/[id]"], create: ["/vehicle/create"], update: ["/vehicle/edit/[id]"], delete: [] },
//   contract: { read: [], create: [], update: [], delete: [] },
//   reservation: { read: [], create: [], update: [], delete: [] },
//   intervention: { read: [], create: [], update: [], delete: [] },
//   charge: { read: ["/charge", "/charge/[id]"], create: ["/charge/create"], update: ["/charge/[id]/edit"], delete: [] },
//   rapport: { read: [], create: [], update: [], delete: [] },
// };
export type PreviewFile = {
  url: string;
  type?: "pdf" | "image";
  name: string;
};

export function formatFrenchDate(inputDate: string): string {
  if (!inputDate) return ""

  const dateObj = new Date(inputDate.replace(" ", "T")) // Ensure valid ISO string

  if (isNaN(dateObj.getTime())) return "Date invalide"

  return format(dateObj, "dd MMMM yyyy 'à' HH:mm", { locale: fr })
}

export function handleRangeSelection(
  range: DateRange | undefined,
  selecting: "from" | "to",
  current: DateRange | undefined,
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>,
  closePopover?: () => void
) {
  if (!range) return;

  if (selecting === "from") {
    //this solved two main bugs 
    //1. the calender treats anything bigger than start as the end
    //2. when start and end are equal it's treated like one day not range as one day
    //which make it impossible to choose a period afterward IDK why so I used if to solve it
    const newStart = range.to === current?.to ? range.from : range.to;
    if (current?.to && newStart && newStart > current.to) return;
    
    if (range.to === range.from) {
      setDate({
        from: range.from,
        to: range.to
      })
    } else {
      setDate({
        from: newStart ?? new Date(),
        to: current?.to && current.to > (range.from ?? new Date()) ? current.to : undefined,
      });
    }
  } else {
    if (current?.from && range.from && range.from < current.from) return;

    setDate({
      from: current?.from,
      to: range.to ?? new Date(),
    });
  }

  if (
    (selecting === "to" && current?.from && range.to) ||
    (selecting === "from" && range.from && current?.to)
  ) {
    closePopover?.();
  }
}
