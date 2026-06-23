import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Save, Edit2, ChevronDown, ChevronUp, RotateCcw, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { Operation, Customer, Service, ServiceOperation, ServiceDetail, HistoryStatus } from '../types/operations';
import { createOperation, getControls, getOperations, updateOperation } from '../services/operationsService';
import styles from './Operations.module.css';
import { useAuth } from '../contexts/AuthContext';
import { getCustomers } from '../services/customerService';
import { catalogService } from '../services/catalogsService';
import { PricingControl } from '../types/pricingControl';
import { getSuppliers } from '../services/supplierService';
import { Supplier } from '../types/supplier';
import { FreightForm } from '../components/operations/FreightForm'
import { PrevioForm } from '../components/operations/PrevioForm'
import { OtherServiceForm } from '../components/operations/OtherServiceForm'
import { useOperations } from '../hooks/useOperations'
import { useCatalogs } from "../hooks/useCatalogs";
import { AirFreightForm } from '../components/operations/AirFreightForm';
import { useOperationsValidation } from '../contexts/OperationsValidationContext';
import { OperationsValidationProvider } from '../contexts/OperationsValidationContext';


export default function Operations() {
  return(
    <OperationsValidationProvider>
        <OperationsInner />
    </OperationsValidationProvider>    
  ) 
}

