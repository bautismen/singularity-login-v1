import { useState, useRef } from 'react';
import styles from "./QuotedRate.module.css";
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Save, Eye, FileText,User, Tag ,
        Ship, Truck, Shield, Package, PlusCircle ,
        Pencil, Trash2 ,Plane ,Search, Copy,
          Bold, Italic, Underline, List, ListOrdered, Image, Table, Link
        } from "lucide-react";

export default function QuotedRate({ onClose }: any) {

const { t } = useLanguage();
const [activeTab, setActiveTab] = useState<'MARITIMO' | 'AEREO' | 'TERRESTRE'>('MARITIMO');
const CARGO_OPTIONS = [
    { label: "Cargos Flete", value: "FREIGHT" },
    { label: "Cargos en Origen", value: "ORIGIN" },
    { label: "Cargos en Destino", value: "DESTINATION" },
    { label: "Cargos Maniobras", value: "HANDLING" },
    { label: "Cargos en Aduana", value: "CUSTOMS" },
    { label: "Documentación", value: "DOCS" },
    { label: "Seguro", value: "INSURANCE" },
    { label: "Impuestos y Aranceles", value: "DUTIES_TAXES" },
    { label: "Otros / Recargos", value: "OTHER_SURCHARGES" }
];
const [concepts, setConcepts] = useState({
  MARITIMO: [
    {
      id: "1",
      cargo: "FREIGHT",
      concept: "OCEAN FREIGHT CHARGE",
      baseCharge: "20' DRY",
      containerType: "20' DRY",
      unit: 1,
      exchangeRate: 17,
      currency: "USD",
      iva: 16,
      subtotal: 1000,
      total: 1160
    }
  ],
  AEREO: [
    {
      id: "2",
      concept: "Air Freight",
      airline: "DHL",
      route: "MEX - LAX",
      transitDays: "1-2",
      exchangeRate: 17,
      ratePerKg: 5,
      fcs: 10,
      ssc: 5,
      mcc: 2,
      cw: 100,
      subtotal: 1700,
      iva: 16,
      total: 1972
    }
  ],
  AEREO_OPERATIVO: [
  {
    id: "op1",
    cargo: "FREIGHT",
    concept: "Air Export Handling",
    baseCharge: "100",
    exchangeRate: 17,
    currency: "USD",
    iva: 16,
    subtotal: 100,
    total: 116
  }
],
  TERRESTRE: [
    {
      id: "3",
      cargo: "FREIGHT",
      concept: "Truck Freight",
      baseCharge: "Base",
      unit: 1,
      exchangeRate: 17,
      currency: "MXN",
      iva: 16,
      subtotal: 800,
      total: 928
    }
  ]
});

const getBreakdownByCargo = () => {
    const allConcepts = [
        ...concepts.MARITIMO,
        ...concepts.AEREO,
        ...concepts.AEREO_OPERATIVO,
        ...concepts.TERRESTRE
    ];

    const grouped: any = {};

    allConcepts.forEach((item: any) => {
        const cargo = item.cargo || "OTHER_SURCHARGES";

        if (!grouped[cargo]) {
            grouped[cargo] = {
                subtotal: 0,
                total: 0
            };
        }

        grouped[cargo].subtotal += Number(item.subtotal || 0);
        grouped[cargo].total += Number(item.total || 0);
    });

    return grouped;
};

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
wrapper.contentEditable = "false"; // 🔥 CLAVE

wrapper.style.display = "inline-block";
wrapper.style.resize = "both";
wrapper.style.overflow = "hidden";
wrapper.style.border = "1px solid #ddd";
wrapper.style.borderRadius = "6px";
wrapper.style.padding = "4px";
wrapper.style.margin = "8px 0";
wrapper.style.width = "200px"; // tamaño inicial

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

const breakdown = getBreakdownByCargo();

const activeConcepts = concepts[activeTab] || [];

const subtotal = activeConcepts.reduce((acc: number, item: any) => {
    return acc + Number(item.subtotal || 0);
}, 0);

const total = activeConcepts.reduce((acc: number, item: any) => {
    return acc + Number(item.total || 0);
}, 0);

const iva = total - subtotal;

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

                    <button className={styles.headerButton}>
                        <Save size={18} />
                        <span>{t('tvf.Draft')}</span>
                    </button>

                    <button className={styles.headerButton}>
                        <Eye size={18} />
                        <span>{t('tvf.Preview')}</span>
                    </button>

                    <button className={styles.headerButton}>
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
                    <span className={styles.titleBig}>C2603-0657</span>
                </h1>

                <span className={styles.statusBadge}>
                    {t('quote.quoted')}
                </span>
            </div>

            {/* DERECHA */}
            <div className={styles.rightTitle}>

                {/* fila superior */}
                <div className={styles.rightTopRow}>
                    <span className={styles.badgeStatus}>{t('tvf.Draft')}</span>
                    <div className={styles.langBlock}>
                    <span className={styles.badgeLang}>
                        {t('tvf.LanguageFormat')}
                    </span>
                    </div>
                </div>

                {/* select abajo de idioma */}
                <div className={styles.langSelect}>
                    <select defaultValue="es">
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    </select>
                </div>

            </div>

            </div>
            {/* cuerpo general, servicios, conceptos y condiciones*/}
            <div className={styles.bodyGeneral}>
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
                            SISTEMAS AUTOMOTRICES DE MEXICO S.A. DE C.V.
                        </h3>
                        </div>
                        {/* grid info */}
                        <div className={styles.infoGrid}>

                        <div className={styles.infoItem}>
                            <label>
                            <User size={14} />{t('tvf.ExecutiveInCharge')}
                            </label>
                            <span className={styles.executename}>Arisbeth Ruiz Perez</span>
                        </div>

                        <div className={styles.infoItem}>
                            <label>
                            <Tag size={14} />{t('tvf.QuoteRequestRef')}
                            </label>
                            <span className={styles.mono}>QR260319-00008</span>
                        </div>

                        </div>
                    </div>
                    {/* RIGHT */}
                    <div className={styles.rightSection}>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryHeader}>
                                <div className={styles.quoteBlock}>
                                    <span className={styles.labelMini}>{t('tvf.Quota')}</span>
                                    <span className={styles.quoteId}>QT26030001</span>
                                </div>

                                <div className={styles.exchangeBlock}>
                                    <span className={styles.labelMini}>{t('tvf.currency')}</span>

                                    <div className={styles.exchangeRow}>
                                        <div className={styles.exchangeSelectWrapper}>
                                            <select className={styles.exchangeSelect}>
                                                <option value="MXN">MXN</option>
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.exchangeTCBlock}>
                                        <span className={styles.labelMini}>{t('tvf.ExchangeRate')}</span>
                                            <input
                                            type="number"
                                            step="0.01"
                                            defaultValue="1.00"
                                            className={styles.exchangeInput}
                                            />                        </div>
                                <div className={styles.version}>
                                    {t('tvf.Version')}: 1
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
                                placeholder="Inicio"
                            />

                            <span className={styles.separator}>→</span>

                            <input
                                type="date"
                                className={styles.dateField}
                                placeholder="Fin"
                            />
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </section>
                <section className={styles.cardServices}>

                  {/* BADGE reutilizado */}
                    <div className={styles.badges}>
                        <span className={styles.badgePrimary}> {t('tvf.Services')}</span>
                    </div>

                <div className={styles.servicesList}>

                    {/* ===== Servicio 1 ===== */}
                    <div className={styles.serviceCard}>

                    <div className={styles.serviceHeader}>
                        <div className={styles.serviceLeft}>

                        <div className={styles.serviceIcon}>
                            <Ship size={18} />
                        </div>

                        <div>
                            <h3 className={styles.serviceName}>Marítimo FCL</h3>

                            <div className={styles.serviceTags}>
                            <span className={styles.tagPrimary}> {t('tvf.Export')}</span>
                            <span className={styles.tagSecondary}>{t('tvf.DoorToPort')}</span>
                            </div>
                        </div>

                        </div>

                        <div className={styles.serviceRight}>
                        <span className={styles.labelMini}>Incoterm</span>
                        <span className={styles.incoterm}>EXW</span>
                        </div>
                    </div>

                    <div className={styles.serviceBody}>

                        {/* Ruta */}
                        <div>
                        <p className={styles.labelMini}>{t('tvf.LogisticRoute')}</p>

                        <div className={styles.route}>
                        {/* ORIGEN */}
                        <div className={styles.routePoint}>
                            <div className={styles.routeDot}></div>
                            <div>
                            <span className={styles.location}>Hamburg, DE</span>
                            <span className={styles.subLabelLocation}>Puerto Origen</span>
                            </div>
                        </div>

                        {/* LINEA */}
                        <div className={styles.routeLine}>
                            <div className={styles.routeProgress}></div>
                        </div>

                        {/* DESTINO */}
                        <div className={styles.routePoint}>
                            <div className={`${styles.routeDot} ${styles.routeDotEnd}`}></div>
                            <div>
                            <span className={styles.location}>Veracruz, MX</span>
                            <span className={styles.subLabelLocation}>Puerto Destino</span>
                            </div>
                        </div>
                        </div>

                        {/* Servicios asociados */}
                        <div className={styles.associated}>
                            <p className={styles.labelMini}>{t('tvf.AssociatedServices')}</p>

                            <div className={styles.badgeList}>
                            <span className={styles.badge}>
                                <Shield size={14} /> Seguro
                            </span>

                            <span className={styles.badge}>
                                <Package size={14} /> Maniobra
                            </span>
                            </div>
                        </div>
                        </div>

                        {/* Carga */}
                        <div className={styles.cargoBox}>
                            <p className={styles.labelMini}>{t('tvf.CargoSummary')}</p>

                            <div className={styles.cargoRow}>
                            {/* mercancía */}
                            <div className={styles.cargoItemMain}>
                                <span className={styles.cargoLabel}>{t('tvf.Goods')}</span>
                                <span className={styles.cargoValue}>
                                Automotive Pistons,Automotive Pistons,Automotive Pistons,Automotive Pistons,Automotive Pistons

                                </span>
                            </div>

                            {/* divisor */}
                            <div className={styles.cargoDivider}></div>

                            {/* grupo derecho */}
                            <div className={styles.cargoRight}>
                                
                                <div className={styles.cargoItem}>
                                <span className={styles.cargoNumber}>12,500</span>
                                <span className={styles.cargoUnit}>KG</span>
                                </div>

                                <div className={styles.cargoItem}>
                                <span className={styles.cargoNumber}>34.00</span>
                                <span className={styles.cargoUnit}>CBM</span>
                                </div>

                            </div>

                            </div>
                        </div>

                    </div>
                    </div>

                    {/* ===== Servicio 2 ===== */}
                    <div className={styles.serviceCard}>

                    <div className={styles.serviceHeader}>
                        <div className={styles.serviceLeft}>

                        <div className={styles.serviceIcon}>
                            <Truck size={18} />
                        </div>

                        <div>
                            <h3 className={styles.serviceName}>Terrestre Nacional</h3>

                            <div className={styles.serviceTags}>
                            <span className={styles.tagPrimary}>{t('tvf.Export')}</span>
                            <span className={styles.tagSecondary}>{t('tvf.DoorToPort')}</span>
                            </div>
                        </div>

                        </div>

                        <div className={styles.serviceRight}>
                        <span className={styles.labelMini}>Incoterm</span>
                        <span className={styles.incoterm}>CPT</span>
                        </div>
                    </div>

                    <div className={styles.serviceBody}>

                        <div>
                        <p className={styles.labelMini}>{t('tvf.LogisticRoute')}</p>


                                                <div className={styles.route}>
                        {/* ORIGEN */}
                        <div className={styles.routePoint}>
                            <div className={styles.routeDot}></div>
                            <div>
                            <span className={styles.location}>Veracruz, MX</span>
                            <span className={styles.subLabelLocation}>puerta origen</span>
                            </div>
                        </div>

                        {/* LINEA */}
                        <div className={styles.routeLine}>
                            <div className={styles.routeProgress}></div>
                        </div>

                        {/* DESTINO */}
                        <div className={styles.routePoint}>
                            <div className={`${styles.routeDot} ${styles.routeDotEnd}`}></div>
                            <div>
                            <span className={styles.location}>CDMX, MX</span>
                            <span className={styles.subLabelLocation}>puerta destino</span>
                            </div>
                        </div>
                        </div>

                         {/* Servicios asociados */}
                        <div className={styles.associated}>
                            <p className={styles.labelMini}>{t('tvf.AssociatedServices')}</p>

                            <div className={styles.badgeList}>
                            <span className={styles.badge}>
                                <Truck size={14} /> Paqueteria
                            </span>
                            </div>
                        </div>
                        </div>

                        {/* Carga */}
                        <div className={styles.cargoBox}>
                        <p className={styles.labelMini}>{t('tvf.CargoSummary')}</p>

                            <div className={styles.cargoRow}>
                            {/* mercancía */}
                            <div className={styles.cargoItemMain}>
                                <span className={styles.cargoLabel}>{t('tvf.CargoSummary')}</span>
                                <span className={styles.cargoValue}>
                                Spare Parts
                                </span>
                            </div>

                            {/* divisor */}
                            <div className={styles.cargoDivider}></div>

                            {/* grupo derecho */}
                            <div className={styles.cargoRight}>
                                
                                <div className={styles.cargoItem}>
                                <span className={styles.cargoNumber}>500</span>
                                <span className={styles.cargoUnit}>KG</span>
                                </div>

                                <div className={styles.cargoItem}>
                                <span className={styles.cargoNumber}>1201.20</span>
                                <span className={styles.cargoUnit}>CBM</span>
                                </div>

                            </div>

                        </div>

                        </div>

                    </div>
                    </div>

                </div>
                </section>

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
                                <th>{t('tvf.VAT')}</th>
                                <th>{t('tvf.Subtotal')}</th>
                                <th>{t('tvf.Total')}</th>
                                <th>{t('tvf.Actions')}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {concepts.MARITIMO.map((item: any) => (
                            <tr key={item.id}>
                                <td>
                                    <select
                                        value={item.cargo}
                                        onChange={(e) => {
                                        const updated = { ...item, cargo: e.target.value };

                                        setConcepts((prev: any) => ({
                                            ...prev,
                                            MARITIMO: prev.MARITIMO.map((c: any) =>
                                            c.id === item.id ? updated : c
                                            )
                                        }));
                                        }}
                                        className={styles.selectCargo}
                                    >
                                        <option value="">Seleccionar</option>

                                        {CARGO_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                        ))}
                                    </select>
                                    </td>
                                <td>
                                    <input
                                        type="text"
                                        className={styles.inputConcept}
                                        defaultValue=""
                                        onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className={styles.inputBase}
                                        defaultValue=""
                                        onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>
                                <td>
                                <select className={styles.selectContainer} defaultValue="">
                                    <option value="" disabled>Seleccionar</option>
                                    <option value="20GP">20GP</option>
                                    <option value="40GP">40GP</option>
                                    <option value="40HC">40HC</option>
                                    <option value="45HC">45HC</option>
                                </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className={styles.inputUnit}
                                        defaultValue=""
                                        onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>
                                <td>
                                <select className={styles.selectIVA} defaultValue="">
                                    <option value="" disabled>Seleccionar</option>
                                    <option value="20GP">N/A</option>
                                    <option value="40GP">0%</option>
                                    <option value="40HC">4%</option>
                                    <option value="45HC">8%</option>
                                    <option value="45HC">16%</option>
                                </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className={styles.inputSubtotal}
                                        defaultValue=""
                                        onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>
                                <td>${item.total}</td>

                                <td>
                                <button className={styles.duplicateBtn}>
                                <Copy size={16} />
                                </button>
                                <button className={styles.editBtn}>
                                <Pencil size={16} />
                                </button>
                                <button className={styles.deleteBtn}>
                                <Trash2 size={16} />
                                </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>

                        <button className={styles.addBtn}>
                        <PlusCircle size={16} />
                        {t('tvf.AddNewConcept')}
                        </button>
                    </div>
                    )}
                    {activeTab === 'AEREO' && (<>  
                    <div className={styles.tableWrapperAir}>

                    <h3>{t('tvf.AirConcepts')}</h3>

                    <div className={styles.scrollX}>

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
                                <tr>

                                {/* Concept */}
                                <td>
                                <input
                                    type="text"
                                    className={styles.inputConcept}
                                    defaultValue=""
                                    onChange={(e) => e.target.title = e.target.value}
                                />
                                </td>

                                {/* Airline */}
                                <td>
                                    <input
                                    type="text"
                                    className={styles.inputConcept}
                                    defaultValue=""
                                    onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>

                                {/* Route */}
                                <td>
                                    <input
                                    type="text"
                                    className={styles.inputConcept}
                                    defaultValue=""
                                    onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>

                                {/* Transit */}
                                <td>
                                    <input
                                    type="text"
                                    className={styles.inputConcept}
                                    defaultValue=""
                                    onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>

                                {/* Rate KG */}
                                <td>
                                    <input
                                    type="text"
                                    className={styles.inputConcept}
                                    defaultValue=""
                                    onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>

                                {/* FCS */}
                                <td>
                                    <input
                                    type="text"
                                    className={styles.inputConcept}
                                    defaultValue=""
                                    onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>

                                {/* SSC */}
                                <td>
                                    <input
                                    type="text"
                                    className={styles.inputConcept}
                                    defaultValue=""
                                    onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>

                                {/* MCC */}
                                <td>
                                    <input
                                    type="text"
                                    className={styles.inputConcept}
                                    defaultValue=""
                                    onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>

                                {/* CW */}
                                <td>
                                    <input
                                    type="text"
                                    className={styles.inputConcept}
                                    defaultValue=""
                                    onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>

                                {/* Subtotal */}
                                <td>
                                    <input
                                    type="text"
                                    className={styles.inputConcept}
                                    defaultValue=""
                                    onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>

                                {/* VAT */}
                                <td>
                                    <select className={styles.selectIVA} defaultValue="">
                                    <option value="">Seleccionar</option>
                                    <option value="0">N/A</option>
                                    <option value="4">4%</option>
                                    <option value="8">8%</option>
                                    <option value="16">16%</option>
                                    </select>
                                </td>

                                {/* Total */}
                                <td>
                                    <input
                                    type="text"
                                    className={styles.inputConcept}
                                    defaultValue=""
                                    onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>

                                {/* Actions */}
                                <td>
                                <button className={styles.duplicateBtn}>
                                <Copy size={16} />
                                </button>
                                <button className={styles.editBtn}>
                                <Pencil size={16} />
                                </button>
                                <button className={styles.deleteBtn}>
                                <Trash2 size={16} />
                                </button>
                                </td>

                                </tr>
                            </tbody>
                            </table>

                    </div>

                    <button className={styles.addBtn}>
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
                            <th>{t('tvf.VAT')}</th>
                            <th>{t('tvf.Subtotal')}</th>
                            <th>{t('tvf.Total')}</th>
                            <th>{t('tvf.Actions')}</th>
                        </tr>
                        </thead>

                        <tbody>
                        {concepts.AEREO_OPERATIVO.map((item: any) => (
                            <tr key={item.id}>
                            <td>
                                <select
                                value={item.cargo}
                                onChange={(e) => {
                                    const updated = { ...item, cargo: e.target.value };

                                    setConcepts((prev: any) => ({
                                    ...prev,
                                    AEREO_OPERATIVO: prev.AEREO_OPERATIVO.map((c: any) =>
                                        c.id === item.id ? updated : c
                                    )
                                    }));
                                }}
                                className={styles.selectCargo}
                                >
                                <option value="">Seleccionar</option>
                                {CARGO_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                    </option>
                                ))}
                                </select>
                            </td>
                            <td>
                                    <input
                                        type="text"
                                        className={styles.inputConcept}
                                        defaultValue=""
                                        onChange={(e) => e.target.title = e.target.value}
                                    />
                            </td>           
                            <td>
                                    <input
                                        type="text"
                                        className={styles.inputBase}
                                        defaultValue=""
                                        onChange={(e) => e.target.title = e.target.value}
                                    />
                            </td>
                            <td>
                                <select className={styles.selectIVA} defaultValue="">
                                    <option value="" disabled>Seleccionar</option>
                                    <option value="20GP">N/A</option>
                                    <option value="40GP">0%</option>
                                    <option value="40HC">4%</option>
                                    <option value="45HC">8%</option>
                                    <option value="45HC">16%</option>
                                </select>
                            </td>

                            <td>
                                    <input
                                        type="text"
                                        className={styles.inputSubtotal}
                                        defaultValue=""
                                        onChange={(e) => e.target.title = e.target.value}
                                    />
                            </td>
                            <td>${item.total}</td>

                            <td>
                                <button className={styles.duplicateBtn}><Copy size={16} /></button>
                                <button className={styles.editBtn}><Pencil size={16} /></button>
                                <button className={styles.deleteBtn}><Trash2 size={16} /></button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <button className={styles.addBtn}>
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
                                <th>{t('tvf.VAT')}</th>
                                <th>{t('tvf.Subtotal')}</th>
                                <th>{t('tvf.Total')}</th>
                                <th>{t('tvf.Actions')}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {concepts.TERRESTRE.map((item: any) => (
                            <tr key={item.id}>
                                <td>
                                    <select
                                        value={item.cargo}
                                        onChange={(e) => {
                                        const updated = { ...item, cargo: e.target.value };

                                        setConcepts((prev: any) => ({
                                            ...prev,
                                            TERRESTRE: prev.TERRESTRE.map((c: any) =>
                                            c.id === item.id ? updated : c
                                            )
                                        }));
                                        }}
                                        className={styles.selectCargo}
                                    >
                                        <option value="">Seleccionar</option>

                                        {CARGO_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                        <input
                                            type="text"
                                            className={styles.inputConcept}
                                            defaultValue=""
                                            onChange={(e) => e.target.title = e.target.value}
                                        />
                                </td>           
                                <td>
                                        <input
                                            type="text"
                                            className={styles.inputBase}
                                            defaultValue=""
                                            onChange={(e) => e.target.title = e.target.value}
                                        />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className={styles.inputUnit}
                                        defaultValue=""
                                        onChange={(e) => e.target.title = e.target.value}
                                    />
                                </td>
                                <td>
                                    <select className={styles.selectIVA} defaultValue="">
                                        <option value="" disabled>Seleccionar</option>
                                        <option value="20GP">N/A</option>
                                        <option value="40GP">0%</option>
                                        <option value="40HC">4%</option>
                                        <option value="45HC">8%</option>
                                        <option value="45HC">16%</option>
                                    </select>
                                </td>
                                <td>
                                        <input
                                            type="text"
                                            className={styles.inputSubtotal}
                                            defaultValue=""
                                            onChange={(e) => e.target.title = e.target.value}
                                        />
                                </td>
                                <td>${item.total}</td>
                                <td>
                                <button className={styles.duplicateBtn}>
                                <Copy size={16} />
                                </button>
                                <button className={styles.editBtn}>
                                <Pencil size={16} />
                                </button>
                                <button className={styles.deleteBtn}>
                                <Trash2 size={16} />
                                </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>

                        <button className={styles.addBtn}>
                        <PlusCircle size={16} />
                        {t('tvf.AddNewConcept')}
                        </button>
                    </div>
                    )}
                </section>

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

                        {Object.entries(breakdown).map(([cargoKey, values]: any) => {
                            const cargoLabel =
                                CARGO_OPTIONS.find(c => c.value === cargoKey)?.label || cargoKey;

                            const subtotal = values.subtotal;
                            const total = values.total;
                            const iva = total - subtotal;

                            return (
                                <div key={cargoKey} className={styles.breakdownRow}>
                                    <span className={styles.breakdownCargo}>
                                        {cargoLabel}
                                    </span>

                                    <span className={styles.breakdownTotal}>${subtotal.toFixed(2)}</span>
                                    <span className={styles.breakdownTotal}>${iva.toFixed(2)}</span>
                                    <span className={styles.breakdownTotal}>
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>
                <section className={styles.totalsSection}>
                    <div className={styles.totalsContainer}>
                        <div className={styles.totalsBox}>

                        {/* Subtotal */}
                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>
                            {t('tvf.SubtotalAmount')}
                            </span>
                            <span className={styles.totalValue}>
                            {subtotal.toFixed(2)} USD
                            </span>
                        </div>

                        {/* IVA */}
                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>
                            {t('tvf.EstimatedTaxVAT')}
                            </span>
                            <span className={styles.totalValue}>
                            {iva.toFixed(2)} USD
                            </span>
                        </div>

                        {/* TOTAL */}
                        <div className={styles.totalRowFinal}>
                            <span className={styles.totalLabelFinal}>
                            {t('tvf.TotalAmount')}
                            </span>

                            <span className={styles.totalValueFinal}>
                            {total.toFixed(2)} USD
                            </span>
                        </div>

                        </div>
                    </div>
                </section>
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
                            />
                        </div>

                        <button className={styles.addBtnTerm}>
                            <PlusCircle size={18} />
                        </button>
                    </div>

                    {/* Textarea */}
                    <textarea
                        className={styles.termsTextarea}
                        rows={10}
                        placeholder="Escribe o pega los términos y condiciones..."
                        defaultValue={`• Nuestra responsabilidad por pérdidas o daños se limita a lo dispuesto en los artículos 66 y 67 de la Ley de Caminos, Puentes y Autotransporte Federal.
• En caso de cancelación dentro de las 24 horas previas al servicio confirmado, se aplicará cargo por falso flete.
• Tarifa y vigencia sujetas a cambios por variaciones en el precio del combustible y/o casetas.
• La mercancía viaja por cuenta y riesgo del cliente.
• No se realizan entregas en zonas de difícil acceso o no autorizadas.
• La tarifa considera peso legal por unidad conforme a lineamientos de la SCT.
• Cargos adicionales aplicarán por demoras, pernoctas o situaciones ajenas al transportista.`}
                    />
                </section>
            </div>
        </div>
    </div>
        );

}