import { useState, useEffect } from 'react';
import { Search, Plus, Save, Edit2, ChevronDown, ChevronUp, X, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { Operation, Control, Customer, Service, ServiceOperation } from '../types/operations';
import { createOperation, getControls, getOperations, updateOperation } from '../services/operationsService';
import styles from './Operations.module.css';
import { useAuth } from '../contexts/AuthContext';
import { getCustomers } from '../services/customerService';
import { catalogService } from '../services/catalogsService';
import { PricingControl} from '../types/pricingControl';

export default function Operations() {
  const { t } = useLanguage();
  const { showError, showWarning } = useNotification();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [controlsData, setControls] = useState<PricingControl[]>([]);
  const [controlsClient, setControlsClient] = useState<PricingControl[]>([]);
  const [controlsOperation, setControlsOperation] = useState<PricingControl[]>([]);
  const [control, setControl] = useState<PricingControl>();
  const [servicesData, setServices] = useState<Service[]>([]);
  const [service, setService] = useState<Service>();
  const [servicesOperation , setServicesOperation] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    services: false
  });
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    Id: '',
    IdReference: 0,
    Reference: '',
    Customer: {} as Customer,
    Controls: [] as Control[],
    Services: [] as ServiceOperation[],
    OperationStatus: 'Alta referencia' as 'Alta referencia' | 'pending' | 'completed' | 'failed',
    Observations: '',
    ListaParaFacturar: false,
    CreatedAt: new Date,
    CreatedBy: {
      UserId: user?._id || '',
      Name: user?.name || ''
    },
    UpdatedAt: Date,
    UpdateBy: {
      UserId: user?._id || '',
      Name: user?.name || ''
    },
    Status: 1,
    Archived: false,
    DataState: 1,
  });

  //   const handleStatusFilterChange = (status: 'todos' | 'activo' | 'inactivo') => {
  //     setStatusFilter(status);
  //   };

  useEffect(() => {
    loadOperations();
    loadCustomers();
    loadControls();
    loadServices();
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


  function handleNewOperation() {
    setControlsClient([]);
    setControl({} as PricingControl);
    setControlsOperation([]);

    setServicesOperation([]);
    setService({} as Service);

    setEditingOperation(null);

    setFormData({
      Id: '',
      IdReference: 0,
      Reference: '',
      Customer: {} as Customer,
      Controls: [] as Control[],
      Services: [] as ServiceOperation[],
      OperationStatus: 'Alta referencia',
      Observations: '',
      ListaParaFacturar: false,
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

    setIsFormOpen(true);
  }

  function handleEditOperation(operation: Operation) {

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
    const loadedControls = operation.controls.map(c => ({
      _id: c.idControl,
      control: c.control,
      services: operation.services
    }));

    setControlsOperation(loadedControls)

    if (loadedControls.length > 0) {
      setActiveTab(loadedControls[0]._id);
    }

    setFormData({
      Id: operation.id,
      IdReference: operation.idReference,
      Reference: operation.reference,
      Customer: selectedCustomer ? {
        idCustomer: selectedCustomer.id,
        name: selectedCustomer.fiscalData.businessName,
        rfc: selectedCustomer.fiscalData.taxId
      } : operation.customer,
      Controls: loadedControls.map(c => ({
        IdControl: c._id,
        Control: c.control
      })),
      Services: operation.services,
      OperationStatus: operation.operationStatus,
      ListaParaFacturar: operation.listaparafacturar || false,
      Observations: operation.observations || '',
      CreatedAt: operation.createdAt,
      CreatedBy: operation.createdBy,
      UpdatedAt: Date,
      UpdateBy: {
        UserId: user?._id || '',
        Name: user?.name || ''
      },
      Status: operation.status,
      Archived: operation.archived,
      DataState: operation.dataState,
    });

    setIsFormOpen(true);
  
  }

  function handleCustomerChange(selectedCustomerId: string) {
    
    setControl({} as PricingControl);
    setControlsOperation([]);

    setServicesOperation([]);
    setService({} as Service);

    setEditingOperation(null);

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    if (!selectedCustomer) {
      setFormData({
        ...formData,
          Id: '',
          IdReference: 0,
          Reference: '',
          Customer: {} as Customer,
          Controls: [] as Control[],
          Services: [] as ServiceOperation[],
          OperationStatus: 'Alta referencia',
          Observations: '',
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

    setFormData({
      ...formData,
      Customer: {
        IdCustomer: selectedCustomer.id,
        Name: selectedCustomer.fiscalData.businessName,
        RFC: selectedCustomer.fiscalData.taxId
      },
    });

    const controlsClient = controlsData.filter(control => {
      return control.id_customer === selectedCustomer.id;
    });

    setControlsClient(controlsClient);

  }; 

  const addControl = () => {  
    
    if (control === undefined || control._id === undefined ||
        control._id === '' || control.control === '' ) {
      showWarning(t('operations.selectControlWarning'));
      return;
    }
    
    if (controlsOperation?.some(c => c._id === control?._id)) {
      showError(t('operations.alreadyadded'));    
      return;
    }   
    
    setFormData({
        ...formData,
        Controls: [
          ...formData.Controls || [], {
            IdControl: control._id,
            Control: control.control
          }
        ] as Control[]

      }); 

    setControlsOperation(prev => [
      ...prev,
      {
        _id: control._id,
        control: control.control,
        services: control.services
      }
    ]);
    
    // Quitamos el control seleccionado de la lista de controles disponibles para el cliente
    setControlsClient(prev =>
      prev.filter(c => c.id !== control._id)
    );

    if (!activeTab) {
    setActiveTab(control._id);

    loadInfoControl(control._id, 1);
    }

  };

  const removeControl = (_idcontrol: string, item: number) => {  
    
    const updated = formData.Controls.filter((control: any) => control._id !== _idcontrol );

    setFormData({ 
      ...formData, 
      Controls: updated 
    });

    controlsClient.push(controlsOperation.find(c => c._id === _idcontrol) as PricingControl); // Volver a agregar el control eliminado a la lista de controles disponibles para el cliente

    // Eliminar el control seleccionado de la lista de controles asociados a la operación
    setControlsOperation(co =>
      co.filter(c => c._id !== idcontrol && c.services.idServiceItem !== item )
    );

  };

  const addService = () => {

    if (service === undefined || service._id === undefined ||
        service._id === '' || service.service_name === '' ) {
      showWarning(t('operations.selectServiceWarning'));
      return;
    }

    if (servicesOperation?.some(s => s._id === service._id)) {
      showError(t('operations.alreadyadded'));    
      return;
    }

    setServicesOperation([
      ...servicesOperation, {
        _id: service._id,
        service_name: service.service_name
      }
    ] as Service[]);

    if (!activeTab) {
      setActiveTab(service._id);

    }

  };

  const removeService = (_idservice: number) => {  
    
    setServicesOperation(servicesOperation.filter(s => s._id !== _idservice));  // Eliminar el servicio seleccionado de la lista de servicios asociados a la operación
    
    // controlsClient.push(controlsOperation.find(c => c._id === _idcontrol) as PricingControl); // Volver a agregar el control eliminado a la lista de controles disponibles para el cliente
  };

  const loadInfoControl = (controlId: string, itemId: number) => {
    const controlServices = controlsData.filter(c => c.id === controlId);

    if (controlServices) {
      return (
        <div className={styles.serviceHeader}>
          {controlServices.map(controlservice => (
            <span key={controlservice.id} className={styles.serviceItem}>
              <h3 className='title'>
                {controlservice.control}
              </h3>
              {controlservice.services.map(serv => (
                <span key={serv.idServiceItem} className={styles.serviceItem}>
                  <label className={styles.fieldLabel}>
                    Servicio
                    <input
                      type="text"
                      value={serv.nameService}
                      readOnly
                      className={styles.textInput}
                    />
                  </label>

                </span>


              ))}

            </span>
          ))}
        </div>

      
      // <div className={styles.formRow}>
      //   <div className={styles.fieldGroup}>
      //     <div className={styles.servicesList}>
      //       {controlServices.map(service => (
      //         <span key={service.id} className={styles.serviceItem}>
      //           <label className={styles.fieldLabel}>
      //             {service.control}
      //           </label>
      //           {service.services.map(serv => (
      //             <span key={serv.idService} className={styles.serviceItem}>
      //               <label className={styles.fieldLabel}>
      //                   Servicio
      //                   <input 
      //                     type="text" 
      //                     value={serv.nameService}
      //                     readOnly
      //                     className={styles.textInput}
      //                   />
      //               </label>
                     
      //             </span>


      //           ))} 

      //         </span>
      //       ))}
      //     </div>
      //   </div>

      // </div>

      )

    }

    toggleSection('services')
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
      try {

        setLoading(true);
        e.preventDefault();
  
        const dataToSave = {
          ...formData,
          UpdatedAt: null,
          UpdateBy: {},
          Status: 1,
          Archived: false,
          DataState: 1,
        };
  
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

  if (isFormOpen) {
    return (
      <>
        <form onSubmit={handleSaveOperation} className={styles.formContainer}>

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
            </div>
          </div>

          {/* Datos generales */}
          <div className={styles.sectionCard}>

            <div className={styles.sectionTitle}>
              {t('operations.generalData')}
            </div>

            <div className={styles.twoColumnGrid}>

              <div className={styles.leftColumn}>

                {/* Referencia */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="reference" className={styles.fieldLabel}>
                    {t('operations.reference')}
                  </label>
                  <input
                    type="text"
                    id="reference"
                    name="reference"
                    value={formData.Reference}
                    onChange={(e) => setFormData({ ...formData, Reference: e.target.value })}
                    className={styles.textInput}
                    placeholder={`ATV${new Date().getFullYear().toString().slice(-2)}-00000`}
                    disabled
                  />
                </div>

                {/* Controles */}
                <div className={styles.fieldGroup}>
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

                          setControl({
                            ...control,
                            _id: dataC.id,
                            control: dataC.control,
                            services: dataC.services,
                            suppliers: dataC.suppliers
                          })
                        }}
                      // multiple
                      >
                        <option className="bg-white text-black dark:bg-[#1e293b] dark:text-white appearance-none" value="">
                          {t('operations.selectControl')}
                        </option>
                        {controlsClient.map(control => (
                          <option className="bg-white text-black dark:bg-[#1e293b] dark:text-white appearance-none" 
                            key={control.id} 
                            value={JSON.stringify({
                              id: control.id, 
                              control: control.control,
                              services: control.services,
                              suppliers: control.suppliers
                            })}>
                            {control.control}
                          </option>
                        ))} {/* Controles relacionados al cliente */}
                      </select>
                      <button type="button"
                        className={styles.btnAddSearch}
                        onClick={addControl}
                        disabled={loading || disabled}
                      >
                        <Plus size={16} />
                        {/* {t('operations.addControl')} */}
                      </button>
                    </div>

                    <div className="p-2 flex flex-wrap gap-2 min-h-[120px] content-start">
                      {controlsOperation.length > 0 ? (
                        controlsOperation?.map(controlService => (
                          controlService.services?.map(service => (

                            <span key={`${controlService._id}-${service.idServiceItem}`} 
                            className="border border-[#14b8a6] bg-transparent rounded-full
                                       flex items-center gap-1 px-3 py-1 text-xs
                                       dark:bg-[#374151] dark:text-white"
                          >
                            {controlService.control}-{service.nameService}
                            <button
                              type="button"
                              value={controlService.idcontrol}
                              className="ml-1 text-gray-500 hover:text-red-500 dark:text-gray-300"
                              onClick={() => { removeControl(controlService._id as string, service.idServiceItem as number) }}
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

              <div className={styles.rightColumn}>
                
                {/* Cliente */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="customer" className={styles.fieldLabel}>
                    {t('operations.customer')}
                  </label>
                  <select
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
                  </select>
                </div>

                {/* Servicios */}
                <div className={styles.fieldGroup}>

                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-surface-container-low">
                    <label className="block font-label-caps text-label-caps text-primary px-3 py-2 dark:text-white">
                      {t('operations.services')}
                    </label>

                    <div className="bg-surface-container-low border-b dark:border-gray-600 border-outline-variant p-2 flex items-center gap-2">
                      <select
                        className="min-h-[30px] w-full p-2 rounded-lg bg-transparent text-black dark:text-white
                                     border border-gray-300 dark:border-gray-700 
                                     hover:border-[#14b8a6] hover:dark:border-[#14b8a6] 
                                     focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]
                                     outline-none appearance-none text-body-sm transition-colors"
                        onChange={(e) =>
                          setService({
                            ...service,
                            _id: e.target.value,
                            service_name: e.target.options[e.target.selectedIndex].text
                          })}
                      >
                        <option className="bg-white text-black dark:bg-[#1e293b] dark:text-white appearance-none" value="">
                          {t('operations.selectService')}
                        </option>
                        {servicesData.map(service => (
                          <option className="bg-white text-black dark:bg-[#1e293b] dark:text-white appearance-none"
                            key={service._Id} value={service._Id}>
                            {service.service_name}
                          </option>
                        ))}  {/* Servicios relacionados a la operación */}
                      </select>
                      <button type="button"
                        className={styles.btnAddSearch}
                        onClick={addService}
                        disabled={loading || disabled}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  
                    <div className="p-2 flex flex-wrap gap-2 min-h-[120px] content-start">
                      {servicesOperation.length > 0 ? (
                        servicesOperation?.map(service => (
                          <span key={service._id}
                            className="border border-[#14b8a6] bg-transparent rounded-full
                                       flex items-center gap-1 px-3 py-1 text-xs
                                       dark:bg-[#374151] dark:text-white"
                          >
                            {service.service_name}
                            <button
                              type="button"
                              value={service._id}
                              className="ml-1 text-gray-500 hover:text-red-500 dark:text-gray-300"
                              onClick={() => { removeService(service._id) }}
                            >
                              ✕
                            </button>
                          </span>
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

            {/* Observaciones*/}
            <div className="bg-surface-container-low px-6 -mt-10 -mb-3 py-5">
              <label htmlFor="observations" className="block font-label-caps text-label-caps text-primary px-1 py-2 dark:text-white">
                {t('operations.observations')}
              </label>
              <input
                type="text"
                id="observations"
                name="observations"
                value={formData.Observations}
                onChange={(e) => setFormData({ ...formData, Observations: e.target.value })}
                className="min-h-[30px] w-full p-2 rounded-lg
                           bg-transparent text-black dark:text-white
                           border border-gray-300 dark:border-gray-700
                           hover:border-[#14b8a6] hover:dark:border-[#14b8a6] 
                           focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]
                           outline-none appearance-none text-body-sm transition-colors"
              />
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
                        onChange={(e) => setFormData({
                          ...formData,
                          ListaParaFacturar: e.target.checked ? true : false
                        })}
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
                        onChange={(e) => setFormData({
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
          
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>{t("operations.services")}</h2>
            
            <div className={styles.serviceSpace}>
              <div className="border-b border-outline-variant flex items-center justify-between mb-4">
                
                {/* Tabs */}
                <div className="flex">
                  
                  {controlsOperation.length > 0 ? (
                    controlsOperation?.map(controlService => (
                      controlService.services?.map(service => (

                        // <div key={`${controlService._id}-${service.idServiceItem}`}
                        //   onClick={() =>(`${controlService._id}-${service.idServiceItem}`)
                        //   }
                        //   className={
                        //     activeTab === controlService._id
                        //       ? "px-6 py-2 border-b-2 border-primary text-primary dark:text-white font-bold text-sm"
                        //       : "px-6 py-2 text-secondary font-medium text-sm hover:text-primary dark:text-white transition-colors"
                        //   }
                        // >
                        //   {controlService.control}-{service.nameService}
                        // </div>

                        <div
                          className={`${styles.tabItem} ${activeTab === service.idService ? styles.active : ''}`}
                          onClick={() => setActiveTab(service.idService)}
                        >
                          {controlService.control}-{service.nameService}
                        </div>

                      ))
                    ))
                  ) : (
                    <span className=''></span>
                  )
                  }
                </div>

                {/* <button className="text-primary hover:bg-surface-container-low rounded-full p-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
                </button> */}
              </div>

              {activeTab === 'MARITIMO' && (
                <div className={styles.tableWrapper}>
                  <h3>{t('tvf.MaritimeConcepts')}</h3>
                  <table className={`${styles.table} ${styles.tableConceptsMaritime}`}>
                    <thead>
                      <tr>
                        <th>{t('tvf.Charge')}</th>
                        <th>{t('tvf.Concept')}</th>
                        <th>{t('tvf.Base')}</th>
                        <th>{t('tvf.Container')}</th>
                        <th>{t('tvf.Unit')}</th>
                        <th>{t('tvf.Subtotal')}</th>
                        <th>{t('tvf.VAT')}</th>
                        <th>{t('tvf.Total')}</th>
                        <th>{t('tvf.Actions')}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {maritimeConcepts.length === 0 ? (
                        <tr>
                          <td colSpan={9} className={styles.emptyCell}>
                            <span className={styles.emptyText}>
                              {t('tvf.SinConceptos')}
                            </span>
                          </td>
                        </tr>
                      ) : (
                        maritimeConcepts.map((row, index) => (
                          <tr key={row.id}>

                            {/* CHARGE */}
                            <td>
                              <select
                                className={styles.selectCargo}
                                value={row._id_type_of_charge ?? ""}
                                onChange={(e) => {
                                  const selectedId = Number(e.target.value);
                                  const selectedText =
                                    e.target.options[e.target.selectedIndex].text;

                                  handleChange(index, '_id_type_of_charge', selectedId);

                                  handleChange(index, 'type_of_charge', selectedText);

                                }}
                              >
                                <option value="">{t('tvf.Elegir')}</option>
                                {charges.map((c: any) => (
                                  <option key={c._IdCharge} value={c._IdCharge}>
                                    {c.chargeName}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* CONCEPT */}
                            <td>
                              <input
                                className={styles.inputConcept}
                                value={row.concept}
                                onChange={(e) => handleChange(index, 'concept', e.target.value)}
                              />
                            </td>

                            {/* BASE */}
                            <td>
                              <input
                                className={styles.inputBase}
                                value={row.billing_base ?? ""}
                                onChange={(e) => handleChange(index, 'billing_base', e.target.value)}
                              />
                            </td>

                            {/* CONTAINER */}
                            <td>
                              <input
                                list={`containers-${index}`}
                                className={styles.selectContainer}
                                value={row.container_type ?? ""}
                                onChange={(e) => handleChange(index, 'container_type', e.target.value)}
                                onBlur={(e) => {
                                  const value = e.target.value;
                                  const exists = containers.some(
                                    (c: any) => c.name_type === value
                                  );

                                  if (!exists) {
                                    handleChange(index, 'container_type', '');
                                  }
                                }}
                                placeholder={t('tvf.ElegirContenedor')}
                              />
                              <datalist id={`containers-${index}`}>
                                {containers.map((c: any) => (
                                  <option key={c.id_container} value={c.name_type} />
                                ))}
                              </datalist>
                            </td>

                            {/* UNIT */}
                            <td>
                              <input
                                className={styles.inputUnit}
                                value={row.unit}
                                onChange={(e) => handleChange(index, 'unit', e.target.value)}
                              />
                            </td>
                            {/* SUBTOTAL */}
                            <td>
                              <input
                                className={styles.inputSubtotal}
                                value={row.subtotal}
                                onChange={(e) => handleChange(index, 'subtotal', e.target.value)}
                              />
                            </td>
                            {/* VAT */}
                            <td>
                              <select
                                className={styles.selectIVA}
                                value={row.vat}
                                onChange={(e) => {
                                  const selectedVat = VAT_OPTIONS.find(
                                    v => String(v.value) === e.target.value
                                  );

                                  handleChange(index, 'vat', selectedVat?.value ?? -1);
                                  handleChange(index, 'rate', selectedVat?.rate ?? 0);
                                }}
                              >
                                {VAT_OPTIONS.map((v) => (
                                  <option key={v.label} value={v.value}>
                                    {v.label}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* TOTAL */}
                            <td>
                              ${Number(row.total || 0).toFixed(2)}
                            </td>

                            {/* ACTIONS */}
                            <td>
                              <button
                                className={styles.duplicateBtn}
                                onClick={() => {
                                  const copy = { ...row, id: Date.now() };
                                  setMaritimeConcepts([...maritimeConcepts, copy]);
                                }}
                              >
                                <Copy size={16} />
                              </button>
                              {/*    
                                                  <button
                                                  className={styles.editBtn}
                                                  onClick={() => {
                                                      const updated = [...maritimeConcepts];
                                                      updated[index].isEditing = !updated[index].isEditing;
                                                      setMaritimeConcepts(updated);
                                                  }}
                                                  >
                                                  <Pencil size={16} />
                                                  </button>
                                                  */}
                              <button
                                className={styles.deleteBtn}
                                onClick={() => {
                                  setMaritimeConcepts(maritimeConcepts.filter((_, i) => i !== index));
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <button className={styles.addBtn} onClick={handleAddConcept}>
                    <PlusCircle size={16} />
                    {t('tvf.AddNewConcept')}
                  </button>
                </div>
              )}

            </div>
              
          </div>
          

          <div className={styles.sectionCard}>
            <div className={styles.sectionTitleCollapsible}
              onClick={() => toggleSection('references')}>
              <div className={styles.sectionTitleWithDot}>
                <span className={styles.greenDot}></span>
                <span>{t('operations.services')}</span>
              </div>
              {collapsedSections['services'] ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </div>

            {/*
            {collapsedSections['services'] && controlsOperation.length > 0 ? (
              <div className={styles.sectionContent}>

                {loadInfoControl(control?._id as string)}
                
              </div>
            ) : (
              <span>  </span>
            )} 

            {collapsedSections['services'] && servicesOperation.length > 0 ? (
              <div className={styles.sectionContent}>
                <button
                  type="button"
                  onClick={addServiceOperation} className={styles.addDashedButton}>
                  <Plus size={20} />
                  {t('supp.addServiceOperation')}
                </button>


              </div>
            ) : (
              <span>  </span>
            )} */}

          </div> 

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