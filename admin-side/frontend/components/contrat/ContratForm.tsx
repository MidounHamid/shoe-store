"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, FileIcon, X } from "lucide-react";
// import { Badge } from "../ui/badge";

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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { getAuthToken } from "@/lib/auth";
import { fr } from "date-fns/locale";
import { Vehicle, VehicleSelect } from "../ui/vehicle-select";
import { Client, ClientSelect } from "../ui/client-select";

const etatOptions = ["en cours", "termine"] as const;
const modeReglementOptions = ["cheque", "espece", "tpe", "versement"] as const;
const positionReservoirOptions = ["0", "1/4", "1/2", "3/4", "4/4"] as const;
const tvaOptions = ["0", "13", "20"] as const;

const formSchema = z
  .object({
    vehicule_id: z.string().min(1, "Le véhicule est requis"),
    client_one_id: z.string().min(1, "Le client principal est requis"),
    client_two_id: z.string().optional(),
    number_contrat: z.string().min(1, "Le numéro de contrat est requis"),
    numero_document: z.string().min(1, "Le numéro de document est requis"),
    etat_contrat: z.enum(etatOptions),
    date_contrat: z.date({ required_error: "La date du contrat est requise" }),
    heure_contrat: z.string().min(1, "L'heure du contrat est requise"),
    km_depart: z.string().min(1, "Le kilométrage de départ est requis"),
    date_depart: z.date({ required_error: "La date de départ est requise" }),
    heure_depart: z.string().min(1, "L'heure de départ est requise"),
    lieu_depart: z.string().min(1, "Le lieu de départ est requis"),
    date_retour: z.date({ required_error: "La date de retour est requise" }),
    heure_retour: z.string().min(1, "L'heure de retour est requise"),
    lieu_livraison: z.string().min(1, "Le lieu de livraison est requis"),
    nbr_jours: z.coerce.number().min(1, "Nombre de jours minimum 1"),
    prix: z.coerce.number().min(0, "Le prix doit être positif"),
    total_ht: z.coerce.number().min(0),
    total_ttc: z.coerce.number().min(0),
    tva: z.enum(tvaOptions),
    avance: z.coerce.number().optional(),
    mode_reglement: z.enum(modeReglementOptions),
    caution_assurance: z.string().optional(),
    position_reservoir: z.enum(positionReservoirOptions),
    prolongation: z.date().optional(),
    documents: z.boolean(),
    cric: z.boolean(),
    siege_enfant: z.boolean(),
    roue_secours: z.boolean(),
    poste_radio: z.boolean(),
    plaque_panne: z.boolean(),
    gillet: z.boolean(),
    extincteur: z.boolean(),
    autre_fichier: z.string().optional(),
    description: z.string().optional(),
  })
  .refine((data) => data.date_retour >= data.date_depart, {
    message: "La date de retour doit être après la date de départ",
    path: ["date_retour"],
  }).refine((data) => {

    const departDate = new Date(data.date_depart);
    const retourDate = new Date(data.date_retour);
    departDate.setHours(0, 0, 0, 0);
    retourDate.setHours(0, 0, 0, 0);

    if (retourDate > departDate) return true;

    if (retourDate.getTime() === departDate.getTime()) {
      const [startHour, startMin] = data.heure_depart.split(":").map(Number);
      const [endHour, endMin] = data.heure_retour.split(":").map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;


      return endTime > startTime;
    }

    return false;
  }, {
    message: "L'heure de retour doit être après l'heure de départ si les dates sont identiques.",
    path: ["heure_retour"],
  }).refine((data) => {
    const contrat = new Date(data.date_contrat);
    const depart = new Date(data.date_depart);
    contrat.setHours(0, 0, 0, 0);
    depart.setHours(0, 0, 0, 0);

    if (depart < contrat) return false;

    if (depart.getTime() === contrat.getTime()) {
      const [ch, cm] = data.heure_contrat.split(":").map(Number);
      const [dh, dm] = data.heure_depart.split(":").map(Number);
      const contratMinutes = ch * 60 + cm;
      const departMinutes = dh * 60 + dm;
      return departMinutes >= contratMinutes;
    }

    return true;
  }, {
    message: "L'heure de départ doit être après l'heure du contrat si les dates sont identiques.",
    path: ["heure_depart"],
  });


