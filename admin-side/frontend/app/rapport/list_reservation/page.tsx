"use client"

import type React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { fr } from "date-fns/locale"
import { Layout } from "@/components/layouts/layout"

import ReservationsList from "@/components/reservation/ReservationsList"

export default function ReservationReport() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [selecting, setSelecting] = useState<"from" | "to">("from")
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Premier jour du mois actuel
    to: new Date(), // Aujourd'hui
  })
  const [period, setPeriod] = useState({
    start: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  })
  const [statusFilter, setStatusFilter] = useState<string>("tous")

  useEffect(() => {
    if (date?.from && date?.to) {
      setPeriod({
        start: format(date.from, "yyyy-MM-dd"),
        end: format(date.to, "yyyy-MM-dd"),
      })
    }
  }, [date])

  function DatePickerWithRange({ className }: React.HTMLAttributes<HTMLDivElement>) {
    return (
      <div className={cn("grid gap-2", className)}>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "d MMMM yyyy", { locale: fr })} - {format(date.to, "d MMMM yyyy", { locale: fr })}
                  </>
                ) : (
                  format(date.from, "d MMMM yyyy", { locale: fr })
                )
              ) : (
                <span>Sélectionner une période</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col">
              <div className="flex justify-center gap-2 p-2">
                <Button 
                  variant={selecting === "from" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSelecting("from")}
                >
                  Début
                </Button>
                <Button 
                  variant={selecting === "to" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSelecting("to")}
                >
                  Fin
                </Button>
              </div>
              <Calendar
                locale={fr}
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(range) => {
                  if (!range) return
                  
                  if (selecting === "from") {
                    setDate({
                      from: range.from ?? new Date(),
                      to: date?.to && date?.to > (range.from ?? new Date()) ? date?.to : undefined,
                    })
                  } else {
                    setDate({
                      from: date?.from,
                      to: range.to ?? new Date(),
                    })
                  }
                  
                  if ((selecting === "to" && date?.from && range.to) || 
                      (selecting === "from" && range.from && date?.to)) {
                    setIsPopoverOpen(false)
                  }
                }}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <Layout>
    <div className="min-h-screen p-6">
      <div className="mx-auto space-y-8">
        {/* En-tête */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Rapport des Réservations</h1>
            <p className="text-muted-foreground">
              Consultez et analysez les réservations pour la période sélectionnée
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="en cours">En cours</SelectItem>
                <SelectItem value="terminee">Terminée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange />
          </div>
        </div>

        {/* Section Réservations */}
        <div className="grid gap-4">
          <ReservationsList period={period} statusFilter={statusFilter} />
        </div>
      </div>
    </div>
  
  </Layout>
  )
}