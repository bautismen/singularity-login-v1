import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Search, RefreshCw, ChevronDown, FileText, Clock, Filter, FilterXIcon, ChevronUp  } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import styles from './QuotationsList.module.css';
import {QuotationRequest} from '../types/requestQuotation';
import { quotationService } from '../services/quotationService';
import { getDocumentsByReference, downloadDocumentByReference
} from "../services/digitizationService";
import {  GrCloudDownload  } from "react-icons/gr";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const USERS_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/users`;
const REQUEST_TYPES_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/catalog-request-types`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface QuotationsListProps {
  onCreateNew: () => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  highlightId?: string | null;
}

export function QuotationsList({ onCreateNew, onEdit, onView , highlightId}: QuotationsListProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const {showInfo, showError } = useNotification();
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
  const [orderBy, setOrderBy] = useState<string>('');


  const [isOpenStatus, setIsOpenStatus] = useState(false);
  const [isOpenEjecutivo, setIsOpenEjecutivo] = useState(false);
  const contentRefStatus = useRef(null);
  const contentRefEjecutivo = useRef(null);

  const [isOpenFecha, setIsOpenFecha] = useState(false);
  const [isOpenTipoSol, setIsOpenTipoSol] = useState(false);
  const [isOpenOrderBy, setIsOpenOrderBy] = useState(false);

  const contentRefFecha = useRef(null);
  const contentRefTipoSol = useRef(null);
  const contentRefOrderBy = useRef(null);
  const rowRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [users, setUsers] = useState<any[]>([]);
  const [requestTypes, setRequestTypes] = useState<any[]>([]);

  /* documentos contador */
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadQuotationsRequests();
    loadUsers();
    loadRequestTypes();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [quotations, searchQuery, statusFilter, executiveFilter, selectedExecutive, dateFilter, requestTypeFilters, orderBy  ]);

  useEffect(() => {
    if(highlightId && rowRefs.current[highlightId]){
      rowRefs.current[highlightId]?.scrollIntoView({
        behavior: 'smooth',
        block:"center"
      });
    }
  }, [highlightId, quotations])
  
  const loadQuotationsRequests = async () => {
    try {
      setLoading(true);      
      const data = await quotationService.getRecentQuotations();
      if (data.message ===  t('ctrlpricing.norequests')) {
        showInfo(data.message);
        return;
      }
      const sortdata = [...data.data].sort((a, b) => {
        if(a.idStatusRequest === 10 && b.idStatusRequest !== 10) return 1; // a va despues de b
        if(a.idStatusRequest !== 10 && b.idStatusRequest === 10) return -1; // a va antes de b
        //(a.deadline_date > b.deadline_date) ? 1 : -1
        const a_deadline = a.dateDeadline ? new Date(a.dateDeadline).getTime() : Infinity;
        const b_deadline = b.dateDeadline ? new Date(b.dateDeadline).getTime() : Infinity;
        return a_deadline -  b_deadline; //fecha mas antigua va primero 
      }); 
      setQuotations(sortdata);
      //recargar contadores de documentos
      await loadAllDocumentCounts(sortdata);
    } catch (error) {
      console.error('Error loading quotations:', error);
      showError('Error al cargar las cotizaciones');
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
        q.referenceRequest?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customer.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.typeRequest?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter(q => statusFilter.includes(q.idStatusRequest.toString()));      
    }

    if (executiveFilter === 'solo_yo' && user) {
      filtered = filtered.filter(q => q.createdBy?.idUser === user._id);
    }

    if (executiveFilter === 'seleccionar' && selectedExecutive) {
      filtered = filtered.filter(q => q.createdBy?.idUser === selectedExecutive);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(q => {
        //const requestDate = new Date(q.dateRequest);
        const requestDate = new Date(q.dateRequest.substring(0, 10)+ "T00:00:00");
        now.setHours(0, 0, 0, 0);
        requestDate.setHours(0, 0, 0, 0);
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
      filtered = filtered.filter(q => requestTypeFilters.includes(q.idRequestType));
    }  
    
    if(orderBy === "desc"){
      filtered = filtered.sort((a, b) => b.id.localeCompare(a.id));
    }

    setFilteredQuotations(filtered);
  };

  const handleResetFilters = () => {
    setStatusFilter([]);
    setExecutiveFilter('todos');
    setSelectedExecutive('');
    setDateFilter('all');
    setRequestTypeFilters([]);
    setOrderBy('');
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

  const getDaysRemaining = (deadline: string) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

   /* recargar los documentos total por cantidad referencia qua req */
useEffect(() => {
  if (quotations.length > 0) {
    loadAllDocumentCounts(quotations);
  }
}, [quotations]);

    /* recargar los documentos total por cantidad referencia qua req */
  const loadAllDocumentCounts = async (list: QuotationRequest[]) => {

  const results = await Promise.all(
    list.map(async (q) => {

      if (!q.referenceRequest) {
        return { reference: "", count: 0 };
      }

      try {
        const docs = await getDocumentsByReference(q.referenceRequest);

        return {
          reference: q.referenceRequest,
          count: docs?.length ?? 0
        };

      } catch {
        return {
          reference: q.referenceRequest,
          count: 0
        };
      }
    })
  );

  const counts: Record<string, number> = {};

  results.forEach(r => {
    if (r.reference) {
      counts[r.reference] = r.count;
    }
  });

  setDocumentCounts(counts);
};

    /* descargar los documentos por referencia qua req */
  const handleDownloadDocuments = async (quotation: QuotationRequest) => {

    if (!quotation.referenceRequest) {
      showError(t('dig.noReference'));
      return;
    }

    try {

      const meta = await downloadDocumentByReference(quotation.referenceRequest);

      if (!meta || meta.length === 0) {
        showError(t('dig.noDocuments'));
        return;
      }

      // CASO 1: Solo un documento
      if (meta.length === 1) {

        const doc = meta[0];

        if (!doc.fileBytes || !doc.fileName) {
          showError(t('dig.invalidDocument'));
          return;
        }

        const binary = atob(doc.fileBytes);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        const blob = new Blob([bytes]);
        saveAs(blob, doc.fileName);

        return;
      }

      // CASO 2: varios documentos -> ZIP
      const zip = new JSZip();

      for (const doc of meta) {

        if (!doc.fileBytes || !doc.fileName) continue;

        const binary = atob(doc.fileBytes);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        zip.file(doc.fileName, bytes);
      }

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE"
      });

      saveAs(zipBlob, `${quotation.referenceRequest}.zip`);

    } catch (error: any) {
      showError(error.message || t('dig.downloadError'));
    }
  };


  return (
    <div className={styles.containerWithSidebar}>
      {showAdvancedFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersPanelHeader}>
            <h3>{t('quote.refineSearch')}</h3>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.headerRow}>
              <h4 className={styles.filterTitle}>{t('quote.statusSearch')}</h4>
              <button onClick={() => setIsOpenStatus(!isOpenStatus)} className={styles.iconbutonlucide}>
              {isOpenStatus ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
             <div
              ref={contentRefStatus}
              style={{
                maxHeight: isOpenStatus
                  ? contentRefStatus.current?.scrollHeight + "px"
                  : "0px",
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}
            >     
              <label className={styles.radioLabel}>
                <input
                  type="checkbox"
                  value="1"
                  checked={statusFilter.includes('1')}
                  onChange={(e) => handleRequesStatus(e.target.value)}
                />
                <span>{t('quote.creada')}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="checkbox"
                  value="2"
                  checked={statusFilter.includes('2')}
                  onChange={(e) => handleRequesStatus(e.target.value)}
                />
                <span>{t('quote.sent')}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="checkbox"
                  value="3"
                  checked={statusFilter.includes('3')}
                  onChange={(e) => handleRequesStatus(e.target.value)}
                />
                <span>{t('quote.assigned')}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="checkbox"
                  value="5"
                  checked={statusFilter.includes('5')}
                  onChange={(e) => handleRequesStatus(e.target.value)}
                />
                <span>{t('quote.quoted')}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="checkbox"
                  value="6"
                  checked={statusFilter.includes('6')}
                  onChange={(e) => handleRequesStatus(e.target.value)}
                />
                <span>{t('quote.declined')}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="checkbox"
                  value="10"
                  checked={statusFilter.includes('10')}
                  onChange={(e) => handleRequesStatus(e.target.value)}
                />
                <span>{t('quote.cancelled')}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="checkbox"
                  value="7"
                  checked={statusFilter.includes('7')}
                  onChange={(e) => handleRequesStatus(e.target.value)}
                />
                <span>{t('quote.expired')}</span>
              </label>
            </div>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.headerRow}>
              <h4 className={styles.filterTitle}>{t('quote.requestingExecutive')}</h4>
              <button 
              onClick={() => setIsOpenEjecutivo(!isOpenEjecutivo)} 
              className={styles.iconbutonlucide}>
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
              }}>   
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="executiveFilter"
                    value="todos"
                    checked={executiveFilter === 'todos'}
                    onChange={(e) => setExecutiveFilter(e.target.value)}
                  />
                  <span>{t('quote.all')}</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="executiveFilter"
                    value="solo_yo"
                    checked={executiveFilter === 'solo_yo'}
                    onChange={(e) => setExecutiveFilter(e.target.value)}
                  />
                  <span>{t('quote.onlyMe')}</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="executiveFilter"
                    value="seleccionar"
                    checked={executiveFilter === 'seleccionar'}
                    onChange={(e) => setExecutiveFilter(e.target.value)}
                  />
                  <span>{t('quote.selectOption')}</span>
                </label>
                {executiveFilter === 'seleccionar' && (
                  <select
                    className={styles.executiveSelect}
                    value={selectedExecutive}
                    onChange={(e) => setSelectedExecutive(e.target.value)}>
                    <option value="">{t('quote.selectExecutive')}</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                )}
            </div>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.headerRow}>
              <h4 className={styles.filterTitle}>{t('quote.creationDate')}</h4>
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
                <span>{t('quote.today')}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="dateFilter"
                  value="ayer"
                  checked={dateFilter === 'ayer'}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                <span>{t('quote.yesterday')}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="dateFilter"
                  value="menos5"
                  checked={dateFilter === 'menos5'}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                <span>{t('quote.lessThan5Days')}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="dateFilter"
                  value="menos30"
                  checked={dateFilter === 'menos30'}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                <span>{t('quote.lessThan30Days')}</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="dateFilter"
                  value="menos365"
                  checked={dateFilter === 'menos365'}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                <span>{t('quote.lessThan365Days')}</span>
              </label>
            </div>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.headerRow}>
              <h4 className={styles.filterTitle}>{t('quote.requestType')}</h4>
              <button onClick={() => setIsOpenTipoSol(!isOpenTipoSol)} className={styles.iconbutonlucide}>
              {isOpenTipoSol ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
             <div
              ref={contentRefTipoSol}
              style={{
                maxHeight: isOpenTipoSol
                  ? contentRefTipoSol.current?.scrollHeight + "px"
                  : "0px",
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}> 
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
          </div>

          <div className={styles.filterSection}>
            <div className={styles.headerRow}>
              <h4 className={styles.filterTitle}>{t('quote.orderBy')}</h4>
              <button     
              onClick={() => setIsOpenOrderBy(!isOpenOrderBy)}          
              className={styles.iconbutonlucide}>
              {isOpenOrderBy ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            <div ref={contentRefOrderBy}
              style={{
                maxHeight: isOpenOrderBy ? contentRefOrderBy.current?.scrollHeight + "px" : "0px",
                overflow:"hidden",
                transition:  "max-height 0.3s ease"
              }} >
              <label className={styles.checkboxLabel}>
                <input
                  type="radio"    
                  value="desc" 
                  checked={orderBy === 'desc'}            
                  onChange={(e) => setOrderBy(e.target.value)}
                />
               <span>{t('quote.orderDesc')}</span>
              </label>
            
            </div>
          </div>

          <div className={styles.filterActions}>
            <button
              className={styles.resetButton}
              onClick={handleResetFilters}
            >
              {t('quote.restore')}
            </button>
            <button
              className={styles.applyButton}
              onClick={() => setShowAdvancedFilters(false)}
            >
              {t('quote.done')}
            </button>
          </div>
          
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('quote.quotationRequest')}</h1>
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={styles.buttonGroupItem}
            onClick={onCreateNew}
            disabled={loading}
            title={t('quote.newRequest')}>
            <Plus size={20} />
          </button>
          <button
            className={styles.buttonGroupItem}
            onClick={loadQuotationsRequests}
            disabled={loading}
            title={t('quote.refresh')}>
            <RefreshCw size={20} />
          </button>
          <button
            className={` ${styles.buttonGroupItem} ${!showAdvancedFilters ?  styles.filterDisabled: ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            disabled={loading}
            title={t('quote.advancedFilters')}>            
            {!showAdvancedFilters ? 
            <Filter size={20} /> : <FilterXIcon size={20} />}
          </button>
          <button
            className={styles.buttonGroupItemLast}
            disabled
            title={t('quote.actions')}>
            {t('quote.actions')}
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={t('quote.search')}
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
              <div 
              key={quotation.id} 
              ref={(el) => {
                if (highlightId && quotation.id === highlightId) {
                  rowRefs.current[quotation.id] = el;
                }
              }}
              className={`${styles.card} ${ quotation.id === highlightId ? styles.highlightRow  : '' }`}>
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

                        {quotation.idStatusRequest === 5 && (
                          <div className={styles.documentsActions}>
                            <button
                              className={`${styles.cloudButton} ${styles.download}`}
                              onClick={() => handleDownloadDocuments(quotation)}
                               title={
                                  (documentCounts[quotation.referenceRequest] ?? 0) === 1
                                    ? t('dig.downloadfile')
                                    : t('dig.downloadfiles')
                                }
                              disabled={(documentCounts[quotation.referenceRequest ?? ""] ?? 0) === 0}
                            >
                              <GrCloudDownload size={22} />

                              <span className={styles.documentBadge}>
                                {documentCounts[quotation.referenceRequest ?? ""] ?? 0}
                              </span>
                            </button>
                          </div>
                        )}
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
                          strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>{quotation.createdBy?.nameEmployee || t('quote.unassigned')}</span>
                      </div>

                      {totalServices > 0 && (
                        <div className={styles.servicesCounter}>
                          {attendedServices}/{totalServices} {t('quote.servicesAttended')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={()=> { 
                      if (quotation.idStatusRequest === 10 || quotation.idStatusRequest === 6) {
                        onView(quotation.id)
                      }
                      else {   
                        onEdit(quotation.id)
                      }}}
                    title={t('quote.edit')}>
                    <Edit2 size={18} />
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
        </div>
      )}
      </div>
    </div>
  );
}
