// React
import { useState, useRef, useEffect,useMemo  } from 'react';
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
//interfaz o modelo
import type { VatOption, LanguageOption, CurrencyOption, StatusQuote,
    QuotedRate,QuoteDetail, ServiceItem , Shipment,
    Location, ServiceAssociated, CargoItem, Container, StatusControl,
    Charges, MaritimeCharge, AirCharges, AirlineCost, OperationalCost,
    LandCharge, CreatedBy
} from '../types/quotedRate';
//Servicio de la API
import { uploadQuotedRate, updateQuotedRate , GetQuotedRateByQuotationRequestAndControlInfo } from "../services/quotedRateServices";
// Icons
import {
        ArrowLeft, Save, Eye, FileText, User, Tag, Ship, Truck, Plane, Package, PlusCircle, Trash2, Search,
        Copy, Bold, Italic, Underline, List, ListOrdered, Image, Shield, Warehouse ,UserCheck
} from "lucide-react";

export default function QuotedRate({ 
    onClose, 
    pricingData, 
    quotationRequestData 
}: any) {

const { t, language } = useLanguage();
const { showError, showSuccess } = useNotification();
const { user } = useAuth();
const [activeTab, setActiveTab] = useState<'MARITIMO' | 'AEREO' | 'TERRESTRE'| 'ASESORIAL'>('MARITIMO');

const [servicesCategory1, setServicesCategory1] = useState<any[]>([]);
const [servicesCategory2, setServicesCategory2] = useState<any[]>([]);
const [charges, setCharges] = useState<any[]>([]);
const [containers, setContainers] = useState<any[]>([]);

const [maritimeConcepts, setMaritimeConcepts] = useState<any[]>([]);
const [airConcepts, setAirConcepts] = useState<any[]>([]);
const [airOperationalConcepts, setAirOperationalConcepts] = useState<any[]>([]);
const [landConcepts, setLandConcepts] = useState<any[]>([]);
const [consultingServicesConcepts, setconsultingServicesConcepts] = useState<any[]>([]);
const [tags, setTags] = useState<any[]>([]);

const [exchangeRate, setExchangeRate] = useState<number>(1.0000);
const [currency, setCurrency] = useState("MXN");
const [languageFormat, setLanguage] = useState("es");
const [idLanguage, setIdLanguage] = useState<number>(1);


const [termsValue, setTermsValue] = useState<string>("");
const [quotedRateRegistradaInfo, setQuotedRateInfo] = useState<any>(null);
const isEdit = !!quotedRateRegistradaInfo?.data?.[0]?._id;
const [validFrom, setValidFrom] = useState("");
const [validUntil, setValidUntil] = useState("");

const [searchTerm, setSearchTerm] = useState('');

useEffect(() => {
    loadServices(); // cargas los servicios
    loadCharges(); //cargar los cargos
    loadContainers(); //cargar los contenedores
    loadClauses(); //cargar las condiciones
    consultarQuotedRateViva(); //consultamos si hay una tarifa existente
}, []);

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
    {idVar:1, label: "N/A", value: -1 },  
    {idVar:2, label: "0%", value: 0 },
    {idVar:3, label: "4%", value: 4 },
    {idVar:4, label: "8%", value: 8 },
    {idVar:5, label: "16%", value: 16 }
];

/*          Catalogo de idiomas             */
const LANGUAGE_OPTIONS: LanguageOption[] = [
    { idLang: 1, labelSpanish: "Español", labelEnglish: "Spanish", value: "es" },
    { idLang: 2, labelSpanish: "Inglés", labelEnglish: "English", value: "en" }
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
    { idCurrency: 1, label: "MXN", value: "MXN" },
    { idCurrency: 2, label: "USD", value: "USD" },
    { idCurrency: 3, label: "EUR", value: "EUR" }
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

    const mapCommon = (c: any, i: number) => ({
        id: `${Date.now()}-${i}`,
        type_of_charge: c.type_of_charge ? Number(c.type_of_charge) : "",
        concept: c.concept ?? "",
        billing_base: c.billing_base ?? "",
        unit: safeNum(c.unit),
        subtotal: safeNum(c.subtotal),
        vat: safeVat(c.vat),
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
    // ================== IDIOMA ==================
    const lang = getLanguage(item);
    if (lang) {
        setLanguage(lang.value);
        setIdLanguage(lang.id);
    }
    // ================== MONEDA ==================
    if (CURRENCY_OPTIONS.some(c => c.value === item.currency)) {
        setCurrency(item.currency);
    }

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
            container_type: c.container_type ?? ""
        }))
    );

    setAirConcepts(
        (charges.air?.airline_costs || []).map((c: any, i: number) => ({
            id: `${Date.now()}-air-${i}`,
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
            total: safeNum(c.total)
        }))
    );

    setAirOperationalConcepts(
        (charges.air?.operational_costs || []).map(mapCommon)
    );

    setLandConcepts(
        (charges.land || []).map(mapCommon)
    );

    setconsultingServicesConcepts(
        (charges.consulting_services || []).map(mapCommon)
    );

}, [quotedRateRegistradaInfo]);

