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
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";
import { Vehicle, VehicleSelect } from "../ui/vehicle-select";
import { ClientSelect, type Client } from "../ui/client-select";
import { fr } from "date-fns/locale";

const tvaOptions = ["0", "13", "20"] as const;
const statutOptions = ["en cours", "terminee", "annulee"] as const;

const formSchema = z
  .object({
    vehicule_id: z.string().min(1, "Le véhicule est requis"),
    client_id: z.string().min(1, "Le client est requis"),
    date_reservation: z.date({
      required_error: "La date de réservation est requise",
    }),
    date_debut: z.date({ required_error: "La date de début est requise" }),
    date_fin: z.date({ required_error: "La date de fin est requise" }),
    heure_debut: z.string().min(1, "L'heure de début est requise"),
    heure_fin: z.string().min(1, "L'heure de fin est requise"),
    lieu_depart: z.string().min(1, "Le lieu de départ est requis"),
    lieu_arrivee: z.string().min(1, "Le lieu d'arrivée est requis"),
    nbr_jours: z.coerce.number().min(1, "Nombre de jours minimum 1"),
    tva: z.enum(tvaOptions),
    prix_jour: z.coerce.number().min(0, "Prix par jour doit être positif"),
    avance: z.coerce.number().min(0, "L'avance doit être positive"),
    total_ht: z.coerce.number().min(0),
    total_ttc: z.coerce.number().min(0),
    statut: z.enum(statutOptions),
  })
  .refine((data) => data.date_fin >= data.date_debut, {
    message: "La date de fin doit être après la date de début",
    path: ["date_fin"],
  }).refine(
    (data) => {
      if (
        data.date_debut &&
        data.date_fin &&
        data.heure_debut &&
        data.heure_fin &&
        data.date_debut.getTime() === data.date_fin.getTime()
      ) {
        // Compare hours only when the dates are the same
        const [startHour, startMinute] = data.heure_debut.split(":").map(Number);
        const [endHour, endMinute] = data.heure_fin.split(":").map(Number);
        const start = new Date(data.date_debut);
        const end = new Date(data.date_fin);
        start.setHours(startHour, startMinute);
        end.setHours(endHour, endMinute);
        return end > start;
      }
      return true;
    },
    {
      message: "L'heure de fin doit être après l'heure de début si les dates sont identiques. ",
      path: ["heure_fin"],
    }
  );

type ReservationFormData = z.infer<typeof formSchema>;

export type ReservationFormProps = {
  initialData?: Partial<ReservationFormData> & {
    id?: number;
    date_reservation?: string;
    date_debut?: string;
    date_fin?: string;
  };
  onSuccess?: () => void;
  isEditMode?: boolean;
};

type ApiClient = {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
};

