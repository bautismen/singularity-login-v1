import { useState, useEffect } from 'react';
import { Trash2, Plus, Copy, X, RotateCcw, Save, Eye, ArrowLeft, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Modal } from '../components/Modal';
import { quotationService } from '../services/quotationService';
import { getCustomers} from '../services/customerService';
import { getExecutivesByDepartment} from '../services/executiveService';
import styles from './Quotations.module.css';
import {QuotationRequest, Service, Executive, Shipment, Cargo} from '../types/requestQuotation';

/*
 * CLASIFICACION MERCANCIAS
 *  7 - PELIGROSA
 * 10 - REFRIGERADO
 * 8 - SOBREDIMENSIONADA
 * 5 - A GRANEL
 * 11- GENERAL
 */

interface QuotationsProps {
  mode?: 'create' | 'edit' | 'view';
  quotationId?: string | null;
  onBack?: (newId? : string) => void;
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
  const [showRejectQuotationRequestModal, setShowRejectQuotationRequestModal] = useState(false);
  const [merchandiseForm, setMerchandiseForm] = useState<Cargo>({
    merchandiseName: '',
    merchandiseDescription: '',
    classification: [],
    stowable: 0,
    shipmentTypeCargo: '', 
    idUnitMeasurement: 1,
    unitMeasurement: 'cm',  
    idUnitWeight: 1,
    unitWeight: 'kg',
    volumeTotal: 0,
    weigthTotal: 0,
    units: []
  });
  const [showPackagingModal, setShowPackagingModal] = useState(false);
  const [currentPackages, setCurrentPackages] = useState<any[]>([]);
  const [useMetricSystem, setUseMetricSystem] = useState(true);
  const [projectionShipmentState, setProjectionShipmentState] = useState<{[key: number] : boolean}>({});
  const [classificationMerchFlags, setClassificationMerchFlags] = useState({
    showDangerouseMerch : false,
    showRefrigeratedMerch : false,
    showOversizedMerch: false,
    showBulkClassMerch: false,
    showGeneralMerch : false,
  })
  const [byUnitsMerch, setByUnitsMerch] = useState(true);
  //const [isPort, setIsPort] = useState(false)
  const [formData, setFormData] = useState({
    referenceRequest: 'QR...',
    customerId: '',
    client: '',
    prospect : '',
    showProspect : false,
    isPriority: false,
    isQuote: false,
    customerCategory: 1,
    requestTypeId: 0,
    requestType: '',
    created: new Date().toISOString().split('T')[0],
    responseDeadline: '',
    statuscomments: null,
    idStatusRequest: 1,
  });

