import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, RefreshCw, Trash2, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { pricingControlService } from '../services/pricingControlService';
import { PricingControlSupplier } from '../types/pricingControl';
import { PricingControlSupplierAPI } from '../types/pricingControl';
import styles from './ControlsPricingForm.module.css';
import { useAuth } from '../contexts/AuthContext';
import { getSuppliers } from '../services/supplierService';

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
  const [showModal, setShowModal] = useState(false);
  const [selectsuppliers, setSelectsuppliers] = useState<any[]>([]);

  const [suppliers, setSuppliers] = useState<PricingControlSupplier[]>([
    
  ]);

   const [suppliersAPI, setSuppliersAPI] = useState<PricingControlSupplierAPI[]>([
    
  ]);

  const [suppliersCombo, setSuppliersCombo] = useState<PricingControlSupplierAPI>();

  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [expandedServices, setExpandedServices] = useState<Set<number>>(new Set());
  const { user } = useAuth();
  const [statusControl, setStatusControl] = useState({
    id_status_control: 3,
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
    id_executive_pricing: user._id || '',
    complete_name_pricing: user.name || '',    
  });

  const [priority, setPriority] = useState(false);
  const [bidding, setBidding] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const [reasoncancellation, setreasoncancellation] = useState('');

  useEffect(() => {
    loadData();
    loadCountries();
    loadSuppliers();
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
          network: control.network || 'WTC Alliance',
          complexity: control.complexity || 'Media',
          currency: control.currency || 'USD',
          unit_profit: control.unit_profit || '',
          volume: control.volume || '',
          general_profit: control.general_profit || '',
          key_td: control.key_td || 'CI',
          comments_general: control.comments_general || '',
          id_executive_pricing: control._id_executive_pricing || '',
          complete_name_pricing: control.complete_name_pricing || '',          
        });

        const request = await pricingControlService.getResquetById(control.idrequest);
        setRequestData(request);
        setPriority(request.priority === 1);
        setBidding(request.licitation === 1);

        const expandedIds = new Set(request.services?.map((s: any) => s.idServiceItem) || []);
        setExpandedServices(expandedIds);
      } else {
        const request = await pricingControlService.getResquetById(requestId);
        setRequestData(request);
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

  const addSupplier = () => {  
    
    if (suppliersCombo?.idsuplier ==='' || 
    suppliersCombo?.idsuplier === undefined || 
    suppliersCombo?.supplier_associated_name === '0') {
      showError(t('ctrlpricing.selectprov'));
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
    const service = requestData.services.find((s: any) =>
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
        Customer_business_name: requestData.customer?.customerName || '',
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
        Complete_name_pricing: generalData.complete_name_pricing
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
                {t('ctrlpricing.cpo')}
              </label>
              <input
                type="number"
                value={service.shipments[0].origin.zipCode}                
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
              <button type="submit" className={styles.headerButton} disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}>
                <Save size={18} />
                {t('ctrlpricing.save')}
              </button>
              <button type="button" className={styles.headerButtonRefresh} onClick={loadData} disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}>
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
                  disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}
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
                      {requestData.customer?.customerName}
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
                disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}
                onClick={openModal}
                hidden={controlId ? false : true}
                >
                  {t('ctrlpricing.decline')}
                  
                </button>
                <button type="button"
                  className={styles.btnQuote}
                  onClick={handleMarkAsQuoted}
                  disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}
                  hidden={controlId ? false : true}
                >
                  {t('ctrlpricing.quoted')}
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
                disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}
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
                      disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}
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
                <label><span className={styles.required}>*</span> {t('ctrlpricing.status')}</label>
                <select required
                  value={statusControl.status_control_name}
                  onChange={(e) => {
                    const statusMap: any = {
                      'Asignada': { id_status_control: 3, status_control_name: 'Asignada' },                    
                      'Cotizada': { id_status_control: 5, status_control_name: 'Cotizada' },
                      'Declinada': { id_status_control: 6, status_control_name: 'Declinada' }
                    };
                    setStatusControl(statusMap[e.target.value] || statusControl);
                  }}
                  className={styles.formSelect}
                  disabled
                >                
                  <option>Asignada</option>
                  <option>Cotizada</option>
                  <option>Declinada</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label><span className={styles.required}>*</span> {t('ctrlpricing.network')}</label>
                <select required
                  value={generalData.network}
                  onChange={(e) => setGeneralData({...generalData, network: e.target.value})}
                  className={styles.formSelect}
                  disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}
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
                <label><span className={styles.required}>*</span> {t('ctrlpricing.complexity')}</label>
                <select required
                  value={generalData.complexity}
                  onChange={(e) => setGeneralData({...generalData, complexity: e.target.value})}
                  className={styles.formSelect}
                  disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}
                >
                  <option>Baja</option>
                  <option>Media</option>
                  <option>Alta</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label><span className={styles.required}>*</span> {t('ctrlpricing.currency')}</label>
                <select required
                  value={generalData.currency}
                  onChange={(e) => setGeneralData({...generalData, currency: e.target.value})}
                  className={styles.formSelect}
                  disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}
                >
                  <option>USD</option>
                  <option>MXN</option>
                  <option>EUR</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label><span className={styles.required}>*</span> {t('ctrlpricing.unitprofit')}</label>
                <input required
                  type="number"
                  value={generalData.unit_profit}
                  onChange={(e) => setGeneralData({...generalData, unit_profit: e.target.value})}
                  className={styles.formInput}
                  disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}                
                />
              </div>
              <div className={styles.formGroup}>
                <label><span className={styles.required}>*</span> {t('ctrlpricing.volume')}</label>
                <input required
                  type="number"
                  value={generalData.volume}
                  onChange={(e) => setGeneralData({...generalData, volume: e.target.value})}
                  className={styles.formInput}                
                  disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}
                />
              </div>
              <div className={styles.formGroup}>
                <label><span className={styles.required}>*</span> {t('ctrlpricing.generalprofit')}</label>
                <input required
                  type="number"
                  value={calculateProfit_general()}
                  onChange={(e) => setGeneralData({...generalData, general_profit: e.target.value})}
                  className={styles.formInput}
                  disabled={true}
                />
              </div>
                <div className={styles.formGroup}>
                <label><span className={styles.required}>*</span> Key TD</label>
                <select required
                  value={generalData.key_td}
                  onChange={(e) => setGeneralData({...generalData, key_td: e.target.value})}
                  className={styles.formSelect}
                  disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}
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
              <label>{t('ctrlpricing.comments')}</label>
              <textarea
                value={generalData.comments_general}
                onChange={(e) => setGeneralData({...generalData, comments_general: e.target.value})}
                className={styles.formTextarea}
                rows={3}
                disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}
              />
            </div>
          </div>

          <div className={styles.servicesSection}>
            <h3 className={styles.sectionTitle}>{t('ctrlpricing.services')}</h3>
            {requestData.services && requestData.services.length > 0 ? (
              requestData.services.map((service: any, index: number) => {
                const serviceId = service.idServiceItem || service._id;
                const isSelected = selectedServices.some(s => s.idServiceItem === serviceId);
                const isUsed = (service.used && controlId === null) || (service.used && (statusControl.id_status_control === 5 || statusControl.id_status_control === 6)) ;
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
                        disabled={loading ||statusControl.id_status_control === 5 || statusControl.id_status_control === 6}
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
                            <label><span className={styles.required}>*</span> {t('ctrlpricing.service')}</label>
                            <input
                              type="text"
                              value={service.nameService || ''}
                              className={styles.formInput}
                              disabled
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label><span className={styles.required}>*</span> {t('ctrlpricing.operation')}</label>
                            <input
                              type="text"
                              value={shipment.typeOperation || ''}
                              className={styles.formInput}
                              disabled
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label><span className={styles.required}>*</span> Incoterm</label>
                            <input
                              type="text"
                              value={shipment.incoterm_name || shipment.incoterm || ''}
                              className={styles.formInput}
                              disabled
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label>{t('ctrlpricing.expecteddeparture')}</label>
                            <input
                              type="date"
                              value={shipment.departureDateAproximate ? new Date(shipment.departureDateAproximate.$date || shipment.departureDateAproximate).toISOString().split('T')[0] : ''}
                              className={styles.formInput}
                              disabled
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label><span className={styles.required}>*</span> {t('ctrlpricing.shippingtype')}</label>
                            <input
                              type="text"
                              value={shipment.typeShipment || ''}
                              className={styles.formInput}
                              disabled
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label><span className={styles.required}>*</span> {t('ctrlpricing.origin')}</label>
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
                            <label><span className={styles.required}>*</span> {t('ctrlpricing.destination')}</label>
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
                            {renderZipCodesOrigin(service)}
                          </div>  
                          <div>
                            {renderZipCodesDestination(service)}
                          </div>                       
                        </div>

                        <div className={styles.associatedServices}>
                          <label>{t('ctrlpricing.associatedServices')}</label>
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
                          <label>{t('ctrlpricing.comments')}</label>
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
                                <label>{t('ctrlpricing.frequency')}</label>
                                <input
                                  type="text"
                                  value={shipment.projectionShipment.frecuency || ''}
                                  className={styles.formInput}
                                  disabled
                                />
                              </div>
                              <div className={styles.formGroup}>
                                <label>{t('ctrlpricing.quantity')}</label>
                                <input
                                  type="number"
                                  value={shipment.projectionShipment.number || 0}
                                  className={styles.formInput}
                                  disabled
                                />
                              </div>
                              <div className={styles.formGroup}>
                                <label>{t('ctrlpricing.unit')}</label>
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
                  {loading ? 'Guardando...' : t('catalog.save')}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
}
