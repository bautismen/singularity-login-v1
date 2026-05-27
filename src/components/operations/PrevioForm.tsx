import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from '../../pages/Operations.module.css';
import { PricingControl } from '../../types/pricingControl';
import { OperationsFormData, } from '../../hooks/useOperations';

export interface PrevioFormProps {
 info: object, 
 controlsData: PricingControl[],
 formData: OperationsFormData,
 onUpdateFormData: (changes: Partial<OperationsFormData>) => void;
 onUpdateServiceFormData:(idServiceItem: number, detailId: number, field: string, value: any) => void;
}

export const PrevioForm : React.FC<PrevioFormProps> =({
    info,
    controlsData,
    formData, 
    onUpdateFormData,
    onUpdateServiceFormData
}) => {
     const { t } = useLanguage();
    const infoControlService = controlsData.filter(c => c.id === info.id).map(c => ({
        ...c,
        services: c.services?.filter(s => String(s.idServiceItem) === String(info.item))
    }));

    return(
        <div className={styles.formRow}>
          {infoControlService.map(infoControlS => (
            <span key={infoControlS.id} className={styles.serviceItem}>
              {infoControlS.services?.map(serv => (
                // serv.orderService?.map(otherservice => (
                  <span key={serv.orderService.idTypeShipment} className={styles.serviceItem}>
                    <div className={styles.serviceCard}>
                      <h2 className='title'> Previo </h2>
                      <div className={styles.fourColumnGrid}>
                        <div className={styles.firstColumn}>
                          {/* Proveedor */}
                          <div className={styles.fieldGroup}>
                            {/* <TipoEnvio detail={detail} updateService={updateService} /> */}
                            <label className={styles.fieldLabel}>
                              Proveedor
                              <input
                                type="text"
                                value={serv.orderService.Proveedor}
                                readOnly
                                className={styles.textInput}/>
                            </label>
                          </div>
                          {/* Referencia de envio */}
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>
                              Referencia de envio
                              <input
                                type="text"
                                value={serv.orderService.typeReference}
                                className={styles.textInput}
                              />
                            </label>
                          </div>                       
                        </div>                        
                      </div>

                      <h2 className='title'> Origen / Destino </h2>
                      <div className={styles.fourColumnGrid}>
                        <div className={styles.firstColumn}>
                          {/* Pais de carga */}
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>
                              Pais de carga
                              <input
                                type="text"
                                value={serv.orderService.origin.city}
                                readOnly
                                className={styles.textInput}/>
                            </label>
                          </div>

                          {/* Pais de descarga */}
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>
                              Pais de descarga
                              <input
                                type="text"
                                value={serv.orderService.destination.city}
                                readOnly
                                className={styles.textInput}/>
                            </label>
                          </div>
                        </div>

                        <div className={styles.secondColumn}>
                          {/* Puerto de carga */}
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>
                              Puerto de Carga
                              <input
                                type="text"
                                value={serv.orderService.incoterm}
                                className={styles.textInput}/>
                            </label>
                          </div>
                          {/* Puerto de descarga */}
                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>
                              Puerto de Descarga
                              <input
                                type="text"
                                value={serv.orderService.incoterm}
                                className={styles.textInput}/>
                            </label>
                          </div>
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
                          value={serv.orderService.comments}
                          onChange={(e) => onUpdateFormData({ ...formData, Observations: e.target.value })}
                          className="min-h-[30px] w-full p-2 rounded-lg
                                  bg-transparent text-black dark:text-white
                                  border border-gray-300 dark:border-gray-700
                                  hover:border-[#14b8a6] hover:dark:border-[#14b8a6] 
                                  focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]
                                  outline-none appearance-none text-body-sm transition-colors"/>
                      </div>
                    </div>

                    <div className={styles.serviceCard}>
                      <h2 className='title'> Contenedor </h2>
                    </div>

                    <div className={styles.serviceCard}>
                      <h2 className='title'> Mercancia </h2>
                    </div>

                  </span>
                // ))
              ))}
            </span>
          ))}
        </div>
    )

}