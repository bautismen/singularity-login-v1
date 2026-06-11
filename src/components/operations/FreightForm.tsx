import React, { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "../../pages/Operations.module.css";
import { InputCountry } from "../InputCountry";
import { InputPort } from "../InputPort";
import { PricingControl } from "../../types/pricingControl";
import { OperationsFormData } from "../../hooks/useOperations";
import { formatDateTimeLocal } from "../../types/operations";
import {
  TipoEnvio,
  // TipoReferencia,
  TipoOperacion,
  Incoterm,
  Transportista,
  TipoUnidad,
  TipoRuta,
  TipoMovimeiento,
  TipoGuia,
  Cargo,
  Containers,
  ComponentDate
} from "../operations/component";
import {
  Copy,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Package,
  Container,
  MapPin,
  Ship
} from "lucide-react";
import { Port } from "../../types/port";
import { catalogService } from '../../services/catalogsService';


export interface FreightFormProps {
  mode:             'create' | 'edit' | 'view';
  // Catálogos
  incoterms: any[];
  suppliers: any[];
  countries: any[];
  //info
  info: object;
  controlsData: PricingControl[];
  formData: OperationsFormData;
  onUpdateFormData: (
    changes:
      | Partial<OperationsFormData>
      | ((prev: OperationsFormData) => Partial<OperationsFormData>),
  ) => void;
  onUpdateServiceFormData: (
    idServiceItem: number,
    detailId: number,
    field: string,
    value: any,
  ) => void;
  onUpdateServiceDetail: (
    idServiceItem: number,
    detailId: number,
    collection: string,
    field: string,
    value: any,
  ) => void;
  onDuplicateDetail: (
    idServiceItem: number,
    detailId: number,
    newDetail: object,
  ) => void;
  onRemoveDetail: (
    idServiceItem: number,
    detailId: number
  ) =>void;
}

export const FreightForm: React.FC<FreightFormProps> = ({
  mode, 
  incoterms,
  suppliers,
  countries,
  info,
  formData,
  onUpdateFormData,
  onUpdateServiceFormData,
  onUpdateServiceDetail,
  onDuplicateDetail,
  onRemoveDetail
}) => {
  const { t } = useLanguage();
  const infoControl = formData.Services?.find(
    (s) =>  (s.idControl ? (s.idControl === info.id && s.idServiceItem === info.item) : 
            (s.idService === info.idService && s.idServiceItem === info.item )));  
  console.log('FreightForm formData: ',formData, 'infoControl: ', infoControl)
  const [currentIndex, setCurrentIndex] = useState(0);
  const detail = infoControl?.serviceDetail?.[currentIndex] || 
  {
  idDetail: 1,
  idTypeShipment: 1,
  typeShipment: "",
  idTypeOperation: 1,
  typeOperation: "",
  typeShippingReference: "",
  shippingReferenceNumber: "",
  shippingDate: new Date,
  masterGuide: "",
  //consignee?: ;
  idIncoterm: 1,
  incoterm: "",
  //transport?: {},
  origin: {},
  destination: {},
  //goods?: 
  }; 
  formData.Services?.map((s)=> s.serviceDetail.length === 0 ? s.serviceDetail=[detail] : s)
  const [accordionOpen, setAccordionOpen] = React.useState({
    [`envio-${detail?.idDetail}`]: mode=== 'edit' ? true : true,
    [`transporte-${detail?.idDetail}`]: mode=== 'edit' ? true : false,
    [`origin-${detail?.idDetail}`]: mode=== 'edit' ? true : false,
    [`destination-${detail?.idDetail}`]: mode=== 'edit' ? true : false,
  });
  const [portsOrigin, setPortsOrigin] = useState<Port[]>([]);
  const [portsDestination, setPortsDestination] = useState<Port[]>([]);

  //carga de puertos de origen
  useEffect(()=> {
    const fetchData = async () => {
      try {     
        if(detail?.origin?.country?.idCountry === undefined || detail?.origin?.country?.idCountry === ""){
          onUpdateServiceFormData(
            infoControl.idServiceItem,
            detail.idDetail,
            "origin",
            {
              ...(detail?.origin ?? {}),
              port: {
                idPort: "",
                port: "",
                portKey: "",
              },
            }
          );
          setPortsOrigin([])
          return;  
        }           
        const result = await catalogService.getPortsByIdCountry(detail?.origin?.country?.idCountry);
        const portsResult = result ?? [];
        setPortsOrigin(portsResult);
        const portKeyCode = detail?.origin?.port?.portKey;
        if (!portKeyCode) return;
        const portSelected = portsResult.find(
          (port) =>
            port.port_code?.toLowerCase() === portKeyCode.toLowerCase()
        );
        if (!portSelected) {
          onUpdateServiceFormData(
            infoControl.idServiceItem,
            detail.idDetail,
            "origin",
            {
              ...(detail?.origin ?? {}),
              port: {
                idPort: "",
                port: "",
                portKey: "",
              },
            }
          );
          setPortsOrigin([])
          return;
        }    
        onUpdateServiceFormData(
          infoControl.idServiceItem,
          detail.idDetail,
          "origin",
          {
            ...(detail.origin ?? {}),
            port: {
              idPort: portSelected._Id,
              port: portSelected.name_port,
              portKey: portSelected.port_code ?? "",
            },
          }
        );          
      } catch {
          setPortsOrigin([]);
      } 
    };
    fetchData();
  },[detail?.origin?.country?.idCountry])

  //carga de puertos destino
   useEffect(()=> {
    const fetchData = async () => {
      try {  
        if(detail?.destination?.country?.idCountry === undefined || detail?.destination?.country?.idCountry === "") {
          onUpdateServiceFormData(
            infoControl.idServiceItem,
            detail.idDetail,
            "destination",
            {
              ...(detail?.destination ?? {}),
              port: {
                idPort: "",
                port: "",
                portKey: "",
              },
            }
          );   
          setPortsDestination([]);
        return;
        }              
        const result = await catalogService.getPortsByIdCountry(detail?.destination?.country?.idCountry);
        const portsResult = result ?? [];
        setPortsDestination(portsResult);
        const portKeyCode = detail?.destination?.port?.portKey;
        if (!portKeyCode) return;
        const portSelected = portsResult.find(
          (port) =>
            port.port_code?.toLowerCase() === portKeyCode.toLowerCase()
        );
        if (!portSelected) {
          onUpdateServiceFormData(
            infoControl.idServiceItem,
            detail.idDetail,
            "destination",
            {
              ...(detail?.destination ?? {}),
              port: {
                idPort: "",
                port: "",
                portKey: "",
              },
            }
          );   
          setPortsDestination([]);
          return;
        }    
        onUpdateServiceFormData(
          infoControl.idServiceItem,
          detail.idDetail,
          "destination",
          {
            ...(detail.destination ?? {}),
            port: {
              idPort: portSelected._Id,
              port: portSelected.name_port,
              portKey: portSelected.port_code ?? "",
            },
          }
        );          
      } catch {
        setPortsDestination([]);
      } 
    };
    fetchData();
  },[detail?.destination?.country?.idCountry])

  const toggleAccordion = (key) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const nextPage = () => {
    if (currentIndex < infoControl.serviceDetail.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const duplicateCard = (idServiceItem, detail) => {
    const card = document.getElementById("mainFormCard");
    card.style.opacity = "0.5";
    card.style.transform = "scale(0.98)";

    const newDetail = structuredClone(detail);

    let newsequence = infoControl.serviceDetail.length + 1;
    // Nuevo detail
    newDetail.idDetail = newsequence;

    setCurrentIndex(infoControl.serviceDetail.length);

    onDuplicateDetail(idServiceItem, newsequence, newDetail);
  };

  return (
    <div className={styles.formRow}>
      <span key={infoControl?.idServiceItem} className={styles.serviceItem}>
        {detail && (
          <div
            key={detail.idDetail}
            id="mainFormCard"
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4 bg-white dark:bg-[#1e293b]"
          >
            {/* Header Card */}
            <div id="pageCounter">
              <div className={styles.serviceActions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() =>
                    duplicateCard(infoControl?.idServiceItem, detail)
                  }
                >
                  <Copy size={18} />
                </button>

                <span className="text-label-bold font-label-bold text-on-surface-variant dark:text-white">
                  {currentIndex + 1} de{" "}
                  {infoControl?.serviceDetail?.length || 1}
                </span>

                <div className="flex gap-1">
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={prevPage}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    disabled={
                      currentIndex === infoControl?.serviceDetail?.length - 1
                    }
                    onClick={nextPage}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <button
                  type="button"
                  className={`${styles.iconButtonRemove} ${styles.danger}`}
                  // disabled={isDisabled}
                  onClick={() => {
                    onRemoveDetail(infoControl?.idServiceItem, detail.idDetail )
                    prevPage();
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* <div className="flex items-center justify-between bg-surface-container-low p-2 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-surface-container-high rounded transition-colors" title="Add">
                    <span className="material-symbols-outlined text-primary" data-icon="add">add</span>
                  </button>
                </div>
                
              </div> */}
            </div>
            <span key={currentIndex + 1} className={styles.serviceItem}>
              <div className={styles.serviceCard}>
                <div
                  className="bg-primary-container bg-opacity-5 px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-opacity-10 transition-colors border-l-4 border-primary"
                  onClick={() => toggleAccordion(`envio-${detail.idDetail}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="dark:text-white">
                      <Package />
                    </span>
                    <h2 className="title">Envio</h2>
                  </div>
                  <span
                    className={`material-symbols-outlined
                                text-primary
                                chevron-icon
                                dark:text-white
                                ${accordionOpen[`envio-${detail.idDetail}`] ? "rotate-180" : ""}
                                `}
                    id="envios-chevron"
                  >
                    <ChevronDown />
                  </span>
                </div>

                <div
                  className={`${styles.accordionContent}
                              ${!accordionOpen[`envio-${detail.idDetail}`]
                                  ? styles.collapsed
                                  : ""
                              }`}
                >
                  <div className={styles.fourColumnGrid}>
                    <div className={styles.firstColumn}>
                      {/* Modalidad */}
                      <div className={styles.fieldGroup}>
                        <TipoEnvio
                          itemService={infoControl?.idServiceItem}
                          sequencedetail={detail.idDetail}
                          detail={detail}
                          onUpdateServiceFormData={onUpdateServiceFormData}
                        />
                      </div>
                    </div>

                    <div className={styles.secondColumn}>
                      {/* Tipo operación */}
                      <div className={styles.fieldGroup}>
                        <TipoOperacion
                          itemService={infoControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          detail={detail}
                          onUpdateServiceFormData={onUpdateServiceFormData}
                        />
                      </div>
                    </div>

                    <div className={styles.thirdColumn}>
                      {/* Incoterm */}
                      <div className={styles.fieldGroup}>
                        <Incoterm
                          itemService={infoControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          detail={detail}
                          onUpdateServiceFormData={onUpdateServiceFormData}
                          incoterms={incoterms}
                        />
                      </div>
                    </div>

                    <div className={styles.fourthColumn}>
                      {/* Guia master */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Guia master</label>
                        <input
                          type="text"
                          value={detail?.masterGuide}
                          onChange={(e) =>
                            onUpdateServiceFormData(
                              infoControl.idServiceItem,
                              detail.idDetail,
                              "masterGuide",
                              e.target.value.toUpperCase()
                            )
                          }
                          className={styles.textInput}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="bg-primary-container bg-opacity-5 px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-opacity-10 transition-colors border-l-4 border-primary"
                  onClick={() =>
                    toggleAccordion(`transporte-${detail.idDetail}`)
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="dark:text-white">
                      <Ship />
                    </span>
                    <h2 className="title">Transporte</h2>
                  </div>
                  <span
                    className={`material-symbols-outlined
                                text-primary
                                chevron-icon
                                dark:text-white
                                ${accordionOpen[`transporte-${detail.idDetail}`] ? "rotate-180" : ""}
                                `}
                    id="transporte-chevron"
                  >
                    <ChevronDown />
                  </span>
                </div>

                <div
                  className={`${styles.accordionContent}
                              ${!accordionOpen[`transporte-${detail.idDetail}`]
                                  ? styles.collapsed
                                  : ""
                              }`}
                >
                  <div className={styles.fourColumnGrid}>

                    <div className={styles.firstColumn}>
                      {/* Transportista */}
                      <div className={styles.fieldGroup}>
                        <Transportista
                          itemService={infoControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          transportista={suppliers.filter(
                            (s) =>
                              s.status === 1 &&
                              [7, 32].includes(parseInt(s.sectorId)),
                          )}
                        />
                      </div>

                      {/* Tipo de unidad */}
                      <div className={styles.fieldGroup}>
                        <TipoUnidad
                          itemService={infoControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          modalidad={"maritimo"}
                        />
                      </div>

                      {/* CAAT */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          CAAT
                        </label>
                        <input
                          type="text"
                          value={detail?.transport?.moreInformationTransport?.caat}
                          className={styles.textInput}
                          onChange={(e) =>
                            onUpdateServiceDetail(
                              infoControl.idServiceItem,
                              detail.idDetail,
                              'transport',
                              'moreInformationTransport', {
                              'caat': e.target.value
                            }
                            )
                          }
                        />
                      </div>

                    </div>

                    <div className={styles.secondColumn}>
                      {/* Número de reserva */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Número de reserva / Booking
                        </label>
                        <input
                          type="text"
                          value={detail?.transport?.bookingNumeber || ""}
                          className={styles.textInput}
                          onChange={(e) =>
                            onUpdateServiceDetail(
                              infoControl.idServiceItem, 
                              detail.idDetail, 
                              'transport', 
                              'bookingNumeber',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* Nombre de la unidad de transporte*/}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Nombre de la unidad
                        </label>
                        <input
                          type="text"
                          value={detail?.transport?.nameTransport}
                          onChange={(e) =>
                            onUpdateServiceDetail(
                              infoControl.idServiceItem, 
                              detail.idDetail, 
                              'transport', 
                              'nameTransport',
                              e.target.value
                            )
                          }
                          className={styles.textInput}
                        />
                      </div>

                      {/* Placas */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Placas
                        </label>
                        <input
                          type="text"
                          value={detail?.transport?.moreInformationTransport?.plates}
                          className={styles.textInput}
                          onChange={(e) =>
                            onUpdateServiceDetail(
                              infoControl.idServiceItem,
                              detail.idDetail,
                              'transport',
                              'moreInformationTransport', {
                              'plates': e.target.value
                            }
                            )
                          }
                        />
                      </div>

                    </div>

                    <div className={styles.thirdColumn}>
                      
                      {/* Fecha reserva */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Fecha de reserva
                        </label>
                        <ComponentDate
                          itemService={infoControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          data={detail?.transport?.shippingDate}
                          node={'transport'}
                          field={'shippingDate'}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                        />
                      </div>

                      {/* Tipo de ruta */}
                      <div className={styles.fieldGroup}>
                        <TipoRuta
                          itemService={infoControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                        />
                      </div>

                      {/* Fecha cita en planta */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Fecha de cita en planta
                        </label>
                        <input
                          type="datetime-local"
                          value={formatDateTimeLocal(detail?.transport?.moreInformationTransport?.appointment)}
                          className={styles.textInput}
                          onChange={(e) =>
                            onUpdateServiceDetail(
                              infoControl.idServiceItem,
                              detail.idDetail,
                              'transport',
                              'moreInformationTransport', {
                              'appointment': e.target.value
                            }
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.fourthColumn}>
                      {/* Tipo de movimiento */}
                      <div className={styles.fieldGroup}>
                        <TipoMovimeiento
                          itemService={infoControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                        />
                      </div>

                      {/* Guia | Tipo */}
                      <div className={styles.fieldGroup}>
                        <TipoGuia
                          itemService={infoControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          modalidad={"maritimo"}
                        />
                      </div>
                      
                      {/* Numero de rastreo/Tipo */}
                      {/* <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>
                                    Numero de rastreo/Tipo
                                    <input
                                        type="text"
                                        value={detail.masterBill}
                                        className={styles.textInput}
                                    />
                                    </label>
                                </div> */}
                    </div>
                  </div>
                </div>

                {/**ORIGEN */}         
                <div
                  className="bg-primary-container bg-opacity-5 px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-opacity-10 transition-colors border-l-4 border-primary"
                  onClick={() => toggleAccordion(`origin-${detail.idDetail}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="dark:text-white">
                      <MapPin />
                    </span>
                    <h2 className="title">Origen </h2>
                  </div>
                  <span
                    className={`material-symbols-outlined
                                text-primary
                                chevron-icon
                                dark:text-white
                                ${accordionOpen[`origin-${detail.idDetail}`] ? "rotate-180" : ""}
                              `}
                    id="origin-chevron"
                  >
                    <ChevronDown />
                  </span>
                </div>
                <div
                  className={`${styles.accordionContent}
                              ${!accordionOpen[`origin-${detail.idDetail}`]
                                  ? styles.collapsed
                                  : ""
                              }`}
                >
                  <div className={styles.fourColumnGrid}>

                    <div className={styles.firstColumn}>
                      {/* ORIGEN */}
                      {/* Pais de carga */}
                      <InputCountry
                        type="origin"
                        countries={countries}
                        selectedCountryId={detail.origin?.country?.idCountry}
                        serviceIdItem={detail.idDetail}
                        isDisabled={false}
                        placeholder={t("quote.select")}
                        label={t("operations.countryCharge")}
                        mapCountryToChanges={(country) => {  
                          return {
                            idCountry: country?._Id ?? "",
                            country: country?.name_country ?? "",
                            countryKey:country?.country_code ?? ""  }                        
                        }}
                        onChangeCountry={({ changes }) => {
                          onUpdateServiceDetail(
                            infoControl.idServiceItem,
                            detail.idDetail,
                            "origin",
                            "country",
                            changes
                          );
                        }}
                        groupClassName={styles.fieldGroup}
                        labelClassName={styles.fieldLabel}
                        inputClassName={styles.textInput}
                       >                         
                       </InputCountry>
                                
                      {/* Planta */}
                      {detail.idTypeShipment !== 2  && (                        
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            Planta
                          </label>
                          <input
                            type="text"
                            value={detail?.origin?.plant?.name}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                infoControl.idServiceItem, 
                                detail.idDetail, 
                                'origin',
                                  'plant', {
                                    'name': e.target.value
                                  }
                              )
                            }
                          />                          
                        </div>                        
                      )}

                    </div>  

                    <div className={styles.secondColumn}>
                      
                      {[1, 3].includes(detail.idTypeShipment) ?
                        /* Lugar de recoleccion */ 
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            Lugar de recolección *
                          </label>
                          <input
                            type="text"
                            value={detail?.origin?.placeOfReceipt}
                            className={styles.textInput}
                            required
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                infoControl.idServiceItem,
                                detail.idDetail,
                                "origin",
                                "placeOfReceipt",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        : 
                        /* Puerto de recoleccion */
                        <InputPort
                          ports={portsOrigin}
                          namePort={detail?.origin?.port?.port}
                          codePort={detail?.origin?.port?.portKey}
                          serviceIdItem={detail.idDetail}
                          type="origin"
                          label="Puerto de carga"
                          groupClassName={styles.fieldGroup}
                          labelClassName={styles.fieldLabel}
                          inputClassName={styles.textInput}
                          onChangePort={(port) => {
                            onUpdateServiceFormData(
                              infoControl.idServiceItem,
                              detail.idDetail,
                              "origin",
                              {
                                ...(detail.origin ?? {}),
                                port: {
                                  idPort: port?._Id,
                                  port: port?.name_port ?? "",
                                  portKey: port?.port_code ?? ""
                                }
                              },
                            );
                          }}
                        />
                        
                      }

                      {/* Llegada a planta  */}
                      {detail.idTypeShipment !== 2  && (                        
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            {t("operations.arrivalPlant")}
                          </label>
                          <input
                            type="datetime-local"
                            value={formatDateTimeLocal(detail?.origin?.plant?.arrivalDate)}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                infoControl.idServiceItem, 
                                detail.idDetail, 
                                'origin',
                                  'plant', {
                                    'arrivalDate': e.target.value
                                  }
                              )
                            }
                          />                          
                        </div>                        
                      )}

                    </div>      
                    
                    <div className={styles.thirdColumn}>
                      {/* ETD (Salida estimada) */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          ETD (Salida estimada)
                        </label>
                        <ComponentDate
                          itemService={infoControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          data={detail?.departureDateAproximate || ''}
                          node={'origin'}
                          field={'departureDateAproximate'}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                        />
                      </div>

                      {/* Salida de planta */}
                      {detail.idTypeShipment !== 2  && (                        
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            Salida de planta
                          </label>
                          <input
                            type="datetime-local"
                            value={formatDateTimeLocal(detail?.origin?.plant?.departureDate)}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                infoControl.idServiceItem, 
                                detail.idDetail, 
                                'origin',
                                  'plant', {
                                    'departureDate': e.target.value
                                  }
                              )
                            }
                          />                          
                        </div>                        
                      )}

                    </div> 

                    <div className={styles.fourthColumn}>
                      {/* Despacho / recoleccion */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Despacho / recoleccion
                        </label>
                        <ComponentDate
                          itemService={infoControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          data={detail?.origin?.dispatchOrCollectionDate}
                          node={'origin'}
                          field={'dispatchOrCollectionDate'}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                        />
                      </div>
                    </div>             
                  </div>                  
                </div>
                
                {/**DESTINO */}
                <div
                  className="bg-primary-container bg-opacity-5 px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-opacity-10 transition-colors border-l-4 border-primary"
                  onClick={() =>
                    toggleAccordion(`destination-${detail.idDetail}`)
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="dark:text-white">
                      <MapPin />
                    </span>
                    <h2 className="title">Destino</h2>
                  </div>
                  
                  <span className={`material-symbols-outlined
                                    text-primary
                                    chevron-icon
                                    dark:text-white
                                    ${accordionOpen.destination ? "rotate-180" : ""}`}
                        id="destination-chevron">
                    <ChevronDown />
                  </span>
                </div>

                <div
                  className={`${styles.accordionContent}
                              ${!accordionOpen[`destination-${detail.idDetail}`]
                                  ? styles.collapsed
                                  : ""
                              }`}
                >
                   <div className={styles.fourColumnGrid}>
                    <div className={styles.firstColumn}>
                      {/*DESTINO */}
                      {/* Pais de descarga */}
                      <InputCountry
                        groupClassName={styles.fieldGroup}
                        labelClassName={styles.fieldLabel}
                        inputClassName={styles.textInput}
                        type="destination"
                        countries={countries}
                        selectedCountryId={detail.destination?.country?.idCountry}
                        serviceIdItem={detail.idDetail}
                        isDisabled={false}
                        placeholder={t("quote.select")}
                        label="Pais de descarga"
                        mapCountryToChanges={(country) => {  
                            return {
                              idCountry: country?._Id ?? "",
                              country: country?.name_country ?? "",
                              countryKey:country?.country_code ?? "" }                        
                        }}
                        onChangeCountry={({ changes }) => {
                          onUpdateServiceDetail(
                            infoControl.idServiceItem,
                            detail.idDetail,
                            "destination",
                            "country",
                            changes,
                          );
                        }}
                      />

                      {/* Entrega en destino */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Entrega en destino
                        </label>
                        <ComponentDate
                          itemService={infoControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          data={detail?.destination?.deliveryDate}
                          node={'destination'}
                          field={'deliveryDate'}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                        />
                      </div>

                    </div>

                    <div className={styles.secondColumn}>
                      {/* Puerto o Aeropuerto de descarga */}
                      {[2, 3].includes(detail.idTypeShipment) ?                                                   
                        <InputPort
                          ports={portsDestination}
                          namePort={detail?.destination?.port?.port}
                          codePort={detail?.destination?.port?.portKey}
                          serviceIdItem={detail.idDetail}
                          type="destination"
                          label={t("operations.portDischarge")}
                          groupClassName={styles.fieldGroup}
                          labelClassName={styles.fieldLabel}
                          inputClassName={styles.textInput}
                          onChangePort={(port) => {
                            onUpdateServiceFormData(
                              infoControl.idServiceItem,
                              detail.idDetail,
                              "destination",
                              {
                                ...(detail.destination ?? {}),
                                port: {
                                  idPort: port?._Id,
                                  port: port?.name_port ?? "",
                                  portKey: port?.port_code ?? ""
                                }                                
                              },
                            );
                          }}
                        />
                      : (
                        /* Lugar de recoleccion */
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            Lugar de recoleccion
                          </label>
                          <input
                            type="text"
                            value={detail?.destination?.placeOfReceipt}
                            className={styles.textInput}
                            required
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                infoControl.idServiceItem,
                                detail.idDetail,
                                "destination",
                                "placeOfReceipt",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )}

                      {/* Planta */}
                      { [1,4].includes(detail.idTypeShipment)  && 
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            Planta
                          </label>
                          <input
                            type="text"
                            value={detail?.destination?.plant?.name}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                infoControl.idServiceItem, 
                                detail.idDetail, 
                                'destination',
                                  'plant', {
                                    'name': e.target.value
                                  }
                              )
                            }
                          />
                        </div>
                      }
                      
                    </div>

                    <div className={styles.thirdColumn}>
                      {/* ETA (Llegada estimada) */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          ETA (Llegada estimada)
                        </label>
                        <ComponentDate
                          itemService={infoControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          data={detail?.destination?.estimatedArrivalDateETA}
                          node={'destination'}
                          field={'estimatedArrivalDateETA'}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                        />
                      </div>
                     
                      {/* Llegada a planta  */}
                      {[1, 4].includes(detail.idTypeShipment) && (                        
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            {t("operations.arrivalPlant")}
                          </label>
                          <input
                            type="datetime-local"
                            value={detail?.destination?.plant?.arrivalDate}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                infoControl.idServiceItem, 
                                detail.idDetail, 
                                'destination',
                                  'plant', {
                                    'arrivalDate': e.target.value
                                  }
                              )
                            }
                          />                  
                        </div>                        
                      )}
                    </div>

                    <div className={styles.fourthColumn}>
                      {/* ATA (Atraque) */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          {" "}
                          ATA (Atraque)
                        </label>
                        <ComponentDate
                          itemService={infoControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          data={detail?.destination?.arrivalDateATA}
                          node={'destination'}
                          field={'arrivalDateATA'}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                        />
                      </div>
                     
                      {/* Llegada a planta y Salida de planta */}
                      {[1, 4].includes(detail.idTypeShipment) && (
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            Salida de destino
                          </label>
                          <input
                            type="datetime-local"
                            value={detail?.destination}
                            className={styles.textInput}
                            readOnly
                          />
                        </div>
                      )}

                      {/* Salida de planta */}
                      {[1, 4].includes(detail.idTypeShipment) &&
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            Salida de planta
                          </label>
                          <input
                            type="datetime-local"
                            value={detail?.origin}
                            className={styles.textInput}
                            readOnly
                          />
                        </div>
                      }

                    </div>

                  </div>
                </div>

                {/* Observaciones del servicio*/}
                  <div className="bg-surface-container-low px-6 -mt-10 -mb-3 py-5">
                    <label
                      htmlFor="observations"
                      className="block font-label-caps text-label-caps text-primary px-1 py-2 dark:text-white"
                    >
                      {t("operations.observations")}
                    </label>

                  <textarea
                    value={detail?.comments || ""}
                    className={styles.textArea}
                    onChange={(e) =>
                      onUpdateServiceFormData(
                        infoControl.idServiceItem,
                        detail.idDetail,
                        "comments",
                        e.target.value,
                      )
                    }
                  />
                  </div>
              </div>

              <div className={styles.serviceCard}>
                <h2 className="title"> Referencia aduanal </h2>
              </div>

              <div className={styles.serviceCard}>
                <h2 className="title"> Contenedor </h2>
                
                <Containers 
                  infoControl={infoControl} 
                  detail={detail}
                  onUpdateServiceFormData={onUpdateServiceFormData}
                />

              </div>

              <div className={styles.serviceCard}>
                <h2 className="title"> Mercancia </h2>

                <Cargo 
                  infoControl={infoControl} 
                  detail={detail}
                  onUpdateServiceFormData={onUpdateServiceFormData}
                />

              </div>
            </span>
          </div>
        )}
      </span>
    </div>
  );
};
