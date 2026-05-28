import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "../../pages/Operations.module.css";
import { PricingControl } from "../../types/pricingControl";
import { OperationsFormData } from "../../hooks/useOperations";
import { TipoEnvio, TipoReferencia, TipoOperacion, Incoterm, Transportista, TipoUnidad, TipoRuta, TipoMovimeiento } from "../operations/component";

export interface FreightFormProps {
  // Catálogos
  incoterms: any[];
  suppliers: any[];
  info: object;
  controlsData: PricingControl[];
  formData: OperationsFormData;
  onUpdateFormData: (changes: | Partial<OperationsFormData>
    | ((prev: OperationsFormData) => Partial<OperationsFormData>)) => void;
  onUpdateServiceFormData: (idServiceItem: number, detailId: number, field: string, value: any) => void;
  onUpdateServiceDetail: (idServiceItem: number, detailId: number, collection: string, field: string, value: any) => void;
}

export const FreightForm: React.FC<FreightFormProps> = ({
  incoterms,
  suppliers,
  info,
  controlsData,
  formData,
  onUpdateFormData,
  onUpdateServiceFormData,
  onUpdateServiceDetail,
}) => {
  const { t } = useLanguage();
  const infoControl = formData.Services?.find(
    (s) => s.idControl === info.id && s.idServiceItem === info.item,
  );
  //console.log('freight', infoControl, formData.Services)

  return (
    <div className={styles.formRow}>
      <span key={infoControl?.idServiceItem} className={styles.serviceItem}>
        {infoControl?.serviceDetail?.map((detail, index) => (
          <div key={detail.sequence || index}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4 bg-white dark:bg-[#1e293b]">
            {/* Header Card */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm dark:text-white">
                Card #{index + 1}
              </h3>
            </div>
            <span key={index + 1} className={styles.serviceItem}>

              <div className={styles.serviceCard}>
                <h2 className="title"> Envio </h2>

                <div className={styles.fourColumnGrid}>

                  <div className={styles.firstColumn}>

                    {/* Tipo de envío */}
                    <div className={styles.fieldGroup}>
                      <TipoEnvio
                        itemService={infoControl.idServiceItem}
                        sequencedetail={detail.sequence}
                        detail={detail}
                        onUpdateServiceFormData={onUpdateServiceFormData}
                      />
                    </div>

                    {/* Incoterm */}
                    <div className={styles.fieldGroup}>
                      <Incoterm
                        itemService={infoControl.idServiceItem}
                        sequencedetail={detail.sequence}
                        detail={detail}
                        onUpdateServiceFormData={onUpdateServiceFormData}
                        incoterms={incoterms}
                      />
                    </div>

                  </div>

                  <div className={styles.secondColumn}>

                    {/* Tipo de referencia */}
                    <div className={styles.fieldGroup}>
                      <TipoReferencia
                        itemService={infoControl.idServiceItem}
                        sequencedetail={detail.sequence}
                        detail={detail}
                        onUpdateServiceFormData={onUpdateServiceFormData}
                      />
                    </div>

                    {/* Tipo operación */}
                    <div className={styles.fieldGroup}>
                      <TipoOperacion
                        itemService={infoControl.idServiceItem}
                        sequencedetail={detail.sequence}
                        detail={detail}
                        onUpdateServiceFormData={onUpdateServiceFormData}
                      />
                    </div>

                  </div>

                  <div className={styles.thirdColumn}>

                    {/* Referencia de envio */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Referencia de envio
                        <input
                          type="text"
                          value={detail?.shippingReferenceNumber || ""}
                          className={styles.textInput}
                          onChange={(e) => onUpdateServiceFormData(
                            infoControl.idServiceItem,
                            detail.sequence,
                            'shippingReferenceNumber',
                            (e.target.value))} />
                      </label>
                    </div>

                    {/* Guia master */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Guia master
                        <input
                          type="text"
                          value={detail?.masterGuide}
                          onChange={(e) => onUpdateServiceFormData(
                            infoControl.idServiceItem,
                            detail.sequence,
                            'masterGuide',
                            (e.target.value))}
                          className={styles.textInput} />
                      </label>
                    </div>

                  </div>

                  <div className={styles.fourthColumn}>

                    {/* Envio referencia */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Envio referencia
                        <input
                          type="datetime-local"
                          value={detail?.shippingDate} //? new Date(detail.shippingDate).toISOString().slice(0, 16) : ''
                          onChange={(e) => onUpdateServiceFormData(
                            infoControl.idServiceItem,
                            detail.sequence,
                            'shippingDate',
                            (e.target.value))}
                          className={styles.textInput} />
                      </label>
                    </div>

                  </div>

                </div>

                <h2 className="title"> Transporte </h2>

                <div className={styles.fourColumnGrid}>

                  <div className={styles.firstColumn}>

                    {/* Transportista */}
                    <div className={styles.fieldGroup}>
                      <Transportista
                        itemService={infoControl.idServiceItem}
                        sequencedetail={detail.sequence}
                        transport={detail?.transport}
                        onUpdateServiceDetail={onUpdateServiceDetail}
                        transportista={suppliers.filter(s => s.status === 1 && [7, 32].includes(parseInt(s.sectorId)))}
                      />
                    </div>

                    {/* Guia/Tipo */}
                    {/* <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Guia/Tipo
                          <input
                            type="text"
                            value={shipment.typeOperation}
                            readOnly
                            className={styles.textInput}
                          />
                        </label>
                      </div> */}

                  </div>

                  <div className={styles.secondColumn}>

                    {/* Tipo de unidad */}
                    <div className={styles.fieldGroup}>
                      <TipoUnidad
                        itemService={infoControl.idServiceItem}
                        sequencedetail={detail.sequence}
                        transport={detail?.transport}
                        onUpdateServiceDetail={onUpdateServiceDetail}
                      />
                    </div>

                    {/* Tipo de movimiento */}
                    <div className={styles.fieldGroup}>
                      <TipoMovimeiento
                        itemService={infoControl.idServiceItem}
                        sequencedetail={detail.sequence}
                        transport={detail?.transport}
                        onUpdateServiceDetail={onUpdateServiceDetail}
                      />
                    </div>

                  </div>

                  <div className={styles.thirdColumn}>
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
                        itemService={infoControl.idServiceItem}
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

                <h2 className="title"> Origen / Destino </h2>

                <div className={styles.fourColumnGrid}>

                  <div className={styles.firstColumn}>
                   
                    {/* Pais de carga */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Pais de carga
                        <input
                          type="text"
                          value={detail?.origin?.country}
                          readOnly
                          className={styles.textInput}
                        />
                      </label>
                    </div>

                    {/* Llegada a planta */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Llegada a planta
                        <input
                          type="datetime-local"
                          value={detail?.origin}
                          className={styles.textInput}
                        />
                      </label>
                    </div>

                    {/* Pais de descarga */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Pais de descarga
                        <input
                          type="text"
                          value={detail?.destination?.city}
                          readOnly
                          className={styles.textInput}
                        />
                      </label>
                    </div>

                  </div>

                  <div className={styles.secondColumn}>
                    {/* Lugar de recoleccion */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Lugar de recoleccion
                        <input
                          type="text"
                          value={detail?.origin?.placeOfReceipt}
                          className={styles.textInput}
                        />
                      </label>
                    </div>

                    {/* Salida de planta */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Salida de planta
                        <input
                          type="datetime-local"
                          value={detail?.origin}
                          className={styles.textInput}
                        />
                      </label>
                    </div>

                    {/* Puerto de descarga */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Puerto de descarga
                        <input
                          type="text"
                          value={detail?.destination?.Port}
                          className={styles.textInput}
                        />
                      </label>
                    </div>
                  </div>

                  <div className={styles.thirdColumn}>
                    {/* ETD (Salida estimada) */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        ETD (Salida estimada)
                        <input
                          type="datetime-local"
                          value={detail.origin?.estimatedDepartureDateETD}
                          className={styles.textInput}
                        />
                      </label>
                    </div>

                    {/*  */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        .
                        <input
                          type="text"
                          value={detail?.origin}
                          className={styles.textInput}
                        />
                      </label>
                    </div>

                    {/* Planta */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Planta
                        <input
                          type="text"
                          value={detail.destination?.plant}
                          className={styles.textInput}
                        />
                      </label>
                    </div>
                  </div>

                  <div className={styles.fourthColumn}>
                    {/* Despacho / recoleccion */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Despacho / recoleccion
                        <input
                          type="datetime-local"
                          value={detail?.origin}
                          className={styles.textInput}
                        />
                      </label>
                    </div>

                    {/*  */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        .
                        <input
                          type="text"
                          value={detail.origin}
                          className={styles.textInput}
                        />
                      </label>
                    </div>

                    {/* ETA (Llegada estimada) */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        ETA (Llegada estimada)
                        <input
                          type="datetime-local"
                          value={detail?.destination?.arrivalDateATA}
                          className={styles.textInput}
                        />
                      </label>
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
        ))}
      </span>
    </div>
  );
};
