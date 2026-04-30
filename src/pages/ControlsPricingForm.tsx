import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, RefreshCw, Trash2, Plus, X, ChevronDown, ChevronUp,FileText  } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { pricingControlService } from '../services/pricingControlService';
import { PricingControlSupplier } from '../types/pricingControl';
import { PricingControlSupplierAPI } from '../types/pricingControl';
import styles from './ControlsPricingForm.module.css';
import QuotedRate from './QuotedRate';
import { useAuth } from '../contexts/AuthContext';
import { getSuppliers } from '../services/supplierService';
import { getCustomers} from '../services/customerService';
import { ContainerRequest} from '../types/requestQuotation';
import { catalogService } from '../services/catalogsService';
import { GetQuotedRateByQuotationRequestAndControlInfo } from "../services/quotedRateServices";

interface ControlsPricingFormProps {
  requestId: string | null;
  controlId?: string;
  onBack: () => void;
}

export function ControlsPricingForm({ requestId, controlId, onBack }: ControlsPricingFormProps) {
  const { t } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState<any>(null);
  const [controlData, setControlData] = useState<any>(null);
   const [countries, setCountries] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectsuppliers, setSelectsuppliers] = useState<any[]>([]);

  const [suppliers, setSuppliers] = useState<PricingControlSupplier[]>([
    
  ]);

   const [suppliersAPI, setSuppliersAPI] = useState<PricingControlSupplierAPI[]>([
    
  ]);

  const [suppliersCombo, setSuppliersCombo] = useState<PricingControlSupplierAPI>();

  const [CustomCombo, setCustomCombo] = useState({
    Id_customer_correspondent: '',
    Customer_correspondent: '',
  });
   const [CustomLeads, setCustomLeads] = useState({
    Id_customer_lead: '',
    Customer_lead: '',
  });

  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [expandedServices, setExpandedServices] = useState<Set<number>>(new Set());
  const { user } = useAuth();
  const [statusControl, setStatusControl] = useState({
    id_status_control: 3,
    status_control_name: 'Asignada'
  });

  const [generalData, setGeneralData] = useState({
    network: '',
    complexity: 'Media',
    currency: 'USD',
    unit_profit: '0',
    volume: '0',
    general_profit: '',
    key_td: '',
    comments_general: '',
    id_executive_pricing: user._id || '',
    complete_name_pricing: user?.name || '',  
    Affair:  '',
    Ref_atv:  '',

  });

  const [priority, setPriority] = useState(false);
  const [bidding, setBidding] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const [reasoncancellation, setreasoncancellation] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [containers, setContainers] = useState<ContainerRequest[]>([]);
  const [loadingContainers, setLoadingContainers] = useState(false);
  const [showContainersModal, setShowContainersModal] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState<number | null>(null);
  const [availableContainers , setAvailableContainers] = useState<Container[]>([]);
  const [ControlServices, setControlServices] = useState<any[]>([]);  
  const [Disabled, setDisabled] = useState(false);
  const [pricingToQuote, setPricingToQuote] = useState<any>(null);
  const [pricingQuotationRequest, setpricingQuotationRequest] = useState<any>(null);
  const [quotedratedata, setquotedratedata] = useState<any>(null);


  useEffect(() => {
    loadData();
    loadCountries(); 
    loadSuppliers();
    loadCustomers();
  }, [requestId, controlId]);

  useEffect(() => {
    if (requestData?.referenceRequest && controlData?.control) {
      loadQuotedRateData();
    }
  }, [requestData, controlData]);

  if (showForm) {
    return <QuotedRate onClose={() => setShowForm(false)}
    pricingData={pricingToQuote}
    quotationRequestData = {pricingQuotationRequest}
    />;
  }
    const loadCustomers = async () => {
    try {     

      const customersData = await getCustomers(true);
      setCustomers(customersData.filter((c: any) => c.status === 1 || c.dataState === 1));
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };
  
  const loadCountries = async () => {
    try {     

      const countriesData = await catalogService.getCountries();
      setCountries(countriesData.data.filter((c: any) => c.status === 1));
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

   async function loadSuppliers() {
    try {
      //setLoading(true);
      const data = await getSuppliers();
      setSelectsuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      //setLoading(false);
    }
  }

  const loadData = async () => {
    if (!requestId) return;

    try {
      setLoading(true);

      if (controlId) {
        const control = await pricingControlService.getById(controlId);
        setControlData(control);
        setSuppliers(control.suppliers || []);
        setSuppliersAPI(control.suppliers || []);
        setSelectedServices(control.services || []);        
        setStatusControl(control.status_control);       
        setGeneralData({
          network: control.network || '',
          complexity: control.complexity || 'Media',
          currency: control.currency || 'USD',
          unit_profit: control.unit_profit || '0',
          volume: control.volume || '0',
          general_profit: control.general_profit || '',
          key_td: control.key_td || '',
          comments_general: control.comments_general || '',
          id_executive_pricing: control._id_executive_pricing || '',
          complete_name_pricing: control.complete_name_pricing || '',          
          Affair:  control.affair || '',
          Ref_atv:  control.ref_atv || '',
        });
        setCustomCombo({
          Id_customer_correspondent: control.id_customer_correspondent || '',
          Customer_correspondent: control.customer_correspondent || '',
        });
        setCustomLeads({
          Id_customer_lead: control.id_customer_lead || '',
          Customer_correspondent: control.customer_correspondent || '',
        });

        const request = await pricingControlService.getResquetById(control.idrequest);
        setRequestData(request);
        setControlServices(request.services || []);
        setPriority(request.priority === 1);
        setBidding(request.licitation === 1);

        const expandedIds = new Set(request.services?.map((s: any) => s.idServiceItem) || []);
        setExpandedServices(expandedIds);

        if(control.status_control?.id_status_control === 5 ||control.status_control?.id_status_control === 6 || request.idStatusRequest === 10)
          {
            setDisabled(true);
          }
          else
          {
            setDisabled(false);
          }

      } else {
        const request = await pricingControlService.getResquetById(requestId);
        setRequestData(request);
        setControlServices(request.services || []);
        setPriority(request.priority === 1);
        setBidding(request.licitation === 1);

        setSelectedServices([]);

        const allServiceIds = new Set(request.services?.map((s: any) => s.idServiceItem || s._id) || []);
        setExpandedServices(allServiceIds);
      }       
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadQuotedRateData = async () => {
  try {
    const response = await GetQuotedRateByQuotationRequestAndControlInfo(
      requestData.referenceRequest,
      controlData.control
    );

    console.log("QUOTED RATE RESPONSE:", response);

    setquotedratedata(response?.data?.[0] || null);

  } catch (error) {
    console.error('Error loading quoted rate:', error);
    setquotedratedata(null);
  }
};

  const addSupplier = () => {  
    
    if (suppliersCombo?.idsuplier ==='' || 
    suppliersCombo?.idsuplier === undefined || 
    suppliersCombo?.supplier_associated_name === '0') {
      showError(t('ctrlpricing.selectprov'));
      return;
    }
    
    if (suppliers?.some(s => s.idsuplier === suppliersCombo?.idsuplier)) {
      showError(t('ctrlpricing.provalreadyadded'));    
      return;
    }   
    
    setSuppliers([...suppliers, {
      idsuplier: suppliersCombo?.idsuplier,
      supplier_associated_name: suppliersCombo?.supplier_associated_name
    }]);
    setSuppliersAPI([...suppliersAPI, {
      Idsuplier: suppliersCombo?.idsuplier,
      Supplier_associated_name: suppliersCombo?.supplier_associated_name
    }]);
    
  };

  const removeSupplier = (id: number) => {
    setSuppliers(suppliers.filter(s => s.idsuplier !== id));
    setSuppliersAPI(suppliersAPI.filter(s => s.idsuplier !== id));
  };

  const toggleService = (serviceId: number) => {
    const service = ControlServices.find((s: any) =>
      (s.idServiceItem || s._id) === serviceId
    );
    if (!service) return;

    const isSelected = selectedServices.some(s => s.idServiceItem === serviceId);

    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.idServiceItem !== serviceId));
    } else {
      setSelectedServices([...selectedServices, { ...service, idServiceItem: serviceId }]);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId) return;

    if (selectedServices.length === 0) {
      showError('Debe seleccionar al menos un servicio');
      return;
    }
    
    if (generalData.network === '' && requestData.typeRequest==="Corresponsales") {
      showError(t('ctrlpricing.selectnetwork'));
      return;
    } 
    
    if (generalData.unit_profit > '0' && generalData.volume==="0") {
      showError(t('ctrlpricing. capturevolume'));
      return;
    } 

    try {
      setLoading(true);

      const servicesData = selectedServices.map(s => {
        const serviceCopy = { ...s };
        if (serviceCopy.merchandise) {
          delete serviceCopy.merchandise;
        }
        if (!serviceCopy.idServiceItem) {
          serviceCopy.idServiceItem = serviceCopy._id;
        }
        return serviceCopy;
      });

      /*console.log('Saving control with data:', {
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
      });*/

      const dataToSave = {
        Id:controlId,
        Idcontrol: 0,
        Control: undefined,
        Idrequest: requestId,
        Id_executive: requestData.createdBy?.idUser || '',
        Complete_name: requestData.createdBy?.fullName || '',
        Creation_date: new Date().toISOString(),
        Updated_date: new Date().toISOString(),
        _id_request_type: requestData.idRequestType,
        request_type_name: requestData.typeRequest,
        Id_customer: requestData.customer?.idCustomer || '',
        Customer_business_name: requestData.customer?.customerName || requestData.customer?.prospectName || '',
        Status_control: {Id_status_control: statusControl.id_status_control, Status_control_name: statusControl.status_control_name},
        Suppliers: suppliersAPI,       
        Services: servicesData,       
        network: generalData.network,
        complexity: generalData.complexity,
        currency: generalData.currency,
        unit_profit: generalData.unit_profit,
        volume: generalData.volume,
        general_profit: generalData.general_profit,
        key_td: generalData.key_td,
        comments_general: generalData.comments_general,
        Id_executive_pricing: generalData.id_executive_pricing,
        Complete_name_pricing: generalData.complete_name_pricing,
        id_correspondent_country: '',
        correspondent_country: '',
        Id_customer_correspondent: CustomCombo.Id_customer_correspondent? CustomCombo.Id_customer_correspondent : '',
        Customer_correspondent: CustomCombo.Customer_correspondent? CustomCombo.Customer_correspondent : '',
        Id_customer_lead:  CustomLeads.Id_customer_lead? CustomLeads.Id_customer_lead : '',
        Customer_lead:  CustomLeads.Customer_lead? CustomLeads.Customer_lead : '',
        Affair:  generalData.Affair || '',
        Ref_atv:  generalData.Ref_atv || ''
      };

      if (controlId) {
        await pricingControlService.updatenew({         
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
    if (suppliers.length ===0) {
      showError(t('ctrlpricing.selectprov'));
      return;
    }  
    try {
      setLoading(true);
      await pricingControlService.QuoteControl({
          idcontrol_: controlId,
          idresqued_: requestData.id,
          Suppliers: suppliersAPI
        });
      setStatusControl({
        id_status_control: 5,
        status_control_name: 'Cotizada'
      });
      showSuccess('Control marcado como cotizado');
      loadData();
    } catch (error) {
      console.error('Error marking as quoted:', error);
      showError('Error al marcar como cotizado');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDecline = async (e: React.FormEvent) => {  
     e.preventDefault();  
    if (!controlId) return;     
    try {
      setLoading(true);
      await pricingControlService.DeclineControl({
          idcontrol_: controlId,
          idresqued_: requestData.id,
          reason_for_cancellation:reasoncancellation
        });
      setStatusControl({
        id_status_control: 6,
        status_control_name: 'Declinada'
      });
      showSuccess('Control marcado como declinado');
      loadData();
    } catch (error) {
      console.error('Error marking as decline:', error);
      showError('Error al marcar como declinado');
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

  const updateContainersShipment = (idServiceItem: number, idShipment: number,  containerUpdate : ContainerRequest) => {    
    setSelectedServices(selectedServices.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => {
       if(shipment.idShipment !== idShipment) return shipment;

       const currentContainers = shipment.containers ?? [];
       const exists =  currentContainers.some(currCont => currCont.idContainer === containerUpdate.idContainer);

      return {
        ...shipment,
        containers : exists ? currentContainers.filter(cont => 
          cont.idContainer !== containerUpdate.idContainer) 
        : [ ...currentContainers, containerUpdate]        
      }; 
    })
    }: service));
     setControlServices(ControlServices.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => {
       if(shipment.idShipment !== idShipment) return shipment;

       const currentContainers = shipment.containers ?? [];
       const exists =  currentContainers.some(currCont => currCont.idContainer === containerUpdate.idContainer);

      return {
        ...shipment,
        containers : exists ? currentContainers.filter(cont => 
          cont.idContainer !== containerUpdate.idContainer) 
        : [ ...currentContainers, containerUpdate]        
      }; 
    })
    }: service));

    setShowContainersModal(false);
  }

  const updateContainersQuantityShipment = (idServiceItem: number, idShipment: number,  idContainer : number, changes: Record<any,any>) => {
    setSelectedServices(selectedServices.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => {
      if(shipment.idShipment !== idShipment) return shipment;
       const currentContainers = shipment.containers ?? [];
       const exists =  currentContainers.some(currCont => currCont.idContainer === idContainer);
      return {
        ...shipment,
        containers : currentContainers.map(contain => contain.idContainer === idContainer ? {
          ...contain,
          ...changes,
        } : contain )     
      }; 
    })
    }: service));

     setControlServices(ControlServices.map(service => service.idServiceItem=== idServiceItem ? {
      ...service,
      shipments: service.shipments.map(shipment => {
       if(shipment.idShipment !== idShipment) return shipment;
       const currentContainers = shipment.containers ?? [];
       const exists =  currentContainers.some(currCont => currCont.idContainer === idContainer);
      return {
        ...shipment,
        containers : currentContainers.map(contain => contain.idContainer === idContainer ? {
          ...contain,
          ...changes,
        } : contain )     
      }; 
    })
    }: service));
  }

   const openContainerModal = async (idServiceItem: number, containersInShipment : ContainerRequest []) => {
      setLoadingContainers(true);
      setShowContainersModal(true)
      setCurrentServiceId(idServiceItem); 
      setContainers(containersInShipment);      
      try {
        if(availableContainers.length === 0) {
          const resultContainers = await catalogService.getContainers();
          setAvailableContainers([...resultContainers.data]);   
        }          
      }catch(error){
        showError(t('quote.errors.loadCatalogs'));
      }finally{
        setLoadingContainers(false);
      }
    } 

    const renderCityOrigin =  (service : any) => {
      const isPort = service.idService === 1 || service.idService === 2 ? true : false;    
      switch(true){
        case [3, 4, 10, 11].includes(service.idService) || service.shipments[0].idTypeShipment === 1 : return (          
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                  {t('ctrlpricing.cityo')}
              </label>
              <input
                type="text"
                value={service.shipments[0].origin.city}                
                className={styles.input}
                disabled/>                          
            </div>    
          );
        case service.shipments[0].idTypeShipment === 2: return (          
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {isPort ? t('ctrlpricing.portO') : t('ctrlpricing.airportO')}
              </label>
              <input
                className={`${styles.input} ${styles.inputUppercase}`}
                type="text"
                placeholder={isPort ? 'MXVER' : 'MXMEX'}
                value={isPort ? service.shipments[0].origin.portCode : service.shipments[0].origin.airportCode }                
                disabled/>
            </div>           
        )
        case service.shipments[0].idTypeShipment === 3 : return (          
            <div className={styles.formGroup}>             
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                  {t('ctrlpricing.cityo')}
              </label>
              <input
                type="text"
                value={service.shipments[0].origin.city}                
                className={styles.input}
                disabled/>                
            </div>
            );      
        case service.shipments[0].idTypeShipment === 4: return(             
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {isPort ? t('ctrlpricing.portO') : t('ctrlpricing.airportO')}
              </label>
              <input
                type="text"
                placeholder={isPort ? 'MXVER' : 'MXMEX'}
                value={isPort ? service.shipments[0].origin.portCode : service.shipments[0].origin.airportCode }                
                className={styles.input}
                disabled/>
            </div>         
        )
        default: return null;
      }
    }

    const renderCityDestination =  (service : any) => {
      const isPort = service.idService === 1 || service.idService === 2 ? true : false;    
      switch(true){
        case [3, 4, 10, 11].includes(service.idService) || service.shipments[0].idTypeShipment === 1 : return (           
            <div className={styles.formGroup}>
               <label className={styles.label}>
                <span className={styles.required}>*</span>
                  {t('ctrlpricing.cityd')}
              </label>
              <input
                type="text"
                value={service.shipments[0].destination.city}                
                className={styles.input}
                disabled/>              
            </div>);
        case service.shipments[0].idTypeShipment === 2: return (          
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {isPort ? t('ctrlpricing.portD') : t('ctrlpricing.airportD')}
              </label>
              <input
                type="text"
                placeholder={isPort ? 'MXVER' : 'MXMEX'}
                value={isPort ? service.shipments[0].destination.portCode : service.shipments[0].destination.airportCode }                
                className={styles.input}
                disabled/>
            </div>          
        )
        case service.shipments[0].idTypeShipment === 3 : return (          
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {isPort ? t('ctrlpricing.portD') : t('ctrlpricing.airportD')}
              </label>
              <input
                type="text"
                placeholder={isPort ? 'MXVER' : 'MXMEX'}
                value={isPort ? service.shipments[0].destination.portCode : service.shipments[0].destination.airportCode }                
                className={styles.input}
                disabled/>
            </div>);      
        case service.shipments[0].idTypeShipment === 4: return(                       
            <div className={styles.formGroup}>
               <label className={styles.label}>
                <span className={styles.required}>*</span>
                  {t('ctrlpricing.cityd')}
              </label>
              <input
                type="text"
                value={service.shipments[0].destination.city}                
                className={styles.input}
                disabled/>             
            </div>          
        )
        default: return null;
      }
    }

    const renderZipCodesOrigin =  (service : any) => {
      const isPort = service.idService === 1 || service.idService === 2 ? true : false;    
      switch(true){
        case [3, 4, 10, 11].includes(service.idService) || service.shipments[0].idTypeShipment === 1 : return (          
            <div className={styles.formGroup}>              
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                  {t('ctrlpricing.cpo')}
                </label>
              <input
                type="number"
                value={service.shipments[0].origin.zipCode}                
                className={styles.input}
                disabled/>              
            </div>    
          );        
        case service.shipments[0].idTypeShipment === 3 : return (          
            <div className={styles.formGroup}>                           
                 <label className={styles.label}>
                <span className={styles.required}>*</span>
                {t('ctrlpricing.cpo')}
              </label>
              <input
                type="number"
                value={service.shipments[0].origin.zipCode}                
                className={styles.input}
                disabled/>
            </div>
            );       
        default: return null;
      }
    }

    const renderZipCodesDestination =  (service : any) => {
      const isPort = service.idService === 1 || service.idService === 2 ? true : false;    
      switch(true){
        case [3, 4, 10, 11].includes(service.idService) || service.shipments[0].idTypeShipment === 1 : return (           
            <div className={styles.formGroup}>              
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {t('ctrlpricing.cpd')}
              </label>
              <input
                type="number"
                value={service.shipments[0].destination.zipCode}                
                className={styles.input}
                disabled/>
            </div>);             
        case service.shipments[0].idTypeShipment === 4: return(                       
            <div className={styles.formGroup}>            
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {t('ctrlpricing.cpd')}
              </label>
              <input
                type="number"
                value={service.shipments[0].destination.zipCode}                
                className={styles.input}
                disabled/>
            </div>          
        )
        default: return null;
      }
    }

  const openModal = () => {      
      setShowModal(true);
    };
  
    const closeModal = () => {
      setShowModal(false);      
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

  const medalSrc = getCategoryMedal(requestData.customer?.customerCategory);

  return (
    <>
    <form onSubmit={handleSave}> 
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.formHeaderLeft}>
            <button type="button" onClick={onBack} className={styles.backButton} disabled={loading}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={styles.title}>{t('ctrlpricing.title')}</h1>
              <p className={styles.formSubtitle}>
                {controlId ? t('ctrlpricing.editcontrolnumber') : t('ctrlpricing.newcontrolnumber')}
              </p>
            </div>
          </div>
          <div className={styles.formHeaderRight}>
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.headerButton} disabled={loading || Disabled}>
                <Save size={18} />
                {t('ctrlpricing.save')}
              </button>
              <button type="button" className={styles.headerButtonRefresh} onClick={loadData} disabled={loading ||Disabled}>
                <RefreshCw size={18} />
              </button>
              {/*<button
                className={styles.buttonGroupItem}
                onClick={handleDelete}
                disabled={loading || !controlId}
              >
                <Trash2 size={18} />
              </button>*/}
              <div className={styles.actionsMenuContainer} ref={actionsMenuRef}>
                <button type="button"
                  className={styles.headerButtonAction}
                  hidden
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  disabled={loading ||Disabled}
                >
                  {t('ctrlpricing.actions')}
                  <ChevronDown size={16} />
                </button>
                {showActionsMenu && (
                  <div className={styles.actionsDropdown}>
                    <button className={styles.dropdownItem}>{t('ctrlpricing.export')}</button>
                    <button className={styles.dropdownItem}>{t('ctrlpricing.duplicate')}</button>
                    <button className={styles.dropdownItem}>{t('ctrlpricing.historical')}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>      
        {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
            </div>
            ) :
        <div className={styles.container}>
          <div className={styles.topCardsContainer}>
            <div className={styles.clientSection}>
              <div className={styles.clientHeader}>
                <div className={styles.clientInfo}>
                  {medalSrc && (
                    <img src={medalSrc} alt="Medal" className={styles.clientMedal} />
                  )}
                  <div>
                    <h2 className={styles.clientName}>
                      {requestData.customer?.customerName || requestData.customer?.prospectName || ''}
                      {priority && (
                        <img src="/prioridad.png" alt="Prioridad" className={styles.priorityIcon} style={{width: '20px', height: '20px', marginLeft: '8px'}} />
                      )}
                    </h2>
                    <div className={styles.clientDetails}>
                      <span className={styles.clientId}>
                        Ref: {requestData.referenceRequest}
                      </span>
                      <span className={styles.clientExecutive}>
                        {requestData.createdBy?.fullName}
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
                        <span className={styles.switchLabel}>{t('ctrlpricing.priority')}</span>
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
                        <span className={styles.switchLabel}>{t('ctrlpricing.bidding')}</span>
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
                  <div className={styles.clientType}>{requestData.requestType}</div>
                </div>
              </div>
              <div className={styles.clientActions}>
                <button type="button"
                className={styles.btnDecline} 
                disabled={loading ||Disabled}
                onClick={openModal}
                hidden={controlId ? false : true}
                >
                  {t('ctrlpricing.decline')}
                  
                </button>
                <button type="button"
                  className={styles.btnQuote}
                  onClick={handleMarkAsQuoted}
                  disabled={loading ||Disabled}
                  hidden={controlId ? false : true}
                >
                  {t('ctrlpricing.quoted')}
                </button>
                <button
                  type="button"
                  className={styles.btnGenerateSale}
                  disabled={loading}
                  hidden={!controlId}
                  onClick={() => {
                    if (!controlData) {
                      showError("Aún no se carga el control");
                      return;
                    }

                    if (!requestData) {
                      showError("Aún no se carga el request");
                      return;
                    }

                    setPricingToQuote(controlData);
                    setpricingQuotationRequest(requestData);  
                    setShowForm(true);
                  }}
                >
                  <FileText size={16} />
                  {quotedratedata?.quote_number
                  ? `Ver ${quotedratedata.quote_number}`
                  : t('ctrlpricing.generateSaleRate')}
                </button>     
              </div>
            </div>

            <div className={styles.suppliersSection}>
              <h3 className={styles.sectionTitle}> {t('ctrlpricing.supplierassignment')}</h3>
              <span className={styles.supplierLabel}>{t('ctrlpricing.supplier')}</span>
                    <select                                       
                      className={styles.selectInput}
                      onChange={(e) => 
                        setSuppliersCombo({ 
                          ...suppliersCombo, 
                          idsuplier: e.target.value,
                          supplier_associated_name: e.target.options[e.target.selectedIndex].text
                        })
                      }                    
                    >
                      <option value="">{t('ctrlpricing.select')}</option>
                      {selectsuppliers.map((suppliers) => (
                        <option key={suppliers._id} value={suppliers._id}>
                          {suppliers.fiscal_data?.business_name}
                        </option>
                      ))
                      }
                    </select>         
              <button type="button"
                className={styles.btnAddSupplier}
                onClick={addSupplier}
                disabled={loading ||Disabled}
              >
                <Plus size={16} />
                {t('ctrlpricing.addsupplier')}
              </button>
              <div className={styles.suppliersList}>
                {suppliers.map((supplier) => (
                  <div key={supplier.idsuplier} className={styles.supplierItem}>
                    <span className={styles.supplierLabel}>{t('ctrlpricing.supplier')}</span>                 
                    <input
                      type="text"
                      value={supplier.supplier_associated_name}                    
                      className={styles.supplierInput}
                      placeholder={t('ctrlpricing.suppliername')}
                      disabled
                    />
                    <button type="button"
                      className={styles.btnRemoveSupplier}
                      onClick={() => removeSupplier(supplier.idsuplier)}
                      disabled={loading ||Disabled}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.generalSection}>
            <h3 className={styles.sectionTitle}>General</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}><span className={styles.required}>*</span> {t('ctrlpricing.status')}</label>
                <select required
                  value={statusControl.status_control_name}
                  onChange={(e) => {
                    const statusMap: any = {
                      'Asignada': { id_status_control: 3, status_control_name: 'Asignada' },                    
                      'Cotizada': { id_status_control: 5, status_control_name: 'Cotizada' },
                      'Declinada': { id_status_control: 6, status_control_name: 'Declinada' },
                      'Aceptada': { id_status_control: 6, status_control_name: 'Aceptada' }
                    };
                    setStatusControl(statusMap[e.target.value] || statusControl);
                  }}
                  className={styles.formSelect}
                  disabled
                >                
                  <option>Asignada</option>
                  <option>Cotizada</option>
                  <option>Declinada</option>
                  <option>Aceptada</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}><span className={styles.required}>*</span> {t('ctrlpricing.network')}</label>
                <select
                  value={generalData.network}
                  onChange={(e) => setGeneralData({...generalData, network: e.target.value})}
                  className={styles.formSelect}
                  disabled={loading ||Disabled}
                >                  
                  <option value="">{t('ctrlpricing.select')}</option>
                  <option value="WCA">WCA</option>
                  <option value="JC TRANS">JC TRANS</option>
                  <option value="GLA FAMILY">GLA FAMILY</option>
                  <option value="N/A">N/A</option>
                  <option value="WTC ALLIANCE">WTC ALLIANCE</option>
                  <option value="LOGNET">LOGNET</option>
                  <option value="DF ALLIANCE">DF ALLIANCE</option>
                  <option value="TFC">TFC</option>
                  <option value="MAGENTA">MAGENTA</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}><span className={styles.required}>*</span> {t('ctrlpricing.complexity')}</label>
                <select required
                  value={generalData.complexity}
                  onChange={(e) => setGeneralData({...generalData, complexity: e.target.value})}
                  className={styles.formSelect}
                  disabled={loading ||Disabled}
                >
                  <option>Baja</option>
                  <option>Media</option>
                  <option>Alta</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}><span className={styles.required}>*</span> {t('ctrlpricing.currency')}</label>
                <select required
                  value={generalData.currency}
                  onChange={(e) => setGeneralData({...generalData, currency: e.target.value})}
                  className={styles.formSelect}
                  disabled={loading ||Disabled}
                >
                  <option>USD</option>
                  <option>MXN</option>
                  <option>EUR</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}><span className={styles.required}>*</span> {t('ctrlpricing.unitprofit')}</label>
                <input                    
                    type="number"
                    min="0"
                    value={generalData.unit_profit}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e') {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || Number(value) > 0) {
                        setGeneralData({
                          ...generalData,
                          unit_profit: value
                        });
                      }
                    }}
                    className={styles.formInput}
                    disabled={
                      loading ||
                      Disabled
                    }
                  />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}><span className={styles.required}>*</span> {t('ctrlpricing.volume')}</label>
                <input
                  type="number"
                  min="0"
                  value={generalData.volume}
                  onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e') {
                        e.preventDefault();
                      }
                    }}                  
                  onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || Number(value) > 0) {
                        setGeneralData({
                          ...generalData,
                          volume: value
                        });
                      }
                    }}
                  className={styles.formInput}                
                  disabled={loading ||Disabled}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}><span className={styles.required}>*</span> {t('ctrlpricing.generalprofit')}</label>
                <input
                  type="number"
                  value={calculateProfit_general()}
                  onChange={(e) => setGeneralData({...generalData, general_profit: e.target.value})}
                  className={styles.formInput}
                  disabled={true}
                />
              </div>
                <div className={styles.formGroup}>
                <label className={styles.label}><span className={styles.required}>*</span> Key TD</label>
                <select
                  value={generalData.key_td}
                  onChange={(e) => setGeneralData({...generalData, key_td: e.target.value})}
                  className={styles.formSelect}
                  disabled={loading ||Disabled}
                >
                  <option value="" >{t('ctrlpricing.select')}</option>
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
                  <option value="TRF" >TRF Tarifario</option>
                </select>
              </div>
               <div className={styles.formGroup}> 
                <label className={styles.label}>{t('ctrlpricing.customercorrespondent')}</label>
                <select 
                      disabled={loading ||Disabled || requestData.typeRequest !== "Corresponsales"}                                      
                      className={styles.formSelect}
                      value={CustomCombo.Id_customer_correspondent}
                      onChange={(e) => 
                        setCustomCombo({ 
                          ...CustomCombo, 
                          Id_customer_correspondent: e.target.value,
                          Customer_correspondent: e.target.options[e.target.selectedIndex].text
                        })
                      }                    
                    >
                      <option value="">{t('ctrlpricing.select')}</option>
                     {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.branchName ? `${customer.branchName}, ${customer.fiscalData?.businessName}` : customer.fiscalData?.businessName}
                      </option>
                      ))}                      
                    </select> 
            </div>
            <div className={styles.formGroup}> 
              <label className={styles.label}>{t('ctrlpricing.customerlead')}</label>
                <select
                      disabled={loading ||Disabled}
                      className={styles.formSelect}
                      value={CustomLeads.Id_customer_lead}
                      onChange={(e) => 
                        setCustomLeads({ 
                          ...CustomLeads, 
                          Id_customer_lead: e.target.value,
                          Customer_lead: e.target.options[e.target.selectedIndex].text
                        })
                      }                    
                    >
                      <option value="">{t('ctrlpricing.select')}</option>
                     {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.branchName ? `${customer.branchName}, ${customer.fiscalData?.businessName}` : customer.fiscalData?.businessName}
                      </option>
                      ))}                      
                    </select>              
            </div>
             <div className={styles.formGroup}>
                <label className={styles.label}> Ref-ATV</label>
                <input
                  type="text"
                  value={generalData.Ref_atv}
                  onChange={(e) => setGeneralData({...generalData, Ref_atv: e.target.value})}
                  className={styles.formInput}
                  disabled={loading ||Disabled}
                />
              </div>
            </div>
             <div className={styles.formGroup}>
              <label className={styles.label}>{t('ctrlpricing.affair')}</label>
              <input
               type="text"
                value={generalData.Affair}
                onChange={(e) => setGeneralData({...generalData, Affair: e.target.value})} 
                className={styles.formInput}               
                disabled={loading ||Disabled}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('ctrlpricing.comments')}</label>
              <textarea
                value={generalData.comments_general}
                onChange={(e) => setGeneralData({...generalData, comments_general: e.target.value})}
                className={styles.formTextarea}
                rows={3}
                disabled={loading ||Disabled}
              />
            </div>
          </div>

          <div className={styles.servicesSection}>
            <h3 className={styles.sectionTitle}>{t('ctrlpricing.services')}</h3>
            {ControlServices && ControlServices.length > 0 ? (
              ControlServices.map((service: any, index: number) => {
                const serviceId = service.idServiceItem || service._id;
                const isSelected = selectedServices.some(s => s.idServiceItem === serviceId);
                const isUsed = (service.used && controlId === null) || (service.used && (Disabled)) ;
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
                            {isSelected ? t('ctrlpricing.serviceincluded') : isUsed ? t('ctrlpricing.alreadyused') : t('ctrlpricing.includeservice')}
                          </span>
                        </div>
                      </div>
                      <button type="button"
                        className={styles.btnServiceAction}
                        onClick={() => toggleServiceExpanded(serviceId)}
                        disabled={loading ||Disabled}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button type="button"
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
                            <label className={styles.label}><span className={styles.required}>*</span> {t('ctrlpricing.service')}</label>
                            <input
                              type="text"
                              value={service.nameService || ''}
                              className={styles.formInput}
                              disabled
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}><span className={styles.required}>*</span> {t('ctrlpricing.operation')}</label>
                            <input
                              type="text"
                              value={shipment.typeOperation || ''}
                              className={styles.formInput}
                              disabled
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}><span className={styles.required}>*</span> Incoterms</label>
                            <input
                              type="text"
                              value={shipment.incoterm_name || shipment.incoterm || ''}
                              className={styles.formInput}
                              disabled
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>{t('ctrlpricing.expecteddeparture')}</label>
                            <input
                              type="date"
                              value={shipment.departureDateAproximate ? new Date(shipment.departureDateAproximate.$date || shipment.departureDateAproximate).toISOString().split('T')[0] : ''}
                              className={styles.formInput}
                              disabled
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}><span className={styles.required}>*</span> {t('ctrlpricing.shippingtype')}</label>
                            <input
                              type="text"
                              value={shipment.typeShipment || ''}
                              className={styles.formInput}
                              disabled
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}><span className={styles.required}>*</span> {t('ctrlpricing.origin')}</label>
                            <input
                              type="text"
                              value={(() => {
                                const countryCode = shipment.origin_country_name || shipment.origin?.countryCode || shipment.origin?.zipCode || '';
                                const country = countries.find(c => c.country_code === countryCode);
                                return country ? `(${country.country_code}) ${country.name_country}` : countryCode;
                              })()}
                              className={styles.formInput}
                              disabled
                            />
                          </div>                         
                          <div className={styles.formGroup}>
                            <label className={styles.label}><span className={styles.required}>*</span> {t('ctrlpricing.destination')}</label>
                            <input
                              type="text"
                              value={(() => {
                                const countryCode = shipment.destination_country_name || shipment.destination?.countryCode || shipment.destination?.zipCode || '';
                                const country = countries.find(c => c.country_code === countryCode);
                                return country ? `(${country.country_code}) ${country.name_country}` : countryCode;
                              })()}
                              className={styles.formInput}
                              disabled
                            />
                          </div>
                          <div>
                            {renderCityOrigin(service)}
                          </div> 
                          <div>
                            {renderZipCodesOrigin(service)}
                          </div>  
                           <div>
                            {renderCityDestination(service)}
                          </div>   
                          <div>
                            {renderZipCodesDestination(service)}
                          </div>                                                                     
                        </div>
                         {[2, 3, 10].includes(service.idService) && (
                          <div style={{ marginTop: '1.25rem' }} >
                            <label className={styles.label}>
                              <span className={styles.required}>*</span>
                              {t('quote.containers')}
                            </label>
                            <div className={styles.containerCard}>
                              <div className={styles.containerList}>
                                {service.shipments[0].containers?.map((container) => (
                                  <div key={container.idContainer} className={styles.itemSimpleList}>
                                    <div className={styles.formGroupElementsInline}>                       
                                      <div className={styles.formGroup}>
                                        <span className={styles.containerLabel}>{t('quote.container')}</span>
                                        <span className={styles.containerNameSimple}>{container.nameTypeContainer}</span>
                                      </div>                         
                                      <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('quote.quantity')}</label>
                                        <input
                                          type="number"
                                          min="1"
                                          step="1"
                                          className={styles.input}
                                          style={{ width: '80px' }}
                                          onInput={(e) => {e.currentTarget.value = e.currentTarget.value.slice(0, 9);}}
                                          onKeyDown={(e) => { if (e.key === "." || e.key === '-' || e.key === 'e') { e.preventDefault();}}}
                                          value={container.quantity}
                                          onChange={(e) => 
                                            updateContainersQuantityShipment(service.idServiceItem, 1, container.idContainer || 1,
                                            {quantity:  parseInt(e.target.value)})}/>
                                      </div>                                                                     
                                      <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('quote.totalVolume')}</label>
                                        <input
                                          type="number"
                                          className={styles.input}                                          
                                          onKeyDown={(e) => {
                                            if (e.key === '-' || e.key === 'e') {e.preventDefault();}     
                                            if (e.currentTarget.value.length >= 7 && e.key !== "Backspace" && e.key !== "Delete") {
                                              e.preventDefault();
                                            }                           
                                          }}
                                          value={container.volumeTotal}
                                          onChange={(e) => {
                                            if (e.target.value === '' || Number(e.target.value) > 0) {
                                              updateContainersQuantityShipment(
                                                service.idServiceItem, 1, 
                                                container.idContainer || 1,
                                                {volumeTotal:  Number(e.target.value)})
                                            }}
                                          }/> 
                                      </div>                                                                                                                      
                                      <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('quote.unitVolume')}</label>
                                        <select
                                          value={container.idUnitVolume}
                                            onChange={(e) => {
                                              updateContainersQuantityShipment( service.idServiceItem, 1, container.idContainer || 1,
                                                {                              
                                                  idUnitVolume: parseInt(e.target.value),
                                                  unitVolume: e.target.options[e.target.selectedIndex].text
                                                });
                                            }}
                                            className={styles.select}
                                            disabled={loading ||Disabled} >
                                            <option value="">{t('quote.selectOption')}</option>
                                            <option value={1}>CBM</option>                  
                                            <option value={2}>CFT</option>                        
                                        </select> 
                                      </div>                                                         
                                      <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('quote.totalWeight')}</label>
                                        <input
                                          type="number"
                                          className={styles.input}
                                          onKeyDown={(e) => {
                                            if (e.key === '-' || e.key === 'e') {e.preventDefault(); }
                                            if (e.currentTarget.value.length >= 7 && e.key !== "Backspace" && e.key !== "Delete") {
                                              e.preventDefault();
                                            }  
                                          }}
                                          value={container.weigthTotal}
                                          onChange={(e) => {
                                            if (e.target.value === '' || Number(e.target.value) > 0) {
                                              updateContainersQuantityShipment(
                                                service.idServiceItem, 1, 
                                                container.idContainer || 1,
                                                {weigthTotal:  Number(e.target.value)})
                                            }}
                                          }/>                           
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label className={styles.label}>{t('quote.unitWeight')}</label> 
                                        <select
                                          value={container.idUnitWeight}
                                          onChange={(e) => {
                                            updateContainersQuantityShipment( service.idServiceItem, 1, container.idContainer || 1,
                                              {                              
                                                idUnitWeight: parseInt(e.target.value),
                                                unitWeight: e.target.options[e.target.selectedIndex].text
                                              });
                                          }}
                                          className={styles.select}
                                          disabled={loading ||Disabled} >
                                          <option value="">{t('quote.selectOption')}</option>
                                          <option value={1}>KGS</option>                  
                                          <option value={2}>IN</option>
                                          <option value={4}>LBS</option>        
                                          <option value={3}>Toneladas</option>                
                                        </select>
                                      </div>
                                      <div className={styles.formGroup}>
                                        <button
                                          type="button" 
                                          className={styles.removeIconButton}
                                          onClick={() => updateContainersShipment(service.idServiceItem, 1, container)}
                                          title={t('quote.delete')}
                                          disabled={loading ||Disabled}>
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </div>                              
                                  </div>
                                ))} 
                              </div>
                              <button type="button" 
                                className={styles.addExecutiveButton} 
                                onClick={()=> openContainerModal(service.idServiceItem, service.shipments[0].containers || [])}
                                disabled={loading ||Disabled}>
                                <Plus size={16} />
                                {t('quote.container')}
                              </button>                            
                            </div>
                          </div>
                        )}

                        {/** MODAL CONTENEDORES */}
                          {showContainersModal && (
                            <div className={styles.modalOverlay} onClick={() =>{setShowContainersModal(false); setCurrentServiceId(null);}}>
                              <div className={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.modalHeader}>
                                  <h2 className={styles.modalTitle}>{t('quote.selectcontainer')}</h2>
                                    <button className={styles.closeButton} onClick={() =>{setShowContainersModal(false); setCurrentServiceId(null);}}>
                                      <X size={24} />
                                    </button>
                                </div>
                                <div className={styles.modalBody}>
                                  {loadingContainers ? 
                                  ( <div className={styles.loading}>
                                    <div className={styles.spinner} />
                                    </div> 
                                  ) :
                                    <div className={styles.executiveSelectionList}>
                                      {availableContainers.filter(cont => !containers?.some(container => container.idContainer === cont._Id)).map((containerAvailable) => (
                                        <div
                                          key={containerAvailable._Id}
                                            className={styles.executiveSelectionItem}
                                            onClick={() => 
                                              updateContainersShipment(currentServiceId || 1, 1, 
                                                { 
                                                  idContainer: containerAvailable._Id, 
                                                  nameTypeContainer: `${containerAvailable.name_type}`,
                                                  quantity: 1
                                                })
                                            }>
                                            <span>{containerAvailable.name_type}</span>                                            
                                            <Plus size={18} className={styles.addIcon} />
                                        </div>
                                      ))}
                                                  
                                      {availableContainers.filter(cont => containers?.some(container => container.idContainer === cont._Id)).length === 0 && (
                                        <div className={styles.noExecutivesMessage}>
                                          {t('quote.allContainersAdded')}
                                        </div>
                                      )}
                                    </div>
                                  }
                                </div>
                              </div>
                            </div>
                          )}

                        <div className={styles.associatedServices}>
                          <label className={styles.label}>{t('ctrlpricing.associatedServices')}</label>
                          <div className={styles.servicesChips}>
                            {(shipment.servicesAsociated || shipment.services_asociated) && (shipment.servicesAsociated || shipment.services_asociated).length > 0 ? (
                              (shipment.servicesAsociated || shipment.services_asociated).map((assocService: any, idx: number) => (
                                <span key={assocService.idServiceAsociated?.$oid || idx} className={`${styles.serviceChip} ${styles.serviceChipActive}`}>
                                  {assocService.serviceAsociatedName || 'Servicio'}
                                </span>
                              ))
                            ) : (
                              <span style={{color: '#9ca3af', fontSize: '14px'}}>{t('ctrlpricing.noassociatedservices')}</span>
                            )}
                          </div>
                        </div>                       
                        <div className={styles.formGroup}>
                          <label className={styles.label}>{t('ctrlpricing.comments')}</label>
                          <textarea
                            value={shipment.comment || shipment.comments || ''}
                            className={styles.formTextarea}
                            rows={2}
                            disabled
                            placeholder={t('ctrlpricing.nocomments')}
                          />
                        </div>

                        <div className={styles.frequencySection}>
                          <label className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              checked={!!shipment.projectionShipment}
                              disabled
                            />
                            {t('ctrlpricing.programFrequency')}
                          </label>
                          {shipment.projectionShipment && (
                            <div className={styles.frequencyGrid}>
                              <div className={styles.formGroup}>
                                <label className={styles.label}>{t('ctrlpricing.frequency')}</label>
                                <input
                                  type="text"
                                  value={shipment.projectionShipment.frecuency || ''}
                                  className={styles.formInput}
                                  disabled
                                />
                              </div>
                              <div className={styles.formGroup}>
                                <label className={styles.label}>{t('ctrlpricing.quantity')}</label>
                                <input
                                  type="number"
                                  value={shipment.projectionShipment.number || 0}
                                  className={styles.formInput}
                                  disabled
                                />
                              </div>
                              <div className={styles.formGroup}>
                                <label className={styles.label}>{t('ctrlpricing.unit')}</label>
                                <input
                                  type="text"
                                  value={shipment.projectionShipment.measurementFrecuency || ''}
                                  className={styles.formInput}
                                  disabled
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className={styles.merchandiseSection}>
                          <h4 className={styles.merchandiseTitle}>{t('ctrlpricing.commodity')}</h4>
                          {shipment.cargo && shipment.cargo.length > 0 ? (
                            <div className={styles.merchandiseTable}>
                              <table className={styles.simpleTable}>
                                <thead>
                                  <tr>
                                    <th>{t('ctrlpricing.commodity')}</th>
                                    <th>{t('ctrlpricing.dangerous')}</th>
                                    <th>{t('ctrlpricing.classification')}</th>
                                    <th>{t('ctrlpricing.stackable')}</th>
                                    <th>{t('ctrlpricing.totalVolume')}</th>
                                    <th>{t('ctrlpricing.totalWeight')}</th>                            
                                  </tr>
                                </thead>
                                <tbody>
                                  {shipment.cargo.map((carg: any) => (
                                    <tr key={carg.name}>
                                      <td>{carg.name}</td>
                                      <td>{carg.classification.idClassificationMerchandise === 5 ? 'Sí' : 'No'}</td>
                                      <td>{carg.classification.idClassificationMerchandise === 4 ? 'Refrigerada' : 'General'}</td>
                                      <td>{carg.stowable ? 'Sí' : 'No'}</td>
                                      <td>{carg.volumeTotal ? `${carg.volumeTotal} ${carg.unitMeasurement || ''}` : '0'} KG</td>
                                      <td>{carg.weigthTotal ? `${carg.weigthTotal} ${carg.unitWeight   || ''}` : '0'} KG</td>                        
                                    </tr>
                                  ))}                                
                                </tbody>
                              </table>
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
        }         

      </div>
    </form>
     {showModal && (   
        <form onSubmit={handleMarkAsDecline}>               
          <div className={styles.modalOverlay} onClick={closeModal}>          
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                Declinar Solicitud
                </h2>
                <button className={styles.closeButton} onClick={closeModal}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.modalBody}>             
                <div className={styles.formGroup}>
                  <label className={styles.label}><span className={styles.required}>*</span> Motivo</label>
                  <textarea
                    className={styles.textarea}
                    value={reasoncancellation}
                  onChange={(e) => setreasoncancellation(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>              
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelButton} onClick={closeModal} disabled={loading}>
                  {t('catalog.cancel')}
                </button>
                <button type="submit" className={styles.saveButton} disabled={loading}>
                  {loading ? t('catalog.saving') : t('catalog.save')}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
}
