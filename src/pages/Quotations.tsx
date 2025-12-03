import React, { useState, useEffect } from 'react';
import { Trash2, ChevronDown, Plus, Copy, X, MapPin, Search, RotateCcw, Save, Eye, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { quotationService } from '../services/quotationService';
import styles from './Quotations.module.css';

interface MerchandisePackage {
  id: number;
  type: string;
  quantity: number;
  length: number;
  width: number;
  height: number;
  weight: number;
}

interface Merchandise {
  id: number;
  name: string;
  description: string;
  dangerous: boolean;
  refrigerated: boolean;
  oversized: boolean;
  imoClass: string;
  un: string;
  temperature: number;
  tempUnit: string;
  grain: boolean;
  stackable: boolean;
  unitType: 'lbs' | 'kg';
  totalVolume: number;
  totalWeight: number;
  packages: MerchandisePackage[];
}

interface Executive {
  id: number;
  name: string;
}

interface Service {
  id: number;
  service: string;
  operation: string;
  incoterm: string;
  origin: string;
  destination: string;
  destinationZip: string;
  expectedDeparture: string;
  custody: boolean;
  insurance: boolean;
  inspection: boolean;
  customsClearance: boolean;
  comments: string;
  shippingType: string;
  programFrequency: boolean;
  frequency: string;
  quantity: string;
  unit: string;
  merchandise: Merchandise[];
}

interface QuotationsProps {
  mode?: 'create' | 'edit' | 'view';
  quotationId?: string | null;
  onBack?: () => void;
}

export function Quotations({ mode = 'create', quotationId, onBack }: QuotationsProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [executives, setExecutives] = useState<Executive[]>([]);

  const [customers, setCustomers] = useState<any[]>([]);
  const [requestTypes, setRequestTypes] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [availableExecutives, setAvailableExecutives] = useState<any[]>([]);
  const [incoterms, setIncoterms] = useState<any[]>([]);

  const [showMerchandiseModal, setShowMerchandiseModal] = useState(false);
  const [editingMerchandise, setEditingMerchandise] = useState<Merchandise | null>(null);
  const [currentServiceId, setCurrentServiceId] = useState<number | null>(null);

  const [showExecutiveModal, setShowExecutiveModal] = useState(false);

  const [merchandiseForm, setMerchandiseForm] = useState({
    name: '',
    description: '',
    dangerous: false,
    refrigerated: false,
    oversized: false,
    grain: false,
    stackable: false,
    imoClass: '',
    un: '',
    temperature: '',
    tempUnit: '°C',
  });

  const [showPackagingModal, setShowPackagingModal] = useState(false);
  const [currentPackages, setCurrentPackages] = useState<any[]>([]);
  const [useMetricSystem, setUseMetricSystem] = useState(true);

  const [formData, setFormData] = useState({
    referenceRequest: '',
    customerId: '',
    client: '',
    isPriority: false,
    isQuote: false,
    customerCategory: 1,
    requestTypeId: '',
    requestType: '',
    created: new Date().toISOString().split('T')[0],
    responseDeadline: '',
  });

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && quotationId) {
      loadQuotation(quotationId);
    }
  }, [mode, quotationId]);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const BASE_URL = import.meta.env.VITE_SUPABASE_URL;

      const [customersRes, requestTypesRes, servicesRes, executivesRes, incotermsRes] = await Promise.all([
        fetch(`${BASE_URL}/functions/v1/customers`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${BASE_URL}/functions/v1/catalog-request-types`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${BASE_URL}/functions/v1/catalog-services`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${BASE_URL}/functions/v1/executives`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${BASE_URL}/functions/v1/catalog-incoterms`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),
      ]);

      const customersData = await customersRes.json();
      const requestTypesData = await requestTypesRes.json();
      const servicesData = await servicesRes.json();
      const executivesData = await executivesRes.json();
      const incotermsData = await incotermsRes.json();

      setCustomers(customersData.filter((c: any) => c.status === 1));
      setRequestTypes(requestTypesData.filter((r: any) => r.status === 1));
      setAvailableServices(servicesData.filter((s: any) => s.status === 1 && s.category === 1));
      setAvailableExecutives(executivesData.filter((e: any) => e.status === 1));
      setIncoterms(incotermsData.filter((i: any) => i.status === 1));
    } catch (error) {
      console.error('Error loading catalogs:', error);
      alert('Error al cargar los catálogos');
    } finally {
      setLoading(false);
    }
  };

  const loadQuotation = async (id: string) => {
    try {
      setLoading(true);
      const data = await quotationService.getById(id);
      setFormData({
        referenceRequest: data.reference_request || '',
        customerId: data._id_customer || '',
        client: data.customer_business_name || '',
        isPriority: data.priority > 0,
        isQuote: data.licitation || false,
        customerCategory: data.customer_category || 1,
        requestTypeId: data._id_request_type || '',
        requestType: data.request_type_name || '',
        created: data.request_date ? new Date(data.request_date).toISOString().split('T')[0] : '',
        responseDeadline: data.deadline_date ? new Date(data.deadline_date).toISOString().split('T')[0] : '',
      });
    } catch (error) {
      console.error('Error loading quotation:', error);
      alert('Error al cargar la cotización');
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    const newService: Service = {
      id: services.length + 1,
      service: '',
      operation: '',
      incoterm: '',
      origin: '',
      destination: '',
      destinationZip: '',
      expectedDeparture: '',
      custody: false,
      insurance: false,
      inspection: false,
      customsClearance: false,
      comments: '',
      shippingType: 'Door to Door',
      programFrequency: false,
      frequency: '',
      quantity: '',
      unit: '',
      merchandise: [],
    };
    setServices([...services, newService]);
  };

  const removeService = (id: number) => {
    setServices(services.filter(s => s.id !== id));
  };

  const removeMerchandise = (serviceId: number, merchandiseId: number) => {
    setServices(services.map(s =>
      s.id === serviceId
        ? { ...s, merchandise: s.merchandise.filter(m => m.id !== merchandiseId) }
        : s
    ));
  };

  const removeExecutive = (id: number) => {
    setExecutives(executives.filter(e => e.id !== id));
  };

  const openMerchandiseModal = (serviceId: number, merchandise?: Merchandise) => {
    setCurrentServiceId(serviceId);
    setEditingMerchandise(merchandise || null);
    if (merchandise) {
      setMerchandiseForm({
        name: merchandise.name,
        description: merchandise.description || '',
        dangerous: merchandise.dangerous,
        refrigerated: merchandise.refrigerated,
        oversized: merchandise.oversized,
        grain: merchandise.grain,
        stackable: merchandise.stackable,
        imoClass: merchandise.imoClass || '',
        un: merchandise.un || '',
        temperature: merchandise.temperature?.toString() || '',
        tempUnit: merchandise.tempUnit || '°C',
      });
      setCurrentPackages(merchandise.packages || []);
    } else {
      setMerchandiseForm({
        name: '',
        description: '',
        dangerous: false,
        refrigerated: false,
        oversized: false,
        grain: false,
        stackable: false,
        imoClass: '',
        un: '',
        temperature: '',
        tempUnit: '°C',
      });
      setCurrentPackages([]);
    }
    setShowMerchandiseModal(true);
  };

  const closeMerchandiseModal = () => {
    setShowMerchandiseModal(false);
    setEditingMerchandise(null);
    setCurrentServiceId(null);
  };

  const openPackagingModal = () => {
    setShowPackagingModal(true);
  };

  const closePackagingModal = () => {
    setShowPackagingModal(false);
  };

  const addPackage = (pkg: any) => {
    setCurrentPackages([...currentPackages, { ...pkg, id: Date.now() }]);
    closePackagingModal();
  };

  const removePackage = (packageId: number) => {
    setCurrentPackages(currentPackages.filter(p => p.id !== packageId));
  };

  const copyMerchandise = (serviceId: number, merchandiseId: number) => {
    const service = services.find(s => s.id === serviceId);
    const merchToCopy = service?.merchandise.find(m => m.id === merchandiseId);
    if (merchToCopy) {
      const newMerch = { ...merchToCopy, id: Date.now() };
      setServices(services.map(s =>
        s.id === serviceId
          ? { ...s, merchandise: [...s.merchandise, newMerch] }
          : s
      ));
    }
  };

  const openExecutiveModal = () => {
    setShowExecutiveModal(true);
  };

  const closeExecutiveModal = () => {
    setShowExecutiveModal(false);
  };

  const addExecutive = (executive: Executive) => {
    const isAlreadyAdded = executives.some(e => e.id === executive.id);
    if (!isAlreadyAdded) {
      setExecutives([...executives, executive]);
    }
    closeExecutiveModal();
  };

  const duplicateService = (id: number) => {
    const serviceToDuplicate = services.find(s => s.id === id);
    if (serviceToDuplicate) {
      const newService = { ...serviceToDuplicate, id: Date.now() };
      setServices([...services, newService]);
    }
  };

  const updateService = (id: number, field: keyof Service, value: any) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSaveQuotation = async () => {
    try {
      setSaving(true);

      if (!formData.referenceRequest || !formData.customerId || !formData.requestTypeId) {
        alert('Por favor completa los campos requeridos: Referencia, Cliente y Tipo de solicitud');
        return;
      }

      const selectedCustomer = customers.find(c => c._id === formData.customerId);
      const selectedRequestType = requestTypes.find(r => r._id === formData.requestTypeId);
      const selectedExecutive = availableExecutives.length > 0 ? availableExecutives[0] : null;

      const quotationData = {
        reference_request: formData.referenceRequest,
        priority: formData.isPriority ? 1 : 0,
        customer_category: formData.customerCategory,
        _id_status_request: 1,
        status_request_name: 'Nueva',
        request_date: new Date(formData.created),
        deadline_date: formData.responseDeadline ? new Date(formData.responseDeadline) : null,
        _id_request_type: selectedRequestType._id,
        request_type_name: selectedRequestType.request_type_name,
        _id_customer: formData.customerId,
        customer_business_name: selectedCustomer?.fiscal_data?.business_name || formData.client,
        licitation: formData.isQuote,
        requesting_data: selectedExecutive ? {
          _id_executive: selectedExecutive._id,
          complete_name: `${selectedExecutive.first_name} ${selectedExecutive.last_name}`,
        } : {},
        assigned_to: executives.map(exec => ({
          _id_executive: exec.id.toString(),
          complete_name: exec.name,
          control_number: 'SN',
        })),
        services: services.map((service, idx) => ({
          id_service_item: idx + 1,
          id_service: 1,
          service_name: service.service,
          shipments: [{
            id_shipment_item: 1,
            origin: {
              location: service.origin,
            },
            destination: {
              location: service.destination,
            },
            _id_shipment_type: service.shippingType === 'Door to Door' ? 1 : 2,
            shippment_type_name: service.shippingType,
            _id_operation_type: service.operation === 'Exportación' ? 1 : service.operation === 'Importación' ? 2 : 3,
            operation_type_name: service.operation,
            _id_incoterm: incoterms.find(i => i.incoterm === service.incoterm)?._id || null,
            incoterm: service.incoterm,
            departure_date_approximate: service.expectedDeparture ? new Date(service.expectedDeparture) : null,
            comments: service.comments,
            cargo: service.merchandise.map(merch => ({
              merchandise_name: merch.name,
              merchandise_description: merch.description,
              merchandise_classification: [],
              stowable: merch.stackable,
              volume_total: merch.totalVolume,
              weigth_total: merch.totalWeight,
              unit: merch.packages,
            })),
          }],
        })),
      };

      if (mode === 'edit' && quotationId) {
        await quotationService.update(quotationId, quotationData);
        alert('Cotización actualizada exitosamente');
      } else {
        await quotationService.create(quotationData);
        alert('Cotización creada exitosamente');
      }

      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('Error saving quotation:', error);
      alert('Error al guardar la cotización');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onBack && (
            <button
              onClick={onBack}
              className={styles.actionBarResetButton}
              title="Volver a lista"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className={styles.title}>
            {mode === 'view' ? 'Ver Cotización' : mode === 'edit' ? 'Editar Cotización' : t('quote.title')}
          </h1>
        </div>
        <div className={styles.actionBar}>
          <button
            className={styles.actionBarSaveButton}
            onClick={handleSaveQuotation}
            disabled={saving || mode === 'view'}
          >
            <Save size={18} />
            <span>{saving ? 'Guardando...' : t('quote.save')}</span>
          </button>
          <button className={styles.actionBarResetButton}>
            <RotateCcw size={18} />
          </button>
          <button className={styles.actionBarDeleteButton}>
            <Trash2 size={18} />
          </button>
          <button className={styles.actionBarDropdownButton}>
            <span>{t('quote.actions')}</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Datos Generales</h2>
        <div className={styles.generalDataGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>Referencia
            </label>
            <input
              type="text"
              value={formData.referenceRequest}
              onChange={(e) => setFormData({ ...formData, referenceRequest: e.target.value })}
              className={styles.input}
              placeholder="QR250901-00001"
              disabled={mode === 'view'}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>Cliente
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => {
                const customer = customers.find(c => c._id === e.target.value);
                setFormData({
                  ...formData,
                  customerId: e.target.value,
                  client: customer?.fiscal_data?.business_name || ''
                });
              }}
              className={styles.select}
              disabled={loading || mode === 'view'}
            >
              <option value="">Seleccione un cliente...</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.fiscal_data?.business_name || customer.commercial_name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>Tipo de solicitud
            </label>
            <select
              value={formData.requestTypeId}
              onChange={(e) => {
                const requestType = requestTypes.find(r => r._id === parseInt(e.target.value));
                setFormData({
                  ...formData,
                  requestTypeId: e.target.value,
                  requestType: requestType?.request_type_name || ''
                });
              }}
              className={styles.select}
              disabled={loading || mode === 'view'}
            >
              <option value="">Seleccione un tipo...</option>
              {requestTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.request_type_name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Categoría Cliente</label>
            <select
              value={formData.customerCategory}
              onChange={(e) => setFormData({ ...formData, customerCategory: parseInt(e.target.value) })}
              className={styles.select}
              disabled={mode === 'view'}
            >
              <option value={1}>Golden</option>
              <option value={2}>Silver</option>
              <option value={3}>Bronze</option>
            </select>
          </div>

          <div className={styles.formGroupWithToggle}>
            <label className={styles.label}>Es prioritaria</label>
            <div
              className={`${styles.toggleSwitch} ${formData.isPriority ? styles.active : ''}`}
              onClick={() => setFormData({ ...formData, isPriority: !formData.isPriority })}
            >
              <div className={styles.toggleThumb}></div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>Fecha solicitud
            </label>
            <input
              type="date"
              value={formData.created}
              onChange={(e) => setFormData({ ...formData, created: e.target.value })}
              className={styles.input}
              disabled={mode === 'view'}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Límite de respuesta</label>
            <input
              type="date"
              value={formData.responseDeadline}
              onChange={(e) => setFormData({ ...formData, responseDeadline: e.target.value })}
              className={styles.input}
              placeholder="dd/mm/aaaa"
            />
          </div>

          <div className={styles.formGroupWithToggle}>
            <label className={styles.label}>Es licitación</label>
            <div
              className={`${styles.toggleSwitch} ${formData.isQuote ? styles.active : ''}`}
              onClick={() => setFormData({ ...formData, isQuote: !formData.isQuote })}
            >
              <div className={styles.toggleThumb}></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quote.services')}</h2>

        {services.map((service, index) => (
          <div key={service.id} className={styles.serviceCard}>
            <div className={styles.serviceHeader}>
              <div className={styles.serviceNumber}>{index + 1}</div>
              <div className={styles.serviceActions}>
                <button className={`${styles.iconButton} ${styles.primary}`}>
                  <Plus size={18} />
                </button>
                <button className={styles.iconButton} onClick={() => duplicateService(service.id)}>
                  <Copy size={18} />
                </button>
                <button className={styles.iconButton}>
                  <Trash2 size={18} />
                </button>
                <button className={styles.iconButton}>
                  <ChevronDown size={18} />
                </button>
                {services.length > 1 && (
                  <button
                    className={`${styles.iconButton} ${styles.danger}`}
                    onClick={() => removeService(service.id)}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.service')}
                </label>
                <select
                  value={service.service}
                  onChange={(e) => updateService(service.id, 'service', e.target.value)}
                  className={styles.select}
                  disabled={loading || mode === 'view'}
                >
                  <option value="">Seleccionar...</option>
                  {availableServices.map((srv) => (
                    <option key={srv._id} value={srv.service_name}>
                      {srv.service_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.operation')}
                </label>
                <select
                  value={service.operation}
                  onChange={(e) => updateService(service.id, 'operation', e.target.value)}
                  className={styles.select}
                >
                  <option value="">Seleccionar...</option>
                  <option>Exportación</option>
                  <option>Importación</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.incoterm')}
                </label>
                <select
                  value={service.incoterm}
                  onChange={(e) => updateService(service.id, 'incoterm', e.target.value)}
                  className={styles.select}
                  disabled={loading || mode === 'view'}
                >
                  <option value="">Seleccionar...</option>
                  {incoterms.map((inc) => (
                    <option key={inc._id} value={inc.incoterm}>
                      {inc.incoterm}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('quote.expectedDeparture')}</label>
                <input
                  type="date"
                  value={service.expectedDeparture}
                  onChange={(e) => updateService(service.id, 'expectedDeparture', e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGrid} style={{ marginTop: '1.25rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.origin')}
                </label>
                <div className={styles.inputWithIcon}>
                  <MapPin className={styles.inputIcon} size={16} />
                  <input
                    type="text"
                    value={service.origin}
                    onChange={(e) => updateService(service.id, 'origin', e.target.value)}
                    className={`${styles.input} ${styles.inputWithIconField}`}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.destination')}
                </label>
                <div className={styles.inputWithIcon}>
                  <MapPin className={styles.inputIcon} size={16} />
                  <input
                    type="text"
                    value={service.destination}
                    onChange={(e) => updateService(service.id, 'destination', e.target.value)}
                    className={`${styles.input} ${styles.inputWithIconField}`}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.destinationZip')}
                </label>
                <input
                  type="text"
                  value={service.destinationZip}
                  onChange={(e) => updateService(service.id, 'destinationZip', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>Tipo de envío
                </label>
                <select
                  value={service.shippingType}
                  onChange={(e) => updateService(service.id, 'shippingType', e.target.value)}
                  className={styles.select}
                >
                  <option>Door to Door</option>
                  <option>Port to Port</option>
                  <option>Door to Port</option>
                  <option>Port to Door</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label className={styles.label}>Salida esperada</label>
              <input
                type="date"
                value={service.expectedDeparture}
                onChange={(e) => updateService(service.id, 'expectedDeparture', e.target.value)}
                className={styles.input}
              />
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label className={styles.label}>Servicios Asociados</label>
              <div className={styles.associatedServices}>
                <div
                  className={`${styles.serviceChip} ${service.custody ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'custody', !service.custody)}
                >
                  <span>Custodia</span>
                </div>
                <div
                  className={`${styles.serviceChip} ${service.insurance ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'insurance', !service.insurance)}
                >
                  <span>Seguro</span>
                </div>
                <div
                  className={`${styles.serviceChip} ${service.inspection ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'inspection', !service.inspection)}
                >
                  <span>Inspección</span>
                </div>
                <div
                  className={`${styles.serviceChip} ${service.customsClearance ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'customsClearance', !service.customsClearance)}
                >
                  <span>Despacho aduanal</span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
              <label className={styles.label}>Comentarios</label>
              <textarea
                value={service.comments}
                onChange={(e) => updateService(service.id, 'comments', e.target.value)}
                className={styles.textarea}
                rows={3}
                placeholder=""
              />
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <div className={styles.frequencyHeader}>
                <input
                  type="checkbox"
                  id={`freq-${service.id}`}
                  checked={service.programFrequency}
                  onChange={(e) => updateService(service.id, 'programFrequency', e.target.checked)}
                  className={styles.checkbox}
                />
                <label htmlFor={`freq-${service.id}`} className={styles.checkboxLabel}>
                  Programar frecuencia
                </label>
              </div>
              {service.programFrequency && (
                <div className={styles.frequencyGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Frecuencia</label>
                    <select
                      value={service.frequency}
                      onChange={(e) => updateService(service.id, 'frequency', e.target.value)}
                      className={styles.select}
                    >
                      <option>Semanal</option>
                      <option>Mensual</option>
                      <option>Trimestral</option>
                      <option>Anual</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Cantidad</label>
                    <input
                      type="text"
                      value={service.quantity}
                      onChange={(e) => updateService(service.id, 'quantity', e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Medida</label>
                    <select
                      value={service.unit}
                      onChange={(e) => updateService(service.id, 'unit', e.target.value)}
                      className={styles.select}
                    >
                      <option>Toneladas</option>
                      <option>Kilogramos</option>
                      <option>Metros cúbicos</option>
                      <option>Contenedores</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.merchandiseSection}>
              <h3 className={styles.subsectionTitle}>MERCANCÍA</h3>
              <div className={styles.merchandiseTable}>
                <table className={styles.simpleTable}>
                  <thead>
                    <tr>
                      <th>MERCANCÍA</th>
                      <th>PELIGROSA</th>
                      <th>CLASIFICACIÓN</th>
                      <th>ESTIBABLE</th>
                      <th>VOL. TOTAL</th>
                      <th>PESO TOTAL</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.merchandise.map((merch) => (
                      <tr key={merch.id}>
                        <td>{merch.name}</td>
                        <td>{merch.dangerous ? 'No' : 'No'}</td>
                        <td>{merch.refrigerated ? 'Refrigerada' : 'General'}</td>
                        <td>{merch.stackable ? 'Sí' : 'No'}</td>
                        <td>{merch.totalVolume} KG</td>
                        <td>{merch.totalWeight} KG</td>
                        <td>
                          <div className={styles.tableActions}>
                            <button
                              className={styles.iconButtonSmall}
                              onClick={() => copyMerchandise(service.id, merch.id)}
                              title="Copiar"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              className={styles.iconButtonSmall}
                              onClick={() => removeMerchandise(service.id, merch.id)}
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              className={styles.viewButtonGreen}
                              onClick={() => openMerchandiseModal(service.id, merch)}
                              title="Ver"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                className={styles.addItemButton}
                onClick={() => openMerchandiseModal(service.id)}
              >
                <Plus size={16} />
                Agregar mercancía
              </button>
            </div>
          </div>
        ))}

        <button className={styles.addServiceButton} onClick={addService}>
          <Plus size={20} />
          <span>Agregar Servicio</span>
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Asignación de Ejecutivos</h2>
        <div className={styles.executivesCard}>
          <div className={styles.executivesList}>
            {executives.map((executive) => (
              <div key={executive.id} className={styles.executiveItemSimple}>
                <span className={styles.executiveLabel}>Ejecutivo</span>
                <span className={styles.executiveNameSimple}>{executive.name}</span>
                <button
                  className={styles.removeIconButton}
                  onClick={() => removeExecutive(executive.id)}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button className={styles.addExecutiveButton} onClick={openExecutiveModal}>
            <Plus size={16} />
            Agregar ejecutivo
          </button>
        </div>
      </div>

      {showMerchandiseModal && (
        <div className={styles.modalOverlay} onClick={closeMerchandiseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Mercancía</h2>
              <button className={styles.closeButton} onClick={closeMerchandiseModal}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalRow}>
                <div className={styles.modalFieldLarge}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>Mercancía
                  </label>
                  <input
                    type="text"
                    placeholder="Baterías de Telefonos Modelo 388"
                    className={styles.input}
                    value={merchandiseForm.name}
                    onChange={(e) => setMerchandiseForm({ ...merchandiseForm, name: e.target.value })}
                  />
                </div>
                <div className={styles.modalFieldSmall}>
                  <label className={styles.label}>Es estibable</label>
                  <div className={styles.toggleContainer}>
                    <div
                      className={`${styles.toggleSwitch} ${merchandiseForm.stackable ? styles.active : ''}`}
                      onClick={() => setMerchandiseForm({ ...merchandiseForm, stackable: !merchandiseForm.stackable })}
                    >
                      <div className={styles.toggleThumb}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Descripción de mercancía</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={merchandiseForm.description}
                  onChange={(e) => setMerchandiseForm({ ...merchandiseForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>Clasificación de la mercancía
                </label>
                <div className={styles.classificationGrid}>
                  <div className={styles.classificationColumn}>
                    <div className={styles.classificationCheckbox}>
                      <input
                        type="checkbox"
                        id="peligrosa"
                        className={styles.checkbox}
                        checked={merchandiseForm.dangerous}
                        onChange={(e) => setMerchandiseForm({ ...merchandiseForm, dangerous: e.target.checked })}
                      />
                      <label htmlFor="peligrosa" className={styles.classificationLabel}>
                        Peligrosa
                      </label>
                    </div>
                    <div className={styles.classificationCheckbox}>
                      <input
                        type="checkbox"
                        id="refrigerada"
                        className={styles.checkbox}
                        checked={merchandiseForm.refrigerated}
                        onChange={(e) => setMerchandiseForm({ ...merchandiseForm, refrigerated: e.target.checked })}
                      />
                      <label htmlFor="refrigerada" className={styles.classificationLabel}>
                        Refrigerada
                      </label>
                    </div>
                    <div className={styles.classificationCheckbox}>
                      <input
                        type="checkbox"
                        id="sobredimensionada"
                        className={styles.checkbox}
                        checked={merchandiseForm.oversized}
                        onChange={(e) => setMerchandiseForm({ ...merchandiseForm, oversized: e.target.checked })}
                      />
                      <label htmlFor="sobredimensionada" className={styles.classificationLabel}>
                        Sobredimensionada
                      </label>
                    </div>
                  </div>
                  <div className={styles.classificationColumn}>
                    {merchandiseForm.dangerous && (
                      <div className={styles.formGroup}>
                        <label className={styles.label}>IMO</label>
                        <select
                          className={styles.select}
                          value={merchandiseForm.imoClass}
                          onChange={(e) => setMerchandiseForm({ ...merchandiseForm, imoClass: e.target.value })}
                        >
                          <option value="">Seleccionar</option>
                          <option>1.1 Materia y explosivos</option>
                          <option>2.1 Gases inflamables</option>
                          <option>3 Líquidos inflamables</option>
                          <option>4.1 Sólidos inflamables</option>
                          <option>5.1 Sustancias comburentes</option>
                          <option>6.1 Sustancias tóxicas</option>
                          <option>7 Material radioactivo</option>
                          <option>8 Sustancias corrosivas</option>
                          <option>9 Sustancias peligrosas varias</option>
                        </select>
                      </div>
                    )}
                    {merchandiseForm.refrigerated && (
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Temperatura</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="80"
                            className={styles.input}
                            style={{ flex: 1 }}
                            value={merchandiseForm.temperature}
                            onChange={(e) => setMerchandiseForm({ ...merchandiseForm, temperature: e.target.value })}
                          />
                          <select
                            className={styles.select}
                            style={{ width: '80px' }}
                            value={merchandiseForm.tempUnit}
                            onChange={(e) => setMerchandiseForm({ ...merchandiseForm, tempUnit: e.target.value })}
                          >
                            <option>°C</option>
                            <option>°F</option>
                          </select>
                        </div>
                      </div>
                    )}
                    <div className={styles.classificationCheckbox}>
                      <input
                        type="checkbox"
                        id="granel"
                        className={styles.checkbox}
                        checked={merchandiseForm.grain}
                        onChange={(e) => setMerchandiseForm({ ...merchandiseForm, grain: e.target.checked })}
                      />
                      <label htmlFor="granel" className={styles.classificationLabel}>
                        Granel
                      </label>
                    </div>
                  </div>
                  <div className={styles.classificationColumn}>
                    {merchandiseForm.dangerous && (
                      <div className={styles.formGroup}>
                        <label className={styles.label}>UN</label>
                        <input
                          type="text"
                          placeholder="19"
                          className={styles.input}
                          value={merchandiseForm.un}
                          onChange={(e) => setMerchandiseForm({ ...merchandiseForm, un: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button className={styles.addPackageButtonIcon} onClick={openPackagingModal}>
                  <Plus size={18} />
                  Agregar embalaje
                </button>
                {currentPackages.length > 0 && (
                  <div className={styles.packagesTable} style={{ marginTop: '1rem' }}>
                    <table className={styles.simpleTable}>
                      <thead>
                        <tr>
                          <th>EMBALAJE</th>
                          <th>CANTIDAD</th>
                          <th>LARGO</th>
                          <th>ALTO</th>
                          <th>ANCHO</th>
                          <th>PESO</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPackages.map((pkg) => (
                          <tr key={pkg.id}>
                            <td>{pkg.type}</td>
                            <td>{pkg.quantity}</td>
                            <td>{pkg.length}</td>
                            <td>{pkg.height}</td>
                            <td>{pkg.width}</td>
                            <td>{pkg.weight}</td>
                            <td>
                              <button
                                className={styles.removeRowButton}
                                onClick={() => removePackage(pkg.id)}
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className={styles.modalFooterInfo}>
                <div className={styles.unitTypeToggle}>
                  <span className={!useMetricSystem ? styles.activeUnitLabel : ''}>Lbs/Pulgadas</span>
                  <div
                    className={`${styles.toggleSwitch} ${useMetricSystem ? styles.active : ''}`}
                    onClick={() => setUseMetricSystem(!useMetricSystem)}
                  >
                    <div className={styles.toggleThumb}></div>
                  </div>
                  <span className={useMetricSystem ? styles.activeUnitLabel : ''}>Kgm/Cm</span>
                </div>
                <div className={styles.totalsDisplay}>
                  <div>
                    <div className={styles.totalLabel}>Volumen total</div>
                    <div className={styles.totalValue}>90 KG</div>
                  </div>
                  <div>
                    <div className={styles.totalLabel}>Peso total</div>
                    <div className={styles.totalValue}>90 KG</div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveModalButton} onClick={closeMerchandiseModal}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showExecutiveModal && (
        <div className={styles.modalOverlay} onClick={closeExecutiveModal}>
          <div className={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Seleccionar Ejecutivo</h2>
              <button className={styles.closeButton} onClick={closeExecutiveModal}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.executiveSelectionList}>
                {availableExecutives
                  .filter(exec => !executives.some(e => e.id === exec._id))
                  .map((executive) => (
                    <div
                      key={executive._id}
                      className={styles.executiveSelectionItem}
                      onClick={() => addExecutive({ id: executive._id, name: `${executive.first_name} ${executive.last_name}` })}
                    >
                      <span>{executive.first_name} {executive.last_name}</span>
                      <Plus size={18} className={styles.addIcon} />
                    </div>
                  ))}
                {availableExecutives.filter(exec => !executives.some(e => e.id === exec._id)).length === 0 && (
                  <div className={styles.noExecutivesMessage}>
                    Todos los ejecutivos disponibles ya han sido agregados
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showPackagingModal && (
        <div className={styles.modalOverlay} onClick={closePackagingModal}>
          <div className={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Agregar Embalaje</h2>
              <button className={styles.closeButton} onClick={closePackagingModal}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>Tipo de embalaje
                </label>
                <select
                  className={styles.select}
                  id="package-type"
                  defaultValue=""
                >
                  <option value="">Seleccionar</option>
                  <option>Caja</option>
                  <option>Bulto</option>
                  <option>Palet</option>
                  <option>Contenedor</option>
                  <option>Tambor</option>
                  <option>Saco</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>Cantidad
                </label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="50"
                  id="package-quantity"
                />
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>Largo ({useMetricSystem ? 'cm' : 'plg'})
                  </label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="40"
                    id="package-length"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>Alto ({useMetricSystem ? 'cm' : 'plg'})
                  </label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="50"
                    id="package-height"
                  />
                </div>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>Ancho ({useMetricSystem ? 'cm' : 'plg'})
                  </label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="30"
                    id="package-width"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>Peso ({useMetricSystem ? 'kg' : 'lbs'})
                  </label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="30"
                    id="package-weight"
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.saveModalButton}
                onClick={() => {
                  const type = (document.getElementById('package-type') as HTMLSelectElement).value;
                  const quantity = (document.getElementById('package-quantity') as HTMLInputElement).value;
                  const length = (document.getElementById('package-length') as HTMLInputElement).value;
                  const height = (document.getElementById('package-height') as HTMLInputElement).value;
                  const width = (document.getElementById('package-width') as HTMLInputElement).value;
                  const weight = (document.getElementById('package-weight') as HTMLInputElement).value;

                  if (type && quantity && length && height && width && weight) {
                    addPackage({
                      type,
                      quantity: parseInt(quantity),
                      length: parseInt(length),
                      height: parseInt(height),
                      width: parseInt(width),
                      weight: parseInt(weight),
                    });
                  }
                }}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
