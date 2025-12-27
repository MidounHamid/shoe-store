// components/ui/client-select.tsx
"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Check, ChevronDown, Search, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type Client = {
  id: number
  first_name: string
  last_name: string
  phone?: string
  email?: string
  nom?: string // For compatibility with old data
  prenom?: string // For compatibility with old data
}

interface ClientSelectProps {
  clients: Client[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  noneOption?: boolean
  noneLabel?: string
}

export function ClientSelect({
  clients,
  value,
  onValueChange,
  placeholder = "Sélectionner un client...",
  disabled = false,
  className,
  noneOption = false,
  noneLabel = "Aucun client",
}: ClientSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Handle none option
  const noneClient = noneOption ? {
    id: 0,
    first_name: noneLabel,
    last_name: "",
    email: "",
    phone: ""
  } : null;

  // Find selected client
  const selectedClient = clients.find(client => client.id.toString() === value) || 
                        (noneClient && value === "0" ? noneClient : null);

  // Filter clients based on search query - FIXED UNDEFINED ACCESS
  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (client.first_name || '').toLowerCase().includes(searchLower) ||
      (client.last_name || '').toLowerCase().includes(searchLower) ||
      (client.email || '').toLowerCase().includes(searchLower) ||
      (client.phone || '').toLowerCase().includes(searchLower)
    );
  });

  // Add none option if enabled
  const displayClients = noneOption ? [noneClient!, ...filteredClients] : filteredClients;

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Focus search input when popover opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < displayClients.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : displayClients.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (displayClients[highlightedIndex]) {
            onValueChange(displayClients[highlightedIndex].id.toString());
            setOpen(false);
            setSearchQuery("");
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          setSearchQuery("");
          break;
      }
    },
    [open, displayClients, highlightedIndex, onValueChange]
  );

  // Handle client selection
  const handleSelect = (client: Client) => {
    onValueChange(client.id.toString());
    setOpen(false);
    setSearchQuery("");
  };

  // Highlight matching text
  const highlightText = (text: string | undefined, query: string) => {
    if (!text || !query) return text || '';
    return text.split(new RegExp(`(${query})`, "gi")).map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Format client display - FIXED to handle empty names properly
  const formatClientDisplay = (client: Client) => {
    if (client.id === 0) return client.first_name;
    
    const firstName = client.first_name?.trim() || '';
    const lastName = client.last_name?.trim() || '';
    
    if (firstName || lastName) {
      return [firstName, lastName].filter(Boolean).join(' ');
    }
    
    return `Client #${client.id}`;
  };

  // Get client details for display
  const getClientDetails = (client: Client) => {
    if (client.id === 0) return "";
    return [
      client.email,
      client.phone,
    ].filter(Boolean).join(" • ");
  };

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
            <User className="h-4 w-4 text-gray-500" />
            {selectedClient ? (
              <span className="truncate block" title={formatClientDisplay(selectedClient)}>{formatClientDisplay(selectedClient)}</span>
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
              placeholder="Rechercher par nom, prénom, email ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
          </div>

          {/* Results list */}
          <div ref={listRef} className="max-h-[300px] overflow-y-auto">
            {displayClients.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <User className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">Aucun client trouvé</p>
                {searchQuery && (
                  <p className="text-xs text-gray-400">Essayez de modifier votre recherche &quot;{searchQuery}&quot;</p>
                )}
              </div>
            ) : (
              <div className="py-1">
                {displayClients.map((client, index) => (
                  <div
                    key={client.id}
                    onClick={() => handleSelect(client)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 hover:dark:bg-gray-800  transition-colors",
                      index === highlightedIndex && "bg-gray-100 dark:bg-gray-800",
                      value === client.id.toString() && "bg-blue-50 dark:bg-gray-700 ",
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {client.id === 0 ? (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <span className="text-gray-400">—</span>
                        </div>
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className={cn("font-medium truncate", client.id === 0 && "text-gray-500")}>
                            {highlightText(formatClientDisplay(client), searchQuery)}
                          </span>
                        </div>
                        {getClientDetails(client) && (
                          <span className="text-xs text-gray-500 truncate">
                            {highlightText(getClientDetails(client), searchQuery)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Check
                      className={cn("ml-auto h-4 w-4", value === client.id.toString() ? "opacity-100" : "opacity-0")}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with count */}
          {displayClients.length > 0 && (
            <div className="border-t px-3 py-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 rounded-b-lg">
              {displayClients.length} client{displayClients.length > 1 ? "s" : ""} trouvé
              {displayClients.length > 1 ? "s" : ""}
              {searchQuery && ` pour "${searchQuery}"`}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}