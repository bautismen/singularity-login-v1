import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, RefreshCw, Trash2, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { quotationService } from '../services/quotationService';
import { pricingControlService } from '../services/pricingControlService';
import { PricingControlSupplier } from '../types/pricingControl';
import styles from './ControlsPricing.module.css';
import { useAuth } from '../contexts/AuthContext';

interface ControlsPricingFormProps {
  requestId: string | null;
  controlId?: string;
  onBack: () => void;
}

export function ControlsPricingForm({ requestId, controlId, onBack }: ControlsPricingFormProps) {
  const { t } = useLanguage();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState<any>(null);
  const [controlData, setControlData] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);

  const [suppliers, setSuppliers] = useState<PricingControlSupplier[]>([
    { idsuplier: 1, supplier_associated_name: 'Proveedor 1' }
  ]);

  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [expandedServices, setExpandedServices] = useState<Set<number>>(new Set());
  const { user } = useAuth();
  const [statusControl, setStatusControl] = useState({
    _id_status_control: 4,
    status_control_name: 'Asignada'
  });

  const [generalData, setGeneralData] = useState({
    network: 'WTC Alliance',
    complexity: 'Media',
    currency: 'USD',
    unit_profit: '',
    volume: '',
    general_profit: '',
    key_td: 'CI',
    comments_general: '',
    id_executive_pricing: user?._id || '',
    complete_name_pricing: user?.name || ''
  });

  const [priority, setPriority] = useState(false);
  const [bidding, setBidding] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    loadCountries();
  }, [requestId, controlId]);

  const loadCountries = async () => {
    try {
      const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const BASE_URL = import.meta.env.VITE_SUPABASE_URL;

      const response = await fetch(`${BASE_URL}/functions/v1/catalog-countries`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const countriesData = await response.json();
      setCountries(countriesData.filter((c: any) => c.status === 1));
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    if (!requestId) return;

    try {
      setLoading(true);

      if (controlId) {
        const control = await pricingControlService.getById(controlId);
        setControlData(control);
        setSuppliers(control.suppliers || []);
        setSelectedServices(control.services || []);
        setStatusControl(control.status_control);
        setGeneralData({
          network: control.network || 'WTC Alliance',
          complexity: control.complexity || 'Media',
          currency: control.currency || 'USD',
          unit_profit: control.unit_profit || '',
          volume: control.volume || '',
          general_profit: control.general_profit || '',
          key_td: control.key_td || 'CI',
          comments_general: control.comments_general || '',
          id_executive_pricing: control._id_executive_pricing || '',
          complete_name_pricing: control.complete_name_pricing || ''
        });

        const request = await quotationService.getById(control._idrequest);
        setRequestData(request);
        setPriority(request.priority === 1);
        setBidding(request.bidding === 1);

        const expandedIds = new Set(control.services?.map((s: any) => s.idservice) || []);
        setExpandedServices(expandedIds);
      } else {
        const request = await quotationService.getById(requestId);
        setRequestData(request);
        setPriority(request.priority === 1);
        setBidding(request.bidding === 1);

        setSelectedServices([]);

        const allServiceIds = new Set(request.services?.map((s: any) => s.id_service_item || s.idservice || s._id) || []);
        setExpandedServices(allServiceIds);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const addSupplier = () => {
    const nextId = suppliers.length > 0
      ? Math.max(...suppliers.map(s => s.idsuplier)) + 1
      : 1;
    setSuppliers([...suppliers, {
      idsuplier: nextId,
      supplier_associated_name: `Proveedor ${nextId}`
    }]);
  };

  const removeSupplier = (id: number) => {
    setSuppliers(suppliers.filter(s => s.idsuplier !== id));
  };

  const updateSupplier = (id: number, name: string) => {
    setSuppliers(suppliers.map(s =>
      s.idsuplier === id ? { ...s, supplier_associated_name: name } : s
    ));
  };

  const toggleService = (serviceId: number) => {
    const service = requestData.services.find((s: any) =>
      (s.id_service_item || s.idservice || s._id) === serviceId
    );
    if (!service) return;

    const isSelected = selectedServices.some(s => s.idservice === serviceId);

    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.idservice !== serviceId));
    } else {
      setSelectedServices([...selectedServices, { ...service, idservice: serviceId }]);
    }
  };

  const toggleServiceExpanded = (serviceId: number) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedServices(newExpanded);
  };

  const handleSave = async () => {
    if (!requestId) return;

    if (selectedServices.length === 0) {
      showError('Debe seleccionar al menos un servicio');
      return;
    }

    try {
      setLoading(true);

      const servicesData = selectedServices.map(s => {
        const serviceCopy = { ...s };
        if (serviceCopy.merchandise) {
          delete serviceCopy.merchandise;
        }
        if (!serviceCopy.idservice) {
          serviceCopy.idservice = serviceCopy._id;
        }
        return serviceCopy;
      });

      console.log('Saving control with data:', {
        _idrequest: requestId,
        suppliers,
        servicesCount: servicesData.length,
        status_control: statusControl,
        network: generalData.network,
        complexity: generalData.complexity,
        currency: generalData.currency,
        volume: generalData.volume,
        _id_executive_pricing: generalData.id_executive_pricing,
        complete_name_pricing: generalData.complete_name_pricing
      });

      const dataToSave = {
        suppliers,
        services: servicesData,
        status_control: statusControl,
        network: generalData.network,
        complexity: generalData.complexity,
        currency: generalData.currency,
        unit_profit: generalData.unit_profit,
        volume: generalData.volume,
        general_profit: generalData.general_profit,
        key_td: generalData.key_td,
        comments_general: generalData.comments_general,
        _id_executive_pricing: generalData.id_executive_pricing,
        complete_name_pricing: generalData.complete_name_pricing
      };

      if (controlId) {
        await pricingControlService.update({
          _id: controlId,
          ...dataToSave
        });
        showSuccess('Control de pricing actualizado exitosamente');
      } else {
        await pricingControlService.create({
          _idrequest: requestId,
          ...dataToSave
        });
        showSuccess('Control de pricing creado exitosamente');
      }

      onBack();
    } catch (error: any) {
      console.error('Error saving control:', error);
      showError(error.message || 'Error al guardar el control de pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!controlId) return;

    if (!confirm('¿Está seguro de eliminar este control de pricing?')) return;

    try {
      setLoading(true);
      await pricingControlService.delete(controlId);
      showSuccess('Control de pricing eliminado exitosamente');
      onBack();
    } catch (error) {
      console.error('Error deleting control:', error);
      showError('Error al eliminar el control de pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsQuoted = async () => {
    if (!controlId) return;

    try {
      setLoading(true);
      await pricingControlService.markAsQuoted(controlId);
      setStatusControl({
        _id_status_control: 5,
        status_control_name: 'Cotizada'
      });
      showSuccess('Control marcado como cotizado');
    } catch (error) {
      console.error('Error marking as quoted:', error);
      showError('Error al marcar como cotizado');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryMedal = (category: number) => {
    switch (category) {
      case 1: return '/gold.png';
      case 2: return '/silver.png';
      case 3: return '/bronze.png';
      default: return '';
    }
  };

  const calculateProfit_general = () => {
    if (generalData.unit_profit && generalData.volume) {
      const unitProfit = parseFloat(generalData.unit_profit);
      const volume = parseFloat(generalData.volume);
      if (!isNaN(unitProfit) && !isNaN(volume)) {
        generalData.general_profit = (unitProfit * volume).toString();
        return (unitProfit * volume).toString();
      }
    }
    return 0;
  };

  if (loading && !requestData) {
    return (
      <div className={styles.formContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className={styles.formContainer}>
        <div className={styles.emptyState}>
          <h3>No se encontró la solicitud</h3>
        </div>
      </div>
    );
  }

  const medalSrc = getCategoryMedal(requestData.customer_category);

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <div className={styles.formHeaderLeft}>
          <button onClick={onBack} className={styles.backButton} disabled={loading}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.formTitle}>Control de pricing</h1>
            <p className={styles.formSubtitle}>
              {controlId ? 'Editar número de control' : 'Nuevo número de control'}
            </p>
          </div>
        </div>
        <div className={styles.formHeaderRight}>
          <div className={styles.actionButtons}>
            <button className={styles.btnSave} onClick={handleSave} disabled={loading}>
              <Save size={18} />
              Guardar
            </button>
            <button className={styles.btnIconOnly} onClick={loadData} disabled={loading}>
              <RefreshCw size={18} />
            </button>
            <button
              className={styles.btnIconOnly}
              onClick={handleDelete}
              disabled={loading || !controlId}
            >
              <Trash2 size={18} />
            </button>
            <div className={styles.actionsMenuContainer} ref={actionsMenuRef}>
              <button
                className={styles.btnActions}
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                disabled={loading}
              >
                Acciones
                <ChevronDown size={16} />
              </button>
              {showActionsMenu && (
                <div className={styles.actionsDropdown}>
                  <button className={styles.dropdownItem}>Exportar</button>
                  <button className={styles.dropdownItem}>Duplicar</button>
                  <button className={styles.dropdownItem}>Historial</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formContent}>
        <div className={styles.topCardsContainer}>
          <div className={styles.clientSection}>
            <div className={styles.clientHeader}>
              <div className={styles.clientInfo}>
                {medalSrc && (
                  <img src={medalSrc} alt="Medal" className={styles.clientMedal} />
                )}
                <div>
                  <h2 className={styles.clientName}>
                    {requestData.customer_business_name}
                    {priority && (
                      <img src="/prioridad.png" alt="Prioridad" className={styles.priorityIcon} style={{width: '20px', height: '20px', marginLeft: '8px'}} />
                    )}
                  </h2>
                  <div className={styles.clientDetails}>
                    <span className={styles.clientId}>
                      Ref: {requestData.reference_request}
                    </span>
                    <span className={styles.clientExecutive}>
                      {requestData.requesting_data?.complete_name}
                    </span>
                  </div>
                  <div className={styles.clientToggles}>
                    <div className={styles.switchContainer}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={priority}
                          onChange={(e) => setPriority(e.target.checked)}
                          disabled
                        />
                        <span className={styles.switchSlider}></span>
                      </label>
                      <span className={styles.switchLabel}>Prioridad</span>
                    </div>
                    <div className={styles.switchContainer}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={bidding}
                          onChange={(e) => setBidding(e.target.checked)}
                          disabled
                        />
                        <span className={styles.switchSlider}></span>
                      </label>
                      <span className={styles.switchLabel}>Licitación</span>
                    </div>
                  </div>
                  {controlData && (
                    <div className={styles.clientControl}>
                      <span className={styles.controlLabel}>Control</span>
                      <span className={styles.controlBadge}>{controlData.control}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.clientMeta}>
                <div className={styles.clientType}>{requestData.request_type_name}</div>
              </div>
            </div>
            <div className={styles.clientActions}>
              <button className={styles.btnDecline} disabled={loading}>
                Declinar
              </button>
              <button
                className={styles.btnQuote}
                onClick={handleMarkAsQuoted}
                disabled={loading || !controlId || statusControl._id_status_control === 5}
              >
                Cotizada
              </button>
            </div>
          </div>

          <div className={styles.suppliersSection}>
            <h3 className={styles.sectionTitle}>Asignación de proveedores</h3>
            <div className={styles.suppliersList}>
              {suppliers.map((supplier) => (
                <div key={supplier.idsuplier} className={styles.supplierItem}>
                  <span className={styles.supplierLabel}>Proveedor</span>
                  <input
                    type="text"
                    value={supplier.supplier_associated_name}
                    onChange={(e) => updateSupplier(supplier.idsuplier, e.target.value)}
                    className={styles.supplierInput}
                    placeholder="Nombre del proveedor"
                    disabled={loading}
                  />
                  <button
                    className={styles.btnRemoveSupplier}
                    onClick={() => removeSupplier(supplier.idsuplier)}
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              className={styles.btnAddSupplier}
              onClick={addSupplier}
              disabled={loading}
            >
              <Plus size={16} />
              Agregar proveedor
            </button>
          </div>
        </div>

        <div className={styles.generalSection}>
          <h3 className={styles.sectionTitle}>General</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>* Estatus</label>
              <select
                value={statusControl.status_control_name}
                onChange={(e) => {
                  const statusMap: any = {
                    'Asignada': { _id_status_control: 4, status_control_name: 'Asignada' },
                    'En proceso': { _id_status_control: 3, status_control_name: 'En proceso' },
                    'Cotizada': { _id_status_control: 5, status_control_name: 'Cotizada' }
                  };
                  setStatusControl(statusMap[e.target.value] || statusControl);
                }}
                className={styles.formSelect}
                disabled={loading}
              >
                <option>En proceso</option>
                <option>Asignada</option>
                <option>Cotizada</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>* Red / Alianza</label>
              <select
                value={generalData.network}
                onChange={(e) => setGeneralData({...generalData, network: e.target.value})}
                className={styles.formSelect}
                disabled={loading}
              >
                <option>WCA</option>
                <option>JC TRANS</option>
                <option>GLA FAMILY</option>
                <option>N/A</option>
                <option>WTC Alliance</option>
                <option>DF Alliance</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>* Complejidad</label>
              <select
                value={generalData.complexity}
                onChange={(e) => setGeneralData({...generalData, complexity: e.target.value})}
                className={styles.formSelect}
                disabled={loading}
              >
                <option>Baja</option>
                <option>Media</option>
                <option>Alta</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>* Moneda</label>
              <select
                value={generalData.currency}
                onChange={(e) => setGeneralData({...generalData, currency: e.target.value})}
                className={styles.formSelect}
                disabled={loading}
              >
                <option>USD</option>
                <option>MXN</option>
                <option>EUR</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>* Profit Unitario</label>
              <input
                type="text"
                value={generalData.unit_profit}
                onChange={(e) => setGeneralData({...generalData, unit_profit: e.target.value})}
                className={styles.formInput}
                disabled={loading}                
              />
            </div>
             <div className={styles.formGroup}>
              <label>* Volumen</label>
              <input
                type="text"
                value={generalData.volume}
                onChange={(e) => setGeneralData({...generalData, volume: e.target.value})}
                className={styles.formInput}                
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label>* Profit general</label>
              <input
                type="text"
                value={calculateProfit_general()}
                onChange={(e) => setGeneralData({...generalData, general_profit: e.target.value})}
                className={styles.formInput}
                disabled={true}
              />
            </div>
              <div className={styles.formGroup}>
              <label>* Red / Alianza</label>
              <select
                value={generalData.key_td}
                onChange={(e) => setGeneralData({...generalData, key_td: e.target.value})}
                className={styles.formSelect}
                disabled={loading}
              >
                <option value="CI" >CI Complementar información</option>
                <option value="RFQ" >RFQ Licitación</option>
                <option value="FS" >FS Fin de semana</option>
                <option value="DP" >DP Desarrollo de proveedor</option>
                <option value="MS" >MS MultiServicios + 10 rutas +3 proveedores</option>
                <option value="DH" >DH Diferencia de horario</option>
                <option value="DC" >DC Dependencia corresponsal / Dependencia consolidador</option>
                <option value="AR" >AR Actualización de rutas</option>
                <option value="OWOS" >OWOS Proyectos sobredimensionados</option>
                <option value="IP" >IP Interno pricing</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Comentarios</label>
            <textarea
              value={generalData.comments_general}
              onChange={(e) => setGeneralData({...generalData, comments_general: e.target.value})}
              className={styles.formTextarea}
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.servicesSection}>
          <h3 className={styles.sectionTitle}>Servicios</h3>
          {requestData.services && requestData.services.length > 0 ? (
            requestData.services.map((service: any, index: number) => {
              const serviceId = service.id_service_item || service.idservice || service._id;
              const isSelected = selectedServices.some(s => s.idservice === serviceId);
              const isUsed = service.used && !isSelected;
              const isExpanded = expandedServices.has(serviceId);

              const shipment = service.shipments && service.shipments.length > 0 ? service.shipments[0] : {};

              return (
                <div
                  key={serviceId}
                  className={styles.serviceCard}
                  style={{
                    opacity: isUsed ? 0.5 : 1,
                    border: isSelected ? '2px solid #14b8a6' : '1px solid #e5e7eb'
                  }}
                >
                  <div className={styles.serviceHeader}>
                    <div className={styles.serviceNumber}>{index + 1}</div>
                    <div style={{flex: 1}}>
                      <div className={styles.switchContainer}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleService(serviceId)}
                            disabled={isUsed || loading}
                          />
                          <span className={styles.switchSlider}></span>
                        </label>
                        <span className={styles.switchLabel} style={{fontWeight: 600}}>
                          {isSelected ? 'Servicio incluido' : isUsed ? 'Ya usado en otro control' : 'Incluir servicio'}
                        </span>
                      </div>
                    </div>
                    <button
                      className={styles.btnServiceAction}
                      onClick={() => toggleServiceExpanded(serviceId)}
                      disabled={loading}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button
                      className={styles.btnServiceAction}
                      onClick={() => toggleService(serviceId)}
                      disabled={isUsed || loading}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {isExpanded && (
                    <>
                      <div className={styles.serviceGrid}>
                        <div className={styles.formGroup}>
                          <label>*Servicio</label>
                          <input
                            type="text"
                            value={service.service_name || ''}
                            className={styles.formInput}
                            disabled
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>*Operación</label>
                          <input
                            type="text"
                            value={shipment.operation_type_name || ''}
                            className={styles.formInput}
                            disabled
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>*Incoterm</label>
                          <input
                            type="text"
                            value={shipment.incoterm_name || shipment.incoterm || ''}
                            className={styles.formInput}
                            disabled
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Salida esperada</label>
                          <input
                            type="date"
                            value={shipment.departure_date_approximate ? new Date(shipment.departure_date_approximate.$date || shipment.departure_date_approximate).toISOString().split('T')[0] : ''}
                            className={styles.formInput}
                            disabled
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>*Origen</label>
                          <input
                            type="text"
                            value={(() => {
                              const countryCode = shipment.origin_country_name || shipment.origin?.country_code || shipment.origin?.location || '';
                              const country = countries.find(c => c.country_code === countryCode);
                              return country ? `(${country.country_code}) ${country.name_country}` : countryCode;
                            })()}
                            className={styles.formInput}
                            disabled
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>*Destino</label>
                          <input
                            type="text"
                            value={(() => {
                              const countryCode = shipment.destination_country_name || shipment.destination?.country_code || shipment.destination?.location || '';
                              const country = countries.find(c => c.country_code === countryCode);
                              return country ? `(${country.country_code}) ${country.name_country}` : countryCode;
                            })()}
                            className={styles.formInput}
                            disabled
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>*Código postal de destino</label>
                          <input
                            type="text"
                            value={shipment.zip_code || shipment.destination?.zipcode || shipment.destiny_zipcode || ''}
                            className={styles.formInput}
                            disabled
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>*Tipo de envío</label>
                          <input
                            type="text"
                            value={shipment.shippment_type_name || ''}
                            className={styles.formInput}
                            disabled
                          />
                        </div>
                      </div>

                      <div className={styles.associatedServices}>
                        <label>Servicios Asociados</label>
                        <div className={styles.servicesChips}>
                          {(shipment.services_associated || shipment.services_asociated) && (shipment.services_associated || shipment.services_asociated).length > 0 ? (
                            (shipment.services_associated || shipment.services_asociated).map((assocService: any, idx: number) => (
                              <span key={assocService._id_service_associated?.$oid || idx} className={`${styles.serviceChip} ${styles.serviceChipActive}`}>
                                {assocService.service_associated_name || 'Servicio'}
                              </span>
                            ))
                          ) : (
                            <span style={{color: '#9ca3af', fontSize: '14px'}}>Sin servicios asociados</span>
                          )}
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Comentarios</label>
                        <textarea
                          value={shipment.comment || shipment.comments || ''}
                          className={styles.formTextarea}
                          rows={2}
                          disabled
                          placeholder="Sin comentarios"
                        />
                      </div>

                      <div className={styles.frequencySection}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={!!shipment.projection_shipment}
                            disabled
                          />
                          Programar frecuencia
                        </label>
                        {shipment.projection_shipment && (
                          <div className={styles.frequencyGrid}>
                            <div className={styles.formGroup}>
                              <label>Frecuencia</label>
                              <input
                                type="text"
                                value={shipment.projection_shipment.frecuency || ''}
                                className={styles.formInput}
                                disabled
                              />
                            </div>
                            <div className={styles.formGroup}>
                              <label>Cantidad</label>
                              <input
                                type="number"
                                value={shipment.projection_shipment.num || 0}
                                className={styles.formInput}
                                disabled
                              />
                            </div>
                            <div className={styles.formGroup}>
                              <label>Medida</label>
                              <input
                                type="text"
                                value={shipment.projection_shipment.measurement_frecuency || ''}
                                className={styles.formInput}
                                disabled
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={styles.merchandiseSection}>
                        <h4 className={styles.merchandiseTitle}>MERCANCÍA</h4>
                        {shipment.cargo && shipment.cargo.length > 0 ? (
                          <div className={styles.merchandiseTable}>
                            <div className={styles.merchandiseHeader}>
                              <div>MERCANCÍA</div>
                              <div>PELIGROSA</div>
                              <div>CLASIFICACIÓN</div>
                              <div>ESTIBABLE</div>
                              <div>VOL. TOTAL</div>
                              <div>PESO TOTAL</div>
                            </div>
                            {shipment.cargo.map((cargo: any, cargoIndex: number) => {
                              const isPeligrosa = cargo.merchandise_classification?.some((mc: any) => mc._id_merchandise_classification === 5);
                              const classifications = cargo.merchandise_classification?.map((mc: any) => mc.merchandise_name_classification).join(', ') || 'General';

                              return (
                                <div key={cargoIndex} className={styles.merchandiseRow}>
                                  <input
                                    type="text"
                                    value={cargo.merchandise_name || ''}
                                    className={styles.merchandiseInput}
                                    disabled
                                  />
                                  <input
                                    type="text"
                                    value={isPeligrosa ? 'Sí' : 'No'}
                                    className={styles.merchandiseInput}
                                    disabled
                                  />
                                  <input
                                    type="text"
                                    value={classifications}
                                    className={styles.merchandiseInput}
                                    disabled
                                  />
                                  <input
                                    type="text"
                                    value={cargo.stowable ? 'Sí' : 'No'}
                                    className={styles.merchandiseInput}
                                    disabled
                                  />
                                  <input
                                    type="text"
                                    value={cargo.volume_total ? `${cargo.volume_total} ${cargo.unit_measurement || ''}` : ''}
                                    className={styles.merchandiseInput}
                                    disabled
                                  />
                                  <input
                                    type="text"
                                    value={cargo.weigth_total ? `${cargo.weigth_total} ${cargo.unit_weight || ''}` : ''}
                                    className={styles.merchandiseInput}
                                    disabled
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p style={{color: '#9ca3af', fontSize: '14px', marginTop: '8px'}}>Sin mercancía registrada</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <p>No hay servicios disponibles en esta solicitud</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
