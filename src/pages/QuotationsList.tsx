import { useState, useEffect } from 'react';
import { Plus, Edit2, Eye, Search, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Customers.module.css';

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

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return <span className={`${styles.badge} ${styles.badgeWarning}`}>Alta</span>;
      case 2:
        return <span className={`${styles.badge} ${styles.badgeDanger}`}>Urgente</span>;
      default:
        return <span className={`${styles.badge} ${styles.badgeSecondary}`}>Normal</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'Nueva': styles.badgeInfo,
      'Enviada': styles.badgePrimary,
      'En proceso': styles.badgeWarning,
      'Cotizada': styles.badgeSuccess,
      'Rechazada': styles.badgeDanger,
      'Cancelada': styles.badgeSecondary,
    };

    return (
      <span className={`${styles.badge} ${statusColors[status] || styles.badgeSecondary}`}>
        {status}
      </span>
    );
  };

  const getCategoryBadge = (category: number) => {
    switch (category) {
      case 1:
        return <span className={`${styles.badge} ${styles.badgeGold}`}>Golden</span>;
      case 2:
        return <span className={`${styles.badge} ${styles.badgeSilver}`}>Silver</span>;
      case 3:
        return <span className={`${styles.badge} ${styles.badgeBronze}`}>Bronze</span>;
      default:
        return <span className={`${styles.badge} ${styles.badgeSecondary}`}>-</span>;
    }
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Solicitudes de Cotización</h1>
          <p className={styles.subtitle}>
            Gestiona las solicitudes de cotización de tus clientes
          </p>
        </div>
        <button className={styles.addButton} onClick={onCreateNew} disabled={loading}>
          <Plus size={20} />
          Nueva Solicitud
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por referencia, cliente o tipo..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={styles.filterGroup}>
          <Filter size={18} />
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={loading}
          >
            <option value="all">Todos los estados</option>
            <option value="Nueva">Nueva</option>
            <option value="Enviada">Enviada</option>
            <option value="En proceso">En proceso</option>
            <option value="Cotizada">Cotizada</option>
            <option value="Rechazada">Rechazada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{
            display: 'inline-block',
            width: '3rem',
            height: '3rem',
            border: '4px solid #e5e7eb',
            borderTopColor: '#14b8a6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Solicitante</th>
                <th>Fecha</th>
                <th>Fecha Límite</th>
                <th>Prioridad</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Servicios</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.length > 0 ? (
                filteredQuotations.map((quotation) => (
                  <tr key={quotation._id}>
                    <td>
                      <span className={styles.reference}>
                        {quotation.reference_request}
                      </span>
                    </td>
                    <td>
                      <div className={styles.customerInfo}>
                        <span className={styles.customerName}>
                          {quotation.customer_business_name}
                        </span>
                        {quotation.licitation && (
                          <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>
                            Licitación
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{quotation.request_type_name}</td>
                    <td>{quotation.requesting_data?.complete_name || '-'}</td>
                    <td>{formatDate(quotation.request_date)}</td>
                    <td>{formatDate(quotation.deadline_date)}</td>
                    <td>{getPriorityBadge(quotation.priority)}</td>
                    <td>{getCategoryBadge(quotation.customer_category)}</td>
                    <td>{getStatusBadge(quotation.status_request_name)}</td>
                    <td>
                      <span className={styles.servicesCount}>
                        {quotation.services?.length || 0}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.iconButton} ${styles.view}`}
                          onClick={() => onView(quotation._id)}
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className={`${styles.iconButton} ${styles.edit}`}
                          onClick={() => onEdit(quotation._id)}
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '2rem' }}>
                    {searchQuery || statusFilter !== 'all'
                      ? 'No se encontraron resultados con los filtros aplicados'
                      : 'No hay solicitudes de cotización registradas'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
