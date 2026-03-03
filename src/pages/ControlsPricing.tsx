import { useState, useEffect, useRef  } from 'react';
import { RefreshCw, Filter, ChevronDown, Search, Clock, Plus, FilterXIcon, FileText, ChevronUp  } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { controlsPricingService } from '../services/controlsPricingService';
import { ResquetQuote } from '../types/pricingControl';
import { ControlsPricingForm } from './ControlsPricingForm';
import { useAuth } from '../contexts/AuthContext';
import { DocumentsModal } from '../components/DocumentsModal';
import styles from './ControlsPricing.module.css';

export function ControlsPricing() {
  const { t } = useLanguage();
  const { showInfo, showError, showWarning} = useNotification();
  const [requests, setRequests] = useState<ResquetQuote[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ResquetQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  const { user } = useAuth();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isOpenFecha, setIsOpenFecha] = useState(false);
  const [isOpenEjecutivo, setIsOpenEjecutivo] = useState(false);
  const contentRefFecha = useRef(null);
  const contentRefEjecutivo = useRef(null);

  const [dateFilter, setDateFilter] = useState<string>('all');
  const [executiveFilter, setExecutiveFilter] = useState<string>('todos');
  const [selectedExecutive, setSelectedExecutive] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedRequestForDocs, setSelectedRequestForDocs] = useState<ResquetQuote | null>(null);

  useEffect(() => {
    loadRequests();
    loadUsers();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery,dateFilter, executiveFilter,selectedExecutive]);

  const loadUsers = async () => {
    try {
       //setLoading(true);
       const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const BASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const [ executivesRes] = await Promise.all([       
        fetch(`${BASE_URL}/functions/v1/executives?departamento=Pricing`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        }),        
      ]);

      if (!executivesRes.ok) {
        throw new Error('Error al cargar ejecutivos');
      }

      const data = await executivesRes.json();      
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
    finally {
      //setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await controlsPricingService.getAll();
      if (data.message ===  t('ctrlpricing.norequests')) {
        showInfo(data.message);
        return;
      }
      let filtered = [...data.data].sort((a, b) => {

        const hasControl = item =>
          item.assignedTo?.some(x => x.pricingControlNumbers?.length > 0) ? 1 : 0;

        const rank = item =>
          (hasControl(item) * 2) + (item.priority ? 0 : 1);        

        // 2️⃣ Ordenar por idStatusRequest ASCENDENTE
        const statusCompare = a.idStatusRequest - b.idStatusRequest;
        if (statusCompare !== 0) return statusCompare;       

        // 1️⃣ Ordenar por diferencia de días (más cercano a 0 primero)
        const daysA = getDaysElapsed(a.deadlineDate);
        const daysB = getDaysElapsed(b.deadlineDate);

        // Si alguno es null lo mandamos al final
        if (daysA === null) return 1;
        if (daysB === null) return -1;

        const daysCompare = Math.abs(daysA) - Math.abs(daysB);
        if (daysCompare !== 0) return daysCompare;

         // 3️⃣ Luego aplicar tu orden principal
        return rank(a) - rank(b);

      });
      const excludedEmails = [
        "maria.cervantes@kromlogistica.com",
        "estela.guerrero@kromlogistica.com",
        "magali.tamayo@kromlogistica.com",        
        "guadalupe.dimas@kromlogistica.com"        
      ];

      if (!excludedEmails.includes(user.email)) {
        filtered = filtered.filter(r =>
          r.assignedTo?.some(a => a.idUser === user._id)
        );
      }
      setRequests(filtered);
    } catch (error) {
      console.error('Error loading requests:', error);
      showError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddControl = (requestId: string) => {
    const re = requests.find(r => r.id === requestId);
    if (re?.assignedTo?.some(a => a.idUser === user._id)) {
      setSelectedRequestId(requestId);
      setSelectedControlId(null);
      setShowForm(true);
    } else {
      showWarning('El usuario no es el ejecutivo asignado a la solicitud, no puede agregar controles');
    }
  };

  const handleEditControl = (requestId: string, controlId: string) => {
    setSelectedRequestId(requestId);
    setSelectedControlId(controlId);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setSelectedRequestId(null);
    setSelectedControlId(null);
    loadRequests();
  };

  const handleOpenDocuments = (request: ResquetQuote) => {
    setSelectedRequestForDocs(request);
    setShowDocumentsModal(true);
  };

  const handleCloseDocuments = () => {
    setShowDocumentsModal(false);
    setSelectedRequestForDocs(null);
  };

  if (showForm) {
    return <ControlsPricingForm requestId={selectedRequestId} controlId={selectedControlId} onBack={handleBackToList} />;
  }

  const filterRequests = () => {
    let filtered = [...requests];

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.referenceRequest?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customer?.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.assignedTo.some(assigned => assigned.pricingControlNumbers?.some(controlNumber => controlNumber?.control?.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(q => {
        //const requestDate = new Date(q.dateRequest);
        const requestDate = new Date(q.dateRequest.substring(0, 10)+ "T00:00:00");
        now.setHours(0, 0, 0, 0);
        requestDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
        //console.log('Filter days: ' , q.referenceRequest , q.dateRequest, diffDays)

        switch (dateFilter) {
          case 'hoy':
            return diffDays === 0;
          case 'ayer':
            return diffDays === 1;
          case 'menos5':
            return diffDays <= 5;
          case 'menos30':
            return diffDays <= 30;
          case 'menos365':
            return diffDays <= 365;
          default:
            return true;
        }
      });
    }

    if (executiveFilter === 'solo_yo' && user) {
      filtered = filtered.filter(q => 
        q.assignedTo?.some(a => a.idUser === user._id)
      );     
    }

    if (executiveFilter === t('ctrlpricing.select') && selectedExecutive) {
      filtered = filtered.filter(r =>
          r.assignedTo?.some(a => a.idExecutive === selectedExecutive)
        );      
    }


    setFilteredRequests(filtered);
  };

  const getCategoryMedal = (category: number) => {
    switch (category) {
      case 1:
        return '/gold.png';
      case 2:
        return '/silver.png';
      case 3:
        return '/bronze.png';
      default:
        return '';
    }
  };

  const getStatusClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      'Asignada': styles.statusAsignada,
      'Cotizada': styles.statusCotizada,
      'Creada': styles.statusNueva,
      'Enviada': styles.statusEnviada,
      'Expirada': styles.statusExpirada,
      'En proceso': styles.statusEnProceso,
      'Rechazada': styles.statusExpirada,
      'Cancelada': styles.statusExpirada,
      'Declinada': styles.statusExpirada,
      'Parcialmente Cotizada': styles.statusParcialmentecotizada
    };
    return statusClasses[status] || styles.statusNueva;
  };

  const getDaysElapsed = (date: string) => {
     if (!date) return null;
    const now = new Date();    
    const deadlineDate = new Date(date.substring(0, 10)+ "T00:00:00");
    now.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getOperationType = (services: any[]) => {
    if (!services || services.length === 0) return '';
    return services[0].shipments[0].typeOperation === 1 ? 'importación' : 'exportación';
  };

  const getCountries = (services: any[]) => {
    if (!services || services.length === 0) return '';
    const origin = services[0].shipments[0].origin?.countryCode || 'NA';
    const destination = services[0].shipments[0]?.destination?.countryCode || 'NA';
    return `${origin} - ${destination}`;
  };

  const getTotalServicesCount = (services: any[]) => {
    return services?.length || 0;
  };

  const getAttendedServicesCount = (services: any[]) => {
    if (!services || services.length === 0) return 0;
    return services.filter(service => service.used === true).length;
  };

    const handleResetFilters = () => {      
    setDateFilter('all');
    setExecutiveFilter('todos');
    setSelectedExecutive('');
  };

  return (
    <div className={styles.containerWithSidebar}>
      {showAdvancedFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersPanelHeader}>
            <h3>{t('ctrlpricing.refineSearch')}</h3>
          </div>          

          <div className={styles.filterSection}>
            <div className={styles.headerRow}>
              <h4 className={styles.filterTitle}>{t('ctrlpricing.requestdate')}</h4>
              <button onClick={() => setIsOpenFecha(!isOpenFecha)} className={styles.iconbutonlucide}>
              {isOpenFecha ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            <div
              ref={contentRefFecha}
              style={{
                maxHeight: isOpenFecha
                  ? contentRefFecha.current?.scrollHeight + "px"
                  : "0px",
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}
            >            
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="dateFilter"
                    value="hoy"
                    checked={dateFilter === 'hoy'}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  <span>{t('ctrlpricing.today')}</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="dateFilter"
                    value="ayer"
                    checked={dateFilter === 'ayer'}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  <span>{t('ctrlpricing.yesterday')}</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="dateFilter"
                    value="menos5"
                    checked={dateFilter === 'menos5'}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  <span>{t('ctrlpricing.less5days')}</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="dateFilter"
                    value="menos30"
                    checked={dateFilter === 'menos30'}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  <span>{t('ctrlpricing.less30days')}</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="dateFilter"
                    value="menos365"
                    checked={dateFilter === 'menos365'}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  <span>{t('ctrlpricing.less365days')}</span>
                </label>
            </div>
          </div>

            <div className={styles.filterSection}>
            <div className={styles.headerRow}>
              <h4 className={styles.filterTitle}>{t('ctrlpricing.assignedexecutive')}</h4>
               <button onClick={() => setIsOpenEjecutivo(!isOpenEjecutivo)} className={styles.iconbutonlucide}>
                {isOpenEjecutivo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            <div
              ref={contentRefEjecutivo}
              style={{
                maxHeight: isOpenEjecutivo
                  ? contentRefEjecutivo.current?.scrollHeight + "px"
                  : "0px",
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}
            >   
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="executiveFilter"
                  value="todos"
                  checked={executiveFilter === 'todos'}
                  onChange={(e) => setExecutiveFilter(e.target.value)}
                />
                <span>{t('ctrlpricing.all')}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="executiveFilter"
                  value="solo_yo"
                  checked={executiveFilter === 'solo_yo'}
                  onChange={(e) => setExecutiveFilter(e.target.value)}
                />
                <span>{t('ctrlpricing.onlyme')}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="executiveFilter"
                  value={t('ctrlpricing.select')}
                  checked={executiveFilter === t('ctrlpricing.select')}
                  onChange={(e) => setExecutiveFilter(e.target.value)}
                />
                <span>{t('ctrlpricing.select')}</span>
              </label>
              {executiveFilter === t('ctrlpricing.select') && (
                <select
                  className={styles.executiveSelect}
                  value={selectedExecutive}
                  onChange={(e) => setSelectedExecutive(e.target.value)}>
                  <option value="">{t('ctrlpricing.selectexecutive')}</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.nombre + ' ' + user.apellido_paterno + ' ' + user.apellido_materno}
                    </option>
                  ))}
                </select>
              )}
              </div>
          </div>          

          <div className={styles.filterActions}>
            <button
              className={styles.resetButton}
              onClick={handleResetFilters}
            >
              {t('filter.restore')}
            </button>
            <button
              className={styles.applyButton}
              onClick={() => setShowAdvancedFilters(false)}
            >
              {t('filter.done')}
            </button>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('ctrlpricing.title')}</h1>
          <div className={styles.buttonGroup}>
            <button
              className={styles.headerButton}
              onClick={loadRequests}
              disabled={loading}
              title={t('ctrlpricing.refresh')}
            >
              <RefreshCw size={20} />
            </button>
            <button
            className={` ${styles.headerButton} ${!showAdvancedFilters ?  styles.filterDisabled: ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            disabled={loading}
            title={t('ctrlpricing.filtro')}>            
            {!showAdvancedFilters ? <Filter size={20} /> : <FilterXIcon className='text-slate-400' size={20} />}
          </button>           
            {/*<button
              className={styles.headerButtonAction}
              disabled             
              title={t('ctrlpricing.actions')}
            >
              {t('ctrlpricing.actions')}
              <ChevronDown size={18} />
            </button>*/}
          </div>
        </div>

        <div className={styles.searchBar}>
          <Search size={20} />
          <input
            type="text"
            placeholder={t('ctrlpricing.search')}
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
          ) : filteredRequests.length > 0 ? (
          <div className={styles.cardsGrid}>
            {filteredRequests.map((request) => {
              const daysElapsed = getDaysElapsed(request.dateDeadline);
              const medalSrc = getCategoryMedal(request.customer?.customerCategory);
              const categoryLabel = request.typeRequest;
              const operationType = getOperationType(request.services);
              const countries = getCountries(request.services);
              const totalServices = getTotalServicesCount(request.services);
              const attendedServices = getAttendedServicesCount(request.services);              
              const assignedWithControls = request.assignedTo?.filter(
                assigned => assigned.pricingControlNumbers && assigned.pricingControlNumbers.length > 0
              ) || [];
              const isDisabled = totalServices === attendedServices ? true : false;

              return (
                <div key={request.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      {medalSrc && (
                        <img
                          src={medalSrc}
                          alt="Medal"
                          className={styles.medalImage}
                        />
                      )}
                      <div className={styles.companyInfo}>
                        <div className={styles.companyNameRow}>
                          <h3 className={styles.companyName}>
                            {request.customer?.customerName}
                          </h3>
                          {request.priority === 1 && (
                            <img
                              src="/prioridad.png"
                              alt="Prioridad"
                              className={styles.priorityIcon}
                            />
                          )}
                        </div>
                        <div className={styles.referenceRow}>
                          <span className={styles.referenceNumber}>{request.referenceRequest}</span>
                          <span className={`${styles.statusBadge} ${getStatusClass(request.statusRequest)}`}>
                            {request.statusRequest}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardHeaderRight}>
                      <div className={styles.countries}>{countries}</div>
                      <div className={styles.category}>{categoryLabel}</div>
                      {daysElapsed !== null &&  (                          
                          <div className={`${styles.dateInfo} ${daysElapsed <= 1 ? styles.dateInfoRed : '' }`}>
                            <Clock size={16} />
                            <span >{daysElapsed}d</span>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className={styles.executiveRow}>
                    <div className={styles.executiveInfo}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>{request.createdBy?.fullName || t('ctrlpricing.unassigned')}</span>
                    </div>
                    <div className={styles.servicesCounter}>
                      {(request.statusRequest === 'Parcialmente cotizada' || request.statusRequest === 'Cotizada') && (
                        <button
                          className={styles.documentsButton}
                          onClick={() => handleOpenDocuments(request)}
                          title="Ver documentos"
                        >
                          <FileText size={16} />
                          {t('ctrlpricing.documents')}
                        </button>
                      )}
                      {attendedServices}/{totalServices} {t('ctrlpricing.servicesattended')}
                    </div>
                  </div>

                  {assignedWithControls.length > 0 && (
                    <div className={styles.controlNumbers}>
                      {assignedWithControls.map((assigned, index) => (
                        <div key={index} className={styles.controlNumberItem}>
                          <div className={styles.controlNumberLeft}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={styles.dottedCircleIcon}
                            >
                              <circle cx="12" cy="12" r="10" strokeDasharray="2,2"></circle>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span className={styles.assignedName}>{assigned.fullName}</span>
                          </div>
                          <div className={styles.controlNumberCenter}>
                            {assigned.pricingControlNumbers.map((control, controlIndex) => (
                              <button
                                key={controlIndex}
                                className={styles.controlCode}
                                onClick={() => handleEditControl(request.id, control.idPricingControl)}
                              >
                                {control.control}
                              </button>
                            ))}
                          </div>                       
                        </div>
                      ))}
                    </div>
                  )}

                  <button hidden ={isDisabled}
                    className={styles.addControlButton}
                    onClick={() => handleAddControl(String(request.id))}
                  >
                    <Plus size={16} />
                    {t('ctrlpricing.addcontrol')}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>{t('ctrlpricing.norequests')}</h3>
            <p>
              {searchQuery
                ? t('ctrlpricing.noresults')
                : t('ctrlpricing.noresultsstatus')}
            </p>
          </div>
        )}
      </div>

      {showDocumentsModal && selectedRequestForDocs && (
        <DocumentsModal
          isOpen={showDocumentsModal}
          onClose={handleCloseDocuments}
          requestData={{
            companyName: selectedRequestForDocs.customerName,
            reference: selectedRequestForDocs.referenceRequest,
            location: getCountries(selectedRequestForDocs.services),
          }}
        />
      )}
    </div>
  );
}
