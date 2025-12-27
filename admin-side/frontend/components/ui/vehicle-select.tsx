"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Check, ChevronDown, Search, Car } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type Vehicle = {
  id: number
  name: string
  matricule: string
  marque?: string
  modele?: string
  immatriculation?: string
  model?:string
}

interface VehicleSelectProps {
  vehicles: Vehicle[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function VehicleSelect({
  vehicles,
  value,
  onValueChange,
  placeholder = "Sélectionner un véhicule...",
  disabled = false,
  className,
}: VehicleSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Find selected vehicle
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id.toString() === value)

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      vehicle.name.toLowerCase().includes(searchLower) ||
      vehicle.matricule.toLowerCase().includes(searchLower) ||
      (vehicle.marque && vehicle.marque.toLowerCase().includes(searchLower)) ||
      (vehicle.modele && vehicle.modele.toLowerCase().includes(searchLower))
    )
  })

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(0)
  }, [searchQuery])

  // Focus search input when popover opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setHighlightedIndex((prev) => (prev < filteredVehicles.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredVehicles.length - 1))
          break
        case "Enter":
          e.preventDefault()
          if (filteredVehicles[highlightedIndex]) {
            onValueChange(filteredVehicles[highlightedIndex].id.toString())
            setOpen(false)
            setSearchQuery("")
          }
          break
        case "Escape":
          e.preventDefault()
          setOpen(false)
          setSearchQuery("")
          break
      }
    },
    [open, filteredVehicles, highlightedIndex, onValueChange],
  )

  // Handle vehicle selection
  const handleSelect = (vehicle: Vehicle) => {
    onValueChange(vehicle.id.toString())
    setOpen(false)
    setSearchQuery("")
  }

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query) return text

    const parts = text.split(new RegExp(`(${query})`, "gi"))
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  // Format vehicle display
  const formatVehicleDisplay = (vehicle: Vehicle) => {
    if (vehicle.marque && vehicle.modele) {
      return `${vehicle.marque} ${vehicle.modele} - ${vehicle.matricule}`
    }
    return `${vehicle.name} - ${vehicle.matricule}`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full overflow-hidden justify-between", className)}
          disabled={disabled}
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-2 min-w-0 text-left flex-1">
            <Car className="h-4 w-4 text-gray-500" />
            {selectedVehicle ? (
              <span className="truncate block" title={formatVehicleDisplay(selectedVehicle)}>{formatVehicleDisplay(selectedVehicle)}</span>
            ) : (
              <span className="text-gray-500 truncate block" title={placeholder}>{placeholder}</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <div className="flex flex-col">
          {/* Search input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={searchInputRef}
              placeholder="Rechercher par nom, marque, modèle ou matricule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
          </div>

          {/* Results list */}
          <div ref={listRef} className="max-h-[300px] overflow-y-auto">
            {filteredVehicles.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <Car className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">Aucun véhicule trouvé</p>
                {searchQuery && (
                  <p className="text-xs text-gray-400">Essayez de modifier votre recherche &quot;{searchQuery}&quot;</p>
                )}
              </div>
            ) : (
              <div className="py-1">
                {filteredVehicles.map((vehicle, index) => (
                  <div
                    key={vehicle.id}
                    onClick={() => handleSelect(vehicle)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 hover:dark:bg-gray-800 transition-colors",
                      index === highlightedIndex && "bg-gray-100 dark:bg-gray-800 ",
                      value === vehicle.id.toString() && "bg-blue-50 dark:bg-gray-700 ",
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Car className="h-4 w-4 text-gray-500" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {vehicle.marque && vehicle.modele
                              ? highlightText(`${vehicle.marque} ${vehicle.modele}`, searchQuery)
                              : highlightText(vehicle.name, searchQuery)}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {highlightText(vehicle.matricule, searchQuery)}
                          </span>
                        </div>
                        {vehicle.marque && vehicle.modele && vehicle.name !== `${vehicle.marque} ${vehicle.modele}` && (
                          <span className="text-xs text-gray-500 truncate">
                            {highlightText(vehicle.name, searchQuery)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Check
                      className={cn("ml-auto h-4 w-4", value === vehicle.id.toString() ? "opacity-100" : "opacity-0")}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with count */}
          {filteredVehicles.length > 0 && (
            <div className="border-t px-3 py-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 rounded-b-lg">
              {filteredVehicles.length} véhicule{filteredVehicles.length > 1 ? "s" : ""} trouvé
              {filteredVehicles.length > 1 ? "s" : ""}
              {searchQuery && ` pour "${searchQuery}"`}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
