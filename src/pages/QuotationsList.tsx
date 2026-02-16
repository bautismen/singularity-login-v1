import { useState, useEffect } from 'react';
import { Plus, Edit2, Search, RefreshCw, ChevronDown, FileText, Clock, Filter, FilterXIcon  } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import styles from './QuotationsList.module.css';
import {QuotationRequest} from '../types/requestQuotation';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quotation-requests`;
//const EXECUTIVES_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/executives`;
const USERS_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users`;
const REQUEST_TYPES_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/catalog-request-types`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const PRICING_API_URL = import.meta.env.VITE_PRICING_API_URL;
const API_REQUESTQUOTATION = import.meta.env.VITE_REQUESTQUOTATION;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;
const API_KEYSL = import.meta.env.VITE_APIKEYSL;


interface QuotationsListProps {
  onCreateNew: () => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

export function QuotationsList({ onCreateNew, onEdit, onView }: QuotationsListProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showError } = useNotification();
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [executiveFilter, setExecutiveFilter] = useState<string>('todos');
  const [selectedExecutive, setSelectedExecutive] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [requestTypeFilters, setRequestTypeFilters] = useState<number[]>([]);

  const [users, setUsers] = useState<any[]>([]);
  const [requestTypes, setRequestTypes] = useState<any[]>([]);

