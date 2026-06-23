// React
import { useState, useRef, useEffect,useMemo  } from 'react';
import { Modal } from "../components/Modal";
// usuario
import { useAuth } from '../contexts/AuthContext';
// Notificaciones
import { useNotification } from "../contexts/NotificationContext";
// Styles
import styles from "./QuotedRate.module.css";
// Context
import { useLanguage } from '../contexts/LanguageContext';
// Services
import { catalogService } from '../services/catalogsService';
import { GeneratePreviewQuotedRate } from '../services/pdfGeneratorService';
import {pricingControlService } from '../services/pricingControlService';
import { getCustomers} from '../services/customerService';
import { uploadDocuments,getDocumentTypes, getSections , deleteDocumentById, downloadDocument
} from "../services/digitizationService";
//interfaz o modelo
import type { VatOption, LanguageOption, CurrencyOption, StatusQuote,
    QuotedRate, ServiceItem , Shipment,
    Location, ServiceAssociated, CargoItem, Container
} from '../types/quotedRate';
import { UploadResponse } from "../types/digitization";
import { pdfGeneratorQuotedRate } from "../types/pdfGenerator";
//Servicio de la API
import { uploadQuotedRate, updateQuotedRate,
        updateStatusQuotedRate , GetQuotedRateByQuotationRequestAndControlInfo, updateStatusControlQuotedRate, archiveQuotedRate } from "../services/quotedRateServices";
// Icons
import {
        ArrowLeft, Save, Eye, FileText, User, Tag, Ship, Truck, Plane, Package, PlusCircle, Trash2, Search,
        Copy, Bold, Italic, Underline, List, ListOrdered, Image, Shield, Warehouse ,UserCheck,Puzzle ,Calendar  
} from "lucide-react";
import {  GrCloudDownload  } from "react-icons/gr";
import { AiFillCaretRight } from "react-icons/ai";
import { FaArrowUp } from "react-icons/fa";

export default function QuotedRate({ 
    onClose, 
    pricingData, 
    quotationRequestData 
}: any) {

//console.log("pricingData:", JSON.stringify(pricingData, null, 2));
//console.log("quotationRequestData:", JSON.stringify(quotationRequestData, null, 2));

const { t, language } = useLanguage();
const { showError, showSuccess, showNotification } = useNotification();
const { user } = useAuth();
const [activeTab, setActiveTab] = useState<'MARITIMO' | 'AEREO' | 'TERRESTRE'| 'ACCESORIAL'>('MARITIMO');

const [servicesCategory1, setServicesCategory1] = useState<any[]>([]);
const [servicesCategory2, setServicesCategory2] = useState<any[]>([]);
const [charges, setCharges] = useState<any[]>([]);
const [containers, setContainers] = useState<any[]>([]);
const [customer, setCustomer] = useState<any>(null);
const [Countries, setCountries] = useState<any[]>([]);
const [Ports, setPorts] = useState<any[]>([]);
const [Airports, setAirports] = useState<any[]>([]);

const [maritimeConcepts, setMaritimeConcepts] = useState<any[]>([]);
const [airConcepts, setAirConcepts] = useState<any[]>([]);
const [airOperationalConcepts, setAirOperationalConcepts] = useState<any[]>([]);
const [landConcepts, setLandConcepts] = useState<any[]>([]);
const [consultingServicesConcepts, setconsultingServicesConcepts] = useState<any[]>([]);
const [tags, setTags] = useState<any[]>([]);

const [exchangeRate, setExchangeRate] = useState<number>(1.0000);
const [currency, setCurrency] = useState("MXN");
const [currencyTo, setCurrencyTo] = useState("MXN");    // moneda destino (conversión)
const [languageFormat, setLanguage] = useState("mx");
const [idLanguage, setIdLanguage] = useState<number>(1);

const [termsValue, setTermsValue] = useState<string[]>([]);
const [quotedRateRegistradaInfo, setQuotedRateInfo] = useState<any>(null);
const idPrevious = !!quotedRateRegistradaInfo?.data?.[0]?._id;

const [validFrom, setValidFrom] = useState("");
const [validUntil, setValidUntil] = useState("");
const [previousVersionId, setPreviousVersionId] = useState<string | null>(null);
const [previousVersionCuote, setPreviousVersionCuote] = useState<number>(0);
const [selectedContact, setSelectedContact] = useState<any>(null);

const isProspect = !!quotationRequestData?.customer?.prospectName;
const [isAcceptedByClient, setIsAcceptedByClient] = useState(false);
const [isActive, setIsActive] = useState(false);
const hasDocument = isAcceptedByClient || isActive;

const [prospectAddress, setProspectAddress] = useState("");
const [manualContact, setManualContact] = useState({
    type: "",
    name: "",
    email: "",
    phone: ""
});

const [documentTypes, setDocumentTypes] = useState<any[]>([]);
const [sections, setSections] = useState<any[]>([]);

const [isSaving, setIsSaving] = useState(false);
const [isGenerating, setIsGenerating] = useState(false);
const [downloading, setDownloading] = useState(false);
const mainRef = useRef<HTMLDivElement>(null);

const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'info' | 'warning' | 'error' | 'success' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    confirmText?: string;
    cancelText?: string;
}>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
});

const [searchTerm, setSearchTerm] = useState('');

useEffect(() => {
    loadServices(); // cargas los servicios
    loadCharges(); //cargar los cargos
    loadContainers(); //cargar los contenedores
    loadClauses(); //cargar las condiciones
    consultarQuotedRateViva(); //consultamos si hay una tarifa existente
    loadCustomers() // obtener los clientes
    loadCountries()// cargamos los paises
    loadPorts()// cargamos los puertos
    loadAirports()// cargamos los aeropuertos
    loadDocumentTypes(); //cargamos tipos documentos
    loadSections(); // cargamos secciones
}, []);

const scrollToTop = () => {
    mainRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};
// --------------  consultamos si hay una tarifa existente ------------------- //
const consultarQuotedRateViva = async () => {
        if (!quotationRequestData?.referenceRequest || !pricingData?.control) {
            console.error("Parámetros inválidos");
            setQuotedRateInfo(null);
            return;
        }

        try {
        const response = await GetQuotedRateByQuotationRequestAndControlInfo(
            quotationRequestData.referenceRequest,
            pricingData.control
        );

        setQuotedRateInfo(response);  

    } catch (error) {
        console.error(error);
        setQuotedRateInfo(null);
    }
};

// --------------  construimos la direccion completa ------------------- //

const buildLocationString = (loc?: Location) => {
    if (!loc) {
        return {
            main: "N/A",
            extra: ""
        };
    }

    // ====== NORMALIZACIÓN ======
    const idCountry = loc.idCountry ?? loc._id_country;
    const countryCode = loc.countryCode ?? loc.country_code;
    const zip = loc.zipCode ?? loc.zip_code;
    const portCode = loc.portCode ?? loc.port_code;
    const airportCode = loc.airportCode ?? loc.airport_code;

    // ====== COUNTRY ======
    const country = Countries.find(
        (c) => String(c._Id) === String(idCountry)
    );

    //const countryName = country?.name_country || countryCode || "N/A";
    const countryName = countryCode || "N/A";

    // ====== PORT ======
    const port = Ports.find(
        (p) => p.port_code === portCode
    );

    // ====== MAIN ======
    const main = [
        loc.city,
        countryName
    ]
    .filter(Boolean)
    .join(", ");

    // ====== EXTRA INFO ======
    const extras = [
        zip && `CP ${zip}`,
        portCode && `Puerto ${portCode}`,
        airportCode && `Aeropuerto ${airportCode}`
    ]
    .filter(Boolean)
    .join(" • ");

    return {
        main,
        extra: extras
    };
};

// --------------  cargamos el catalogo de los servicios ------------------- //
const loadServices = async () => {
    try {     
    const servicesData = await catalogService.getServices();

    if (!servicesData?.data) return;
    const servicescat1 = servicesData.data.filter((s: any) => s.category === 1);
    const servicescat2 = servicesData.data.filter((s: any) => s.category === 2);

    setServicesCategory1(servicescat1);
    setServicesCategory2(servicescat2);

    } catch (error) {
        console.error('Error loading services:', error);
    }
};

// --------------  cargamos  el catalogo de los cargos ------------------- //
const loadCharges = async () => {
    try {     
        const chargesData = await catalogService.getCharges();

        if (!chargesData?.data) return;

        setCharges(chargesData.data);

    } catch (error) {
        console.error('Error loading charges:', error);
    }
};

// --------------  cargamos  el catalogo de los contenedores ------------------- //
const loadContainers = async () => {
    try {     
        const containersData = await catalogService.getContainers();

        if (!containersData?.data) return;

        setContainers(containersData.data);

    } catch (error) {
        console.error('Error loading charges:', error);
    }
};


// --------------  cargamos  el catalogo de los paises ------------------- //
const loadCountries = async () => {
    try {     
        const countriesData = await catalogService.getCountries();

        if (!countriesData?.data) return;

        setCountries(countriesData.data);

    } catch (error) {
        console.error('Error loading countries:', error);
    }
};

// --------------  cargamos  el catalogo de los puestos ------------------- //
const loadPorts = async () => {
    try {     
        const portsData = await catalogService.getPorts();

        if (!portsData?.data) return;

        setPorts(portsData.data);

    } catch (error) {
        console.error('Error loading ports:', error);
    }
};
// --------------  cargamos  el catalogo de los aeropuertos ------------------- //
const loadAirports = async () => {
    try {     
        const airportsData = await catalogService.getAirports();

        if (!airportsData?.data) return;

        setAirports(airportsData.data);

    } catch (error) {
        console.error('Error loading airports:', error);
    }
};
// --------------  cargamos  la dirección y contactos del cliente ------------------- //

