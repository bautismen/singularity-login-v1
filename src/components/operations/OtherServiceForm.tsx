import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "../../pages/Operations.module.css";
import { PricingControl } from "../../types/pricingControl";
import { OperationsFormData } from "../../hooks/useOperations";
import { TipoEnvio, TipoReferencia, TipoOperacion, Incoterm, Transportista, TipoUnidad, TipoRuta, TipoMovimeiento } from "../operations/component";

export interface OtherServiceFormProps {
  incoterms: any[];
  info: object;
  controlsData: PricingControl[];
  formData: OperationsFormData;
  onUpdateFormData: (changes: | Partial<OperationsFormData>
                              | ((prev: OperationsFormData) => Partial<OperationsFormData>)) => void;
  onUpdateServiceFormData: (idServiceItem: number,detailId: number,field: string, value: any ) => void;
}

export const OtherServiceForm: React.FC<OtherServiceFormProps> = ({
  incoterms,
  info,
  controlsData,
  formData,
  onUpdateFormData,
  onUpdateServiceFormData,
}) => {
  const { t } = useLanguage();
  const infoControlService = formData.Services?.find(
    (c) => c.idControl === info?.id && c.idServiceItem === info?.item
  );
   // console.log('otros',infoControlService, formData.Services)

  if (infoControlService) {
    
    return (
      <div className={styles.formRow}>
        <span key={infoControlService.idServiceItem} className={styles.serviceItem}>
          {infoControlService?.serviceDetail?.map((detail, index) => (

            <span key={index + 1} className={styles.serviceItem}>

              <div className={styles.serviceCard}>
                <h2 className='title'> Accesorio </h2>

                <div className={styles.fourColumnGrid}>

                  <div className={styles.firstColumn}>

                    {/* Tipo de envio */}
                    <div className={styles.fieldGroup}>
                      <TipoEnvio
                        itemService={infoControlService.idServiceItem}
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
                        itemService={infoControlService.idServiceItem}
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
                        itemService={infoControlService.idServiceItem}
                        sequencedetail={detail.sequence}
                        detail={detail}
                        onUpdateServiceFormData={onUpdateServiceFormData}
                        incoterms={incoterms}
                      />
                    </div>

                  </div>

                  <div className={styles.fourthColumn}>

                  </div>

                </div>

                <h2 className='title'> Origen / Destino </h2>

                <div className={styles.fourColumnGrid}>

                  <div className={styles.firstColumn}>

                    {/* Pais de carga */}
                    {/* <div className={styles.fieldGroup}>
                              <label className={styles.fieldLabel}>
                                Pais de carga
                                <input
                                  type="text"
                                  value={serv.orderService.origin.city}
                                  readOnly
                                  className={styles.textInput}
                                />
                              </label>
                            </div> */}

                    {/* Pais de descarga */}
                    {/* <div className={styles.fieldGroup}>
                              <label className={styles.fieldLabel}>
                                Pais de descarga
                                <input
                                  type="text"
                                  value={serv.orderService.destination.city}
                                  readOnly
                                  className={styles.textInput}
                                />
                              </label>
                            </div> */}

                  </div>

                  <div className={styles.secondColumn}>

                    {/* Lugar de recoleccion */}
                    {/* <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      Lugar de recoleccion
                      <input
                        type="text"
                        value={serv.orderService.incoterm}
                        className={styles.textInput}
                      />
                    </label>
                  </div> */}

                  </div>

                  <div className={styles.thirdColumn}>

                    {/* ETD (Salida estimada) */}
                    {/* <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      ETD (Salida estimada)
                      <input
                        type="datetime-local"
                        value={serv.orderService.departureDateAproximate}
                        className={styles.textInput}
                      />
                    </label>
                  </div> */}

                  </div>

                  <div className={styles.fourthColumn}>


                  </div>

                </div>

                {/* Observaciones del servicio*/}
                <div className="bg-surface-container-low px-6 -mt-10 -mb-3 py-5">
                  <label htmlFor="observations" className="block font-label-caps text-label-caps text-primary px-1 py-2 dark:text-white">
                    {t('operations.observations')}
                  </label>
                  <input
                    type="text"
                    id="observationsService"
                    name="observations"
                    value={infoControlService.observationsService}
                    onChange={(e) => updateFormData({ ...formData, Observations: e.target.value })} //setformata
                    className="min-h-[30px] w-full p-2 rounded-lg
                                    bg-transparent text-black dark:text-white
                                    border border-gray-300 dark:border-gray-700
                                    hover:border-[#14b8a6] hover:dark:border-[#14b8a6] 
                                    focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]
                                    outline-none appearance-none text-body-sm transition-colors"
                  />
                </div>
              </div>

              <div className={styles.serviceCard}>
                <h2 className='title'> Referencia aduanal </h2>

              </div>

              <div className={styles.serviceCard}>
                <h2 className='title'> Contenedor </h2>

              </div>

              <div className={styles.serviceCard}>
                <h2 className='title'> Mercancia </h2>

              </div>

            </span>

          ))}
        </span>
      </div>
    );

  }
  
};
