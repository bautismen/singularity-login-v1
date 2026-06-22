import React, { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "../../pages/Operations.module.css";
import { catalogService } from '../../services/catalogsService';
import { InputCountry } from "../InputCountry";
import { InputAirport } from "../InputAirport";
import { PricingControl } from "../../types/pricingControl";
import { OperationsFormData } from "../../hooks/useOperations";
import { toDateTimeLocal, toUtcISOString } from "../../types/operations";
import {
  TipoEnvio,
  TipoGuia,
  TipoOperacion,
  Incoterm,
  Transportista,
  TipoUnidad,
  TipoRuta,
  // TipoMovimeiento,
  Cargo,
  ReferencesAduanal,
  ComponentDate
} from "./component";
import {
  Copy,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Package,
  Truck,
  MapPin,
  Plane
} from "lucide-react";
import { Airport } from "../../types/airport";
import { useSubFormValidator } from "../../hooks/useSubFormValidator";


export interface AirFreightFormProps {
  mode:             'create' | 'edit' | 'view';
  // Catálogos
  incoterms: any[];
  suppliers: any[];
  countries: any[];
  //info
  info:  {
    id: string;
    idService: string;
    item: number;
    name: string;
  };
  controlsData: PricingControl[];
  formData: OperationsFormData;
  onUpdateFormData: (
    changes:
      | Partial<OperationsFormData>
      | ((prev: OperationsFormData) => Partial<OperationsFormData>),
  ) => void;
  onUpdateServiceFormData: (
    idControl: string, 
    idService: number,
    idServiceItem: number,
    detailId: number,
    field: string,
    value: any,
  ) => void;
  onUpdateServiceDetail: (
    idControl: string, 
    idService: number,
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
  ) => void;
}

export const AirFreightForm: React.FC<AirFreightFormProps> = ({
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
  const [airportsOrigin, setAirportsOrigin] = useState<Airport[]>([]);
  const [airportsDestination, setAirportsDestination] = useState<Airport[]>([]);
  const airServiceControl = formData.Services?.find(
    (s) => (s.idControl ? (s.idControl === info.id && s.idServiceItem === info.item) :
            (s.idService === info.idService && s.idServiceItem === info.item)));
  //console.log('Air formData: ',formData, ' airServiceControl: ', airServiceControl)
  //const [currentIndex, setCurrentIndex] = useState(0);
  const detail = airServiceControl?.serviceDetail?.[airServiceControl.currentIndex] || 
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
    idIncoterm: 1,
    incoterm: "",
    transport: {},
    origin: {},
    destination: {},
  };
  formData.Services?.map((s)=> s.serviceDetail.length === 0 ? s.serviceDetail=[detail] : s)
  const [accordionOpen, setAccordionOpen] = React.useState({
    [`envio`]: true,
    [`transporte`]: true,
    [`origin`]: true,
    [`destination`]: true,
  });
  //lee required del DOM automáticamente
    const {containerRef , getFieldError} = useSubFormValidator(
      `freight-${info.id}-${info.item}`,
      {
        serviceItem: airServiceControl?.idServiceItem,
        detailId: detail?.idDetail,
      }
    );
  console.log('Air formData: ',formData, ' airServiceControl: ', airServiceControl)

  //use effect de carga de aeropuertos origen
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (detail?.origin?.country?.idCountry === undefined || detail?.origin?.country?.idCountry === "") {
          onUpdateServiceFormData(
            airServiceControl?.idControl,
            airServiceControl?.idService,
            airServiceControl?.idServiceItem,
            detail.idDetail,
            "origin",
            {
              ...(detail?.origin ?? {}),
              airport: {
                idAirport: "",
                airport: "",
                airportKey: "",
              },
            }
          )
          setAirportsOrigin([]);
          return;
        }

        const result = await catalogService.getAirportsByIdCountry(detail?.origin?.country?.idCountry);
        const airportsResult = result ?? [];
        setAirportsOrigin(airportsResult);
        const airportKey = detail?.origin?.airport?.airportKey;
        if (!airportKey) return;
        const airportSelected = airportsResult.find(
          (airport) =>
            airport.airport_code?.toLowerCase() === airportKey.toLowerCase()
        );
        if (!airportSelected) {
          onUpdateServiceFormData(
            airServiceControl?.idControl,
            airServiceControl?.idService,
            airServiceControl?.idServiceItem,
            detail.idDetail,
            "origin",
            {
              ...(detail.origin ?? {}),
              airport: {
                idAirport: "",
                airport: "",
                airportKey: "",
              },
            }
          );
          setAirportsOrigin([]);
          return;
        }

        onUpdateServiceFormData(
          airServiceControl?.idControl,
          airServiceControl?.idService,
          airServiceControl?.idServiceItem,
          detail.idDetail,
          "origin",
          {
            ...(detail.origin ?? {}),
            airport: {
              idAirport: airportSelected._Id,
              airport: airportSelected.name_airport,
              airportKey: airportSelected.airport_code ?? "",
            },
          }
        );
      } catch {
        setAirportsOrigin([]);
      }
    };
    fetchData();
  }, [detail?.origin?.country?.idCountry])

  //use effect de carga de aeropuertos destino
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (detail?.destination?.country?.idCountry === undefined || detail?.destination?.country?.idCountry === "") {
          onUpdateServiceFormData(
            airServiceControl?.idControl,
            airServiceControl?.idService,
            airServiceControl?.idServiceItem,
            detail.idDetail,
            "destination",
            {
              ...(detail?.destination ?? {}),
              airport: {
                idAirport: "",
                airport: "",
                airportKey: "",
              },
            }
          );
          setAirportsDestination([]);
          return;
        }
        const result = await catalogService.getAirportsByIdCountry(detail?.destination?.country?.idCountry);
        const airportsResult = result ?? [];
        setAirportsDestination(airportsResult);
        const airportKey = detail?.destination?.airport?.airportKey;
        if (!airportKey) return;
        const airportSelected = airportsResult.find(
          (airport) =>
            airport.airport_code?.toLowerCase() === airportKey.toLowerCase()
        );

        if (!airportSelected) {
          onUpdateServiceFormData(
            airServiceControl?.idControl,
            airServiceControl?.idService,
            airServiceControl?.idServiceItem,
            detail.idDetail,
            "destination",
            {
              ...(detail?.destination ?? {}),
              airport: {
                idAirport: "",
                airport: "",
                airportKey: "",
              },
            }
          );
          setAirportsDestination([]);
          return;
        }

        onUpdateServiceFormData(
          airServiceControl?.idControl,
          airServiceControl?.idService,
          airServiceControl?.idServiceItem,
          detail.idDetail,
          "destination",
          {
            ...(detail.destination ?? {}),
            airport: {
              idAirport: airportSelected?._Id,
              airport: airportSelected?.name_airport,
              airportKey: airportSelected?.airport_code ?? "",
            },
          }
        );
      } catch {
        setAirportsDestination([]);
      }
    };
    fetchData();
  }, [detail?.destination?.country?.idCountry])

  const toggleAccordion = (key) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const nextPage = () => {
    if (airServiceControl.currentIndex < airServiceControl?.serviceDetail.length - 1) {
      onUpdateFormData(prev=>({
        ...prev,
        Services: prev.Services.map((ser) => 
          ser.idServiceItem === airServiceControl?.idServiceItem ? 
          {
            ...ser,
            currentIndex: airServiceControl.currentIndex + 1
          } : ser
        )
      }));
      //setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (airServiceControl.currentIndex > 0) {
      onUpdateFormData(prev=>({
        ...prev,
        Services: prev.Services.map((ser) => 
          ser.idServiceItem === airServiceControl?.idServiceItem ? 
          {
            ...ser,
            currentIndex: airServiceControl.currentIndex - 1
          } : ser
        )
      }));
      //setCurrentIndex((prev) => prev - 1);
    }
  };

  const duplicateCard = (idServiceItem: any, detail: any) => {
    const card = document.getElementById("mainFormCard");
    card.style.opacity = "0.5";
    card.style.transform = "scale(0.98)";

    const newDetail = structuredClone(detail);
    let newsequence = airServiceControl.serviceDetail.length + 1;
    newDetail.idDetail = newsequence;    
    //setCurrentIndex(airServiceControl?.serviceDetail?.length);
    onDuplicateDetail(idServiceItem, newsequence, newDetail);
  };

  return (
    <div ref={containerRef} className={styles.formRow}>
      <span key={airServiceControl?.idControl && airServiceControl?.idServiceItem} className={styles.serviceItem}>
        {detail && (
          <div
            key={detail.idDetail}
            id="mainFormCard"
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4 bg-white dark:bg-[#1e293b]"
          >
            {/* Header Card */}
            <div id="pageCounter">  {/* {detail.sequence} */}
              <div className={styles.serviceActions}>
                <button type="button" className={styles.iconButton} // disabled={isDisabled}
                  onClick={() =>
                    duplicateCard(airServiceControl?.idServiceItem, detail)
                  }>
                  <Copy size={18} />
                </button>

                <span className="text-label-bold font-label-bold text-on-surface-variant dark:text-white">
                  {airServiceControl.currentIndex + 1} de{" "}
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
                      airServiceControl.currentIndex === airServiceControl?.serviceDetail?.length - 1
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
                    console.log('remove', airServiceControl, currentIndex)
                    onRemoveDetail(airServiceControl?.idServiceItem, detail.idDetail)
                    prevPage();
                    console.log(currentIndex)
                    //setCurrentIndex()
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <span key={airServiceControl.currentIndex + 1} className={styles.serviceItem}>
              <div className={styles.serviceCard}>
                <div 
                  className="bg-primary-container bg-opacity-5 px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-opacity-10 transition-colors border-l-4 border-primary"
                  onClick={() => toggleAccordion(`envio`)}
                  > {/* toggleAccordion(`envio-${detail.idDetail}`) */}
                  <div className="flex items-center gap-3">
                    <span className="dark:text-white">
                      <Package />
                    </span>
                    <h2 className="title">{t("operations.shipment")}</h2>
                  </div>
                  <span 
                    className={`material-symbols-outlined
                                text-primary
                                chevron-icon
                                dark:text-white
                                ${accordionOpen[`envio`] ? "rotate-180" : ""}
                                `}
                    id="envios-chevron">
                    <ChevronDown />
                  </span>
                </div>

                <div className={`${styles.accordionContent} 
                                 ${!accordionOpen[`envio`]
                    ? styles.collapsed
                    : ""}`}>
                  <div className={styles.fourColumnGrid}>
                    <div className={styles.firstColumn}>
                      {/* Modalidad */}
                      <div className={styles.fieldGroup}>
                        <TipoEnvio
                          idControl={airServiceControl?.idControl}
                          idService={airServiceControl?.idService}
                          itemService={airServiceControl?.idServiceItem}
                          sequencedetail={detail?.idDetail}
                          detail={detail}
                          onUpdateServiceFormData={onUpdateServiceFormData}
                          label={t("operations.mode")}
                          required={true}
                        />
                      </div>
                    </div>

                    <div className={styles.secondColumn}>
                      {/* Tipo operación */}
                      <div className={styles.fieldGroup}>
                        <TipoOperacion
                          idControl={airServiceControl?.idControl}
                          idService={airServiceControl?.idService}
                          itemService={airServiceControl?.idServiceItem}
                          sequencedetail={detail?.idDetail}
                          detail={detail}
                          onUpdateServiceFormData={onUpdateServiceFormData}
                          label={t("operations.operationtype")}
                          required={true}
                        />
                      </div>
                    </div>

                    <div className={styles.thirdColumn}>
                      {/* Incoterm */}
                      <div className={styles.fieldGroup}>
                        <Incoterm
                          idControl={airServiceControl?.idControl}
                          idService={airServiceControl?.idService}
                          itemService={airServiceControl?.idServiceItem}
                          sequencedetail={detail?.idDetail}
                          detail={detail}
                          onUpdateServiceFormData={onUpdateServiceFormData}
                          incoterms={incoterms}
                          label={t("operations.incoterm")}
                          required={true}
                        />
                      </div>
                    </div>

                    <div className={styles.fourthColumn}>
                      {/* Guia master */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>{t("operations.masterGuide")}</label>
                        <input
                          type="text"
                          value={detail?.masterGuide || ''}
                          onChange={(e) =>
                            onUpdateServiceFormData(
                              airServiceControl?.idControl,
                              airServiceControl?.idService,
                              airServiceControl?.idServiceItem,
                              detail?.idDetail,
                              "masterGuide",
                              e.target.value.toUpperCase(),
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
                    // toggleAccordion(`transporte-${detail.idDetail}`)
                    toggleAccordion(`transporte`)
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="dark:text-white">
                      <Plane />
                    </span>
                    <h2 className="title">{t("operations.transport")}</h2>
                  </div>
                  <span
                    className={`material-symbols-outlined
                                text-primary
                                chevron-icon
                                dark:text-white
                                ${accordionOpen[`transporte`] ? "rotate-180" : ""}
                              `}
                    id="transporte-chevron">
                    <ChevronDown />
                  </span>
                </div>

                <div
                  className={`accordion-content
                              ${!accordionOpen[`transporte`] 
                              ? styles.collapsed : ""}`}>
                  <div className={styles.fourColumnGrid}>
                    
                    <div className={styles.firstColumn}>
                      {/* Transportista */}
                      <div className={styles.fieldGroup}>
                        <Transportista
                          idControl={airServiceControl?.idControl}
                          idService={airServiceControl?.idService}
                          itemService={airServiceControl?.idServiceItem}
                          sequencedetail={detail?.idDetail}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          transportista={suppliers.filter(
                            (s) =>
                              s.status === 1 &&
                              [7, 7].includes(parseInt(s.sectorId)),
                          )}
                          label={t("operations.carrier")}
                          required={true}
                        />
                      </div>
                      
                      {/* Tipo de unidad */}
                      <div className={styles.fieldGroup}>
                        <TipoUnidad
                          idControl={airServiceControl?.idControl}
                          idService={airServiceControl?.idService}
                          itemService={airServiceControl?.idServiceItem}
                          sequencedetail={detail?.idDetail}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          modalidad={"aereo"}
                          label={t("operations.unitType")}
                          required={false}
                        />
                      </div>
                    </div>

                    <div className={styles.secondColumn}>
                      {/* Número de reserva */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          {t("operations.bookingNumber")}
                        </label>
                        <input
                          type="text"
                          value={detail?.transport?.bookingNumeber || ""}
                          className={styles.textInput}
                          onChange={(e) =>
                            onUpdateServiceDetail(
                              airServiceControl?.idControl,
                              airServiceControl?.idService,
                              airServiceControl?.idServiceItem,
                              detail?.idDetail,
                              'transport',
                              'bookingNumeber',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* Nombre de la unidad de transporte */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          {t("operations.unitName")}
                        </label>
                        <input
                          type="text"
                          value={detail?.transport?.nameTransport || ''}
                          onChange={(e) =>
                            onUpdateServiceDetail(
                              airServiceControl?.idControl,
                              airServiceControl?.idService,
                              airServiceControl?.idServiceItem,
                              detail?.idDetail,
                              'transport',
                              'nameTransport',
                              e.target.value
                            )
                          }
                          className={styles.textInput}
                        />
                      </div>

                    </div>

                    <div className={styles.thirdColumn}>
                      {/* Fecha reserva */}
                      <div className={styles.fieldGroup}>
                        <ComponentDate
                          idControl={airServiceControl?.idControl}
                          idService={airServiceControl?.idService}
                          itemService={airServiceControl?.idServiceItem}
                          sequencedetail={detail?.idDetail}
                          data={detail?.transport?.booking_date}
                          node={'transport'}
                          field={'booking_date'}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          label={t("operations.bookingDate")}
                          required={true}
                        />
                      </div>

                      {/* Guia | Tipo */}
                      <div className={styles.fieldGroup}>
                        <TipoGuia
                          idControl={airServiceControl?.idControl}
                          idService={airServiceControl?.idService}
                          itemService={airServiceControl?.idServiceItem}
                          sequencedetail={detail?.idDetail}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          modalidad={"aereo"}
                          label={t("operations.typeGuide")}
                          required={false}
                        />
                      </div>

                    </div>

                    <div className={styles.fourthColumn}>
                      {/* Tipo de ruta */}
                      <div className={styles.fieldGroup}>
                        <TipoRuta
                          idControl={airServiceControl?.idControl}
                          idService={airServiceControl?.idService}
                          itemService={airServiceControl?.idServiceItem}
                          sequencedetail={detail?.idDetail}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          label={t("operations.routeType")}
                          required={true}
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
                  onClick={() => toggleAccordion(`origin`)}
                > {/* toggleAccordion(`origin-${detail.idDetail}`) */}
                  <div className="flex items-center gap-3">
                    <span className="dark:text-white">
                      <MapPin />
                    </span>
                    <h2 className="title">{t("operations.origin")}</h2>
                  </div>
                  <span
                    className={`material-symbols-outlined
                                text-primary
                                chevron-icon
                                dark:text-white
                                ${accordionOpen[`origin`] ? "rotate-180" : ""}
                              `}
                    id="origin-chevron"
                  >
                    <ChevronDown />
                  </span>
                </div>
                <div className={`${styles.accordionContent} 
                                 ${!accordionOpen[`origin`] 
                                 ? styles.collapsed : ""}`}>
                  <div className={styles.fourColumnGrid}>
                    
                    <div className={styles.firstColumn}>
                      {/* ORIGEN */}
                      {/* Pais de carga */}
                      <InputCountry
                        type="origin"
                        countries={countries}
                        selectedCountryId={detail?.origin?.country?.idCountry}
                        serviceIdItem={detail.idDetail}
                        isDisabled={false}
                        placeholder={t("quote.select")}
                        label={t("operations.countryCharge")}
                        mapCountryToChanges={(country) => {
                          console.log('map', country)
                          return {
                            idCountry: country?._Id ?? "",
                            country: country?.name_country ?? "",
                            countryKey: country?.country_code ?? ""
                          }
                        }}
                        onChangeCountry={({ changes }) => {
                          console.log('onChangeCountry', changes)
                          onUpdateServiceDetail(
                            airServiceControl?.idControl,
                            airServiceControl?.idService,
                            airServiceControl?.idServiceItem,
                            detail.idDetail,
                            "origin",
                            "country",
                            changes
                          );
                        }}
                        groupClassName={styles.fieldGroup}
                        labelClassName={styles.fieldLabel}
                        inputClassName={styles.textInput}
                      />

                      {/* Planta */}
                      {detail.idTypeShipment !== 2  && (                        
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            {t("operations.plant")}
                          </label>
                          <input
                            type="text"
                            value={detail?.origin?.plant?.name || ''}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                airServiceControl?.idControl,
                                airServiceControl?.idService,
                                airServiceControl?.idServiceItem, 
                                detail?.idDetail, 
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
                      {/* Aeropuerto de carga */}
                      {[2, 4].includes(detail.idTypeShipment) ? (
                        <InputAirport
                          type="origin"
                          airports={airportsOrigin}
                          nameAirport={detail?.origin?.airport?.airport}
                          codeAirport={detail?.origin?.airport?.airportKey}
                          serviceIdItem={detail.idDetail}
                          label="Aeropuerto de carga"
                          groupClassName={styles.fieldGroup}
                          labelClassName={styles.fieldLabel}
                          inputClassName={styles.textInput}
                          onChangeAirport={(airport) => {
                            onUpdateServiceFormData(
                              airServiceControl?.idControl,
                              airServiceControl?.idService,
                              airServiceControl?.idServiceItem,
                              detail.idDetail,
                              "origin",
                              {
                                ...(detail.origin ?? {}),
                                airport: {
                                  idAirport: airport?._Id,
                                  airport: airport?.name_airport ?? "",
                                  airportKey: airport?.airport_code ?? ""
                                },
                              },
                            );
                          }}
                        />
                      ) : (
                        /* Lugar de recoleccion */
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            <span className={styles.required}>* </span> {t("operations.collectionLocation")}
                          </label>
                          <input
                            type="text"
                            value={detail?.origin?.placeOfReceipt || ''}
                            className={styles.textInput}
                            required
                            data-error-message="Lugar de recolección requerido"
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                airServiceControl?.idControl,
                                airServiceControl?.idService,
                                airServiceControl?.idServiceItem,
                                detail.idDetail,
                                "origin",
                                "placeOfReceipt",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )}

                      {/* Llegada a planta  */}
                      {detail.idTypeShipment !== 2 && (
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            {t("operations.arrivalPlant")}
                          </label>
                          <input
                            type="datetime-local"
                            value={toDateTimeLocal(detail?.origin?.plant?.arrivalDate)}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceFormData(
                                airServiceControl?.idControl,
                                airServiceControl?.idService,
                                airServiceControl?.idServiceItem,
                                detail.idDetail,
                                "origin",
                                {
                                  ...(detail.origin ?? {}),
                                  plant: {
                                    arrivalDate: toUtcISOString(e.target.value)
                                  }
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
                        <ComponentDate
                          idControl={airServiceControl?.idControl}
                          idService={airServiceControl?.idService}
                          itemService={airServiceControl?.idServiceItem}
                          sequencedetail={detail?.idDetail}
                          data={detail?.origin?.departureDateAproximate}
                          node={'origin'}
                          field={'departureDateAproximate'}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          label={"ETD"}
                          required={false}
                        />
                      </div>

                      {/* Salida de planta */}
                      {detail.idTypeShipment !== 2 && (
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            {t("operations.plantExit")}
                          </label>
                          <input
                            type="datetime-local"
                            value={toDateTimeLocal(detail?.origin?.plant?.departureDate)}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceFormData(
                                airServiceControl?.idControl,
                                airServiceControl?.idService,
                                airServiceControl?.idServiceItem,
                                detail?.idDetail,
                                "origin",
                                {
                                  ...(detail.origin ?? {}),
                                  plant: {
                                    departureDate: toUtcISOString(e.target.value)
                                  }
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
                        <ComponentDate
                          idControl={airServiceControl?.idControl}
                          idService={airServiceControl?.idService}
                          itemService={airServiceControl?.idServiceItem}
                          sequencedetail={detail?.idDetail}
                          data={detail?.origin?.dispatchOrCollectionDate}
                          node={'origin'}
                          field={'dispatchOrCollectionDate'}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          label={t("operations.dispatchOrCollection")}
                          required={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/**DESTINO */}
                <div
                  className="bg-primary-container bg-opacity-5 px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-opacity-10 transition-colors border-l-4 border-primary"
                  onClick={() =>
                    // toggleAccordion(`destination-${detail.idDetail}`)
                    toggleAccordion(`destination`)
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="dark:text-white">
                      <MapPin />
                    </span>
                    <h2 className="title">{t("operations.destination")}</h2>
                  </div>
                  <span className={`material-symbols-outlined
                                    text-primary
                                    chevron-icon
                                    dark:text-white
                                    ${accordionOpen.destination ? "rotate-180" : ""}`}
                    id="origin-chevron">
                    <ChevronDown />
                  </span>
                </div>

                <div className={`${styles.accordionContent} 
                                 ${!accordionOpen[`destination`] 
                                 ? styles.collapsed : ""}`}>
                  <div className={styles.fourColumnGrid}>
                    
                    <div className={styles.firstColumn}>
                      {/*DESTINO */}
                      {/* Pais de descarga */}
                      <InputCountry
                        type="destination"
                        countries={countries}
                        selectedCountryId={detail?.destination?.country?.idCountry}
                        serviceIdItem={detail.idDetail}
                        isDisabled={false}
                        placeholder={t("quote.select")}
                        label="País de descarga"
                        mapCountryToChanges={(country) => {
                          return {
                            idCountry: country?._Id ?? "",
                            country: country?.name_country ?? "",
                            countryKey: country?.country_code ?? ""
                          }
                        }}
                        onChangeCountry={({ changes }) => {
                          onUpdateServiceDetail(
                            airServiceControl?.idControl,
                            airServiceControl?.idService,
                            airServiceControl?.idServiceItem,
                            detail.idDetail,
                            "destination",
                            "country",
                            changes
                          );
                        }}
                        groupClassName={styles.fieldGroup}
                        labelClassName={styles.fieldLabel}
                        inputClassName={styles.textInput}
                      />

                      {/* Planta */}
                      { [1,4].includes(detail.idTypeShipment) ? (
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            {t("operations.plant")}
                          </label>
                          <input
                            type="text"
                            value={detail?.destination?.plant?.name || ''}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                airServiceControl?.idControl,
                                airServiceControl?.idService,
                                airServiceControl?.idServiceItem, 
                                detail.idDetail, 
                                'destination',
                                  'plant', {
                                    'name': e.target.value
                                  }
                              )
                            }
                          />
                        </div>
                      ) : (
                        /* Entrega en destino */
                        <div className={styles.fieldGroup}>
                          <ComponentDate
                            idControl={airServiceControl?.idControl}
                            idService={airServiceControl?.idService}
                            itemService={airServiceControl?.idServiceItem}
                            sequencedetail={detail?.idDetail}
                            data={detail?.destination?.deliveryDate}
                            node={'destination'}
                            field={'deliveryDate'}
                            onUpdateServiceDetail={onUpdateServiceDetail}
                            label={t("operations.deliveryAtDestination")}
                            required={false}
                          />
                        </div>
                      )}
                        
                    </div>

                    <div className={styles.secondColumn}>
                      {/* Aeropuerto de descarga */}
                      {[2, 3].includes(detail?.idTypeShipment) ?
                        <InputAirport
                          airports={airportsDestination}
                          nameAirport={detail?.destination?.airport?.airport}
                          codeAirport={detail?.destination?.airport?.airportKey}
                          serviceIdItem={detail?.idDetail}
                          type="destination"
                          label={t("operations.airportDischarge")}
                          groupClassName={styles.fieldGroup}
                          labelClassName={styles.fieldLabel}
                          inputClassName={styles.textInput}
                          onChangeAirport={(airport) => {
                            onUpdateServiceFormData(
                              airServiceControl?.idControl,
                              airServiceControl?.idService,
                              airServiceControl?.idServiceItem,
                              detail.idDetail,
                              "destination",
                              {
                                ...(detail.destination ?? {}),
                                airport: {
                                  idAirport: airport?._Id,
                                  airport: airport?.name_airport,
                                  airportKey: airport?.airport_code ?? ""
                                },
                              },
                            );
                          }}
                        /> :
                        /* Lugar de descarga */
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            {t("operations.placeDischarge")}
                          </label>
                          <input
                            type="text"
                            value={detail?.destination?.placeOfReceipt || ''}
                            className={styles.textInput}
                            required
                            data-error-message="Lugar de descarga requerido"
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                airServiceControl?.idControl,
                                airServiceControl?.idService,
                                airServiceControl?.idServiceItem,
                                detail.idDetail,
                                "destination",
                                "placeOfReceipt",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      }
                      
                      {/* Llegada a planta y Salida de planta */}
                      {[1, 4].includes(detail.idTypeShipment) && (
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>
                            {t("operations.destinationDeparture")}
                          </label>
                          <input
                            type="datetime-local"
                            value={toDateTimeLocal(detail?.destination?.plant?.arrivalDate)}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                airServiceControl?.idControl,
                                airServiceControl?.idService,
                                airServiceControl?.idServiceItem, 
                                detail.idDetail, 
                                'destination',
                                  'plant', {
                                    'arrivalDate': toUtcISOString(e.target.value)
                                  }
                              )
                            }
                          />
                        </div>
                      )}

                    </div>

                    <div className={styles.thirdColumn}>
                      {/* ETA (Llegada estimada) */}
                      <div className={styles.fieldGroup}>
                        <ComponentDate
                          idControl={airServiceControl?.idControl}
                          idService={airServiceControl?.idService}
                          itemService={airServiceControl?.idServiceItem}
                          sequencedetail={detail?.idDetail}
                          data={detail?.destination?.estimatedArrivalDateETA}
                          node={'destination'}
                          field={'estimatedArrivalDateETA'}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          label={"ETA"}
                          required={false}
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
                            value={toDateTimeLocal(detail?.destination?.plant?.arrivalDate)}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                airServiceControl?.idControl,
                                airServiceControl?.idService,
                                airServiceControl?.idServiceItem, 
                                detail.idDetail, 
                                'destination',
                                  'plant', {
                                    'arrivalDate': toUtcISOString(e.target.value)
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
                        <ComponentDate
                          idControl={airServiceControl?.idControl}
                          idService={airServiceControl?.idService}
                          itemService={airServiceControl?.idServiceItem}
                          sequencedetail={detail?.idDetail}
                          data={detail?.destination?.arrivalDateATA}
                          node={'destination'}
                          field={'arrivalDateATA'}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          label={"ATA"}
                          required={false}
                        />
                      </div>
                      
                      {/* Salida de planta */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Salida de planta
                        </label>
                        <input
                          type="datetime-local"
                          value={detail?.origin.plant}
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
                    className="block font-label-caps text-label-caps text-primary px-1 py-2 dark:text-white">
                    {t("operations.observations")}
                  </label>
                  <textarea
                    value={detail?.comments || ""}
                    className={styles.textArea}
                    onChange={(e) =>
                      onUpdateServiceFormData(
                        airServiceControl?.idControl,
                        airServiceControl?.idService,
                        airServiceControl?.idServiceItem,
                        detail.idDetail,
                        "comments",
                        e.target.value,
                      )
                    } />
                </div>
              </div>

              <div className={styles.serviceCard}>
                <h2 className="title"> Referencia aduanal </h2>
                <ReferencesAduanal
                  infoControl={airServiceControl}
                  detail={detail}
                  onUpdateServiceFormData={onUpdateServiceFormData} />
              </div>

              <div className={styles.serviceCard}>
                <h2 className="title"> Mercancia </h2>

                <Cargo
                  infoControl={airServiceControl}
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