export default function ReservationForm({
  initialData,
  onSuccess,
  isEditMode = true,
}: ReservationFormProps) {
  const router = useRouter();
  const [vehicules, setVehicules] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [canReserve, setCanReserve] = useState(true);

  // Use refs to avoid excessive re-renders during calculations
  const prixJourRef = useRef<number>(0);
  const avanceRef = useRef<number>(0);
  const nbrJoursRef = useRef<number>(1);
  const tvaRef = useRef<string>("0");
  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use a ref to avoid fetching data multiple times on re-renders
  const hasFetched = useRef(false);

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicule_id: initialData?.vehicule_id?.toString() || "",
      client_id: initialData?.client_id?.toString() || "",
      date_reservation: initialData?.date_reservation
        ? new Date(initialData.date_reservation)
        : new Date(),
      date_debut: initialData?.date_debut
        ? new Date(initialData.date_debut)
        : new Date(),
      date_fin: initialData?.date_fin
        ? new Date(initialData.date_fin)
        : new Date(),
      heure_debut:
        initialData?.heure_debut?.substring(0, 5) ||
        new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      heure_fin:
        initialData?.heure_fin?.substring(0, 5) ||
        new Date(new Date().getTime() + 60 * 60 * 1000).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      lieu_depart: initialData?.lieu_depart || "",
      lieu_arrivee: initialData?.lieu_arrivee || "",
      nbr_jours: initialData?.nbr_jours || 1,
      tva: initialData?.tva || "0",
      prix_jour: initialData?.prix_jour || 0,
      avance: initialData?.avance || 0,
      total_ht: initialData?.total_ht || 0,
      total_ttc: initialData?.total_ttc || 0,
      statut: initialData?.statut || "en cours",
    },
  });

  // Optimized calculation function
  const calculateTotals = useCallback(() => {
    const prixNum = prixJourRef.current || 0;
    const nbrNum = nbrJoursRef.current || 1;
    const tvaPercent = Number(tvaRef.current) || 0;
    const avanceNum = avanceRef.current || 0;

    // Calculate base total (prix * jours)
    const baseTotal = Math.round(prixNum * nbrNum * 100) / 100;

    // Calculate total HT (base total minus advance)
    const totalHT = Math.max(0, baseTotal - avanceNum);

    // Calculate total TTC (total HT + TVA)
    const totalTTC = Math.round(totalHT * (1 + tvaPercent / 100) * 100) / 100;

    // Update form values without triggering validation or dirty state
    form.setValue("total_ht", totalHT, {
      shouldValidate: false,
      shouldDirty: false,
    });
    form.setValue("total_ttc", totalTTC, {
      shouldValidate: false,
      shouldDirty: false,
    });
  }, [form]);

  // Debounced calculation to avoid excessive calls
  const debouncedCalculate = useCallback(() => {
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
    }

    calculationTimeoutRef.current = setTimeout(() => {
      calculateTotals();
    }, 100); // 100ms debounce
  }, [calculateTotals]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, []);

  // Watch for changes and update refs + calculate
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "prix_jour" || !name) {
        prixJourRef.current = Number(value.prix_jour) || 0;
        debouncedCalculate();
      }
      if (name === "nbr_jours" || !name) {
        nbrJoursRef.current = Number(value.nbr_jours) || 1;
        debouncedCalculate();
      }
      if (name === "tva" || !name) {
        tvaRef.current = value.tva || "0";
        debouncedCalculate();
      }
      if (name === "avance" || !name) {
        avanceRef.current = Number(value.avance) || 0;
        debouncedCalculate();
      }
    });

    return () => subscription.unsubscribe();
  }, [form, debouncedCalculate]);

  // Watch for date changes
  const dateDebut = form.watch("date_debut");
  const vehiculeId = form.watch("vehicule_id");
  const dateFin = form.watch("date_fin");
  const dateReservation = form.watch("date_reservation");

  // Fetch options for vehicules and clients
  const fetchOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      const token = getAuthToken();
      if (!token) throw new Error("Token d'authentification manquant");
      if (!process.env.NEXT_PUBLIC_API_URL)
        throw new Error("URL de l'API non configurée");

      const [vehiculesRes, clientsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicules`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!vehiculesRes.ok || !clientsRes.ok)
        throw new Error("Erreur lors du chargement des données");

      const [vehiculesData, clientsData] = await Promise.all([
        vehiculesRes.json(),
        clientsRes.json(),
      ]);

      setVehicules(
        (vehiculesData.data || vehiculesData).map((v: Vehicle) => ({
          id: v.id,
          name: `${v.name}`,
          matricule: `${v.matricule}`
        }))
      );

      setClients(
        (clientsData.data || clientsData).map((c: ApiClient) => ({
          id: c.id,
          first_name: c.prenom || '',
          last_name: c.nom || '',
          phone: c.telephone || '',
          email: c.email || '',
        }))
      );
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du chargement des données",
        variant: "destructive",
      });
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchOptions();
  }, [fetchOptions]);

  // Calculate number of days when dates change
  useEffect(() => {
    if (dateReservation && dateDebut && dateDebut < dateReservation) {
      form.setValue("date_debut", dateReservation)
    }
    if (dateDebut && dateFin && dateFin < dateDebut) {
      form.setValue("date_fin", dateDebut);
    }
    if (dateDebut && dateFin && dateFin >= dateDebut) {
      const diffTime = Math.abs(dateFin.getTime() - dateDebut.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const newNbrJours = diffDays || 1;

      // Update both form and ref
      form.setValue("nbr_jours", newNbrJours);
      nbrJoursRef.current = newNbrJours;
      debouncedCalculate();
    }
  }, [dateDebut, dateReservation, dateFin, form, debouncedCalculate]);

  useEffect(() => {
    const checkDate = async () => {
      if (dateDebut && dateFin && vehiculeId) {
        setCanReserve(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        let url = `${API_URL}/api/reservations/could-reserve?vehicule_id=${vehiculeId}&date_debut=${format(new Date(dateDebut), "yyyy-MM-dd")}&date_fin=${format(new Date(dateFin), "yyyy-MM-dd")}`;
        if (isEditMode) url += `&id=${initialData?.id}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        const json = await response.json();
        setCanReserve(json.can_reserve);
      }
    };
    checkDate();
  }, [dateDebut, dateFin, vehiculeId, initialData?.id, isEditMode]);

  const onSubmit = useCallback(
    async (data: ReservationFormData) => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Token d'authentification manquant");

        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        if (!API_URL) throw new Error("URL de l'API non configurée");

        const formattedData = {
          ...data,
          date_reservation: format(data.date_reservation, "yyyy-MM-dd"),
          date_debut: format(data.date_debut, "yyyy-MM-dd"),
          date_fin: format(data.date_fin, "yyyy-MM-dd"),
        };

        const url = isEditMode
          ? `${API_URL}/api/reservations/${initialData?.id}`
          : `${API_URL}/api/reservations`;

        const method = isEditMode ? "PUT" : "POST";
        const body = JSON.stringify(
          isEditMode ? formattedData : { ...formattedData, id: undefined }
        );

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
          throw new Error(
            errorData.message || `Erreur HTTP ${response.status}`
          );
        }

        toast({
          title: "Succès",
          description: isEditMode
            ? "Réservation mise à jour avec succès"
            : "Réservation créée avec succès",
        });
        if (!isEditMode) {
          form.reset();
        }

        if (onSuccess) onSuccess();
        else router.push("/reservations");
      } catch (error) {
        toast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Une erreur est survenue",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [isEditMode, initialData, onSuccess, router, form]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!canReserve && (
            <div
              className="col-span-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mt-2"
              role="alert"
            >
              <strong className="font-bold">Erreur : </strong>
              <span className="block sm:inline">
                Impossible de sélectionner cette date car elle est déjà
                réservée ou en location.
              </span>
            </div>
          )}

          <FormField
            control={form.control}
            name="vehicule_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Véhicule *</FormLabel>
                <VehicleSelect
                  vehicles={vehicules}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loading}
                  placeholder="Rechercher et sélectionner un véhicule..."
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client <span className="text-red-500">*</span></FormLabel>
                <ClientSelect
                  clients={clients}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loading}
                  placeholder="Rechercher par nom, prénom, email ou téléphone..."
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_reservation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de réservation <span className="text-red-500">*</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        disabled={loading}
                        className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"
                          }`}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Sélectionner une date</span>
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
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const reservationDate = initialData?.date_reservation
                          ? new Date(initialData.date_reservation)
                          : null;
                        if (reservationDate) reservationDate.setHours(0, 0, 0, 0);

                        const minDate =
                          isEditMode && reservationDate && reservationDate < today ? reservationDate : today;

                        return date < minDate;
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_debut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de début <span className="text-red-500">*</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        disabled={loading}
                        className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"
                          } ${canReserve === false && "border-red-500 bg-red-50"
                          }`}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Sélectionner une date</span>
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
                      disabled={(date) => {
                        return (
                          date < new Date(new Date(format(new Date(dateReservation), "yyyy-MM-dd")).setHours(0, 0, 0, 0))
                        );
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_fin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de fin <span className="text-red-500">*</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        disabled={loading}
                        className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"
                          } ${canReserve === false && "border-red-500 bg-red-50"
                          }`}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Sélectionner une date</span>
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
                      disabled={(date) => date < new Date(new Date(format(new Date(dateDebut), "yyyy-MM-dd")).setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heure_debut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure de début <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="time" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heure_fin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure de fin <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="time" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lieu_depart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu de départ <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="text" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lieu_arrivee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu d&apos;arrivée <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="text" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nbr_jours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de jours <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || 1}
                    disabled
                    className="bg-gray-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tva"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TVA <span className="text-red-500">*</span></FormLabel>
                <Select
                  onValueChange={(value) => {
                    tvaRef.current = value;
                    field.onChange(value);
                    debouncedCalculate();
                  }}
                  value={field.value}
                  disabled={loading}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la TVA" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tvaOptions.map((val) => (
                      <SelectItem key={val} value={val}>
                        {val}%
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
            name="prix_jour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix par jour (DH) <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.value || 0}
                    disabled={loading}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      prixJourRef.current = value;
                      field.onChange(value);
                      debouncedCalculate();
                    }}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="avance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avance (DH) <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.value || 0}
                    disabled={loading}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      avanceRef.current = value;
                      field.onChange(value);
                      debouncedCalculate();
                    }}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="total_ht"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total HT (DH)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    disabled
                    value={field.value?.toFixed(2) || "0.00"}
                    className="bg-gray-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="total_ttc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total TTC (DH)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    disabled
                    value={field.value?.toFixed(2) || "0.00"}
                    className="bg-gray-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading || loadingOptions || !canReserve}>
            {loading
              ? "Traitement..."
              : isEditMode
                ? "Mettre à jour"
                : "Créer Réservation"}
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