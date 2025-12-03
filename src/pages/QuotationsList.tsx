import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, RefreshCw, ChevronDown, FileText, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './QuotationsList.module.css';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quotation-requests`;
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
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadQuotations();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [quotations, searchQuery, statusFilter]);

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
      alert('Error al cargar las cotizaciones');
    } finally {
      setLoading(false);
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

    setFilteredQuotations(filtered);
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
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cotizaciones</h1>
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

        <div className={styles.actionButtons}>
          <button
            className={styles.greenButton}
            onClick={onCreateNew}
            disabled={loading}
          >
            <Plus size={20} />
          </button>
          <button
            className={styles.greenButton}
            onClick={loadQuotations}
            disabled={loading}
          >
            <RefreshCw size={20} />
          </button>
          <div className={styles.dropdown}>
            <button className={styles.dropdownButton} disabled>
              Acciones
              <ChevronDown size={18} />
            </button>
          </div>
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

            return (
              <div key={quotation._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.medalContainer}>
                    {medalSrc && (
                      <img
                        src={medalSrc}
                        alt="Medal"
                        className={styles.medalImage}
                      />
                    )}
                    <button className={`${styles.statusButton} ${getStatusClass(quotation.status_request_name)}`}>
                      {quotation.status_request_name}
                    </button>
                  </div>

                  <div className={styles.cardContent}>
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

                    <div className={styles.referenceRow}>
                      <FileText size={16} />
                      <span>{quotation.reference_request}</span>
                      <span style={{ marginLeft: 'auto' }}>
                        {quotation.request_type_name}
                      </span>
                    </div>

                    {quotation.licitation && (
                      <div className={styles.typeRow}>
                        Clientes - Licitación
                      </div>
                    )}

                    <div className={styles.dateRow}>
                      <Clock size={16} />
                      {daysRemaining !== null && (
                        <span>{daysRemaining}d</span>
                      )}
                    </div>

                    {quotation.services && quotation.services.length > 0 && (
                      <div className={styles.locationRow}>
                        {quotation.services[0].origin?.country || 'Canadá'} - {quotation.services[0].destination?.country || 'México'}
                      </div>
                    )}

                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.actionButton} ${styles.editButton}`}
                        onClick={() => onEdit(quotation._id)}
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar esta cotización?')) {
                          }
                        }}
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3>No hay solicitudes de cotización</h3>
          <p>
            {searchQuery
              ? 'No se encontraron resultados con los filtros aplicados'
              : 'Comienza creando una nueva solicitud de cotización'}
          </p>
          <button className={styles.greenButton} onClick={onCreateNew}>
            <Plus size={20} />
            Nueva Solicitud
          </button>
        </div>
      )}
    </div>
  );
}
