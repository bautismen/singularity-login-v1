import React, { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "../../pages/Operations.module.css";
import { catalogService } from '../../services/catalogsService';
import { InputCountry } from "../InputCountry";
import { InputAirport } from "../InputAirport";
import { PricingControl } from "../../types/pricingControl";
import { OperationsFormData } from "../../hooks/useOperations";
import { formatDateTimeLocal } from "../../types/operations";
import {
  TipoEnvio,
  TipoGuia,
  // TipoReferencia,
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
  ChevronUp,
  Package,
  Truck,
  MapPin,
  Plane,
  ChevronDown
} from "lucide-react";
import { Airport } from "../../types/airport";

export interface AirFreightFormProps {
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
  ) => void;
}

export const AirFreightForm: React.FC<AirFreightFormProps> = ({
  mode, 
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
  onRemoveDetail
}) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [airportsOrigin, setAirportsOrigin] = useState<Airport[]>([]);
  const [airportsDestination, setAirportsDestination] = useState<Airport[]>([]);
  const airServiceControl = formData.Services?.find((s) => (s.idControl ? (s.idControl === info.id && s.idServiceItem === info.item) :
                            (s.idService === info.idService && s.idServiceItem === info.item)));
  const detail = airServiceControl?.serviceDetail?.[currentIndex] || 
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
    origin: {},
    destination: {},
  };
  formData.Services?.map((s)=> s.serviceDetail.length === 0 ? s.serviceDetail=[detail] : s)
  const [accordionOpen, setAccordionOpen] = React.useState({
    [`envio-${detail?.idDetail}`]: mode=== 'edit' ? true : true,
    [`transporte-${detail?.idDetail}`]: mode=== 'edit' ? true : true,
    [`origin-${detail?.idDetail}`]: mode=== 'edit' ? true : true,
    [`destination-${detail?.idDetail}`]: mode=== 'edit' ? true : true,
  });
  console.log('Air formData: ',formData, ' airServiceControl: ', airServiceControl)

  //use effect de carga de aeropuertos origen
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (detail?.origin?.country?.idCountry === undefined || detail?.origin?.country?.idCountry === "") {
          onUpdateServiceFormData(
            airServiceControl.idServiceItem,
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
            airServiceControl.idServiceItem,
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
          airServiceControl.idServiceItem,
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
            airServiceControl.idServiceItem,
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
            airServiceControl.idServiceItem,
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
          airServiceControl.idServiceItem,
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
    if (currentIndex < airServiceControl?.serviceDetail.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const duplicateCard = (idServiceItem: any, detail: any) => {
    const card = document.getElementById("mainFormCard");
    card.style.opacity = "0.5";
    card.style.transform = "scale(0.98)";

    const newDetail = structuredClone(detail);

    let newsequence = airServiceControl.serviceDetail.length + 1;
    newDetail.idDetail = newsequence;    // Nuevo detail

    setCurrentIndex(airServiceControl?.serviceDetail?.length);
    onDuplicateDetail(idServiceItem, newsequence, newDetail);

    console.log('dupl', newDetail, newsequence,)
  };

  return (
    <div className={styles.formRow}>
      <span key={airServiceControl?.idServiceItem} className={styles.serviceItem}>
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
                  onClick={() => {
                    console.log('remove', airServiceControl, currentIndex)
                    onRemoveDetail(airServiceControl?.idServiceItem, detail.idDetail)
                    prevPage();
                    console.log(currentIndex)
                    //setCurrentIndex()
                  }
                  }
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            {/* Contenido */}
            <span key={currentIndex + 1} className={styles.serviceItem}>
              <div className={styles.serviceCard}>
                <div className="bg-primary-container bg-opacity-5 px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-opacity-10 transition-colors border-l-4 border-primary"
                  onClick={() => toggleAccordion(`envio-${detail.idDetail}`)}>
                  <div className="flex items-center gap-3">
                    <span className="dark:text-white">
                      <Package />
                    </span>
                    <h2 className="title">{t("operations.shipment")}</h2>
                  </div>
                  <span className={`
                                    material-symbols-outlined
                                    text-primary
                                    chevron-icon
                                    dark:text-white
                                    ${accordionOpen[`envio-${detail.idDetail}`] ? "rotate-180" : ""}
                                  `}
                    id="envios-chevron">
                    <ChevronUp />
                  </span>
                </div>

                <div className={`${styles.accordionContent} 
                                  ${!accordionOpen[`envio-${detail.idDetail}`]
                    ? styles.collapsed
                    : ""}`}>
                  <div className={styles.fourColumnGrid}>
                    <div className={styles.firstColumn}>
                      {/* Modalidad */}
                      <div className={styles.fieldGroup}>
                        <TipoEnvio
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.idDetail}
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
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.idDetail}
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
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.idDetail}
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
                          value={detail?.masterGuide}
                          onChange={(e) =>
                            onUpdateServiceFormData(
                              airServiceControl.idServiceItem,
                              detail.idDetail,
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
                    toggleAccordion(`transporte-${detail.idDetail}`)
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
                                ${accordionOpen[`transporte-${detail.idDetail}`] ? "rotate-180" : ""}
                              `}
                    id="transporte-chevron">
                    <ChevronUp />
                  </span>
                </div>

                <div
                  className={`accordion-content
                              ${!accordionOpen[`transporte-${detail.idDetail}`] ? styles.collapsed : ""}`}>
                  <div className={styles.fourColumnGrid}>
                    
                    <div className={styles.firstColumn}>
                      {/* Transportista */}
                      <div className={styles.fieldGroup}>
                        <Transportista
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.idDetail}
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
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.idDetail}
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
                              airServiceControl.idServiceItem,
                              detail.idDetail,
                              'transport',
                              'bookingNumeber',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* Nombre Unidad */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          {t("operations.unitName")}
                        </label>
                        <input
                          type="text"
                          value={detail?.transport?.nameTransport}
                          onChange={(e) =>
                            onUpdateServiceDetail(
                              airServiceControl.idServiceItem,
                              detail.idDetail,
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
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          data={detail?.transport?.shippingDate}
                          node={'transport'}
                          field={'shippingDate'}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          label={t("operations.bookingDate")}
                          required={true}
                        />
                      </div>

                      {/* Guia | Tipo */}
                      <div className={styles.fieldGroup}>
                        <TipoGuia
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          modalidad={"aereo"}
                          label={t("operations.typeGuide")}
                          required={false}
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
                      {/* Tipo de ruta */}
                      <div className={styles.fieldGroup}>
                        <TipoRuta
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          transport={detail?.transport}
                          onUpdateServiceDetail={onUpdateServiceDetail}
                          label={t("operations.routeType")}
                          required={true}
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
                  onClick={() => toggleAccordion(`origin-${detail.idDetail}`)}
                >
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
                                ${accordionOpen[`origin-${detail.idDetail}`] ? "rotate-180" : ""}
                              `}
                    id="origin-chevron"
                  >
                    <ChevronDown />
                  </span>
                </div>
                <div className={`${styles.accordionContent} ${!accordionOpen[`origin-${detail.idDetail}`] ? styles.collapsed : ""}`}>
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
                            airServiceControl.idServiceItem,
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
                            value={detail?.origin?.plant?.name}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                airServiceControl.idServiceItem, 
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
                              airServiceControl.idServiceItem,
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
                            value={detail?.origin?.placeOfReceipt}
                            className={styles.textInput}
                            required
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                airServiceControl.idServiceItem,
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
                            value={formatDateTimeLocal(detail?.origin?.plant?.arrivalDate)}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceFormData(
                                airServiceControl.idServiceItem,
                                detail.idDetail,
                                "origin",
                                {
                                  ...(detail.origin ?? {}),
                                  plant: {
                                    arrivalDate: e.target.value
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
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.idDetail}
                          data={detail?.departureDateAproximate || ''}
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
                            value={formatDateTimeLocal(detail?.origin?.plant?.departureDate)}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceFormData(
                                airServiceControl.idServiceItem,
                                detail.idDetail,
                                "origin",
                                {
                                  ...(detail.origin ?? {}),
                                  plant: {
                                    departureDate: e.target.value
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
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.idDetail}
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
                    toggleAccordion(`destination-${detail.idDetail}`)
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
                    <ChevronUp />
                  </span>
                </div>

                <div className={`${styles.accordionContent} ${!accordionOpen[`destination-${detail.idDetail}`] ? styles.collapsed : ""}`}>
                  <div className={styles.fourColumnGrid}>
                    
                    <div className={styles.firstColumn}>
                      {/*DESTINO */}
                      {/* Pais de descarga */}
                      <InputCountry
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
                            countryKey: country?.country_code ?? ""
                          }
                        }}
                        onChangeCountry={({ changes }) => {
                          onUpdateServiceDetail(
                            airServiceControl.idServiceItem,
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
                            value={detail?.destination?.plant?.name}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                airServiceControl.idServiceItem, 
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
                            itemService={airServiceControl.idServiceItem}
                            sequencedetail={detail.idDetail}
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
                      {[2, 3].includes(detail.idTypeShipment) ?
                        <InputAirport
                          type="destination"
                          airports={airportsDestination}
                          nameAirport={detail?.destination?.airport?.airport}
                          codeAirport={detail?.destination?.airport?.airportKey}
                          serviceIdItem={detail.idDetail}
                          label={t("operations.airportDischarge")}
                          groupClassName={styles.fieldGroup}
                          labelClassName={styles.fieldLabel}
                          inputClassName={styles.textInput}
                          onChangeAirport={(airport) => {
                            onUpdateServiceFormData(
                              airServiceControl.idServiceItem,
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
                            value={detail?.destination?.placeOfReceipt}
                            className={styles.textInput}
                            required
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                airServiceControl.idServiceItem,
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
                            value={detail?.destination}
                            className={styles.textInput}
                          />
                        </div>
                      )}

                    </div>

                    <div className={styles.thirdColumn}>
                      {/* ETA (Llegada estimada) */}
                      <div className={styles.fieldGroup}>
                        <ComponentDate
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.idDetail}
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
                            value={detail?.destination?.plant?.arrivalDate}
                            className={styles.textInput}
                            onChange={(e) =>
                              onUpdateServiceDetail(
                                airServiceControl.idServiceItem, 
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
                        <ComponentDate
                          itemService={airServiceControl.idServiceItem}
                          sequencedetail={detail.idDetail}
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
                        airServiceControl.idServiceItem,
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