  const rolPricing = ["pricing"] // Roles que puuedo ir agregando para validar los botones del menu/admin
  const isPricingUser = user?.roles?.every(() => true) && rolPricing.every(v => user?.roles?.includes(v));

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (mode !== 'create' && quotationId) {
      loadQuotation(quotationId);
    }
  }, [mode, quotationId]);

  const resetForm = () => {
    //onBack('69af1fd25d2264a9f03e1b76');
    setFormData({
      referenceRequest: 'QR...',
      customerId: '',
      client: '',
      prospect : '',
      showProspect: false, 
      isPriority: false,
      isQuote: false,
      customerCategory: 1,
      requestTypeId: 0,
      requestType: '',
      created: new Date().toISOString().split('T')[0],
      responseDeadline: '',
      statuscomments: null,
      idStatusRequest: 1,
    });
    setServices([]);
  }

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

      const customersData =  await getCustomers(true);
      const requestTypesData = await requestTypesRes.json();
      const servicesData = await servicesRes.json();
      const executivesData = await getExecutivesByDepartment('Pricing');
      const incotermsData = await incotermsRes.json();
      const countriesData = await countriesRes.json();
      const imoData = await imoRes.json();

      setCustomers(customersData.filter((c: any) => c.status === 'activo' || c.datastate === 1));
      setRequestTypes(requestTypesData.filter((r: any) => r.status === 1));
      setAvailableServices(servicesData.filter((s: any) => s.status === 1)); // && s.category === 1));
      setAvailableExecutives(executivesData.filter((e: any) => e.estado === 1 && e.activo === true));
      setIncoterms(incotermsData.filter((i: any) => i.status === 1));
      setCountries(countriesData.filter((co: any) => co.status === 1));
      setImoList(imoData.filter((imo: any) => imo.status === 1));
    } catch (error) {
      //console.error('Error loading catalogs:', error);
      showError(t('quote.errors.loadCatalogs'));
    } finally {
      setLoading(false);
    }
  };

  const loadQuotation = async (id: string) => {
    try {      
      const data = await quotationService.getById(id);
      setFormData({
        referenceRequest: data.data.referenceRequest || '',
        customerId: data.data.customer.idCustomer || '',
        client: data.data.customer.customerName || '',
        prospect : data.data.customer.prospectName || '',
        showProspect : data.data.customer.prospectName ? true : false,
        isPriority: data.data.priority || false,
        isQuote: data.data.licitation || false,
        customerCategory: data.data.customer.customerCategory || 1,
        requestTypeId: data.data.idRequestType.toString() || 1,
        requestType: data.data.typeRequest || '',
        created: data.data.dateRequest ? new Date(data.data.dateRequest).toISOString().split('T')[0] : '',
        responseDeadline: data.data.dateDeadline ? new Date(data.data.dateDeadline).toISOString().split('T')[0] : '',
        statuscomments: data.data.statusComment || null,
        idStatusRequest: data.data.idStatusRequest || 1,
      });

      if (data.data.services && data.data.services.length > 0) {
          const loadedServices = data.data.services.map((service: any, idx: number) => {
            return {
              idServiceItem: idx + 1,
              idService : service.idService,
              nameService: service.nameService || '',
              used: service.used || false,
              shipments : service.shipments.map((shipment: any) => {
                if('projectionShipment' in shipment) {
                  setProjectionShipmentState(prev => ({
                    ...prev,
                    [service.idServiceItem] : true
                  }));
                }
                return shipment;
              }),
            };
        });
        setServices(loadedServices);
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
      //console.error('Error loading quotation:', error);
      showError(t('quote.errors.loadQuotation'));
    } 
  };

  const addService = () => {
    const newService: Service = {
      idServiceItem: services.length + 1,
      idService: 0,
      nameService: '',
      used: false, 
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
        cargo : []
      }]
    };
    setServices([...services, newService]);
  };

  const removeService = (idServiceItem: number) => {
    setServices(services.filter(service => service.idServiceItem !== idServiceItem));
  };

  const removeMerchandise = (serviceId: number,  merchandise: Cargo) => {

    setServices(services.map(service => {
      if (service.idServiceItem === serviceId) {       
          return {
            ...service,
            shipments: service.shipments.map(shipment => shipment.idShipment === 1 ? {
              ...shipment,
              cargo: shipment.cargo.filter(merch => merch !== merchandise)
            }: shipment)
          };              
      } return service;
    }));    

  };

  const removeExecutive = (id: string) => {
    setExecutives(executives.filter(executive => executive.idEmployee !== id));
  };

  const openMerchandiseModal = (serviceId: number, cargo?: Cargo) => {    
    setCurrentServiceId(serviceId);    
    setByUnitsMerch(true);
    setEditingMerchandise(cargo || null);    
    setClassificationMerchFlags({
      showDangerouseMerch : false,
      showRefrigeratedMerch : false,
      showOversizedMerch: false,
      showBulkClassMerch: false,
      showGeneralMerch : false
    })

    if (cargo) {        
      setByUnitsMerch(cargo?.units?.length === 0 ? false : true)
      setUseMetricSystem(cargo?.idUnitMeasurement === 1 ? true : false);
      setClassificationMerchFlags({
      showDangerouseMerch : cargo?.classification.some(classification => classification.idClassificationMerchandise === 7),
      showRefrigeratedMerch : cargo?.classification.some(classification => classification.idClassificationMerchandise === 10),
      showOversizedMerch: cargo?.classification.some(classification => classification.idClassificationMerchandise === 8),
      showBulkClassMerch: cargo?.classification.some(classification => classification.idClassificationMerchandise === 5),
      showGeneralMerch: cargo?.classification.some(classification => classification.idClassificationMerchandise === 11),
      })

      setMerchandiseForm({
        merchandiseName: cargo.merchandiseName,
        merchandiseDescription: cargo.merchandiseDescription || '',  
        classification : cargo.classification,     
        stowable: cargo.stowable,
        shipmentTypeCargo: cargo.shipmentTypeCargo,
        idUnitMeasurement: cargo.idUnitMeasurement ||  useMetricSystem ? 1 : 2,
        unitMeasurement: cargo.unitMeasurement ||  useMetricSystem ? "cm" : "in" ,                 
        idUnitWeight: cargo.idUnitWeight ||  useMetricSystem ? 1 : 2,
        unitWeight: cargo.unitWeight ||  useMetricSystem ? "kg" : "lb",
        volumeTotal: cargo.volumeTotal ,
        weigthTotal: cargo.weigthTotal,
        units: cargo.units        
      });

      setCurrentPackages(cargo.units || []);

    } else {

      setMerchandiseForm({
        merchandiseName: '',
        merchandiseDescription: '',
        classification: [],
        stowable: 0,
        shipmentTypeCargo: '', 
        idUnitMeasurement: 1,
        unitMeasurement: 'cm',  
        idUnitWeight: 1,
        unitWeight: 'kg',
        volumeTotal: 0,
        weigthTotal: 0,
        units: [] 
      });

      setCurrentPackages([]);
    }
    setShowMerchandiseModal(true);
  };

  const closeMerchandiseModal = () => {
    setShowMerchandiseModal(false);
    setByUnitsMerch(true);
    setClassificationMerchFlags({
      showDangerouseMerch : false,
      showRefrigeratedMerch : false,
      showOversizedMerch: false,
      showBulkClassMerch: false,
      showGeneralMerch : false,
    })
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
      id: Date.now()
      //unit: useMetricSystem ? 'metric' : 'imperial'
    }]);
    closePackagingModal();
  };

  const removePackage = (packageId: any) => {
    setCurrentPackages(currentPackages.filter(p => p !== packageId));
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

    return { 
      totalVolume : Number(totalVolume.toFixed(2)), 
      totalWeight : Number(totalWeight.toFixed(2)) };
  };

  const saveMerchandise = () => {
  
    if (!currentServiceId) return;

    if (!merchandiseForm?.merchandiseName.trim()) {
      showWarning(t('quote.warnings.merchandiseName'));
      return;
    }
    if(byUnitsMerch && currentPackages.length === 0){
       showWarning(t('quote.warnings.merchandisePackages'));
       return;
    }

    if(!byUnitsMerch  && 
      (merchandiseForm.volumeTotal == 0 || isNaN(merchandiseForm.volumeTotal) || 
      merchandiseForm.weigthTotal == 0 || isNaN(merchandiseForm.weigthTotal) ) ){
      showWarning(t('quote.warnings.merchandiseVolumenAndWeight'));
      return;
    }

    const dangerous = merchandiseForm.classification?.find(c => c.idClassificationMerchandise === 7);

    if(dangerous && 
      ((dangerous?.imo == null || dangerous?.imoDescription == undefined ) || 
      (dangerous?.un == null || dangerous?.un == '' ))) {
      showWarning(t('quote.warnings.IMOUN'));
       return;
    }

    const refrigerated = merchandiseForm.classification?.find(c => c.idClassificationMerchandise === 10);
    if(refrigerated && (refrigerated?.temperature == null )) {
      showWarning(t('quote.warnings.temperature'));
       return;
    }

    const {totalVolume = 0, totalWeight = 0 } = calculateTotals();   
    
    if (merchandiseForm.classification.length === 0) {
      merchandiseForm.classification.push({
        idClassificationMerchandise: 11,
        classificationMerchandise:'General'
      });
    }
    
    const newMerchandise: Cargo = {
      merchandiseName: merchandiseForm.merchandiseName,
      merchandiseDescription: merchandiseForm.merchandiseDescription,       
      stowable: merchandiseForm.stowable,
      shipmentTypeCargo: merchandiseForm.shipmentTypeCargo,
      idUnitMeasurement:  useMetricSystem ? 1 : 2 ,
      unitMeasurement: useMetricSystem ? 'cm' : 'in', 
      idUnitWeight: useMetricSystem ? 1 : 2,
      unitWeight: useMetricSystem ? 'kg' : 'lb',
      volumeTotal: byUnitsMerch ? totalVolume : merchandiseForm.volumeTotal,
      weigthTotal: byUnitsMerch ? totalWeight : merchandiseForm.weigthTotal,
      ...(currentPackages && { units: currentPackages?.map(pkg => ({
        ...pkg
      }))}),
      classification: merchandiseForm.classification
    };

    setServices(services.map(service => {
      if (service.idServiceItem === currentServiceId) {
        if (editingMerchandise) {
          return {
            ...service,
            shipments: service.shipments.map(shipment =>  shipment.idShipment === 1 ? {
              ...shipment,
              cargo: shipment.cargo.map(merch => merch === editingMerchandise ? newMerchandise : merch )
            }: shipment)
          };
        } else {
          return {
            ...service,
            shipments: service.shipments.map(shipment => shipment.idShipment=== 1 ? {
              ...shipment,
              cargo:  [...service.shipments[0].cargo, newMerchandise]
            }: shipment)
          };
        }
      }
      return service;
    }));

    setMerchandiseForm({
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

    closeMerchandiseModal();
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

  const duplicateService = (idServiceItem: number) => {
    const serviceToDuplicate = services.find(service => service.idServiceItem === idServiceItem);
    if (serviceToDuplicate) {
      const newService = { ...serviceToDuplicate, idServiceItem: services.length + 1 };      
      setServices([...services, newService]);
      setProjectionShipmentState(prevState => {
        const currentValue = prevState[ services.length + 1 ] ?? false;
        return {
          ...prevState,
          [services.length + 1] : !currentValue
        }      
      });
    }
  };

  const updateService = (id: number, changes: Record<any,any>) => {
    setServices(services.map(service => service.idServiceItem === id ? { 
      ...service,
      ...changes,
    } : service));
  };

  const updateShipment =(idServiceItem: number, idShipment: number,  field: keyof Shipment, value: any) => {
    setServices(services.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => shipment.idShipment === idShipment ? {
        ...shipment,
        [field]: value
      }: shipment)
    }: service));
  };

  const handleTypeOperationChange = (idServiceItem: number, idShipment: number, value: number, text: string) => {
    setServices(services.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => shipment.idShipment=== idShipment ? {
        ...shipment,
        idTypeOperation: value, 
        typeOperation: text 
      }: shipment)
    }: service));
  };

  const updateOrigin = (idServiceItem: number, idShipment: number,  changes : Record<any, any>) => {
    setServices(services.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => shipment.idShipment=== idShipment ? {
        ...shipment,
        origin : {
          ...shipment.origin,
          ...changes,
        }        
      }: shipment)
    }: service));
  };

   const updateDestination = (idServiceItem: number, idShipment: number,  changes : Record<any, any>) => {
    setServices(services.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => shipment.idShipment === idShipment ? {
        ...shipment,
        destination : {
          ...shipment.destination,
          ...changes,
        }        
      }: shipment)
    }: service));
  };

  const updateProjectionShipment = (idServiceItem: number, idShipment: number,  changes : Record<any, any>) => {
    setServices(services.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => shipment.idShipment=== idShipment ? {
        ...shipment,
        projectionShipment : {
          ...shipment.projectionShipment,
          ...changes,
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
    })
    }: service));
  }

  const handleIncotermChange = (idServiceItem: number, idShipment: number, value: number, text: string) => {
    setServices(prevServices => 
      prevServices.map(service => service.idServiceItem === idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => shipment.idShipment === idShipment ? {
        ...shipment,
        idIncoterm: value,
        incoterm: text
      }: shipment)
    }: service));
  };

  const handleTypeShipmentChange = (idServiceItem: number, idShipment: number, value: number, text: string) => {

    setServices(prevServices => 
      prevServices.map(service => service.idServiceItem === idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => shipment.idShipment === idShipment ? {
        ...shipment,
        idTypeShipment: value,
        typeShipment: text
      }: shipment)
    }: service));
  };

  const handleProjectionShipmentState = (idServiceItem : number) => {
    setProjectionShipmentState(prevState => {
      const currentValue = prevState[idServiceItem] ?? false;
      return {
        ...prevState,
        [idServiceItem] : !currentValue
      }      
    });
  }

  const handleStatusUpdate = async (statusId: number, statusName: string) => {
    try {      
      const quotationData = {
        IdRequest: quotationId,
        IdStatusRequest: statusId,
        StatusRequest: statusName,
        statusComment:
          statusId === 10
            ? (document.getElementById('comments-cancelation') as HTMLInputElement).value
            : statusId === 9
            ? (document.getElementById('comments-rejection') as HTMLInputElement).value
            : ''
      };
      if (quotationId) {
        await quotationService.changeStatus(quotationData);
        showSuccess(t('quote.success.statusUpdated').replace('{status}', statusName));
      }

      if (onBack) {
        onBack();
      }
    } catch (error) {
      //console.error('Error updating quotation status:', error);
      showError(t('quote.errors.updateStatus'));
    } finally {
      setSaving(false);
    }
  };

  const handleAsignateto = async () => {
    try {
      
      const quotationData = {
        IdRequest: quotationId,       
        Employees: executives.map(exec => ({
          IdExecutive: exec.idEmployee,
          FullName: exec.nameEmployee,
          IdUser: exec.idUser 
          //control_number: 'SN',
        })),        
                
      };

      if (quotationData.Employees.length === 0) {
        showError(t('quote.noExecutivesTitle'));
        return;
      }

      if (quotationId) {
        await quotationService.AsignateExecutive(quotationData);
        showSuccess(t('quote.executiveAssigned'));
      }

      if (onBack) {
        onBack();
      }
    } catch (error) {
      //console.error('Error updating quotation status:', error);
      showError(t('quote.errors.executivesAssingned'));
    } finally {
      setSaving(false);
    }
  };

  const handleSendQuotation = () => {
    handleStatusUpdate(2, 'Enviada');
  };

  const handleAcceptQuotation = () => {
    handleStatusUpdate(8, 'Aceptada');
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

  const handleRejectQuotation = () => {
    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Está a punto de rechazar la cotización',
      message: '¿Desea continuar con el rechazo?',
      showCancel: true,
      onConfirm: async () => {
        setShowRejectQuotationRequestModal(true)       
      }
    });
   
  };


  const handleSaveQuotation = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setSaving(true);
      const selectedCustomer = customers.find(c => c._id === formData.customerId);
      const hasAssignedExecutives = executives.length > 0;   

      const quotationData = {
        referenceRequest: formData.referenceRequest,
        idStatusRequest: hasAssignedExecutives ? 3 : 1,
        statusRequest: hasAssignedExecutives ? 'Asignada' : 'Creada', 
        dateRequest: new Date(formData.created),
        dateDeadline: formData.responseDeadline ? new Date(formData.responseDeadline) : null,
        idRequestType:  formData.requestTypeId,
        typeRequest: formData.requestType,
        priority: formData.isPriority ? 1 : 0,
        licitation: formData.isQuote ? 1: 0, 
        dateCreated: new Date().toISOString(),
        dateUpdated:new Date().toISOString(),
        createdBy: {
          idUser: user?._id || '',
          nameEmployee: user?.name || '',
          idEmployee: null
        },
        customer : formData.showProspect === false ? {
          idCustomer: formData.customerId,
          customerName: selectedCustomer?.fiscal_data?.business_name,
          customerCategory: formData.customerCategory,
        } : { prospectName : formData.prospect},

        assignedTo: executives.map(exec => ({
          idEmployee: exec.idEmployee,
          nameEmployee: exec.nameEmployee,
          idUser: exec.idUser
        })),       
                              
        services: services.map((service, idx) => {                                                                         
          const shipmentsInService = service.shipments.map((shipment, index) => {            
            const projectionShipment = projectionShipmentState[service.idServiceItem] === true &&
                                       shipment.projectionShipment?.frecuency && 
                                       shipment.projectionShipment?.idTypeMesurementFrecuency && 
                                       shipment.projectionShipment?.measurementFrecuency && 
                                       shipment.projectionShipment?.number ? {
              frecuency: shipment.projectionShipment?.frecuency || 1,
              idTypeMesurementFrecuency: shipment.projectionShipment?.idTypeMesurementFrecuency,
              measurementFrecuency: shipment.projectionShipment?.measurementFrecuency,
              number: shipment.projectionShipment?.number,
            } : undefined;
         
            return {
              idShipment: index + 1,
              origin: {
                idCountry : shipment.origin.idCountry,
                countryCode: shipment.origin.countryCode, 
                ...((shipment.origin.zipCode && [1, 3, 4].includes(shipment.idTypeShipment)) && {zipCode : shipment.origin.zipCode}) ,
                ...((shipment.origin.portCode && [2, 4].includes(shipment.idTypeShipment) && [1, 2].includes(service.idService)) && {portCode : shipment.origin.portCode}),
                ...((shipment.origin.airportCode && [2, 4].includes(shipment.idTypeShipment) && [5].includes(service.idService)) && {airportCode : shipment.origin.airportCode})                 
              } ,
              destination: {
                idCountry: shipment.destination.idCountry,
                countryCode: shipment.destination.countryCode,
                ...((shipment.destination.zipCode && [1, 3, 4].includes(shipment.idTypeShipment)) && {zipCode : shipment.destination.zipCode}) ,
                ...((shipment.destination.portCode && [2, 3].includes(shipment.idTypeShipment) && [1, 2].includes(service.idService)) && {portCode : shipment.destination.portCode}),
                ...((shipment.destination.airportCode && [2, 3].includes(shipment.idTypeShipment) && [5].includes(service.idService)) && {airportCode : shipment.destination.airportCode})
              },
              idTypeShipment: shipment.idTypeShipment,
              typeShipment: shipment.typeShipment,
              idTypeOperation: shipment.idTypeOperation,
              typeOperation: shipment.typeOperation,
              idIncoterm: shipment.idIncoterm,
              incoterm: shipment.incoterm,
              departureDateAproximate: shipment.departureDateAproximate ? new Date(shipment.departureDateAproximate): null,
              projectionShipment:shipment.projectionShipment ? projectionShipment : null,
              comments: shipment.comments,
              ...(shipment.servicesAsociated && { servicesAsociated: shipment.servicesAsociated }),              
              cargo : shipment.cargo.map(merchandise => ({
                merchandiseName: merchandise.merchandiseName,
                merchandiseDescription: merchandise.merchandiseDescription,
                classification: merchandise.classification || [],
                stowable: merchandise.stowable,
                shipmentTypeCargo:  [2, 3, 10].includes(service.idService) ?  'Contenerizada' : 'Suelta',
                idUnitMeasurement: merchandise.idUnitMeasurement, 
                unitMeasurement: merchandise.unitMeasurement,
                idUnitWeight: merchandise.idUnitWeight, 
                unitWeight: merchandise.unitWeight,
                volumeTotal: merchandise.volumeTotal,
                weigthTotal: merchandise.weigthTotal,
                units: merchandise.units?.map(unitMerch => ({
                  quantity : parseInt(unitMerch.quantity),
                  length: unitMerch.length,
                  width : unitMerch.width,
                  height : unitMerch.height,
                  weight : unitMerch.weight,
                  idUnitCargo : unitMerch.idUnitCargo,
                  unitCargo : unitMerch.unitCargo,
                }))
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
     
      if(quotationData.services.length == 0 ){
        setModalState({
          isOpen : true,
          type: 'warning',
          title: t('quote.serviceaddtitle'),
          message: t('quote.serviceaddmessage'),
          showCancel: false      
        });
        setSaving(false);
        return;
      }else if(quotationData.services.find(service => service.shipments.find(ship => ship.cargo.length === 0))){
        setModalState({
          isOpen : true,
          type: 'warning',
          title: t('quote.merchaddtitle'),
          message: t('quote.merchaddmessage'),
          showCancel: false      
        });
        setSaving(false);
        return;
      }   
     
      await performSave(quotationData);

    } catch (error) {
      //console.error('Error saving quotation:', error);
      showError(t('quote.errors.saveQuotation'));
    } finally {
      setSaving(false);
    }
  };

  const performSave = async (quotationData: QuotationRequest) => {
    try {      
      let result : any;
      setSaving(true);
      if (mode === 'edit' && quotationId) {
        quotationData.id = quotationId;
        const res = await quotationService.update(quotationData);
        //console.log('UPDATE: ', JSON.stringify(quotationData, null, 2), 'Result:', res);
        showSuccess(t('quote.success.updated'));
      } else {
        result = await quotationService.create(quotationData);
        //console.log(JSON.stringify(quotationData, null, 2), 'Create result:', result);
        showSuccess(t('quote.success.created'));
      }

      if (onBack && mode === 'create' ) {
        onBack(result.atrribute?.value);
      } else {        
        onBack();
      }
    } catch (error) {
      //console.error('Error in performSave:', error);
      showError(t('quote.errors.saveQuotation'));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const selectElement = document.getElementById('package-type') as HTMLSelectElement;
    const UnitCargo = selectElement.options[selectElement.selectedIndex].text;
    const quantity = (document.getElementById('package-quantity') as HTMLInputElement).value;
    const length = (document.getElementById('package-length') as HTMLInputElement).value;
    const height = (document.getElementById('package-height') as HTMLInputElement).value;
    const width = (document.getElementById('package-width') as HTMLInputElement).value;
    const weight = (document.getElementById('package-weight') as HTMLInputElement).value;                
    if (UnitCargo && quantity && length && height && width && weight) {      
        addPackage({
        idUnitCargo : parseInt(selectElement.value),
        unitCargo: UnitCargo,
        quantity: parseInt(quantity),
        length: length,
        height: height,
        width: width,
        weight: weight,
        });            
    } 
  }

  const renderZipCodesOriginDestination =  (service : Service) => {
    const isPort = [1, 2].includes(service.idService); //Maritimo FCL y LCL
    switch(true) {
      case [3, 4, 10, 11].includes(service.idService) || service.shipments[0].idTypeShipment === 1 : 
      return (
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
                {t('quote.originZip')}
              </label>
            <input
              type="number"
              min="1"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.slice(0, 9);
              }}
              value={service.shipments[0].origin.zipCode}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e') {
                  e.preventDefault();
                }
              }}
              onChange={(e) => 
              {
                const value = e.target.value
                if (value === '' || Number(value) > 0) {
                  updateOrigin(service.idServiceItem, service.shipments[0].idShipment,  {zipCode : parseInt(e.target.value)})
                }
              }}
              className={styles.input}
              disabled={mode === 'view' || formData.idStatusRequest >= 2}
              required/>
          </div>    
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('quote.destinationZip')}
            </label>
            <input
              type="number"
              min="0"
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e') {
                  e.preventDefault();
                }
              }}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.slice(0, 9);
              }}
              value={service.shipments[0].destination.zipCode}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || Number(value) > 0) {
                  updateDestination(service.idServiceItem, service.shipments[0].idShipment, {zipCode : parseInt(e.target.value)})
                }
              }}
              className={styles.input}
              disabled={mode === 'view' || formData.idStatusRequest >= 2}
              required/>
          </div>    
        </div>
      );
      case service.shipments[0].idTypeShipment === 2: 
      return (
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {isPort ? t('quote.originPort') : t('quote.originAirport')}
            </label>
            <input
              className={`${styles.input}`}
              type="text"
              maxLength={20}
              placeholder={isPort ? 'MXVER' : 'MXMEX'}
              value={isPort ? service.shipments[0].origin.portCode ?? '' : service.shipments[0].origin.airportCode ?? '' }
              onChange={(e) => updateOrigin(service.idServiceItem, service.shipments[0].idShipment, isPort? {portCode: e.target.value.toUpperCase() } : {airportCode: e.target.value.toUpperCase()})}              
              disabled={mode === 'view' || formData.idStatusRequest >= 2}
              required />
          </div>  
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {isPort ?  t('quote.destinationPort') : t('quote.destinationAirport')}
            </label>
            <input
              type="text"
              maxLength={20}
              placeholder={isPort ? 'MXVER' : 'MXMEX'}
              value={isPort ? service.shipments[0].destination.portCode ?? '' : service.shipments[0].destination.airportCode ?? '' }
              onChange={(e) => updateDestination(service.idServiceItem, service.shipments[0].idShipment, isPort? {portCode: e.target.value.toUpperCase() } : {airportCode: e.target.value.toUpperCase()})}
              className={styles.input}
              disabled={mode === 'view' || formData.idStatusRequest >= 2}
              required/>
          </div>                            
        </div>
      )
      case service.shipments[0].idTypeShipment === 3 : 
      return (
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('quote.originZip')}
            </label>
            <input
              type="number"
              min="0"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.slice(0, 9);
              }}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e') {
                   e.preventDefault();
                }
              }}
              value={service.shipments[0].origin.zipCode}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || Number(value) > 0) {
                updateOrigin(service.idServiceItem, service.shipments[0].idShipment, {zipCode: e.target.value})
                }}
              }
              className={styles.input}
              disabled={mode === 'view' || formData.idStatusRequest >= 2}
              required/>
          </div>  
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {isPort ? t('quote.destinationPort') : t('quote.destinationAirport')}
            </label>
            <input
              type="text"
              maxLength={20}
              placeholder={isPort ? 'MXVER' : 'MXMEX'}
              value={isPort ? service.shipments[0].destination.portCode ?? '' : service.shipments[0].destination.airportCode ?? '' }
              onChange={(e) => 
                updateDestination(service.idServiceItem, 
                service.shipments[0].idShipment, 
                isPort? {portCode: e.target.value.toUpperCase() } : {airportCode: e.target.value.toUpperCase()}) }
              className={styles.input}
              disabled={mode === 'view' || formData.idStatusRequest >= 2}
              required/>
          </div>                            
        </div>);      
      case service.shipments[0].idTypeShipment === 4: 
      return( 
        <div className={styles.formGrid}>   
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {isPort ? t('quote.originPort') : t('quote.originAirport')}
            </label>
            <input
              type="text"
              maxLength={20}
              placeholder={isPort ? 'MXVER' : 'MXMEX'}
              value={isPort ? service.shipments[0].origin.portCode ?? '' : service.shipments[0].origin.airportCode ?? '' }
              onChange={(e) => updateOrigin(service.idServiceItem, service.shipments[0].idShipment,  isPort? {portCode: e.target.value.toUpperCase() } : {airportCode: e.target.value.toUpperCase()})}
              className={styles.input}
              disabled={mode === 'view' || formData.idStatusRequest >= 2}
              required />
          </div>    
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('quote.destinationZip')}
            </label>
            <input
              type="number"
              min="0"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.slice(0, 9);
              }}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e') {
                   e.preventDefault();
                }
              }}
              value={service.shipments[0].destination.zipCode}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || Number(value) > 0) {
                updateDestination(service.idServiceItem, service.shipments[0].idShipment, {zipCode : parseInt(e.target.value)})
                }}
              }
              className={styles.input}
              disabled={mode === 'view' || formData.idStatusRequest >= 2}
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
      <form onSubmit={handleSaveQuotation} 
      onKeyDown={(e) => { 
        if(e.key === "Enter"){ 
          e.preventDefault(); 
          }}} >
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
            {mode === 'view' ? t('quote.viewTitle') : mode === 'edit' ? t('quote.editTitle') : t('quote.title')}
          </h1>
        </div>
        <div className={styles.actionBar}>
          <button
            className={styles.actionBarSaveButton}
            type="submit"
            disabled={saving || mode === 'view' || formData.idStatusRequest >= 2}>
            <Save size={18} />
            <span>{saving ? t('catalog.saving') : t('quote.save')}</span>
          </button>
          {mode === 'create' && (
            <button type="button" className={styles.actionBarResetButton} onClick={resetForm}>
              <RotateCcw size={18} />
            </button>
          )}          
           <button type="button" className={styles.actionBarResetButton} onClick={handleAsignateto} hidden={formData.idStatusRequest <= 1}  disabled={saving || mode === 'view'} >
            <User size={18} />
            <span>{t('quote.add')}</span>
          </button>
        </div>
      </div>
      {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
            </div>
            ) :
      <div>
      {formData?.statuscomments !== null && (
        <div>
         <label className={styles.label}>Comentarios por cancelación</label>
          <label className={styles.labelInfoRed} > {formData.statuscomments}</label>
        </div>        
      )}

      <div className={styles.section}>        
        <h2 className={styles.sectionTitle}>{t('quote.generalData')}</h2>        
        <div >
          <div className={styles.formGrid}  style={{ marginTop: '1.5rem' }}> 
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>{t('quote.reference')}
              </label>
              <input
                type="text"
                value={formData.referenceRequest}
                onChange={(e) => setFormData({ ...formData, referenceRequest: e.target.value })}
                className={styles.input}
                disabled
              />
            </div>    
          
            {!formData.showProspect ? (
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
                  className={styles.clientSelect}              
                  disabled={loading || mode === 'view' || mode === 'edit' || formData.idStatusRequest >= 2}
                  required>
                  <option value="">{t('quote.selectClient')}</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.branch_name ? `${customer.branch_name}, ${customer.fiscal_data?.business_name}` : customer.fiscal_data?.business_name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>{t('quote.prospect')}
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={formData.prospect}
                  onChange={(e) => {                      
                    setFormData({ ...formData, prospect: e.target.value })
                  }}                
                  className={styles.input}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}/>
              </div>
            )}
          <div className={styles.formGroup}> 
            <div className={styles.prospectCheckbox} >
              <label className={styles.label} >
                {t('quote.prospect')}
              </label>
              <input
                type="checkbox"
                checked={formData.showProspect}
                onChange={() => { setFormData({ ...formData, showProspect: !formData.showProspect }) }}                
                disabled={loading || mode === 'view' || mode === 'edit' || formData.idStatusRequest >= 2} >
              </input>                                    
            </div> 
          </div>

          </div>   
          
          <div className={styles.formGrid} style={{ marginTop: '1.5rem' }}> 
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
                disabled={loading || mode === 'view' || formData.idStatusRequest >= 2}
                required>
                <option value="">{t('quote.selectType')}</option>
                {requestTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.request_type_name}
                  </option>
                ))}
              </select>
            </div>          

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('quote.responseDeadline')}</label>
              <input
                type="date"
                onKeyDown={(e) => e.preventDefault()}
                min= {mode === 'create' ? new Date().toISOString().split("T")[0] : undefined}
                value={formData.responseDeadline}
                onChange={(e) => {                      
                  setFormData({ ...formData, responseDeadline: e.target.value })
                  }
                }                
                className={styles.input}
                placeholder="dd/mm/aaaa"
                disabled={mode === 'view' || formData.idStatusRequest >= 2}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>{t('quote.requestDate')}
              </label>
              <input
                type="date"
                onKeyDown={(e) => e.preventDefault()}
                max={mode === 'create'  ? new Date().toISOString().split("T")[0] : undefined}
                value={formData.created}
                onChange={(e) => 
                  {                     
                    setFormData({ ...formData, created: e.target.value })}
                  }
                className={styles.input}
                disabled={mode === 'view' || formData.idStatusRequest >= 2}
              />
            </div>
          </div>

          <div className={styles.formGrid} style={{ marginTop: '1.5rem' }}>       
            <div className={styles.formGroupWithToggle}>
              <label className={styles.label}>{t('quote.isPriority')}</label>
              <button
                type="button" 
                className={`${styles.toggleSwitch} ${formData.isPriority ? styles.active : ''}`}
                onClick={() => setFormData({ ...formData, isPriority: !formData.isPriority })}
                disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                <div className={styles.toggleThumb}></div>
              </button>
            </div>

            <div className={styles.formGroupWithToggle}>
            <label className={styles.label}>{t('quote.isBid')}</label>
            <button
              type="button" 
              className={`${styles.toggleSwitch} ${formData.isQuote ? styles.active : ''}`}
              onClick={() => setFormData({ ...formData, isQuote: !formData.isQuote })}
              disabled={mode === 'view' || formData.idStatusRequest >= 2}>
              <div className={styles.toggleThumb}></div>
            </button>
            </div>

            {!formData.showProspect ? (
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('quote.customerCategory')}</label>
                <select
                  value={formData.customerCategory}
                  onChange={(e) => setFormData({ ...formData, customerCategory: parseInt(e.target.value) })}
                  className={styles.select}
                  disabled>
                  <option value={1}>Golden</option>
                  <option value={2}>Silver</option>
                  <option value={3}>Bronze</option>
                </select>
              </div>
            ) :(<div/>)}  
          </div>  

          {mode === 'edit' && (
            <div className={styles.statusButtonsContainer}>
              <button
                type="button" 
                className={styles.cancelButton}
                onClick={handleCancelQuotation}
                disabled={saving}
                hidden={formData.idStatusRequest >= 5}>
                {t('quote.cancelrequest')}
              </button>

              {showCancelQuotationRequestModal && (
              <div className={styles.modalOverlay} onClick={() => {setShowCancelQuotationRequestModal(false)}}>
                <div className={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{t('quote.reasons')}</h2>
                    <button type="button" className={styles.closeButton} onClick={() => {setShowCancelQuotationRequestModal(false) }}>
                      <X size={24} />
                    </button>
                  </div>
                  <div className={styles.modalBody}>
                  <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
                    <label className={styles.label}>{t('quote.writereasons')}</label>
                    <textarea id="comments-cancelation" className={styles.textarea} rows={3} placeholder="" />
                    <div className={styles.modalFooter}>
                      <button type="button" className={styles.saveModalButton} 
                      onClick={() => handleStatusUpdate(10, "Cancelada")}>
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
                disabled={saving} 
                hidden={formData.idStatusRequest >= 2}>                  
                {t('quote.send')}
              </button>

              <button
                type="button" 
                className={styles.cancelButton}
                onClick={handleRejectQuotation}
                disabled={saving}
                 hidden={formData.idStatusRequest !== 5 || formData.idStatusRequest === 8 || formData.idStatusRequest === 9}>
                {t('quote.reject')}
              </button>

              {showRejectQuotationRequestModal && (
              <div className={styles.modalOverlay} onClick={() => {setShowRejectQuotationRequestModal(false)}}>
                <div className={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{t('quote.reasonsreject')}</h2>
                    <button type="button" className={styles.closeButton} onClick={() => {setShowRejectQuotationRequestModal(false) }}>
                      <X size={24} />
                    </button>
                  </div>
                  <div className={styles.modalBody}>
                  <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
                    <label className={styles.label}>{t('quote.writereasonsreject')}</label>
                    <textarea id="comments-rejection" className={styles.textarea} rows={3} placeholder="" />
                    <div className={styles.modalFooter}>
                      <button type="button" className={styles.saveModalButton} 
                      onClick={() => handleStatusUpdate(9, "Rechazada")}>
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
                onClick={handleAcceptQuotation}
                disabled={saving} 
                hidden={formData.idStatusRequest !== 5 || formData.idStatusRequest === 8 || formData.idStatusRequest === 9}>               
                {t('quote.accept')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quote.services')}</h2>

        {services.map((service, index) => {  
          const showProjection = projectionShipmentState[service.idServiceItem] ?? service.shipments[0].projectionShipment ;

          return (
          <div key={service.idServiceItem} className={styles.serviceCard}>
            <div className={styles.serviceHeader}>
              <div className={styles.serviceNumber}>{index + 1}</div>
              <div className={styles.serviceActions}>
                <button type="button" className={styles.iconButton} onClick={() => duplicateService(service.idServiceItem)} disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                  <Copy size={18} />
                </button>
                <button
                    type="button" 
                    className={`${styles.iconButton} ${styles.danger}`}
                    onClick={() => removeService(service.idServiceItem)}
                    disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                    <X size={18} />
                </button>               
              </div>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.trafficType')}
                </label>
                <select
                  value={service.nameService}
                  onChange={(e) => {
                    updateService(
                      service.idServiceItem, 
                      {
                        idService: parseInt(e.target.selectedOptions[0].dataset.serviceId!, 0) ,
                        nameService: e.target.value
                      }
                    );
                  }}
                  className={styles.select}
                  disabled={loading || mode === 'view' || formData.idStatusRequest >= 2}
                  required>
                  <option value="">{t('quote.select')}</option>
                  {availableServices.filter((service) => service.status === 1 && service.category === 1).map((service_) => (
                    <option key={service_._id} value={service_.service_name} data-service-id={service_._id}>
                      {service_.service_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.loadType')}
                </label>
                <select
                  value={service.nameService === "Maritimo FCL" || service.nameService === "Terrestre FTL" || service.nameService === "Terrestre FCL"  ? 'Full' : 'Consolidado' }
                  //onChange={(e) => updateService(service.idService, 'idService', e.target.value)}
                  className={styles.select}
                  disabled
                  required>
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
                  value={service.shipments[0].idTypeOperation}
                  onChange={(e) => //updateShipment(service.idServiceItem, service.shipments[0].idShipment, 'typeOperation', e.target.value)}
                    handleTypeOperationChange(
                      service.idServiceItem,
                      service.shipments[0].idShipment,
                      Number(e.target.value),
                      e.target.options[e.target.selectedIndex].text
                    )
                  }
                  className={styles.select}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}
                  required>
                  <option value="">{t('quote.select')}</option>
                  <option value={1}>{t('quote.import')}</option>
                  <option value={2}>{t('quote.export')}</option>
                  <option value={3}>{t('quote.national')}</option>
                  <option value={4}>{t('quote.localUSA')}</option>
                  <option value={5}>{t('quote.Triangulacion')}</option>
                </select>
              </div>  
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.incoterm')}
                </label>
                <select
                  value={service.shipments[0].idIncoterm || ''}
                  onChange={(e) => //updateShipment(service.idServiceItem, service.shipments[0].idShipment, 'incoterm', e.target.value)}
                  handleIncotermChange(
                      service.idServiceItem,
                      service.shipments[0].idShipment,
                      Number(e.target.value),
                      e.target.options[e.target.selectedIndex].text
                    )
                  }
                  className={styles.select}
                  disabled={loading || mode === 'view' || formData.idStatusRequest >= 2}
                  required>
                  <option value="">{t('quote.select')}</option>
                  {incoterms.map((inc) => (
                    <option key={inc._id} value={inc._id}>
                      {inc.incoterm}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>{t('quote.shippingType')}
                </label>
                <select
                  value={service.shipments[0].idTypeShipment}
                  onChange={(e) => {
                    handleTypeShipmentChange(
                        service.idServiceItem,
                        service.shipments[0].idShipment,
                        Number(e.target.value),
                        e.target.options[e.target.selectedIndex].text
                      )
                    }
                  }
                  className={styles.select}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}
                  required>
                  <option value="">{t('quote.select')}</option>
                  <option value={1}>{t('quote.doorToDoor')}</option>
                  <option disabled={[3, 4, 10, 11].includes(service.idService)} value={2}>{t('quote.portToPort')}</option>
                  <option value={3}>{t('quote.doorToPort')}</option>
                  <option value={4}>{t('quote.portToDoor')}</option>
                </select>
              </div>    
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('quote.expectedDeparture')}</label>
                <input
                  type="date"
                  onKeyDown={(e) => e.preventDefault()}
                  min={mode === 'create' ? new Date().toISOString().split("T")[0] : undefined}
                  value={formatDateForInput(service.shipments[0].departureDateAproximate || '') }
                  onChange={(e) => updateShipment(service.idServiceItem, service.shipments[0].idShipment, 'departureDateAproximate', e.target.value)}
                  className={styles.input}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}/>
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
                  onChange={(e) => {
                    updateOrigin(service.idServiceItem, service.shipments[0].idShipment, 
                    {
                      idCountry: e.target.value , 
                      countryCode : e.target.selectedOptions[0].dataset.shipmentOriginCountryName
                    })}}
                  className={styles.select}
                  disabled={loading || mode === 'view' || formData.idStatusRequest >= 2}
                  required >
                  <option value="">{t('quote.select')}</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country._id} data-shipment-origin-country-name={country.country_code} >
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
                  onChange={(e) => updateDestination(service.idServiceItem, service.shipments[0].idShipment, 
                    {
                      idCountry: e.target.value , 
                      countryCode : e.target.selectedOptions[0].dataset.shipmentDestinationCountryName
                    })}
                  className={styles.select}
                  disabled={loading || mode === 'view' || formData.idStatusRequest >= 2}
                  required>
                  <option value="">{t('quote.select')}</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country._id} data-shipment-destination-country-name={country.country_code} >
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
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                  <span>{t('quote.insurance')}</span>
                </button>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 13) ? styles.selected : ''}`}
                  onClick={() => updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment,  { idServiceAsociated: 13, serviceAsociatedName: 'Maniobra' })}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                  <span>{t('quote.maneuver')}</span>
                </button>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 15) ? styles.selected : ''}`}
                  onClick={() => updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment, { idServiceAsociated: 15, serviceAsociatedName: 'Custodia' } )}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                  <span>{t('quote.custody')}</span>
                </button>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 14) ? styles.selected : ''}`}
                  onClick={() => updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment, { idServiceAsociated: 14, serviceAsociatedName: 'Inspección' })}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                  <span>{t('quote.inspection')}</span>
                </button>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 7)? styles.selected : ''}`}
                  onClick={() => updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment,  { idServiceAsociated: 7, serviceAsociatedName: 'Despacho' })}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                  <span>{t('quote.customsClearance')}</span>
                </button>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 6)? styles.selected : ''}`}
                  onClick={() => updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment,  { idServiceAsociated: 6, serviceAsociatedName: 'Almacén' })}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                  <span>{t('quote.warehouse')}</span>
                </button>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 8)? styles.selected : ''}`}
                  onClick={() => updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment,  { idServiceAsociated: 8, serviceAsociatedName: 'Paquetería' })}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                  <span>{t('quote.parcelService')}</span>
                </button>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 9)? styles.selected : ''}`}
                  onClick={() => updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment,  { idServiceAsociated: 9, serviceAsociatedName: 'UVA' })}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                  <span>UVA</span>
                </button>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 16)? styles.selected : ''}`}
                  onClick={() => updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment,  { idServiceAsociated: 16, serviceAsociatedName: 'Free Hand' })}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                  <span>Free Hand</span>
                </button>
                <button
                  type="button" 
                  className={`${styles.serviceChip} ${service.shipments[0].servicesAsociated?.some(servAsociated => servAsociated.idServiceAsociated === 17)? styles.selected : ''}`}
                  onClick={() => updateServicesAssociated(service.idServiceItem, service.shipments[0].idShipment,  { idServiceAsociated: 17, serviceAsociatedName: 'Previo en origen' })}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                  <span>{t('quote.PreInspectionOrigin')}</span>
                </button>
              </div>
            </div>
            <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
              <label className={styles.label}>{t('quote.comments')}</label>
              <textarea
                maxLength={500}
                value={service.shipments[0].comments}
                onChange={(e) => updateShipment(service.idServiceItem, service.shipments[0].idShipment, 'comments', e.target.value)}
                className={styles.textarea}
                rows={3}
                placeholder=""
                disabled={mode === 'view' || formData.idStatusRequest >= 2}
              />
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <div className={styles.frequencyHeader}>
                <input
                  type="checkbox"
                  id={`freq-${service.idService}`}
                  checked={showProjection}
                  onChange={() => { handleProjectionShipmentState(service.idServiceItem) }}
                  className={styles.checkbox}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2} />
                <label htmlFor={`freq-${service.idService}`} className={styles.checkboxLabel}>
                  {t('quote.programFrequency')}
                </label>
              </div>
              { 
              showProjection && (
                <div className={styles.frequencyGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('quote.frequencyPeriod')}</label>
                    <select
                      required
                      value={service.shipments[0].projectionShipment?.frecuency}
                      onChange={(e) => updateProjectionShipment(service.idServiceItem, service.shipments[0].idShipment, {frecuency: e.target.value})}
                      className={styles.select}
                      disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                      <option value="">{t('quote.select')}</option>
                      <option value="Semanal">{t('quote.weekly')}</option>
                      <option value="Mensual">{t('quote.monthly')}</option>
                      <option value="Anual">{t('quote.yearly')}</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('quote.quantity')}</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="any"
                      value={service.shipments[0].projectionShipment?.number}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                        }
                        if (e.currentTarget.value.length >= 7 && e.key !== "Backspace" && e.key !== "Delete") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) =>
                      { 
                        const value = e.target.value
                        if (value === '' || Number(value) > 0) {
                          updateProjectionShipment(service.idServiceItem, service.shipments[0].idShipment, {number: Number(e.target.value)})
                        }
                      }}
                      className={styles.input}
                      disabled={mode === 'view' || formData.idStatusRequest >= 2}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('quote.unit')}</label>
                    <select
                      required
                      value={service.shipments[0].projectionShipment?.idTypeMesurementFrecuency}
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.slice(0, 9);
                      }}
                      onChange={(e) => 
                        updateProjectionShipment(
                          service.idServiceItem, 
                          service.shipments[0].idShipment, 
                          { idTypeMesurementFrecuency: parseInt(e.target.value), 
                            measurementFrecuency : e.target.options[e.target.selectedIndex].text })}
                      className={styles.select}
                      disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                      <option value="">{t('quote.select')}</option>
                      <option value={1}>{t('quote.kilos')}</option>
                      <option value={2}>{t('quote.tons')}</option>
                      <option value={3}>{t('quote.containers')}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.merchandiseSection}>
              <h3 className={styles.subsectionTitle}>{t('quote.merchandise')}</h3>
              <div className={styles.merchandiseTable}>
                <table className={styles.simpleTable}>
                  <thead>
                    <tr>
                      <th>{t('quote.merchandise')}</th>
                      <th>{t('quote.dangerous')}</th>
                      <th>{t('quote.refrigerated')}</th>
                      <th>{t('quote.stackable')}</th>
                      <th>{t('quote.totalVolume')}</th>
                      <th>{t('quote.totalWeight')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.shipments[0].cargo.map((merch, index = 0) => (
                      <tr key={index + 1}>
                        <td>{merch.merchandiseName}</td>
                        <td>{merch.classification?.some(clas => clas.idClassificationMerchandise === 7) ? 'Si' : 'No'}</td>
                        <td>{merch.classification?.some(clas => clas.idClassificationMerchandise === 10) ? 'Si' : 'No'}</td>
                        <td>{merch.stowable ? 'Si' : 'No'}</td>
                        <td>{merch.volumeTotal} {merch.unitMeasurement} </td>
                        <td>{merch.weigthTotal} {merch.unitWeight}</td>
                        <td>
                          <div className={styles.tableActions}>
                            <button
                              type="button" 
                              className={styles.iconButtonSmall}
                              onClick={() => removeMerchandise(service.idServiceItem, merch)}
                              title={t('quote.delete')}
                              disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                              <Trash2 size={14} />
                            </button>
                            <button
                              type="button" 
                              className={styles.viewButtonGreen}
                              onClick={() => openMerchandiseModal(service.idServiceItem, merch)}
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
                disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                <Plus size={16} />
                {t('quote.addMerchandise')}
              </button>
            </div>
          </div>
        )}
        )}

        <button type="button" className={styles.addServiceButton} onClick={addService} disabled={mode === 'view' || formData.idStatusRequest >= 2}>
          <Plus size={20} />
          <span>{t('quote.addService')}</span>
        </button>
      </div>

      <div className={styles.section} hidden={!isPricingUser}>
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
          <button type="button" className={styles.addExecutiveButton} onClick={openExecutiveModal} disabled={mode === 'view' } >
            <Plus size={16} />
            {t('quote.addExecutive')}
          </button>
        </div>
      </div>      
      </div>
      }
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
                    maxLength={80}
                    minLength={3}
                    placeholder="Baterías de Telefonos Modelo 388"
                    className={styles.input}
                    value={merchandiseForm?.merchandiseName}
                    onChange={(e) => setMerchandiseForm({ ...merchandiseForm, merchandiseName: e.target.value})}
                    disabled={mode === 'view' || formData.idStatusRequest >= 2} />
                </div>
                <div className={styles.modalFieldSmall}>
                  <label className={styles.label}>{t('quote.isStackable')}</label>
                  <div className={styles.toggleContainer}>
                    <button
                      className={`${styles.toggleSwitch} ${merchandiseForm?.stowable === 1 ? styles.active : ''}`}
                      onClick={() => setMerchandiseForm({ ...merchandiseForm, stowable: !merchandiseForm.stowable ? 1 : 0 })}
                      disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                      <div className={styles.toggleThumb}></div>
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('quote.merchandiseDescription')}</label>
                <textarea
                  className={styles.textarea}
                  maxLength={500}
                  rows={3}
                  value={merchandiseForm?.merchandiseDescription}
                  disabled={mode === 'view' || formData.idStatusRequest >= 2}
                  onChange={(e) => setMerchandiseForm({ 
                    ...merchandiseForm, 
                    merchandiseDescription: e.target.value || "" 
                  })}
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
                          checked={classificationMerchFlags.showDangerouseMerch}
                          onChange={(e) => {
                            setClassificationMerchFlags({...classificationMerchFlags, showDangerouseMerch:!classificationMerchFlags.showDangerouseMerch });
                            const currentClassifications =  merchandiseForm?.classification ?? [];
                            const exists = currentClassifications.some(cl  => cl.idClassificationMerchandise === 7)
                            
                            setMerchandiseForm({
                              ...merchandiseForm,
                              classification : exists ? currentClassifications.filter(ccl => 
                                ccl.idClassificationMerchandise !== 7
                              ) : [ ...currentClassifications,  
                                    { idClassificationMerchandise: 7,
                                      classificationMerchandise: 'Peligrosa'
                                    } 
                                  ]
                            })
                          }
                        }
                          disabled={mode === 'view' || formData.idStatusRequest >= 2}
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
                          checked={classificationMerchFlags.showRefrigeratedMerch}
                          onChange={(e) => {
                            setClassificationMerchFlags({...classificationMerchFlags, showRefrigeratedMerch:!classificationMerchFlags.showRefrigeratedMerch });                                                     
                            const currentClassifications =  merchandiseForm?.classification ?? [];
                            const exists = currentClassifications.some(cl  => cl.idClassificationMerchandise === 10);

                            setMerchandiseForm({
                              ...merchandiseForm,
                              classification : exists ? currentClassifications.filter(ccl => 
                                ccl.idClassificationMerchandise !== 10
                              ) : [ ...currentClassifications,  
                                    { idClassificationMerchandise: 10,
                                      classificationMerchandise: 'Refrigerada'
                                    } 
                                  ]
                            })
                          }}
                          disabled={mode === 'view' || formData.idStatusRequest >= 2}
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
                          checked={classificationMerchFlags.showOversizedMerch}
                          onChange={(e) => {
                            setClassificationMerchFlags({...classificationMerchFlags, showOversizedMerch: !classificationMerchFlags.showOversizedMerch });                         
                            const currentClassifications =  merchandiseForm?.classification ?? [];
                            const exists = currentClassifications.some(cl  => cl.idClassificationMerchandise === 8)
                            
                            setMerchandiseForm({
                              ...merchandiseForm,
                              classification : exists ? currentClassifications.filter(ccl => 
                                ccl.idClassificationMerchandise !== 8
                              ) : [ ...currentClassifications,  
                                    { idClassificationMerchandise: 8,
                                      classificationMerchandise: 'Sobredimensionada'
                                    } 
                                  ]
                            })
                          }}
                          disabled={mode === 'view' || formData.idStatusRequest >= 2}
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
                          checked={classificationMerchFlags.showBulkClassMerch}
                           onChange={(e) => {
                            setClassificationMerchFlags({...classificationMerchFlags, showBulkClassMerch:!classificationMerchFlags.showBulkClassMerch });                         
                            const currentClassifications =  merchandiseForm?.classification ?? [];
                            const exists = currentClassifications.some(cl  => cl.idClassificationMerchandise === 5)
                            
                            setMerchandiseForm({
                              ...merchandiseForm,
                              classification : exists ? currentClassifications.filter(ccl => 
                                ccl.idClassificationMerchandise !== 5
                              ) : [ ...currentClassifications,  
                                    { idClassificationMerchandise: 5,
                                      classificationMerchandise: 'Granel'
                                    } 
                                  ]
                            })
                          }}
                          disabled={mode === 'view' || formData.idStatusRequest >= 2}
                        />
                        <label htmlFor="granel" className={styles.classificationLabel}>
                          {t('quote.bulkClass')}
                        </label>
                      </div>
                      <div className={styles.classificationCheckbox}>
                        <input
                          type="checkbox"
                          id="general"
                          className={styles.checkbox}
                          checked={classificationMerchFlags.showGeneralMerch}
                          onChange={(e) => {
                            setClassificationMerchFlags({...classificationMerchFlags, showGeneralMerch:!classificationMerchFlags.showGeneralMerch }); 
                            const currentClassifications =  merchandiseForm?.classification ?? [];
                            const exists = currentClassifications.some(cl  => cl.idClassificationMerchandise === 11)
                            
                            setMerchandiseForm({
                              ...merchandiseForm,
                              classification : exists ? currentClassifications.filter(ccl => 
                                ccl.idClassificationMerchandise !== 11
                              ) : [ ...currentClassifications,  
                                    { idClassificationMerchandise: 11,
                                      classificationMerchandise: 'General'
                                    } 
                                  ]
                                }
                              )
                          }}
                          disabled={mode === 'view' || formData.idStatusRequest >= 2} />
                        <label htmlFor="general" className={styles.classificationLabel}>
                          General
                        </label>
                      </div>
                    </div>
                    <div className={styles.classificationColumn}>
                      {classificationMerchFlags.showDangerouseMerch && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>*{t('quote.imo')}</label>
                            <select
                              className={styles.select}
                              value={merchandiseForm.classification?.find(classification => classification.idClassificationMerchandise === 7)?.imo }
                              onChange={(e) => {
                                const selectedImo = imoList.find(imo_ => imo_.imo === e.target.value);                               
                                const currentClassifications =  merchandiseForm?.classification ?? [];                                      
                                setMerchandiseForm({
                                  ...merchandiseForm,
                                  classification : currentClassifications.map(currentClas => currentClas.idClassificationMerchandise === 7 ? {
                                    ...currentClas,
                                    imo: e.target.value,
                                    imoDescription :  selectedImo?.description
                                  } : currentClas)                                  
                                })                                
                              }}>
                              <option>{t('quote.selectOption')}</option>
                              {imoList.map((imoItem) => (
                                <option key={imoItem._id} value={imoItem.imo}>
                                  {imoItem.imo} - {imoItem.description}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>*{t('quote.un')}</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="19"
                              className={styles.input}
                              style={{ width: '80px' }}
                              onInput={(e) => {
                                e.currentTarget.value = e.currentTarget.value.slice(0, 9);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "." || e.key === '-' || e.key === 'e') {
                                    e.preventDefault();
                                }
                              }}
                              value={merchandiseForm?.classification.find(classification => classification.idClassificationMerchandise === 7)?.un || ''}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === '' || Number(value) > 0) {
                                const currentClassifications =  merchandiseForm?.classification ?? [];                                                                 
                                setMerchandiseForm({
                                  ...merchandiseForm,
                                  classification : currentClassifications.map(currentClas => currentClas.idClassificationMerchandise === 7 ? {
                                    ...currentClas,
                                    un:  e.target.value
                                  } : currentClas)                                  
                                })  
                              }                              
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {classificationMerchFlags.showRefrigeratedMerch && (
                        <div className={styles.formGroup}>
                          <label className={styles.label}>* {t('quote.temperature')}</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="80"
                              step="1"
                              className={styles.input}
                              style={{width: '100px' }}                                                                                     
                              value={merchandiseForm?.classification?.find(classification => classification.idClassificationMerchandise === 10)?.temperature || ''}
                              onChange={(e) => {
                                let value = e.target.value;
                                // eliminar todo lo que no sea número o "-"
                                value = value.replace(/[^0-9-]/g, "");

                                // permitir "-" solo al inicio
                                value = value.replace(/(?!^)-/g, "");

                                const currentClassifications =  merchandiseForm?.classification ?? [];     

                                setMerchandiseForm({
                                  ...merchandiseForm,
                                  classification : currentClassifications.map(currentClas => currentClas.idClassificationMerchandise === 10 ? {
                                    ...currentClas,
                                    temperature:  value
                                  } : currentClas)                                  
                                })                                
                               }}/>
                            <select
                              className={styles.select}
                              style={{ width: '80px' }}
                              value={merchandiseForm?.classification?.find(classification => classification.idClassificationMerchandise === 10)?.tempUnit || ''}
                              onChange={(e) => {
                                const currentClassifications =  merchandiseForm?.classification ?? [];                                                                 
                                setMerchandiseForm({
                                  ...merchandiseForm,
                                  classification : currentClassifications.map(currentClas => currentClas.idClassificationMerchandise === 10 ? {
                                    ...currentClas,
                                    tempUnit:  e.target.value
                                  } : currentClas)                                  
                                })  
                              }}>
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

              <div className={styles.modalRow} style={{ marginTop: '1.0rem' }}>        
                <div>                    
                  <input
                      type="checkbox"                  
                      checked={byUnitsMerch}                  
                      onChange={(e) => { 
                        setByUnitsMerch(!byUnitsMerch);
                        setCurrentPackages([]);
                        }}
                      className={styles.checkbox}
                      disabled={mode === 'view' || formData.idStatusRequest >= 2}/> 
                  <label className={styles.checkboxLabel}> Por unidades </label>                  
                </div>
                  <div className={styles.formGroup}>
                    <div className={styles.unitTypeToggle}>
                      <span className={!useMetricSystem ? styles.activeUnitLabel : styles.inactiveUnitLabel}>{t('quote.units.lbsInches')}</span>
                      <button                     
                        className={`${styles.toggleSwitch} ${useMetricSystem ? styles.active : ''}`}
                        onClick={() => setUseMetricSystem(!useMetricSystem)}
                        disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                        <div className={styles.toggleThumb}></div>
                      </button>
                      <span className={useMetricSystem ? styles.activeUnitLabel : styles.inactiveUnitLabel}>{t('quote.units.kgCm')}</span>
                    </div>
                  </div>
              </div>

              {!byUnitsMerch ? (
                <div className={styles.modalRow} style={{ marginTop: '1.0rem' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('quote.totalVolume')} ({useMetricSystem ? t('quote.cm') : t('quote.in')}) </label>
                    <input
                      type="number"   
                      min="1"                
                      step="any"
                      placeholder="0"
                      value={merchandiseForm.volumeTotal}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                        }
                        if (e.currentTarget.value.length >= 7 && e.key !== "Backspace" && e.key !== "Delete") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '' || Number(value) > 0) {
                          setMerchandiseForm({...merchandiseForm, volumeTotal: Number(e.target.value) })
                        }
                      }}
                      className={styles.input}
                      disabled={mode === 'view' || formData.idStatusRequest >= 2}/>
                  </div>                
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('quote.totalWeight')} ({useMetricSystem ? t('quote.kg') : t('quote.lbs')}) </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={merchandiseForm.weigthTotal}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                          }
                          if (e.currentTarget.value.length >= 7 && e.key !== "Backspace" && e.key !== "Delete") {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '' || Number(value) > 0) {
                            setMerchandiseForm({...merchandiseForm, weigthTotal: Number(e.target.value)})}    
                          }
                        }                                       
                        className={styles.input}
                        placeholder="0"
                        disabled={mode === 'view' || formData.idStatusRequest >= 2}/>
                  </div>                  
                </div>
                ) : (
                <div style={{ marginTop: '1.5rem' }}>
                  <button className={styles.addPackageButtonIcon} onClick={openPackagingModal} disabled={mode === 'view' || formData.idStatusRequest >= 2}>
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
                            <th>{t('quote.packagingTable.length')} ({useMetricSystem ? t('quote.cm') : t('quote.in')})</th>
                            <th>{t('quote.packagingTable.height')} ({useMetricSystem ? t('quote.cm') : t('quote.in')})</th>
                            <th>{t('quote.packagingTable.width')} ({useMetricSystem ? t('quote.cm') : t('quote.in')})</th>
                            <th>{t('quote.packagingTable.weight')} ({useMetricSystem ? t('quote.kg') : t('quote.lbs')})</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentPackages.map((pkg, index = 0) => (
                            <tr key={index + 1}>
                              <td>{pkg.unitCargo}</td>
                              <td>{pkg.quantity}</td>
                              <td>{pkg.length}</td>
                              <td>{pkg.height}</td>
                              <td>{pkg.width}</td>
                              <td>{pkg.weight}</td>
                              <td>
                                <button
                                  className={styles.removeRowButton}
                                  onClick={() => removePackage(pkg)}
                                  disabled={mode === 'view' || formData.idStatusRequest >= 2}>
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {currentPackages.length > 0 && (
                  <div className={styles.modalFooterInfo}>                    
                    <div className={styles.totalsDisplay}>
                      <div>
                        <div className={styles.totalLabel}>{t('quote.totalVolume')}</div>
                        <div className={styles.totalValue}>
                          {calculateTotals().totalVolume.toFixed(2)} {useMetricSystem ? 'cm³' : 'in³'}
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
                </div> )
              }            
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveModalButton} onClick={saveMerchandise} disabled={mode === 'view' || formData.idStatusRequest >= 2}>
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
            <form onSubmit={handleSavePackage}>
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
                    required>
                    <option value="">{t('quote.selectOption')}</option>
                    <option value={4}>{t('quote.box')}</option>                  
                    <option value={18}>{t('quote.pallet')}</option>
                    <option value={15}>{t('quote.sack')}</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>{t('quote.quantity')}
                  </label>
                  <input
                    type="number"  
                    min="1"
                    step="1"
                    onKeyDown={(e) => {
                        if (e.key === '-' ) {
                            e.preventDefault();
                        }
                      }}   
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.slice(0, 9);
                    }}                
                    className={styles.input}
                    placeholder="5"
                    id="package-quantity"
                    required/>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span className={styles.required}>*</span>{t('quote.length')} ({useMetricSystem ? t('quote.cm') : t('quote.in')})
                    </label>
                    <input
                      type="number"
                      min="1" 
                      step="any"
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                        }
                        if (e.currentTarget.value.length >= 6 && e.key !== "Backspace" && e.key !== "Delete") {
                          e.preventDefault();
                        }
                      }}   
                      
                      className={styles.input}
                      id="package-length"
                      required/>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span className={styles.required}>*</span>{t('quote.height')} ({useMetricSystem ? t('quote.cm') : t('quote.in')})
                    </label>
                    <input
                      type="number"
                      min="1" 
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                        }
                        if (e.currentTarget.value.length >= 6 && e.key !== "Backspace" && e.key !== "Delete") {
                          e.preventDefault();
                        }
                      }}   
                      step="any"                       
                      className={styles.input}
                      id="package-height"
                      required/>
                  </div>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span className={styles.required}>*</span>{t('quote.width')} ({useMetricSystem ? t('quote.cm') : t('quote.in')})
                    </label>
                    <input
                      type="number"
                      min="1" 
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                        }
                        if (e.currentTarget.value.length >= 6 && e.key !== "Backspace" && e.key !== "Delete") {
                          e.preventDefault();
                        }
                      }}   
                      step="any"                     
                      className={styles.input}
                      id="package-width"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span className={styles.required}>*</span>{t('quote.weight')} ({useMetricSystem ? t('quote.kg') : t('quote.lbs')})
                    </label>
                    <input
                      type="number"
                      min="1"                         
                      step="any"
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                         e.preventDefault();
                        }
                        if (e.currentTarget.value.length >= 6 && e.key !== "Backspace" && e.key !== "Delete") {
                          e.preventDefault();
                        }
                      }}                      
                      className={styles.input}
                      id="package-weight"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type='submit'
                  className={styles.saveModalButton}
                  onClick={() => {
                    
                  }}
                >
                  {t('quote.add')}
                </button>
              </div>
            </form>
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