async function loadCustomers() {
    try {
        const customersData = await getCustomers();

        const found = customersData.find(
            (c: any) => c.id === pricingData?.id_customer
        );

        setCustomer(found);

    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

const customerAddress = useMemo(() => {
    if (!customer?.addresses?.length) return '';

    const addr = customer.addresses.find((a: any) => a.status === 1)
        || customer.addresses[0];

    return [
        addr.street,
        addr.city,
        addr.state,
        addr.postalCode,
        addr.country
    ]
    .filter(Boolean)
    .join(', ');

}, [customer]);

const customerContacts = useMemo(() => {
    if (!customer?.contacts?.length) return [];

    return customer.contacts;
}, [customer]);

useEffect(() => {
    if (customerContacts.length > 0 && !selectedContact) {
        setSelectedContact(customerContacts[0]);
    }
}, [customerContacts]);

const loadDocumentTypes = async () => {
    try {

        const data = await getDocumentTypes();

        if (!data) return;

        setDocumentTypes(data);

    } catch (error) {
        console.error("Error loading document types:", error);
    }
};

const loadSections = async () => {
    try {

        const data = await getSections();

        if (!data) return;

        setSections(data);

    } catch (error) {
        console.error("Error loading sections:", error);
    }
};
// --------------  cargamos  el catalogo de clausulas ------------------- //

async function loadClauses() {
    try {
        const clausules = await catalogService.getClauses();
        setTags(clausules.data.filter((c: any) => c.status === 1));

    } catch (error) {
        console.error('Error loading tags:', error);
    }
}

const filteredTags = useMemo(() => {
    return tags.filter((item: any) => {
        const search = searchTerm.toLowerCase();

        const inTitle = item.title?.toLowerCase().includes(search);

        const inTags = item.tags?.some((t: string) =>
            t.toLowerCase().includes(search)
        );

        return inTitle || inTags;
    });
}, [tags, searchTerm]);

/*          Catalogo del IVA             */
const VAT_OPTIONS: VatOption[] = [
    { idVar: 1, label: "N/A", rate: 0, value: -1 },
    { idVar: 2, label: "0%",  rate: 0, value: 0 },
    { idVar: 3, label: "4%",  rate: 4, value: 4 },
    { idVar: 4, label: "8%",  rate: 8, value: 8 },
    { idVar: 5, label: "16%", rate: 16, value: 16 }
];

/*          Catalogo de idiomas             */
const LANGUAGE_OPTIONS: LanguageOption[] = [
    { idLang: 1, labelSpanish: "Español (México)", labelEnglish: "Spanish (Mexico)", value: "mx" },
    { idLang: 2, labelSpanish: "Español (España)", labelEnglish: "Spanish (Spain)", value: "es" },
    { idLang: 3, labelSpanish: "Inglés", labelEnglish: "English", value: "en" }
];

/*          Catalogo de status quote         */
const STATUS_QUOTE: StatusQuote[] = [
    { idStatusQ: 1, labelSpanish: "Borrador", labelEnglish: "Draft" },
    { idStatusQ: 2, labelSpanish: "Vigente", labelEnglish: "Active" },
    { idStatusQ: 3, labelSpanish: "No vigente", labelEnglish: "Inactive" },
    { idStatusQ: 4, labelSpanish: "Reemplazada", labelEnglish: "Replaced" },
    { idStatusQ: 5, labelSpanish: "Aceptada por el cliente", labelEnglish: "Accepted by the client" },
    { idStatusQ: 6, labelSpanish: "Rechazada por el cliente", labelEnglish: "Rejected by the client" }
];

const [selectedStatus, setSelectedStatus] = useState<StatusQuote>(STATUS_QUOTE[0]);


/*          Catalogo del monedas             */
const CURRENCY_OPTIONS:CurrencyOption[] = [
    { idCurrency: 1, label: "MXN", value: "MXN" }
    ,{ idCurrency: 2, label: "USD", value: "USD" }
    //,{ idCurrency: 3, label: "EUR", value: "EUR" }
];

// -------------- catalogo de iconos de servicios , categoria 1 y 2------------------- //
const serviceIconsCategory1ById: Record<number, JSX.Element> = {
    1: <Ship size={18} />, // Maritimo LCL
    2: <Ship size={18} />, // Maritimo FCL
    3: <Truck size={18} />, // Terrestre FTL
    4: <Truck size={18} />, // Terrestre LTL
    5: <Plane size={18} />, // Aereo
    6: <Warehouse size={18} />, // Almacén
    10: <Truck size={18} />, //Terrestre FCL
    11: <Truck size={18} />, //Terrestre LCL
};

const serviceIconsCategory2ById: Record<number, JSX.Element> = {
    7: <Shield size={14} />,     // Despacho
    8: <Package size={14} />,    // Paquetería
    9: <Package size={14} />,    // UVA
    12: <Shield size={14} />,    // Seguro
    13: <Warehouse size={14} />, // Maniobra
    14: <Search size={14} />,    // Inspección
    15: <Truck size={14} />,     // Custodia
    16: <Package size={14} />,   // Free hand
    17: <Search size={14} />,    // Previo en origen
};

// --------------  consultamos el lenguaje si fue previamente registrado  ------------------- //
const getLanguage = (item: any): { value: string; id: number } | null => {
    if (!item) return null;

    let langFound;

    if (item.id_language) {
        langFound = LANGUAGE_OPTIONS.find(
        (l) => l.idLang === item.id_language
        );
    } else if (item.language) {
        langFound = LANGUAGE_OPTIONS.find(
        (l) => l.value === item.language
        );
    }

    if (!langFound) return null;

    return {
        value: langFound.value,
        id: langFound.idLang
    };
};

useEffect(() => {
    const item = quotedRateRegistradaInfo?.data?.[0];
    if (!item) return;

    // ================== FORMATO FECHA ==================
    const formatDate = (date: string | Date) => {
    return new Date(date).toISOString().split("T")[0];
    };

    const safeNum = (n: any) => Number(n ?? 0);
    const safeVat = (v: any) => String(v ?? "-1");
    const safeRate = (r: any) => Number(r ?? 0);

    const mapCommon = (c: any, i: number) => ({
        id: `${Date.now()}-${i}`,
        _id_type_of_charge: c._id_type_of_charge
            ? Number(c._id_type_of_charge)
            : 0,
        type_of_charge: c.type_of_charge
            ? String(c.type_of_charge)
            : "",
        concept: c.concept ?? "",
        billing_base: c.billing_base ?? "",
        unit: safeNum(c.unit),
        subtotal: safeNum(c.subtotal),
        vat: safeVat(c.vat),
        rate: safeRate(c.rate), 
        total: safeNum(c.total)
    });

    const today = formatDate(new Date());

        // ================== status quote ==================
    if (item?._id_status_quote) {
        const found = STATUS_QUOTE.find(
            s => s.idStatusQ === item._id_status_quote
        );

        if (found) {
            setSelectedStatus(found);
        }
    }

    // ================== STATUS ==================
    const accepted =item._id_status_quote === 5; // 5 = Aceptada por el cliente

    setIsAcceptedByClient(accepted);

    const active =item._id_status_quote === 2; // 2-  activo

    setIsActive(active);

    // ================== IDIOMA ==================
    const lang = getLanguage(item);
    if (lang) {
        setLanguage(lang.value);
        setIdLanguage(lang.id);
    }

    // ================== CONTACTO ==================
    const contactRegister = item?.customer_contact;

    if (contactRegister) {
    const foundContact = customerContacts.find(
        (c: any) => c.email === contactRegister.email
    );

    if (foundContact) {
        // Cliente normal
        setSelectedContact(foundContact);
    } else {
        // Prospecto (aunque falten campos)
        setManualContact({
        type: contactRegister.type || "",
        name: contactRegister.name || "",
        email: contactRegister.email || "",
        phone: contactRegister.phone || ""
        });

        setSelectedContact(null);
    }
    }
    // ================== DIRECCIÓN ==================
    const addressFromDB = item?.customer_address;

    if (addressFromDB) {
    // si es prospecto → guardar en input manual
    if (isProspect) {
        setProspectAddress(addressFromDB);
    } 
    }
    // ================== MONEDA ==================
    if (CURRENCY_OPTIONS.some(c => c.value === item.currency)) {
        setCurrency(item.currency);
    }
    // ================== MONEDA EQUI ==================

    if (CURRENCY_OPTIONS.some(c => c.value === item.targetcurrecy)) {
    setCurrencyTo(item.targetcurrecy);
    }   

    // ================== previous_version_id ==================
    setPreviousVersionId(item.previous_version_id ?? null); // si la version id es null y le doy generar, es un insert

    // ================== previous_version_cuote ==================
    setPreviousVersionCuote(Number(item.previous_version_cuote ?? 0)); // si la version es 1 y le doy generar, es un insert

    // ================== TIPO DE CAMBIO ==================
    const tc = Number(item.exchange);
    if (!isNaN(tc) && tc > 0) {
        setExchangeRate(tc);
    }

    // ================== FECHAS VALIDEZ DE LA OFERTA ==================
    setValidFrom(item.valid_from ? formatDate(item.valid_from) : today);
    setValidUntil(item.valid_until ? formatDate(item.valid_until) : today);

    // ================== COMMENTS ==================
    if (editorRef.current) {
        editorRef.current.innerHTML = item.comments || "";
    }

    // ================== CONDITIONS ==================
    setTermsValue(item.conditions || "");

    // ================== CONCEPTOS ==================
    const charges = item?.details?.[0]?.charges || {};

    setMaritimeConcepts(
    (charges.maritime || []).map((c: any, i: number) => ({
            ...mapCommon(c, i),
            container_type: c.container_type ?? "",
            service_type: 1
        }))
    );

    setAirConcepts(
        (charges.air?.airline_costs || []).map((c: any, i: number) => ({
            id: `${Date.now()}-air-${i}`,
            service_type: 2,
            concept: c.concept ?? "",
            airline: c.airline ?? "",
            route: c.route ?? "",
            transit_days: c.transit_days ?? "",
            rate_per_kg: c.rate_per_kg ?? "",
            fuel_surcharge: c.fuel_surcharge ?? "",
            security_surcharge: c.security_surcharge ?? "",
            miscellaneous_charges: c.miscellaneous_charges ?? "",
            chargeable_weight: c.chargeable_weight ?? "",
            subtotal: safeNum(c.subtotal),
            vat: safeVat(c.vat),
            rate: safeRate(c.rate),
            total: safeNum(c.total)
        }))
    );

    setAirOperationalConcepts(
        (charges.air?.operational_costs || []).map((c: any, i: number) => ({
            ...mapCommon(c, i),
            service_type: 2
        }))
    );

    setLandConcepts(
        (charges.land || []).map((c: any, i: number) => ({
            ...mapCommon(c, i),
            service_type: 3
        }))
    );

    setconsultingServicesConcepts(
        (charges.consulting_services || []).map((c: any, i: number) => ({
            ...mapCommon(c, i),
            service_type: 4
        }))
    );

    // ================== AUTO TAB  SI TENGO CONCEPTOS CAPTURADOS==================
    const hasMaritime = (charges.maritime || []).length > 0;
    const hasAir =
    (charges.air?.airline_costs || []).length > 0 ||
    (charges.air?.operational_costs || []).length > 0;
    const hasLand = (charges.land || []).length > 0;
    const hasConsulting = (charges.consulting_services || []).length > 0;

    if (hasMaritime) {
    setActiveTab('MARITIMO');
    } else if (hasAir) {
    setActiveTab('AEREO');
    } else if (hasLand) {
    setActiveTab('TERRESTRE');
    } else if (hasConsulting) {
    setActiveTab('ACCESORIAL');
    }

}, [quotedRateRegistradaInfo]);

// ================== CALCULO TOTAL en catalogos conceptos ================== //
const calculateTotal = (subtotal: number, vat: number) => {
    const base = subtotal;

    if (vat === -1) return base;

    return base * (1 + vat / 100);
};

const calculateAirSubtotal = (row: any) => {
    const rate = Number(row.rate_per_kg || 0);
    const fuel = Number(row.fuel_surcharge || 0);
    const security = Number(row.security_surcharge || 0);
    const misc = Number(row.miscellaneous_charges || 0);
    const weight = Number(row.chargeable_weight || 0);
    return (rate + fuel + security + misc) * weight;
};

const handleChangeGeneric = (
    index: number,
    field: string,
    value: any,
    list: any[],
    setList: Function
) => {
    const updated = [...list];
    updated[index][field] = value;

    const subtotal = Number(updated[index].subtotal || 0);
    const vat = Number(updated[index].vat ?? 0);

    updated[index].total = calculateTotal(subtotal, vat);

    setList(updated);
};

const handleAddGeneric = (setList: Function, template: any) => {
    setList((prev: any[]) => [
        ...prev,
        { id: Date.now(), ...template }
    ]);
};

// ================== TEMPLATES ================== //
// Plantillas base para crear nuevos conceptos por tipo de servicio.
// Se usan en handleAddGeneric para inicializar cada fila con valores por defecto.

const maritimeTemplate = {
    service_type: 1,
    _id_type_of_charge: 0,
    type_of_charge: "",
    concept: "",
    billing_base: "",
    container_type: "",
    unit: 0,
    subtotal: 0,
    vat: -1,
    rate: 0,
    total: 0
};

const airTemplate = {
    service_type: 2,
    concept: "",
    airline: "",
    route: "",
    transit_days: "",
    rate_per_kg: 0,
    fuel_surcharge: 0,
    security_surcharge: 0,
    miscellaneous_charges: 0,
    chargeable_weight:0,
    subtotal: 0,
    vat: -1,
    rate: 0,
    total: 0
};

const airOperationalTemplate = {
    service_type: 2,
    _id_type_of_charge: 0,
    type_of_charge: "",
    concept: "",
    billing_base: "",
    subtotal: 0,
    vat: -1,
    rate: 0,
    total: 0
};

const landTemplate = {
    service_type: 3,
    _id_type_of_charge: 0,
    type_of_charge: "",
    concept: "",
    billing_base: "",
    unit: 0,
    subtotal: 0,
    vat: -1,
    rate: 0,
    total: 0
};

const consultingServicesTemplate = {
    service_type: 4,
    _id_type_of_charge: 0,
    type_of_charge: "",
    concept: "",
    billing_base: "",
    unit: 0,
    subtotal: 0,
    vat:-1,
    rate: 0,
    total: 0
};

// ================== ADD CONCEPT ================== //
// Estas funciones agregan una nueva fila de concepto  usando un template base y asignando un id único .

const handleAddConcept = () => handleAddGeneric(setMaritimeConcepts, maritimeTemplate);
const handleAddAirConcept = () => handleAddGeneric(setAirConcepts, airTemplate);
const handleAddAirOperationalConcept = () => handleAddGeneric(setAirOperationalConcepts, airOperationalTemplate);
const handleAddLandConcept = () => handleAddGeneric(setLandConcepts, landTemplate);
const handleAddConsultingServicesConcept = () => handleAddGeneric(setconsultingServicesConcepts, consultingServicesTemplate);

// ================== CHANGE HANDLERS ================== //
// Actualizan un campo específico de un concepto en la lista, También recalculan automáticamente el total considerando:
// - subtotal
// - IVA
// - tipo de cambio (exchangeRate)
const handleChange = (i: number, f: string, v: any) => handleChangeGeneric(i, f, v, maritimeConcepts, setMaritimeConcepts);
const handleChangeAirOperational = (i: number, f: string, v: any) => handleChangeGeneric(i, f, v, airOperationalConcepts, setAirOperationalConcepts);
const handleChangeLand = (i: number, f: string, v: any) => handleChangeGeneric(i, f, v, landConcepts, setLandConcepts);
const handleChangeConsultingServices = (i: number, f: string, v: any) => handleChangeGeneric(i, f, v, consultingServicesConcepts, setconsultingServicesConcepts);


const handleChangeAir = (index: number, field: string, value: any ) => {

    const updated = [...airConcepts];
    updated[index][field] = value;

    // calcular subtotal automáticamente
    const subtotal = calculateAirSubtotal(updated[index]);
    updated[index].subtotal = subtotal;

    // IVA
    const vat = Number(updated[index].vat ?? 0);
    updated[index].total = calculateTotal(subtotal, vat);
    setAirConcepts(updated);
};

// ================== calculo de los totales de acuerdo a cada tipo de cargo capturado================== //
const allConcepts = [
    ...maritimeConcepts,
    ...airConcepts,
    ...airOperationalConcepts,
    ...landConcepts,
    ...consultingServicesConcepts
];

const breakdownByCharge = useMemo(() => {
    const map: Record<string, any> = {};

    allConcepts.forEach((c) => {

        const key = c._id_type_of_charge != null && c._id_type_of_charge !== ""
            ? String(c._id_type_of_charge)
            : "SIN_CARGO";

        if (!map[key]) {
            map[key] = {
                _id_type_of_charge: key,
                subtotal: 0,
                vat: 0,
                total: 0
            };
        }

        const subtotal = Number(c.subtotal || 0);
        const vatRate = Number(c.vat || 0);
        const vatAmount = vatRate === -1 ? 0 : subtotal * (vatRate / 100);
        const total = subtotal + vatAmount;

        map[key].subtotal += subtotal;
        map[key].vat += vatAmount;
        map[key].total += total;
    });

    return Object.values(map);
}, [
    maritimeConcepts,
    airConcepts,
    airOperationalConcepts,
    landConcepts,
    consultingServicesConcepts
]);

const getChargeName = (id: string) => {
    const found = charges.find(
    (c: any) => String(c._IdCharge) === String(id)
    );

    return found?.chargeName || t('tvf.NoCharge');
};
// ================== calculo de los totales de acuerdo al resumen ================== //
const totals = useMemo(() => {
    const allConcepts = [
        ...maritimeConcepts,
        ...airConcepts,
        ...airOperationalConcepts,
        ...landConcepts,
        ...consultingServicesConcepts
    ];

    const subtotal = allConcepts.reduce(
    (acc, row) => acc + Number(row.subtotal || 0),
    0
    );

    const vat = allConcepts.reduce((acc, row) => {
    const base = Number(row.subtotal || 0);
    const rate = Number(row.vat || 0);
    return acc + (rate === -1 ? 0 : base * (rate / 100));
}, 0);

    const total = subtotal + vat;

    return { subtotal, vat, total };
}, [
    maritimeConcepts,
    airConcepts,
    airOperationalConcepts,
    landConcepts,
    consultingServicesConcepts
]);

// ================== INPUT DE LA IMAGEN ================== //

const fileInputRef = useRef<HTMLInputElement>(null);

const openImagePicker = () => {
    fileInputRef.current?.click();
};

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);

    const wrapper = document.createElement("div");
    wrapper.style.display = "inline-block";
    wrapper.style.resize = "both";
    wrapper.style.overflow = "hidden";
    wrapper.style.width = "200px";

    const img = document.createElement("img");
    img.src = reader.result as string;
    img.style.width = "100%";
    img.style.height = "auto";
    img.style.display = "block";

    wrapper.appendChild(img);

if (range) {
    range.insertNode(wrapper);
} else {
    editor.appendChild(wrapper);
}
};

    reader.readAsDataURL(file);

    e.target.value = "";
};

