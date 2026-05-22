import React, {useRef, useEffect} from 'react';
import { Plus, Trash2, Bold, Italic, Underline, List, ListOrdered, Image } from 'lucide-react';
import { Service, Shipment, Cargo, ContainerRequest } from '../../types/requestQuotation';
import { Container } from '../../types/container';
import { InputCountry } from '../InputCountry';
import { ZipCodesOriginDestination } from './ZipCodesOriginDestination';
import { MerchandiseTable } from '../requestQuotation/MerchandiseTable';
import { ContainersModal } from '../requestQuotation/modals/ContainersModal';
import styles from '../../pages/Quotations.module.css';

// ─── Interfaz BASE ────────────────────────────────────────────────────────────
//
// Props mínimos que cualquier formulario de servicio debe recibir.
// WarehouseForm, ParcelForm, etc. extenderán esta interfaz con sus propios
// campos sin tocar ServiceCard.
//
export interface OrderBaseFormProps {
  availableServices: any[],
  service:          Service;
  mode:             'create' | 'edit' | 'view';
  idStatusRequest:  number;
  showProjection:   boolean;
  currentServiceId: number | null;
  // Handlers comunes a todos los formularios
  onUpdateService:    (id: number, changes: Record<string, any>) => void;
  onUpdateShipment:           (idServiceItem: number, idShipment: number, field: keyof Shipment, value: any) => void;
  onUpdateProjection:         (idServiceItem: number, idShipment: number, changes: Record<string, any>) => void;
  onProjectionStateChange:    (idServiceItem: number) => void;
  onUpdateServicesAssociated: (idServiceItem: number, idShipment: number, service: any) => void;
  onOpenMerchandiseModal:     (service: Service, cargo?: Cargo) => void;
  onRemoveMerchandise:        (idServiceItem: number, merchandise: Cargo) => void;
  t: (key: string) => string;
}

// ─── Interfaz ESPECÍFICA de flete ─────────────────────────────────────────────
//
// Extiende la base con lo que solo necesita el formulario de flete
// (marítimo FCL/LCL, aéreo, terrestre FTL/LTL/FCL/LCL).
//
export interface FreightShipmentFormProps extends OrderBaseFormProps {  
  // Catálogos
  incoterms: any[];
  countries: any[];
  // Contenedores
  availableContainers:        Container[];
  loadingContainers:          boolean;
  showContainersModal:        boolean;
  onOpenContainerModal:       (idServiceItem: number, containers: ContainerRequest[]) => void;
  onUpdateContainersShipment: (idServiceItem: number, idShipment: number, container: ContainerRequest) => void;
  onUpdateContainersQuantity: (idServiceItem: number, idShipment: number, idContainer: number, changes: Record<string, any>) => void;
  onCloseContainerModal:      () => void;
  // Handlers de ruta
  onUpdateOrigin:        (idServiceItem: number, changes: Record<string, any>, idShipment?: number,) => void;
  onUpdateDestination:   (idServiceItem: number, changes: Record<string, any>, idShipment?: number,) => void;
  onTypeOperationChange: (idServiceItem: number, idShipment: number, value: number, text: string) => void;
  onIncotermChange:      (idServiceItem: number, idShipment: number, value: number, text: string) => void;
  onTypeShipmentChange:  (idServiceItem: number, idShipment: number, value: number, text: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const FreightShipmentForm: React.FC<FreightShipmentFormProps> = ({
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
  // ── flete ──
  incoterms,
  countries,
  availableContainers,
  loadingContainers,
  showContainersModal,
  onOpenContainerModal,
  onUpdateContainersShipment,
  onUpdateContainersQuantity,
  onCloseContainerModal,
  onUpdateOrigin,
  onUpdateDestination,
  onTypeOperationChange,
  onIncotermChange,
  onTypeShipmentChange,
}) => {

  const shipment       = service.shipments?.[0];
  const isDisabled     = mode === 'view' || idStatusRequest >= 2;
  const usesContainers = [2, 3, 10].includes(service.idService);
  const formatDateForInput = (date: string) => date ? date.split('T')[0] : '';
  //utils para comentarios
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const currentComments = shipment?.comments ?? '';

    if (editorRef.current.innerHTML !== currentComments) {
      editorRef.current.innerHTML = currentComments;
    }
  }, [shipment?.idShipment, shipment?.comments]);