// ================== CALCULO TOTAL en catalogos conceptos ================== //
const calculateTotal = (subtotal: number, vat: number, tc: number) => {
    const base = subtotal * tc;
    if (vat === -1) return base;
    return base * (1 + vat / 100);
};

const handleChangeGeneric = (
    index: number,
    field: string,
    value: any,
    list: any[],
    setList: Function,
    tc: number
    ) => {
    const updated = [...list];
    updated[index][field] = value;

    const subtotal = Number(updated[index].subtotal || 0);
    const vat = Number(updated[index].vat ?? 0);

    updated[index].total = calculateTotal(subtotal, vat, tc);

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
    type_of_charge: 0,
    concept: "",
    billing_base: "",
    container_type: "",
    unit: 0,
    subtotal: 0,
    vat: "-1",
    total: 0
};

const airTemplate = {
    concept: "",
    airline: "",
    route: "",
    transit_days: "",
    rate_per_kg: "",
    fuel_surcharge: "",
    security_surcharge: "",
    miscellaneous_charges: "",
    chargeable_weight: "",
    subtotal: 0,
    vat: "-1",
    total: 0
};

const airOperationalTemplate = {
    type_of_charge: 0,
    concept: "",
    billing_base: "",
    subtotal: 0,
    vat: "-1",
    total: 0
};

const landTemplate = {
    type_of_charge: 0,
    concept: "",
    billing_base: "",
    unit: 0,
    subtotal: 0,
    vat: "-1",
    total: 0
};