const editorRef = useRef<HTMLDivElement>(null);
const [lastSaved, setLastSaved] = useState("");

const exec = (command: string) => {
const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
  // Si no hay cursor activo, lo ponemos al final
    if (!selection || selection.rangeCount === 0) {
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    document.execCommand(command, false);
};

// ================== preparamos el modelo================== //
const mapServicesFromPricing = (
  services: any[] = []
): ServiceItem[] => {

  return services.map((s, index): ServiceItem => {

    const hasShipments = Array.isArray(s.shipments) && s.shipments.length > 0;

    return {
      id_service_item: s.idServiceItem,
      _id_service: s.idService,
      category: getCategoryByServiceId(s.idService),
      service_name: s.nameService,

      // =========================
      // SHIPMENTS
      // =========================
      shipments: hasShipments
        ? s.shipments.map((sh: any, i: number): Shipment => {
            return {
              id_shipment: sh.idShipment,
              origin: {
                _id_country: sh.origin?.idCountry ?? "",
                country_code: sh.origin?.countryCode ?? "",
                city: sh.origin?.city ?? "",
                zip_code: sh.origin?.zipCode ?? 0,
                port_code: sh.origin?.portCode ?? "",
                airport_code: sh.origin?.airportCode ?? "",
              },
              destination: {
                _id_country: sh.destination?.idCountry ?? "",
                country_code: sh.destination?.countryCode ?? "",
                city: sh.destination?.city ?? "",
                zip_code: sh.destination?.zipCode ?? 0,
                port_code: sh.destination?.portCode ?? "",
                airport_code: sh.destination?.airportCode ?? "",
              },
              _id_shipment_type: sh.idTypeShipment ?? 0,
              shipment_type_name: sh.typeShipment ?? "",
              _id_operation_type: sh.idTypeOperation ?? 0,
              operation_type_name: sh.typeOperation ?? "",
              _id_incoterm: sh.idIncoterm ?? 0,
              incoterm: sh.incoterm ?? "",
              services_asociated: Array.isArray(sh.servicesAsociated)
                ? sh.servicesAsociated.map((a: any): ServiceAssociated => ({
                    _id_service_associated: a.idServiceAsociated,
                    service_associated_name: a.serviceAsociatedName,
                  }))
                : [],
              cargo: Array.isArray(sh.cargo)
                ? sh.cargo.map((c: any): CargoItem => ({
                    merchandise: c.name ?? "",
                    weight_total: c.weigthTotal ?? 0,
                    unit_weight: c.unitWeight ?? "",
                    volume_total: c.volumeTotal ?? 0,
                    unit_measurement: c.unitMeasurement ?? "",
                  }))
                : [],
              containers: Array.isArray(sh.containers)
                ? sh.containers.map((c: any): Container => ({
                    _id_container: c.containerId,
                    name_type: c.nameType,
                    quantity: c.quantity,
                    gross_weight: c.grossWeight,
                    comodity: c.commodity,
                  }))
                : [],
            };
          })
        : [],

      // =========================
      // ORDER SERVICE
      // =========================
      order_service: !hasShipments && s.orderService
        ? (() => {
            const os = s.orderService;

            return {
              origin: {
                _id_country: os.origin?.idCountry ?? "",
                country_code: os.origin?.countryCode ?? "",
                city: os.origin?.city ?? "",
                zip_code: os.origin?.zipCode ?? 0,
                port_code: os.origin?.portCode ?? "",
                airport_code: os.origin?.airportCode ?? "",
              },

              destination: os.destination
                ? {
                    _id_country: os.destination?.idCountry ?? "",
                    country_code: os.destination?.countryCode ?? "",
                    city: os.destination?.city ?? "",
                    zip_code: os.destination?.zipCode ?? 0,
                    port_code: os.destination?.portCode ?? "",
                    airport_code: os.destination?.airportCode ?? "",
                  }
                : undefined,

              _id_shipment_type: os.idTypeShipment ?? null,
              shipment_type_name: os.typeShipment ?? "",
              _id_operation_type: os.idTypeOperation ?? null,
              operation_type_name: os.typeOperation ?? "",

              departure_date_approximate:
                os.departureDateAproximate ?? undefined,

              projection_shipment: os.projectionShipment
                ? {
                    num: os.projectionShipment.num ?? null,
                    _id_measurement_frequency:
                      os.projectionShipment._id_measurement_frequency ?? null,
                    measurement_frequency:
                      os.projectionShipment.measurement_frequency ?? "",
                    frequency:
                      os.projectionShipment.frequency ?? "",
                  }
                : undefined,

              comments: os.comments ?? "",

              cargo: Array.isArray(os.cargo)
                ? os.cargo.map((c: any): CargoItem => ({
                    merchandise: c.name ?? "",
                    weight_total: c.weigthTotal ?? 0,
                    unit_weight: c.unitWeight ?? "",
                    volume_total: c.volumeTotal ?? 0,
                    unit_measurement: c.unitMeasurement ?? "",
                  }))
                : [],
            };
          })()
        : undefined,
    };
  });
};

// obtener cual es la categoria dependiendo de mi idservicio
const getCategoryByServiceId = (idService: number): number => {
    const existsInCat1 = servicesCategory1.some(s => s._Id === idService);
    if (existsInCat1) return 1;

    const existsInCat2 = servicesCategory2.some(s => s._Id === idService);
    if (existsInCat2) return 2;

    return 1; // default por seguridad
};

const toUTCDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toISOString();
};

//modal que notifica que se va a generar una nueva tarifa de venta
const handleGenerateWithConfirm = () => {

    if (isGenerating) return; //evita doble clic

    const currentVersion = (quotedRateRegistradaInfo?.data?.[0]?.version ?? 0) + 1;

    setModalState({
        isOpen: true,
        type: 'confirm',
        title: t('tvf.GenerateTitle'),
        message: t('tvf.GenerateConfirmMessage', { 
            values: { version: currentVersion }
        }),
        showCancel: true,
        confirmText: t('tvf.Generate'),         
        cancelText: t('tvf.GenerateCancel'),
        onConfirm: async () => {
            if (isGenerating) return;

            setIsGenerating(true);
            try {
                await handleSaveQuotedRate(STATUS_QUOTE[1], true);
            } finally {
                setIsGenerating(false);
            }
        }
    });
};

//modal que notifica que se va a planchar el estatus anterior (activo o aceptado por el cliente)
const handleDraftWithValidation = () => {
    
    if (isSaving) return; // evitar doble clic
    setIsSaving(true);

    try {

    const current = quotedRateRegistradaInfo?.data?.[0];

    const currentStatusId = current?._id_status_quote;

    // buscar el estatus en tu catálogo
    const statusObj = STATUS_QUOTE.find(s => s.idStatusQ === currentStatusId);

    // obtener label según idioma
    const statusLabel = language === "es"
        ? statusObj?.labelSpanish
        : statusObj?.labelEnglish;

    // Si ya está Activo o Aceptado
    if (currentStatusId === 2 || currentStatusId === 5) {

        const message =
            t('tvf.ChangeStatusToDraftMessagept1') +
            '"' +
            (statusLabel || '') +
            '". ' +
            t('tvf.ChangeStatusToDraftMessagept2');

        setModalState({
            isOpen: true,
            type: 'confirm',
            title: t('tvf.WarningTitle'),
            message: message,
            showCancel: true,
            confirmText: t('tvf.UpdateToDraft'),  
            cancelText: t('tvf.Cancel'),
            onConfirm: async () => {
                await handleSaveQuotedRate(STATUS_QUOTE[0], false);
            }
        });

        return;
    }

    // Si no hay conflicto → guardar directo
    handleSaveQuotedRate(STATUS_QUOTE[0], false);

    } finally {
        setIsSaving(false); // liberar botón
    }
};


const handleSaveQuotedRate = async (
    statusOverride?: StatusQuote,
    isGenerateAction: boolean = false
) => {
    try {

        // validacion que si dejan un concepto sin capturar completo, solo requerido subtotal y concepto notifique
        if (!validateConcepts()) return;

        //validacion de datos numericos en los conceptos
        if (!validateConceptsNumers()) return;

        // si hay conceptos capturados con importes mayores a 0
        if (!validateTotal()) return;

    const current = quotedRateRegistradaInfo?.data?.[0]; //registro anterior

    const idQuoteRate = current?._id ?? null;

    const statusToUse = statusOverride || selectedStatus;

    const isGenerate = statusToUse.idStatusQ === 2; // Active = Generate
    
    const validationErrors = validateRequiredFields();

    let isSuccess = true;  //RESPUESTA del upload o update de la tarifa de venta

    const calculatedVersion = idPrevious //obtener la nueva version o no, dependiendo de la modalidad
    ? isGenerate
        ? (current?.version || 0) + 1
        : (current?.version || 0)
    : 0;

    let _iddoc = "";

    if (validationErrors.length > 0) {

        showNotification('warning',
            validationErrors[0]
        );

        return;
    }

    if (isGenerate) {

        const pdfResponse = await generateAndUploadPdf(calculatedVersion);

        _iddoc = pdfResponse.documentId;

        if (!pdfResponse.success) {
            isSuccess = false;
        }

    }

    const payload: QuotedRate = buildQuotedRatePayload(
        current,
        calculatedVersion,
        statusToUse,
        _iddoc
    );
        //pruebas 
        //console.log("Payload:", JSON.stringify(payload, null, 2)); //pruebas 

        // ============================
        // SWITCH CREATE / UPDATE
        // ============================
        // valiable del responsse
        const validateResponse = (res: any, successCodes = [200, 201, 204]) => {
        if (!successCodes.includes(res?.codeStatus)) {
            throw new Error(res?.messageStatus || 'Error en la operación');
        }
        return res;
        };

        let response;

        let responseUpdateStatus;

        let responseUpdateArchived;

        let idNewQuotedRate;

        try {
        const isUpdate = !isGenerateAction && idQuoteRate !== null; //borrador update
        const isFirstDraft = !isGenerateAction && idQuoteRate == null; //primer borrador upload
        const isGenerateWithPrev = isGenerateAction && previousVersionId !== null && isGenerate; //se genera una nueva de version >0
        const isGenerateWithoutPrev = isGenerateAction && previousVersionId == null && isGenerate; //se genera una nueva de version 0

        // -------- UPDATE --------
        if (isUpdate) {
            response = validateResponse(
            await updateQuotedRate(current?.quote_number, payload)
            );

            if (response?.codeStatus === 200) { //update code 200
                showSuccess(
                `${t('tvf.UpdateOK')} ${response?.atrribute?.value ?? ''}`
                );
            } else {
                isSuccess = false;
                showError(
                `${t('tvf.UpdateStatusError')} ${response?.messageStatus ?? ''}`
                );
            }

        }

        // -------- CREATE (todos los casos de creación) --------
        if (isFirstDraft || isGenerateWithPrev || isGenerateWithoutPrev) {
            response = validateResponse(
            await uploadQuotedRate(
                quotationRequestData?.referenceRequest || "",
                pricingData?.control || "",
                payload
            ),
            [201] // normalmente create = 201
            );

            const attr = response?.atrribute?.value;

            idNewQuotedRate = attr?._id

            if (response?.codeStatus === 201) { //code status 201 create
                showSuccess(
                `${t('tvf.GenerateOK')} ${attr?.quote_number ?? ''}/v${attr?.version ?? 0}`
                );
            } else {
                isSuccess = false;
                showError(
                `${t('tvf.GenerateError')} ${response?.messageStatus ?? ''}`
                );
            }

            // -------- UPDATE STATUS (solo si es generate + create OK de la tarifa venta) --------
            if (
                (isGenerateWithPrev || isGenerateWithoutPrev) &&
                response?.codeStatus === 201 // si se creo el documento correctamente
            ) 
            {
                responseUpdateStatus = validateResponse(
                await updateStatusQuotedRate(current?._id, 4) //Reemplazada
                );

                if (responseUpdateStatus?.codeStatus !== 200) { // code status 200 para update
                isSuccess = false;
                showError(
                    `${t('tvf.UpdateStatusError')} ${
                    responseUpdateStatus?.messageStatus ?? ''
                    }`
                );
                }

                responseUpdateArchived = validateResponse(
                await archiveQuotedRate(current?._id, true) //archivando la tarifa de venta 
                );

                if (responseUpdateArchived?.codeStatus !== 200) { // code status 200 para update
                isSuccess = false;
                showError(
                    `${t('tvf.UpdateArchivedError')} ${
                    responseUpdateArchived?.messageStatus ?? ''
                    }`
                );
                }

            }

        }

        // -------- DELETE DOCUMENT (solo si hay documento previo) --------
		// se debe borrar el documento anterior en gcs y datastate 0
        if (isGenerateWithPrev && current?._iddocument) {
            try {
            const deleteRes = await deleteDocumentById(
                current._iddocument,
                {
                iduser: user?._id || "",
                nameemployee: user?.name || "",
                }
            );

            validateResponse(deleteRes, [200, 204]);

            //showSuccess(t('dig.deleteSuccess'));
            } 
            catch (error: any) 
            {
            isSuccess = false;
            console.error(error);
            showError(error?.message || t('dig.deleteError'));
            }
        }

        } catch (error: any) {
        console.error(error);
        showError(error?.message || t('tvf.GeneralError'));
        }


        // ============================
        // RESPUESTA
        // ============================
        if (response?.codeStatus === 200 || response?.codeStatus === 201) {

        if (statusToUse.idStatusQ === 2 && pricingData?.id) {
            try {
            const controlResponse = await pricingControlService.ChangeStatusControl(
                pricingData.id,
                "Cotizada"
            );

            if (controlResponse?.codeStatus === 200) {

                // se actualiza la nueva tarifa como cotizada
                const quotedRateResponse =
                await updateStatusControlQuotedRate(
                    idNewQuotedRate,
                    5 // Cotizada
                );
                
                if (quotedRateResponse?.codeStatus === 200) {

                    showSuccess( `${t('tvf.UpdateStatusControlOK')}` );
                } else {

                    isSuccess = false;
                    showError(
                        `${t('tvf.UpdateStatusControlError')} ${quotedRateResponse?.messageStatus ?? ''}`
                    );
                }
            } else {
                isSuccess = false;
                showError(
                `${t('tvf.UpdateStatusControlError')} ${controlResponse?.messageStatus ?? ''}`
                );
            }

            } catch (err) {
            console.error("Error al cambiar status del control:", err);
            }
        }
        }

        // si todo se realizo ok
        if (isSuccess) {
        onClose?.();
        }
        

        } catch (error) {
            console.error("Error en save quoted rate:", error);
            showError(t('tvf.SaveError'));
        }

};