//al usar useContext el provider debe declararse antes de iniciar el create context, solo puede leer un valor de un Provider que esté arriba en el árbol de componentes, en un componente diferente al que declara el Provider.
function OperationsInner () {
  const { runAllValidators, clearErrors } = useOperationsValidation(); //aqui creamos el useContext para las validaciones
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const formMainRef = useRef<HTMLFormElement>(null);  
  const { showError, showWarning } = useNotification();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [controlsData, setControls] = useState<PricingControl[]>([]);
  const [controlsClient, setControlsClient] = useState<PricingControl[]>([]);
  const [controlsOperation, setControlsOperation] = useState<PricingControl[]>([]);
  const [control, setControl] = useState<PricingControl>();
  const [servicesData, setServices] = useState<Service[]>([]);
  const [service, setService] = useState<Service>();
  const [servicesOperation, setServicesOperation] = useState<Service[]>([]);
  const [serviceDetail, setServiceDetail] = useState<ServiceDetail[]>([]);
  const [incoterm, setIncoterm] = useState<Service[]>([]);
  const [supplier, setSupplier] = useState<Supplier[]>([]);
  const { countries } = useCatalogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [hasControlNumber, setHasControlNumber] = useState(false);
  const [activeTab, setActiveTab] = useState<Record<string, string>>({
    id: '',
    idService: '',
    item: '',
    name: ''
  });
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    services: false,
    expedientes: false
  });
  const { user } = useAuth();
  let errors = [] ;

  const {
    formData,
    resetFormData,
    setCompleteFormData,
    updateFormData,
    updateServiceFormData,
    updateServiceDetail,
    duplicateDetail,
    removeDetail
  } = useOperations()

  //   const handleStatusFilterChange = (status: 'todos' | 'activo' | 'inactivo') => {
  //     setStatusFilter(status);
  //   };

  useEffect(() => {
    loadOperations();
    loadControls();
    loadServices();
    loadIncorterm();
    loadCustomers();
    loadSupplier();
  }, []);

  //   useEffect(() => {

  //   }, [statusFilter]);


  async function loadOperations() {
    try {
      setLoading(true);
      const data = await getOperations();
      setOperations(data);
    } catch (error) {
      console.error('Error al cargar las operaciones:', error);
      showError(t('operations.loadError'));
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomers() {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  }

  async function loadControls() {
    try {
      const data = await getControls();
      setControls(data);
    } catch (error) {
      showError(t('controls.loadError'));
      console.error('Error loading controls:', error);
    }
  }

  async function loadServices() {
    try {
      const data = await catalogService.getServices();
      setServices(data.data.filter((s: any) => s.status === 1)); // Filtrar solo los servicios activos
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }

  async function loadIncorterm() {
    try {
      const data = await catalogService.getIncoterms();
      setIncoterm(data.data.filter((s: any) => s.status === 1));
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }

  async function loadSupplier() {
    try {
      const data = await getSuppliers();
      setSupplier(data);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }

  function handleNewOperation() {
    setActiveTab({ id: '', idService: '', item: '', name: '' })
    setControlsClient([]);
    setControl({} as PricingControl);
    setControlsOperation([]);
    setServicesOperation([]);
    setService({} as Service);
    setEditingOperation(null);
    resetFormData();
    setIsFormOpen(true);
    setHasControlNumber(false);
    setCollapsedSections({
      services: false,
      expedientes: false
    });
    updateFormData({
      Customer: {
        idCustomer: '',
        name: '',
        rfc: ''
      }
    });
  }

  function handleEditOperation(operation: Operation) {
    setActiveTab({ id: '', idService: '', item: '', name: '' })
    setServicesOperation([]);
    setService({} as Service);
    setEditingOperation(operation);

    const selectedCustomer = customers.find(
      c => c.id === operation.customer.idCustomer
    );

    const controlsClient = controlsData.filter(control => {
      return control.id_customer === selectedCustomer.id;
    });

    setControlsClient(controlsClient);

    // Asignar los controles de la operación al estado controlsOperation para mostrarlos en el formulario
    const loadedControls = operation.services.reduce((acc, service) => {
      if (!service.idControl) return [{
         _id: null,
        control: null,
        services: operation.services
      }];

      const existingControl = acc.find(
        c => String(c._id) === String(service.idControl)
      );

      const normalizedService = normalizeService(service);
      if (!existingControl) {
        acc.push({
          _id: service.idControl,
          idService: '',
          control: service.control,
          services: [normalizedService]
        });
      } else {
        existingControl.services.push(normalizedService);
      }
      return acc;
      
    }, []);

    setControlsOperation(loadedControls)
    /*const loadedServices = operation.services
      .filter(os => os.idControl === null)
      .map(c => ({
        _id: null,
        control: null,
        services: operation.services
      }));

    setServicesOperation(loadedServices);*/
    console.log('Edit',loadedControls, operation)

    if (loadedControls.length > 0) {
      setActiveTab({
          id: loadedControls[0]._id,
          idService: loadedControls[0].services[0].idService,
          item: loadedControls[0].services[0].idServiceItem,
          name: loadedControls[0].services[0].nameService,
        });
      toggleSection('services');
    }

    operation.services.map(s =>
      s.currentIndex = 0
     )

    setCompleteFormData(operation, selectedCustomer);
    setIsFormOpen(true);    
  }

  function handleCustomerChange(selectedCustomerId: string) {
    //console.log('customer',selectedCustomerId)
    setControl({} as PricingControl);
    setControlsOperation([]);
    setServicesOperation([]);
    setService({} as Service);
    setEditingOperation(null);
    setHasControlNumber(false);

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    //console.log ('selectedCustomer', selectedCustomer)
    if (!selectedCustomer) {
      updateFormData({ //setFormData
        ...formData,
        Id: '',
        IdReference: 0,
        Reference: '',
        Customer: {} as Customer,
        Services: [] as ServiceOperation[],
        Observations: '',
        OperationStatus: 'Alta referencia',
        HistoryStatus: [] as HistoryStatus[],
        CreatedAt: new Date,
        CreatedBy: {
          UserId: user?._id || '',
          Name: user?.name || '',
        },
        UpdatedAt: Date,
        UpdateBy: {
          UserId: user?._id || '',
          Name: user?.name || '',
        },
        Status: 1,
        Archived: false,
        DataState: 1,
      });
      return;
    }

    //setFormData
    updateFormData({
      ...formData,
      Customer: {
        idCustomer: selectedCustomer.id,
        name: selectedCustomer.fiscalData.businessName,
        rfc: selectedCustomer.fiscalData.taxId
      },
    });

    const controlsClient = controlsData.filter(control => {
      return control.id_customer === selectedCustomer.id;
    });

    setControlsClient(controlsClient);

    if (controlsClient.length > 0){
        setHasControlNumber(true)
    }

  };

  const addControl = () => {

    if (control === undefined || control._id === undefined ||
        control._id === "" || control.control === "") {
      showWarning(t("operations.selectControlWarning"));
      return;
    }
    
    if (controlsOperation?.some((c) => c._id === control?._id && c.services === control.services)) {
      showError(t("operations.alreadyadded"));
      return;
    }
    //console.log('Controles ', control, controlsOperation)
    const normalizedServices = control.services.map((service) =>
      normalizeService(service, control)
    );

    //setFormData
    updateFormData((prev) => ({
      ...prev,
      Services: [...prev.Services, ...normalizedServices],
    }));

    setControlsOperation((prev) => {
      const existsControl = prev.some((c) => c._id === control._id);

      if (!existsControl) {
        return [
          ...prev,
          {
            _id: control._id,
            control: control.control,
            services: normalizedServices,
          },
        ];
      }

      return prev.map((c) => {
        if (c._id !== control._id) return c;

        const currentServices = c.services ?? [];

        const servicesToAdd = normalizedServices.filter(
          (newService) =>
            !currentServices.some(
              (existingService) =>
                String(existingService.idServiceItem) ===
                String(newService.idServiceItem),
            ),
        );

        return {
          ...c,
          services: [...currentServices, ...servicesToAdd],
        };
      });
    });

    // Quitamos el control seleccionado de la lista de controles disponibles para el cliente
    setControlsClient(prev =>
      prev.filter(c => c.id !== control._id)
    );

    if (controlsOperation.length === 0) {
      toggleSection('services');
    }

    if (normalizedServices.length > 0) {
      setActiveTab({
        id: normalizedServices[0].idControl || control._id,
        idService: normalizedServices[0].idService,
        item: normalizedServices[0].idServiceItem,
        name: normalizedServices[0].nameService,
      });
    }
  };

  const removeControl = (controlOperation: any, item: number) => {
    const _idcontrol= controlOperation._id ?? undefined

    updateFormData((prev) => ({
      ...prev,
      Services:
        prev.Services.filter(
          (service) => _idcontrol !== undefined ? 
           (service.idControl !== _idcontrol || service.idServiceItem !== item) :
           (service !== controlOperation)
        ) || [],
    }));

    if (_idcontrol !== undefined) {
      setControlsClient((prevControl) => {
      const selectedControls = controlsOperation
        .filter((c) =>  c._id === _idcontrol)
        .map((c) => ({
          ...c,
          services:
            c.services?.filter(
              (s) => String(s.idServiceItem) === String(item),
            ) ?? [],
        }))
        .filter((c) => c.services.length > 0) as PricingControl[];

      return selectedControls.reduce<PricingControl[]>(
        (acc, selectedControl) => {
          const existingIndex = acc.findIndex(
            (c) => c._id === selectedControl._id,
          );

          if (existingIndex === -1) {
            return [...acc, selectedControl];
          }

          return acc.map((control, index) => {
            if (index !== existingIndex) return control;

            const currentServices = control.services ?? [];

            const servicesToAdd =
              selectedControl.services?.filter(
                (newService) =>
                  !currentServices.some(
                    (existingService) =>
                      String(existingService.idServiceItem) ===
                      String(newService.idServiceItem),
                  ),
              ) ?? [];

            return {
              ...control,
              services: [...currentServices, ...servicesToAdd],
            };
          });
        },
        prevControl,
      );
      });
    }    
    // controlsClient.push(controlsOperation.find(c => c._id === _idcontrol) as PricingControl); // Volver a agregar el control eliminado a la lista de controles disponibles para el cliente
    // Eliminar el control seleccionado de la lista de controles asociados a la operación
    setControlsOperation((co) =>      
      co.map((c) => c._id !== undefined && c._id === _idcontrol ? 
          {
            ...c,
            services: c.services?.filter((s) => s.idServiceItem !== item),
          } : c)
          .filter((c) => {
            if(c._id === undefined) {                          
              return  !c.services?.some((service) => controlOperation.services?.some((cs) => String(cs.idService) === String(service.idService)));              
            }
            return c.services?.length > 0 
          })
    );

    if (controlsOperation.length === 0) {
      toggleSection("services");
    }
  };

  const addService = () => {
    //console.log('Service', service, controlsOperation)
    if (service === undefined || service._id === undefined ||
      service._id === '' || service.service_name === '') {
      showWarning(t('operations.selectServiceWarning'));
      return;
    }

    if (controlsOperation?.some((controlOp) => controlOp._id === undefined ? controlOp.services?.some((ser) => ser.idService === service._id) : false)){
      showError(t('operations.alreadyadded'));
      return;
    }

    const controlOperationConverted : any = {
       //id y control no van por no venir de un control      
      services: [{
        idServiceItem: controlsOperation.length + 1,        
        idService: service._id,
        nameService: service.service_name,
        isShipment: true,
        observationsService: "",
        currentIndex: 0, 
        serviceDetail: [] as ServiceDetail[],
      }],
    }

    updateFormData((prev) => ({
      ...prev,
      Services: [...prev.Services, ...controlOperationConverted.services],
    }));

    setControlsOperation((prev) => {       
        return [
          ...prev,
          controlOperationConverted,
        ];      
    });    
  };

  const removeService = (_idservice: number) => {
    console.log('servicesOperation', servicesOperation, _idservice)
    setServicesOperation(servicesOperation.filter(s => s._id !== _idservice));  // Eliminar el servicio seleccionado de la lista de servicios asociados a la operación

    // controlsClient.push(controlsOperation.find(c => c._id === _idcontrol) as PricingControl); // Volver a agregar el control eliminado a la lista de controles disponibles para el cliente
  };

  const normalizeCountry = (country: any) => {
    const catalogCountry = countries.find(
      (c) => String(c._Id) === String(country?.idCountry)
    );
    return {
      idCountry: catalogCountry?._Id ?? "",
      country: catalogCountry?.name_country ?? "",
      countryKey: catalogCountry?.country_code ?? ""
    }
  }

  const normalizeService = (service: any, control: any = null) => {

    let detail = [];

    let secuencia = 1

    // Shipments
    if (service.shipments?.length > 0) {
      detail = service.shipments?.map((shipment: any) => ({
        ...shipment,
        transport:
          shipment.transports
            ? shipment.transports
            : [{}],
        origin:
          shipment.origin
            ? {
              country: normalizeCountry(shipment.origin),
              ...(shipment.origin?.portCode && {
                port: { portKey: shipment.origin.portCode }
              }),
              ...(shipment.origin?.airportCode && {
                airport: { airportKey: shipment.origin.airportCode }
              }),
              placeOfReceipt: shipment.origin.city + (shipment.origin.zipCode ?? ''),
            }
            : [{}],
        destination:
          shipment.destination
            ? {
              country: normalizeCountry(shipment.destination),
              ...(shipment.destination?.portCode && {
                port: { portKey: shipment.destination.portCode }
              }),
              ...(shipment.destination?.airportCode && {
                airport: { airportKey: shipment.destination.airportCode }
              }),
              placeOfDelivery: shipment.destination.city + (shipment.destination.zipCode ?? ''),
            }
            : [{}],
        references:
          shipment.references?.length > 0
            ? shipment.references
            : [{}],
        containers:
          shipment.containers?.length > 0
            ? shipment.containers
            : [{}],
        cargo:
          shipment.cargo?.length > 0
            ? shipment.cargo
            : [{ idcargo: 1, name: '', units: 0, weight: 0, volume: 0, classification: [], stowable: 0, shipmentTypeCargo: '', idUnitMeasurement: 1, unitMeasurement: '', idUnitWeight: 1, unitWeight: '' }],
        detailType: 'shipment',
        idDetail: secuencia
      }));

    }

    // Order Service
    else if (service.orderService) {
      detail = [{
        ...service.orderService,
        detailType: 'orderService',
        idDetail: secuencia
      }];
    }

    if (service.serviceDetail?.length > 0) {
      detail = service.serviceDetail.map((detail: any) => ({
        ...detail,
        transport:
          detail.transports?.length > 0
            ? detail.transports
            : [{}],
        origin:
          detail.origin
            ? detail.origin
            : [{}],
        destination:
          detail.destination
            ? detail.destination
            : [{}],
        references:
          detail.references?.length > 0
            ? detail.references
            : [{}],
        containers:
          detail.containers?.length > 0
            ? detail.containers
            : [{}],
        cargo:
          detail.cargo?.length > 0
            ? detail.cargo
            : [{ idcargo: 1, name: '', units: 0, weight: 0, volume: 0, classification: [], stowable: 0, shipmentTypeCargo: '', idUnitMeasurement: 1, unitMeasurement: '', idUnitWeight: 1, unitWeight: '' }],
        detailType: 'detail',
        idDetail: secuencia
      }));

    }

    return {
      idServiceItem: service.idServiceItem, // controlsOperation.length + 1 , //
      idControl: control?._id || service.idControl || null,
      control: control?.control || service.control || null,
      idService: service.idService,
      nameService: service.nameService,
      observationsService: service.observationsService || '',
      category: service.category,
      currentIndex: 0, 
      serviceDetail: detail
    };
  };

  const filteredOperations = operations.filter(operation => {
    const matchesSearch = operation.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.customer.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || operation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function toggleSection(section: string) {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  async function handleSaveOperation(e: React.FormEvent) {
    /*if(errors.length === 0 && !formMainRef.current?.reportValidity()) {       
        return; 
    }*/
    try {
      setLoading(true);
      e.preventDefault();
      errors = runAllValidators();
      if(formData.Customer === undefined || formData.Customer.name.length === 0 ) {
        showWarning(t('operations.customerRequired'));
        return;
      }
          
     if (controlsOperation.length === 0 && servicesOperation.length === 0) {
        showWarning(t("operations.warnings.servicesRequired"));
        return;
      }           
            
      if(errors.length > 0) {
        const firstError = errors.find(error => error.serviceItem !== undefined);
        if(firstError) {
          const serviceError = formData.Services.find(service => service.idServiceItem === firstError.serviceItem);
          if (serviceError) {
            setActiveTab({
              id: serviceError.idControl ?? null,
              idService: serviceError.idService,
              item: serviceError.idServiceItem ,
              name: serviceError.nameService
            });
            setCollapsedSections(prev => ({ ...prev, services: true }));
          }
        }
        showWarning(t("operations.warnings.fieldsRequired", {values: {count: errors.length}}) 
          + `\n ${errors.map(e => e.message).join('\n')}`);
        return;
      }
      clearErrors();
      
      const dataToSave = {
        ...formData,
        UpdatedAt: null,
        UpdateBy: {},
        Status: 1,
        Archived: false,
        DataState: 1,
      };
      console.log(JSON.stringify(dataToSave, null, 2), editingOperation);
      if (editingOperation) {
        const dataToSave = {
          ...formData,
          UpdatedAt: new Date,
          UpdateBy: {
            UserId: user?._id || '',
            Name: user?.name || ''
          },
        };

        await updateOperation(editingOperation.Id!, dataToSave);
      } else {
        await createOperation(dataToSave);
      }
      await loadOperations();
      setIsFormOpen(false);
      setEditingOperation(null);
    } catch (error) {
      console.error('Error saving supplier:', error);
      const errorMessage = error instanceof Error ? error.message : t('supp.errorSave');
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function addServices(service: Service) {
    updateFormData({ //setformdata
      ...formData,
      Services: [...formData.Services, service]
    });
  }

  function buildOperationService(control: any, service: any): ServiceOperation {
    return {
      idServiceItem: service.idServiceItem,
      idControl: control?._id || null,
      control: control?.control || null,
      idService: service.idService,
      // idTypeShipment: service.idTypeShipment,
      // typeShipment: service.typeShipment,
      nameService: service.nameService,
      currentIndex: 0,
      observationsService: service.observationsService || '',
      category: service.category,
      serviceDetail: service.serviceDetail,
    };

  }

   

  if (isFormOpen) {
    return (
      <>       
        <form ref={formMainRef} noValidate onSubmit={handleSaveOperation} className={styles.formContainer}>

          <div className={styles.formHeaderRow}>

            <div className={styles.header}>
              <button
                onClick={() => setIsFormOpen(false)} className={styles.backButton}
                title="Volver a lista" >
                <ArrowLeft size={18} />
              </button>
              <h2 className={styles.formTitle}>
                {formData.Id ? t('operations.editOperation') : t('operations.newOperation')}
              </h2>
            </div>

            <div className={styles.headerActions}>
              <button type="submit" className={styles.saveHeaderButton} disabled={loading}>
                <Save size={18} />
                {loading ? t('catalog.saving') : t('catalog.save')}
              </button>
              {/* {mode === "create" && ( */}
              <button
                type="button"
                //disabled={saving}  
                className={styles.resetHeaderButton}
                onClick={handleNewOperation}>
                <RotateCcw size={18} />
              </button>
            {/* )} */}
            </div>
          </div>

          {/* Datos generales */}
          <div className={styles.sectionCard}>

            <div className={styles.sectionTitle}>
              {t('operations.generalData')}
            </div>

            <div className={styles.twoColumnGrid}>

              <div className={styles.leftColumn}>
                {editingOperation !== null && (
                  <div className={styles.fieldGroup}>
                   {/* Referencia */}
                  <div>                        
                    <span className={styles.controlBadge}>{formData.Reference } </span>                        
                  </div>
                </div>
                ) }
                
                <div className={styles.fieldGroup}>
                  {/* Cliente */}                  
                  <label htmlFor="customer" className={styles.fieldLabel}>
                  {t('operations.customer')} | RFC - Tax ID
                  </label>
                  <div className='className="flex inline-flex'> 
                    <input
                    list='customers-list'
                    type="text"
                    value={formData.Customer.name}
                    className={styles.textInputClient}
                    required
                    placeholder= {t('operations.customerRequired')}                 
                    onChange={(e) => {     
                      const selected = customers.find(c => c.fiscalData?.businessName === e.target.value);
                      if (selected) {
                        handleCustomerChange(selected.id); 
                      } else {
                        updateFormData({
                          Customer: {
                            idCustomer: '',
                            name: e.target.value, // mantener lo que escribe mientras tipea
                            rfc: ''
                          }
                        });
                      }
                    }}>
                    </input>                  
                    <datalist id='customers-list'>
                      {customers.map((customer) => {
                        return(
                          <option key={customer.id} value={customer.fiscalData?.businessName}
                          label={`${customer.fiscalData.businessName} | ${customer.fiscalData.taxId}`} >
                          </option>)
                      })}
                    </datalist>
                    <div className=" ">                                           
                      <input
                        disabled
                        type="text"
                        className={styles.textInput}
                        value={formData.Customer.rfc}
                      />
                    </div>
                  </div>
                  

                  {/*<select
                    value={formData.Customer.idCustomer}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className={styles.selectInput}
                    required
                    onInvalid={(e) =>
                      e.currentTarget.setCustomValidity(t('catalog.requiredFields'))
                    }
                    onInput={(e) =>
                      e.currentTarget.setCustomValidity('')
                    }
                    disabled={false}
                  >
                    <option value="">{t('operations.selectCustomer')}</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.fiscalData.businessName} | {customer.fiscalData.taxId}
                      </option>
                    ))}
                  </select>*/}
                </div>

                {/* Controles / Servicios*/}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    {t("operations.services")}
                  </label>                  
                  <div className={styles.statusField}>
                    <span className={styles.statusText}>{t("operations.hasControlNumber")}</span>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={hasControlNumber}
                        onChange={(e) => setHasControlNumber(!hasControlNumber) 
                        } />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  {hasControlNumber ? 
                  (
                    /* Controles */
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-surface-container-low">
                    <label className="block font-label-caps text-label-caps text-primary px-3 py-2 dark:text-white">
                      {t('operations.controls')}
                    </label>
                    <div className="bg-surface-container-low border-b dark:border-gray-600 border-outline-variant p-2 flex items-center gap-2">
                      <select
                        className="min-h-[30px] w-full p-2 rounded-lg bg-transparent text-black dark:text-white
                                     border border-gray-300 dark:border-gray-700 
                                     hover:border-[#14b8a6] hover:dark:border-[#14b8a6] 
                                     focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]
                                     outline-none appearance-none text-body-sm transition-colors"
                        onChange={(e) => {
                          const dataC = JSON.parse(e.target.value);
                          console.log('combo', dataC)
                          setControl({
                            ...control,
                            _id: dataC.id,
                            control: dataC.control,
                            services: dataC.services,
                            suppliers: dataC.suppliers,
                          })
                        }}
                      >
                        <option className="bg-white text-black dark:bg-[#1e293b] dark:text-white appearance-none" value="">
                          {t('operations.selectControl')}
                        </option>
                        {controlsClient.map(controlCliente => (
                          <option className="bg-white text-black dark:bg-[#1e293b] dark:text-white appearance-none"
                            key={controlCliente.id}
                            value={JSON.stringify({
                              id: controlCliente.id || controlCliente._id,
                              control: controlCliente.control,
                              services: controlCliente.services,
                              suppliers: controlCliente.suppliers
                            })}>
                            {controlCliente.control}
                          </option>
                        ))} {/* Controles relacionados al cliente */}
                      </select>
                      <button type="button"
                        className={styles.btnAddSearch}
                        onClick={addControl}
                        disabled={loading || disabled}>
                        <Plus size={16} />
                        {/* {t('operations.addControl')} */}
                      </button>
                    </div>                    
                  </div>
                  ) :                    
                  (
                    /* Servicios */
                  <div className={styles.fieldGroup}>
                    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-surface-container-low">
                      <label className="block font-label-caps text-label-caps text-primary px-3 py-2 dark:text-white">
                        {t('operations.services')}
                      </label>
                      <div className="bg-surface-container-low border-b dark:border-gray-600 border-outline-variant p-2 flex items-center gap-2">
                        <select className="min-h-[30px] w-full p-2 rounded-lg bg-transparent text-black dark:text-white
                                      border border-gray-300 dark:border-gray-700 
                                      hover:border-[#14b8a6] hover:dark:border-[#14b8a6] 
                                      focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]
                                      outline-none appearance-none text-body-sm transition-colors"
                          onChange={(e) => {
                            setService({
                              ...service,
                              _id: Number(e.target.value),
                              service_name: e.target.options[e.target.selectedIndex].text
                            })}}>
                          <option className="bg-white text-black dark:bg-[#1e293b] dark:text-white appearance-none" value="">
                            {t('operations.selectService')}
                          </option>
                          {servicesData.map(service => (
                            <option className="bg-white text-black dark:bg-[#1e293b] dark:text-white appearance-none"
                              key={service._Id} value={service._Id}>
                              {service.service_name}
                            </option>
                          ))}  
                        </select>
                        <button type="button"
                          className={styles.btnAddSearch}
                          onClick={addService}
                          disabled={loading || disabled}>
                          <Plus size={16} />
                        </button>
                      </div>

                      {/*<div className="p-2 flex flex-wrap gap-2 min-h-[120px] content-start">
                        {servicesOperation.length > 0 ? (
                          servicesOperation?.map(service => (
                            <span key={`${service._id}-${service.service_name}`}
                              className="border border-[#14b8a6] bg-transparent rounded-full
                                        flex items-center gap-1 px-3 py-1 text-xs
                                        dark:bg-[#374151] dark:text-white"
                            >
                              {service.service_name}
                              <button
                                type="button"
                                value={service._id}
                                className="ml-1 text-gray-500 hover:text-red-500 dark:text-gray-300"
                                onClick={(e) => { removeService(service._id as number) }}>
                                ✕
                              </button>
                            </span>

                          ))
                        ) : (
                          <span className=''></span>
                        )
                        }
                      </div>*/}
                    </div>
                  </div>
                  )}

                  {/* Servicios y Controles*/}  
                  <div className={styles.fieldGroup}>                  
                    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-surface-container-low">                      
                      <div className="p-2 flex flex-wrap gap-2 min-h-[120px] content-start">
                        {controlsOperation.length > 0 ? (
                          controlsOperation?.map(controlService => (
                            controlService.services?.map(service => (
                              <span key={`${controlService._id ?? 'service'}-${service.idService}-${service.idServiceItem}`}
                                className="border border-[#14b8a6] bg-transparent rounded-full
                                        flex items-center gap-1 px-3 py-1 text-xs
                                        dark:bg-[#374151] dark:text-white"
                              >
                                {controlService.control} {service.nameService}
                                <button
                                  type="button"
                                  value={controlService.idcontrol}
                                  key={`${controlService._id ?? 'service'}-${service.idService}-${service.idServiceItem}`}
                                  className="ml-1 text-gray-500 hover:text-red-500 dark:text-gray-300"
                                  onClick={() => { removeControl(controlService, service.idServiceItem as number) }}
                                >
                                  ✕
                                </button>
                              </span>
                            ))
                          ))
                        ) : (
                          <span className=''></span>
                        )
                        }
                      </div>
                    </div>   
                  </div>

                </div>
              </div>

              <div className={styles.rightColumn}>

                {/* Observaciones*/}
                <div className={styles.fieldGroup}>
                  <label htmlFor="observations" className="block font-label-caps text-label-caps text-primary px-1 py-2 dark:text-white">
                    {t('operations.observations')}
                  </label>
                  <textarea
                    type="textarea"
                    id="observations"
                    name="observations"
                    value={formData.Observations}
                    onChange={(e) => {
                      console.log(formData)
                      updateFormData({ ...formData, Observations: e.target.value })
                    } //setformdata
                    }
                    className="min-h-[30px] w-full p-2 rounded-lg
                              bg-transparent text-black dark:text-white
                              border border-gray-300 dark:border-gray-700
                              hover:border-[#14b8a6] hover:dark:border-[#14b8a6] 
                              focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]
                              outline-none appearance-none text-body-sm transition-colors"
                  />
                </div> 

                             
              </div>

            </div>            

            <div className={styles.twoColumnGrid}>
              <div className={styles.leftColumn}>
                <div className={styles.fieldGroup}>

                  <div className={styles.statusField}>
                    <span className={styles.statusText}>{t('operations.listaparafacturar')}</span>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={formData.ListaParaFacturar === true}
                        onChange={(e) => updateFormData({
                          ...formData,
                          ListaParaFacturar: e.target.checked ? true : false
                        })} //setformdata
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                </div>
              </div>

              <div className={styles.rightColumn}>
                <div className={styles.fieldGroup}>

                  <div className={styles.statusField}>
                    <span className={styles.statusText}>{t('catalog.status.active')}</span>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={formData.Status === 1}
                        onChange={(e) => updateFormData({ //setformdata
                          ...formData,
                          Status: e.target.checked ? 1 : 0
                        })}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                </div>
              </div>

            </div>

          </div>

          {/* Servicios */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionTitleCollapsible}
              onClick={() => toggleSection('services')}>
              <div className={styles.sectionTitleWithDot}>
                <span className={styles.greenDot}></span>
                <span>{t('operations.services')}</span>
              </div>
              {collapsedSections['services'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {collapsedSections.services && (
              <div className={styles.sectionContent}>
                <div className={styles.serviceSpace}>
                  <div className="flex ">
                    {/* Tabs */}
                    <div className="border-b border-outline-variant flex gap-4 items-center justify-between mb-2">
                      {controlsOperation.length > 0 ? (
                        controlsOperation?.map(controlService => (
                          controlService.services?.map(service => (
                            <div key={`${controlService._id ?? 'service'}-${service.idService}-${service.idServiceItem}`}
                              className={`${styles.tabItem} ${activeTab.item === service.idServiceItem && activeTab.id === controlService._id && activeTab.name === service.nameService ? styles.active : ''}`}                              
                              onClick={() => {
                                setActiveTab({
                                  id: controlService._id,
                                  idService: service.idService,
                                  item: service.idServiceItem || 1,
                                  name: service.nameService
                                });                               
                                const newService = buildOperationService(controlService, service);
                                updateFormData(prev => {
                                  const exists = prev.Services?.some(
                                    s => s.IdControl === newService.IdControl &&
                                    s.IdServiceItem === newService.IdServiceItem
                                  );
                                  if (exists) return prev;
                                  return {
                                    ...prev,
                                    Services: [...prev.Services, newService]
                                  };
                                });
                              }}>
                              {controlService.control} {service.nameService}
                            </div>
                        ))))
                      ) : (<></>)}                      
                    </div>
                  </div>
                </div>

                {controlsOperation.map(controlService =>
                  controlService.services?.map(service => {
                    const isActive = activeTab.item === service.idServiceItem && activeTab.id === controlService._id;
                    const serviceId = Number(service.idService);

                    const serviceInfo = {
                      id: controlService._id,
                      idService: service.idService,
                      item: service.idServiceItem,
                      name: service.nameService,
                    };

                    return (
                      <div
                        key={`${controlService._id}-${service.idServiceItem}`}
                        style={{ display: isActive ? 'block' : 'none' }}
                      >
                        {[1, 2, 3, 4, 10, 11].includes(serviceId) && (
                          <FreightForm
                          mode={editingOperation ? 'edit' : 'create'}
                          incoterms={incoterm}
                          suppliers={supplier}
                          countries={countries}
                          info={serviceInfo}
                          controlsData={controlsData}
                          formData={formData}
                          onUpdateFormData={updateFormData}
                          onUpdateServiceFormData={updateServiceFormData}
                          onUpdateServiceDetail={updateServiceDetail}
                          onDuplicateDetail={duplicateDetail}
                          onRemoveDetail={removeDetail} />
                        )}
                        {[5].includes(serviceId) && (
                          <AirFreightForm
                          incoterms={incoterm}
                          suppliers={supplier}
                          countries={countries}
                          info={serviceInfo}
                          controlsData={controlsData}
                          formData={formData}
                          onUpdateFormData={updateFormData}
                          onUpdateServiceFormData={updateServiceFormData}
                          onUpdateServiceDetail={updateServiceDetail}
                          onDuplicateDetail={duplicateDetail}
                          onRemoveDetail={removeDetail}
                        />
                        )}
                        {[17].includes(serviceId) && (
                          <PrevioForm
                            info={activeTab}
                            controlsData={controlsData}
                            formData={formData}
                            onUpdateFormData={updateFormData}
                            onUpdateServiceFormData={updateServiceFormData}
                          />
                        )}
                        {![1,2,3,4,5,10,11,17].includes(serviceId) && (
                          <OtherServiceForm
                            incoterms={incoterm}
                            info={activeTab}
                            controlsData={controlsData}
                            formData={formData}
                            onUpdateFormData={updateFormData}
                            onUpdateServiceFormData={updateServiceFormData} />
                        )}
                      </div>
                    );
                  })
                )}

                {/*<div style={{display: activeTab ? 'block' : 'none'}}>                  
                  {
                    [1, 2, 3, 4, 10, 11].includes(Number(activeTab.idService)) ?
                      (<FreightForm
                        mode={editingOperation ? 'edit' : 'create'}
                        incoterms={incoterm}
                        suppliers={supplier}
                        countries={countries}
                        info={activeTab}
                        controlsData={controlsData}
                        formData={formData}
                        onUpdateFormData={updateFormData}
                        onUpdateServiceFormData={updateServiceFormData}
                        onUpdateServiceDetail={updateServiceDetail}
                        onDuplicateDetail={duplicateDetail}
                        onRemoveDetail={removeDetail}
                      />) :
                      [5].includes(parseInt(activeTab.idService)) ?
                        (<AirFreightForm
                          incoterms={incoterm}
                          suppliers={supplier}
                          countries={countries}
                          info={activeTab}
                          controlsData={controlsData}
                          formData={formData}
                          onUpdateFormData={updateFormData}
                          onUpdateServiceFormData={updateServiceFormData}
                          onUpdateServiceDetail={updateServiceDetail}
                          onDuplicateDetail={duplicateDetail}
                          onRemoveDetail={removeDetail}
                        />) :
                        [17].includes(parseInt(activeTab.idService)) ?
                          (<PrevioForm
                            info={activeTab}
                            controlsData={controlsData}
                            formData={formData}
                            onUpdateFormData={updateFormData}
                            onUpdateServiceFormData={updateServiceFormData}
                          />) :
                          <OtherServiceForm
                            incoterms={incoterm}
                            info={activeTab}
                            controlsData={controlsData}
                            formData={formData}
                            onUpdateFormData={updateFormData}
                            onUpdateServiceFormData={updateServiceFormData} />
                  }
                </div>*/}
              </div>
            )}
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionTitleCollapsible}
              onClick={() => toggleSection('expedientes')}>
              <div className={styles.sectionTitleWithDot}>
                <span className={styles.greenDot}></span>
                <span>{t('operations.expedientes')}</span>
              </div>
              {collapsedSections['expedientes'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

          </div>

          <script>

          </script>

        </form>
      </>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('operations.title')}</h1>

        <div className={styles.buttonGroup}>
          <button className={styles.headerButton} onClick={handleNewOperation}>
            <Plus size={20} />
          </button>
          <button className={styles.headerButton} onClick={loadOperations} disabled={loading}>
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <Search size={20} />
          <input
            type="text"
            placeholder={t('operations.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${statusFilter === 'todos' ? styles.filterButtonActive : ''}`}
            onClick={() => setStatusFilter('todos')}
          >
            {t('catalog.filterAll')}
          </button>
          <button
            className={`${styles.filterButton} ${statusFilter === 'activo' ? styles.filterButtonActive : ''}`}
            onClick={() => setStatusFilter('activo')}
          >
            {t('catalog.filterActive')}
          </button>
          <button
            className={`${styles.filterButton} ${statusFilter === 'inactivo' ? styles.filterButtonActive : ''}`}
            onClick={() => setStatusFilter('inactivo')}
          >
            {t('catalog.filterInactive')}
          </button>
        </div>

      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      ) : filteredOperations.length > 0 ? (
        <div className={styles.operationsList}>
          {filteredOperations.map((operation) => (
            <div key={operation.id} className={styles.operationCard}>
              <div className={styles.operationRows}>
                <div className={styles.operationInfo}>
                  <div className={styles.operationNameWrapper}>
                    <span className={styles.reference}>{operation.reference}</span>
                    <h3>{operation.customer.name}</h3>

                  </div>
                </div>

                <div className={styles.operationActions}>
                  <button
                    onClick={() => handleEditOperation(operation)}
                    className={styles.editButton}>
                    <Edit2 size={18} />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.noResults}>{t('catalog.noResults')}</p>
        </div>
      )}
    </div>
  );

}