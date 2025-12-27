import {
  BadgeCheck,
  BatteryCharging,
  BookUser,
  Bookmark,
  Car,
  ClipboardCheck,
  Droplet,
  FileText,
  Home,
  KeyIcon,
  ShieldCheck,
  // Sticker,
  Users,
  FileAxis3d,
  Mail,
  PenTool,
} from "lucide-react";

export const MENU = [
  {
    title: "Home",
    icon: <Home />,
    isActive: true,
    service: "home",
    pathname: "dashboard",
    url: "/dashboard",
  },
  {
    title: "Clients",
    icon: <Users />,
    service: "client",
    pathname: "client",
    badge: "2",
    items: [
      { title: "Liste des clients", url: "/client/list", method: "read" },
      { title: "Nouveau Client", url: "/client/add", method: "create" },
      { title: "Liste des clients bannis", url: "/client/blocked", method: "read" },

    ],
  },
  {
    title: "Vehicule",
    icon: <Car />,
    service: "vehicule",
    pathname: "vehicle", //TODO : vehicule URL FOLDER SHOULD BE CHANGED cuz u is forgotten
    badge: "2",
    items: [
      { title: "Liste Vehicule", url: "/vehicle/list_vehicule", method: "read" },
      { title: "Nouveau Vehicule", url: "/vehicle/create", method: "create" },
    ],
  },
  {
    title: "Reservation",
    icon: <BookUser />,
    service: "reservation",
    pathname: "reservation",
    badge: "4",
    items: [
      { title: "List Reservation", url: "/reservation/list_reservation", method: "read" },
      { title: "Nouveau Reservation", url: "/reservation/create", method: "create" },
    ],
  },
  {
    title: "Contrat",
    icon: <FileText />,
    service: "contract",
    pathname: "contrat",
    items: [
      { title: "List Contrat", url: "/contrat/list_contrat", method: "read" },
      { title: "Nouveau Contrat", url: "/contrat/create", method: "create" },
    ],
  },
  {
    title: "Retour Contrat",
    icon: <FileAxis3d />,
    service: "retour_contract",
    pathname: "retour_contrat",
    items: [
      { title: "List Retour Contrat", url: "/retour_contrat/list_retour_contrat", method: "read" },
      { title: "Nouveau Retour Contrat", url: "/retour_contrat/create", method: "create" },
    ],
  },

  // {
  //   title: "Reservation",
  //   icon: <BookUser />,
  //   service: "reservation",
  //   badge: "4",
  //   items: [
  //     { title: "List Reservation", url: "/reservation/list_reservation" ,method: "read" },
  //     { title: "Nouveau Reservation", url: "/reservation/create" ,method: "create" },
  //   ],
  // },
  // {
  //   title: "Interventions",
  //   icon: <KeyIcon />,
  //   service: "intervention",
  //   items: [
  //     { title: "Tutorials", url: "#", method: "read" },
  //     { title: "Courses", url: "#", method: "read" },
  //     { title: "Webinars", url: "#", method: "read" },
  //     { title: "Resources", url: "#", method: "read" },
  //   ],
  // },
  {
    title: "Charge",
    icon: <BatteryCharging />,
    service: "charge",
    pathname: "charge",
    items: [
      { title: "Liste des charges", url: "/charge", method: "read" },
      { title: "Nouvelle charge", url: "/charge/create", method: "create" },
    ],
  },
  {
    title: "Interventions",
    icon: <KeyIcon />,
    service: "intervention",
    pathname: "intervention",
    items: [
      { title: "Liste des interventions", url: "/intervention/list", method: "read" },
      { title: "Ajouter une nouvelle interventions", url: "/intervention/add", method: "create" },
    ],
  },
  {
    title: "Visite",
    icon: <ClipboardCheck />,
    service: "visite",
    pathname: "visite",
    badge: "2",
    items: [
      { title: "Liste Visite Technique", url: "/visite", method: "read" },
      { title: "Nouvelle Visite", url: "/visite/create", method: "create" },
      // { title: "Block Client", url: "#" },
    ],
  },
  {
    title: "Vidange",
    icon: <Droplet />,
    service: "vidange",
    pathname: "vidange",
    items: [
      { title: "Liste des vidange", url: "/vidange/list", method: "read" },
      { title: "Nouvelle vidange", url: "/vidange/add", method: "create" },
    ],
  },
  {
    title: "Assurance",
    icon: <ShieldCheck />,
    service: "assurance",
    pathname: "assurance",
    items: [
      { title: "Liste des assurances", url: "/assurance/list", method: "read" },
      { title: "Nouvelle assurance", url: "/assurance/add", method: "create" },
    ],
  },
  {
    title: "Assurance",
    icon: <Bookmark />,
    items: [
      { title: "Liste des assurances", url: "/assurance/list", method: "read" },
      { title: "Nouvelle assurance", url: "/assurance/add", method: "create" },
    ],
  },
  {
    title: "Vignette",
    icon: <BadgeCheck />,
    service: "vignette",
    pathname: "vignette",
    items: [
      { title: "Liste des vignette", url: "/vignette/list", method: "read" },
      { title: "Nouvelle vignette", url: "/vignette/add", method: "create" },
    ],
  },
  {
    title: "Rapports",
    icon: <Bookmark />,
    service: "rapport",
    pathname: "rapport",
    items: [
      { title: "Reservation", url: "/rapport/list_reservation", method: "read" },
      { title: "Contrat", url: "/rapport/list_contrat", method: "read" }
    ],
  },
  {
    title: "E-Mails",
    icon: <Mail />,
    service: "mail",
    pathname: "mail",
    items: [
      { title: "Liste des emails", url: "/mail/list_mail", method: "read" }
      
    ]
  }
  ,
  {
    title: "Blog",
    icon: <PenTool />,
    service: "blog",
    pathname: "blog",
    items: [
      { title: "Liste des articles", url: "/blogs/list", method: "read" },
      { title: "Nouveau article", url: "/blogs/create", method: "create" },
      { title: "Catégories", url: "/blogs/categories", method: "read" },
    ],
  }


]
