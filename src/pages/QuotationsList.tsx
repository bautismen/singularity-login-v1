import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, RefreshCw, ChevronDown, FileText, Calendar, Clock, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import styles from './QuotationsList.module.css';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quotation-requests`;
const EXECUTIVES_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/executives`;
const REQUEST_TYPES_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/catalog-request-types`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface QuotationRequest {
  _id: string;
  reference_request: string;
  priority: number;
  customer_category: number;
  _id_status_request: number;
  status_request_name: string;
  request_date: string;
  deadline_date: string;
  _id_request_type: number;
  request_type_name: string;
  customer_business_name: string;
  licitation: boolean;
  requesting_data: {
    _id_executive: string;
    complete_name: string;
  };
  services: any[];
}

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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [operationType, setOperationType] = useState<string>('all');
  const [executiveFilter, setExecutiveFilter] = useState<string>('todos');
  const [selectedExecutive, setSelectedExecutive] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [requestTypeFilters, setRequestTypeFilters] = useState<number[]>([]);

  const [executives, setExecutives] = useState<any[]>([]);
  const [requestTypes, setRequestTypes] = useState<any[]>([]);

  useEffect(() => {
    loadQuotations();
    loadExecutives();
    loadRequestTypes();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [quotations, searchQuery, statusFilter, operationType, executiveFilter, selectedExecutive, dateFilter, requestTypeFilters]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar las cotizaciones');
      }

      const data = await response.json();
      setQuotations(data);
    } catch (error) {
      console.error('Error loading quotations:', error);
      showError('Error al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadExecutives = async () => {
    try {
      const response = await fetch(EXECUTIVES_API_URL, {
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
      console.log(data)
      setExecutives(data);
    } catch (error) {
      console.error('Error loading executives:', error);
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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status_request_name === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.reference_request.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customer_business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.request_type_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (operationType !== 'all') {
      filtered = filtered.filter(q => {
        if (!q.services || q.services.length === 0) return false;
        const opType = operationType === 'importacion' ? 1 : 2;
        return q.services.some(s => s._id_operation_type === opType);
      });
    }

    if (executiveFilter === 'solo_yo' && user) {
      filtered = filtered.filter(q => q.requesting_data?._id_executive === user._id);
    }

    if (executiveFilter === 'seleccionar' && selectedExecutive) {
      filtered = filtered.filter(q => q.requesting_data?._id_executive === selectedExecutive);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(q => {
        const requestDate = new Date(q.request_date);
        const diffDays = Math.ceil((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));

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
      filtered = filtered.filter(q => requestTypeFilters.includes(q._id_request_type));
    }

    setFilteredQuotations(filtered);
  };

  const handleResetFilters = () => {
    setOperationType('all');
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

          {/*<div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Tipo operación</h4>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="operationType"
                value="importacion"
                checked={operationType === 'importacion'}
                onChange={(e) => setOperationType(e.target.value)}
              />
              <span>IMPORTACIÓN</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="operationType"
                value="exportacion"
                checked={operationType === 'exportacion'}
                onChange={(e) => setOperationType(e.target.value)}
              />
              <span>EXPORTACIÓN</span>
            </label>
          </div>*/}

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
                onChange={(e) => setExecutiveFilter(e.target.value) }
              />
              <span>SELECCIONAR</span>
            </label>
            {executiveFilter === 'seleccionar' && (
              <select
                className={styles.executiveSelect}
                value={selectedExecutive}
                onChange={(e) => console.log(e.target.value)}>

                <option value="">Seleccionar ejecutivo...</option>
                {executives.map((exec) => (
                  <option key={exec._id} value={exec._id}>
                    {exec.nombre} {exec.apellido_paterno} {exec.apellido_materno}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Fecha de asignación</h4>
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
              <span>MENOS DE 5 DÍAS</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="dateFilter"
                value="menos30"
                checked={dateFilter === 'menos30'}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <span>MENOS DE 30 DÍAS</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="dateFilter"
                value="menos365"
                checked={dateFilter === 'menos365'}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <span>MENOS DE 365 DÍAS</span>
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
            title="Nueva solicitud"
          >
            <Plus size={20} />
          </button>
          <button
            className={styles.buttonGroupItem}
            onClick={loadQuotations}
            disabled={loading}
            title="Actualizar"
          >
            <RefreshCw size={20} />
          </button>
          <button
            className={styles.buttonGroupItem}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            disabled={loading}
            title="Filtros avanzados"
          >
            <Filter size={20} />
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
            placeholder="Buscar Cliente"
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
            const daysRemaining = getDaysRemaining(quotation.deadline_date);
            const medalSrc = getCategoryMedal(quotation.customer_category);

            const totalServices = quotation.services?.length || 0;
            const attendedServices = quotation.services?.filter(s => s.used === true).length || 0;

            return (
              <div key={quotation._id} className={styles.card}>
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
                        {quotation.customer_business_name}
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
                            {quotation.services[0].origin?.country || 'Canadá'} - {quotation.services[0].destination?.country || 'México'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.middleRow}>
                      <div className={styles.referenceContainer}>
                        <div className={styles.referenceRow}>
                          <FileText size={16} />
                          <span>{quotation.reference_request}</span>
                        </div>
                        <button className={`${styles.statusBadge} ${getStatusClass(quotation.status_request_name)}`}>
                          {quotation.status_request_name}
                        </button>
                      </div>

                      <div className={styles.rightInfo}>
                        <div className={styles.requestType}>
                          {quotation.request_type_name}
                        </div>
                        {daysRemaining !== null && (
                          <div className={styles.dateInfo}>
                            <Clock size={16} />
                            <span>{daysRemaining}d</span>
                          </div>
                        )}
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
                        <span>{quotation.requesting_data?.complete_name || 'Sin asignar'}</span>
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
                    onClick={() => onEdit(quotation._id)}
                    title={t('quote.edit')}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => {
                      if (confirm(t('quote.confirmDelete'))) {
                      }
                    }}
                    title={t('quote.delete')}
                  >
                    <Trash2 size={18} />
                  </button>
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
