import { useState, useEffect } from 'react';
import { Trash2, ChevronDown, Plus, Copy, X, RotateCcw, Save, Eye, ArrowLeft, ShieldOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Modal } from '../components/Modal';
import { quotationService } from '../services/quotationService';
import { getCustomers} from '../services/customerService';
import { getExecutivesByDepartment} from '../services/executiveService';
import styles from './Quotations.module.css';
import {QuotationRequest, Service, Executive, Shipment, Cargo, MerchandisePackage} from '../types/requestQuotation';

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
  const [editingMerchandise, setEditingMerchandise] = useState<Cargo | null>(null);
  const [currentServiceId, setCurrentServiceId] = useState<number | null>(null);
  const [showExecutiveModal, setShowExecutiveModal] = useState(false);
  const [showCancelQuotationRequestModal, setShowCancelQuotationRequestModal] = useState(false);
  const [merchandiseForm, setMerchandiseForm] = useState<Cargo>({
    merchandiseName: '',
    merchandiseDescription: '',
    classification: [],
    stowable: 0,
    shipmentTypeCargo: '', 
    idUnitMeasurement: 0,
    unitMeasurement: '',  
    idUnitWeight: 0,
    unitWeight: '',
    volumeTotal: 0,
    weigthTotal: 0,
    units: []
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
    requestTypeId: 1,
    requestType: '',
    created: new Date().toISOString().split('T')[0],
    responseDeadline: '',
    statuscomments: null
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
    if (mode !== 'create' && quotationId) {
      loadQuotation(quotationId);
    }
  }, [mode, quotationId]);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const BASE_URL = import.meta.env.VITE_SUPABASE_URL;

      const [requestTypesRes, servicesRes, incotermsRes, countriesRes, imoRes] = await Promise.all([

        fetch(`${BASE_URL}/functions/v1/catalog-request-types`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${BASE_URL}/functions/v1/catalog-services`, {
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

      const customersData = await  await getCustomers(true);
      const requestTypesData = await requestTypesRes.json();
      const servicesData = await servicesRes.json();
      const executivesData = await getExecutivesByDepartment('Pricing');
      const incotermsData = await incotermsRes.json();
      const countriesData = await countriesRes.json();
      const imoData = await imoRes.json();

      console.log('customer: ', customersData);
      //console.log('ejecutivos', executivesData);

      setCustomers(customersData.filter((c: any) => c.status === 'activo' || c.datastate === 1));
      setRequestTypes(requestTypesData.filter((r: any) => r.status === 1));
      setAvailableServices(servicesData.filter((s: any) => s.status === 1)); // && s.category === 1));
      setAvailableExecutives(executivesData.filter((e: any) => e.estado === 1 && e.activo === true));
      setIncoterms(incotermsData.filter((i: any) => i.status === 1));
      setCountries(countriesData.filter((co: any) => co.status === 1));
      setImoList(imoData.filter((imo: any) => imo.status === 1));

      //console.log('AVAILABLE SERVICES', availableServices)
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
      console.log('Loading quotation:', data.data);

      setFormData({
        referenceRequest: data.data.referenceRequest || '',
        customerId: data.data.customer.idCustomer || '',
        client: data.data.customer.customerName || '',
        isPriority: data.data.priority || false,
        isQuote: data.data.licitation || false,
        customerCategory: data.data.customer.customerCategory || 1,
        requestTypeId: data.data.idRequestType.toString() || 1,
        requestType: data.data.typeRequest || '',
        created: data.data.dateRequest ? new Date(data.data.dateRequest).toISOString().split('T')[0] : '',
        responseDeadline: data.data.dateDeadline ? new Date(data.data.dateDeadline).toISOString().split('T')[0] : '',
        statuscomments: data.data.services[0].shipments[0].comments || null
      });

      console.log('FormData loaded: ', formData)

      if (data.data.services && data.data.services.length > 0) {
        const loadedServices = data.data.services.map((service: any, idx: number) => {
          const shipment = service.shipments?.[0] || {};
          const cargo = service.shipments[0].cargo?.[0] || {};
          const servicesAssociated = shipment.servicesAsociated || [];
          console.log('serv asociados: ',shipment.servicesAsociated )
          //const hasInsurance = servicesAssociated.some((s: any) => s.service_associated_name === 'Seguro');
          //const hasManeuver = servicesAssociated.some((s: any) => s.service_associated_name === 'Maniobra');
          //const hasCustody = servicesAssociated.some((s: any) => s.service_associated_name === 'Custodia');
          //const hasInspection = servicesAssociated.some((s: any) => s.service_associated_name === 'Inspección');
          //const hasCustomsClearance = servicesAssociated.some((s: any) => s.service_associated_name === 'Despacho aduanal');
          //const projection = shipment.projection_shipment || {};
          //const hasProjection = !!projection.num;
          //const frequencyMap: { [key: number]: string } = { 1: 'semanal', 2: 'mensual', 3: 'anual' };
          //const unitMap: { [key: number]: string } = { 1: 'Kilos', 2: 'Toneladas', 3: 'Contenedores' };

          return {
            idServiceItem: idx + 1,
            idService : service.idService,
            nameService: service.nameService || '',
            used: service.used || false,
            shipments : service.shipments,
            /*tipoCarga: service.typeCarga || '',
            operation: shipment.operation_type_name || '',
            incoterm: shipment.incoterm || '',
            origin: shipment.origin?.id_country || '',
            originZip: shipment.origin?.location || '',
            destination: shipment.destination?.id_country || '',
            destinationZip: shipment.destination?.location || '',
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
            }) || []*/
          };
        });
        setServices(loadedServices);
        console.log('Loaded services:', loadedServices);
        console.log('services: ', services)
      }

      if (data.data.assignedTo && data.data.assignedTo.length > 0) {
        const loadedExecutives : Executive[] = data.data.assignedTo.map((exec: Executive) => ({
          idEmployee: exec.idEmployee ,
          nameEmployee: exec.nameEmployee || '',
          idUser: exec.idUser || ''
        }));
        setExecutives(loadedExecutives);
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
      idServiceItem: services.length + 1,
      idService: 0,
      nameService: '',
      used: false, 
      shipments: [{
        idShipment:0,
        origin: '',
        destination: '',
        idTypeShipment: 0,
        typeShipment: '',
        idTypeOperation: 0,
        typeOperation: '',
        idInconterm: 0,
        incoterm: '',
        departureDateAproximate: '',
        projectionShipment: '', 
        comments: '',
        servicesAsociated: [],
        cargo : []
      }]
    };
    setServices([...services, newService]);
  };

  const removeService = (id: number) => {
    setServices(services.filter(service => service.idService !== id));
  };

  const removeMerchandise = (serviceId: number, merchandiseId: number) => {
    setServices(services.map(service =>
      service.idService === serviceId
        ? { ...service, merchandise: service.shipments[0].cargo.filter(m => m.id !== merchandiseId) }
        : service
    ));
  };

  const removeExecutive = (id: string) => {
    setExecutives(executives.filter(executive => executive.idEmployee !== id));
  };

  const openMerchandiseModal = (serviceId: number, cargo?: Cargo) => {    
    setCurrentServiceId(serviceId);    
    setEditingMerchandise(cargo || null);    

    if (cargo) {      
      const dangerousClass = cargo.classification.find((classification: any) => classification.idClassificationMerchandise === 5);
     
      setMerchandiseForm({
        merchandiseName: cargo.merchandiseName,
        merchandiseDescription: cargo.merchandiseDescription || '',  
        classification : cargo.classification,     
        stowable: cargo.stowable,
        shipmentTypeCargo: cargo.shipmentTypeCargo,
        idUnitMeasurement: cargo.idUnitMeasurement,
        unitMeasurement: cargo.unitMeasurement,                 
        idUnitWeight: cargo.idUnitWeight,
        unitWeight: cargo.unitWeight,
        volumeTotal: cargo.volumeTotal,
        weigthTotal: cargo.weigthTotal,
        units: cargo.units        
      });
      setCurrentPackages(cargo.units || []);
       console.log(merchandiseForm, currentPackages)

    } else {
      setMerchandiseForm({
        //id: 0,
        merchandiseName: '',
        merchandiseDescription: '',
        classification: [],
        stowable: 0,
        shipmentTypeCargo: '', 
        idUnitMeasurement: 0,
        unitMeasurement: '',
        idUnitWeight: 0,
        unitWeight: '',
        volumeTotal: 0,
        weigthTotal: 0,
        units: []
      });
      setCurrentPackages([]);
    }
    setShowMerchandiseModal(true);
    console.log('Serv: ', serviceId, 'cargo', cargo, 'Merch: ', editingMerchandise, 'packages', currentPackages)
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
    console.log('Serv id:', currentServiceId, 'services: ', services)
    if (!currentServiceId) return;

    if (!merchandiseForm?.merchandiseName.trim()) {
      showWarning('Por favor ingresa el nombre de la mercancía');
      return;
    }

   // const { totalVolume, totalWeight } = calculateTotals();

    const merchandiseClassifications: any[] = [];

    //Dangerous merchandise
    const dangerouseMerchandise = merchandiseForm.classification?.find((classification => classification.idClassificationMerchandise === 5))
    if (dangerouseMerchandise) {
      const selectedImo = imoList.find(imo => imo._id === dangerouseMerchandise.imo);
      merchandiseClassifications.push({
        idClassificationMerchandise: 5,
        classificationMerchandise: t('quote.dangerousClass'),
        imo: selectedImo?.imo || '',
        imoDescription: selectedImo?.description || '',
        un: parseInt(dangerouseMerchandise.un) || 0
      });
    }

    const refrigeratedMerchandise = merchandiseForm.classification?.find((classification => classification.idClassificationMerchandise === 3))
    if (refrigeratedMerchandise) {
      merchandiseClassifications.push({
        _id_merchandise_classification: 3,
        merchandise_name_classification: t('quote.refrigeratedClass'),
        //_idunit_temperature: refrigeratedMerchandise.temperature === '°C' ? 1 : 2,
        //unit_temperature: merchandiseForm.tempUnit,
        temperature: parseFloat(refrigeratedMerchandise.temperature) || 0
      });
    }

    const grainMerchandise = merchandiseForm.classification?.find((classification => classification.idClassificationMerchandise === 2))
    if (grainMerchandise) {
      merchandiseClassifications.push({
        _id_merchandise_classification: 2,
        merchandise_name_classification: "A granel"
      });
    }

    const oversizedMerchandise = merchandiseForm.classification?.find((classification => classification.idClassificationMerchandise === 4))
    if (oversizedMerchandise) {
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

    const newMerchandise: Cargo = {
      //id: editingMerchandise?.id|| Date.now(),
      merchandiseName: merchandiseForm.merchandiseName,
      merchandiseDescription: merchandiseForm.merchandiseDescription || '',       
      stowable: merchandiseForm.stowable,
      shipmentTypeCargo: merchandiseForm.shipmentTypeCargo,
      idUnitMeasurement: merchandiseForm.idUnitMeasurement || 1,
      unitMeasurement: merchandiseForm.unitMeasurement || 'cm', 
      idUnitWeight: merchandiseForm.idUnitWeight || 1,
      unitWeight: merchandiseForm.unitWeight || 'kg',
      volumeTotal: merchandiseForm.volumeTotal || 0,
      weigthTotal: merchandiseForm.weigthTotal || 0,
      //packages: merchandiseForm.packages  
      units: currentPackages?.map(pkg => ({
        ...pkg
      })),
      classification: merchandiseClassifications
    };

    setServices(services.map(service => {
      if (service.idServiceItem === currentServiceId) {
        if (editingMerchandise) {
          return {
            ...service,
            merchandise: service.shipments[0].cargo.map(merchandise =>
              merchandise.merchandiseName === editingMerchandise.merchandiseName ? newMerchandise : merchandise
            )
          };
        } else {
          return {
            ...service,
            shipments: service.shipments.map(shipment => shipment.idShipment=== 0 ? {
              ...shipment,
              cargo:  [...service.shipments[0].cargo, newMerchandise]
            }: shipment)
            //merchandise: [...service.shipments[0].cargo, newMerchandise]
          };
        }
      }
      return service;
    }
  ));


    console.log('New merch ',newMerchandise, 'editing: ', editingMerchandise, 'Services', services)
    closeMerchandiseModal();
  };

  const copyMerchandise = (serviceId: number, merchandiseId: number) => {
    const service = services.find(service => service.idServiceItem === serviceId);
    const merchToCopy = service?.shipments[0].cargo.find(merch => merch.id === merchandiseId);
    if (merchToCopy) {
      const newMerch = { ...merchToCopy, id: Date.now() };
      setServices(services.map(service =>
        service.idServiceItem === serviceId
          ? { ...service, merchandise: [...service.shipments[0].cargo, newMerch] }
          : service
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
    const isAlreadyAdded = executives.some(e => e.idEmployee === executive.idEmployee);
    if (!isAlreadyAdded) {
      setExecutives([...executives, executive]);
    }
    closeExecutiveModal();
  };

  const duplicateService = (id: number) => {
    const serviceToDuplicate = services.find(service => service.idServiceItem === id);
    if (serviceToDuplicate) {
      const newService = { ...serviceToDuplicate, id: Date.now() };
      setServices([...services, newService]);
    }
  };

  const updateService = (id: number, field: keyof Service, value: any) => {
    setServices(services.map(service => service.idServiceItem === id ? { 
      ...service,
      [field]: value 
    } : service));
  };

  const updateShipment =(idServiceItem: number, idShipment: number,  field: keyof Shipment, value: any) => {
    setServices(services.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => shipment.idShipment=== idShipment ? {
        ...shipment,
        [field]: value
      }: shipment)
    }: service));
  };

  const updateOrigin = (idServiceItem: number, idShipment: number,  field: keyof any, value: any) => {
    console.log('origin', value, 'id shipment: ', idShipment, 'services', services );
    setServices(services.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => shipment.idShipment=== idShipment ? {
        ...shipment,
        origin : {
          ...shipment.origin,
          [field]: value,
        }        
      }: shipment)
    }: service));
  };

   const updateDestination = (idServiceItem: number, idShipment: number,  field: keyof any, value: any) => {
    console.log('destination', value, 'id shipment: ', idShipment, 'services', services );
    setServices(services.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => shipment.idShipment=== idShipment ? {
        ...shipment,
        destination : {
          ...shipment.destination,
          [field]: value,
        }        
      }: shipment)
    }: service));
  };

  const updateProjectionShipment = (idServiceItem: number, idShipment: number,  field: keyof any, value: any) => {
    setServices(services.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => shipment.idShipment=== idShipment ? {
        ...shipment,
        projectionShipment : {
          [field]: value,
        }        
      }: shipment)
    }: service));
  };

  const updateServicesAssociated =  (idServiceItem: number, idShipment: number,  serviceAsociated: any) => {
    setServices(services.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => {
       if(shipment.idShipment !== idShipment) return shipment;

       const currentServices = shipment.servicesAsociated ?? [];
       const exists =  currentServices.some(s => s.idServiceAsociated === serviceAsociated.idServiceAsociated);

      return {
        ...shipment,
        servicesAsociated : exists ? currentServices.filter(serv => 
          serv.idServiceAsociated !== serviceAsociated.idServiceAsociated) 
        : [ ...currentServices, serviceAsociated]        
      };
       // {
       // ...shipment,
      //        const current = shipment.servicesAsociated ?? [],
       /* servicesAsociated : shipment.servicesAsociated?.map(servAsoc => 
          servAsoc.idServiceAsociated === serviceAsociated.idServiceAsociated ?
         );     */
      })
    }: service));
  }

  const handleStatusUpdate = async (statusId: number, statusName: string) => {
    try {
      setSaving(true);      

      if (!formData.referenceRequest || !formData.customerId || !formData.requestTypeId) {
        showWarning(t('quote.warnings.requiredFields'));
        setSaving(false);
        return;
      }

      const selectedCustomer = customers.find(c => c._id === formData.customerId);
      const selectedRequestType = requestTypes.find(r => r._id === formData.requestTypeId || r._id === formData.requestTypeId);
      console.log('Tipo seleccionado: ',requestTypes);
      /*
      if (!selectedRequestType) {
        showError(t('quote.errors.requestTypeNotFound'));
        setSaving(false);
        return;
      }*/

      const quotationData = {
        id: quotationId,
        referenceRequest: formData.referenceRequest,
        idStatusRequest: statusId,
        statusRequest: statusName,
        dateRequest: formData.created.toString(),
        ...(formData.responseDeadline.toString().length >= 0 && { dateDeadline: formData.responseDeadline.toString()}),        
        idRequestType: formData.requestTypeId,
        typeRequest: formData.requestType,
        priority: formData.isPriority ? 1 : 0,
        licitation: formData.isQuote ? 1 : 0,
        dateCreated: new Date().toISOString(),
        createdBy: {
          idUser: user?._id || '',
          nameEmployee: user?.name || '',
        },
        customer : {
          idCustomer: formData.customerId,
          customerName: selectedCustomer?.fiscal_data?.business_name || formData.client,
          customerCategory: formData.customerCategory,
        },
         assignedTo: executives.map(exec => ({
          idEmployee: exec.idEmployee,
          nameEmployee: exec.nameEmployee,
          idUser: exec.idUser
          //control_number: 'SN',
        })),              
       
        services: services.map((service, idx) => {

          const shipmentsInService = service.shipments.map((shipment, index) => {
            
            const servicesAssociated: any[] = [];

            if(shipment.servicesAsociated?.some(servAsociated => servAsociated.serviceAsociatedName ==='Seguro')){              
              const insuranceService = availableServices.find(s => s.service_name === 'Seguro');              
              servicesAssociated.push({
                _id_service_associated: insuranceService?._id || null,
                service_associated_name: 'Seguro'
              });
            }       
            
            if (shipment.servicesAsociated?.some(servAsociated => servAsociated.serviceAsociatedName ==='Maniobra')) {
              const maneuverService = availableServices.find(s => s.service_name === 'Maniobra');
              servicesAssociated.push({
                _id_service_associated: maneuverService?._id || null,
                service_associated_name: 'Maniobra'
              });
            }   
            
            if (shipment.servicesAsociated?.some(servAsociated => servAsociated.serviceAsociatedName ==='Custodia')) {
              const custodyService = availableServices.find(s => s.service_name === 'Custodia');
              servicesAssociated.push({
                _id_service_associated: custodyService?._id || null,
                service_associated_name: 'Custodia'
              });
            }

            if (shipment.servicesAsociated?.some(servAsociated => servAsociated.serviceAsociatedName ==='Inspección')) {
              const inspectionService = availableServices.find(s => s.service_name === 'Inspección');
              servicesAssociated.push({
                _id_service_associated: inspectionService?._id || null,
                service_associated_name: 'Inspección'
              });
            }

            if (shipment.servicesAsociated?.some(servAsociated => servAsociated.serviceAsociatedName ==='Despacho aduanal')) {
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

            const projectionShipment = service.shipments[0].projectionShipment.idTypeMesurementFrecuency && 
            service.shipments[0].projectionShipment.measurementFrecuency && 
            service.shipments[0].projectionShipment.frecuency && 
            service.shipments[0].projectionShipment.number ? {
              idTypeMesurementFrecuency: service.shipments[0].projectionShipment.idTypeMesurementFrecuency|| 0,
              measurementFrecuency: service.shipments[0].projectionShipment.measurementFrecuency ,
              frecuency:service.shipments[0].projectionShipment.frecuency || 0,
              number: service.shipments[0].projectionShipment.number,
            } : undefined;

            const originCountry = countries.find(country => country._id === service.shipments[0].origin.idCountry);
            const destinationCountry = countries.find(country => country._id === service.shipments[0].destination.idCountry);
            const selectedIncoterm = incoterms.find(i => i.incoterm_name === service.shipments[0].incoterm);
          
            return {              
              idShipment:index + 1,
              origin: {
                idCountry: originCountry.idCountry,
                countryCode: originCountry.countryCode,
                zipCode: originCountry.zipCode,
              },
              destination: {
                idCountry: destinationCountry.idCountry,
                countryCode: destinationCountry.countryCode,
                zipCode: shipment.destination.zipCode,
              },
              idTypeShipment: shipment.idTypeShipment,
              typeShipment: shipment.typeShipment,
              idTypeOperation: shipment.idTypeOperation,
              typeOperation: shipment.typeOperation,
              idInconterm: selectedIncoterm?._id || 0,
              incoterm: shipment.incoterm,
              ...(shipment.departureDateAproximate && { departureDateAproximate: shipment.departureDateAproximate}),
              ...(projectionShipment && { projectionShipment: projectionShipment }),
              comments: statusId === 3 ? (document.getElementById('comments-cancelation') as HTMLInputElement).value : null,        
              ...(servicesAssociated.length > 0 && { servicesAsociated: servicesAssociated }),
              cargo : shipment.cargo.map(merchandise => ({
                merchandiseName: merchandise.merchandiseName,
                merchandiseDescription: merchandise.descriptionMerchandise,
                classification: merchandise.classification || [],
                stowable: merchandise.stowable,
                shipmentTypeCargo:'',
                idUnitMeasurement: 1, 
                unitMeasurement:'',
                idUnitWeight: 1, 
                unitWeight:'kg',
                volumeTotal: merchandise.volumeTotal,
                weigthTotal: merchandise.weigthTotal,
                units: merchandise.packages
              }))
            }        
          })
          const selectedService = availableServices.find(s => s.service_name === service.nameService);          
          
          return {            
            idServiceItem: idx + 1,
            idService: selectedService?.id_service || null,
            nameService: service.nameService,
            ...(mode === 'create' && { used: false }),
            shipments: shipmentsInService
          }
            /*[
            {
              idShipment: 1,
              origin: {
                idCountry: originCountry?.idCountry || null,
                countryCode: originCountry?.countryCode,
                zipCode: originCountry?.zipCode
              },
              destination: {
                idCountry: destinationCountry?.idCountry || null,
                countryCode: destinationCountry?.countryCode,
                zipCode: destinationCountry?.zipCode
              },
              idTypeShipment: shipmentTypeMap[service.shipments[0].idTypeShipment] || 1,
              typeShipment: service.shipments[0].typeShipment,
              _id_operation_type: operationTypeMap[service.operation] || 1,
              operation_type_name: service.operation,
              _id_incoterm: selectedIncoterm?._id || 0,
              incoterm: service.incoterm,
              ...(service.expectedDeparture && { departure_date_approximate: { $date: new Date(service.expectedDeparture).toISOString()}}),
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
                */                  
        })        
      };

      if (mode === 'edit' && quotationId) {
        await quotationService.update(quotationData);
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
    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Está a punto de cancelar esta solicitud',
      message: '¿Desea continuar con la cancelación?',
      showCancel: true,
      onConfirm: async () => {
        setShowCancelQuotationRequestModal(true)       
      }
    });
   
  };

  const handleSaveQuotation = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setSaving(true);
      const selectedCustomer = customers.find(c => c._id === formData.customerId);
      const selectedRequestType = requestTypes.find(r => r._id as number === 1);
      const hasAssignedExecutives = executives.length > 0;
      console.log('services: ', services)
      console.log('Customer', selectedCustomer)
      console.log('tipo sol', selectedRequestType._id)
      console.log('ej asignados', hasAssignedExecutives)
      console.log('available serv: ', availableServices)

      const quotationData = {
        referenceRequest: formData.referenceRequest,
        idStatusRequest: hasAssignedExecutives ? 4 : 1,
        statusRequest: hasAssignedExecutives ? 'Asignada' : 'Nueva', 
        dateRequest: new Date(formData.created),
        dateDeadline: formData.responseDeadline ? new Date(formData.responseDeadline) : null,
        idRequestType:  formData.requestTypeId,
        typeRequest:formData.requestType,
        priority: formData.isPriority ? 1 : 0,
        licitation: formData.isQuote ? 1: 0, 
        dateCreated: new Date().toISOString(),
        createdBy: {
          idUser: user?._id || '',
          nameEmployee: user?.name || '',
        },
        customer : {
          idCustomer: formData.customerId,
          customerName: selectedCustomer?.branch_name,
          customerCategory: formData.customerCategory,
        },
        assignedTo: executives.map(exec => ({
          idEmployee: exec.idEmployee,
          nameEmployee: exec.nameEmployee,
          idUser: exec.idUser
          //control_number: 'SN',
        })),        
       // customer_category: formData.customerCategory,
        //_id_status_request: hasAssignedExecutives ? 4 : 1,
       // status_request_name: hasAssignedExecutives ? 'Asignada' : 'Nueva',
       // request_date: new Date(formData.created),
       //_id_request_type: selectedRequestType._id,
        //request_type_name: selectedRequestType.request_type_name,
       // _id_customer: formData.customerId,
       // customer_business_name: selectedCustomer?.fiscal_data?.business_name || formData.client,
       // licitation: formData.isQuote,
       /*  requesting_data: user ? {
          _id_executive: user._id,
          complete_name: user.name || user.email,
        } : {},
        assigned_to: executives.map(exec => ({
          _id_executive: exec.idEmployee,
          complete_name: exec.nameEmployee,
          _iduser: exec.idUser,
          control_number: 'SN',
        })),*/
        services: services.map((service, idx) => {      
                                                         
          const shipmentsInService = service.shipments.map((shipment, index) => {
            
            const servicesAssociated: any[] = [];

            if(shipment.servicesAsociated?.some(servAsociated => servAsociated.serviceAsociatedName ==='Seguro')){              
              const insuranceService = availableServices.find(s => s.service_name === 'Seguro');    
              console.log('asoci: ',availableServices)          
              servicesAssociated.push({
                _id_service_associated: insuranceService?._id || null,
                service_associated_name: 'Seguro'
              });
            }       
            
            if (shipment.servicesAsociated?.some(servAsociated => servAsociated.serviceAsociatedName ==='Maniobra')) {
              const maneuverService = availableServices.find(s => s.service_name === 'Maniobra');
              servicesAssociated.push({
                _id_service_associated: maneuverService?._id || null,
                service_associated_name: 'Maniobra'
              });
            }   
            
            if (shipment.servicesAsociated?.some(servAsociated => servAsociated.serviceAsociatedName ==='Custodia')) {
              const custodyService = availableServices.find(s => s.service_name === 'Custodia');
              servicesAssociated.push({
                _id_service_associated: custodyService?._id || null,
                service_associated_name: 'Custodia'
              });
            }

            if (shipment.servicesAsociated?.some(servAsociated => servAsociated.serviceAsociatedName ==='Inspección')) {
              const inspectionService = availableServices.find(s => s.service_name === 'Inspección');
              servicesAssociated.push({
                _id_service_associated: inspectionService?._id || null,
                service_associated_name: 'Inspección'
              });
            }

            if (shipment.servicesAsociated?.some(servAsociated => servAsociated.serviceAsociatedName ==='Despacho aduanal')) {
              const customsClearanceService = availableServices.find(s => s.service_name === 'Despacho aduanal');
              servicesAssociated.push({
                _id_service_associated: customsClearanceService?._id || null,
                service_associated_name: 'Despacho aduanal'
              });
            }

            const frequencyMap: { [key: string]: number } = { 'semanal': 1, 'mensual': 2, 'anual': 3 };

            const unitMap: { [key: string]: number } = { 'Kilos': 1, 'Toneladas': 2, 'Contenedores': 3 };

            const projectionShipment = shipment.projectionShipment?.frecuency && 
                                       shipment.projectionShipment?.idTypeMesurementFrecuency && 
                                       shipment.projectionShipment?.measurementFrecuency && 
                                       shipment.projectionShipment?.number ? {
              frecuency: shipment.projectionShipment?.frecuency,
              idTypeMesurementFrecuency: unitMap[shipment.projectionShipment?.idTypeMesurementFrecuency] || 0,
              measurementFrecuency: shipment.projectionShipment?.measurementFrecuency,
              number: shipment.projectionShipment?.number || 0,
            } : undefined;

            const originCountry = countries.find(country => country._id === service.shipments[0].origin.idCountry);
            const destinationCountry = countries.find(country => country._id === shipment.destination.idCountry);   

            console.log('Origen', originCountry)
            console.log('Destino', destinationCountry)

            return {
              idShipment:index + 1,
              origin: {
                idCountry: originCountry._id,
                countryCode: originCountry.country_code,
                zipCode: shipment.destination.zipCode,
              },
              destination: {
                idCountry: destinationCountry._id,
                countryCode: destinationCountry.country_code,
                zipCode: shipment.destination.zipCode,
              },
              idTypeShipment: shipment.idTypeShipment,
              typeShipment: shipment.typeShipment,
              idTypeOperation: shipment.idTypeOperation,
              typeOperation: shipment.typeOperation,
              idInconterm: shipment.idInconterm,
              incoterm: shipment.incoterm,
              departureDateAproximate: shipment.departureDateAproximate ? new Date(shipment.departureDateAproximate): null,
              projectionShipment: projectionShipment,
              comments: shipment.comments,
              ...(servicesAssociated.length > 0 && { servicesAsociated: servicesAssociated }),
              
              cargo : shipment.cargo.map(merchandise => ({
                merchandiseName: merchandise.merchandiseName,
                merchandiseDescription: merchandise.merchandiseDescription,
                classification: merchandise.classification || [],
                stowable: merchandise.stowable,
                shipmentTypeCargo: merchandise.shipmentTypeCargo,
                idUnitMeasurement: merchandise.idUnitMeasurement, 
                unitMeasurement: merchandise.unitMeasurement,
                idUnitWeight: merchandise.idUnitWeight, 
                unitWeight: merchandise.unitMeasurement,
                volumeTotal: merchandise.volumeTotal,
                weigthTotal: merchandise.weigthTotal,
                units: merchandise.units
              })), 
            }
            
          })

          const selectedService = availableServices.find(s => s.service_name === service.nameService); 
                                        
          return {
            idServiceItem: idx + 1,
            idService: selectedService?._id,
            nameService: selectedService.service_name,
            ...(mode === 'create' && { used: false }),
            shipments : shipmentsInService            
          };
        }),
      };

      console.log('=== QUOTATION DATA TO SAVE ===');
      console.log(JSON.stringify(quotationData, null, 2));
     
      if(quotationData.services.length == 0 ){
        setModalState({
          isOpen : true,
          type: 'warning',
          title: 'No tiene servicios añadidos',
          message: 'Debe agregar al menos un servicio para mandar la solicitud de cotización.',
          showCancel: false      
        });
        setSaving(false);
        return;
      }else if(quotationData.services.find(service => service.shipments.find(ship => ship.cargo.length === 0))){
        setModalState({
          isOpen : true,
          type: 'warning',
          title: 'No tiene mercancia añadida',
          message: 'Debe agregar al menos una mercancia para mandar la solicitud de cotización.',
          showCancel: false      
        });
        setSaving(false);
        return;
      }

      if (quotationData.assignedTo.length === 0) {
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

  const performSave = async (quotationData: QuotationRequest) => {
    try {
      setSaving(true);
      if (mode === 'edit' && quotationId) {
        quotationData.id = quotationId;
        console.log('UPDATE: ', JSON.stringify(quotationData, null, 2))
        const result = await quotationService.update(quotationData);
        //console.log('Update result:', result);
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

  const renderZipCodesOriginDestination =  (service : Service) => {
    switch(service.shipments[0].typeShipment){
      case 'Door to Door': return (
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
                Codigo Postal Origen
              </label>
            <input
              type="text"
              value={service.shipments[0].origin.zipCode}
              onChange={(e) => updateOrigin(service.idServiceItem, service.shipments[0].idShipment, 'zipCode', e.target.value)}
              className={styles.input}
              disabled={mode === 'view'}
              required/>
          </div>    
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('quote.destinationZip')}
            </label>
            <input
              type="text"
              value={service.shipments[0].destination.zipCode}
              onChange={(e) => updateDestination(service.idServiceItem, service.shipments[0].idShipment, 'zipCode', e.target.value)}
              className={styles.input}
              disabled={mode === 'view'}
              required/>
          </div>    
        </div>);
      case 'Door to Port' : return (
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              Codigo Postal Origen
            </label>
            <input
              type="text"
              value={service.shipments[0].origin.zipCode}
              onChange={(e) => updateOrigin(service.idServiceItem, service.shipments[0].idShipment, 'zipCode', e.target.value)}
              className={styles.input}
              disabled={mode === 'view'}
              required/>
          </div>  
          <div className={styles.formGroup}></div>                   
        </div>);
      
      case 'Port to Door' : return( 
        <div className={styles.formGrid}>   
          <div className={styles.formGroup}></div>              
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('quote.destinationZip')}
            </label>
            <input
              type="text"
              value={service.shipments[0].destination.zipCode}
              onChange={(e) => updateDestination(service.idServiceItem, service.shipments[0].idShipment, 'zipCode', e.target.value)}
              className={styles.input}
              disabled={mode === 'view'}
              required/>
          </div>    
        </div>
      )
      default: return null;
    }
  }

  const formatDateForInput = (date: string) => {
  if (!date) return "";
  return date.split("T")[0];
};


  return (
    <div className={styles.container}>
      <form onSubmit={handleSaveQuotation}>
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
            type="submit"
            disabled={saving || mode === 'view'}>
            <Save size={18} />
            <span>{saving ? 'Guardando...' : t('quote.save')}</span>
          </button>
          <button type="button" className={styles.actionBarResetButton}>
            <RotateCcw size={18} />
          </button>
          <button type="button" className={styles.actionBarDropdownButton}>
            <span>{t('quote.actions')}</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {formData?.statuscomments !== null && (
        <div>
         <label className={styles.label}>Comentarios por cancelación</label>
          <label className={styles.labelInfoRed} > {formData.statuscomments}</label>
        </div>        
      )}

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
              placeholder="QR250901-0001"
              disabled
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
                  client: customer?.fiscal_data?.business_name || '',
                  customerCategory: customer?.client_level_id
                });
              }}
              className={styles.select}
              disabled={loading || mode === 'view'}
              required>
              <option value="">{t('quote.selectClient')}</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.branch_name}, {customer.fiscal_data?.business_name}
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
                  requestTypeId: parseInt(e.target.value),
                  requestType: requestType?.request_type_name || ''
                });
              }}
              className={styles.select}
              disabled={loading || mode === 'view'}
              required
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
              disabled={mode === 'view'}>
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
              disabled={mode === 'view'}
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
            <button
              type="button" 
              className={`${styles.toggleSwitch} ${formData.isPriority ? styles.active : ''}`}
              onClick={() => setFormData({ ...formData, isPriority: !formData.isPriority })}
              disabled={mode === 'view'}>
              <div className={styles.toggleThumb}></div>
            </button>
          </div>

          <div className={styles.formGroupWithToggle}>
            <label className={styles.label}>{t('quote.isBid')}</label>
            <button
              type="button" 
              className={`${styles.toggleSwitch} ${formData.isQuote ? styles.active : ''}`}
              onClick={() => setFormData({ ...formData, isQuote: !formData.isQuote })}
              disabled={mode === 'view'}>
              <div className={styles.toggleThumb}></div>
            </button>
          </div>

          {mode === 'edit' && (
            <div className={styles.statusButtonsContainer}>
              <button
                type="button" 
                className={styles.cancelButton}
                onClick={handleCancelQuotation}
                disabled={saving}>
                Cancelar solicitud
              </button>

              {showCancelQuotationRequestModal && (
              <div className={styles.modalOverlay} onClick={() => {setShowCancelQuotationRequestModal(false)}}>
                <div className={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Motivos de cancelación</h2>
                    <button type="button" className={styles.closeButton} onClick={() => {setShowCancelQuotationRequestModal(false) }}>
                      <X size={24} />
                    </button>
                  </div>
                  <div className={styles.modalBody}>
                  <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
                    <label className={styles.label}>Escriba los motivos de cancelación</label>
                    <textarea id="comments-cancelation" className={styles.textarea} rows={3} placeholder="" />
                    <div className={styles.modalFooter}>
                      <button type="button" className={styles.saveModalButton} 
                      onClick={() => handleStatusUpdate(3, "Cancelada")}>
                        {t('quote.save')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
                
              <button
                type="button" 
                className={styles.sendButton}
                onClick={handleSendQuotation}
                disabled={saving}>
                {t('quote.send')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quote.services')}</h2>

        {services.map((service, index) => (
          <div key={service.idService} className={styles.serviceCard}>
            <div className={styles.serviceHeader}>
              <div className={styles.serviceNumber}>{index + 1}</div>
              <div className={styles.serviceActions}>
                <button type="button" className={styles.iconButton} onClick={() => duplicateService(service.idService)} disabled={mode === 'view'}>
                  <Copy size={18} />
                </button>
                <button
                    type="button" 
                    className={`${styles.iconButton} ${styles.danger}`}
                    onClick={() => removeService(service.idService)}
                    disabled={mode === 'view'}>
                    <X size={18} />
                </button>               
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  Tipo Tráfico
                </label>
                <select
                  value={service.nameService}
                  onChange={(e) => 
                    updateService(service.idServiceItem, 'nameService', e.target.value)}
                  className={styles.select}
                  disabled={loading || mode === 'view'}
                  required
                >
                  <option value="">{t('quote.select')}</option>
                  {availableServices.filter((service) => service.status === 1 && service.category === 1).map((service_) => (
                    <option key={service_._id} value={service_.service_name}>
                      {service_.service_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  Tipo Carga
                </label>
                <select
                  value={service.idService === 2 || service.idService === 3  ? 'Consolidado' : 'Full' }
                  //onChange={(e) => updateService(service.idService, 'idService', e.target.value)}
                  className={styles.select}
                  disabled={loading || mode === 'view'}
                  required
                >
                  <option value="">{t('quote.select')}</option>                
                    <option key='Consolidado' value='Consolidado'>
                      Consolidado
                    </option>  
                    <option key='Full' value='Full'>
                      Full
                    </option>                   
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.operation')}
                </label>
                <select
                  value={service.shipments[0].typeOperation}
                  onChange={(e) => updateShipment(service.idServiceItem, service.shipments[0].idShipment, 'typeOperation', e.target.value)}
                  className={styles.select}
                  disabled={mode === 'view'}
                  required
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
                  value={service.shipments[0].incoterm}
                  onChange={(e) => updateShipment(service.idServiceItem, service.shipments[0].idShipment, 'incoterm', e.target.value)}
                  className={styles.select}
                  disabled={loading || mode === 'view'}
                  required>
                  <option value="">{t('quote.select')}</option>
                  {incoterms.map((inc) => (
                    <option key={inc._id} value={inc.incoterm}>
                      {inc.incoterm}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>Tipo de envío
                </label>
                <select
                  value={service.shipments[0].typeShipment  }
                  onChange={(e) => updateShipment(service.idServiceItem, service.shipments[0].idShipment, 'typeShipment', e.target.value)}
                  className={styles.select}
                  disabled={mode === 'view'}>
                  <option value="">{t('quote.select')}</option>
                  <option>{t('quote.doorToDoor')}</option>
                  <option>{t('quote.portToPort')}</option>
                  <option>{t('quote.doorToPort')}</option>
                  <option>{t('quote.portToDoor')}</option>
                </select>
              </div>    

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('quote.expectedDeparture')}</label>
                <input
                  type="date"
                  value={formatDateForInput(service.shipments[0].departureDateAproximate || '') }
                  onChange={(e) => updateShipment(service.idServiceItem, service.shipments[0].idShipment, 'departureDateAproximate', e.target.value)}
                  className={styles.input}
                  disabled={mode === 'view'}/>
              </div>         
            </div>

            <div className={styles.formGrid} style={{ marginTop: '1.25rem' }}>              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.origin')}
                </label>
                <select
                  value={service.shipments[0].origin.idCountry}
                  onChange={(e) => updateOrigin(service.idServiceItem, service.shipments[0].idShipment, 'idCountry', e.target.value)}
                  className={styles.select}
                  disabled={loading || mode === 'view'}
                  required
                >
                  <option value="">{t('quote.select')}</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country._id}>
                      {country.name_country} ({country.country_code})
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
                  value={service.shipments[0].destination.idCountry}
                  onChange={(e) => updateDestination(service.idServiceItem, service.shipments[0].idShipment, 'idCountry', e.target.value)}
                  className={styles.select}
                  disabled={loading || mode === 'view'}
                  required>
                  <option value="">{t('quote.select')}</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country._id}>
                      {country.name_country} ({country.country_code})
                    </option>                    
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              {renderZipCodesOriginDestination(service)}
            </div>
                                                         
            <div style={{ marginTop: '1.25rem' }}>
              <label className={styles.label}>{t('quote.associatedServices')}</label>
              <div className={styles.associatedServices}>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 12) ? styles.selected : ''}`}
                  onClick={(e) => 
                    updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment, { idServiceAsociated: 12, serviceAsociatedName: 'Seguro' })}
                  disabled={mode === 'view'}>
                  <span>Seguro</span>
                </button>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 13) ? styles.selected : ''}`}
                  onClick={() => updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment,  { idServiceAsociated: 13, serviceAsociatedName: 'Maniobra' })}
                  disabled={mode === 'view'}>
                  <span>Maniobra</span>
                </button>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 15) ? styles.selected : ''}`}
                  onClick={() => updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment, { idServiceAsociated: 15, serviceAsociatedName: 'Custodia' } )}
                  disabled={mode === 'view'}>
                  <span>Custodia</span>
                </button>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 14) ? styles.selected : ''}`}
                  onClick={() => updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment, { idServiceAsociated: 14, serviceAsociatedName: 'Inspección' })}
                  disabled={mode === 'view'}>
                  <span>Inspección</span>
                </button>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 7)? styles.selected : ''}`}
                  onClick={() => updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment,  { idServiceAsociated: 7, serviceAsociatedName: 'Despacho' })}
                  disabled={mode === 'view'}>
                  <span>Despacho aduanal</span>
                </button>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
              <label className={styles.label}>{t('quote.comments')}</label>
              <textarea
                value={service.shipments[0].comments}
                onChange={(e) => updateShipment(service.idServiceItem, service.shipments[0].idShipment, 'comments', e.target.value)}
                className={styles.textarea}
                rows={3}
                placeholder=""
                disabled={mode === 'view'}
              />
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <div className={styles.frequencyHeader}>
                <input
                  type="checkbox"
                  id={`freq-${service.idService}`}
                  checked={service.shipments[0].projectionShipment}
                  onChange={(e) => updateService(service.idService, 'idService', e.target.checked)}
                  className={styles.checkbox}
                  disabled={mode === 'view'}
                />
                <label htmlFor={`freq-${service.idService}`} className={styles.checkboxLabel}>
                  Programar frecuencia
                </label>
              </div>
              {service.shipments[0].projectionShipment && (
                <div className={styles.frequencyGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('quote.frequencyPeriod')}</label>
                    <select
                      value={service.shipments[0].projectionShipment?.frecuency}
                      onChange={(e) => updateProjectionShipment(service.idServiceItem, service.shipments[0].idShipment, 'frecuency', e.target.value)}
                      className={styles.select}
                      disabled={mode === 'view'}
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
                      type="number"
                      value={service.shipments[0].projectionShipment?.number}
                      onChange={(e) => updateProjectionShipment(service.idServiceItem, service.shipments[0].idShipment, 'number', e.target.value)}
                      className={styles.input}
                      placeholder="0"
                      disabled={mode === 'view'}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('quote.unit')}</label>
                    <select
                      value={service.shipments[0].projectionShipment?.measurementFrecuency}
                      onChange={(e) => updateProjectionShipment(service.idServiceItem, service.shipments[0].idShipment, 'measurementFrecuency', e.target.value)}
                      className={styles.select}
                      disabled={mode === 'view'}>
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
                    {service.shipments[0].cargo.map((merch) => (
                      <tr key={merch.id}>
                        <td>{merch.merchandiseName}</td>
                        <td>{merch.dangerous ? 'No' : 'No'}</td>
                        <td>{merch.refrigerated ? 'Refrigerada' : 'General'}</td>
                        <td>{merch.stackable ? 'Sí' : 'No'}</td>
                        <td>{merch.volumeTotal} KG</td>
                        <td>{merch.weigthTotal} KG</td>
                        <td>
                          <div className={styles.tableActions}>
                            <button
                              type="button" 
                              className={styles.iconButtonSmall}
                              onClick={() => copyMerchandise(service.idService, merch.id)}
                              title={t('quote.copy')}
                              disabled={mode === 'view'}
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              type="button" 
                              className={styles.iconButtonSmall}
                              onClick={() => removeMerchandise(service.idService, merch.id)}
                              title={t('quote.delete')}
                              disabled={mode === 'view'}
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              type="button" 
                              className={styles.viewButtonGreen}
                              onClick={() => openMerchandiseModal(service.idService, merch)}
                              title={t('quote.view')}>
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
                type="button" 
                className={styles.addItemButton}
                onClick={() => openMerchandiseModal(service.idServiceItem)}
                disabled={mode === 'view'}>
                <Plus size={16} />
                {t('quote.addMerchandise')}
              </button>
            </div>
          </div>
        ))}

        <button type="button" className={styles.addServiceButton} onClick={addService} disabled={mode === 'view'}>
          <Plus size={20} />
          <span>{t('quote.addService')}</span>
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quote.executiveAssignment')}</h2>
        <div className={styles.executivesCard}>
          <div className={styles.executivesList}>
            {executives.map((executive) => (
              <div key={executive.idEmployee} className={styles.executiveItemSimple}>
                <span className={styles.executiveLabel}>Ejecutivo</span>
                <span className={styles.executiveNameSimple}>{executive.nameEmployee}</span>
                <button
                  type="button" 
                  className={styles.removeIconButton}
                  onClick={() => removeExecutive(executive.idEmployee || '')}
                  title={t('quote.delete')}
                  disabled={mode === 'view'}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className={styles.addExecutiveButton} onClick={openExecutiveModal} disabled={mode === 'view'} >
            <Plus size={16} />
            {t('quote.addExecutive')}
          </button>
        </div>
      </div>
      </form>

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
                    <span className={styles.required}>*</span>
                    {t('quote.merchandise')}
                  </label>
                  <input
                    type="text"
                    placeholder="Baterías de Telefonos Modelo 388"
                    className={styles.input}
                    value={merchandiseForm?.merchandiseName}
                    onChange={(e) => setMerchandiseForm({ ...merchandiseForm, merchandiseName: e.target.value})}
                    disabled={mode === 'view'}
                  />
                </div>
                <div className={styles.modalFieldSmall}>
                  <label className={styles.label}>{t('quote.isStackable')}</label>
                  <div className={styles.toggleContainer}>
                    <button
                      className={`${styles.toggleSwitch} ${merchandiseForm?.stowable === 1 ? styles.active : ''}`}
                      onClick={() => setMerchandiseForm({ ...merchandiseForm, stowable: !merchandiseForm.stowable ? 1 : 0 })}
                      disabled={mode === 'view'}>
                      <div className={styles.toggleThumb}></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('quote.merchandiseDescription')}</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={merchandiseForm?.merchandiseDescription}
                  disabled={mode === 'view'}
                  onChange={(e) => setMerchandiseForm({ ...merchandiseForm, merchandiseDescription: e.target.value || "" })}
                ></textarea>
              </div>

              <div style={{ marginTop: '1.0rem' }}>
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
                          checked={merchandiseForm?.classification.some(classification => classification.classificationMerchandise === 'Peligrosa')}
                          onChange={(e) => merchandiseForm?.classification.push({
                            idClassificationMerchandise: 5,
                            classificationMerchandise: t('quote.dangerousClass'),
                            imo: 32,
                            imoDescription: '',
                            un:  0
                          })}
                          disabled={mode === 'view'}
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
                          checked={merchandiseForm?.classification.some(classification => classification.classificationMerchandise === 'Refrigerada')}
                          //onChange={(e) => setMerchandiseForm({ ...merchandiseForm, refrigerated: e.target.checked })}
                          onChange={(e) => merchandiseForm?.classification.push({
                            idClassificationMerchandise: 4,
                            classificationMerchandise: t('quote.dangerousClass'),
                            temperature: "32"                         
                          })}
                          disabled={mode === 'view'}
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
                          checked={merchandiseForm?.classification.some(classification => classification.classificationMerchandise === 'Sobredimensionada')}
                          //onChange={(e) => setMerchandiseForm({ ...merchandiseForm, oversized: e.target.checked })}
                          onChange={(e) => merchandiseForm?.classification.push({
                            idClassificationMerchandise: 3,
                            classificationMerchandise: t('quote.oversizedClass'),
                          })}
                          disabled={mode === 'view'}
                        />
                        <label htmlFor="sobredimensionada" className={styles.classificationLabel}>
                          {t('quote.oversizedClass')}
                        </label>
                      </div>
                      <div className={styles.classificationCheckbox}>
                        <input
                          type="checkbox"
                          id="granel"
                          className={styles.checkbox}
                          checked={merchandiseForm?.classification.some(classification => classification.classificationMerchandise === 'Granel')}
                          //onChange={(e) => setMerchandiseForm({ ...merchandiseForm, grain: e.target.checked })}
                           onChange={(e) => merchandiseForm?.classification.push({
                            idClassificationMerchandise: 1,
                            classificationMerchandise: t('quote.bulkClass'),
                          })}
                          disabled={mode === 'view'}
                        />
                        <label htmlFor="granel" className={styles.classificationLabel}>
                          {t('quote.bulkClass')}
                        </label>
                      </div>
                    </div>
                    <div className={styles.classificationColumn}>
                      {merchandiseForm?.classification.some(classification => classification.classificationMerchandise === 'Peligrosa') && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>{t('quote.imo')}</label>
                            <select
                              className={styles.select}
                              value={merchandiseForm.classification.find(classification => classification.classificationMerchandise === 'Peligrosa').imo}
                              onChange={(e) => {
                                const selectedId = parseInt(e.target.value);
                                const selectedImo = imoList.find(imo => imo.imo === selectedId);
                                /*setMerchandiseForm({
                                  ...merchandiseForm,
                                  imo: selectedId,
                                  imoDescription: selectedImo ? `${selectedImo.imo} ${selectedImo.description}` : ''
                                });*/
                              }}
                            >
                              <option value="0">{t('quote.selectOption')}</option>
                              {imoList.map((imo) => (
                                <option key={imo.imo} value={imo.imo}>
                                  {imo.imo} - {imo.description}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.label}>{t('quote.un')}</label>
                            <input
                              type="text"
                              placeholder="19"
                              className={styles.input}
                              style={{ width: '80px' }}
                              value={merchandiseForm?.classification.find(classification => classification.classificationMerchandise === 'Peligrosa').un}
                              //onChange={(e) => setMerchandiseForm({ ...merchandiseForm, un: e.target.value })}
                              onChange={() =>console.log('UN') }
                            />
                          </div>
                        </div>
                      )}
                      {merchandiseForm?.classification.some(classification => classification.classificationMerchandise === 'Refrigerada')  && (
                        <div className={styles.formGroup}>
                          <label className={styles.label}>{t('quote.temperature')}</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              type="text"
                              placeholder="80"
                              className={styles.input}
                              style={{ width: '100px' }}
                              value={merchandiseForm?.classification.find(classification => classification.classificationMerchandise === 'Refrigerada').temperature }
                              //onChange={(e) => setMerchandiseForm({ ...merchandiseForm, temperature: e.target.value })}
                               onChange={() =>console.log('tempera' ) }
                            />
                            <select
                              className={styles.select}
                              style={{ width: '80px' }}
                              //value={merchandiseForm.tempUnit}
                              //onChange={(e) => setMerchandiseForm({ ...merchandiseForm, tempUnit: e.target.value })}
                            >
                              <option>°C</option>
                              <option>°F</option>
                            </select>
                          </div>
                        </div>
                      )}                     
                    </div>                                        
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button className={styles.addPackageButtonIcon} onClick={openPackagingModal} disabled={mode === 'view'}>
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
                            <td>{pkg.unitMeasurement}</td>
                            <td>{pkg.quantity}</td>
                            <td>{pkg.length}</td>
                            <td>{pkg.height}</td>
                            <td>{pkg.width}</td>
                            <td>{pkg.weigth}</td>
                            <td>
                              <button
                                className={styles.removeRowButton}
                                onClick={() => removePackage(pkg.id)}
                                disabled={mode === 'view'}>
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
                    <button                     
                      className={`${styles.toggleSwitch} ${useMetricSystem ? styles.active : ''}`}
                      onClick={() => setUseMetricSystem(!useMetricSystem)}
                      disabled={mode === 'view'}>
                      <div className={styles.toggleThumb}></div>
                    </button>
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
              <button className={styles.saveModalButton} onClick={saveMerchandise} disabled={mode === 'view'}>
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
                {availableExecutives.filter(exec => !executives.some(e => e.idEmployee === exec._id)).map((executive) => (
                    <div
                      key={executive._id}
                      className={styles.executiveSelectionItem}
                      onClick={() => addExecutive({ 
                        idEmployee: executive._id, 
                        nameEmployee: `${executive.nombre} ${executive.apellido_paterno} ${executive.apellido_materno}`,
                        idUser: executive._iduser })}>
                      <span>{executive.nombre} {executive.apellido_paterno} {executive.apellido_materno}</span>
                      <Plus size={18} className={styles.addIcon} />
                    </div>
                  ))}
                {availableExecutives.filter(exec => !executives.some(e => e.idEmployee === exec._id)).length === 0 && (
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
                    step="any"
                    className={styles.input}
                    id="package-length"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>{t('quote.height')} ({useMetricSystem ? t('quote.cm') : t('quote.plg')})
                  </label>
                  <input
                    type="number"
                    step="any"
                    className={styles.input}
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
                    step="any"
                    className={styles.input}
                    id="package-width"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>{t('quote.weight')} ({useMetricSystem ? t('quote.kg') : t('quote.lbs')})
                  </label>
                  <input
                    type="number"
                    step="any"
                    className={styles.input}
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
                      length: length,
                      height: height,
                      width: width,
                      weight: weight,
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