// servicio donde genera el pdf y lo sube a google cloud storage
const generateAndUploadPdf = async (
    calculatedVersion: number
): Promise<{ success: boolean; documentId: string }> => {
    try {

        // 1. Generar PDF SIN watermark
        const blob = await generatePdfBlob(false, calculatedVersion);

        if (!blob) {
            throw new Error("No se pudo generar el PDF");
        }

        const current = quotedRateRegistradaInfo?.data?.[0];

        // 2. Convertir a File y asignar nomenclatura
        const file = new File(
            [blob],
            `QuotedRate_${current?.quote_number || t('tvf.WithoutFolio')}_v${calculatedVersion}.pdf`,
            { type: "application/pdf" }
        );

        // 3. Obtener section y documentType
        const sectionId = sections.find(
            (s) => s.section === "Pricing"
        )?.sectionid;

        const documentTypeId = documentTypes.find(
            (d) => d.documentkey === "TarVen"
        )?.documenttypeid;

        if (!sectionId || !documentTypeId) {
            throw new Error("No hay sección o tipo de documento");
        }

        // 4. Subir documento
        const response: UploadResponse = await uploadDocuments(
            quotationRequestData?.referenceRequest,
            sectionId,
            documentTypeId,
            {
                iduser: user?._id || "",
                nameemployee: user?.name || ""
            },
            [file]
        );

        if (response.codeStatus === 201) {

            const documentId = response.atrribute?.value || "";

            handlePreviewQuotedRate(false, calculatedVersion);

            showSuccess(t('tvf.PdfUploadOK'));

            return {
                success: true,
                documentId
            };
        }

        showError(t('tvf.PdfUploadError'));

        return {
            success: false,
            documentId: ""
        };

    } catch (error) {

        console.error(error);

        showNotification(
            "warning",
            t('tvf.PdfUploadWarning')
        );

        return {
            success: false,
            documentId: ""
        };
    }
};

const buildQuotedRatePayload = (
    current: any,
    calculatedVersion: number,
    statusToUse: StatusQuote,
    documentId: string
): QuotedRate => {

    const contact = isProspect ? manualContact : selectedContact;

    const prospectName = isProspect
        ? quotationRequestData?.customer?.prospectName
        : pricingData?.customer_business_name;

    const address = isProspect ? prospectAddress : customerAddress;

    return {
        _id: current?._id || null,
        _idcuote: current?._idcuote || null,
        quote_number: current?.quote_number || null,
        version: calculatedVersion,
        _id_control: pricingData?.id || "",
        control_number: pricingData?.control || "",
        _idreferencerequest: quotationRequestData?.id || "",
        referencerequest: quotationRequestData?.referenceRequest || "",
        prospect: prospectName || "sin prospecto",
        _id_customer: pricingData?.id_customer || "",
        customer_business_name: pricingData?.customer_business_name || "",
        customer_address: address.toUpperCase() || "",
        customer_contact: {
            type: contact?.type || "",
            name: contact?.name || "",
            email: contact?.email || "",
            phone: contact?.phone || "",
        },
        status_control: {
            id_status_control: pricingData?.status_control?.id_status_control ?? 0,
            status_control_name: pricingData?.status_control?.status_control_name ?? "",
        },
        _iddocument: documentId || current?._iddocument,
        currency: currency,
        exchange: exchangeRate,
        targetcurrecy: currencyTo,
        environmentid: pricingData?.environmentid ?? 2,
        environment: "ATLAS EXPEDITORS S.A. DE C.V.",
        details: [
            {
            services: mapServicesFromPricing(pricingData?.services || []),
            charges: {
                maritime: maritimeConcepts || [],
                air: {
                airline_costs: airConcepts || [],
                operational_costs: airOperationalConcepts || []
                },
                land: landConcepts || [],
                consulting_services: consultingServicesConcepts || []
            },
            subtotal_import: String(totals.subtotal),
            sales_tax_import: String(totals.vat),
            total_import: String(totals.total)
            }
        ],
        comments: editorRef.current?.innerHTML || "",
        conditions: termsValue || [],
        created_by: {
            _id_user_save: user?._id || '',
            user_name: user?.name || ''
        },
        created_at: current?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        valid_from: validFrom 
            ? toUTCDate(validFrom) 
            : new Date().toISOString(),

        valid_until: validUntil 
            ? toUTCDate(validUntil) 
            : new Date().toISOString(),
        is_current: true,
        _id_status_quote: statusToUse.idStatusQ,
        status_cuote_name:
            language === "es"
                ? statusToUse.labelSpanish
                : statusToUse.labelEnglish,
        id_language: idLanguage,
        language: languageFormat,
        previous_version_id:  previousVersionId,
        previous_version_cuote:  previousVersionCuote,
        archived: false,
        data_state: 1,
        status: 1,
    };
};

//validacion que si dejan un concepto sin capturar completo, notifique
const validateConcepts = () => {
    const allConcepts = [
        ...maritimeConcepts,
        ...airConcepts,
        ...airOperationalConcepts,
        ...landConcepts,
        ...consultingServicesConcepts
    ];

    const hasEmptyConcept = allConcepts.some((c) => {
        return (
            !c.concept || // sin concepto
            Number(c.subtotal) <= 0 // sin importe
        );
    });

    if (hasEmptyConcept) {
        showError(t('tvf.ConceptSubtotalRequired'));  
        return false;
    }

    return true;
};

const isValidNumber = (value: any) => {
    return value !== null && value !== "" && !isNaN(Number(value));
};

const validateConceptsNumers = () => {

    const allConcepts = [
        ...maritimeConcepts.map((c, i) => ({ ...c, table: 'maritime', index: i })),
        ...airConcepts.map((c, i) => ({ ...c, table: 'air', index: i })),
        ...airOperationalConcepts.map((c, i) => ({ ...c, table: 'airOperational', index: i })),
        ...landConcepts.map((c, i) => ({ ...c, table: 'land', index: i })),
        ...consultingServicesConcepts.map((c, i) => ({ ...c, table: 'consulting', index: i }))
    ];

    const isInvalid = (value: any) => {
        if (value === undefined || value === null || value === "") return false;
        return !isValidNumber(value) || Number(value) < 0;
    };

    const invalidConcept = allConcepts.find((c) => {

        switch (c.table) {

            case 'maritime':
                return isInvalid(c.unit) || isInvalid(c.subtotal);

            case 'air':
                return (
                    isInvalid(c.rate_per_kg) ||
                    isInvalid(c.fuel_surcharge) ||
                    isInvalid(c.security_surcharge) ||
                    isInvalid(c.miscellaneous_charges) ||
                    isInvalid(c.chargeable_weight)
                );

            case 'airOperational':
                return isInvalid(c.subtotal); 

            case 'land':
                return isInvalid(c.unit) || isInvalid(c.subtotal);

            case 'consulting':
                return isInvalid(c.unit) || isInvalid(c.subtotal);

            default:
                return false;
        }
    });

    if (invalidConcept) {

        const tableNames: Record<string, string> = {
            maritime: t('tvf.MaritimeConcepts'),
            air: t('tvf.AirConcepts'),
            airOperational: t('tvf.AirOperationalConcepts'),
            land: t('tvf.LandConcepts'),
            consulting: t('tvf.ConsultingServicesConcepts')
        };

        showError(
            `${tableNames[invalidConcept.table]} - ` +
            t('tvf.ConceptUnValid', {
                values: { row: invalidConcept.index + 1 }
            })
        );

        return false;
    }

    return true;
};

const validateRequiredFields = () => {
    const errors: string[] = [];

    // =========================
    // GENERALES
    // =========================
    if (isProspect) {
    if (!manualContact?.name?.trim()) {
        errors.push(t('tvf.NameRequired'));
    }
 
    {/*
    if (!manualContact?.email?.trim()) {
        errors.push(t('tvf.EmailRequired'));
    }

    if (!manualContact?.phone?.trim()) {
        errors.push(t('tvf.PhoneRequired'));
    }
    */}

    if (!prospectAddress?.trim()) {
        errors.push(t('tvf.enterAddress'));
    }

    } else {
    if (!selectedContact?.email) {
        errors.push(t('tvf.ContactRequired'));
    }
    }

    if (!currency) {
        errors.push(t('tvf.CurrencyRequired'));
    }

    if (!currencyTo) {
        errors.push(t('tvf.CurrencyToRequired'));
    }

    if (!exchangeRate || exchangeRate <= 0) {
        errors.push(t('tvf.ExchangeRateRequired'));
    }

    if (!validFrom) {
        errors.push(t('tvf.ValidFromRequired'));
    }

    if (!validUntil) {
        errors.push(t('tvf.ValidUntilRequired'));
    }

    // validar que la fecha final no sea menor a la inicial
    if ( 
        validFrom &&
        validUntil &&
        new Date(validUntil) < new Date(validFrom)
    ) {
        errors.push(t('tvf.ValidUntilMustBeGreater'));
    }

    if (
    !termsValue ||
    termsValue.length === 0 ||
    termsValue.every(term => !term.trim())
    ) {
        errors.push(t('tvf.termsValueRequired'));
    }
    
    return errors;
};
// ================ si hay algun concepto capturado con importe mayor a< 0================== //
const validateTotal = () => {
    if (!totals.total || totals.total <= 0) {
        showError(t('tvf.TotalMustBeGreaterThanZero'));
        return false;
    }
    return true;
};

// ================ Descarga del archivo================== //

const handleDownload = async (id: string) => {
    if (downloading) return;

    try {
    setDownloading(true);

    const response = await downloadDocument(id);

    if (response.codeStatus === 200) {
        const { fileBytes, fileName } = response.meta;

        const byteCharacters = atob(fileBytes);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const blob = new Blob([new Uint8Array(byteNumbers)]);
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);

    showSuccess(  t('dig.fileDownloaded').replace('{{name}}', fileName) );
    } else {
    showError(t('dig.downloadError'));
    }
} catch {
    showError(t('dig.downloadFailed'));
} finally {
    setDownloading(false);
}
};
// ================== Preview de la tarifa de venta================== //