type ContratFormData = z.infer<typeof formSchema>;

// type Option = { id: number; label: string };

export type ContratFormProps = {
  initialData?: Partial<ContratFormData> & {
    id?: number;
    date_contrat?: string;
    date_depart?: string;
    date_retour?: string;
    prolongation?: string;
    position_reservoir?: string;
  };
  onSuccess?: () => void;
  isEditMode?: boolean;
};

type FilePreview = {
  file: File | null;
  url: string;
  type: "image" | "pdf";
  name: string;
};

const convertToBoolean = (
  value: string | number | boolean | undefined | null,
  defaultValue: boolean = false
): boolean => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  if (typeof value === "string") {
    return value === "1" || value.toLowerCase() === "true";
  }
  if (typeof value === "number") {
    return value === 1;
  }
  return Boolean(value);
};

export default function ContratForm({
  initialData,
  onSuccess,
  isEditMode = false,
}: ContratFormProps) {
  const router = useRouter();
  const params = useParams();
  const [vehicules, setVehicules] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [previewFile, setPreviewFile] = useState<FilePreview | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const hasInitialized = useRef(false);
  const [canContract, setCanContract] = useState(true);

  const form = useForm<ContratFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicule_id: "",
      client_one_id: "",
      client_two_id: "",
      number_contrat: "",
      numero_document: "",
      etat_contrat: "en cours",
      date_contrat: new Date(),
      heure_contrat: 
        new Date(new Date().getTime()).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      km_depart: "",
      date_depart: new Date(),
      heure_depart: 
        new Date(new Date().getTime() ).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      lieu_depart: "",
      date_retour: new Date(),
      heure_retour: 
        new Date(new Date().getTime() + 60 * 60 * 1000).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      lieu_livraison: "",
      nbr_jours: 1,
      prix: 0,
      total_ht: 0,
      total_ttc: 0,
      tva: "0",
      avance: 0,
      mode_reglement: "espece",
      caution_assurance: "",
      position_reservoir: "0",
      prolongation: undefined, //because optional 
      documents: true,
      cric: true,
      siege_enfant: false,
      roue_secours: true,
      poste_radio: true,
      plaque_panne: true,
      gillet: true,
      extincteur: true,
      autre_fichier: "",
      description: "",
    },
  });

  const prixRef = useRef<number>(0);
  const avanceRef = useRef<number>(0);
  const nbrJoursRef = useRef<number>(1);
  const tvaRef = useRef<string>("0");

  // Optimized calculation function
  const calculateTotals = useCallback(() => {
    const prixNum = prixRef.current || 0;
    const nbrNum = nbrJoursRef.current || 1;
    const tvaPercent = Number(tvaRef.current) || 0;
    const avanceNum = avanceRef.current || 0;

    // Calculate base total (prix * jours)
    const baseTotal = Math.round(prixNum * nbrNum * 100) / 100;

    // Calculate total HT (base total minus advance)
    const totalHT = Math.max(0, baseTotal - avanceNum);

    // Calculate total TTC (total HT + TVA)
    const totalTTC = Math.round(totalHT * (1 + tvaPercent / 100) * 100) / 100;

    // Update form values
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

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "prix" || !name) {
        prixRef.current = Number(value.prix) || 0;
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

  const vehiculeId = form.watch("vehicule_id");
  // const clientPrincipal = form.watch("client_one_id");
  // const etatContrat = form.watch("etat_contrat");
  // const dateContrat = form.watch("date_contrat");
  const dateContrat = form.watch("date_contrat");
  const dateDepart = form.watch("date_depart");
  const dateRetour = form.watch("date_retour");

  // const prix = form.watch("prix");
  // const avance = form.watch("avance");
  // const nbrJours = form.watch("nbr_jours");
  // const tva = form.watch("tva");
  //-----------------------------------------------------------------

  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  //---------------------------------------------------------------

  // Initialize file preview for edit mode
  useEffect(() => {
    if (
      isEditMode &&
      initialData?.autre_fichier &&
      !previewFile &&
      !removeExistingFile
    ) {
      const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}/storage/${initialData.autre_fichier}`;
      const fileExtension = initialData.autre_fichier
        .split(".")
        .pop()
        ?.toLowerCase();
      const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
        fileExtension || ""
      );

      setExistingFileUrl(fileUrl);
      setPreviewFile({
        file: null,
        url: fileUrl,
        type: isImage ? "image" : "pdf",
        name: initialData.autre_fichier,
      });
    }
  }, [isEditMode, initialData?.autre_fichier, previewFile, removeExistingFile]);

  // Cleanup file URLs on unmount
  useEffect(() => {
    return () => {
      if (previewFile?.file && previewFile.url) {
        URL.revokeObjectURL(previewFile.url);
      }
    };
  }, [previewFile]);

  const fetchLastContractNumber = useCallback(async () => {
    if (isEditMode) return;

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token d'authentification manquant");
      if (!process.env.NEXT_PUBLIC_API_URL)
        throw new Error("URL de l'API non configurée");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contrats/last-number`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok)
        throw new Error(
          "Erreur lors du chargement du dernier numéro de contrat"
        );

      const data = await response.json();
      if (data.lastNumber) {
        form.setValue("number_contrat", data.lastNumber);
      }
    } catch (error) {
      console.error("Failed to fetch last contract number:", error);
      const fallbackNumber = `CONT-${Date.now().toString().slice(-6)}`;
      form.setValue("number_contrat", fallbackNumber);
    }
  }, [form, isEditMode]);

  const fetchLastDocumentNumber = useCallback(async () => {
    if (isEditMode) return;

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token d'authentification manquant");
      if (!process.env.NEXT_PUBLIC_API_URL)
        throw new Error("URL de l'API non configurée");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contrats/last-document-number`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok)
        throw new Error(
          "Erreur lors du chargement du dernier numéro de document"
        );

      const data = await response.json();
      if (data.lastDocumentNumber) {
        form.setValue("numero_document", data.lastDocumentNumber);
      }
    } catch (error) {
      console.error("Failed to fetch last document number:", error);
      const fallbackDoc = `DOC-${Date.now().toString().slice(-6)}`;
      form.setValue("numero_document", fallbackDoc);
    }
  }, [form, isEditMode]);

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

      if (!vehiculesRes.ok || !clientsRes.ok) {
        throw new Error("Erreur lors du chargement des données");
      }

      const [vehiculesData, clientsData] = await Promise.all([
        vehiculesRes.json(),
        clientsRes.json(),
      ]);
      setVehicules(
        (vehiculesData.data || vehiculesData).map((v: Vehicle) => ({
          id: v.id,
          name: `${v.name}`,
          matricule: `${v.matricule}`,
        }))
      );

      setClients(
        (clientsData.data || clientsData).map((c: Client) => ({
          id: c.id,
          first_name: c.first_name || c.nom || "",
          last_name: c.last_name || c.prenom || "",
          phone: c.phone || "",
          email: c.email || "",
        }))
      );
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement des données",
        variant: "destructive",
      });
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erreur",
        description:
          "Type de fichier non supporté. Utilisez des images (JPEG, PNG, GIF, WebP) ou des PDF.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Erreur",
        description: "Le fichier est trop volumineux. Taille maximale : 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Clear existing file state
    setExistingFileUrl(null);
    setRemoveExistingFile(false);
    setUploadedFile(file);

    const url = URL.createObjectURL(file);
    const fileType = file.type.startsWith("image/") ? "image" : "pdf";

    setPreviewFile({
      file,
      url,
      type: fileType,
      name: file.name,
    });

    form.setValue("autre_fichier", file.name);
  };

  const handleDeleteFile = useCallback(() => {
    // Handle existing file removal
    if (existingFileUrl) {
      setRemoveExistingFile(true);
      setExistingFileUrl(null);
    }

    // Handle new file removal
    if (previewFile) {
      if (previewFile.file && previewFile.url) {
        URL.revokeObjectURL(previewFile.url);
      }
      setPreviewFile(null);
    }

    setUploadedFile(null);
    form.setValue("autre_fichier", "");

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }, [existingFileUrl, previewFile, form]);

  useEffect(() => {
    if (dateContrat && dateDepart && dateDepart < dateContrat) {
      form.setValue("date_depart", dateContrat);
    }
    if (dateDepart && dateRetour && dateRetour < dateDepart) {
      form.setValue("date_retour", dateDepart); // force-align the end date
    }

    if (
      dateDepart instanceof Date &&
      dateRetour instanceof Date &&
      dateRetour >= dateDepart
    ) {
      const diffTime = dateRetour.getTime() - dateDepart.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      form.setValue("nbr_jours", diffDays);
    }
  }, [dateDepart, dateContrat, dateRetour, form]);

  // // Calculate totals
  // useEffect(() => {
  //   const prixNum = prix || 0;
  //   const nbrNum = nbrJours || 1;
  //   const tvaPercent = Number(tva) || 0;
  //   const getavance = avance || 0;

  //   const totalHT = Math.round(prixNum * nbrNum * 100) / 100 - getavance;
  //   const totalTTC =
  //     Math.round(totalHT * (1 + tvaPercent / 100) * 100) / 100 - getavance;

  //   form.setValue("total_ht", totalHT);
  //   form.setValue("total_ttc", totalTTC);
  // }, [prix, nbrJours, tva, form]);

  // First useEffect: Initialize options
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeOptions = async () => {
      await fetchOptions(); // fetch vehicules, clients and set state

      if (!isEditMode) {
        await fetchLastContractNumber();
        await fetchLastDocumentNumber();
      }
    };

    initializeOptions();
  }, [
    fetchOptions,
    fetchLastContractNumber,
    fetchLastDocumentNumber,
    isEditMode,
  ]);

  // Second useEffect: Populate form when options are loaded and initialData exists
  useEffect(() => {
    // I deleted  checking  editmode cuz this form is used for reservation parsing to contract
    //which  need to reset data and well create contract
    if (
      !initialData ||
      vehicules.length === 0 ||
      clients.length === 0
    ) {
      return;
    }

    const populateForm = () => {
      form.reset({
        vehicule_id: initialData.vehicule_id?.toString() ?? "",
        client_one_id: initialData.client_one_id?.toString() ?? "",
        client_two_id: initialData.client_two_id?.toString() ?? "",
        number_contrat: initialData.number_contrat ?? "",
        numero_document: initialData.numero_document ?? "",
        etat_contrat: initialData.etat_contrat ?? "en cours",
        date_contrat: initialData.date_contrat
          ? new Date(initialData.date_contrat)
          : new Date(),
        heure_contrat: initialData.heure_contrat?.substring(0, 5) ||
        new Date(new Date().getTime()).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        km_depart: initialData.km_depart ?? "",
        date_depart: initialData.date_depart
          ? new Date(initialData.date_depart)
          : new Date(),
        heure_depart: initialData.heure_depart?.substring(0, 5) ||
        new Date(new Date().getTime()).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        lieu_depart: initialData.lieu_depart ?? "",
        date_retour: initialData.date_retour
          ? new Date(initialData.date_retour)
          : new Date(),
        heure_retour: initialData.heure_retour?.substring(0, 5) ||
        new Date(new Date().getTime() + 60 * 60 * 1000).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        lieu_livraison: initialData.lieu_livraison ?? "",
        nbr_jours: initialData.nbr_jours ?? 1,
        prix: initialData.prix ?? 0,
        total_ht: initialData.total_ht ?? 0,
        total_ttc: initialData.total_ttc ?? 0,
        tva: initialData.tva ?? "0",
        avance: initialData.avance ?? 0,
        mode_reglement: initialData.mode_reglement ?? "espece",
        caution_assurance: initialData.caution_assurance ?? "",
        position_reservoir: initialData.position_reservoir ?? "0",
        prolongation: initialData.prolongation
          ? new Date(initialData.prolongation)
          : undefined,
        documents: convertToBoolean(initialData.documents, true),
        cric: convertToBoolean(initialData.cric, true),
        siege_enfant: convertToBoolean(initialData.siege_enfant, false),
        roue_secours: convertToBoolean(initialData.roue_secours, true),
        poste_radio: convertToBoolean(initialData.poste_radio, true),
        plaque_panne: convertToBoolean(initialData.plaque_panne, true),
        gillet: convertToBoolean(initialData.gillet, true),
        extincteur: convertToBoolean(initialData.extincteur, true),
        autre_fichier: initialData.autre_fichier ?? "",
        description: initialData.description ?? "",
      });

      console.log("Form populated with initial data:", {
        vehicule_id: initialData.vehicule_id?.toString(),
        client_one_id: initialData.client_one_id?.toString(),
        client_two_id: initialData.client_two_id?.toString(),
      });
    };

    populateForm();
  }, [isEditMode, initialData, vehicules, clients, form]);

  // Third useEffect: Handle non-edit mode form initialization
  useEffect(() => {
    if (isEditMode || !hasInitialized.current) return;

    form.reset({
      vehicule_id: "",
      client_one_id: "",
      client_two_id: "",
      number_contrat: "",
      numero_document: "",
      etat_contrat: "en cours",
      date_contrat: new Date(),
      heure_contrat: new Date(new Date().getTime()).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      km_depart: "",
      date_depart: new Date(),
      heure_depart:
        new Date(new Date().getTime()).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      lieu_depart: "",
      date_retour: new Date(),
      heure_retour: 
        new Date(new Date().getTime() + 60 * 60 * 1000).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      lieu_livraison: "",
      nbr_jours: 1,
      prix: 0,
      total_ht: 0,
      total_ttc: 0,
      tva: "0",
      avance: 0,
      mode_reglement: "espece",
      caution_assurance: "",
      position_reservoir: "0",
      prolongation: undefined,
      documents: true,
      cric: true,
      siege_enfant: false,
      roue_secours: true,
      poste_radio: true,
      plaque_panne: true,
      gillet: true,
      extincteur: true,
      autre_fichier: "",
      description: "",
    });
  }, [isEditMode, form]);

  
  const onSubmit = useCallback(
    async (data: ContratFormData) => {
      if (isFetching) return;

      setLoading(true);
      setIsFetching(true);

      try {
        const token = getAuthToken();
        if (!token) throw new Error("Token d'authentification manquant");

        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        if (!API_URL) throw new Error("URL de l'API non configurée");

        // Validate IDs
        const vehiculeId = parseInt(data.vehicule_id, 10);
        const clientOneId = parseInt(data.client_one_id, 10);
        const clientTwoId =
          data.client_two_id &&
            data.client_two_id !== "0" &&
            data.client_two_id !== ""
            ? parseInt(data.client_two_id, 10)
            : null;

        if (isNaN(vehiculeId) || vehiculeId <= 0) {
          throw new Error("Véhicule invalide");
        }

        if (isNaN(clientOneId) || clientOneId <= 0) {
          throw new Error("Client principal invalide");
        }

        // Format data for API
        const formattedData = {
          ...data,
          date_contrat: format(data.date_contrat, "yyyy-MM-dd"),
          date_depart: format(data.date_depart, "yyyy-MM-dd"),
          date_retour: format(data.date_retour, "yyyy-MM-dd"),
          prolongation: data.prolongation
            ? format(data.prolongation, "yyyy-MM-dd")
            : null,
          vehicule_id: vehiculeId,
          client_one_id: clientOneId,
          client_two_id: clientTwoId,
          // Convert booleans to integers for API
          documents: data.documents ? 1 : 0,
          cric: data.cric ? 1 : 0,
          siege_enfant: data.siege_enfant ? 1 : 0,
          roue_secours: data.roue_secours ? 1 : 0,
          poste_radio: data.poste_radio ? 1 : 0,
          plaque_panne: data.plaque_panne ? 1 : 0,
          gillet: data.gillet ? 1 : 0,
          extincteur: data.extincteur ? 1 : 0,
          ...(initialData && !isEditMode && {
            reservation_id: params?.id,
          }),
        };

        const url = isEditMode
          ? `${API_URL}/api/contrats/${initialData?.id}`
          : `${API_URL}/api/contrats`;

        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };

        let body: FormData | string;

        // If a new file is uploaded or the existing file was removed, use FormData
        if (uploadedFile instanceof File || removeExistingFile) {
          const formData = new FormData();

          if (isEditMode) {
            formData.append("_method", "PUT"); // Laravel method spoofing for PUT
          }

          // Append all fields except autre_fichier (handled separately)
          Object.entries(formattedData).forEach(([key, value]) => {
            if (key === "autre_fichier") return;

            if (value === null || value === undefined) {
              formData.append(key, "");
            } else {
              formData.append(key, value.toString());
            }
          });

          // Handle file upload or removal
          if (uploadedFile instanceof File) {
            formData.append("autre_fichier", uploadedFile);
          } else if (removeExistingFile) {
            formData.append("remove_autre_fichier", "1");
          }

          body = formData;

          // When sending FormData, do NOT set Content-Type header; browser sets it automatically
        } else {
          // No file changes — send JSON without autre_fichier field
          headers["Content-Type"] = "application/json";

          // Remove autre_fichier key from JSON payload
          // const { autre_fichier, ...dataWithoutFile } = formattedData;
          const { ...dataWithoutFile } = formattedData;
          delete dataWithoutFile.autre_fichier;
          body = JSON.stringify(dataWithoutFile);
        }

        const response = await fetch(url, {
          method:
            isEditMode && !(uploadedFile || removeExistingFile)
              ? "PUT"
              : "POST",
          headers,
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
            ? "Contrat mis à jour avec succès"
            : "Contrat créé avec succès",
        });

        if (!isEditMode) {
          form.reset();
          handleDeleteFile();
          await fetchLastContractNumber();
          await fetchLastDocumentNumber();
        }

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/contrats");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast({
          title: "Erreur",
          description:
            error instanceof Error ? error.message : "Une erreur est survenue",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    },
    [
      isEditMode,
      initialData,
      onSuccess,
      router,
      form,
      isFetching,
      uploadedFile,
      removeExistingFile,
    ]
  );

  useEffect(() => {
    const checkDate = async () => {
      if (!isEditMode && initialData) return
      if (dateDepart && dateRetour && vehiculeId) {
        setCanContract(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        let url = `${API_URL}/api/contrats/could-contract?vehicule_id=${vehiculeId}&date_debut=${format(
          new Date(dateDepart),
          "yyyy-MM-dd"
        )}&date_fin=${format(new Date(dateRetour), "yyyy-MM-dd")}`;
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
        setCanContract(json.can_reserve);
        console.log(json);
      }
    };
    checkDate();
  }, [dateDepart, dateRetour, vehiculeId, initialData?.id, isEditMode]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!canContract && (
            <div
              className="col-span-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mt-2"
              role="alert"
            >
              <strong className="font-bold">Erreur : </strong>
              <span className="block sm:inline">
                Impossible de sélectionner cette date car elle est déjà réservée
                ou en location.
              </span>
            </div>
          )}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">
              Informations du contrat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="number_contrat"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>
                      Numéro de contrat <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly
                        placeholder={isEditMode ? "" : "Généré automatiquement"}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero_document"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>
                      Numéro de document <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly
                        placeholder={isEditMode ? "" : "Généré automatiquement"}
                        className="w-full"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_contrat"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>
                      Date du contrat <span className="text-red-500">*</span>
                    </FormLabel>
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

                            const prolongation = initialData?.date_contrat
                              ? new Date(initialData.date_contrat)
                              : null;
                            if (prolongation) prolongation.setHours(0, 0, 0, 0);

                            const minDate =
                              isEditMode && prolongation && prolongation < today ? prolongation : today;

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
                name="heure_contrat"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>
                      Heure du contrat <span className="text-red-500">*</span>
                    </FormLabel>
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

          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">Véhicule et clients</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Véhicule Select */}
              <FormField
                control={form.control}
                name="vehicule_id"
                render={({ field }) => {
                  // const selectedVehicule = vehicules.find(
                  //   (v) => v.id.toString() === field.value?.toString()
                  // );

                  return (
                    <FormItem>
                      <FormLabel>Véhicule *</FormLabel>
                      {/* <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString() || ""}
                        disabled={loadingOptions || loading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner un véhicule">
                              {selectedVehicule ? (
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-sm text-gray-800">
                                    {selectedVehicule.label.split(" - ")[0]}
                                  </span>
                                  <Badge variant="secondary" className="ml-2">
                                    {selectedVehicule.label.split(" - ")[1]}
                                  </Badge>
                                </div>
                              ) : loadingOptions ? (
                                "Chargement..."
                              ) : (
                                "Sélectionner un véhicule"
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {vehicules.map((v) => {
                            const [main, badge] = v.label.split(" - ");
                            return (
                              <SelectItem
                                key={v.id}
                                value={v.id.toString()}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-sm text-gray-800">
                                    {main}
                                  </span>
                                  {badge && (
                                    <Badge variant="secondary" className="ml-2">
                                      {badge}
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select> */}
                      <VehicleSelect
                        vehicles={vehicules}
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={loading}
                        placeholder="Rechercher et sélectionner un véhicule..."
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Client Principal Select */}
              <FormField
                control={form.control}
                name="client_one_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client principal *</FormLabel>
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

              {/* Second Client Select */}
              <FormField
                control={form.control}
                name="client_two_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second client (optionnel)</FormLabel>
                    <ClientSelect
                      clients={clients}
                      value={field.value || "0"}
                      onValueChange={(value) =>
                        field.onChange(value === "0" ? "" : value)
                      }
                      disabled={loading}
                      placeholder="Sélectionner un client..."
                      noneOption={true}
                      noneLabel="Aucun second client"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">Départ</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="km_depart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilométrage de départ *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        disabled={loading}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_depart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Date de départ <span className="text-red-500">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={loading}
                            className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"
                              } ${canContract === false &&
                              "border-red-500 bg-red-50"
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
                            // console.log(date)
                            return (
                              date <
                              new Date(
                                new Date(
                                  format(new Date(dateContrat), "yyyy-MM-dd")
                                ).setHours(0, 0, 0, 0)
                              )
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
                name="heure_depart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de départ *</FormLabel>
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

              <FormField
                control={form.control}
                name="lieu_depart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de départ *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={loading} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">Retour</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date_retour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de retour *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={loading}
                            className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"
                              } ${canContract === false &&
                              "border-red-500 bg-red-50"
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
                            // console.log(date)
                            return (
                              date <
                              new Date(
                                new Date(
                                  format(new Date(dateDepart), "yyyy-MM-dd")
                                ).setHours(0, 0, 0, 0)
                              )
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

              <FormField
                control={form.control}
                name="lieu_livraison"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de retour *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={loading} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">Tarification</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Number of days - keep as is since it's disabled */}
              <FormField
                control={form.control}
                name="nbr_jours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de jours *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || 1}
                        disabled
                        className="w-full bg-gray-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* OPTIMIZED Prix field */}
              <FormField
                control={form.control}
                name="prix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix par jour (DH) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value || 0}
                        disabled={loading}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          prixRef.current = value;
                          field.onChange(value);
                          debouncedCalculate();
                        }}
                        onBlur={field.onBlur}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TVA Field - optimize with ref */}
              <FormField
                control={form.control}
                name="tva"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TVA (%)</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        tvaRef.current = value;
                        field.onChange(value);
                        debouncedCalculate();
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner le taux" />
                      </SelectTrigger>
                      <SelectContent>
                        {tvaOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* OPTIMIZED Avance field */}
              <FormField
                control={form.control}
                name="avance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avance (DH)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value || 0}
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

              {/* Total fields remain the same */}
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
                        className="w-full bg-gray-50"
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
                        className="w-full bg-gray-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rest of your fields remain the same */}
              <FormField
                control={form.control}
                name="mode_reglement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode de règlement *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner le mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modeReglementOptions.map((val) => (
                          <SelectItem key={val} value={val}>
                            {val.charAt(0).toUpperCase() + val.slice(1)}
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
                name="caution_assurance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caution assurance</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={loading} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position_reservoir"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau carburant</FormLabel>
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
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">Équipement</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "documents", label: "Documents" },
                { name: "cric", label: "Cric" },
                { name: "siege_enfant", label: "Siège enfant" },
                { name: "roue_secours", label: "Roue de secours" },
                { name: "poste_radio", label: "Poste radio" },
                { name: "plaque_panne", label: "Plaque panne" },
                { name: "gillet", label: "Gilet" },
                { name: "extincteur", label: "Extincteur" },
              ].map((item) => (
                <FormField
                  key={item.name}
                  control={form.control}
                  name={item.name as keyof ContratFormData}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{item.label}</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">Autres informations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prolongation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prolongation</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={loading}
                            // Add the same styling classes as date_contrat
                            className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"
                              }`}
                          >
                            {field.value ? (
                              // Change format to match date_contrat (dd/MM/yyyy)
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            {/* Add calendar icon like in date_contrat */}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          // Add French locale like in date_contrat
                          locale={fr}
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const contratDate = initialData?.prolongation
                              ? new Date(initialData.prolongation)
                              : null;
                            if (contratDate) contratDate.setHours(0, 0, 0, 0);

                            const minDate =
                              isEditMode && contratDate && contratDate < today ? contratDate : today;

                            return date < minDate;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* FIXED: File preview with proper deletion handling */}
              <FormField
                control={form.control}
                name="autre_fichier"
                render={() => (
                  <FormItem>
                    <FormLabel>Fichier</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-4">
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          disabled={loading}
                          onChange={handleFileChange}
                        />

                        {(previewFile || existingFileUrl) && (
                          <div
                            className={`relative rounded-md items-center flex gap-4 min-w-fit ${previewFile?.type === "image" ? "w-fit" : "w-full"
                              } cursor-pointer`}
                            onClick={() => {
                              if (
                                previewFile?.type === "pdf" ||
                                (existingFileUrl &&
                                  existingFileUrl.endsWith(".pdf"))
                              ) {
                                window.open(
                                  previewFile?.url || existingFileUrl || "",
                                  "_blank"
                                );
                              }
                            }}
                          >
                            {previewFile?.type === "image" ||
                              (existingFileUrl &&
                                !existingFileUrl.endsWith(".pdf")) ? (
                              <img
                                src={previewFile?.url || existingFileUrl || ""}
                                alt="Preview"
                                className="h-32 object-cover rounded"
                              />
                            ) : (
                              <div className="flex items-center gap-2 bg-muted border w-full p-3 rounded">
                                <FileIcon className="w-6 h-6 text-muted-foreground" />
                                <span className="text-sm truncate">
                                  {previewFile?.name ||
                                    initialData?.autre_fichier
                                      ?.split("/")
                                      .pop()}
                                </span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile();
                              }}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors z-10"
                              aria-label="Delete file"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading || loadingOptions}>
            {loading
              ? "Traitement..."
              : isEditMode
                ? "Mettre à jour"
                : "Créer Contrat"}
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
