"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Loading } from "@/components/ui/loading";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";
import { fr } from "date-fns/locale";

const positionReservoirOptions = ["0", "1/4", "1/2", "3/4", "4/4"] as const;
const etatReglementOptions = ["paye", "non paye"] as const;
const prolongationOptions = ["non", "oui"] as const;

// Fixed schema with correct field names to match backend
const formSchema = z.object({
  contrat_id: z.coerce.number().min(1, "Le contrat est requis"),
  km_retour: z.coerce.number().min(0, "Le kilométrage doit être positif"),
  kilm_parcoru: z.string().min(1, "Le kilométrage parcouru est requis"),
  heure_retour: z.string().min(1, "L'heure est requise"),
  date_retour: z.date({ required_error: "La date est requise" }),
  position_reservoir: z.enum(positionReservoirOptions), // Fixed field name
  lieu_livraison: z.string().min(1, "Le lieu est requis"),
  observation: z.string().optional(),
  etat_regelement: z.enum(etatReglementOptions),
  prolongation: z.enum(prolongationOptions),
});

type RetourContratFormData = z.infer<typeof formSchema>;

type ContractOption = {
  id: number;
  label: string;
  km_depart: number;
};

export type RetourContratFormProps = {
  initialData?: Partial<RetourContratFormData> & {
    id?: number;
    date_retour?: string;
  };
  onSuccess?: () => void;
  isEditMode?: boolean;
};

interface RawContrat {
  id: number;
  number_contrat?: string;
  km_depart: number;
}

export default function RetourContratForm({
  initialData,
  onSuccess,
  isEditMode = true,
}: RetourContratFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contrats, setContrats] = useState<ContractOption[]>([]);
  const [loadingContrats, setLoadingContrats] = useState(true);
  const hasFetched = useRef(false);

  const form = useForm<RetourContratFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contrat_id: initialData?.contrat_id || undefined,
      km_retour: initialData?.km_retour || 0,
      kilm_parcoru: initialData?.kilm_parcoru || "0", // string default
      heure_retour: initialData?.heure_retour?.substring(0, 5) || "",
      date_retour: initialData?.date_retour
        ? new Date(initialData.date_retour)
        : new Date(),
      position_reservoir: initialData?.position_reservoir || undefined, 
      lieu_livraison: initialData?.lieu_livraison || "",
      observation: initialData?.observation || "",
      etat_regelement: initialData?.etat_regelement || "paye",
      prolongation: initialData?.prolongation || "non",
    },
  });

  const kmRetour = form.watch("km_retour");
  const contratId = form.watch("contrat_id");
  const { setValue } = form;

  // Fetch contracts on component mount
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchContrats = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Token d'authentification manquant");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/contrats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
        }

        const responseData = await response.json();
        console.log("Contracts response:", responseData);

        const contractsArray = responseData.data || [];

        setContrats(
          contractsArray.map((c: RawContrat) => ({
            id: c.id,
            label: c.number_contrat || `Contrat #${c.id}`,
            km_depart: c.km_depart,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch contracts:", error);
        toast({
          title: "Erreur",
          description:
            error instanceof Error
              ? error.message
              : "Échec du chargement des contrats",
          variant: "destructive",
        });
      } finally {
        setLoadingContrats(false);
      }
    };

    fetchContrats();
  }, []);

  // Trigger calculation when initial data is available
  useEffect(() => {
    if (!loadingContrats && initialData?.contrat_id && initialData?.km_retour) {
      setValue("contrat_id", initialData.contrat_id);
      setValue("km_retour", initialData.km_retour);
    }
  }, [loadingContrats, initialData, setValue]);

  // Calculate kilometers traveled - Fixed field name
  useEffect(() => {
    if (loadingContrats) return;

    if (contratId && !isNaN(kmRetour)) {
      const contrat = contrats.find((c) => c.id === contratId);
      if (contrat) {
        const kmParcouru = kmRetour - contrat.km_depart;
        console.log(`Calculating kilm_parcoru: ${kmParcouru}`);
              const kmParcouruStr = Math.max(0, kmParcouru).toString();  // convert to string

        setValue("kilm_parcoru", kmParcouruStr); // Fixed field name
      }
    } else {
      setValue("kilm_parcoru", "0"); // Fixed field name
    }
  }, [kmRetour, contratId, contrats, loadingContrats, setValue]);

  const onSubmit = useCallback(
    async (data: RetourContratFormData) => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Token d'authentification manquant");

        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        if (!API_URL) throw new Error("URL de l'API non configurée");

        const formattedData = {
          ...data,
          date_retour: format(data.date_retour, "yyyy-MM-dd"),
        };

        const url = isEditMode
          ? `${API_URL}/api/retour-contrats/${initialData?.id}`
          : `${API_URL}/api/retour-contrats`;

        const method = isEditMode ? "PUT" : "POST";
        const body = JSON.stringify(formattedData);

        console.log("Sending data to backend:", formattedData); // Debug log

        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("API Error:", errorData); // Debug log
          throw new Error(
            errorData.message || `Erreur HTTP ${response.status}`
          );
        }

        toast({
          title: "Succès",
          description: isEditMode
            ? "Retour contrat mis à jour avec succès"
            : "Retour contrat créé avec succès",
        });

        if (onSuccess) onSuccess();
        else router.push("/retour_contrat/list_retour_contrat");

        form.reset();

      } catch (error) {
        console.error("Submit error:", error); // Debug log
        toast({
          title: "Erreur",
          description:
            error instanceof Error ? error.message : "Une erreur est survenue",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [isEditMode, initialData, onSuccess, router]
  );

  if (loadingContrats) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contract Information */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">Informations du retour</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="contrat_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contrat associé *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                      }}
                      value={field.value ? field.value.toString() : ""}
                      disabled={loading || isEditMode}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un contrat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contrats.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_retour"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de retour *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={loading}
                            className={`w-full justify-start text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selectionner la date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          locale={fr}
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="heure_retour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de retour *</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={loading}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">État du véhicule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="km_retour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilométrage de retour *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        disabled={loading}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fixed field name from km_parcouru to kilm_parcoru */}
              <FormField
                control={form.control}
                name="kilm_parcoru"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilométrage parcouru *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        readOnly
                        className="w-full bg-gray-100"
                        value={field.value || 0}
                        onChange={() => {}}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fixed field name from position_resrvoir to position_reservoir */}
              <FormField
                control={form.control}
                name="position_reservoir"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau carburant *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner le niveau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positionReservoirOptions.map((val) => (
                          <SelectItem key={val} value={val}>
                            {val === "0" ? "Vide" : val}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lieu_livraison"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Lieu de livraison *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={loading} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Payment and Status */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">Règlement et statut</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="etat_regelement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>État règlement *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner l'état" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {etatReglementOptions.map((val) => (
                          <SelectItem key={val} value={val}>
                            {val === "paye" ? "Payé" : "Non payé"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prolongation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prolongation *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Prolongation ?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prolongationOptions.map((val) => (
                          <SelectItem key={val} value={val}>
                            {val === "oui" ? "Oui" : "Non"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Observations */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">Observations</h3>
            <FormField
              control={form.control}
              name="observation"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={loading}
                      className="w-full"
                      placeholder="Notes sur l'état du véhicule, dommages, etc."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading || loadingContrats}>
            {loading
              ? "Traitement..."
              : isEditMode
              ? "Mettre à jour"
              : "Créer Retour"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