const handlePreviewQuotedRate = async (isPreview: boolean,  version: number ) => {  
    try {

        if (isPreview) {

        // validacion que si dejan un concepto sin capturar completo, solo requerido subtotal y concepto notifique
        if (!validateConcepts()) return;

        //validacion de datos numericos en los conceptos
        if (!validateConceptsNumers()) return;

        // si hay conceptos capturados con importes mayores a 0
        if (!validateTotal()) return;

        }

        // abrimos pestaña en blanco
        const newTab = window.open("", "_blank");

        const title = t('tvf.generatingPdf');  
        const subtitle = t('tvf.pleaseWait');

        if (newTab) {
            newTab.document.write(`
                <html>
                    <head>
                        <title>${title}</title>

                        <style>
                        
                            html, body {
                                margin: 0;
                                padding: 0;
                                overflow: hidden;
                                font-family: sans-serif;
                            }

                            .previewPdfContainerLoading {
                                width: 100%;
                                min-height: 100vh;
                                height: 100vh;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                padding: 2rem;
                                background: #111827;
                                box-sizing: border-box;
                            }

                            .previewPdfLoadingCard {
                                width: 100%;
                                max-width: 420px;
                                background: #111827;
                                border: 1px solid #374151; 
                                border-radius: 20px;
                                padding: 40px 32px;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                text-align: center;
                                box-shadow:
                                    0 10px 25px rgba(0, 0, 0, 0.05),
                                    0 4px 10px rgba(0, 0, 0, 0.03);
                            }

                            .previewPdfLoadingTitle {
                                margin-top: 22px;
                                font-size: 24px;
                                font-weight: 800;
                                color: #f9fafb;
                            }

                            .previewPdfLoadingText {
                                margin-top: 10px;
                                max-width: 260px;
                                font-size: 14px;
                                line-height: 1.5;
                                color: #d1d5db;
                            }

                            .previewPdfSpinner {
                                width: 72px;
                                height: 72px;
                                border-radius: 50%;
                                border: 6px solid #e5e7eb;
                                border-top-color: #038c7f;
                                animation: previewPdfSpin 0.9s linear infinite;
                            }

                            @keyframes previewPdfSpin {
                                to {
                                    transform: rotate(360deg);
                                }
                            }
                        </style>
                    </head>

                    <body>
                        <div class="previewPdfContainerLoading">
                            <div class="previewPdfLoadingCard">

                                <div class="previewPdfSpinner"></div>

                                <h2 class="previewPdfLoadingTitle">
                                    ${title}
                                </h2>

                                <p class="previewPdfLoadingText">
                                    ${subtitle}
                                </p>

                            </div>
                        </div>
                    </body>
                </html>
            `);

            newTab.document.close();
        }

        const payload = buildPreviewPayload(isPreview, version );

        //pruebas
        //console.log("Payload:", JSON.stringify(payload, null, 2));

        let blob: Blob | null = null;
        let attempts = 0;
        const maxAttempts = 10;

        // reintentos automáticos
        while (!blob && attempts < maxAttempts) {
            try {
                blob = await GeneratePreviewQuotedRate(payload);
                
                // validar que realmente venga PDF
                if (!blob || blob.size === 0) {
                    throw new Error("PDF vacío");
                }

            } catch (err) {
                attempts++;

                // esperar 2 segundos antes de reintentar
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }

        // si nunca se generó
        if (!blob) {
            if (newTab) {
                newTab.close();
            }
            showError("Error al generar preview tarifa venta");
            return;
        }

        const fileURL = window.URL.createObjectURL(blob);

        if (newTab) {
            newTab.document.write(`
                <html>
                    <head>
                        <title>${t('tvf.Preview')}</title>

                        <style>
                            html, body {
                                margin: 0;
                                width: 100%;
                                height: 100%;
                                overflow: hidden;
                                background: #111827;
                            }

                            iframe {
                                width: 100%;
                                height: 100%;
                                border: none;
                            }
                        </style>
                    </head>

                    <body>
                        <iframe 
                            src="${fileURL}#toolbar=0&navpanes=0&scrollbar=0"
                        ></iframe>
                    </body>
                </html>
            `);

            newTab.document.close();
        }

    } catch (error) {
        showError("Error al generar preview tarifa venta");
    }
};

const generatePdfBlob = async (isPreview: boolean,  version: number): Promise<Blob | null> => {
    const payload = buildPreviewPayload(isPreview, version);

    //pruebas
    //console.log("Payload:", JSON.stringify(payload, null, 2));

    let blob: Blob | null = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!blob && attempts < maxAttempts) {
        try {
            blob = await GeneratePreviewQuotedRate(payload);

            if (!blob || blob.size === 0) {
                throw new Error("PDF vacío");
            }

        } catch {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }

    return blob;
};

const buildPreviewPayload = (
    isPreview: boolean,
    version: number
): pdfGeneratorQuotedRate => {
    
    const current = quotedRateRegistradaInfo?.data?.[0];

    const contact = isProspect ? manualContact : selectedContact;

    const prospectName = isProspect
    ? quotationRequestData?.customer?.prospectName
    : pricingData?.customer_business_name;
    
    const address = isProspect ? prospectAddress : customerAddress;

    return {
        typeOfDocument: "QuotedRate",
        typeOfLanguage: languageFormat || "Mx",
        inline: false,
        includeWatermark: isPreview,
        watermarkText:"SIN VALIDEZ OFICIAL",
        data: {
            Header: {
                QuoteNumber: current?.quote_number ||t('tvf.noQuote'),
                QuotedRateVersion: version,
                CostumerProspect: prospectName || "",
                Adress: address ? address.toUpperCase() : "",
                ExchangeRate: {
                    BaseCurrency: currency || "MXN",
                    TargetCurrency: currencyTo || "MXN",
                    Rate: exchangeRate || 1
                },
                ValidFrom: validFrom 
                    ? toUTCDate(validFrom)
                    : new Date().toISOString(),

                ValidUntil: validUntil 
                    ? toUTCDate(validUntil)
                    : new Date().toISOString(),

                QuotedRateUserName: pricingData?.complete_name_pricing || "",
                QuotedRateUserContact: contact
                ? [
                    contact.name,
                    contact.email,
                    contact.phone ? `Tel: ${contact.phone}` : ""
                    ]
                    .filter((value) => value && value.trim() !== "")
                    .join(" | ")
                : "",
            },
            Services: (pricingData?.services || []).flatMap((s: any) => {
            const hasShipments = s.shipments?.length > 0;
            // SHIPMENTS
            if (hasShipments) {
                return s.shipments.map((sh: any) => ({
                    Category: s.category ?? 1,
                    ServiceName: s.nameService,
                    Origin: `${buildLocationString(sh?.origin).main} ${buildLocationString(sh?.origin).extra}`,
                    Destination: `${buildLocationString(sh?.destination).main} ${buildLocationString(sh?.destination).extra}`,
                    ShipmentTypeName: sh.typeShipment || "",
                    Operation: sh.typeOperation || "",
                    Incoterm: sh.incoterm || "",
                    Cargo: (sh.cargo || []).map((c: any) => c.name || ""),
                    ServicesAsociated: (sh.servicesAsociated || []).map(
                        (a: any) => a.serviceAsociatedName || ""
                    )
                }));
            }
            // ORDER SERVICE
            if (s.orderService) {
                const os = s.orderService;
                return [
                    {
                        Category: s.category ?? 1,
                        ServiceName: s.nameService,
                        Origin: `${buildLocationString(os?.origin).main} ${buildLocationString(os?.origin).extra}`,
                        Destination: `${buildLocationString(os?.destination).main} ${buildLocationString(os?.destination).extra}`,
                        ShipmentTypeName: os.typeShipment || "",
                        Operation: os.typeOperation || "",
                        Incoterm: "", // no aplica
                        Cargo: (os.cargo || []).map((c: any) => c.name || ""),
                        ServicesAsociated: [] // no aplica
                    }
                ];
            }
            return [];
            }),
            ConceptsAir: [
            ...(airConcepts || [])
            ].map((c: any) => ({
                Concept: c.concept || "",
                AierLine: c.airline || c.AierLine || "",
                Route: c.route || "",
                TransitDays: String(c.transit_days || ""),
                RatePerKG: Number(c.rate_per_kg) || 0,
                FuelSurcharge: Number(c.fuel_surcharge) || 0,
                SecuritySurcharge: Number(c.security_surcharge) || 0,
                MiscellaneousCharges: Number(c.miscellaneous_charges) || 0,
                ChargeableWeight: Number(c.chargeable_weight) || 0,
                SubTotal: Number(c.subtotal) || 0,
                Rate: Number(c.rate) || 0,
                Total: Number(c.total) || 0
            })),
            Concepts: [
                ...(maritimeConcepts || []),
                ...(airOperationalConcepts || []),
                ...(landConcepts || []),
                ...(consultingServicesConcepts || [])
            ].map((c: any) => ({
                ServiceType: c.service_type ?? c.ServiceType ?? 0,
                Charge: c.type_of_charge || "",
                Concept: c.concept || "",
                Base: c.billing_base || "",
                Container: c.container_type || "",
                Quantity:  Number(c.unit) || 0,
                SubTotal: Number(c.subtotal) || 0,
                Rate: Number(c.rate) || 0,
                Total: Number(c.total) || 0
            })),
            Comments: editorRef.current?.innerHTML || "",
            TermsAndConditions: termsValue
        }
    };
};

 /* ===================================== EMPIEZA EL DISEÑO FRONT ========================================= */
return (
        <div className={styles.container} ref={mainRef}>
            {/* ===== HEADER ===== */}
            <div className={styles.header}>
                <h1 className={styles.title}>{t('tvf.title')}</h1>
                <div className={styles.buttonGroup}>
                <button className={styles.headerButton} onClick={onClose}>
                    <ArrowLeft size={18} />
                </button>

                {!isAcceptedByClient && ( //falta añadir el activo
                    <button
                        className={styles.headerButton}
                        onClick={handleDraftWithValidation}
                        disabled={isSaving}
                    >
                        <Save size={18} />
                        <span>{t('tvf.Draft')}</span>
                    </button>
                )}

                <button
                    className={styles.headerButton}
                    onClick={() =>
                        handlePreviewQuotedRate(
                            !isAcceptedByClient,
                            quotedRateRegistradaInfo?.data?.[0]?.version ?? 0
                        )
                    }
                >
                    <Eye size={18} />
                    <span>
                        {isAcceptedByClient ? t('tvf.ViewRate') : t('tvf.Preview')}
                    </span>
                </button>

                {!isAcceptedByClient && idPrevious && (
                    <button
                        className={styles.headerButton}
                        onClick={handleGenerateWithConfirm}
                        disabled={isGenerating}
                    >
                        <FileText size={18} />
                        <span>{t('tvf.Generate')}</span>
                    </button>
                )}

            </div>
            </div>
            {/* Control Pricing titulo*/}
            <div className={styles.titleSection}>
            {/* IZQUIERDA */}    
            <div className={styles.leftTitle}>
                <h1 className={styles.titleGroup}>
                    <span className={styles.titleSmall}>{t('tvf.subtitle')}</span>
                    <span className={styles.titleBig}>{quotedRateRegistradaInfo?.data?.[0]?.control_number  || pricingData?.control}</span>
                </h1>

                <span className={styles.statusBadge}>
                    {quotedRateRegistradaInfo?.data?.[0]?.status_control.status_control_name || pricingData?.status_control.status_control_name}
                </span>

                <span className={styles.badgeStatus}>
                    {language === "es"
                        ? selectedStatus.labelSpanish
                        : selectedStatus.labelEnglish}
                </span>
            </div>

            {/* DERECHA */}
            <div className={styles.rightTitle}>

                <div className={styles.rightTopRow}>
                    {hasDocument && ( //si es activo o aceptada por el cliente
                        <div className={styles.actionsGroup}>
                            <button
                                className={styles.cloudButton}
                                onClick={() =>
                                    handleDownload(
                                        quotedRateRegistradaInfo?.data?.[0]?._iddocument
                                    )
                                }
                            >
                                <GrCloudDownload size={26} />
                                <span className={styles.tooltip}>
                                    {t('dig.download')}
                                </span>
                            </button>
                        </div>
                    )}
                    <div className={styles.langBlock}>
                        <span className={styles.badgeLang}>
                            {t('tvf.LanguageFormat')}
                        </span>
                    </div>

                    <div className={`${styles.langSelect} ${isAcceptedByClient ? styles.locked : ""}`}>
                    <select
                        value={languageFormat}
                        onChange={(e) => {
                        const value = e.target.value;
                        setLanguage(value);
                        const found = LANGUAGE_OPTIONS.find((l) => l.value === value);
                        setIdLanguage(found?.idLang ?? 1);
                        }}
                    >
                        {LANGUAGE_OPTIONS.map((lang) => (
                        <option key={lang.idLang} value={lang.value}>
                            {language === "es"
                            ? lang.labelSpanish
                            : lang.labelEnglish}
                        </option>
                        ))}
                    </select>
                    </div>
                </div>
            </div>

            </div>
            {/* cuerpo general, servicios, conceptos y condiciones*/}
            <div className={styles.bodyGeneral}>
                 {/* ------------------------------------------- apartado de informacion general --------------------------------------------------------- */}
                <section className={styles.cardGeneral}>
                      {/* BADGE FUERA */}
                        <div className={styles.badges}>
                            <span className={styles.badgePrimary}>{t('tvf.subtitleGeneral')}</span>
                        </div>
                    {/* decorativo */}
                    <div className={`${styles.cardContent} ${isAcceptedByClient ? styles.locked : ""}`} >
                    {/* LEFT */}
                    <div className={styles.leftSection}>
                        {/* header */}
                        <div>
                        <h3 className={styles.clientName}>
                            {pricingData?.customer_business_name || ''}
                        </h3>
                        </div>
                        {/* NUEVO: dirección */}
                        <div className={styles.clientAddress}>
                        {isProspect ? (
                            <input
                            type="text"
                            placeholder={t('tvf.enterAddress')}
                            value={prospectAddress}
                            onChange={(e) => setProspectAddress(e.target.value)}
                            className={styles.inputAddress}
                            />
                        ) : (
                            customerAddress || t('tvf.Noaddress')
                        )}
                        </div>
                        {/* grid info */}
                        <div className={styles.infoGrid}>

                        <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                        <label>
                            <UserCheck size={14} /> {t('tvf.Contact')}
                        </label>

                        {isProspect ? (
                            // INPUTS PARA PROSPECTO
                            <div className={styles.contactInputsGrid}>
                            
                            <input
                                type="text"
                                placeholder={t('tvf.Name')}
                                value={manualContact.name}
                                onChange={(e) =>
                                setManualContact({ ...manualContact, name: e.target.value })
                                }
                                className={styles.inputContact}
                            />

                            <input
                                type="email"
                                placeholder={t('tvf.Email')}
                                value={manualContact.email}
                                onChange={(e) =>
                                setManualContact({ ...manualContact, email: e.target.value })
                                }
                                className={styles.inputContact}
                            />

                            <input
                                type="text"
                                placeholder={t('tvf.Phone')}
                                value={manualContact.phone}
                                onChange={(e) =>
                                setManualContact({ ...manualContact, phone: e.target.value })
                                }
                                className={styles.inputContact}
                            />

                            </div>
                        ) : (
                            // SELECT PARA CLIENTE NORMAL
                            <div className={styles.contactSelectWrapper}>
                            <select
                                className={styles.contactSelect}
                                value={selectedContact?.email || ''}
                                onChange={(e) => {
                                const contact = customerContacts.find(
                                    (c: any) => c.email === e.target.value
                                );
                                setSelectedContact(contact);
                                }}
                                required
                            >
                                {customerContacts.length === 0 && (
                                <option value="">{t('tvf.NoContacts')}</option>
                                )}

                                {customerContacts.map((c: any, index: number) => (
                                <option key={index} value={c.email}>
                                    {`${c.name || t('tvf.NoName')} | ${c.email || t('tvf.NoEmail')} | ${c.phone || t('tvf.NoPhone')}`}
                                </option>
                                ))}
                            </select>
                            </div>
                        )}
                        </div>   
                        <div className={styles.infoItem}>
                            <label>
                            <User size={14} />{t('tvf.ExecutiveInCharge')}
                            </label>
                            <span className={styles.executename}>{pricingData?.complete_name_pricing || 'sin ejecutivo'}</span>
                        </div>

                        <div className={styles.infoItem}>
                            <label>
                            <Tag size={14} />{t('tvf.QuoteRequestRef')}
                            </label>
                            <span className={styles.quotationRequestNumber}>{quotationRequestData?.referenceRequest  || 'sin referencia cotización'}</span>
                        </div>

                        </div>
                    </div>
                    {/* RIGHT */}
                    <div className={styles.rightSection}>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryHeader}>
                                <div className={styles.quoteBlock}>
                                <span className={styles.labelMini}>{t('tvf.Quota')}</span>
                                <span className={styles.quoteId}>
                                    {quotedRateRegistradaInfo?.data?.[0]?.quote_number  ?? t('tvf.noQuote')}
                                </span>
                                </div>
                                
                                <div className={styles.exchangeBlock}>
                                    <span className={styles.labelMini}>{t('tvf.currency')}</span>
                                    <div className={styles.exchangeRow}>
                                        <div className={styles.exchangeSelectWrapper}>
                                        <select
                                            className={styles.exchangeSelect}
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            required
                                            >
                                            {CURRENCY_OPTIONS.map((c: CurrencyOption) => (
                                                <option key={c.idCurrency} value={c.value}>
                                                {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    </div>
                                </div>
                                <div className={styles.exchangeTCBlock}>
                                        <span className={styles.labelMini}>{t('tvf.ExchangeRate')}</span>
                                            <input
                                            type="number"
                                            step="0.01"
                                            value={exchangeRate}
                                            onChange={(e) => setExchangeRate(Number(e.target.value) || 1.0000)}
                                            required
                                            className={styles.exchangeInput}
                                            />
                                </div>
                                <div className={styles.exchangeCovertBlock}>
                                    <span className={styles.labelMini}>{t('tvf.currencyConversion')}</span>
                                    <div className={styles.exchangeRow}>
                                        <div className={styles.exchangeSelectWrapper}>
                                            <select
                                                className={styles.exchangeSelect}
                                                value={currencyTo}  
                                                onChange={(e) => setCurrencyTo(e.target.value)}
                                                required
                                            >
                                                {CURRENCY_OPTIONS.map((c: CurrencyOption) => (
                                                    <option key={c.idCurrency} value={c.value}>
                                                        {c.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>                   
                                <div className={styles.version}>
                                    {t('tvf.Version')}{quotedRateRegistradaInfo?.data?.[0]?.version  ?? 0}
                                </div>
                            </div>

                        {/* fechas */}
                        <div className={styles.dateBlock}>
                        <span className={styles.labelMini}>
                            {t('tvf.OfferValidity')}
                        </span>

                        <div className={styles.dateInputs}>
                            <div className={styles.inputWithIcon}>
                            <Calendar className={styles.iconCalendar} />
                            <input
                                type="date"
                                className={styles.dateField}
                                value={validFrom}
                                onChange={(e) => setValidFrom(e.target.value)}
                                required
                            />
                            </div>

                            <span className={styles.separator}><AiFillCaretRight  size={16} /></span>

                            <div className={styles.inputWithIcon}>
                            <Calendar className={styles.iconCalendar} />
                            <input
                                type="date"
                                className={styles.dateField}
                                value={validUntil}
                                onChange={(e) => setValidUntil(e.target.value)}
                                required
                            />
                            </div>

                        </div>
                        </div>
                        </div>
                    </div>
                </div>
                </section>
              {/* ------------------------------------------- apartado de informacion de los servicios ------------------------------------- */}
                <section className={styles.cardServices}>

                  {/* BADGE reutilizado */}
                    <div className={styles.badges}>
                        <span className={styles.badgePrimary}> {t('tvf.Services')}</span>
                    </div>

                <div className={styles.servicesList}>
                    {pricingData?.services?.map((service: any) => {

                    const shipment = service.shipments?.[0]; //nodo de shipment
                    const order = service.orderService;; //nodo de orden de servicio

                    const unifiedShipment = shipment
                    ? {
                        origin: shipment.origin,
                        destination: shipment.destination,
                        typeOperation: shipment.typeOperation,
                        typeShipment: shipment.typeShipment,
                        incoterm: shipment.incoterm,
                        servicesAsociated: shipment.servicesAsociated,
                        cargo: shipment.cargo,
                        }
                    : order
                    ? {
                        origin: order.origin,
                        destination: order.destination,
                        typeOperation: order.typeOperation,
                        typeShipment: order.typeShipment,
                        incoterm: 'N/A',
                        servicesAsociated: [],
                        cargo: order.cargo,
                        }
                    : null;

                    function normalizeLocation(loc: any) {
                    return {
                        countryCode: loc?.countryCode || loc?.country_code,
                        zipCode: loc?.zipCode || loc?.zip_code,
                        portCode: loc?.portCode || loc?.port_code,
                        airportCode: loc?.airportCode || loc?.airport_code,
                        city: loc?.city,
                    };
                    }
                    const originData = useMemo(() => 
                    buildLocationString(normalizeLocation(unifiedShipment?.origin)),
                    [unifiedShipment?.origin, Countries, Ports, Airports]
                    );

                    const destinationData = useMemo(() => 
                    buildLocationString(normalizeLocation(unifiedShipment?.destination)),
                    [unifiedShipment?.destination, Countries, Ports, Airports]
                    ); 
                    const getIcon = () => {
                        return serviceIconsCategory1ById[service.idService] || <Package size={18} />;
                    };

                    return (
                        <div key={service.idServiceItem} className={`${styles.serviceCard} ${isAcceptedByClient ? styles.locked : ""}`} >

                        {/* HEADER */}
                        <div className={styles.serviceHeader}>
                            <div className={styles.serviceLeft}>

                            <div className={styles.serviceIcon}>
                                {getIcon()}
                            </div>

                            <div>
                                <h3 className={styles.serviceName}>
                                {service.nameService}
                                </h3>

                                <div className={styles.serviceTags}>
                                <span className={styles.tagtypeOperation}>
                                    {unifiedShipment?.typeOperation || 'N/A'}
                                </span>
                                <span className={styles.tagtypeShipment}>
                                    {unifiedShipment?.typeShipment || 'N/A'}
                                </span>
                                </div>
                            </div>

                            </div>

                            <div className={styles.serviceRight}>
                            <span className={styles.labelMini}>Incoterm</span>
                            <span className={styles.incoterm}>
                                {unifiedShipment?.incoterm || 'N/A'}
                            </span>
                            </div>
                        </div>

                        {/* BODY */}
                        <div className={styles.serviceBody}>

                            {/* RUTA */}
                            <div>
                                <p className={styles.labelMini}>{t('tvf.LogisticRoute')}</p>

                                <div className={styles.route}>
    
                                {/* ORIGEN */}
                                <div className={styles.routePoint}>
                                    <div className={styles.routeDot}></div>

                                    <div className={styles.locationBlock}>

                                        {/* ciudad + país */}
                                        <div className={styles.location}>
                                            {originData.main}
                                        </div>

                                        {/* cp / puerto / aeropuerto */}
                                        <div className={styles.locationExtra}>
                                            {originData.extra}
                                        </div>

                                        <span className={styles.subLabelLocation}>
                                            {t('tvf.Origen')}
                                        </span>

                                    </div>
                                </div>

                                {/* LINEA */}
                                <div className={styles.routeLine}>
                                    <div className={styles.routeProgress}></div>
                                </div>

                                {/* DESTINO */}
                                <div className={styles.routePoint}>
                                    <div className={`${styles.routeDot} ${styles.routeDotEnd}`}></div>

                                    <div className={styles.locationBlock}>

                                        <div className={styles.location}>
                                            {destinationData.main}
                                        </div>

                                        <div className={styles.locationExtra}>
                                            {destinationData.extra}
                                        </div>

                                        <span className={styles.subLabelLocation}>
                                            {t('tvf.Destino')}
                                        </span>

                                    </div>
                                </div>

                                </div>

                            {/* SERVICIOS ASOCIADOS */}
                            <div className={styles.associated}>
                                <p className={styles.labelMini}>{t('tvf.AssociatedServices')}</p>

                                {unifiedShipment && (
                                <div className={styles.badgeList}>
                                    {unifiedShipment.servicesAsociated?.length > 0 ? (
                                    unifiedShipment.servicesAsociated.map((s: any) => {
                                        const icon =
                                        serviceIconsCategory2ById[s.idServiceAsociated] || <Package size={14} />;
                                        return (
                                        <span key={s.idServiceAsociated} className={styles.badge}>
                                            {icon}
                                            <span style={{ marginLeft: "6px" }}>
                                            {s.serviceAsociatedName}
                                            </span>
                                        </span>
                                        );
                                    })
                                    ) : (
                                    <span className={styles.badge}>N/A</span>
                                    )}
                                </div>
                                )}
                            </div>
                            </div>

                            {/* CARGA */}
                            <div className={styles.cargoBox}>
                            <p className={styles.labelMini}>{t('tvf.CargoSummary')}</p>

                            <div className={styles.cargoRow}>

                                {/* mercancía */}
                                <div className={styles.cargoItemMain}>
                                <span className={styles.cargoLabel}>{t('tvf.Goods')}</span>
                                <span className={styles.cargoValue}>
                                    {unifiedShipment?.cargo?.map((c: any) => c.name).join(', ') || 'N/A'}
                                </span>
                                </div>

                                <div className={styles.cargoDivider}></div>

                                {/* PESO Y VOLUMEN */}
                                <div className={styles.cargoRight}>
                                <div className={styles.cargoItem}>
                                    <span className={styles.cargoNumber}>
                                    {unifiedShipment?.cargo?.reduce((acc: number, c: any) => acc + (c.weigthTotal || 0), 0)}
                                    </span>
                                    <span className={styles.cargoUnit}>
                                        {unifiedShipment?.cargo?.[0]?.unitWeight  || ''}
                                    </span>
                                </div>

                                <div className={styles.cargoItem}>
                                    <span className={styles.cargoNumber}>
                                    {unifiedShipment?.cargo?.reduce((acc: number, c: any) => acc + (c.volumeTotal || 0), 0)}
                                    </span>
                                    <span className={styles.cargoUnit}>CBM</span>
                                </div>
                                </div>

                            </div>
                            </div>

                        </div>

                        </div>
                    );
                    })}
                </div>
                </section>
              {/* ------------------------------------------- apartado de las tablas de los conceptos  ------------------------------------- */}
                <section className={styles.cardConcepts}>
                    <div className={styles.badges}>
                        <span className={styles.badgePrimary}>{t('tvf.Concepts')}</span>
                    </div>
                    <div className={styles.tabs}>
                        <div
                            className={`${styles.tabItem} ${activeTab === 'MARITIMO' ? styles.active : ''}`}
                            onClick={() => setActiveTab('MARITIMO')}
                        >
                            {/* Badge contador maritimeConcepts */}
                            {maritimeConcepts.length > 0 && (
                                <span className={styles.badgeCount}>
                                    {maritimeConcepts.length}
                                </span>
                            )}
                            <Ship size={18} /> {t('tvf.Maritime')}
                        </div>

                        <div
                            className={`${styles.tabItem} ${activeTab === 'AEREO' ? styles.active : ''}`}
                            onClick={() => setActiveTab('AEREO')}
                        >
                            
                            {/* Badge contador airConcepts y airOperationalConcepts*/}
                            {(airConcepts.length + airOperationalConcepts.length) > 0 && (
                                <span className={styles.badgeCount}>
                                    {airConcepts.length + airOperationalConcepts.length}
                                </span>
                            )}
                            <Plane  size={18} />  {t('tvf.Air')}
                        </div>

                        <div
                            className={`${styles.tabItem} ${activeTab === 'TERRESTRE' ? styles.active : ''}`}
                            onClick={() => setActiveTab('TERRESTRE')}
                        >
                            {landConcepts.length > 0 && (
                                <span className={styles.badgeCount}>
                                    {landConcepts.length}
                                </span>
                            )}
                            <Truck size={18} />    {t('tvf.Land')}
                        </div>
                        <div
                            className={`${styles.tabItem} ${activeTab === 'ACCESORIAL' ? styles.active : ''}`}
                            onClick={() => setActiveTab('ACCESORIAL')}
                        >
                            {consultingServicesConcepts.length > 0 && (
                                <span className={styles.badgeCount}>
                                    {consultingServicesConcepts.length}
                                </span>
                            )}
                            <Puzzle   size={18} />    {t('tvf.Advisory')}
                        </div>
                    </div>
                    {activeTab === 'MARITIMO' && (
                    <div className={`${styles.tableWrapper} ${isAcceptedByClient ? styles.locked : ""}`} >
                        <h3>{t('tvf.MaritimeConcepts')}</h3>
                        <table className={`${styles.table} ${styles.tableConceptsMaritime }`}>
                        <thead>
                            <tr>
                                <th>{t('tvf.Charge')}</th>
                                <th>{t('tvf.Concept')}</th>
                                <th>{t('tvf.Base')}</th>
                                <th>{t('tvf.Container')}</th>
                                <th>{t('tvf.Unit')}</th>
                                <th>{t('tvf.Subtotal')}</th>
                                <th>{t('tvf.VAT')}</th>
                                <th>{t('tvf.Total')}</th>
                                <th>{t('tvf.Actions')}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {maritimeConcepts.length === 0 ? (
                                <tr>
                                <td colSpan={9} className={styles.emptyCell}>
                                <span className={styles.emptyText}>
                                    {t('tvf.SinConceptos')}
                                </span>
                                </td>
                                </tr>
                            ) : (
                                maritimeConcepts.map((row, index) => (
                                <tr key={row.id}>

                                    {/* CHARGE */}
                                    <td>
                                    <select
                                        className={styles.selectCargo}
                                        value={row._id_type_of_charge ?? 0}
                                        onChange={(e) => {
                                            const selectedId = Number(e.target.value);
                                            const selectedText =
                                                e.target.options[e.target.selectedIndex].text;

                                            handleChange(index, '_id_type_of_charge', selectedId);

                                            handleChange(index, 'type_of_charge', selectedText);

                                        }}
                                    >
                                        <option value="">{t('tvf.Elegir')}</option>
                                        {charges.map((c: any) => (
                                            <option key={c._IdCharge} value={c._IdCharge}>
                                                {c.chargeName}
                                            </option>
                                        ))}
                                    </select>
                                    </td>

                                    {/* CONCEPT */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.concept}
                                        title={row.concept}
                                        onChange={(e) => handleChange(index, 'concept', e.target.value)}
                                    />
                                    </td>

                                    {/* BASE */}
                                    <td>
                                    <input
                                        className={styles.inputBase}
                                        value={row.billing_base ?? ""}
                                        title={row.billing_base}
                                        onChange={(e) => handleChange(index, 'billing_base', e.target.value)}
                                    />
                                    </td>

                                    {/* CONTAINER */}
                                    <td>
                                    <input
                                    list={`containers-${index}`}
                                    className={styles.selectContainer}
                                    value={row.container_type ?? ""}
                                    title={row.container_type}
                                    onChange={(e) => handleChange(index, 'container_type', e.target.value)}
                                    onBlur={(e) => {
                                        const value = e.target.value;
                                        const exists = containers.some(
                                            (c: any) => c.name_type === value
                                        );

                                        if (!exists) {
                                            handleChange(index, 'container_type', '');
                                        }
                                    }}
                                    placeholder={t('tvf.ElegirContenedor')}
                                    />
                                    <datalist id={`containers-${index}`}>
                                        {containers.map((c: any) => (
                                        <option key={c.id_container} value={c.name_type} />
                                        ))}
                                    </datalist>
                                    </td>

                                    {/* UNIT */}
                                    <td>
                                    <input
                                        className={styles.inputUnit}
                                        value={row.unit}
                                        title={row.unit}
                                        onChange={(e) => handleChange(index, 'unit', e.target.value)}
                                    />
                                    </td>
                                    {/* SUBTOTAL */}
                                    <td>
                                    <input
                                        className={styles.inputSubtotal}
                                        value={row.subtotal}
                                        title={row.subtotal}
                                        onChange={(e) => handleChange(index, 'subtotal', e.target.value)}
                                        />
                                    </td>
                                    {/* VAT */}
                                    <td>
                                    <select
                                        className={styles.selectIVA}
                                        value={row.vat}
                                        onChange={(e) => {
                                            const selectedVat = VAT_OPTIONS.find(
                                                v => String(v.value) === e.target.value
                                            );

                                            handleChange(index, 'vat', selectedVat?.value ?? -1);
                                            handleChange(index, 'rate', selectedVat?.rate ?? 0);
                                        }}
                                    >
                                        {VAT_OPTIONS.map((v) => (
                                        <option key={v.label} value={v.value}>
                                            {v.label}
                                        </option>
                                        ))}
                                    </select>
                                    </td>

                                    {/* TOTAL */}
                                    <td>
                                    ${Number(row.total || 0).toFixed(2)}
                                    </td>

                                    {/* ACTIONS */}
                                    <td>
                                    <button
                                        className={styles.duplicateBtn}
                                        title={t('tvf.Duplicate')}
                                        onClick={() => {
                                        const copy = { ...row, id: Date.now() };
                                        setMaritimeConcepts([...maritimeConcepts, copy]);
                                        }}
                                    >
                                        <Copy size={16} />
                                    </button>
                                    {/*    
                                    <button
                                    className={stylese.editBtn}
                                    onClick={() => {
                                        const updated = [...maritimeConcepts];
                                        updated[index].isEditing = !updated[index].isEditing;
                                        setMaritimeConcepts(updated);
                                    }}
                                    >
                                    <Pencil size={16} />
                                    </button>
                                    */}
                                    <button
                                        className={styles.deleteBtn}
                                        title={t('tvf.Delete')}
                                        onClick={() => {
                                        setMaritimeConcepts(maritimeConcepts.filter((_, i) => i !== index));
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    </td>

                                </tr>
                                ))
                            )}
                            </tbody>
                        </table>

                        <button className={styles.addBtn} onClick={handleAddConcept}>
                        <PlusCircle size={16} />
                        {t('tvf.AddNewConcept')}
                        </button>
                    </div>
                    )}
                    {activeTab === 'AEREO' && (<>  
                    <div className={`${styles.tableWrapperAir} ${isAcceptedByClient ? styles.locked : ""}`} >

                    <h3>{t('tvf.AirConcepts')}</h3>

                    <div className={styles.scrollXX}>

                        <table className={`${styles.table} ${styles.tableAirCosts}`}>
                            <thead>
                                <tr>
                                <th>{t('tvf.Concept')}</th>
                                <th>{t('tvf.Airline')}</th>
                                <th>{t('tvf.Route')}</th>
                                <th>{t('tvf.Transit')}</th>
                                <th>{t('tvf.RateKG')}</th>
                                <th>{t('tvf.FCS')}</th> 
                                <th>{t('tvf.SSC')}</th>
                                <th>{t('tvf.MCC')}</th>
                                <th>{t('tvf.CW')}</th>
                                <th>{t('tvf.Subtotal')}</th>
                                <th>{t('tvf.VAT')}</th>
                                <th>{t('tvf.Total')}</th>
                                <th>{t('tvf.Actions')}</th>
                                </tr>
                            </thead>

                            <tbody>
                            {airConcepts.length === 0 ? (
                                <tr>
                                <td colSpan={13} className={styles.emptyCell}>
                                <span className={styles.emptyText}>
                                    {t('tvf.SinConceptos')}
                                </span>
                                </td>
                                </tr>
                            ) : (
                                airConcepts.map((row, index) => (
                                <tr key={row.id}>

                                    {/* Concept */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.concept}
                                        title={row.concept}
                                        onChange={(e) => {
                                            handleChangeAir(index, 'concept', e.target.value);
                                        }}
                                    />
                                    </td>

                                    {/* Airline */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.airline}
                                        title={row.airline}
                                        onChange={(e) => handleChangeAir(index, 'airline', e.target.value)}
                                    />
                                    </td>

                                    {/* Route */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.route}
                                        title={row.route}
                                        onChange={(e) => handleChangeAir(index, 'route', e.target.value)}
                                    />
                                    </td>

                                    {/* Transit */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.transit_days}
                                        title={row.transit_days}
                                        onChange={(e) => handleChangeAir(index, 'transit_days', e.target.value)}
                                    />
                                    </td>

                                    {/* Rate KG */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.rate_per_kg}
                                        title={row.rate_per_kg}
                                        onChange={(e) => handleChangeAir(index, 'rate_per_kg', e.target.value)}
                                    />
                                    </td>

                                    {/* FCS */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.fuel_surcharge}
                                        title={row.fuel_surcharge}
                                        onChange={(e) => handleChangeAir(index, 'fuel_surcharge', e.target.value)}
                                    />
                                    </td>

                                    {/* SSC */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.security_surcharge}
                                        title={row.security_surcharge}
                                        onChange={(e) => handleChangeAir(index, 'security_surcharge', e.target.value)}
                                    />
                                    </td>

                                    {/* MCC */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.miscellaneous_charges}
                                        title={row.miscellaneous_charges}
                                        onChange={(e) => handleChangeAir(index, 'miscellaneous_charges', e.target.value)}
                                    />
                                    </td>

                                    {/* CW */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.chargeable_weight}
                                        title={row.chargeable_weight}
                                        onChange={(e) => handleChangeAir(index, 'chargeable_weight', e.target.value)}
                                    />
                                    </td>

                                    {/* Subtotal */}
                                    <td>
                                    <input
                                        className={styles.inputSubtotal}
                                        value={row.subtotal}
                                        title={row.subtotal}
                                        onChange={(e) => handleChangeAir(index, 'subtotal', e.target.value)}
                                    />
                                    </td>

                                    {/* VAT */}
                                    <td>
                                    <select
                                        className={styles.selectIVA}
                                        value={row.vat}
                                        onChange={(e) => {
                                            const selectedVat = VAT_OPTIONS.find(
                                                v => String(v.value) === e.target.value
                                            );

                                            handleChangeAir(index, 'vat', selectedVat?.value ?? -1);
                                            handleChangeAir(index, 'rate', selectedVat?.rate ?? 0);
                                        }}
                                    >
                                        {VAT_OPTIONS.map((v) => (
                                        <option key={v.label} value={v.value}>
                                            {v.label}
                                        </option>
                                        ))}
                                    </select>
                                    </td>

                                    {/* Total */}
                                    <td>
                                    ${Number(row.total || 0).toFixed(2)}
                                    </td>

                                    {/* ACTIONS */}
                                    <td>
                                    <button
                                        className={styles.duplicateBtn}
                                        title={t('tvf.Duplicate')}
                                        onClick={() => {
                                        const copy = { ...row, id: Date.now() };
                                        setAirConcepts([...airConcepts, copy]);
                                        }}
                                    >
                                        <Copy size={16} />
                                    </button>
                                    {/* 
                                    <button
                                    className={styles.editBtn}
                                    onClick={() => {
                                        const updated = [...airConcepts];
                                        updated[index].isEditing = !updated[index].isEditing;
                                        setAirConcepts(updated);
                                    }}
                                    >
                                    <Pencil size={16} />
                                    </button>
                                    */}
                                    <button
                                        className={styles.deleteBtn}
                                        title={t('tvf.Delete')}
                                        onClick={() => {
                                        setAirConcepts(airConcepts.filter((_, i) => i !== index));
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    </td>

                                </tr>
                                ))
                            )}
                            </tbody>
                        </table>

                    </div>

                    <button className={styles.addBtn} onClick={handleAddAirConcept}>
                    <PlusCircle size={16} />
                    {t('tvf.AddNewConcept')}
                    </button>

                    </div>                 
                    <div className={`${styles.tableWrapper} ${isAcceptedByClient ? styles.locked : ""}`}>
                    <h3>{t('tvf.AirOperationalConcepts')}</h3>

                    <table className={`${styles.table} ${styles.tableConceptsAereoOperativo}`}>
                        <thead>
                        <tr>
                            <th>{t('tvf.Charge')}</th>
                            <th>{t('tvf.Concept')}</th>
                            <th>{t('tvf.Base')}</th>
                            <th>{t('tvf.Subtotal')}</th>
                            <th>{t('tvf.VAT')}</th>
                            <th>{t('tvf.Total')}</th>
                            <th>{t('tvf.Actions')}</th>
                        </tr>
                        </thead>

                        <tbody>
                        {airOperationalConcepts.length === 0 ? (
                            <tr>
                            <td colSpan={7} className={styles.emptyCell}>
                                <span className={styles.emptyText}>
                                    {t('tvf.SinConceptos')}
                                </span>
                            </td>
                            </tr>
                        ) : (
                            airOperationalConcepts.map((row, index) => (
                            <tr key={row.id}>

                                {/* CHARGE */}
                                <td>
                                    <select
                                        className={styles.selectCargo}
                                        value={row._id_type_of_charge ?? 0}
                                        onChange={(e) => {
                                            const selectedId = Number(e.target.value);
                                            const selectedText =
                                                e.target.options[e.target.selectedIndex].text;

                                            handleChangeAirOperational(index, '_id_type_of_charge', selectedId);

                                            handleChangeAirOperational(index, 'type_of_charge', selectedText);

                                        }}
                                    >
                                        <option value="">{t('tvf.Elegir')}</option>
                                        {charges.map((c: any) => (
                                            <option key={c._IdCharge} value={c._IdCharge}>
                                                {c.chargeName}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                {/* CONCEPT */}
                                <td>
                                <input
                                    className={styles.inputConcept}
                                    value={row.concept}
                                    title={row.concept}
                                    onChange={(e) => handleChangeAirOperational(index, 'concept', e.target.value)}
                                />
                                </td>

                                {/* BASE */}
                                <td>
                                    <input
                                        className={styles.inputBase}
                                        value={row.billing_base ?? ""}
                                        title={row.billing_base}
                                        onChange={(e) => handleChangeAirOperational(index, 'billing_base', e.target.value)}
                                    />
                                </td>

                                {/* SUBTOTAL */}
                                <td>
                                <input
                                    className={styles.inputSubtotal}
                                    value={row.subtotal}
                                    title={row.subtotal}
                                    onChange={(e) => handleChangeAirOperational(index, 'subtotal', e.target.value)}
                                />
                                </td>

                                {/* VAT */}
                                <td>
                                    <select
                                        className={styles.selectIVA}
                                        value={row.vat}
                                        onChange={(e) => {
                                            const selectedVat = VAT_OPTIONS.find(
                                                v => String(v.value) === e.target.value
                                            );

                                            handleChangeAirOperational(index, 'vat', selectedVat?.value ?? -1);
                                            handleChangeAirOperational(index, 'rate', selectedVat?.rate ?? 0);
                                        }}
                                    >
                                        {VAT_OPTIONS.map((v) => (
                                        <option key={v.label} value={v.value}>
                                            {v.label}
                                        </option>
                                        ))}
                                    </select>
                                </td>
                                {/* TOTAL */}
                                <td>
                                ${Number(row.total || 0).toFixed(2)}
                                </td>

                                {/* ACTIONS */}
                                <td>
                                <button
                                    className={styles.duplicateBtn}
                                    title={t('tvf.Duplicate')}
                                    onClick={() => {
                                    const copy = { ...row, id: Date.now() };
                                    setAirOperationalConcepts([...airOperationalConcepts, copy]);
                                    }}
                                >
                                    <Copy size={16} />
                                </button>
                                {/*            
                                <button
                                    className={styles.editBtn}
                                    onClick={() => {
                                        const updated = [...airOperationalConcepts];
                                        updated[index].isEditing = !updated[index].isEditing;
                                        setAirOperationalConcepts(updated);
                                    }}
                                    >
                                    <Pencil size={16} />
                                </button> 
                                  */}       
                                <button
                                    className={styles.deleteBtn}
                                    title={t('tvf.Delete')}
                                    onClick={() => {
                                    setAirOperationalConcepts(
                                        airOperationalConcepts.filter((_, i) => i !== index)
                                    );
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                                </td>

                            </tr>
                        ))
                        )}
                        </tbody>
                    </table>

                    <button className={styles.addBtn} onClick={handleAddAirOperationalConcept}>
                    <PlusCircle size={16} />
                    {t('tvf.AddNewConcept')}
                    </button>
                    </div>
                    </>
                    )}
                    {activeTab === 'TERRESTRE' && (
                    <div className={`${styles.tableWrapper} ${isAcceptedByClient ? styles.locked : ""}`}>
                        <h3>{t('tvf.LandConcepts')}</h3>

                        <table className={`${styles.table} ${styles.tableConceptsTerrestrial}`}>
                        <thead>
                            <tr>
                                <th>{t('tvf.Charge')}</th>
                                <th>{t('tvf.Concept')}</th>
                                <th>{t('tvf.Base')}</th>
                                <th>{t('tvf.Unit')}</th>
                                <th>{t('tvf.Subtotal')}</th>
                                <th>{t('tvf.VAT')}</th>
                                <th>{t('tvf.Total')}</th>
                                <th>{t('tvf.Actions')}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {landConcepts.length === 0 ? (
                                <tr>
                                <td colSpan={8} className={styles.emptyCell}>
                                <span className={styles.emptyText}>
                                    {t('tvf.SinConceptos')}
                                </span>
                                </td>
                                </tr>
                            ) : (
                                landConcepts.map((row, index) => (
                                <tr key={row.id}>

                                    {/* CHARGE */}
                                    <td>
                                    <select
                                        className={styles.selectCargo}
                                        value={row._id_type_of_charge ?? 0}
                                        onChange={(e) => {
                                            const selectedId = Number(e.target.value);
                                            const selectedText =
                                                e.target.options[e.target.selectedIndex].text;
                                            
                                            handleChangeLand(index, '_id_type_of_charge', selectedId);

                                            handleChangeLand(index, 'type_of_charge', selectedText);

                                        }}
                                    >
                                        <option value="">{t('tvf.Elegir')}</option>
                                        {charges.map((c: any) => (
                                            <option key={c._IdCharge} value={c._IdCharge}>
                                                {c.chargeName}
                                            </option>
                                        ))}
                                    </select>
                                    </td>

                                    {/* CONCEPT */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.concept}
                                        title={row.concept}
                                        onChange={(e) => handleChangeLand(index, 'concept', e.target.value)}
                                    />
                                    </td>

                                    {/* BASE */}
                                    <td>
                                    <input
                                        className={styles.inputBase}
                                        value={row.billing_base ?? ""}
                                        title={row.billing_base}
                                        onChange={(e) => handleChangeLand(index, 'billing_base', e.target.value)}
                                    />
                                    </td>

                                    {/* UNIT */}
                                    <td>
                                    <input
                                        className={styles.inputUnit}
                                        value={row.unit}
                                        title={row.unit}
                                        onChange={(e) => handleChangeLand(index, 'unit', e.target.value)}
                                    />
                                    </td>

                                    {/* SUBTOTAL */}
                                    <td>
                                    <input
                                        className={styles.inputSubtotal}
                                        value={row.subtotal}
                                        title={row.subtotal}
                                        onChange={(e) => handleChangeLand(index, 'subtotal', e.target.value)}
                                    />
                                    </td>

                                    {/* VAT */}
                                    <td>
                                        <select
                                            className={styles.selectIVA}
                                            value={row.vat}
                                            onChange={(e) => {
                                            const selectedVat = VAT_OPTIONS.find(
                                                v => String(v.value) === e.target.value
                                            );

                                            handleChangeLand(index, 'vat', selectedVat?.value ?? -1);
                                            handleChangeLand(index, 'rate', selectedVat?.rate ?? 0);
                                        }}
                                        >
                                            {VAT_OPTIONS.map((v) => (
                                            <option key={v.label} value={v.value}>
                                                {v.label}
                                            </option>
                                            ))}
                                        </select>
                                    </td>



                                    {/* TOTAL */}
                                    <td>
                                    ${Number(row.total || 0).toFixed(2)}
                                    </td>

                                    {/* ACTIONS */}
                                    <td>
                                    <button
                                        className={styles.duplicateBtn}
                                        title={t('tvf.Duplicate')}
                                        onClick={() => {
                                        const copy = { ...row, id: Date.now() };
                                        setLandConcepts([...landConcepts, copy]);
                                        }}
                                    >
                                        <Copy size={16} />
                                    </button>
                                    {/* <button
                                    className={styles.editBtn}
                                    onClick={() => {
                                        const updated = [...landConcepts];
                                        updated[index].isEditing = !updated[index].isEditing;
                                        setLandConcepts(updated);
                                    }}
                                    >
                                    <Pencil size={16} />
                                    </button>     */}
                                    <button
                                        className={styles.deleteBtn}
                                        title={t('tvf.Delete')}
                                        onClick={() => {
                                        setLandConcepts(landConcepts.filter((_, i) => i !== index));
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    </td>

                                </tr>
                                ))
                            )}
                            </tbody>
                        </table>

                        <button className={styles.addBtn} onClick={handleAddLandConcept}>
                        <PlusCircle size={16} />
                        {t('tvf.AddNewConcept')}
                        </button>
                    </div>
                    )}
                    {activeTab === 'ACCESORIAL' && (
                    <div className={`${styles.tableWrapper} ${isAcceptedByClient ? styles.locked : ""}`}>
                        <h3>{t('tvf.ConsultingServicesConcepts')}</h3>

                        <table className={`${styles.table} ${styles.tableConceptsAsesorial}`}>
                        <thead>
                            <tr>
                                <th>{t('tvf.Charge')}</th>
                                <th>{t('tvf.Concept')}</th>
                                <th>{t('tvf.Base')}</th>
                                <th>{t('tvf.Unit')}</th>
                                <th>{t('tvf.Subtotal')}</th>
                                <th>{t('tvf.VAT')}</th>
                                <th>{t('tvf.Total')}</th>
                                <th>{t('tvf.Actions')}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {consultingServicesConcepts.length === 0 ? (
                                <tr>
                                <td colSpan={8} className={styles.emptyCell}>
                                <span className={styles.emptyText}>
                                    {t('tvf.SinConceptos')}
                                </span>
                                </td>
                                </tr>
                            ) : (
                                consultingServicesConcepts.map((row, index) => (
                                <tr key={row.id}>

                                    {/* CHARGE */}
                                    <td>
                                    <select
                                        className={styles.selectCargo}
                                        value={row._id_type_of_charge ?? 0}
                                        onChange={(e) => {
                                            const selectedId = Number(e.target.value);
                                            const selectedText =
                                                e.target.options[e.target.selectedIndex].text;

                                            handleChangeConsultingServices(index, '_id_type_of_charge', selectedId);

                                            handleChangeConsultingServices(index, 'type_of_charge', selectedText);

                                        }}
                                    >
                                        <option value="">{t('tvf.Elegir')}</option>
                                        {charges.map((c: any) => (
                                            <option key={c._IdCharge} value={c._IdCharge}>
                                                {c.chargeName}
                                            </option>
                                        ))}
                                    </select>
                                    </td>

                                    {/* CONCEPT */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.concept}
                                        title={row.concept}
                                        onChange={(e) => handleChangeConsultingServices(index, 'concept', e.target.value)}
                                    />
                                    </td>

                                    {/* BASE */}
                                    <td>
                                    <input
                                        className={styles.inputBase}
                                        value={row.billing_base ?? ""}
                                        title={row.billing_base}
                                        onChange={(e) => handleChangeConsultingServices(index, 'billing_base', e.target.value)}
                                    />
                                    </td>

                                    {/* UNIT */}
                                    <td>
                                    <input
                                        className={styles.inputUnit}
                                        value={row.unit}
                                        title={row.unit}
                                        onChange={(e) => handleChangeConsultingServices(index, 'unit', e.target.value)}
                                    />
                                    </td>

                                    {/* SUBTOTAL */}
                                    <td>
                                    <input
                                        className={styles.inputSubtotal}
                                        value={row.subtotal}
                                        title={row.subtotal}
                                        onChange={(e) => handleChangeConsultingServices(index, 'subtotal', e.target.value)}
                                    />
                                    </td>

                                    {/* VAT */}
                                    <td>
                                        <select
                                            className={styles.selectIVA}
                                            value={row.vat}
                                            onChange={(e) => {
                                            const selectedVat = VAT_OPTIONS.find(
                                                v => String(v.value) === e.target.value
                                            );

                                            handleChangeConsultingServices(index, 'vat', selectedVat?.value ?? -1);
                                            handleChangeConsultingServices(index, 'rate', selectedVat?.rate ?? 0);
                                        }}
                                        >
                                            {VAT_OPTIONS.map((v) => (
                                            <option key={v.label} value={v.value}>
                                                {v.label}
                                            </option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* TOTAL */}
                                    <td>
                                    ${Number(row.total || 0).toFixed(2)}
                                    </td>

                                    {/* ACTIONS */}
                                    <td>
                                    <button
                                        className={styles.duplicateBtn}
                                        title={t('tvf.Duplicate')}
                                        onClick={() => {
                                        const copy = { ...row, id: Date.now() };
                                        setconsultingServicesConcepts([...consultingServicesConcepts, copy]);
                                        }}
                                    >
                                        <Copy size={16} />
                                    </button>
                                    {/* <button
                                    className={styles.editBtn}
                                    onClick={() => {
                                        const updated = [...landConcepts];
                                        updated[index].isEditing = !updated[index].isEditing;
                                        setLandConcepts(updated);
                                    }}
                                    >
                                    <Pencil size={16} />
                                    </button>     */}
                                    <button
                                        className={styles.deleteBtn}
                                        title={t('tvf.Delete')}
                                        onClick={() => {
                                        setconsultingServicesConcepts(consultingServicesConcepts.filter((_, i) => i !== index));
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    </td>

                                </tr>
                                ))
                            )}
                            </tbody>
                        </table>

                        <button className={styles.addBtn} onClick={handleAddConsultingServicesConcept}>
                        <PlusCircle size={16} />
                        {t('tvf.AddNewConcept')}
                        </button>
                    </div>
                    )}
                </section>
              {/* ------------------------------------------- apartado del desglose de los cargos  ------------------------------------- */}
                <section className={styles.cardBreakdown}>
                <div className={styles.badges}>
                    <span className={styles.badgePrimary}>
                    {t('tvf.BreakdownByCharges')}
                    </span>
                </div>

                <div className={styles.breakdownTable}>
                    <div className={styles.breakdownHeader}>
                    <span>{t('tvf.Charge')}</span>
                    <span>{t('tvf.Subtotal')}</span>
                    <span>{t('tvf.VAT')}</span>
                    <span>{t('tvf.Total')}</span>
                    </div>

                    {breakdownByCharge.map((row, index) => (
                    <div key={index} className={styles.breakdownRow}>
                        <span>{getChargeName(row._id_type_of_charge)}</span>
                        <span>${row.subtotal.toFixed(2)}</span>
                        <span>${row.vat.toFixed(2)}</span>
                        <span>${row.total.toFixed(2)}</span>
                    </div>
                    ))}
                </div>
                </section>
               {/* ------------------------------------------- apartado de los totales de los conceptos  ------------------------------------- */}
                <section className={styles.totalsSection}>
                    <div className={styles.totalsContainer}>
                        <div className={styles.totalsBox}>

                        {/* Subtotal */}
                        <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>
                            {t('tvf.SubtotalAmount')}
                        </span>
                        <span className={styles.totalValue}>
                            {currency} {totals.subtotal.toFixed(2)}
                        </span>
                        </div>

                        {/* IVA */}
                        <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>
                            {t('tvf.EstimatedTaxVAT')}
                        </span>
                        <span className={styles.totalValue}>
                            {currency} {totals.vat.toFixed(2)}
                        </span>
                        </div>

                        {/* TOTAL */}
                        <div className={styles.totalRowFinal}>
                        <span className={styles.totalLabelFinal}>
                            {t('tvf.TotalAmount')}
                        </span>

                        <span className={styles.totalValueFinal}>
                            {currency} {totals.total.toFixed(2)}
                        </span>
                        </div>

                        </div>
                    </div>
                </section>
                {/* ------------------------------------------- apartado de los comentarios  ------------------------------------- */}
                <section className={`${styles.cardcomments} ${isAcceptedByClient ? styles.locked : ""}`}>

                    {/* Header */}
                    <div className={styles.badges}>
                        <span className={styles.badgePrimary}>
                        {t('tvf.AdditionalNotesComments')}
                        </span>
                    </div>

                    {/* Toolbar */}
                    <div className={styles.editorToolbar}>
                        <button onClick={() => exec("bold")}><Bold size={16} /></button>
                        <button onClick={() => exec("italic")}><Italic size={16} /></button>
                        <button onClick={() => exec("underline")}><Underline size={16} /></button>
                        <div className={styles.divider} />

                        <button
                        onMouseDown={(e) => {
                            e.preventDefault(); 
                            exec("insertUnorderedList");
                        }}
                        >
                        <List size={16} />
                        </button>

                        <button onClick={() => exec("insertOrderedList")}>
                        <ListOrdered size={16} />
                        </button>
                        
                        <button onClick={openImagePicker}>
                        <Image size={16} />
                        </button>
                        
                        <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                        />

                        <div className={styles.autoSave}>
                        {lastSaved && `${t('tvf.SavedAt')} ${lastSaved}`}
                        </div>
                    </div>

                    {/* Editor */}
                    <div
                        ref={editorRef}
                        contentEditable={!isAcceptedByClient}
                        className={`${styles.editor} ${
                            isAcceptedByClient ? styles.editorReadOnly : ""
                        }`}
                        suppressContentEditableWarning
                        onClick={() => {
                            if (!isAcceptedByClient) {
                                editorRef.current?.focus();
                            }
                        }}
                        onInput={() => {
                            if (isAcceptedByClient) return;

                            const now = new Date();
                            setLastSaved(now.toLocaleTimeString());
                        }}
                    >
                    </div>
                </section>
               {/* ------------------------------------------- apartado de las condiciones  ------------------------------------- */}
                <section className={styles.cardTerms}>
                        {/* Header */}
                        <div className={styles.termsHeader}>
                            <div className={styles.badges}>
                                <span className={styles.badgePrimary}>
                                    {t('tvf.TermsConditions')}
                                </span>
                            </div>
                        </div>

                        {/* SEARCH */}
                        <div className={`${styles.termsSearch} ${isAcceptedByClient ? styles.locked : ""}`}>
                            <div className={styles.searchBox}>
                                <Search size={16} className={styles.searchIcon} />
                                
                                <input
                                    type="text"
                                    placeholder={t('tvf.SearchOrAddTerms')}
                                    className={styles.termsSearchInput}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onBlur={() => setTimeout(() => setSearchTerm(''), 150)}  
                                />
                                {searchTerm && (
                                <div className={styles.tagsResults}>
                                    {filteredTags.map((item: any) => {

                                        // idioma dinámico
                                        const conditionText =
                                            item.conditions?.[languageFormat] ||
                                            item.conditions?.es ||
                                            item.conditions?.en ||
                                            '';

                                        return (
                                            <div
                                                key={item._id}
                                                className={styles.tagItem}
                                                onMouseDown={() => {
                                                setTermsValue(prev => [
                                                ...prev,
                                                ...conditionText
                                                    .split(/\n+/)
                                                    .map((t: string) => t.trim())
                                                    .filter(Boolean)
                                                ]);
                                                setSearchTerm('');
                                                }}
                                            >
                                                <div className={styles.tagTitle}>
                                                    {item.title}
                                                </div>

                                                {/* PREVIEW */}
                                                <div className={styles.tagPreview}>
                                                    {conditionText.substring(0, 150) + '...'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            </div>

                            {/* <button className={styles.addBtnTerm}>
                                <PlusCircle size={18} />
                            </button> */}
                        </div>

                        {/* Textarea */}
                        <textarea
                            className={styles.termsTextarea }
                            rows={10}
                            placeholder={t('tvf.TermsPlaceholder')}
                            value={termsValue.join('\n')}
                            readOnly={isAcceptedByClient} // solo lectura a aceptadas
                            onChange={(e) =>
                                !isAcceptedByClient &&
                                setTermsValue(
                                e.target.value.split('\n') 
                                )
                            }
                            />
                </section>
            </div>
            {/* ================= MODAL ================= */}
            <Modal
            isOpen={modalState.isOpen}
            onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
            onConfirm={async () => {
                await modalState.onConfirm?.();
                setModalState(prev => ({ ...prev, isOpen: false }));
            }}
            title={modalState.title}
            message={modalState.message}
            type={modalState.type}
            showCancel={modalState.showCancel}
            confirmText={modalState.confirmText || t('tvf.Confirm')}
            cancelText={modalState.cancelText || t('tvf.Cancel')}
            />
            <button
            className={styles.scrollTopButton}
            onClick={scrollToTop}
            >
            <FaArrowUp size={22} />
            </button>
        </div>
    );
}