  const updateComments = () => {
    onUpdateShipment(
      service.idServiceItem,
      shipment?.idShipment ?? 0,
      'comments',
      editorRef.current?.innerHTML ?? ''
    );
  };

  const exec = (command: string) => {
    if (isDisabled) return;

    editorRef.current?.focus();
    document.execCommand(command, false);
    updateComments();
  };

  const openImagePicker = () => {
    if (isDisabled) return;
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

      const img = document.createElement('img');
      img.src = reader.result as string;
      img.style.maxWidth = '220px';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.margin = '8px 0';

      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

      if (range) {
        range.insertNode(img);
        range.collapse(false);
      } else {
        editor.appendChild(img);
      }

      updateComments();
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <>
      {/* ── Servicio / Operación / Incoterm / Tipo envío / Fecha ── */}
      <div className={styles.formGrid} >
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
              const newIdService = parseInt(e.target.selectedOptions[0].dataset.serviceId!)
              const isFreight = [1, 2, 3, 4, 5, 10, 11].includes(newIdService);
              onUpdateService(
                service.idServiceItem, 
                {
                  idService: newIdService,
                  nameService: e.target.value,
                  ...isFreight ? 
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
                    orderService: {
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
            <span className={styles.required}>*</span>
            {t('quote.operation')}
          </label>
          <select
            value={service.shipments?.[0]?.idTypeOperation}
            className={styles.select}
            disabled={isDisabled}
            required
            onChange={(e) =>
              onTypeOperationChange(
                service.idServiceItem, 
                service.shipments?.[0]?.idShipment ?? 1,
                Number(e.target.value),
                e.target.options[e.target.selectedIndex].text
              )
            }
          >
            <option value="">{t('quote.select')}</option>
            <option value={1}>{t('quote.import')}</option>
            <option value={2}>{t('quote.export')}</option>
            <option value={3}>{t('quote.national')}</option>
            <option value={4}>{t('quote.localUSA')}</option>
            <option value={5}>{t('quote.Triangulacion')}</option>
          </select>
        </div>
        {/* Incoterm */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.required}>*</span>
            {t('quote.incoterm')}
          </label>
          <select
            value={shipment?.idIncoterm}
            className={styles.select}
            disabled={isDisabled}
            required
            onChange={(e) =>
              onIncotermChange(
                service.idServiceItem, 
                shipment?.idShipment ?? 0,
                Number(e.target.value),
                e.target.options[e.target.selectedIndex].text
              )
            }
          >
            <option value="">{t('quote.select')}</option>
            {incoterms.map((inc) => (
              <option key={inc._Id} value={inc._Id}>{inc.incoterm}</option>
            ))}
          </select>
        </div>
        {/* Tipo envio*/}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.required}>*</span>
            {t('quote.shippingType')}
          </label>
          <select
            value={shipment?.idTypeShipment}
            className={styles.select}
            disabled={isDisabled}
            required
            onChange={(e) =>
              onTypeShipmentChange(
                service.idServiceItem, 
                shipment?.idShipment ?? 1,
                Number(e.target.value),
                e.target.options[e.target.selectedIndex].text
              )
            }
          >
            <option value="">{t('quote.select')}</option>
            <option value={1}>{t('quote.doorToDoor')}</option>
            <option value={2} disabled={[3, 4, 10, 11].includes(service.idService)}>
              {t('quote.portToPort')}
            </option>
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
            value={formatDateForInput(shipment?.departureDateAproximate || "")}
            disabled={isDisabled}
            onChange={(e) =>{
               onUpdateShipment(
                service.idServiceItem, 
                shipment?.idShipment ?? 1,
                "departureDateAproximate",
                e.target.value
                ) 
            }}       
          />
        </div>
      </div>

      {/* ── País origen / destino ── */}
      <div className={styles.formGrid} style={{ marginTop: '1.25rem' }}>

        <InputCountry 
        type="origin"
        countries={countries}
        shipment={shipment}
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
        shipment={shipment}
        serviceIdItem={service.idServiceItem}
        isDisabled={isDisabled}
        required
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
            className={styles.select}
            value={originCountyText}            
            disabled={isDisabled}
            required
            placeholder={t('quote.select')}
            onChange={(e) => {        
              setErrorForm('');        
              const countrySelected = countries.find((c) => c.name_country  === e.target.value);             
              onUpdateOrigin(
                service.idServiceItem, 
                {
                  idCountry:    countrySelected?._Id,
                  countryCode: countrySelected?.country_code //e.target.selectedOptions[0].dataset.countryCode,
                },
                shipment?.idShipment,);
              originCountyText = e.target.value;  
             }               
            }
            onBlur={(e) => {                            
              const exist = countries.some(
                (c) => c.name_country === e.target.value
              );
              if (exist === false) {
                originCountyText = ""
                setErrorForm("Selecciona un pais valido de la lista");
              }
              console.log('Blur',exist, originCountyText);
              // opcional: limpiar o resetear              
            }}
          />
            <datalist id='countries'>
              {countries.map((country) => (                
                <option key={country._Id} value={country.name_country} >
                  {country.name_country} ({country.country_code})
                </option>
              ))}
            </datalist>      
            {errorForm && (
              <div className={styles.fieldError}>{errorForm}</div>
            )}                

        </div> 

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.required}>*</span>
            {t('quote.destination')}
          </label>
          <input
            list="countries"
            className={styles.select}
            value={destinationCountryText}            
            disabled={isDisabled}
            required
            placeholder={t('quote.select')}
            onChange={(e) => {
              const countrySelected = countries.find((c) => c.name_country  === e.target.value);             

              onUpdateDestination(
                service.idServiceItem,  
                {
                  idCountry:   countrySelected?._Id,
                  countryCode: countrySelected?.country_code,
                },
                shipment?.idShipment)
              destinationCountryText = e.target.value;  
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
        </div>*/}
      </div> 

      {/* ── Ciudad / Puerto / Aeropuerto ── */}
      <div style={{ marginTop: '1.25rem' }}>
        <ZipCodesOriginDestination
          service={service}
          mode={mode}
          idStatusRequest={idStatusRequest}
          destinationRequired={true}
          onUpdateOrigin={onUpdateOrigin}
          onUpdateDestination={onUpdateDestination}
          t={t}
        />
      </div>

      {/* ── Contenedores ── */}
      {usesContainers && (
        <div style={{ marginTop: '1.25rem' }}>
          <label className={styles.label}>{t('quote.containers')}</label>
          <div className={styles.executivesCard}>
            <div className={styles.executivesList}>
              {shipment?.containers?.map((container) => (
                <div key={container.idContainer} className={styles.itemSimpleList}>
                  <div className={styles.formGroupElementsInline}>

                    <div className={styles.formGroup}>
                      <span className={styles.executiveLabel}>{t('quote.container')}</span>
                      <span className={styles.executiveNameSimple}>{container.nameTypeContainer}</span>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t('quote.quantity')}</label>
                      <input
                        type="number" min="1" step="1"
                        className={styles.input} style={{ width: '80px' }}
                        onInput={(e) => { e.currentTarget.value = e.currentTarget.value.slice(0, 9); }}
                        onKeyDown={(e) => { if (['.', '-', 'e'].includes(e.key)) e.preventDefault(); }}
                        value={container.quantity}
                        disabled={isDisabled}
                        onChange={(e) =>
                          onUpdateContainersQuantity(service.idServiceItem, 1, container.idContainer || 1,
                            { quantity: parseInt(e.target.value) })
                        }
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t('quote.totalVolume')}</label>
                      <input
                        type="number" className={styles.input}
                        onKeyDown={(e) => {
                          if (['-', 'e'].includes(e.key)) e.preventDefault();
                          if (e.currentTarget.value.length >= 7 && !['Backspace', 'Delete'].includes(e.key)) e.preventDefault();
                        }}
                        value={container.volumeTotal} disabled={isDisabled}
                        onChange={(e) => {
                          if (e.target.value === '' || Number(e.target.value) > 0)
                            onUpdateContainersQuantity(service.idServiceItem, 1, container.idContainer || 1,
                              { volumeTotal: Number(e.target.value) });
                        }}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t('quote.unitVolume')}</label>
                      <select
                        value={container.idUnitVolume} className={styles.select} disabled={isDisabled}
                        onChange={(e) =>
                          onUpdateContainersQuantity(service.idServiceItem, 1, container.idContainer || 1, {
                            idUnitVolume: parseInt(e.target.value),
                            unitVolume:   e.target.options[e.target.selectedIndex].text,
                          })
                        }
                      >
                        <option value="">{t('quote.selectOption')}</option>
                        <option value={1}>CBM</option>
                        <option value={2}>CFT</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t('quote.totalWeight')}</label>
                      <input
                        type="number" className={styles.input}
                        onKeyDown={(e) => {
                          if (['-', 'e'].includes(e.key)) e.preventDefault();
                          if (e.currentTarget.value.length >= 7 && !['Backspace', 'Delete'].includes(e.key)) e.preventDefault();
                        }}
                        value={container.weigthTotal} disabled={isDisabled}
                        onChange={(e) => {
                          if (e.target.value === '' || Number(e.target.value) > 0)
                            onUpdateContainersQuantity(service.idServiceItem, 1, container.idContainer || 1,
                              { weigthTotal: Number(e.target.value) });
                        }}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t('quote.unitWeight')}</label>
                      <select
                        value={container.idUnitWeight} className={styles.select} disabled={isDisabled}
                        onChange={(e) =>
                          onUpdateContainersQuantity(service.idServiceItem, 1, container.idContainer || 1, {
                            idUnitWeight: parseInt(e.target.value),
                            unitWeight:   e.target.options[e.target.selectedIndex].text,
                          })
                        }
                      >
                        <option value="">{t('quote.selectOption')}</option>
                        <option value={1}>KGS</option>
                        <option value={2}>LBS</option>
                        <option value={3}>Toneladas</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <button
                        type="button" className={styles.removeIconButton}
                        title={t('quote.delete')} disabled={isDisabled}
                        onClick={() => onUpdateContainersShipment(service.idServiceItem, 1, container)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            <button
              type="button" className={styles.addExecutiveButton} disabled={isDisabled}
              onClick={() => onOpenContainerModal(service.idServiceItem, shipment?.containers || [])}
            >
              <Plus size={16} />
              {t('quote.container')}
            </button>
          </div>
        </div>
      )}

      {/* ── Modal contenedores ── */}
      {showContainersModal && currentServiceId === service.idServiceItem && (
        <ContainersModal
          availableContainers={availableContainers}
          containersInShipment={shipment?.containers || []}
          loading={loadingContainers}
          onAdd={(container) => onUpdateContainersShipment(service.idServiceItem, 1, container)}
          onClose={onCloseContainerModal}
          t={t}
        />
      )}

      {/* ── Servicios asociados ── */}
      <div style={{ marginTop: '1.25rem' }}>
        <label className={styles.label}>{t('quote.associatedServices')}</label>
        <div className={styles.associatedServices}>
          {[
            { id: 12, name: 'Seguro',          label: t('quote.insurance')           },
            { id: 13, name: 'Maniobra',         label: t('quote.maneuver')            },
            { id: 15, name: 'Custodia',         label: t('quote.custody')             },
            { id: 14, name: 'Inspección',       label: t('quote.inspection')          },
            { id: 7,  name: 'Despacho',         label: t('quote.customsClearance')    },
            { id: 6,  name: 'Almacén',          label: t('quote.warehouse')           },
            { id: 8,  name: 'Paquetería',       label: t('quote.parcelService')       },
            { id: 9,  name: 'UVA',              label: 'UVA'                          },
            { id: 16, name: 'Free Hand',        label: 'Free Hand'                    },
            { id: 17, name: 'Previo en origen', label: t('quote.PreInspectionOrigin') },
          ].map((svc) => (
            <button
              key={svc.id} type="button"
              className={`${styles.serviceChip} ${
                shipment?.servicesAsociated?.some(s => s.idServiceAsociated === svc.id) ? styles.selected : ''
              }`}
              disabled={isDisabled}
              onClick={() =>
                onUpdateServicesAssociated(
                  service.idServiceItem, 
                  shipment?.idShipment ?? 0, 
                  {
                  idServiceAsociated:   svc.id,
                  serviceAsociatedName: svc.name,
                  }
                )
              }
            >
              <span>{svc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Comentarios ── */}
      <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
        <label className={styles.label}>{t('quote.comments')}</label>

        <div className={styles.editorToolbar}>
          <button type="button" disabled={isDisabled} onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}>
            <Bold size={16} />
          </button>

          <button type="button" disabled={isDisabled} onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}>
            <Italic size={16} />
          </button>

          <button type="button" disabled={isDisabled} onMouseDown={(e) => { e.preventDefault(); exec('underline'); }}>
            <Underline size={16} />
          </button>

          <button type="button" disabled={isDisabled} onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }}>
            <List size={16} />
          </button>

          <button type="button" disabled={isDisabled} onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList'); }}>
            <ListOrdered size={16} />
          </button>

          <button type="button" disabled={isDisabled} onClick={openImagePicker}>
            <Image size={16} />
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
        </div>          

        <div
          ref={editorRef}
          contentEditable={!isDisabled}
          className={styles.textarea}
          suppressContentEditableWarning
          onInput={updateComments}
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
                required value={shipment?.projectionShipment?.frecuency}
                className={styles.select} disabled={isDisabled}
                onChange={(e) =>
                  onUpdateProjection(service.idServiceItem, shipment?.idShipment ?? 0, { frecuency: e.target.value })
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
                value={shipment?.projectionShipment?.number}
                disabled={isDisabled}
                onKeyDown={(e) => {
                  if (['-', 'e'].includes(e.key)) e.preventDefault();
                  if (e.currentTarget.value.length >= 7 && !['Backspace', 'Delete'].includes(e.key)) e.preventDefault();
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || Number(value) > 0)
                    onUpdateProjection(service.idServiceItem, shipment?.idShipment ?? 0, { number: Number(value) });
                }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('quote.unit')}</label>
              <select
                required value={shipment?.projectionShipment?.idTypeMesurementFrecuency}
                className={styles.select} disabled={isDisabled}
                onChange={(e) =>
                  onUpdateProjection(service.idServiceItem, 
                    shipment?.idShipment ?? 0, 
                    {
                    idTypeMesurementFrecuency: parseInt(e.target.value),
                    measurementFrecuency:      e.target.options[e.target.selectedIndex].text,
                    }
                  )
                }
              >
                <option value="">{t('quote.select')}</option>
                <option value={1}>{t('quote.kilos')}</option>
                <option value={2}>{t('quote.tons')}</option>
                <option value={3}>{t('quote.containers')}</option>
              </select>
            </div>

          </div>
        )}
      </div>

      {/* ── Mercancia ── */}
      <MerchandiseTable
        service={service}
        cargo={shipment?.cargo ?? []}
        mode={mode}
        idStatusRequest={idStatusRequest}
        onOpenMerchandiseModal={onOpenMerchandiseModal}
        onRemoveMerchandise={onRemoveMerchandise}
        t={t}
      />   
    </>
  );
};

export default FreightShipmentForm;