const consultingServicesTemplate = {
    type_of_charge: 0,
    concept: "",
    billing_base: "",
    unit: 0,
    subtotal: 0,
    vat:"-1",
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
const handleChange = (i: number, f: string, v: any) => handleChangeGeneric(i, f, v, maritimeConcepts, setMaritimeConcepts, exchangeRate);
const handleChangeAir = (i: number, f: string, v: any) => handleChangeGeneric(i, f, v, airConcepts, setAirConcepts, exchangeRate);
const handleChangeAirOperational = (i: number, f: string, v: any) => handleChangeGeneric(i, f, v, airOperationalConcepts, setAirOperationalConcepts, exchangeRate);
const handleChangeLand = (i: number, f: string, v: any) => handleChangeGeneric(i, f, v, landConcepts, setLandConcepts, exchangeRate);
const handleChangeConsultingServices = (i: number, f: string, v: any) => handleChangeGeneric(i, f, v, consultingServicesConcepts, setconsultingServicesConcepts, exchangeRate);

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

        const key = c.type_of_charge != null && c.type_of_charge !== ""
            ? String(c.type_of_charge)
            : "SIN_CARGO";

        if (!map[key]) {
            map[key] = {
                type_of_charge: key,
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

    return found?.chargeName || "SIN CARGO";
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
    wrapper.contentEditable = "false"; 

    wrapper.style.display = "inline-block";
    wrapper.style.resize = "both";
    wrapper.style.overflow = "hidden";
    wrapper.style.border = "1px solid #ddd";
    wrapper.style.borderRadius = "6px";
    wrapper.style.padding = "4px";
    wrapper.style.margin = "8px 0";
    wrapper.style.width = "200px"; // tamaño 

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
    return services.map((s): ServiceItem => ({
        id_service_item: s.idServiceItem,
        _id_service: s.idService,
        category: s.category ?? 1,
        service_name: s.nameService,
        shipments: (s.shipments || []).map((sh: any): Shipment => ({
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
        services_asociated: (sh.servicesAsociated || []).map(
            (a: any): ServiceAssociated => ({
            _id_service_associated: a.idServiceAsociated,
            service_associated_name: a.serviceAsociatedName,
            })
        ),
        cargo: (sh.cargo || []).map((c: any): CargoItem => ({
            merchandise: c.name ?? "",
            weight_total: c.weigthTotal ?? 0,
            unit_weight: c.unitWeight ?? "",
            volume_total: c.volumeTotal ?? 0,
            unit_measurement: c.unitMeasurement ?? "",
        })),
        containers: (sh.containers || []).map((c: any): Container => ({
            _id_container: c.containerId,
            name_type: c.nameType,
            quantity: c.quantity,
            gross_weight: c.grossWeight,
            comodity: c.commodity,
        })),
        })),
    }));
};

const toUTCDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toISOString();
};

const handleSaveQuotedRate = async (statusOverride?: StatusQuote) => {
    try {
    const current = quotedRateRegistradaInfo?.data?.[0];

    const statusToUse = statusOverride || selectedStatus;

    const payload: QuotedRate = {
        _id: current?._id || null,
        _idcuote: current?._idcuote || null,
        quote_number: current?.quote_number || null,
        version: isEdit
        ? (current?.version || 0) + 1
        : 1,
        _id_control: pricingData?.id || "",
        control_number: pricingData?.control || "",
        _idreferencerequest: quotationRequestData?.id || "",
        referencerequest: quotationRequestData?.referenceRequest || "",
        prospect: pricingData?.customer_business_name || "sin prospecto",
        _id_customer: pricingData?.id_customer || "",
        customer_business_name: pricingData?.customer_business_name || "",
        status_control: {
            id_status_control: pricingData?.status_control?.id_status_control ?? 0,
            status_control_name: pricingData?.status_control?.status_control_name ?? "",
        },
        currency: currency,
        exchange: exchangeRate,
        environmentid: pricingData?.environmentid ?? 2,
        environment: "ATLAS EXPEDITORS S.A. DE C.V.",
        details: [
            {
            services: mapServicesFromPricing(pricingData?.services || []),
           // services: mapServicesFromPricing(pricingData?.services || []),
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
        conditions: termsValue || "",
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
        status_cuote_name: statusToUse.labelEnglish.toUpperCase(),
        id_language: idLanguage,
        language: languageFormat,
        previous_version_id:  null,//aqui debe cambiar- ajuste pendiente
        previous_version_cuote:  null,//aqui debe cambiar- ajuste pendiente
        archived: false,
        data_state: 1
        };

        // ============================
        // SWITCH CREATE / UPDATE
        // ============================
        let response;

        if (isEdit) {
        console.log("----UPDATE MODE----");
        response = await updateQuotedRate(
            current?.quote_number,
            payload
        );

        } else {
        console.log("----CREATE MODE----");

        response = await uploadQuotedRate(
            quotationRequestData?.referenceRequest || "",
            pricingData?.control || "",
            payload
        );
        }

    // ============================
    // RESPUESTA
    // ============================
    if (response?.codeStatus === 200 || response?.codeStatus === 201) {
        showSuccess(
        isEdit
            ? `${t('tvf.UpdateOK')} ${response?.atrribute?.value ?? ''}`
            : `${t('tvf.GenerateOK')} ${response?.atrribute?.value ?? ''}`
        );

        onClose?.();
        } else {
        showError(
            isEdit
            ? `${t('tvf.UpdateError')} ${response?.atrribute?.value ?? ''}`
            : `${t('tvf.GenerateError')} ${response?.atrribute?.value ?? ''}`
        );
    }

  } catch (error) {
    console.error("Error en save quoted rate:", error);
    showError("Error al guardar");
  }
};
 /* ===================================== EMPIEZA EL DISEÑO FRONT ========================================= */
return (
    <div className={styles.contentWrapper}>
        <div className={styles.container}>
            {/* ===== HEADER ===== */}
            <div className={styles.header}>
                <h1 className={styles.title}>{t('tvf.title')}</h1>
                <div className={styles.buttonGroup}>

                    <button className={styles.headerButton} onClick={onClose}>
                        <ArrowLeft size={18} />
                    </button>

                    <button className={styles.headerButton} onClick={() => handleSaveQuotedRate(STATUS_QUOTE[0])}>
                        <Save size={18} />
                        <span>
                            {t('tvf.Draft')}
                        </span>
                    </button>

                    <button className={styles.headerButton}>
                        <Eye size={18} />
                        <span>{t('tvf.Preview')}</span>
                    </button>

                    <button className={styles.headerButton} onClick={() => handleSaveQuotedRate(STATUS_QUOTE[1])}>
                    <FileText size={18} />
                    <span>{t('tvf.Generate')}</span>
                    </button>
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
                    
                    <div className={styles.langBlock}>
                        <span className={styles.badgeLang}>
                            {t('tvf.LanguageFormat')}
                        </span>
                    </div>

                    <div className={styles.langSelect}>
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
                            {languageFormat === "es"
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
                    <div className={styles.cardContent}>

                    {/* LEFT */}
                    <div className={styles.leftSection}>
                        {/* header */}
                        <div>

                        <h3 className={styles.clientName}>
                            {pricingData?.customer_business_name || ''}
                        </h3>
                        </div>
                        {/* grid info */}
                        <div className={styles.infoGrid}>

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
                            <span className={styles.mono}>{quotationRequestData?.referenceRequest  || 'sin referencia cotización'}</span>
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
                                            className={styles.exchangeInput}
                                            />
                                </div>
                                <div className={styles.version}>
                                    {t('tvf.Version')}: {quotedRateRegistradaInfo?.data?.[0]?.version  ?? 1}
                                </div>
                            </div>

                        {/* fechas */}
                        <div className={styles.dateBlock}>
                            <span className={styles.labelMini}>
                            {t('tvf.OfferValidity')}
                            </span>

                            <div className={styles.dateInputs}>

                            <input
                            type="date"
                            className={styles.dateField}
                            value={validFrom}
                            onChange={(e) => setValidFrom(e.target.value)}
                            />

                            <span className={styles.separator}>→</span>

                            <input
                            type="date"
                            className={styles.dateField}
                            value={validUntil}
                            onChange={(e) => setValidUntil(e.target.value)}
                            />
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

                    const shipment = service.shipments?.[0];  
                    const getIcon = () => {
                        return serviceIconsCategory1ById[service.idService] || <Package size={18} />;
                    };

                    return (
                        <div key={service.idServiceItem} className={styles.serviceCard}>

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
                                    {shipment?.typeOperation || 'N/A'}
                                </span>
                                <span className={styles.tagtypeShipment}>
                                    {shipment?.typeShipment || 'N/A'}
                                </span>
                                </div>
                            </div>

                            </div>

                            <div className={styles.serviceRight}>
                            <span className={styles.labelMini}>Incoterm</span>
                            <span className={styles.incoterm}>
                                {shipment?.incoterm || 'N/A'}
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
                                    
                                    {/* Línea principal */}
                                    {(shipment?.origin?.city || shipment?.origin?.countryCode) && (
                                        <span className={styles.location}>
                                        {shipment?.origin?.city}
                                        {shipment?.origin?.city && shipment?.origin?.countryCode && ', '}
                                        {shipment?.origin?.countryCode}
                                        </span>
                                    )}

                                    {/* Línea secundaria */}
                                    {[
                                        shipment?.origin?.zipCode && `CP ${shipment.origin.zipCode}`,
                                        shipment?.origin?.portCode && `Puerto: ${shipment.origin.portCode}`,
                                        shipment?.origin?.airportCode && `Aeropuerto: ${shipment.origin.airportCode}`
                                    ].filter(Boolean).length > 0 && (
                                        <span className={styles.subLocation}>
                                        {[
                                            shipment?.origin?.zipCode && `CP ${shipment.origin.zipCode}`,
                                            shipment?.origin?.portCode && `Puerto: ${shipment.origin.portCode}`,
                                            shipment?.origin?.airportCode && `Aeropuerto: ${shipment.origin.airportCode}`
                                        ]
                                            .filter(Boolean)
                                            .join(' • ')}
                                        </span>
                                    )}

                                    <span className={styles.subLabelLocation}>Origen</span>
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
                                    
                                    {(shipment?.destination?.city || shipment?.destination?.countryCode) && (
                                        <span className={styles.location}>
                                        {shipment?.destination?.city}
                                        {shipment?.destination?.city && shipment?.destination?.countryCode && ', '}
                                        {shipment?.destination?.countryCode}
                                        </span>
                                    )}

                                    {[
                                        shipment?.destination?.zipCode && `CP ${shipment.destination.zipCode}`,
                                        shipment?.destination?.portCode && `Puerto: ${shipment.destination.portCode}`,
                                        shipment?.destination?.airportCode && `Aeropuerto: ${shipment.destination.airportCode}`
                                    ].filter(Boolean).length > 0 && (
                                        <span className={styles.subLocation}>
                                        {[
                                            shipment?.destination?.zipCode && `CP ${shipment.destination.zipCode}`,
                                            shipment?.destination?.portCode && `Puerto: ${shipment.destination.portCode}`,
                                            shipment?.destination?.airportCode && `Aeropuerto: ${shipment.destination.airportCode}`
                                        ]
                                            .filter(Boolean)
                                            .join(' • ')}
                                        </span>
                                    )}

                                    <span className={styles.subLabelLocation}>Destino</span>
                                    </div>
                                </div>

                                </div>

                            {/* SERVICIOS ASOCIADOS */}
                            <div className={styles.associated}>
                                <p className={styles.labelMini}>{t('tvf.AssociatedServices')}</p>

                                <div className={styles.badgeList}>
                                {shipment?.servicesAsociated?.length > 0 ? (
                                    shipment.servicesAsociated.map((s: any) => {
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
                                    {shipment?.cargo?.map((c: any) => c.name).join(', ') || 'N/A'}
                                </span>
                                </div>

                                <div className={styles.cargoDivider}></div>

                                {/* PESO Y VOLUMEN */}
                                <div className={styles.cargoRight}>
                                <div className={styles.cargoItem}>
                                    <span className={styles.cargoNumber}>
                                    {shipment?.cargo?.reduce((acc: number, c: any) => acc + (c.weigthTotal || 0), 0)}
                                    </span>
                                    <span className={styles.cargoUnit}>
                                        {shipment?.cargo?.[0]?.unitWeight  || ''}
                                    </span>
                                </div>

                                <div className={styles.cargoItem}>
                                    <span className={styles.cargoNumber}>
                                    {shipment?.cargo?.reduce((acc: number, c: any) => acc + (c.volumeTotal || 0), 0)}
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
                            <Ship size={18} /> {t('tvf.Maritime')}
                        </div>

                        <div
                            className={`${styles.tabItem} ${activeTab === 'AEREO' ? styles.active : ''}`}
                            onClick={() => setActiveTab('AEREO')}
                        >
                            <Plane  size={18} />  {t('tvf.Air')}
                        </div>

                        <div
                            className={`${styles.tabItem} ${activeTab === 'TERRESTRE' ? styles.active : ''}`}
                            onClick={() => setActiveTab('TERRESTRE')}
                        >
                            <Truck size={18} />    {t('tvf.Land')}
                        </div>
                        <div
                            className={`${styles.tabItem} ${activeTab === 'ASESORIAL' ? styles.active : ''}`}
                            onClick={() => setActiveTab('ASESORIAL')}
                        >
                            <UserCheck  size={18} />    {t('tvf.Advisory')}
                        </div>
                    </div>
                    {activeTab === 'MARITIMO' && (
                    <div className={styles.tableWrapper}>
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
                                    Sin conceptos
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
                                        value={row.type_of_charge ?? ""}
                                        onChange={(e) => handleChange(index, 'type_of_charge', Number(e.target.value))}
                                    >
                                        <option value="">Elegir</option>
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
                                        onChange={(e) => handleChange(index, 'concept', e.target.value)}
                                    />
                                    </td>

                                    {/* BASE */}
                                    <td>
                                    <input
                                        className={styles.inputBase}
                                        value={row.billing_base ?? ""}
                                        onChange={(e) => handleChange(index, 'billing_base', e.target.value)}
                                    />
                                    </td>

                                    {/* CONTAINER */}
                                    <td>
                                    <input
                                    list={`containers-${index}`}
                                    className={styles.selectContainer}
                                    value={row.container_type ?? ""}
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
                                    placeholder="Elegir contenedor..."
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
                                        onChange={(e) => handleChange(index, 'unit', e.target.value)}
                                    />
                                    </td>
                                    {/* SUBTOTAL */}
                                    <td>
                                    <input
                                        className={styles.inputSubtotal}
                                        value={row.subtotal}
                                        onChange={(e) => handleChange(index, 'subtotal', e.target.value)}
                                        />
                                    </td>
                                    {/* VAT */}
                                    <td>
                                    <select
                                        className={styles.selectIVA}
                                        value={row.vat}
                                        onChange={(e) => handleChange(index, 'vat', e.target.value)}
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
                                        onClick={() => {
                                        const copy = { ...row, id: Date.now() };
                                        setMaritimeConcepts([...maritimeConcepts, copy]);
                                        }}
                                    >
                                        <Copy size={16} />
                                    </button>
                                    {/*    
                                    <button
                                    className={styles.editBtn}
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
                    <div className={styles.tableWrapperAir}>

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
                                    Sin conceptos
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
                                        onChange={(e) => handleChangeAir(index, 'concept', e.target.value)}
                                    />
                                    </td>

                                    {/* Airline */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.airline}
                                        onChange={(e) => handleChangeAir(index, 'airline', e.target.value)}
                                    />
                                    </td>

                                    {/* Route */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.route}
                                        onChange={(e) => handleChangeAir(index, 'route', e.target.value)}
                                    />
                                    </td>

                                    {/* Transit */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.transit_days}
                                        onChange={(e) => handleChangeAir(index, 'transit_days', e.target.value)}
                                    />
                                    </td>

                                    {/* Rate KG */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.rate_per_kg}
                                        onChange={(e) => handleChangeAir(index, 'rate_per_kg', e.target.value)}
                                    />
                                    </td>

                                    {/* FCS */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.fuel_surcharge}
                                        onChange={(e) => handleChangeAir(index, 'fuel_surcharge', e.target.value)}
                                    />
                                    </td>

                                    {/* SSC */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.security_surcharge}
                                        onChange={(e) => handleChangeAir(index, 'security_surcharge', e.target.value)}
                                    />
                                    </td>

                                    {/* MCC */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.miscellaneous_charges}
                                        onChange={(e) => handleChangeAir(index, 'miscellaneous_charges', e.target.value)}
                                    />
                                    </td>

                                    {/* CW */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.chargeable_weight}
                                        onChange={(e) => handleChangeAir(index, 'chargeable_weight', e.target.value)}
                                    />
                                    </td>

                                    {/* Subtotal */}
                                    <td>
                                    <input
                                        className={styles.inputConcept}
                                        value={row.subtotal}
                                        onChange={(e) => handleChangeAir(index, 'subtotal', e.target.value)}
                                    />
                                    </td>

                                    {/* VAT */}
                                    <td>
                                    <select
                                        className={styles.selectIVA}
                                        value={row.vat}
                                        onChange={(e) => handleChangeAir(index, 'vat', e.target.value)}
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
                    <div className={styles.tableWrapper}>
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
                                    Sin conceptos
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
                                        value={row.type_of_charge ?? ""}
                                        onChange={(e) => handleChangeAirOperational(index, 'type_of_charge', Number(e.target.value))}
                                    >
                                        <option value="">Elegir</option>
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
                                    onChange={(e) => handleChangeAirOperational(index, 'concept', e.target.value)}
                                />
                                </td>

                                {/* BASE */}
                                <td>
                                    <input
                                        className={styles.inputBase}
                                        value={row.billing_base ?? ""}
                                        onChange={(e) => handleChangeAirOperational(index, 'billing_base', e.target.value)}
                                    />
                                </td>

                                {/* SUBTOTAL */}
                                <td>
                                <input
                                    className={styles.inputSubtotal}
                                    value={row.subtotal}
                                    onChange={(e) => handleChangeAirOperational(index, 'subtotal', e.target.value)}
                                />
                                </td>

                                {/* VAT */}
                                <td>
                                    <select
                                        className={styles.selectIVA}
                                        value={row.vat}
                                        onChange={(e) => handleChangeAirOperational(index, 'vat', e.target.value)}
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
                    <div className={styles.tableWrapper}>
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
                                    Sin conceptos
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
                                        value={row.type_of_charge ?? ""}
                                        onChange={(e) => handleChangeLand(index, 'type_of_charge', Number(e.target.value))}
                                    >
                                        <option value="">Elegir</option>
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
                                        onChange={(e) => handleChangeLand(index, 'concept', e.target.value)}
                                    />
                                    </td>

                                    {/* BASE */}
                                    <td>
                                    <input
                                        className={styles.inputBase}
                                        value={row.billing_base ?? ""}
                                        onChange={(e) => handleChangeLand(index, 'billing_base', e.target.value)}
                                    />
                                    </td>

                                    {/* UNIT */}
                                    <td>
                                    <input
                                        className={styles.inputUnit}
                                        value={row.unit}
                                        onChange={(e) => handleChangeLand(index, 'unit', e.target.value)}
                                    />
                                    </td>

                                    {/* SUBTOTAL */}
                                    <td>
                                    <input
                                        className={styles.inputSubtotal}
                                        value={row.subtotal}
                                        onChange={(e) => handleChangeLand(index, 'subtotal', e.target.value)}
                                    />
                                    </td>

                                    {/* VAT */}
                                    <td>
                                        <select
                                            className={styles.selectIVA}
                                            value={row.vat}
                                            onChange={(e) => handleChangeLand(index, 'vat', e.target.value)}
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
                    {activeTab === 'ASESORIAL' && (
                    <div className={styles.tableWrapper}>
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
                                    Sin conceptos
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
                                        value={row.type_of_charge ?? ""}
                                        onChange={(e) => handleChangeConsultingServices(index, 'type_of_charge', Number(e.target.value))}
                                    >
                                        <option value="">Elegir</option>
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
                                        onChange={(e) => handleChangeConsultingServices(index, 'concept', e.target.value)}
                                    />
                                    </td>

                                    {/* BASE */}
                                    <td>
                                    <input
                                        className={styles.inputBase}
                                        value={row.billing_base ?? ""}
                                        onChange={(e) => handleChangeConsultingServices(index, 'billing_base', e.target.value)}
                                    />
                                    </td>

                                    {/* UNIT */}
                                    <td>
                                    <input
                                        className={styles.inputUnit}
                                        value={row.unit}
                                        onChange={(e) => handleChangeConsultingServices(index, 'unit', e.target.value)}
                                    />
                                    </td>

                                    {/* SUBTOTAL */}
                                    <td>
                                    <input
                                        className={styles.inputSubtotal}
                                        value={row.subtotal}
                                        onChange={(e) => handleChangeConsultingServices(index, 'subtotal', e.target.value)}
                                    />
                                    </td>

                                    {/* VAT */}
                                    <td>
                                        <select
                                            className={styles.selectIVA}
                                            value={row.vat}
                                            onChange={(e) => handleChangeConsultingServices(index, 'vat', e.target.value)}
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
                        <span>{getChargeName(row.type_of_charge)}</span>
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
                <section className={styles.cardcomments}>

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
                        {lastSaved && `Guardado ${lastSaved}`}
                        </div>
                    </div>

                    {/* Editor */}
                    <div
                        ref={editorRef}
                        contentEditable
                        className={styles.editor}
                        suppressContentEditableWarning
                        onClick={() => editorRef.current?.focus()}  
                        onInput={() => {
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
                        <div className={styles.termsSearch}>
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
                                        {filteredTags.map((item: any) => (
                                            <div
                                                key={item._id}
                                                className={styles.tagItem}
                                                onMouseDown={() => {
                                                    setTermsValue(prev => prev + (item.conditions?.es || '') + '\n\n');
                                                    setSearchTerm('');
                                                }}
                                            >
                                                <div className={styles.tagTitle}>
                                                    {item.title}
                                                </div>

                                                {/* PREVIEW */}
                                                <div className={styles.tagPreview}>
                                                    {(item.conditions?.es || '')
                                                        .substring(0, 150) + '...'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    )}
                            </div>

                            {/* <button className={styles.addBtnTerm}>
                                <PlusCircle size={18} />
                            </button> */}
                        </div>

                        {/* Textarea */}
                        <textarea
                        className={styles.termsTextarea}
                        rows={10}
                        placeholder="Escribe o pega los términos y condiciones..."
                        value={termsValue}
                        onChange={(e) => setTermsValue(e.target.value)}
                        />
                </section>
            </div>
        </div>
    </div>
        );

}