  useEffect(() => {
    loadQuotationsRequests();
    loadUsers();
    loadRequestTypes();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [quotations, searchQuery, statusFilter, executiveFilter, selectedExecutive, dateFilter, requestTypeFilters]);
  
  const loadQuotationsRequests = async () => {
    try {
      setLoading(true);      
      const response = await fetch(`${API_REQUESTQUOTATION}/v1/api/quotationrequest/getRecentRequestQuotations?limit=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_TOKENSL}`,
          'Content-Type': 'application/json',
          'x-api-key': API_KEYSL,
        },         

      });
      if (!response.ok) {
        throw new Error('Error al cargar las cotizaciones');
      }
      const data = await response.json();
      console.log(data.data);

      const sortdata = [...data.data].sort((a, b) => {
        if(a.idStatusRequest === 3 && b.idStatusRequest !== 3) return 1; // a va despues de b
        if(a.idStatusRequest !== 3 && b.idStatusRequest === 3) return -1; // a va antes de b
        //(a.deadline_date > b.deadline_date) ? 1 : -1
        const fechafor = formatDate(b.dateDeadline)
        console.log(fechafor); 
        const a_deadline = a.dateDeadline ? new Date(a.dateDeadline).getTime() : Infinity;
        const b_deadline = b.dateDeadline ? new Date(b.dateDeadline).getTime() : Infinity;
        return a_deadline -  b_deadline; //fecha mas antigua va primero 
      }); 

      setQuotations(sortdata);
    } catch (error) {
      console.error('Error loading quotations:', error);
      showError('Error al cargar las cotizaciones' );
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(USERS_API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar ejecutivos');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadRequestTypes = async () => {
    try {
      const response = await fetch(REQUEST_TYPES_API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar tipos de solicitud');
      }

      const data = await response.json();
      setRequestTypes(data);
    } catch (error) {
      console.error('Error loading request types:', error);
    }
  };

  const filterQuotations = () => {
    let filtered = [...quotations];

    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.referenceRequest.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.typeRequest.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter(q => statusFilter.includes(q.idStatusRequest.toString()));      
    }

    if (executiveFilter === 'solo_yo' && user) {
      filtered = filtered.filter(q => q.createdBy?.idEmployee === user._id);
    }

    if (executiveFilter === 'seleccionar' && selectedExecutive) {
      filtered = filtered.filter(q => q.createdBy?.idEmployee === selectedExecutive);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(q => {
        const requestDate = new Date(q.dateRequest);
        const diffDays = Math.ceil((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
        console.log('Filter days: ' , q.referenceRequest , q.dateRequest, diffDays)

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

    if (requestTypeFilters.length > 0) {
      filtered = filtered.filter(q => requestTypeFilters.includes(q.idRequestType));
    }
      
    setFilteredQuotations(filtered);
  };

  const handleResetFilters = () => {
    setStatusFilter([]);
    setExecutiveFilter('todos');
    setSelectedExecutive('');
    setDateFilter('all');
    setRequestTypeFilters([]);
  };

  const handleRequestTypeToggle = (typeId: number) => {
    setRequestTypeFilters(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleRequesStatus = (idStatus: string) => {
    setStatusFilter(prev =>
      prev.includes(idStatus)
        ? prev.filter(id => id !== idStatus)
        : [...prev, idStatus]
    );
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
      'Cotizada': styles.statusCotizada,
      'Nueva': styles.statusNueva,
      'Enviada': styles.statusEnviada,
      'En proceso': styles.statusEnProceso,
      'Rechazada': styles.statusRechazada,
      'Cancelada': styles.statusCancelada,
    };
    return statusClasses[status] || styles.statusNueva;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    console.log('FECHA-',date);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (deadline: string) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className={styles.containerWithSidebar}>
      {showAdvancedFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersPanelHeader}>
            <h3>Refina tu búsqueda</h3>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Estados de Solicitud de Cotización</h4>
            <label className={styles.radioLabel}>
              <input
                type="checkbox"
                value="1"
                checked={statusFilter.includes('1')}
                onChange={(e) => handleRequesStatus(e.target.value)}
              />
              <span>NUEVA</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="checkbox"
                value="2"
                checked={statusFilter.includes('2')}
                onChange={(e) => handleRequesStatus(e.target.value)}
              />
              <span>ENVIADA</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="checkbox"
                value="4"
                checked={statusFilter.includes('4')}
                onChange={(e) => handleRequesStatus(e.target.value)}
              />
              <span>ASIGNADA</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="checkbox"
                value="5"
                checked={statusFilter.includes('5')}
                onChange={(e) => handleRequesStatus(e.target.value)}
              />
              <span>COTIZADA</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="checkbox"
                value="6"
                checked={statusFilter.includes('6')}
                onChange={(e) => handleRequesStatus(e.target.value)}
              />
              <span>DECLINADA</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="checkbox"
                value="3"
                checked={statusFilter.includes('3')}
                onChange={(e) => handleRequesStatus(e.target.value)}
              />
              <span>CANCELADA</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="checkbox"
                value="7"
                checked={statusFilter.includes('7')}
                onChange={(e) => handleRequesStatus(e.target.value)}
              />
              <span>EXPIRADA</span>
            </label>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Ejecutivo solicitante</h4>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="executiveFilter"
                value="todos"
                checked={executiveFilter === 'todos'}
                onChange={(e) => setExecutiveFilter(e.target.value)}
              />
              <span>TODOS</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="executiveFilter"
                value="solo_yo"
                checked={executiveFilter === 'solo_yo'}
                onChange={(e) => setExecutiveFilter(e.target.value)}
              />
              <span>SOLO YO</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="executiveFilter"
                value="seleccionar"
                checked={executiveFilter === 'seleccionar'}
                onChange={(e) => setExecutiveFilter(e.target.value)}
              />
              <span>SELECCIONAR</span>
            </label>
            {executiveFilter === 'seleccionar' && (
              <select
                className={styles.executiveSelect}
                value={selectedExecutive}
                onChange={(e) => setSelectedExecutive(e.target.value)}>
                <option value="">Seleccionar ejecutivo...</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Fecha de creación</h4>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="dateFilter"
                value="hoy"
                checked={dateFilter === 'hoy'}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <span>HOY</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="dateFilter"
                value="ayer"
                checked={dateFilter === 'ayer'}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <span>AYER</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="dateFilter"
                value="menos5"
                checked={dateFilter === 'menos5'}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <span>HACE AL MENOS 5 DÍAS</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="dateFilter"
                value="menos30"
                checked={dateFilter === 'menos30'}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <span>HACE AL MENOS DE 30 DÍAS</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="dateFilter"
                value="menos365"
                checked={dateFilter === 'menos365'}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <span>HACE AL MENOS DE 365 DÍAS</span>
            </label>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Tipo solicitud</h4>
            {requestTypes.map((type) => (
              <label key={type._id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={requestTypeFilters.includes(type._id)}
                  onChange={() => handleRequestTypeToggle(type._id)}
                />
                <span>{type.request_type_name.toUpperCase()}</span>
              </label>
            ))}
          </div>

          <div className={styles.filterActions}>
            <button
              className={styles.resetButton}
              onClick={handleResetFilters}
            >
              Restaurar
            </button>
            <button
              className={styles.applyButton}
              onClick={() => setShowAdvancedFilters(false)}
            >
              Hecho
            </button>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Solicitud de cotizaciones</h1>
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={styles.buttonGroupItem}
            onClick={onCreateNew}
            disabled={loading}
            title="Nueva solicitud">
            <Plus size={20} />
          </button>
          <button
            className={styles.buttonGroupItem}
            onClick={loadQuotationsRequests}
            disabled={loading}
            title="Actualizar">
            <RefreshCw size={20} />
          </button>
          <button
            className={` ${styles.buttonGroupItem} ${!showAdvancedFilters ?  styles.filterDisabled: ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            disabled={loading}
            title="Filtros avanzados">            
            {!showAdvancedFilters ? 
            <Filter size={20} /> : <FilterXIcon size={20} />}
          </button>
          <button
            className={styles.buttonGroupItemLast}
            disabled
            title="Acciones"
          >
            Acciones
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por Referencia, Cliente o Tipo de Solicitud"
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      ) : filteredQuotations.length > 0 ? (
        <div className={styles.cardsGrid}>
          {filteredQuotations.map((quotation) => {
            const daysRemaining = getDaysRemaining(quotation.dateDeadline || '');
            const medalSrc = getCategoryMedal(quotation.customer.customerCategory);
            const totalServices = quotation.services?.length || 0;
            const attendedServices = quotation.services?.filter(s => s.used === true).length || 0;

            return (
              <div key={quotation.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardLeft}>
                    {medalSrc && (
                      <img
                        src={medalSrc}
                        alt="Medal"
                        className={styles.medalImage}
                      />
                    )}
                  </div>

                  <div className={styles.cardMain}>
                    <div className={styles.topRow}>
                      <h3 className={styles.clientName}>
                        {quotation.customer.customerName}
                        {quotation.priority === 1 && (
                          <img
                            src="/prioridad.png"
                            alt="Prioridad"
                            className={styles.priorityIcon}
                          />
                        )}
                      </h3>

                      <div className={styles.rightInfo}>
                        {quotation.services && quotation.services.length > 0 && (
                          <div className={styles.location}>
                            {quotation.services[0].shipments[0].origin?.countryCode || 'NA'} - {quotation.services[0].shipments[0].destination?.countryCode || 'NA'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.middleRow}>
                      <div className={styles.referenceContainer}>
                        <div className={styles.referenceRow}>
                          <FileText size={16} />
                          <span>{quotation.referenceRequest}</span>
                        </div>
                        <button className={`${styles.statusBadge} ${getStatusClass(quotation.statusRequest)}`}>
                          {quotation.statusRequest}
                        </button>
                      </div>

                      <div className={styles.rightInfo}>                        
                        {daysRemaining !== null &&  (                          
                          <div 
                          className={`${styles.dateInfo} ${daysRemaining <= 1 ? styles.dateInfoRed : '' }`}>
                            <Clock size={16} />
                            <span >{daysRemaining}d</span>
                          </div>
                        )}
                        <div className={styles.requestType}>
                          {quotation.typeRequest}
                        </div>
                      </div>
                    </div>

                    <div className={styles.bottomRow}>
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
                        <span>{quotation.createdBy?.nameEmployee || 'Sin asignar'}</span>
                      </div>

                      {totalServices > 0 && (
                        <div className={styles.servicesCounter}>
                          {attendedServices}/{totalServices} Servicios atendidos
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={()=> { 
                      if (quotation.idStatusRequest === 3) {
                        onView(quotation.id)
                      }
                      else {   
                        onEdit(quotation.id)
                      }}}
                    title={t('quote.edit')}
                  >
                    <Edit2 size={18} />
                  </button>
                  {/*<button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => {
                      if (confirm(t('quote.confirmDelete'))) {
                        console.log('eliminar')
                      }
                    }}
                    title={t('quote.delete')}
                  >
                    <Trash2 size={18} />
                  </button>*/}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3>{t('quote.noQuotations')}</h3>
          <p>
            {searchQuery
              ? t('quote.noResultsFilters')
              : t('quote.startNewQuotation')}
          </p>
          <button className={styles.greenButton} onClick={onCreateNew}>
            <Plus size={20} />
            {t('quote.newRequest')}
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
