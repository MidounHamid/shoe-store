import { forwardRef } from "react";
import Image from "next/image";

interface Agence {
  ville: string;
  nom_agence: string;
  telephone: string;
  Adresse: string; // Single string field
  logo: string;
}

interface Client {
  nom: string;
  nationalite: string;
  adresse: string;
  cin: string;
  permis: string;
  passeport: string;
  date_naissance?: string;
  lieu_de_naissance?: string;
  telephone?: string;
  date_entree_maroc?: string;
}

interface Vehicule {
  marque: string;
  immatriculation: string;
  km_depart: number;
  km_retour: number;
  lieu_livraison?: string;
  lieu_retour?: string;
}

interface PaymentInfo {
  mode: string;
  avance: number;
  reste: number;
  total: number;
  franchise: string;
  caution: boolean;
}

interface Equipment {
  gps: boolean;
  siege_enfant: boolean;
  kit_secours: boolean;
  brise_glace: boolean;
  cinq_doc: boolean;
  assistance: boolean;
  lavage: boolean;
  autres?: string;
}

interface Inspection {
  rayures: boolean;
  bosses: boolean;
  eclates: boolean;
  cassures: boolean;
}

interface ContractData {
  number: string;
  client: Client;
  client2?: Client;
  vehicule: Vehicule;
  date_debut: string;
  date_fin: string;
  heure_debut: string;
  heure_fin: string;
  duree: string;
  payment: PaymentInfo;
  equipment: Equipment;
  inspection: Inspection;
  note?: string;
  prolongations?: {
    date_heure: string;
    jours: number;
  }[];
  agence: Agence;
}

interface Props {
  data: ContractData;
}

const ContractTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  // Format date as DD/MM/YYYY
  // console.log(data)
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format time as HH:MM
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    return `${hours}h${minutes}`;
  };

  return (
    <div
      ref={ref}
      className="max-w-4xl mx-auto bg-white border-2 border-black p-0 !text-xs"
    >
      {/* Header */}
      <div className="border-b-2 border-black">
        <div className="flex justify-between items-start p-2">
          {/* <h1 className="text-3xl font-bold text-black tracking-wider">
              {data.agence.nom_agence}
            </h1> */}
          <div className="flex-1 text-center font-sans text-[#2D3D70]">
            <Image
              src='/azidcar.png'
              alt="AZIDCAR Logo"
              width={180}
              height={180}
              className="mx-auto mb-1"
            />
            <div className="text-sm text-black leading-snug space-y-0.5">
              <p>
                <span className="font-bold text-[#2D3D70]">TÉL :</span>{" "}
                {data.agence.telephone}
              </p>

              {(data.agence.Adresse ?? "").split("\n").map((line, index) => (
                <p key={index}>
                  <span className="font-bold text-[#2D3D70]">ADRESSE :</span>{" "}
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="border-l-2 border-black pl-4 flex flex-col items-center">
            <div className="bg-white border-2 border-black px-4 py-1 text-center">
              <p className="text-xs font-bold text-black">CONTRA DE LOCATION</p>
              <div className="flex items-center justify-center mt-1">
                <span className="text-base font-bold text-red-600">N°</span>
                <span className="ml-2 text-lg font-bold text-red-600">
                  {data.number}
                </span>
              </div>
            </div>
            <p className="text-[10px] mt-2 text-gray-700 text-center leading-tight">
              Ce Contrat doit accompagner le véhicule pendant toute la
              <br />
              durée de location, afin d&apos;être présenté à toute réquisition des
              <br />
              services de police ou de gendarmerie.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 border-b-2 border-black">
        {/* Left Column */}
        <div className="border-r-2 border-black">
          {/* Date and Time Info */}
          <div className="border-b-2 border-black p-2 space-y-2">
            <div className="flex items-center">
              <span className="text-xs font-medium w-40">
                Date et heure de départ :
              </span>
              <span>
                {formatDate(data.date_debut)} à {formatTime(data.heure_debut)}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-medium w-40">
                Date et heure de retour :
              </span>
              <span>
                {formatDate(data.date_fin)} à {formatTime(data.heure_fin)}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-medium w-40">Durée total :</span>
              <span>{data.duree}</span>
            </div>
          </div>

          {/* Prolongations */}
          <div className="border border-black p-2 text-xs text-black">
            <div className="flex items-center mb-2">
              <span className="w-52">Prolongations Date & Heure :</span>
              <span className="flex-1">
                {data.prolongations?.map((p) => p.date_heure).join(", ") ||
                  "Aucune"}
              </span>
            </div>
            <div className="flex items-center mb-4">
              <span className="w-52">Nbres total jours prolonges :</span>
              <span className="flex-1">
                {data.prolongations?.reduce((sum, p) => sum + p.jours, 0) ||
                  "0"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-black h-20 p-1 text-xs"></div>
              <div className="border border-black h-20 p-1 text-xs"></div>
            </div>
          </div>

          {/* Locataire Info */}
          <div className="border-b-2 border-black p-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-black">
                1er Locataire :
              </span>
              <span className="text-xs font-bold text-black">
                Locataire(e) :
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="text-xs w-40">Nom :</span>
                <span className="flex-1">{data.client.nom}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-40">
                  Date et lieu de naissance :
                </span>
                <span className="flex-1">
                  {data.client.date_naissance} à {data.client.lieu_de_naissance}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-40">Nationalité :</span>
                <span className="flex-1">{data.client.nationalite}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-40">Adresse :</span>
                <span className="flex-1">{data.client.adresse}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-40">C.I.N N° :</span>
                <span className="flex-1">{data.client.cin}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-40">Permis de conduire N° :</span>
                <span className="flex-1">{data.client.permis}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-40">Passeport N° :</span>
                <span className="flex-1">{data.client.passeport}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-40">Date d&apos;entrée au Maroc :</span>
                <span className="flex-1">
                  {data.client.date_entree_maroc || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Second Locataire */}
          <div className="p-2">
            <span className="text-xs font-bold text-black">
              2ème Locataire :
            </span>
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="text-xs w-40">Nom :</span>
                <span className="flex-1">{data.client2?.nom || ""}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-40">
                  Date et lieu de naissance :
                </span>
                <span className="flex-1">
                  {(data.client2?.date_naissance || "") +
                    (data.client2?.lieu_de_naissance
                      ? ` à ${data.client2.lieu_de_naissance}`
                      : "")}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-32">Nationalité :</span>
                <span className="flex-1">
                  {data.client2?.nationalite || ""}
                </span>
                <span className="text-xs w-10 ml-2">Tél :</span>
                <span className="flex-1">{data.client2?.telephone || ""}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-40">Adresse :</span>
                <span className="flex-1">{data.client2?.adresse || ""}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-40">C.I.N N° :</span>
                <span className="flex-1">{data.client2?.cin || ""}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-40">Permis de conduire N° :</span>
                <span className="flex-1">{data.client2?.permis || ""}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-40">Passeport N° :</span>
                <span className="flex-1">{data.client2?.passeport || ""}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-40">Date d&apos;entrée au Maroc :</span>
                <span className="flex-1">
                  {data.client2?.date_entree_maroc || ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Vehicle Info */}
          <div className="border-b-2 border-black p-2 space-y-2">
            <div className="flex items-center">
              <span className="text-xs w-28 text-black">Marque :</span>
              <span className="flex-1">{data.vehicule.marque}</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs w-28 text-black">N° Imm :</span>
              <span className="flex-1">{data.vehicule.immatriculation}</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs w-28 text-black">
                Lieu de livraison :
              </span>
              <span className="flex-1">
                {data.vehicule.lieu_livraison || ""}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs w-28 text-black">Lieu de retour :</span>
              <span className="flex-1">
                {data.vehicule.lieu_livraison || ""}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs w-28 text-black">Km départ :</span>
              <span className="flex-1">{data.vehicule.km_depart}</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs w-28 text-black">Km de récupéré :</span>
              {/* <span className="flex-1">{data.vehicule.km_retour}</span> */}
              <span className="flex-1">{data.vehicule.km_retour}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-b-2 border-black p-2 space-y-2">
            <div className="flex items-center space-x-2 text-xs text-black">
              <span>Mode de paiement :</span>
              <label className="flex items-center space-x-1">
                <span>Espèce</span>
                <input
                  type="checkbox"
                  checked={data.payment.mode === "espece"}
                  readOnly
                />
              </label>
              <label className="flex items-center space-x-1">
                <span>Chèque</span>
                <input
                  type="checkbox"
                  checked={data.payment.mode === "cheque"}
                  readOnly
                />
              </label>
              <label className="flex items-center space-x-1">
                <span>CB</span>
                <input
                  type="checkbox"
                  checked={data.payment.mode === "cb"}
                  readOnly
                />
              </label>
            </div>
            <div className="flex items-center">
              <span className="text-xs w-28 text-black">Avance :</span>
              <span className="flex-1">{data.payment.avance} DH</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs w-28 text-black">Reste :</span>
              <span className="flex-1">
                {(data.payment.total - data.payment.avance).toFixed(2)} DH
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xs w-28 text-black">
                Total net à payer :
              </span>
              <span className="flex-1">{data.payment.total} DH</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-black">
              <span>Franchise :</span>
              <span className="w-16">{data.payment.franchise} DH</span>
              <span>Caution :</span>
              <label className="flex items-center space-x-1">
                <span>Oui</span>
                <input
                  type="checkbox"
                  checked={data.payment.caution}
                  readOnly
                />
              </label>
              <label className="flex items-center space-x-1">
                <span>Non</span>
                <input
                  type="checkbox"
                  checked={!data.payment.caution}
                  readOnly
                />
              </label>
            </div>
          </div>

          {/* Equipment */}
          <div className="border-b-2 border-black p-2">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-black">GPS</span>
                  <input
                    type="checkbox"
                    checked={data.equipment.gps}
                    readOnly
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-black">5 Doc</span>
                  <input
                    type="checkbox"
                    checked={data.equipment.cinq_doc}
                    readOnly
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-black">Lavage</span>
                  <input
                    type="checkbox"
                    checked={data.equipment.lavage}
                    readOnly
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-black">Siège bébé</span>
                  <input
                    type="checkbox"
                    checked={data.equipment.siege_enfant}
                    readOnly
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-black">Assistance</span>
                  <input
                    type="checkbox"
                    checked={data.equipment.assistance}
                    readOnly
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-black">Autres :</span>
                  <span className="w-12">{data.equipment.autres || ""}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-black">Kit secours</span>
                  <input
                    type="checkbox"
                    checked={data.equipment.kit_secours}
                    readOnly
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-black">Brise glace</span>
                  <input
                    type="checkbox"
                    checked={data.equipment.brise_glace}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center mt-2 text-xs">
              <span className="w-10 text-black">NB :</span>
              <span className="flex-1">{data.note || ""}</span>
            </div>
          </div>

          {/* Vehicle Inspection */}
          <div className="p-2">
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div>
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span>R : RAYURES</span>
                    <input
                      type="checkbox"
                      checked={data.inspection.rayures}
                      readOnly
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>B : BOSSES</span>
                    <input
                      type="checkbox"
                      checked={data.inspection.bosses}
                      readOnly
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>E : ECLATES</span>
                    <input
                      type="checkbox"
                      checked={data.inspection.eclates}
                      readOnly
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>C : CASSURES</span>
                    <input
                      type="checkbox"
                      checked={data.inspection.cassures}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src='/images/img1.png'
                  alt="Vehicle inspection"
                  width={200}
                  height={200}
                />
              </div>
            </div>
            <div className="flex justify-center mb-2">
              {/* <Image
                src="/images/car.png"
                alt="Car diagram"
                width={128}
                height={128
                }
              /> */}

              <svg
                version="1.0"
                xmlns="http://www.w3.org/2000/svg"
                width="181.000000pt"
                height="84.000000pt"
                viewBox="0 0 181.000000 84.000000"
                preserveAspectRatio="xMidYMid meet"
              >
                <g
                  transform="translate(0.000000,84.000000) scale(0.100000,-0.100000)"
                  fill="#000000"
                  stroke="none"
                >
                  <path d="M1260 766 c-31 -11 -35 -17 -36 -49 -1 -35 8 -48 21 -28 3 5 1 12 -5 16 -21 13 -9 36 25 51 68 28 215 9 215 -29 0 -29 -33 -41 -120 -47 -49 -3 -86 -2 -83 3 2 4 -3 7 -11 7 -28 0 -26 -18 2 -25 16 -3 33 -5 38 -4 5 1 17 -1 28 -6 11 -5 26 -4 36 2 9 6 29 8 45 6 18 -4 26 -2 21 5 -4 6 2 8 16 4 16 -4 19 -2 13 8 -6 10 -4 12 8 7 17 -6 25 0 50 36 11 16 19 17 56 8 89 -20 101 -40 114 -191 l6 -65 -17 60 c-20 72 -16 70 -200 60 -110 -6 -122 -9 -116 -24 15 -32 17 -143 2 -152 -11 -8 -11 -10 1 -18 16 -10 17 -104 2 -144 l-10 -25 72 -7 c40 -3 108 -5 152 -3 l80 3 17 60 17 60 -5 -60 c-13 -155 -22 -173 -99 -194 -56 -15 -64 -14 -76 13 -13 27 -52 48 -74 40 -8 -4 -15 -2 -15 4 0 6 -32 10 -75 10 -50 0 -73 -4 -68 -11 4 -7 0 -8 -11 -4 -10 4 -22 7 -28 7 -7 0 -6 5 1 14 6 7 8 21 5 31 -6 14 -3 16 12 12 59 -18 367 -88 371 -84 2 3 -10 10 -28 16 -26 9 -31 15 -27 36 3 14 5 25 4 26 0 0 -74 4 -164 8 -147 7 -166 10 -185 29 -19 20 -20 25 -9 72 15 65 15 135 0 199 -10 45 -9 53 7 71 28 31 56 21 84 -29 20 -37 24 -57 24 -140 1 -81 -3 -103 -22 -139 -24 -47 -23 -67 1 -30 26 40 36 90 37 175 0 71 -4 90 -28 138 l-28 55 112 0 c151 0 173 5 167 36 -4 20 1 26 27 35 64 23 21 19 -90 -8 -62 -14 -108 -28 -102 -30 6 -2 38 3 71 11 76 20 78 20 78 -3 0 -17 -10 -20 -91 -25 -49 -3 -106 -4 -125 -3 -19 1 -50 -2 -68 -7 -31 -7 -33 -6 -28 12 5 14 0 25 -16 36 -13 9 -23 20 -24 24 0 4 -6 19 -14 35 l-13 27 -337 0 -337 0 -16 -40 c-8 -22 -20 -40 -26 -40 -8 0 -8 6 0 19 24 37 -17 72 -79 70 -22 -1 -19 -3 12 -10 73 -17 87 -49 34 -74 l-33 -15 30 5 30 5 -25 -14 c-34 -18 -276 -33 -265 -16 5 8 24 10 59 6 l51 -5 -40 15 c-22 8 -46 21 -54 29 -15 15 -9 45 10 45 6 0 9 -7 6 -15 -7 -16 37 -55 62 -55 9 1 1 7 -16 15 -57 24 -38 59 38 74 43 9 43 9 9 10 -19 0 -46 -5 -60 -12 -18 -10 -30 -10 -42 -3 -29 17 -98 -13 -121 -52 -36 -62 -46 -425 -14 -535 15 -52 58 -87 108 -87 21 0 39 5 39 10 0 6 12 2 27 -7 39 -26 178 -25 217 0 21 14 27 25 23 43 -6 33 19 13 27 -21 l6 -25 339 0 339 0 15 22 16 23 0 -23 c1 -33 54 -52 143 -52 88 0 144 26 133 61 -5 15 -4 19 5 14 7 -4 9 -17 5 -33 l-6 -25 63 5 c71 6 120 27 143 61 9 14 19 72 26 150 11 113 14 127 31 127 10 0 18 5 18 10 0 6 -8 10 -19 10 -16 0 -20 11 -25 78 -15 171 -18 185 -46 213 -30 31 -85 49 -148 49 -40 0 -42 -1 -36 -24 3 -13 1 -27 -6 -31 -7 -4 -11 -1 -9 6 4 31 -3 41 -36 55 -42 17 -147 17 -195 0z m-67 -51 c19 -27 8 -35 -13 -10 -11 13 -59 15 -321 15 l-309 0 0 -48 c0 -45 12 -72 33 -72 4 0 5 5 1 12 -4 7 -3 8 5 4 6 -4 8 -12 5 -18 -5 -7 -1 -9 9 -5 10 3 24 4 33 0 13 -5 13 -7 2 -14 -19 -12 -36 -11 -18 1 11 8 8 9 -11 4 -15 -3 -30 -1 -33 5 -4 6 -13 11 -21 11 -15 0 -23 -33 -29 -123 -2 -32 -7 -61 -11 -65 -4 -4 -5 37 -3 90 5 85 3 98 -11 103 -9 3 -82 1 -161 -5 -111 -7 -146 -7 -152 3 -8 13 66 22 232 27 52 2 80 5 62 7 l-32 4 35 33 c19 18 35 41 35 50 0 14 31 16 328 16 l327 -1 18 -24z m485 -9 c15 -15 25 -41 31 -81 15 -102 22 -205 13 -205 -5 0 -12 50 -16 112 -7 127 -17 152 -66 186 -29 20 -31 23 -10 17 14 -4 35 -17 48 -29z m-1557 0 c-29 -30 -40 -81 -41 -176 0 -78 -8 -123 -19 -116 -10 7 7 234 20 259 16 31 40 57 52 57 6 0 0 -11 -12 -24z m45 8 c-4 -10 1 -25 10 -35 11 -12 13 -19 5 -19 -6 0 -14 -8 -18 -17 -3 -10 -13 -26 -20 -35 -19 -21 -8 -58 17 -58 11 0 23 6 27 14 6 9 37 15 103 19 l95 6 -80 -14 c-44 -8 -98 -21 -120 -28 l-40 -14 -5 -123 c-4 -111 -3 -124 12 -128 16 -4 15 -6 -4 -21 -15 -13 -19 -23 -14 -39 4 -12 12 -22 17 -22 5 0 9 -9 9 -20 0 -14 7 -20 22 -20 l22 0 -23 -21 c-12 -12 -20 -27 -17 -35 3 -9 0 -11 -11 -7 -12 5 -14 3 -8 -7 5 -8 -4 -6 -23 5 -17 11 -36 31 -42 46 -13 31 -29 259 -18 259 9 0 16 -47 21 -151 5 -85 25 -149 49 -149 6 0 4 8 -5 18 -22 24 -21 29 3 35 13 3 18 10 14 21 -7 19 -30 21 -37 4 -3 -7 -6 -1 -6 15 -1 15 4 27 9 27 6 0 9 30 8 73 l-1 72 -7 -55 -7 -55 -1 73 c-2 59 1 72 14 72 8 0 12 5 9 10 -4 6 -11 8 -16 5 -5 -4 -8 24 -8 67 l1 73 13 -65 13 -65 -5 85 c-3 47 -10 87 -14 88 -5 2 -9 16 -8 30 0 15 3 21 6 15 7 -18 33 -16 33 1 0 8 -4 18 -10 21 -6 4 -7 -1 -4 -12 5 -15 4 -16 -5 -3 -16 22 -14 28 15 55 31 29 38 31 30 9z m713 -81 c-1 -43 -3 -67 -6 -53 -9 62 -12 67 -35 64 -13 -2 -80 -5 -150 -7 l-128 -5 0 39 0 39 160 0 160 0 -1 -77z m325 43 c31 -26 37 -38 31 -52 -5 -11 -9 -21 -9 -24 -1 -3 -5 -11 -9 -18 -5 -7 -5 -46 -2 -87 l7 -75 -40 0 c-23 0 -44 -4 -47 -10 -4 -6 12 -10 40 -10 l47 0 -7 -79 c-5 -54 -3 -81 4 -86 6 -3 9 -10 6 -15 -3 -5 -1 -11 5 -15 17 -10 11 -43 -9 -50 -10 -3 -26 -14 -36 -25 -16 -18 -31 -20 -157 -20 l-138 0 0 75 c0 41 3 75 8 75 4 0 7 -17 7 -37 l0 -38 157 -5 c119 -4 159 -2 162 7 3 7 1 15 -5 18 -5 4 -7 10 -4 15 3 5 -9 17 -27 27 -29 16 -61 18 -268 18 l-235 0 9 68 9 67 38 0 c22 0 39 5 39 10 0 6 -18 10 -40 10 -37 0 -40 2 -40 28 0 62 -13 105 -32 110 -15 4 -16 7 -7 13 8 4 16 3 20 -2 20 -34 444 -29 507 6 16 8 21 14 12 15 -13 0 -13 1 0 10 22 14 9 12 -41 -6 -63 -22 -228 -31 -240 -13 -23 37 -14 40 144 39 83 -1 153 2 155 7 2 9 -261 17 -297 8 -20 -5 -23 -11 -19 -40 2 -19 0 -35 -4 -35 -4 0 -8 34 -8 75 l0 75 138 0 137 -1 39 -33z m-344 -81 c0 -23 -4 -25 -44 -25 -55 0 -135 15 -177 34 -32 14 -27 14 94 15 l127 1 0 -25z m-683 -1 c8 -22 -15 -44 -26 -25 -10 16 -4 41 10 41 5 0 12 -7 16 -16z m323 -87 c0 -51 -5 -88 -12 -95 -9 -9 -9 -12 1 -12 9 0 12 -9 7 -32 -3 -18 -2 -57 3 -86 l8 -54 -56 6 c-70 8 -214 34 -263 47 l-38 10 0 54 0 55 46 0 c30 0 43 4 38 11 -4 7 -21 9 -45 5 l-39 -6 0 58 0 59 78 17 c60 13 189 35 265 45 4 1 7 -36 7 -82z m178 -96 l3 -131 -28 -11 c-15 -6 -43 -18 -62 -25 -18 -8 -36 -12 -39 -9 -12 11 -15 165 -3 165 6 0 11 5 11 11 0 5 -4 7 -10 4 -11 -7 -14 77 -4 136 l6 36 62 -23 61 -22 3 -131z m990 129 c20 -66 22 -167 5 -235 -8 -33 -18 -64 -23 -69 -5 -4 -67 -5 -139 -1 -129 7 -131 8 -124 29 4 11 8 47 8 79 0 52 2 57 23 57 12 0 22 5 22 10 0 6 -10 10 -22 10 -21 0 -23 5 -23 58 0 31 -4 67 -8 79 -8 21 -6 22 70 26 43 2 105 3 138 3 l59 -1 14 -45z m51 -259 c-5 -68 -14 -132 -19 -142 -12 -21 -59 -59 -74 -59 -6 0 2 9 18 20 45 29 55 57 61 176 7 108 11 141 20 132 2 -2 0 -59 -6 -127z m-1194 109 c-6 -10 10 -158 19 -167 3 -3 24 2 46 11 30 12 46 14 58 6 14 -9 13 -10 -7 -4 -15 4 -21 2 -17 -4 4 -6 -3 -8 -16 -5 -19 3 -20 2 -7 -6 11 -7 32 -6 69 4 30 8 85 17 123 21 l69 7 -4 -27 -3 -28 -128 -3 c-86 -2 -125 0 -121 7 4 6 1 9 -6 6 -8 -2 -15 -9 -18 -16 -2 -8 38 -12 135 -14 76 -2 140 -2 142 0 3 1 8 21 12 45 5 34 7 27 8 -39 l1 -82 35 -6 c20 -4 84 -6 142 -5 101 2 108 4 139 31 19 17 38 26 45 22 7 -4 60 -7 120 -7 59 0 114 -4 121 -9 9 -7 7 -8 -7 -3 -16 5 -18 4 -7 -6 34 -36 -20 -69 -113 -69 -89 0 -134 26 -126 73 2 16 -20 5 -35 -18 l-16 -25 -328 0 -328 0 -6 25 c-3 13 -23 36 -44 51 l-37 26 38 -6 c23 -5 37 -3 37 4 0 6 -51 10 -142 11 -149 1 -204 8 -179 23 7 5 83 7 169 5 l157 -4 -4 93 c-2 66 0 92 8 92 7 0 10 -4 6 -10z m-255 -140 l85 -19 -80 3 c-47 2 -81 8 -83 15 -6 19 -19 12 -18 -11 1 -24 -24 -33 -31 -12 -4 12 23 45 35 43 4 0 45 -9 92 -19z m820 -12 c36 -6 75 -12 87 -12 12 -1 19 -3 17 -5 -2 -2 1 -9 6 -16 7 -8 -27 -11 -135 -11 l-145 1 0 28 c0 26 2 27 53 27 28 0 81 -5 117 -12z m440 -48 c29 0 36 -4 36 -20 0 -25 -9 -25 -121 6 l-90 24 70 -5 c39 -3 86 -5 105 -5z m-1195 -19 c72 -5 120 -12 128 -20 10 -11 7 -12 -13 -6 l-25 7 23 -17 c12 -9 22 -22 22 -29 0 -33 -123 -56 -196 -36 -55 16 -66 36 -35 62 13 10 18 18 12 18 -18 0 -52 -40 -45 -52 4 -6 1 -9 -7 -6 -23 8 -16 41 11 55 14 8 41 11 60 8 31 -4 32 -4 10 6 -13 5 -34 8 -45 5 -27 -7 -66 4 -59 16 3 5 14 6 24 3 10 -3 71 -9 135 -14z" />
                  <path d="M800 410 c0 -5 20 -10 45 -10 25 0 45 5 45 10 0 6 -20 10 -45 10 -25 0 -45 -4 -45 -10z" />
                  <path d="M915 410 c-4 -6 12 -10 39 -10 25 0 46 5 46 10 0 6 -18 10 -39 10 -22 0 -43 -4 -46 -10z" />
                  <path d="M1025 410 c-4 -6 12 -10 39 -10 25 0 46 5 46 10 0 6 -18 10 -39 10 -22 0 -43 -4 -46 -10z" />
                  <path d="M260 410 c0 -5 18 -10 40 -10 22 0 40 5 40 10 0 6 -18 10 -40 10 -22 0 -40 -4 -40 -10z" />
                  <path d="M370 410 c0 -5 18 -10 40 -10 22 0 40 5 40 10 0 6 -18 10 -40 10 -22 0 -40 -4 -40 -10z" />
                  <path d="M590 410 c0 -5 18 -10 40 -10 22 0 40 5 40 10 0 6 -18 10 -40 10 -22 0 -40 -4 -40 -10z" />
                  <path d="M1644 435 c-4 -9 -19 -15 -35 -15 -16 0 -29 -4 -29 -10 0 -5 13 -10 29 -10 16 0 31 -6 35 -15 6 -17 36 -21 36 -5 0 6 -5 9 -12 8 -6 -2 -12 8 -12 22 0 15 6 24 13 22 7 -1 10 2 6 8 -9 15 -25 12 -31 -5z" />
                  <path d="M1470 410 c0 -5 18 -10 39 -10 22 0 43 5 46 10 4 6 -12 10 -39 10 -25 0 -46 -4 -46 -10z" />
                  <path d="M567 202 c-19 -20 -24 -102 -7 -102 6 0 10 22 10 48 0 26 5 53 12 60 7 7 10 12 7 12 -3 0 -13 -8 -22 -18z" />
                  <path d="M1281 113 l-24 -16 23 -19 c40 -33 165 -18 158 19 -2 9 -10 18 -18 20 -12 4 -13 3 -1 -5 7 -5 10 -15 7 -21 -10 -16 -26 -14 -26 4 0 8 -8 15 -17 14 -11 0 -13 -3 -5 -6 24 -10 11 -23 -23 -23 -19 0 -35 5 -35 10 0 6 5 10 12 10 6 0 8 3 4 7 -4 5 -14 -1 -22 -11 -11 -15 -17 -17 -26 -8 -18 18 -2 26 60 33 l57 6 -50 2 c-33 0 -59 -5 -74 -16z" />
                  <path d="M585 100 c4 -6 62 -10 140 -10 78 0 136 4 140 10 4 6 -45 10 -140 10 -95 0 -144 -4 -140 -10z" />
                  <path d="M282 135 c-60 -27 -12 -69 71 -62 59 5 89 29 66 52 -22 22 -98 28 -137 10z m129 -11 c6 -4 6 -11 -1 -19 -14 -17 -96 -15 -92 3 1 6 -2 12 -8 12 -5 0 -10 -7 -10 -16 0 -17 -22 -14 -28 4 -8 26 102 39 139 16z" />
                  <path d="M1280 742 c-21 -17 -21 -19 -5 -35 9 -9 26 -16 38 -16 20 1 21 2 2 6 -30 7 -41 21 -27 35 9 9 15 8 25 -6 8 -10 20 -16 28 -13 10 4 9 6 -3 6 -34 2 -18 21 17 21 35 0 51 -19 18 -21 -13 0 -14 -2 -4 -6 8 -3 20 2 27 12 7 9 17 14 23 10 20 -12 12 -24 -21 -34 -18 -5 -25 -10 -15 -10 26 -1 57 17 57 35 0 35 -121 47 -160 16z" />
                  <path d="M264 725 c-19 -15 -19 -15 5 -35 17 -14 36 -20 70 -18 38 1 40 2 11 5 -60 6 -80 13 -80 27 0 8 7 17 16 20 22 8 22 8 20 -11 -2 -25 63 -31 80 -8 7 10 18 14 25 9 9 -5 7 -11 -7 -22 -18 -14 -18 -14 -1 -8 10 3 21 6 23 6 13 0 1 31 -15 40 -30 15 -124 12 -147 -5z m120 -10 c-4 -9 -19 -15 -40 -15 -46 0 -43 18 4 23 20 2 38 4 39 5 1 1 0 -5 -3 -13z" />
                  <path d="M1613 663 c-21 -8 -15 -41 8 -48 25 -8 42 6 37 31 -3 19 -23 27 -45 17z m33 -14 c10 -17 -13 -36 -27 -22 -12 12 -4 33 11 33 5 0 12 -5 16 -11z" />
                  <path d="M1250 410 c0 -5 18 -10 40 -10 22 0 40 5 40 10 0 6 -18 10 -40 10 -22 0 -40 -4 -40 -10z" />
                  <path d="M1610 195 c-16 -19 -6 -45 18 -45 29 0 48 26 32 45 -16 19 -34 19 -50 0z m40 -21 c0 -9 -7 -14 -17 -12 -25 5 -28 28 -4 28 12 0 21 -6 21 -16z" />
                </g>
              </svg>
            </div>
            <div className="text-center">
              <span className="text-xs font-bold">
                ETAT DU VEHICULE A LA LIVRAISON
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div>
        {/* Signatures */}
        <div className="grid grid-cols-2">
          <div className="text-center border-r-2 border-black p-2">
            <div className="text-center mb-1">
              <span className="text-xs block text-right">
                عقد التوقيع المستأجر يقر بأن قراءة الشروط والأحكام المنصوص عليها
                على ظهر هذا الطلب
              </span>
              <span className="text-xs block">
                A la signature le locataire déclare avoir pris connaissance des
                clauses et conditions stipulées au verso du présent contrat
              </span>
            </div>
            <span className="text-xs font-medium mb-1 block">
              Signature du Locataire
            </span>
            <div className="flex justify-between px-4 mb-12">
              <div>
                <span className="text-xs">1er Locataire</span>
                <div className="border-t-2 border-black w-24 h-8 mt-1"></div>
              </div>
              {data.client2 && (
                <div>
                  <span className="text-xs">2ème Locataire</span>
                  <div className="border-t-2 border-black w-24 h-8 mt-1"></div>
                </div>
              )}
            </div>
          </div>
          <div className="text-center p-2">
            <span className="text-xs font-medium mb-1 block">
              SIGNATURE DE AZID CAR
            </span>
            <div className="border-t-2 border-black w-32 h-8 mt-1 mx-auto"></div>
            <div className="p-2">
              <div className="flex items-center">
                <span className="text-xs w-10 text-black">Fait à :</span>
                <span className="flex-1">{data.agence.ville}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs w-10 text-black">Le :</span>
                <span className="flex-1">
                  {formatDate(new Date().toISOString())}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div className="text-center mt-2 text-xs text-gray-700 space-y-1 p-2">
          <span className="block">
            أي ضرر يحدث للسيارة خلال فترة الكراء من طرف المستأجر مهما كان نوع
            الضرر مع أداء جميع المصاريف الناجمة عن ذلك
          </span>
          <span className="block">
            Chaque dommage touche a la société pendant la période de location,
            le locataire sera exposé a la responsabilité administrative et
            judiciaire jusqu&apos;a la décision finale, ainsi que le paiement de tous
            les frais résultants.
          </span>
        </div>
      </div>
    </div>
  );
});

ContractTemplate.displayName = "ContractTemplate";

export default ContractTemplate;
