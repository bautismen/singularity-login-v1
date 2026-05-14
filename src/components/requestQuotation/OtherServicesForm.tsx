import React, { useState } from 'react';
import {OrderBaseFormProps} from "./FreightServiceForm"
import { MerchandiseTable } from '../requestQuotation/MerchandiseTable';
import {InputCountry } from '../InputCountry'
import { ZipCodesOriginDestination } from './ZipCodesOriginDestination';
import styles from '../../pages/Quotations.module.css';

/**
 * Formulario generico para otros servicios (no fletes). Posteriormente se puede hacer formulario especifico por servicio. 
 */
export interface OtherServicesFormProps extends OrderBaseFormProps {  
  //catalogos
  countries: any[];
  // Handlers de ruta
  onUpdateOrigin:        (idServiceItem: number,  changes: Record<string, any>) => void;
  onUpdateDestination:   (idServiceItem: number,  changes: Record<string, any>) => void;
  onTypeOperationChange: (idServiceItem: number, idShipment: number, value: number, text: string) => void;
  onTypeShipmentChange:  (idServiceItem: number, idShipment: number, value: number, text: string) => void;
  onUpdateOrderService:  (idServiceItem: number, changes: Record<string, any>) => void;
}

export const OtherServicesForm: React.FC<OtherServicesFormProps> = ({
  // ── base ──
  availableServices,
  service,
  mode,
  idStatusRequest,
  showProjection,
  currentServiceId,
  onUpdateService,
  onUpdateShipment,
  onUpdateProjection,
  onProjectionStateChange,
  onUpdateServicesAssociated,
  onOpenMerchandiseModal,
  onRemoveMerchandise,
  t,
  //otros servicios
  countries,  
  onUpdateOrigin,
  onUpdateDestination,
  onTypeOperationChange,
  onTypeShipmentChange,
  onUpdateOrderService,
}) => {

  const orderService       = service.orderService;
  const isDisabled = mode === 'view' || idStatusRequest >= 2;
  const formatDateForInput = (date: string) => date ? date.split('T')[0] : '';
  const [showAirports, setShowAirports] = useState(!!(orderService?.origin?.airportCode || orderService?.destination?.airportCode)) 


  return (
    <>
      <div className={styles.formGrid}>
        {/* Tipo de servicio — siempre primer campo */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.required}>*</span>
            {t('quote.serviceType')}
          </label>
          <select
            value={service.nameService}
            className={styles.select}
            disabled={isDisabled}
            required
            onChange={(e) => {
              const newIdService = parseInt(e.target.selectedOptions[0].dataset.serviceId!);
              const isFreight = [1, 2, 3, 4, 5, 10, 11].includes(newIdService);
              onUpdateService(
                service.idServiceItem, 
                {
                  idService:   newIdService,
                  nameService: e.target.value,
                  ...(isFreight ? 
                    {
                      shipments: [{
                      idShipment: 1,
                      origin: '',
                      destination: '',
                      idTypeShipment: 0,
                      typeShipment: '',
                      idTypeOperation: 0,
                      typeOperation: '',
                      idIncoterm: 0,
                      incoterm: '',
                      departureDateAproximate: '',
                      projectionShipment: '',
                      comments: '',
                      servicesAsociated: [],
                      cargo: [] 
                      }],
                      orderService: undefined
                    } : 
                    {
                      orderService: 
                      {
                        origin:                  {},
                        destination:             null,
                        idTypeShipment:          0,
                        typeShipment:            '',
                        idTypeOperation:         0,
                        typeOperation:           '',
                        departureDateAproximate: '',
                        projectionShipment:      null,
                        comments:                '',
                        cargo:                   [],
                      },
                      shipments: undefined
                    }
                  )                  
                }
              )
            }            
          }>
          <option value="">{t('quote.select')}</option>
            {availableServices.map((service) => (
            <option key={service._Id} value={service.service_name} data-service-id={service._Id}>
                {service.service_name}
            </option>
            ))}            
          </select>
        </div>

        {/* Tipo de operacion  */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {t('quote.operation')}
          </label>
          <select
            value={orderService?.idTypeOperation ?? ""}
            className={styles.select}
            disabled={isDisabled}
            onChange={(e) => {
              onUpdateOrderService(
                service.idServiceItem, 
                {
                  idTypeOperation: Number(e.target.value),
                  typeOperation: e.target.options[e.target.selectedIndex].text
                }
              )}
            }>
            <option value="">{t('quote.select')}</option>
            <option value={1}>{t('quote.import')}</option>
            <option value={2}>{t('quote.export')}</option>
            <option value={3}>{t('quote.national')}</option>
            <option value={4}>{t('quote.localUSA')}</option>
            <option value={5}>{t('quote.Triangulacion')}</option>
          </select>
        </div>      

         {/* Tipo envio*/}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {t('quote.shippingType')}
          </label>
          <select
            value={orderService?.idTypeShipment}
            className={styles.select}
            disabled={isDisabled}
            onChange={(e) =>   
              onUpdateOrderService(
                service.idServiceItem,
                { 
                  idTypeShipment: Number(e.target.value),
                  typeShipment: e.target.options[e.target.selectedIndex].text
                }
              )
            }>
            <option value="">{t('quote.select')}</option>
            <option value={1}>{t('quote.doorToDoor')}</option>
            <option value={2} disabled={[3, 4, 10, 11].includes(service.idService)}>{t('quote.portToPort')}</option>
            <option value={3}>{t('quote.doorToPort')}</option>
            <option value={4}>{t('quote.portToDoor')}</option>
          </select>
        </div>

         {/* Fecha salida esperada */}
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('quote.expectedDeparture')}</label>
          <input
            type="date" 
            className={styles.input}
            onKeyDown={(e) => e.preventDefault()}
            min={mode === 'create' ? new Date().toISOString().split('T')[0] : undefined}
            value={formatDateForInput(orderService?.departureDateAproximate || '')}
            disabled={isDisabled}
            onChange={(e) =>
              onUpdateOrderService(
                service.idServiceItem,
                {departureDateAproximate: e.target.value}
              )
            }
          />
        </div>
      </div>
           
      {/* ── País origen / destino ── */}
      <div className={styles.formGrid} style={{ marginTop: '1.25rem' }}>
        <InputCountry 
        type="origin"
        countries={countries}    
        orderService={orderService}
        serviceIdItem={service.idServiceItem}
        isDisabled={isDisabled}
        required
        placeholder={t("quote.select")}
        label={t("quote.origin")}
        onUpdateLocation={onUpdateOrigin}
        />

        <InputCountry 
        type="destination"
        countries={countries}
        orderService={orderService}
        serviceIdItem={service.idServiceItem}
        isDisabled={isDisabled}
        required= {false}
        placeholder={t("quote.select")}
        label={t("quote.destination")}
        onUpdateLocation={onUpdateDestination}
        />
        
        {/*<div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.required}>*</span>
            {t('quote.origin')}
          </label>
          <input
            list="countries"
            value={originCountyText}
            className={styles.select}
            disabled={isDisabled}
            required
            placeholder={t('quote.select')}
            onChange={(e) => {
              const countrySelected = countries.find((c) => c.name_country  === e.target.value);             

              onUpdateOrderService(
                service.idServiceItem,
                {
                  origin: {
                    idCountry:   countrySelected?._Id,
                    countryCode: countrySelected?.country_code,
                  }                
                })
                originCountyText = e.target.value;
              }              
            }
            onBlur={(e) => {
              const exist = countries.some(
                (c) => c.name_country === e.target.value
              );
              if (exist === false) {
                originCountyText = ""
              }
            }
            }
            />
            <datalist id='countries'>
              {countries.map((country) => (
                <option key={country._Id} value={country.name_country} data-country-code={country.country_code}>
                  {country.name_country} ({country.country_code})
                </option>
              ))}
            </datalist>            
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>           
            {t('quote.destination')}
          </label>
          <input
            list="countries"
            value={destinationCountryText}
            className={styles.select}
            disabled={isDisabled}
            placeholder={t('quote.select')}
            onChange={(e) => {
              const countrySelected = countries.find((c) => c.name_country  === e.target.value);             

              onUpdateOrderService(
                service.idServiceItem, 
                {
                  destination: {
                    idCountry:   countrySelected?._Id,
                    countryCode: countrySelected?.country_code,
                  }                
                }
              )}
            }
          />
          <datalist id='countries'>
            {countries.map((country) => (
              <option key={country._Id} value={country.name_country} data-country-code={country.country_code}>
                {country.name_country} ({country.country_code})
              </option>
            ))}
          </datalist>            
        </div> */}
      </div>

       {/* ── Checkbox para mostrar puertos o aeropuertos en los Otros Servicios ── */}
       {[2,3,4].includes(service.orderService?.idTypeShipment || 0) && 
        (
          <div className={styles.frequencyHeader} style={{ marginTop: '1.25rem' }} >
          <input
            type="checkbox"
            id={`traffic-${service.idServiceItem}`}
            checked={showAirports}
            className={styles.checkbox}
            disabled={isDisabled}
            onChange={() => setShowAirports(!showAirports)}
          />
          <label className={styles.checkboxLabel}>
          Aeropuertos
          </label>
        </div>
        )
       }
      
      {/* ── Ciudad / Puerto / Aeropuerto ── */}
      <div style={{ marginTop: '1.25rem' }}>
        <ZipCodesOriginDestination
          service={service}
          mode={mode}
          idStatusRequest={idStatusRequest}
          destinationRequired={false}
          showAirportsOrderService={showAirports}
          onUpdateOrigin={onUpdateOrigin}
          onUpdateDestination={onUpdateDestination}
          t={t}
        />
      </div>

      {/* ── Comentarios ── */}
      <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
        <label className={styles.label}>{t('quote.comments')}</label>
        <textarea
          maxLength={500} className={styles.textarea} rows={3}
          value={orderService?.comments} disabled={isDisabled}
          onChange={(e) =>
            onUpdateOrderService(
              service.idServiceItem, 
              { comments: e.target.value }
            )
          }
        />
      </div>

      {/* ── Proyección ── */}
      <div style={{ marginTop: '1.25rem' }}>
        <div className={styles.frequencyHeader}>
          <input
            type="checkbox"
            id={`freq-${service.idServiceItem}`}
            checked={showProjection}
            className={styles.checkbox}
            disabled={isDisabled}
            onChange={() => onProjectionStateChange(service.idServiceItem)}
          />
          <label htmlFor={`freq-${service.idServiceItem}`} className={styles.checkboxLabel}>
            {t('quote.programFrequency')}
          </label>
        </div>

        {showProjection && (
          <div className={styles.frequencyGrid}>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('quote.frequencyPeriod')}</label>
              <select
                required value={orderService?.projectionShipment?.frecuency}
                className={styles.select} disabled={isDisabled}
                onChange={(e) => {
                  console.log(orderService)
                  onUpdateOrderService(
                    service.idServiceItem, 
                    { projectionShipment : {
                        ...orderService?.projectionShipment,
                        frecuency: e.target.value 
                      }
                    }
                  )
                }
                }
              >
                <option value="">{t('quote.select')}</option>
                <option value="Semanal">{t('quote.weekly')}</option>
                <option value="Mensual">{t('quote.monthly')}</option>
                <option value="Anual">{t('quote.yearly')}</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('quote.quantity')}</label>
              <input
                required type="number" min="0" step="any"
                className={styles.input}
                value={orderService?.projectionShipment?.number}
                disabled={isDisabled}
                onKeyDown={(e) => {
                  if (['-', 'e'].includes(e.key)) e.preventDefault();
                  if (e.currentTarget.value.length >= 7 && !['Backspace', 'Delete'].includes(e.key)) e.preventDefault();
                }}
                onChange={(e) => {
                  const value = e.target.value;                 
                  if (value === '' || Number(value) > 0)
                    onUpdateOrderService(
                    service.idServiceItem, 
                    { projectionShipment: { 
                        ...orderService?.projectionShipment,
                        number: Number(value) 
                      }
                    })
                }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('quote.unit')}</label>
              <select
                required value={orderService?.projectionShipment?.idTypeMesurementFrecuency}
                className={styles.select} disabled={isDisabled}
                onChange={(e) =>
                  onUpdateOrderService(
                    service.idServiceItem, 
                    { projectionShipment: {
                      ...orderService?.projectionShipment,
                      idTypeMesurementFrecuency: parseInt(e.target.value),
                      measurementFrecuency:      e.target.options[e.target.selectedIndex].text
                      }
                    })
                }>
                <option value="">{t('quote.select')}</option>
                <option value={1}>{t('quote.kilos')}</option>
                <option value={2}>{t('quote.tons')}</option>
                <option value={3}>{t('quote.containers')}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Tabla de mercancía ── */}
      <MerchandiseTable
        service={service}
        cargo ={orderService?.cargo}
        mode={mode}
        idStatusRequest={idStatusRequest}
        onOpenMerchandiseModal={onOpenMerchandiseModal}
        onRemoveMerchandise={onRemoveMerchandise}
        t={t}/>


    </>
  );
};