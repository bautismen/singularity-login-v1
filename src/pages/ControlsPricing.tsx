import { useState, useEffect } from 'react';
import { RefreshCw, Filter, ChevronDown, Search, Clock, Edit2, Trash2, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { controlsPricingService, ControlsPricingRequest } from '../services/controlsPricingService';
import { ControlsPricingForm } from './ControlsPricingForm';
import styles from './ControlsPricing.module.css';

export function ControlsPricing() {
  const { t } = useLanguage();
  const { showError } = useNotification();
  const [requests, setRequests] = useState<ControlsPricingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ControlsPricingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await controlsPricingService.getAll();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
      showError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddControl = (requestId: string) => {
    setSelectedRequestId(requestId);
    setSelectedControlId(null);
    setShowForm(true);
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

  if (showForm) {
    return <ControlsPricingForm requestId={selectedRequestId} controlId={selectedControlId} onBack={handleBackToList} />;
  }

  const filterRequests = () => {
    let filtered = [...requests];

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.reference_request.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customer_business_name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getCategoryLabel = (category: number) => {
    switch (category) {
      case 1:
        return 'Clientes';
      case 2:
        return 'Filiales';
      case 3:
        return 'Prospectos';
      default:
        return 'Clientes';
    }
  };

  const getStatusClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      'Asignada': styles.statusAsignada,
      'Cotizada': styles.statusCotizada,
      'Nueva': styles.statusNueva,
      'Enviada': styles.statusEnviada,
      'Expirada': styles.statusExpirada,
      'En proceso': styles.statusEnProceso,
      'Rechazada': styles.statusRechazada,
      'Cancelada': styles.statusCancelada,
    };
    return statusClasses[status] || styles.statusNueva;
  };

  const getDaysElapsed = (date: string) => {
    if (!date) return null;
    const now = new Date();
    const requestDate = new Date(date);
    const diffTime = now.getTime() - requestDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getOperationType = (services: any[]) => {
    if (!services || services.length === 0) return '';
    return services[0]._id_operation_type === 1 ? 'importación' : 'exportación';
  };

  const getCountries = (services: any[]) => {
    if (!services || services.length === 0) return '';
    const origin = services[0].origin?.country || 'Canadá';
    const destination = services[0].destination?.country || 'México';
    return `${origin} - ${destination}`;
  };

  const getTotalServicesCount = (services: any[]) => {
    return services?.length || 0;
  };

  const getAttendedServicesCount = (services: any[]) => {
    let count: number = 0;    
    services.map((service: any) => {    
      if (service.used) {
        count=count + 1;
      }
    });
    return count;
  };<q></q>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Control de pricing</h1>
        <div className={styles.buttonGroup}>
          <button
            className={styles.buttonGroupItem}
            onClick={loadRequests}
            disabled={loading}
            title="Actualizar"
          >
            <RefreshCw size={20} />
          </button>
          <button
            className={styles.buttonGroupItem}
            disabled
            title="Filtros"
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

      <div className={styles.searchBar}>
        <Search size={20} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar solicitud"
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
            const daysElapsed = getDaysElapsed(request.request_date);
            const medalSrc = getCategoryMedal(request.customer_category);
            const categoryLabel = getCategoryLabel(request.customer_category);
            const operationType = getOperationType(request.services);
            const countries = getCountries(request.services);
            const totalServices = getTotalServicesCount(request.services);
            const attendedServices = getAttendedServicesCount(request.services);

            return (
              <div key={request._id} className={styles.card}>
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
                          {request.customer_business_name}
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
                        <span className={styles.referenceNumber}>{request.reference_request}</span>
                        <span className={`${styles.statusBadge} ${getStatusClass(request.status_request_name)}`}>
                          {request.status_request_name}
                        </span>
                      </div>
                      <div className={styles.operationRow}>
                        <span className={styles.operationType}>{operationType}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardHeaderRight}>
                    <div className={styles.countries}>{countries}</div>
                    <div className={styles.category}>{categoryLabel}</div>
                    {daysElapsed !== null && (
                      <div className={styles.dateInfo}>
                        <Clock size={16} />
                        <span>{daysElapsed}d</span>
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
                    <span>{request.requesting_data?.complete_name || 'Sin asignar'}</span>
                  </div>
                  <div className={styles.servicesCounter}>
                    {attendedServices}/{totalServices} Servicios atendidos
                  </div>
                </div>

                {request.assigned_to && request.assigned_to.length > 0 && (
                  <div className={styles.controlNumbers}>
                    {request.assigned_to.map((assigned, index) => (
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
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          <span className={styles.assignedName}>{assigned.complete_name}</span>

                          {assigned.pricing_control_numbers && assigned.pricing_control_numbers.length > 0 ? (
                            <>
                              {assigned.pricing_control_numbers.map((control, controlIndex) => (
                                <button
                                  key={controlIndex}
                                  className={styles.controlButton}
                                  onClick={() => handleEditControl(request._id, control._id_pricing_controls)}
                                >
                                  {control.control}
                                </button>
                              ))}
                            </>
                          ) : (
                            <button
                              className={styles.addControlSmallButton}
                              onClick={() => handleAddControl(request._id)}
                            >
                              <Plus size={14} />
                              Agregar control
                            </button>
                          )}
                        </div>
                        <div className={styles.controlNumberActions}>
                          {daysElapsed !== null && (
                            <div className={styles.controlDays}>
                              <Clock size={14} />
                              <span>{daysElapsed}d</span>
                            </div>
                          )}
                          <button
                            className={styles.actionButton}
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className={styles.actionButton}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className={styles.addControlButton}
                  onClick={() => handleAddControl(request._id)}
                >
                  <Plus size={16} />
                  Agregar número de control
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3>No hay solicitudes disponibles</h3>
          <p>
            {searchQuery
              ? 'No se encontraron resultados con los filtros aplicados'
              : 'No hay solicitudes con estado mayor o igual a 3'}
          </p>
        </div>
      )}
    </div>
  );
}
