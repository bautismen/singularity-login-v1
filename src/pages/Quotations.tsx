import React, { useState, useEffect } from 'react';
import { Trash2, ChevronDown, Plus, Copy, X, MapPin, Search, RotateCcw, Save, Eye, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Modal } from '../components/Modal';
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
  merchandise_classification?: any[];
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
  insurance: boolean;
  maneuver: boolean;
  custody: boolean;
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
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [executives, setExecutives] = useState<Executive[]>([]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'info' | 'warning' | 'error' | 'success' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
    showCancel?: boolean;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [requestTypes, setRequestTypes] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [availableExecutives, setAvailableExecutives] = useState<any[]>([]);
  const [incoterms, setIncoterms] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [imoList, setImoList] = useState<any[]>([]);

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
    imoId: 0,
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

  const generateReferenceNumber = async () => {
    try {
      const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const BASE_URL = import.meta.env.VITE_SUPABASE_URL;

      const response = await fetch(`${BASE_URL}/functions/v1/quotation-requests`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const quotations = await response.json();

      const currentYear = new Date().getFullYear().toString().slice(-2);

      const yearPrefix = `SC${currentYear}-`;
      const currentYearQuotations = quotations.filter((q: any) =>
        q.reference_request?.startsWith(yearPrefix)
      );

      let nextSequence = 1;
      if (currentYearQuotations.length > 0) {
        const sequences = currentYearQuotations
          .map((q: any) => {
            const parts = q.reference_request?.split('-');
            return parts && parts.length > 1 ? parseInt(parts[1]) : 0;
          })
          .filter((n: number) => !isNaN(n));

        if (sequences.length > 0) {
          nextSequence = Math.max(...sequences) + 1;
        }
      }

      const referenceNumber = `${yearPrefix}${nextSequence.toString().padStart(4, '0')}`;

      setFormData(prev => ({ ...prev, referenceRequest: referenceNumber }));
    } catch (error) {
      console.error('Error generating reference number:', error);
    }
  };

  useEffect(() => {
    loadCatalogs();
    if (mode === 'create') {
      generateReferenceNumber();
    }
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

      const [customersRes, requestTypesRes, servicesRes, executivesRes, incotermsRes, countriesRes, imoRes] = await Promise.all([
        fetch(`${BASE_URL}/functions/v1/customers`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${BASE_URL}/functions/v1/catalog-request-types`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${BASE_URL}/functions/v1/catalog-services`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${BASE_URL}/functions/v1/executives?departamento=Pricing`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${BASE_URL}/functions/v1/catalog-incoterms`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${BASE_URL}/functions/v1/catalog-countries`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${BASE_URL}/functions/v1/catalog-imo`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),
      ]);

      const customersData = await customersRes.json();
      const requestTypesData = await requestTypesRes.json();
      const servicesData = await servicesRes.json();
      const executivesData = await executivesRes.json();
      const incotermsData = await incotermsRes.json();
      const countriesData = await countriesRes.json();
      const imoData = await imoRes.json();

      console.log('Customers loaded:', customersData);
      console.log('Request types loaded:', requestTypesData);

      setCustomers(customersData.filter((c: any) => c.status === 'activo' || c.datastate === 1));
      setRequestTypes(requestTypesData.filter((r: any) => r.status === 1));
      setAvailableServices(servicesData.filter((s: any) => s.status === 1 && s.category === 1));
      setAvailableExecutives(executivesData.filter((e: any) => e.estado === 1 && e.activo === true));
      setIncoterms(incotermsData.filter((i: any) => i.status === 1));
      setCountries(countriesData.filter((co: any) => co.status === 1));
      setImoList(imoData.filter((imo: any) => imo.status === 1));
    } catch (error) {
      console.error('Error loading catalogs:', error);
      showError('Error al cargar los catálogos');
    } finally {
      setLoading(false);
    }
  };

  const loadQuotation = async (id: string) => {
    try {
      setLoading(true);
      const data = await quotationService.getById(id);

      console.log('Loading quotation:', data);

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

      if (data.services && data.services.length > 0) {
        const loadedServices = data.services.map((svc: any, idx: number) => {
          const shipment = svc.shipments?.[0] || {};
          const cargo = shipment.cargo?.[0] || {};

          const servicesAssociated = shipment.services_asociated || [];
          const hasInsurance = servicesAssociated.some((s: any) => s.service_associated_name === 'Seguro');
          const hasManeuver = servicesAssociated.some((s: any) => s.service_associated_name === 'Maniobra');
          const hasCustody = servicesAssociated.some((s: any) => s.service_associated_name === 'Custodia');
          const hasInspection = servicesAssociated.some((s: any) => s.service_associated_name === 'Inspección');
          const hasCustomsClearance = servicesAssociated.some((s: any) => s.service_associated_name === 'Despacho aduanal');

          const projection = shipment.projection_shipment || {};
          const hasProjection = !!projection.num;

          const frequencyMap: { [key: number]: string } = { 1: 'semanal', 2: 'mensual', 3: 'anual' };
          const unitMap: { [key: number]: string } = { 1: 'Kilos', 2: 'Toneladas', 3: 'Contenedores' };

          return {
            id: idx + 1,
            service: svc.service_name || '',
            operation: shipment.operation_type_name || '',
            incoterm: shipment.incoterm || '',
            origin: shipment.origin?.country_code || '',
            destination: shipment.destination?.country_code || '',
            destinationZip: shipment.destination?.zipcode || '',
            expectedDeparture: shipment.departure_date_approximate?.$date ? new Date(shipment.departure_date_approximate.$date).toISOString().split('T')[0] : (shipment.departure_date_approximate ? new Date(shipment.departure_date_approximate).toISOString().split('T')[0] : ''),
            insurance: hasInsurance,
            maneuver: hasManeuver,
            custody: hasCustody,
            inspection: hasInspection,
            customsClearance: hasCustomsClearance,
            comments: shipment.comments || '',
            shippingType: shipment.shippment_type_name || 'Door to Door',
            programFrequency: hasProjection,
            frequency: projection._id_frecuency ? frequencyMap[projection._id_frecuency] || '' : '',
            quantity: projection.num ? String(projection.num) : '',
            unit: projection._id_measurement_frecuency ? unitMap[projection._id_measurement_frecuency] || '' : '',
            merchandise: shipment.cargo?.map((c: any, cIdx: number) => {
              const classifications = c.merchandise_classification || [];

              const dangerousClass = classifications.find((cl: any) => cl._id_merchandise_classification === 5);
              const refrigeratedClass = classifications.find((cl: any) => cl._id_merchandise_classification === 3);
              const grainClass = classifications.find((cl: any) => cl._id_merchandise_classification === 2);
              const oversizedClass = classifications.find((cl: any) => cl._id_merchandise_classification === 4);

              return {
                id: cIdx + 1,
                name: c.merchandise_name || '',
                description: c.merchandise_description || '',
                dangerous: !!dangerousClass,
                refrigerated: !!refrigeratedClass,
                oversized: !!oversizedClass,
                imoClass: dangerousClass ? `${dangerousClass.imo} ${dangerousClass.description_imo}` : '',
                un: dangerousClass ? String(dangerousClass.UN || '') : '',
                temperature: refrigeratedClass ? (refrigeratedClass.temperature || 0) : 0,
                tempUnit: refrigeratedClass ? (refrigeratedClass.unit_temperature || '°C') : '°C',
                grain: !!grainClass,
                stackable: c.stowable || false,
                unitType: (c.unit_weight === 'KG' || c._id_unit_weigh === 1) ? 'kg' as const : 'lbs' as const,
                totalVolume: c.volume_total || 0,
                totalWeight: c.weigth_total || 0,
                packages: c.unit || [],
                merchandise_classification: classifications
              };
            }) || []
          };
        });
        setServices(loadedServices);
        console.log('Loaded services:', loadedServices);
      }

      if (data.assigned_to && data.assigned_to.length > 0) {
        const loadedExecutives = data.assigned_to.map((exec: any, idx: number) => ({
          id: typeof exec._id_executive === 'object' && exec._id_executive.$oid
            ? exec._id_executive.$oid
            : exec._id_executive || idx + 1,
          name: exec.complete_name || ''
        }));
        setExecutives(loadedExecutives);
        console.log('Loaded executives:', loadedExecutives);
      }
    } catch (error) {
      console.error('Error loading quotation:', error);
      showError('Error al cargar la cotización');
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
      insurance: false,
      maneuver: false,
      custody: false,
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
      const classifications = merchandise.merchandise_classification || [];
      const dangerousClass = classifications.find((cl: any) => cl._id_merchandise_classification === 5);

      setMerchandiseForm({
        name: merchandise.name,
        description: merchandise.description || '',
        dangerous: merchandise.dangerous,
        refrigerated: merchandise.refrigerated,
        oversized: merchandise.oversized,
        grain: merchandise.grain,
        stackable: merchandise.stackable,
        imoClass: merchandise.imoClass || '',
        imoId: dangerousClass?._id_imo || 0,
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
        imoId: 0,
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
    setCurrentPackages([...currentPackages, {
      ...pkg,
      id: Date.now(),
      unit: useMetricSystem ? 'metric' : 'imperial'
    }]);
    closePackagingModal();
  };

  const removePackage = (packageId: number) => {
    setCurrentPackages(currentPackages.filter(p => p.id !== packageId));
  };

  const calculateTotals = () => {
    let totalVolume = 0;
    let totalWeight = 0;

    currentPackages.forEach(pkg => {
      const volume = (pkg.length * pkg.height * pkg.width) * pkg.quantity;
      const weight = pkg.weight * pkg.quantity;
      totalVolume += volume;
      totalWeight += weight;
    });

    return { totalVolume, totalWeight };
  };

  const saveMerchandise = () => {
    if (!currentServiceId) return;

    if (!merchandiseForm.name.trim()) {
      showWarning('Por favor ingresa el nombre de la mercancía');
      return;
    }

    const { totalVolume, totalWeight } = calculateTotals();

    const merchandiseClassifications: any[] = [];

    if (merchandiseForm.dangerous) {
      const selectedImo = imoList.find(imo => imo._id === merchandiseForm.imoId);
      merchandiseClassifications.push({
        _id_merchandise_classification: 5,
        merchandise_name_classification: t('quote.dangerousClass'),
        _id_imo: merchandiseForm.imoId,
        imo: selectedImo?.imo || '',
        description_imo: selectedImo?.description || '',
        UN: parseInt(merchandiseForm.un) || 0
      });
    }

    if (merchandiseForm.refrigerated) {
      merchandiseClassifications.push({
        _id_merchandise_classification: 3,
        merchandise_name_classification: t('quote.refrigeratedClass'),
        _idunit_temperature: merchandiseForm.tempUnit === '°C' ? 1 : 2,
        unit_temperature: merchandiseForm.tempUnit,
        temperature: parseFloat(merchandiseForm.temperature) || 0
      });
    }

    if (merchandiseForm.grain) {
      merchandiseClassifications.push({
        _id_merchandise_classification: 2,
        merchandise_name_classification: "A granel"
      });
    }

    if (merchandiseForm.oversized) {
      merchandiseClassifications.push({
        _id_merchandise_classification: 4,
        merchandise_name_classification: t('quote.oversizedClass')
      });
    }

    if (merchandiseClassifications.length === 0) {
      merchandiseClassifications.push({
        _id_merchandise_classification: 1,
        merchandise_name_classification: t('quote.generalClass')
      });
    }

    const newMerchandise: Merchandise = {
      id: editingMerchandise?.id || Date.now(),
      name: merchandiseForm.name,
      description: merchandiseForm.description,
      dangerous: merchandiseForm.dangerous,
      refrigerated: merchandiseForm.refrigerated,
      oversized: merchandiseForm.oversized,
      grain: merchandiseForm.grain,
      stackable: merchandiseForm.stackable,
      imoClass: merchandiseForm.dangerous ? merchandiseForm.imoClass : '',
      un: merchandiseForm.dangerous ? merchandiseForm.un : '',
      temperature: merchandiseForm.refrigerated ? parseFloat(merchandiseForm.temperature) || 0 : 0,
      tempUnit: merchandiseForm.refrigerated ? merchandiseForm.tempUnit : '°C',
      unitType: useMetricSystem ? 'kg' : 'lbs',
      totalVolume,
      totalWeight,
      packages: currentPackages.map(pkg => ({
        ...pkg,
        unit: useMetricSystem ? 'metric' : 'imperial'
      })),
      merchandise_classification: merchandiseClassifications
    };

    setServices(services.map(service => {
      if (service.id === currentServiceId) {
        if (editingMerchandise) {
          return {
            ...service,
            merchandise: service.merchandise.map(m =>
              m.id === editingMerchandise.id ? newMerchandise : m
            )
          };
        } else {
          return {
            ...service,
            merchandise: [...service.merchandise, newMerchandise]
          };
        }
      }
      return service;
    }));

    console.log('Merchandise saved with classifications:', newMerchandise);
    closeMerchandiseModal();
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

  const handleStatusUpdate = async (statusId: number, statusName: string) => {
    try {
      setSaving(true);

      if (!formData.referenceRequest || !formData.customerId || !formData.requestTypeId) {
        showWarning(t('quote.warnings.requiredFields'));
        setSaving(false);
        return;
      }

      const selectedCustomer = customers.find(c => c._id === formData.customerId);
      const selectedRequestType = requestTypes.find(r => r._id === parseInt(formData.requestTypeId) || r._id === formData.requestTypeId);

      if (!selectedRequestType) {
        showError(t('quote.errors.requestTypeNotFound'));
        setSaving(false);
        return;
      }

      const quotationData = {
        reference_request: formData.referenceRequest,
        priority: formData.isPriority ? 1 : 0,
        customer_category: formData.customerCategory,
        _id_status_request: statusId,
        status_request_name: statusName,
        request_date: new Date(formData.created),
        deadline_date: formData.responseDeadline ? new Date(formData.responseDeadline) : null,
        _id_request_type: selectedRequestType._id,
        request_type_name: selectedRequestType.request_type_name,
        _id_customer: formData.customerId,
        customer_business_name: selectedCustomer?.fiscal_data?.business_name || formData.client,
        licitation: formData.isQuote,
        requesting_data: user ? {
          _id_executive: user._id,
          complete_name: user.name || user.email,
        } : {},
        assigned_to: executives.map(exec => ({
          _id_executive: exec.id,
          complete_name: exec.name,
          control_number: 'SN',
        })),
        services: services.map((service, idx) => {
          const selectedService = availableServices.find(s => s.service_name === service.service);

          const servicesAssociated: any[] = [];
          if (service.insurance) {
            const insuranceService = availableServices.find(s => s.service_name === 'Seguro');
            servicesAssociated.push({
              _id_service_associated: insuranceService?._id || null,
              service_associated_name: 'Seguro'
            });
          }
          if (service.maneuver) {
            const maneuverService = availableServices.find(s => s.service_name === 'Maniobra');
            servicesAssociated.push({
              _id_service_associated: maneuverService?._id || null,
              service_associated_name: 'Maniobra'
            });
          }
          if (service.custody) {
            const custodyService = availableServices.find(s => s.service_name === 'Custodia');
            servicesAssociated.push({
              _id_service_associated: custodyService?._id || null,
              service_associated_name: 'Custodia'
            });
          }
          if (service.inspection) {
            const inspectionService = availableServices.find(s => s.service_name === 'Inspección');
            servicesAssociated.push({
              _id_service_associated: inspectionService?._id || null,
              service_associated_name: 'Inspección'
            });
          }
          if (service.customsClearance) {
            const customsClearanceService = availableServices.find(s => s.service_name === 'Despacho aduanal');
            servicesAssociated.push({
              _id_service_associated: customsClearanceService?._id || null,
              service_associated_name: 'Despacho aduanal'
            });
          }

          const frequencyMap: { [key: string]: number } = { 'semanal': 1, 'mensual': 2, 'anual': 3 };
          const unitMap: { [key: string]: number } = { 'Kilos': 1, 'Toneladas': 2, 'Contenedores': 3 };
          const operationTypeMap: { [key: string]: number } = { 'Exportación': 1, 'Importación': 2, 'Nacional': 3, 'Local USA': 4, 'Triangulación': 5 };
          const shipmentTypeMap: { [key: string]: number } = { 'Door to Door': 1, 'Port to Port': 2, 'Door to Port': 3, 'Port to Door': 4 };

          const projectionShipment = service.programFrequency && service.quantity && service.frequency && service.unit ? {
            num: parseInt(service.quantity),
            _id_measurement_frecuency: unitMap[service.unit] || 0,
            measurement_frecuency: service.unit,
            _id_frecuency: frequencyMap[service.frequency] || 0,
            frecuency: service.frequency,
          } : undefined;

          const originCountry = countries.find(c => c.country_code === service.origin);
          const destinationCountry = countries.find(c => c.country_code === service.destination);
          const selectedIncoterm = incoterms.find(i => i.incoterm_name === service.incoterm);

          return {
            id_service_item: idx + 1,
            id_service: selectedService?.id_service || null,
            service_name: service.service,
            ...(mode === 'create' && { used: false }),
            shipments: [{
            id_shipment_item: 1,
            origin: {
              _id_country: originCountry?._id || null,
              id_country: originCountry?.id_country || 0,
              country_code: service.origin,
              location: ""
            },
            destination: {
              _id_country: destinationCountry?._id || null,
              id_country: destinationCountry?.id_country || 0,
              country_code: service.destination,
              location: "",
              zipcode: service.destinationZip
            },
            destiny_zipcode: service.destinationZip,
            _id_shipment_type: shipmentTypeMap[service.shippingType] || 1,
            shippment_type_name: service.shippingType,
            _id_operation_type: operationTypeMap[service.operation] || 1,
            operation_type_name: service.operation,
            _id_incoterm: selectedIncoterm?._id || 0,
            incoterm: service.incoterm,
            ...(service.expectedDeparture && { departure_date_approximate: { $date: new Date(service.expectedDeparture).toISOString() } }),
            ...(projectionShipment && { projection_shipment: projectionShipment }),
            _id_status_shipment: 101,
            last_status_shipment: "Pendiente",
            comments: service.comments || '',
            services_asociated: servicesAssociated,
            cargo: service.merchandise.map((merch: Merchandise, merchIdx: number) => ({
              id_merchandise_item: merchIdx + 1,
              merchandise_name: merch.name,
              merchandise_description: merch.description,
              merchandise_classification: merch.merchandise_classification || [],
              stowable: merch.stackable,
              _id_shipment_type: 1,
              shipment_type: "Suelta",
              _id_unit_cargo: 1,
              unit_cargo: "Caja",
              _id_unit_measurement: 1,
              unit_measurement: "CM",
              _id_unit_weigh: merch.unitType === 'kg' ? 1 : 2,
              unit_weight: merch.unitType === 'kg' ? 'KG' : 'Libras',
              volume_total: merch.totalVolume,
              weigth_total: merch.totalWeight,
              unit: merch.packages?.map((pkg: any, pkgIdx: number) => ({
                quantity: pkg.quantity,
                length: pkg.length,
                height: pkg.height,
                width: pkg.width,
                weigth: pkg.weight
              })) || []
            }))
          }]
        };
        }),
      };

      if (mode === 'edit' && quotationId) {
        await quotationService.update(quotationId, quotationData);
        showSuccess(t('quote.success.statusUpdated').replace('{status}', statusName));
      }

      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('Error updating quotation status:', error);
      showError('Error al actualizar el estado de la cotización');
    } finally {
      setSaving(false);
    }
  };

  const handleSendQuotation = () => {
    handleStatusUpdate(2, 'Enviada');
  };

  const handleCancelQuotation = () => {
    handleStatusUpdate(3, 'Cancelada');
  };

  const handleSaveQuotation = async () => {
    try {
      setSaving(true);

      console.log('Form data:', formData);
      console.log('Reference:', formData.referenceRequest);
      console.log('Customer ID:', formData.customerId);
      console.log('Request Type ID:', formData.requestTypeId);

      if (!formData.referenceRequest || !formData.customerId || !formData.requestTypeId) {
        showWarning(`Por favor completa los campos requeridos:\nReferencia: ${formData.referenceRequest || 'FALTA'}\nCliente: ${formData.customerId || 'FALTA'}\nTipo de solicitud: ${formData.requestTypeId || 'FALTA'}`);
        setSaving(false);
        return;
      }

      const selectedCustomer = customers.find(c => c._id === formData.customerId);
      const selectedRequestType = requestTypes.find(r => r._id === parseInt(formData.requestTypeId) || r._id === formData.requestTypeId);
      const selectedExecutive = availableExecutives.length > 0 ? availableExecutives[0] : null;

      console.log('Selected customer:', selectedCustomer);
      console.log('Selected request type:', selectedRequestType);
      console.log('Services to save:', services);
      console.log('Executives to save:', executives);

      if (!selectedRequestType) {
        showError('Error: No se pudo encontrar el tipo de solicitud seleccionado');
        setSaving(false);
        return;
      }

      const hasAssignedExecutives = executives.length > 0;
      const quotationData = {
        reference_request: formData.referenceRequest,
        priority: formData.isPriority ? 1 : 0,
        customer_category: formData.customerCategory,
        _id_status_request: hasAssignedExecutives ? 4 : 1,
        status_request_name: hasAssignedExecutives ? 'Asignada' : 'Nueva',
        request_date: new Date(formData.created),
        deadline_date: formData.responseDeadline ? new Date(formData.responseDeadline) : null,
        _id_request_type: selectedRequestType._id,
        request_type_name: selectedRequestType.request_type_name,
        _id_customer: formData.customerId,
        customer_business_name: selectedCustomer?.fiscal_data?.business_name || formData.client,
        licitation: formData.isQuote,
        requesting_data: user ? {
          _id_executive: user._id,
          complete_name: user.name || user.email,
        } : {},
        assigned_to: executives.map(exec => ({
          _id_executive: exec.id,
          complete_name: exec.name,
          control_number: 'SN',
        })),
        services: services.map((service, idx) => {
          const selectedService = availableServices.find(s => s.service_name === service.service);

          const servicesAssociated: any[] = [];
          if (service.insurance) {
            const insuranceService = availableServices.find(s => s.service_name === 'Seguro');
            servicesAssociated.push({
              _id_service_associated: insuranceService?._id || null,
              service_associated_name: 'Seguro'
            });
          }
          if (service.maneuver) {
            const maneuverService = availableServices.find(s => s.service_name === 'Maniobra');
            servicesAssociated.push({
              _id_service_associated: maneuverService?._id || null,
              service_associated_name: 'Maniobra'
            });
          }
          if (service.custody) {
            const custodyService = availableServices.find(s => s.service_name === 'Custodia');
            servicesAssociated.push({
              _id_service_associated: custodyService?._id || null,
              service_associated_name: 'Custodia'
            });
          }
          if (service.inspection) {
            const inspectionService = availableServices.find(s => s.service_name === 'Inspección');
            servicesAssociated.push({
              _id_service_associated: inspectionService?._id || null,
              service_associated_name: 'Inspección'
            });
          }
          if (service.customsClearance) {
            const customsClearanceService = availableServices.find(s => s.service_name === 'Despacho aduanal');
            servicesAssociated.push({
              _id_service_associated: customsClearanceService?._id || null,
              service_associated_name: 'Despacho aduanal'
            });
          }

          const frequencyMap: { [key: string]: number } = { 'semanal': 1, 'mensual': 2, 'anual': 3 };
          const unitMap: { [key: string]: number } = { 'Kilos': 1, 'Toneladas': 2, 'Contenedores': 3 };

          const projectionShipment = service.programFrequency && service.quantity && service.frequency && service.unit ? {
            num: parseInt(service.quantity),
            _id_measurement_frecuency: unitMap[service.unit] || 0,
            measurement_frecuency: service.unit,
            _id_frecuency: frequencyMap[service.frequency] || 0,
            frecuency: service.frequency,
          } : undefined;

          return {
            id_service_item: idx + 1,
            _id_service: selectedService?._id || null,
            service_name: service.service,
            ...(mode === 'create' && { used: false }),
            shipments: [{
            id_shipment_item: 1,
            origin: {
              location: service.origin,
            },
            destination: {
              location: service.destination,
            },
            destiny_zipcode: service.destinationZip,
            _id_shipment_type: service.shippingType === 'Door to Door' ? 1 : 2,
            shippment_type_name: service.shippingType,
            _id_operation_type: service.operation === 'Exportación' ? 1 : service.operation === 'Importación' ? 2 : 3,
            operation_type_name: service.operation,
            _id_incoterm: incoterms.find(i => i.incoterm === service.incoterm)?._id || null,
            incoterm: service.incoterm,
            departure_date_approximate: service.expectedDeparture ? new Date(service.expectedDeparture) : null,
            comments: service.comments,
            ...(servicesAssociated.length > 0 && { services_asociated: servicesAssociated }),
            ...(projectionShipment && { projection_shipment: projectionShipment }),
            cargo: service.merchandise.map(merch => ({
              merchandise_name: merch.name,
              merchandise_description: merch.description,
              merchandise_classification: merch.merchandise_classification || [],
              stowable: merch.stackable,
              volume_total: merch.totalVolume,
              weigth_total: merch.totalWeight,
              unit: merch.packages,
            })),
          }],
        };
        }),
      };

      console.log('=== QUOTATION DATA TO SAVE ===');
      console.log(JSON.stringify(quotationData, null, 2));
      console.log('Services count:', quotationData.services.length);
      console.log('Executives count:', quotationData.assigned_to.length);

      if (quotationData.services.length === 0) {
        setModalState({
          isOpen: true,
          type: 'warning',
          title: t('quote.noServicesTitle'),
          message: t('quote.noServicesMessage'),
          showCancel: true,
          onConfirm: async () => {
            if (quotationData.assigned_to.length === 0) {
              setModalState({
                isOpen: true,
                type: 'warning',
                title: t('quote.noExecutivesTitle'),
                message: t('quote.noExecutivesMessage'),
                showCancel: true,
                onConfirm: async () => {
                  await performSave(quotationData);
                }
              });
            } else {
              await performSave(quotationData);
            }
          }
        });
        setSaving(false);
        return;
      }

      if (quotationData.assigned_to.length === 0) {
        setModalState({
          isOpen: true,
          type: 'warning',
          title: t('quote.noExecutivesTitle'),
          message: t('quote.noExecutivesMessage'),
          showCancel: true,
          onConfirm: async () => {
            await performSave(quotationData);
          }
        });
        setSaving(false);
        return;
      }

      await performSave(quotationData);
    } catch (error) {
      console.error('Error saving quotation:', error);
      showError('Error al guardar la cotización');
    } finally {
      setSaving(false);
    }
  };

  const performSave = async (quotationData: any) => {
    try {
      setSaving(true);
      if (mode === 'edit' && quotationId) {
        const result = await quotationService.update(quotationId, quotationData);
        console.log('Update result:', result);
        showSuccess('Cotización actualizada exitosamente');
      } else {
        const result = await quotationService.create(quotationData);
        console.log('Create result:', result);
        showSuccess('Cotización creada exitosamente');
      }

      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('Error in performSave:', error);
      showError('Error al guardar la cotización');
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
              className={styles.backButton}
              title="Volver a lista"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className={styles.title}>
            {mode === 'view' ? 'Ver Cotización' : mode === 'edit' ? 'Editar solicitud' : t('quote.title')}
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
        <h2 className={styles.sectionTitle}>{t('quote.generalData')}</h2>
        <div className={styles.generalDataGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>{t('quote.reference')}
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
              <span className={styles.required}>*</span>{t('quote.client')}
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
              <option value="">{t('quote.selectClient')}</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.fiscal_data?.business_name || customer.commercial_name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>{t('quote.requestType')}
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
              <option value="">{t('quote.selectType')}</option>
              {requestTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.request_type_name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('quote.customerCategory')}</label>
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

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('quote.responseDeadline')}</label>
            <input
              type="date"
              value={formData.responseDeadline}
              onChange={(e) => setFormData({ ...formData, responseDeadline: e.target.value })}
              className={styles.input}
              placeholder="dd/mm/aaaa"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>{t('quote.requestDate')}
            </label>
            <input
              type="date"
              value={formData.created}
              onChange={(e) => setFormData({ ...formData, created: e.target.value })}
              className={styles.input}
              disabled={mode === 'view'}
            />
          </div>

          <div className={styles.formGroupWithToggle}>
            <label className={styles.label}>{t('quote.isPriority')}</label>
            <div
              className={`${styles.toggleSwitch} ${formData.isPriority ? styles.active : ''}`}
              onClick={() => setFormData({ ...formData, isPriority: !formData.isPriority })}
            >
              <div className={styles.toggleThumb}></div>
            </div>
          </div>

          <div className={styles.formGroupWithToggle}>
            <label className={styles.label}>{t('quote.isBid')}</label>
            <div
              className={`${styles.toggleSwitch} ${formData.isQuote ? styles.active : ''}`}
              onClick={() => setFormData({ ...formData, isQuote: !formData.isQuote })}
            >
              <div className={styles.toggleThumb}></div>
            </div>
          </div>

          {mode === 'edit' && (
            <div className={styles.statusButtonsContainer}>
              <button
                className={styles.cancelButton}
                onClick={handleCancelQuotation}
                disabled={saving}
              >
                {t('quote.cancel')}
              </button>
              <button
                className={styles.sendButton}
                onClick={handleSendQuotation}
                disabled={saving}
              >
                {t('quote.send')}
              </button>
            </div>
          )}
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
                  <option value="">{t('quote.select')}</option>
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
                  <option value="">{t('quote.select')}</option>
                  <option>{t('quote.export')}</option>
                  <option>{t('quote.import')}</option>
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
                  <option value="">{t('quote.select')}</option>
                  {incoterms.map((inc) => (
                    <option key={inc._id} value={inc.incoterm}>
                      {inc.incoterm}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGrid} style={{ marginTop: '1.25rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.origin')}
                </label>
                <select
                  value={service.origin}
                  onChange={(e) => updateService(service.id, 'origin', e.target.value)}
                  className={styles.select}
                  disabled={loading || mode === 'view'}
                >
                  <option value="">Seleccionar país...</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country.country_code}>
                      {country.name_country}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.destination')}
                </label>
                <select
                  value={service.destination}
                  onChange={(e) => updateService(service.id, 'destination', e.target.value)}
                  className={styles.select}
                  disabled={loading || mode === 'view'}
                >
                  <option value="">Seleccionar país...</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country.country_code}>
                      {country.name_country}
                    </option>
                  ))}
                </select>
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
                <label className={styles.label}>{t('quote.expectedDeparture')}</label>
                <input
                  type="date"
                  value={service.expectedDeparture}
                  onChange={(e) => updateService(service.id, 'expectedDeparture', e.target.value)}
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
                  <option>{t('quote.doorToDoor')}</option>
                  <option>{t('quote.portToPort')}</option>
                  <option>{t('quote.doorToPort')}</option>
                  <option>{t('quote.portToDoor')}</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label className={styles.label}>{t('quote.associatedServices')}</label>
              <div className={styles.associatedServices}>
                <div
                  className={`${styles.serviceChip} ${service.insurance ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'insurance', !service.insurance)}
                >
                  <span>Seguro</span>
                </div>
                <div
                  className={`${styles.serviceChip} ${service.maneuver ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'maneuver', !service.maneuver)}
                >
                  <span>Maniobra</span>
                </div>
                <div
                  className={`${styles.serviceChip} ${service.custody ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'custody', !service.custody)}
                >
                  <span>Custodia</span>
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
              <label className={styles.label}>{t('quote.comments')}</label>
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
                    <label className={styles.label}>{t('quote.frequencyPeriod')}</label>
                    <select
                      value={service.frequency}
                      onChange={(e) => updateService(service.id, 'frequency', e.target.value)}
                      className={styles.select}
                    >
                      <option value="">{t('quote.select')}</option>
                      <option value="semanal">{t('quote.weekly')}</option>
                      <option value="mensual">{t('quote.monthly')}</option>
                      <option value="anual">{t('quote.yearly')}</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('quote.quantity')}</label>
                    <input
                      type="number"
                      value={service.quantity}
                      onChange={(e) => updateService(service.id, 'quantity', e.target.value)}
                      className={styles.input}
                      placeholder="0"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('quote.unit')}</label>
                    <select
                      value={service.unit}
                      onChange={(e) => updateService(service.id, 'unit', e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Kilos">{t('quote.kilos')}</option>
                      <option value="Toneladas">{t('quote.tons')}</option>
                      <option value="Contenedores">{t('quote.containers')}</option>
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
                              title={t('quote.copy')}
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              className={styles.iconButtonSmall}
                              onClick={() => removeMerchandise(service.id, merch.id)}
                              title={t('quote.delete')}
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              className={styles.viewButtonGreen}
                              onClick={() => openMerchandiseModal(service.id, merch)}
                              title={t('quote.view')}
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
                {t('quote.addMerchandise')}
              </button>
            </div>
          </div>
        ))}

        <button className={styles.addServiceButton} onClick={addService}>
          <Plus size={20} />
          <span>{t('quote.addService')}</span>
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quote.executiveAssignment')}</h2>
        <div className={styles.executivesCard}>
          <div className={styles.executivesList}>
            {executives.map((executive) => (
              <div key={executive.id} className={styles.executiveItemSimple}>
                <span className={styles.executiveLabel}>Ejecutivo</span>
                <span className={styles.executiveNameSimple}>{executive.name}</span>
                <button
                  className={styles.removeIconButton}
                  onClick={() => removeExecutive(executive.id)}
                  title={t('quote.delete')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button className={styles.addExecutiveButton} onClick={openExecutiveModal}>
            <Plus size={16} />
            {t('quote.addExecutive')}
          </button>
        </div>
      </div>

      {showMerchandiseModal && (
        <div className={styles.modalOverlay} onClick={closeMerchandiseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{t('quote.merchandiseModal')}</h2>
              <button className={styles.closeButton} onClick={closeMerchandiseModal}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalRow}>
                <div className={styles.modalFieldLarge}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>{t('quote.merchandise')}
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
                  <label className={styles.label}>{t('quote.isStackable')}</label>
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
                <label className={styles.label}>{t('quote.merchandiseDescription')}</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={merchandiseForm.description}
                  onChange={(e) => setMerchandiseForm({ ...merchandiseForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>{t('quote.merchandiseClassification')}
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
                        {t('quote.dangerousClass')}
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
                        {t('quote.refrigeratedClass')}
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
                        {t('quote.oversizedClass')}
                      </label>
                    </div>
                  </div>
                  <div className={styles.classificationColumn}>
                    {merchandiseForm.dangerous && (
                      <div className={styles.formGroup}>
                        <label className={styles.label}>{t('quote.imo')}</label>
                        <select
                          className={styles.select}
                          value={merchandiseForm.imoId}
                          onChange={(e) => {
                            const selectedId = parseInt(e.target.value);
                            const selectedImo = imoList.find(imo => imo._id === selectedId);
                            setMerchandiseForm({
                              ...merchandiseForm,
                              imoId: selectedId,
                              imoClass: selectedImo ? `${selectedImo.imo} ${selectedImo.description}` : ''
                            });
                          }}
                        >
                          <option value="0">{t('quote.selectOption')}</option>
                          {imoList.map((imo) => (
                            <option key={imo._id} value={imo._id}>
                              {imo.imo} - {imo.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {merchandiseForm.refrigerated && (
                      <div className={styles.formGroup}>
                        <label className={styles.label}>{t('quote.temperature')}</label>
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
                        {t('quote.bulkClass')}
                      </label>
                    </div>
                  </div>
                  <div className={styles.classificationColumn}>
                    {merchandiseForm.dangerous && (
                      <div className={styles.formGroup}>
                        <label className={styles.label}>{t('quote.un')}</label>
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
                  {t('quote.addPackaging')}
                </button>
                {currentPackages.length > 0 && (
                  <div className={styles.packagesTable} style={{ marginTop: '1rem' }}>
                    <table className={styles.simpleTable}>
                      <thead>
                        <tr>
                          <th>{t('quote.packagingTable.packaging')}</th>
                          <th>{t('quote.packagingTable.quantity')}</th>
                          <th>{t('quote.packagingTable.length')} ({useMetricSystem ? t('quote.cm') : t('quote.plg')})</th>
                          <th>{t('quote.packagingTable.height')} ({useMetricSystem ? t('quote.cm') : t('quote.plg')})</th>
                          <th>{t('quote.packagingTable.width')} ({useMetricSystem ? t('quote.cm') : t('quote.plg')})</th>
                          <th>{t('quote.packagingTable.weight')} ({useMetricSystem ? t('quote.kg') : t('quote.lbs')})</th>
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

              {currentPackages.length > 0 && (
                <div className={styles.modalFooterInfo}>
                  <div className={styles.unitTypeToggle}>
                    <span className={!useMetricSystem ? styles.activeUnitLabel : ''}>{t('quote.units.lbsInches')}</span>
                    <div
                      className={`${styles.toggleSwitch} ${useMetricSystem ? styles.active : ''}`}
                      onClick={() => setUseMetricSystem(!useMetricSystem)}
                    >
                      <div className={styles.toggleThumb}></div>
                    </div>
                    <span className={useMetricSystem ? styles.activeUnitLabel : ''}>{t('quote.units.kgCm')}</span>
                  </div>
                  <div className={styles.totalsDisplay}>
                    <div>
                      <div className={styles.totalLabel}>{t('quote.totalVolume')}</div>
                      <div className={styles.totalValue}>
                        {calculateTotals().totalVolume.toFixed(2)} {useMetricSystem ? 'cm³' : 'plg³'}
                      </div>
                    </div>
                    <div>
                      <div className={styles.totalLabel}>{t('quote.totalWeight')}</div>
                      <div className={styles.totalValue}>
                        {calculateTotals().totalWeight.toFixed(2)} {useMetricSystem ? 'kg' : 'lbs'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveModalButton} onClick={saveMerchandise}>
                {t('quote.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExecutiveModal && (
        <div className={styles.modalOverlay} onClick={closeExecutiveModal}>
          <div className={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{t('quote.selectExecutive')}</h2>
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
                      onClick={() => addExecutive({ id: executive._id, name: `${executive.nombre} ${executive.apellido_paterno} ${executive.apellido_materno}` })}
                    >
                      <span>{executive.nombre} {executive.apellido_paterno} {executive.apellido_materno}</span>
                      <Plus size={18} className={styles.addIcon} />
                    </div>
                  ))}
                {availableExecutives.filter(exec => !executives.some(e => e.id === exec._id)).length === 0 && (
                  <div className={styles.noExecutivesMessage}>
                    {t('quote.allExecutivesAdded')}
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
              <h2 className={styles.modalTitle}>{t('quote.addPackagingModal')}</h2>
              <button className={styles.closeButton} onClick={closePackagingModal}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>{t('quote.packagingType')}
                </label>
                <select
                  className={styles.select}
                  id="package-type"
                  defaultValue=""
                >
                  <option value="">{t('quote.selectOption')}</option>
                  <option>{t('quote.box')}</option>
                  <option>{t('quote.bundle')}</option>
                  <option>{t('quote.pallet')}</option>
                  <option>{t('quote.container')}</option>
                  <option>{t('quote.drum')}</option>
                  <option>{t('quote.sack')}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>{t('quote.quantity')}
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
                    <span className={styles.required}>*</span>{t('quote.length')} ({useMetricSystem ? t('quote.cm') : t('quote.plg')})
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
                    <span className={styles.required}>*</span>{t('quote.height')} ({useMetricSystem ? t('quote.cm') : t('quote.plg')})
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
                    <span className={styles.required}>*</span>{t('quote.width')} ({useMetricSystem ? t('quote.cm') : t('quote.plg')})
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
                    <span className={styles.required}>*</span>{t('quote.weight')} ({useMetricSystem ? t('quote.kg') : t('quote.lbs')})
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
                {t('quote.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        showCancel={modalState.showCancel}
        confirmText={t('quote.continue')}
        cancelText={t('quote.cancel')}
      />
    </div>
  );
}
