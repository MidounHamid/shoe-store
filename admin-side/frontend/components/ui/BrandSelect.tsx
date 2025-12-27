"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Check, ChevronDown, Search, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type Brand = {
  id: number
  marque: string
}

interface BrandSelectProps {
  brands: Brand[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function BrandSelect({
  brands,
  value,
  onValueChange,
  placeholder = "Sélectionner une marque...",
  disabled = false,
  className,
}: BrandSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedBrand = brands.find((brand) => brand.id.toString() === value)

  const filteredBrands = brands.filter((brand) =>
    brand.marque.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    setHighlightedIndex(0)
  }, [searchQuery])

  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [open])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setHighlightedIndex((prev) =>
            prev < filteredBrands.length - 1 ? prev + 1 : 0
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredBrands.length - 1
          )
          break
        case "Enter":
          e.preventDefault()
          if (filteredBrands[highlightedIndex]) {
            onValueChange(filteredBrands[highlightedIndex].id.toString())
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
    [open, filteredBrands, highlightedIndex, onValueChange]
  )

  const handleSelect = (brand: Brand) => {
    onValueChange(brand.id.toString())
    setOpen(false)
    setSearchQuery("")
  }

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
      )
    )
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
            <Tag className="h-4 w-4 text-gray-500" />
            {selectedBrand ? (
              <span className="truncate block" title={selectedBrand.marque}>
                {selectedBrand.marque}
              </span>
            ) : (
              <span className="text-gray-500 truncate block" title={placeholder}>
                {placeholder}
              </span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <div className="flex flex-col">
          {/* Search input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={searchInputRef}
              placeholder="Rechercher une marque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
          </div>

          {/* Results list */}
          <div className="max-h-[300px] overflow-y-auto">
            {filteredBrands.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <Tag className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">Aucune marque trouvée</p>
                {searchQuery && (
                  <p className="text-xs text-gray-400">
                    Essayez de modifier votre recherche &quot;{searchQuery}&quot;
                  </p>
                )}
              </div>
            ) : (
              <div className="py-1">
                {filteredBrands.map((brand, index) => (
                  <div
                    key={brand.id}
                    onClick={() => handleSelect(brand)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 hover:dark:bg-gray-800 transition-colors",
                      index === highlightedIndex && "bg-gray-100 dark:bg-gray-800",
                      value === brand.id.toString() && "bg-blue-50 dark:bg-gray-700"
                    )}
                  >
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="font-medium truncate flex-1">
                      {highlightText(brand.marque, searchQuery)}
                    </span>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === brand.id.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredBrands.length > 0 && (
            <div className="border-t px-3 py-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 rounded-b-lg">
              {filteredBrands.length} marque{filteredBrands.length > 1 ? "s" : ""} trouvée
              {searchQuery && ` pour "${searchQuery}"`}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
