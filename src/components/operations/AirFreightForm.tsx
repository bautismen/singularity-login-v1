import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "../../pages/Operations.module.css";
import { InputCountry } from "../InputCountry";
import { InputAirport } from "../InputAirport";
import { PricingControl } from "../../types/pricingControl";
import { OperationsFormData } from "../../hooks/useOperations";
import {
  TipoEnvio,
  TipoReferencia,
  TipoOperacion,
  Incoterm,
  Transportista,
  TipoUnidad,
  TipoRuta,
  TipoMovimeiento,
} from "./component";
import {
  Copy,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Package,
  Truck,
  MapPin,
} from "lucide-react";

export interface AirFreightFormProps {
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
}

export const AirFreightForm: React.FC<AirFreightFormProps> = ({
  incoterms,
  suppliers,
  countries,
  info,
  controlsData,
  formData,
  onUpdateFormData,
  onUpdateServiceFormData,
  onUpdateServiceDetail,
  onDuplicateDetail,
}) => {
  const { t } = useLanguage();
  const [accordionOpen, setAccordionOpen] = React.useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const airServiceControl = formData.Services?.find((s) => s.idControl === info.id && s.idServiceItem === info.item);  
  const detail = airServiceControl?.serviceDetail?.[currentIndex]; //currentDetail
  console.log('AIR FORM',formData, 'detail: ', detail);

  let currentVersion = 1;
  let totalVersions = 1;

  const toggleAccordion = (key) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // function updateCounter() {
  //   document.getElementById('pageCounter').textContent = `${currentVersion} de ${totalVersions}`;
  // }

  const nextPage = () => {
    if (currentIndex < airServiceControl.serviceDetail.length - 1) {
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

    let newsequence = airServiceControl.serviceDetail.length + 1;
    // Nuevo detail
    newDetail.sequence = newsequence;

    setCurrentIndex(airServiceControl.serviceDetail.length);

    onDuplicateDetail(idServiceItem, newsequence, newDetail);
  };

  return (
    <div className={styles.formRow}>
      <span key={airServiceControl?.idServiceItem} className={styles.serviceItem}>
        {detail && (
          <div key={detail.sequence} id="mainFormCard" className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4 bg-white dark:bg-[#1e293b]">
            {/* Header Card */}
            <div id="pageCounter">
              <div className={styles.serviceActions}>
                <button type="button" className={styles.iconButton} // disabled={isDisabled}
                  onClick={() =>
                    duplicateCard(airServiceControl?.idServiceItem, detail)
                  }>
                  <Copy size={18} />
                </button>

                <span className="text-label-bold font-label-bold text-on-surface-variant dark:text-white">
                  {currentIndex + 1} de{" "}
                  {airServiceControl?.serviceDetail?.length || 1}
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
                      currentIndex === airServiceControl?.serviceDetail?.length - 1
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
                  onClick={() => ""}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            {/* Contenido */}
            <span key={currentIndex + 1} className={styles.serviceItem}>
              <div className={styles.serviceCard}>
                <div className="bg-primary-container bg-opacity-5 px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-opacity-10 transition-colors border-l-4 border-primary"
                  onClick={() => toggleAccordion(`envio-${detail.sequence}`)}>
                  <div className="flex items-center gap-3">
                    <span className="dark:text-white">
                      <Package />
                    </span>
                    <h2 className="title">Envio</h2>
                  </div>
                  <span className={`
                                    material-symbols-outlined
                                    text-primary
                                    chevron-icon
                                    dark:text-white
                                    ${accordionOpen.envio ? "rotate-180" : ""}
                                  `}
                    id="envios-chevron">
                    <ChevronUp />
                  </span>
                </div>

                <div className={`accordion-content ${!accordionOpen.envio ? "collapsed" : ""} `}>
                  <div className={styles.fourColumnGrid}>
                    <div className={styles.firstColumn}>
                      {/* Modalidad */}
                      <div className={styles.fieldGroup}>
                        <TipoEnvio
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.sequence}
                          detail={detail}
                          onUpdateServiceFormData={onUpdateServiceFormData}
                        />
                      </div>
                    </div>

                    <div className={styles.secondColumn}>
                      {/* Tipo operación */}
                      <div className={styles.fieldGroup}>
                        <TipoOperacion
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.sequence}
                          detail={detail}
                          onUpdateServiceFormData={onUpdateServiceFormData}
                        />
                      </div>
                    </div>

                    <div className={styles.thirdColumn}>
                      {/* Incoterm */}
                      <div className={styles.fieldGroup}>
                        <Incoterm
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.sequence}
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
                              airServiceControl.idServiceItem,
                              detail.sequence,
                              "masterGuide",
                              e.target.value,
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
                    toggleAccordion(`transporte-${detail.sequence}`)
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="dark:text-white">
                      <Truck />
                    </span>
                    <h2 className="title">Transporte</h2>
                  </div>
                  <span
                    className={`
                                    material-symbols-outlined
                                    text-primary
                                    chevron-icon
                                    dark:text-white
                                    ${accordionOpen.transporte ? "rotate-180" : ""}
                                  `}
                    id="transporte-chevron"
                  >
                    <ChevronUp />
                  </span>
                </div>

                <div
                  className={`accordion-content
                      ${!accordionOpen.transporte ? "collapsed" : ""}
                    `}
                >
                  <div className={styles.fourColumnGrid}>
                    <div className={styles.firstColumn}>
                      {/* Transportista */}
                      <div className={styles.fieldGroup}>
                        <Transportista
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.sequence}
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
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.sequence}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                        />
                      </div>

                      {/* Guia | Tipo */}
                      <div className={styles.fieldGroup}>
                        <div className="flex flex-col gap-1">
                          <label className="text-label-md font-label-md text-on-surface-variant">
                            Guía | Tipo
                          </label>
                          <div className="flex items-center bg-surface-container focus-within:border-secondary transition-all">
                            <input
                              type="text"
                              className={styles.textInput}
                              // placeholder="ID de Guía"
                              value={detail?.transport.guide}
                            />
                            {/* <!-- Vertical Divider --> */}
                            <div className="h-6 w-px bg-outline-variant dark:text-white"></div>
                            {/* <!-- Dropdown for Tipo --> */}
                            <div className="relative w-1/2">
                              <select className={styles.selectInput}>                                
                                {/* Aereas */}
                                {/* <option value="Master_Of_Air_Way_Bill">MAWB</option> */}
                                <option value="House_of_Air_Way_Bill">
                                  HAWB
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.secondColumn}>
                      {/* Tipo de solicitud de reserva */}
                      <div className={styles.fieldGroup}>
                        <TipoReferencia
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.sequence}
                          detail={detail}
                          onUpdateServiceFormData={onUpdateServiceFormData}
                        />
                      </div>

                      {/* Nombre Unidad */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Número de unidad
                        </label>
                        <input
                          type="text"
                          value={detail?.masterGuide}
                          onChange={(e) =>
                            onUpdateServiceFormData(
                              airServiceControl.idServiceItem,
                              detail.sequence,
                              "masterGuide",
                              e.target.value,
                            )
                          }
                          className={styles.textInput}
                        />
                      </div>
                    </div>

                    <div className={styles.thirdColumn}>
                      {/* Número de reserva */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Número de reserva
                        </label>
                        <input
                          type="text"
                          value={detail?.shippingReferenceNumber || ""}
                          className={styles.textInput}
                          onChange={(e) =>
                            onUpdateServiceFormData(
                              airServiceControl.idServiceItem,
                              detail.sequence,
                              "shippingReferenceNumber",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      {/* Tipo de movimiento */}
                      <div className={styles.fieldGroup}>
                        <TipoMovimeiento
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.sequence}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                        />
                      </div>

                      {/* CAAT */}
                      {/* <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          CAAT
                          <input
                            type="text"
                            value={transport.}
                            readOnly
                            className={styles.textInput}
                          />
                        </label>
                      </div> */}
                    </div>

                    <div className={styles.fourthColumn}>
                      {/* Fecha reserva */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Fecha de reserva
                        </label>
                        <input
                          type="datetime-local"
                          value={detail?.shippingDate} //? new Date(detail.shippingDate).toISOString().slice(0, 16) : ''
                          onChange={(e) =>
                            onUpdateServiceFormData(
                              airServiceControl.idServiceItem,
                              detail.sequence,
                              "shippingDate",
                              e.target.value,
                            )
                          }
                          className={styles.textInput}
                        />
                      </div>

                      {/* Tipo de ruta */}
                      <div className={styles.fieldGroup}>
                        <TipoRuta
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.sequence}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                        />
                      </div>

                      {/* Placas */}
                      {/* <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>
                                    Placas
                                    <input
                                        type="text"
                                        value={detail.masterBill}
                                        className={styles.textInput}
                                    />
                                    </label>
                                </div> */}

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
                  onClick={() => toggleAccordion(`origin-${detail.sequence}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="dark:text-white">
                      <MapPin />
                    </span>
                    <h2 className="title">Origen </h2>
                  </div>
                  <span
                    className={`
                                    material-symbols-outlined
                                    text-primary
                                    chevron-icon
                                    dark:text-white
                                    ${accordionOpen.origin ? "rotate-180" : ""}
                                  `}
                    id="origin-chevron"
                  >
                    <ChevronUp />
                  </span>
                </div>
                <div className={` accordion-content ${!accordionOpen.origen ? "collapsed" : ""}`}>
                  <div className={styles.fourColumnGrid}>
                    <div className={styles.firstColumn}>
                      {/* ORIGEN */}
                      {/* Pais de carga */}
                      <InputCountry
                        type="origin"
                        countries={countries}
                        selectedCountryId={detail.origin?.idCountry}
                        serviceIdItem={detail.sequence}
                        isDisabled={false}
                        placeholder={t("quote.select")}
                        label={t("operations.countryCharge")}
                        onChangeCountry={({ type, changes }) => {
                          onUpdateServiceFormData(
                            airServiceControl.idServiceItem,
                            detail.sequence,
                            "origin",
                            {
                              ...(detail.origin ?? {}),
                              ...changes,
                            },
                          );
                        }}
                        groupClassName={styles.fieldGroup}
                        labelClassName={styles.fieldLabel}
                        inputClassName={styles.textInput}
                       >
                        <div className="h-6 w-px bg-outline-variant dark:text-white"></div>
                            {/* <!-- Dropdown for Tipo --> */}
                            <div className="relative w-1/2">
                              <select className={styles.selectInput}>
                                {/* Maritimas */}
                                {/* <option value="Master_Bill_Of_Lading">MBL</option> */}
                                <option value="Bill_Of">BL</option>{" "}
                                {/* Liberación de carga con original */}
                                <option value="Sea_">SWB</option>{" "}
                                {/* Liberación de carga contra copia */}
                                <option value="House_Of_Lading">
                                  HBL
                                </option>
                                {/* Terrestres */}
                                <option value="Bill_">BOL</option>
                                {/* Aereas */}
                                {/* <option value="Master_Of_Air_Way_Bill">MAWB</option> */}
                                <option value="House_of_Air_Way_Bill">
                                  HAWB
                                </option>
                              </select>
                            </div> 
                         
                       </InputCountry>
                                                                                                          
                      {/* Llegada a planta  */}
                      {detail.idTypeShipment !== 2  && (                        
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            {t("operations.arrivalPlant")}
                          </label>
                          <input
                            type="datetime-local"
                            value={detail?.origin}
                            className={styles.textInput}
                          />                          
                        </div>                        
                      )}
                    </div>  
                    <div className={styles.secondColumn}>
                      {[2, 4].includes(detail.idTypeShipment) ? (                        
                        <InputAirport
                          idCountry={detail.origin?.idCountry}
                          value={detail?.origin?.airport ?? ""}
                          serviceIdItem={detail.sequence}
                          label="Aeropuerto de carga"
                          groupClassName={styles.fieldGroup}
                          labelClassName={styles.fieldLabel}
                          inputClassName={styles.textInput}
                          onChangeAirport={(airport) => {
                            onUpdateServiceFormData(
                              airServiceControl.idServiceItem,
                              detail.sequence,
                              "origin",
                              {
                                ...(detail.origin ?? {}),
                                airport: airport?.airport_code ?? "",
                              },
                            );
                          }}
                        />
                      ) : (
                      /* Lugar de recoleccion */
                      <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            Lugar de recoleccion
                          </label>
                          <input
                            type="text"
                            value={detail?.origin?.placeOfReceipt}
                            className={styles.textInput}
                          />
                      </div>
                      )}

                      {/* Salida de planta */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                              Salida de planta
                        </label>
                        <input
                          type="datetime-local"
                          value={detail?.origin}
                          className={styles.textInput}
                        />
                      </div>
                    </div>      
                    <div className={styles.thirdColumn}>
                      {/* ETD (Salida estimada) */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          ETD (Salida estimada)
                        </label>
                        <input
                          type="datetime-local"
                          value={detail.origin?.estimatedDepartureDateETD}
                          className={styles.textInput}
                          onChange={(e) =>
                            onUpdateServiceFormData(
                              airServiceControl.idServiceItem,
                              detail.sequence,
                              "departureDateAproximate",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div> 
                    <div className={styles.fourthColumn}>
                      {/* Despacho / recoleccion */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Despacho / recoleccion
                        </label>
                        <input
                          type="datetime-local"
                          value={detail?.origin}
                          className={styles.textInput}
                        />
                      </div>
                    </div>             
                  </div>                  
                </div>
                
                {/**DESTINO */}
                <div
                  className="bg-primary-container bg-opacity-5 px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-opacity-10 transition-colors border-l-4 border-primary"
                  onClick={() =>
                    toggleAccordion(`destination-${detail.sequence}`)
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
                                    ${accordionOpen.origin ? "rotate-180" : ""}`}
                        id="origin-chevron">
                    <ChevronUp />
                  </span>
                </div>

                <div className={`accordion-content ${!accordionOpen.destino ? "collapsed" : ""}`}>
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
                        selectedCountryId={detail.destination?.idCountry}
                        serviceIdItem={detail.sequence}
                        isDisabled={false}
                        placeholder={t("quote.select")}
                        label="Pais de descarga"
                        onChangeCountry={({ type, changes }) => {
                          onUpdateServiceFormData(
                            airServiceControl.idServiceItem,
                            detail.sequence,
                            "destination",
                            {
                              ...(detail.destination ?? {}),
                              ...changes,
                            },
                          );
                        }}
                      />
                      
                      
                      {/* ATA (Atraque) */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          {" "}
                          ATA (Atraque)
                        </label>
                        <input
                          type="datetime-local"
                          //value={detail?.destination}
                          className={styles.textInput}
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
                          />
                        </div>
                      )}
                    </div>

                    <div className={styles.secondColumn}>
                      {/* Aeropuerto de descarga */}
                      {[2, 3].includes(detail.idTypeShipment) ?                                             
                        <InputAirport
                          idCountry={detail.destination?.idCountry}
                          value={detail?.destination?.airport ?? ""}
                          serviceIdItem={detail.sequence}
                          label={t("operations.airportDischarge")}
                          groupClassName={styles.fieldGroup}
                          labelClassName={styles.fieldLabel}
                          inputClassName={styles.textInput}
                          onChangeAirport={(airport) => {
                            onUpdateServiceFormData(
                              airServiceControl.idServiceItem,
                              detail.sequence,
                              "destination",
                              {
                                ...(detail.destination ?? {}),
                                airport: airport?.airport_code ?? "",
                              },
                            );
                          }}
                        /> : 
                        /* Lugar de recoleccion */
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            Lugar de recoleccion
                          </label>
                          <input
                            type="text"
                            value={detail?.origin?.placeOfReceipt}
                            className={styles.textInput}
                          />
                        </div>
                      }
                      {/* Entrega en destino */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Entrega en destino
                        </label>
                        <input
                          type="datetime-local"
                          value={detail?.destination}
                          className={styles.textInput}
                        />
                      </div>
                    </div>

                    <div className={styles.thirdColumn}>
                      {/* Planta */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Planta
                        </label>
                        <input
                          type="text"
                          value={detail.destination?.plant}
                          className={styles.textInput}
                        />
                      </div>
                       {/* Llegada a planta  */}
                      {detail.idTypeShipment !== 2 && (                        
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            {t("operations.arrivalPlant")}
                          </label>
                          <input
                            type="datetime-local"
                            value={detail?.origin}
                            className={styles.textInput}
                          />                          
                        </div>                        
                      )}
                    </div>

                    <div className={styles.fourthColumn}>
                      {/* ETA (Llegada estimada) */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          ETA (Llegada estimada)
                        </label>
                        <input
                          type="datetime-local"
                          value={detail?.destination?.arrivalDateATA}
                          className={styles.textInput}
                        />
                      </div>
                       {/* Salida de planta */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                              Salida de planta
                        </label>
                        <input
                          type="datetime-local"
                          value={detail?.origin}
                          className={styles.textInput}
                        />
                      </div>
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
                      value={detail.observationsService || ""}
                      className={styles.textArea}
                      /*onChange={(e) =>
                    updateService(
                      infoControl.idServiceItem,
                      detail.sequence,
                      "observationsService",
                      e.target.value,
                    )
                  }*/
                    />
                    {/* <input
                                type="text"
                                id="observationsService"
                                name="observations"
                                value={
                                  formData.Services.find(
                                    s => s.idServiceItem === serv.idServiceItem
                                  )?.observations || ''
                                }
                                onChange={(e) =>
                                  updateService(
                                    serv.idServiceItem,
                                    'observations',
                                    e.target.value
                                  )
                                }
                                className="min-h-[30px] w-full p-2 rounded-lg
                                        bg-transparent text-black dark:text-white
                                        border border-gray-300 dark:border-gray-700
                                        hover:border-[#14b8a6] hover:dark:border-[#14b8a6] 
                                        focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]
                                        outline-none appearance-none text-body-sm transition-colors"
                              /> */}
                  </div>
              </div>

              <div className={styles.serviceCard}>
                <h2 className="title"> Referencia aduanal </h2>
              </div>

              <div className={styles.serviceCard}>
                <h2 className="title"> Contenedor </h2>
              </div>

              <div className={styles.serviceCard}>
                <h2 className="title"> Mercancia </h2>
              </div>
            </span>
          </div>
        )}
      </span>
    </div>
  );
};
