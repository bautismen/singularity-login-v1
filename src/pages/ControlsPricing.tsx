import { useState, useEffect, useRef, DragEvent   } from 'react';
import { RefreshCw, Filter, ChevronDown, Search, Clock, Plus, FilterXIcon, ChevronUp, UploadCloud, Cloud, ArrowUp, X   } from 'lucide-react';
import { GrCloudUpload, GrCloudDownload  } from "react-icons/gr";
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { controlsPricingService } from '../services/controlsPricingService';
import { ResquetQuote } from '../types/pricingControl';
import { ControlsPricingForm } from './ControlsPricingForm';
import { useAuth } from '../contexts/AuthContext';
import styles from './ControlsPricing.module.css';

  //se añade parte de los documentos
import {DocumentTypeDTO,  SectionDTO} from "../types/digitization";
import {uploadDocuments, getDocumentTypes, getSections, getDocumentsByReference, downloadDocumentByReference
} from "../services/digitizationService";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { quotationService } from '../services/quotationService';


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

  //se añade parte de los documentos
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [referenceUpload, setReferenceUpload] = useState("");
  const [documentTypeUpload, setDocumentTypeUpload] = useState("");
  const [seccionUpload, setSeccionUpload] = useState<number | "">("");
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDTO[]>([]);
  const [sections, setSections] = useState<SectionDTO[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({});
    const [idRequestUpload, setIdRequestUpload] = useState("");

  interface UploadItem {
  id: string;
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
}

  useEffect(() => {
    loadRequests();
    loadUsers();
    loadCatalogs();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery,dateFilter, executiveFilter,selectedExecutive]);

  useEffect(() => {
  if (documentTypes.length > 0 && sections.length > 0) {
    setDefaultFilters();
    }
  }, [documentTypes, sections]);

const setDefaultFilters = () => {
  // filtrado por tarifa de venta final
  const filteredDocs = documentTypes.filter(d => d.documenttypeid === 1);
  if (filteredDocs.length > 0) {
    setDocumentTypeUpload(String(filteredDocs[0].documenttypeid));
  }

  // filtrado por sección pricing
  const filteredSections = sections.filter(s => s.sectionid === 1);
  if (filteredSections.length > 0) {
    setSeccionUpload(filteredSections[0].sectionid);
  }
};

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

    //se añade parte de los documentos
  const loadCatalogs = async () => {
  try {
    const [docs, secs] = await Promise.all([
      getDocumentTypes(),
      getSections()
    ]);

    setDocumentTypes(docs);
    setSections(secs);
  } catch {
    showError(t('dig.catalogError'));
  }
};

const handleDrop = (e: DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  setDragActive(false);

  const droppedFiles = Array.from(e.dataTransfer.files);
  setFiles(prev => [...prev, ...droppedFiles]);
  setPreviewFiles(prev => [...prev, ...droppedFiles]);
};

const handleOpenDocuments = async (request: ResquetQuote) => {
  setSelectedRequestForDocs(request);
  setReferenceUpload(request.referenceRequest || "");
    setIdRequestUpload(request.id || "");
  setShowDocumentsModal(true);

  if (request.referenceRequest) {
    await loadDocumentCount(request.referenceRequest);
  }
};

const handleDownloadDocuments = async (request: ResquetQuote) => {

  if (!request.referenceRequest) {
    showWarning(t('dig.noReference'));
    return;
  }

  try {

    const meta = await downloadDocumentByReference(request.referenceRequest);

    if (!meta || meta.length === 0) {
      showWarning(t('dig.noDocuments'));
      return;
    }

    // CASO 1: Solo un documento, no zip
    if (meta.length === 1) {

      const doc = meta[0];

      if (!doc.fileBytes || !doc.fileName) {
        showWarning(t('dig.invalidDocument'));
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

    // CASO 2: Más de un documento se descargue como ZIP
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

    saveAs(zipBlob, `${request.referenceRequest}.zip`);

  } catch (error: any) {
    showError(error.message || t('dig.downloadError'));
  }
};

    const handleCancelUpload = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setUploadQueue([]);
    setUploading(false);
    setFiles([]);
    setPreviewFiles([]);
  };

const loadDocumentCount = async (reference: string) => {
  try {
    const docs = await getDocumentsByReference(reference);

    setDocumentCounts(prev => ({
      ...prev,
      [reference]: docs?.length ?? 0
    }));

  } catch (error) {
    console.error('Error loading documents by reference :', error);
    setDocumentCounts(prev => ({
      ...prev,
      [reference]: 0
    }));
  }
};

const uploadFiles = async () => {
  if (!referenceUpload || !seccionUpload || !documentTypeUpload || files.length === 0) {
    showError(t('dig.uploadValidation'));
    return;
  }

  abortControllerRef.current = new AbortController();
  setUploading(true);

  // Inicializa la cola de archivos
  const initialQueue: UploadItem[] = files.map((file, index) => ({
    id: `${file.name}-${index}`,
    fileName: file.name,
    progress: 0,
    status: "pending",
  }));

  setUploadQueue(initialQueue);

  try {
    for (let i = 0; i < files.length; i++) {

      if (abortControllerRef.current?.signal.aborted) break;

      const file = files[i];
      const currentId = `${file.name}-${i}`;

      try {
        // Cambia estado a "uploading"
        setUploadQueue(prev =>
          prev.map(item =>
            item.id === currentId
              ? { ...item, status: "uploading", progress: 50 }
              : item
          )
        );

        // Upload real
        await uploadDocuments(
          referenceUpload,
          Number(seccionUpload),
          Number(documentTypeUpload),
          {
            iduser: user?._id || '',
            nameemployee: user?.name || ''
          },
          [file],
          abortControllerRef.current?.signal
        );

        // Si fue exitoso
        setUploadQueue(prev =>
          prev.map(item =>
            item.id === currentId
              ? { ...item, status: "success", progress: 100 }
              : item
          )
        );

        showInfo(
          t('dig.fileUploaded').replace('{{name}}', file.name)
        );

         const quotationData = {
                  IdRequest: idRequestUpload,       
                  IdStatusRequest: 5,
                  StatusRequest: "Cotizada",
                  statusComment: "",          
                          
          };
          await quotationService.changeStatus(quotationData);
          loadRequests();

      } catch (err: any) {

        if (err.name === "AbortError") {
          setUploading(false);
          return;
        }

        setUploadQueue(prev =>
          prev.map(item =>
            item.id === currentId
              ? { ...item, status: "error", progress: 100 }
              : item
          )
        );

        let errorMessage = t('dig.fileUploadError');
        try {
          const parsed = JSON.parse(err.message);
          errorMessage = parsed.messageStatus || errorMessage;
        } catch {
          errorMessage = err.message || errorMessage;
        }

        showError(errorMessage);

        setUploading(false);
        abortControllerRef.current = null;
      }
    }

    if (!abortControllerRef.current?.signal.aborted) {
      // Limpia archivos y preview
      setFiles([]);
      setPreviewFiles([]);

      handleResetFilters();
      closeDocumentsModal();

  // REFRESCAR numero documentos
      if (referenceUpload) {
        await loadDocumentCount(referenceUpload);
      }

      setDefaultFilters();

      // limpia cola después de 2s
      setTimeout(() => {
        setUploadQueue([]);
      }, 2000);
    }

  } finally {
    setUploading(false);
    abortControllerRef.current = null;
  }
};

const closeDocumentsModal = () => {
  setShowDocumentsModal(false);
  setPreviewFiles([]);
  setFiles([]);
  setDocumentTypeUpload("");
  setSeccionUpload("");
  setReferenceUpload("");
  setIdRequestUpload("");
  setSelectedRequestForDocs(null);
  setDragActive(false);
  setDefaultFilters()
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

         // 3️⃣ Luego aplicar tu orden principal
        return rank(a) - rank(b);

      });
      const excludedEmails = [
        "maria.cervantes@kromlogistica.com",
        "estela.guerrero@kromlogistica.com",
        "magali.tamayo@kromlogistica.com",        
        "guadalupe.dimas@kromlogistica.com",
        "beatriz.gonzalez@kromlogistica.com"         
      ];

      if (!excludedEmails.includes(user.email)) {
        filtered = filtered.filter(r =>
          r.assignedTo?.some(a => a.idUser === user._id)
        );
      }
      setRequests(filtered);

      // Precargar conteos de documentos
      const references = filtered
        .map(r => r.referenceRequest)
        .filter(Boolean);
      // Precargar conteos de documentos
      await Promise.all(
        references.map(ref => loadDocumentCount(ref))
      );

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


  if (showForm) {
    return <ControlsPricingForm requestId={selectedRequestId} controlId={selectedControlId} onBack={handleBackToList} />;
  }

  const filterRequests = () => {
    let filtered = [...requests];

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.referenceRequest?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customer?.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customer?.prospectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
                            {request.customer?.customerName || request.customer?.prospectName}
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
                        {(request.idStatusRequest === 4 || request.idStatusRequest === 5) && (
                          <div className={styles.documentsActions}>

                            {/* Upload */}
                            <button
                              className={`${styles.cloudButton} ${styles.upload}`}
                              onClick={() => handleOpenDocuments(request)}
                            >
                              <GrCloudUpload size={22} />

                              <span className={styles.tooltip}>
                                {t('dig.upload')}
                              </span>
                            </button>

                          {/* Download */}
                          {(documentCounts[request.referenceRequest] ?? 0) > 0 && (
                            <button
                              className={`${styles.cloudButton} ${styles.download}`}
                              onClick={() => handleDownloadDocuments(request)}
                            >
                              <GrCloudDownload size={22} />

                              <span className={styles.tooltip}>
                                {(documentCounts[request.referenceRequest] ?? 0) === 1
                                  ? t('dig.downloadfile')
                                  : t('dig.downloadfiles')}
                              </span>

                              <span className={styles.documentBadge}>
                                {documentCounts[request.referenceRequest] ?? 0}
                              </span>
                            </button>
                          )}

                          </div>
                        )}
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

      {/* ================= MODAL UPLOAD ================= */}
        {showDocumentsModal && selectedRequestForDocs && (
          <div className={styles.modalOverlay}>
            <div className={styles.uploadModal}>

              {/* HEADER */}
              <div className={styles.modalHeader}>
                <h3>{t('dig.uploadDocuments')}</h3>
                <button
                  onClick={closeDocumentsModal}
                  className={styles.closeButton}
                >
                  <X size={24} />
                </button>
              </div>

              {/* BODY SCROLLABLE */}
              <div className={styles.modalBody}>

                {/* DROPZONE */}
                <div className={styles.modalSection}>
                  <div
                    className={`${styles.dropZone} ${
                      dragActive ? styles.dropZoneActive : ""
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("fileInputModal")?.click()
                    }
                  >
                    <UploadCloud size={48} />

                    <p className={styles.dropTitle}>
                      {t('dig.dragFiles')}
                    </p>

                    <span className={styles.dropSubtitle}>
                      {t('dig.clickToSelect')}
                    </span>
                  </div>

                  <input
                    id="fileInputModal"
                    type="file"
                    multiple
                    hidden
                    onChange={(e) => {
                      if (!e.target.files) return;
                      const arr = Array.from(e.target.files);
                      setFiles(prev => [...prev, ...arr]);
                      setPreviewFiles(prev => [...prev, ...arr]);
                    }}
                  />
                </div>

                {/* CAMPOS */}
                {previewFiles.length > 0 && (
                  <div className={styles.modalSection}>
                    <div className={styles.uploadFieldsModal}>

                      <input
                        type="text"
                        placeholder={t('dig.reference')}
                        value={referenceUpload}
                        onChange={(e) => setReferenceUpload(e.target.value)}
                        disabled
                      />

                      <select
                        value={documentTypeUpload}
                        onChange={(e) => setDocumentTypeUpload(e.target.value)}
                        className={styles.selectupload}
                        disabled
                      >
                        <option value="">{t('dig.documentType')}</option>

                        {documentTypes
                          .filter(d => [1].includes(d.documenttypeid))
                          .map(d => (
                            <option
                              key={d.documenttypeid}
                              value={d.documenttypeid}
                            >
                              {d.documentnametype}
                            </option>
                        ))}
                      </select>

                      <select
                        value={seccionUpload}
                        onChange={(e) =>
                          setSeccionUpload(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className={styles.selectupload}
                        disabled
                      >
                        <option value="">{t('dig.section')}</option>

                        {sections
                          .filter(s => [1].includes(s.sectionid))
                          .map(s => (
                            <option
                              key={s.sectionid}
                              value={s.sectionid}
                            >
                              {s.section}
                            </option>
                        ))}
                      </select>

                      <div className={styles.tooltipUploadWrapper}>
                        <button
                          className={styles.cloudUploadButton}
                          onClick={uploadFiles}
                          disabled={uploading}
                        >
                          <Cloud size={55} className={styles.cloudUploadIcon} />
                          <ArrowUp size={25} className={styles.arrowUploadIcon} />
                        </button>

                        <div className={styles.customTooluploadtip}>
                          {uploading
                            ? t('dig.uploadingFiles')
                                .replace('{{count}}', String(files.length))
                            : files.length > 0
                              ? t('dig.uploadFilesCount')
                                  .replace('{{count}}', String(files.length))
                              : t('dig.uploadFile')
                          }
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* ARCHIVOS */}
                {previewFiles.length > 0 && (
                  <div className={styles.modalSection}>
                    <div className={styles.modalFilesContainer}>
                      <h4 className={styles.modalFilesTitle}>
                        {t('dig.selectedFiles')} ({previewFiles.length})
                      </h4>

                      {previewFiles.map((file, index) => (
                        <div key={index} className={styles.modalFileCard}>
                          <span className={styles.modalFileName}>
                            {file.name}
                          </span>

                          <button
                            className={styles.modalRemoveFile}
                            onClick={() => {
                              setPreviewFiles(prev =>
                                prev.filter((_, i) => i !== index)
                              );
                              setFiles(prev =>
                                prev.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
      )}
        {/* ================= UPLOAD FLOATING PROGRESS ================= */}

            {uploadQueue.length > 0 && (
              <>
                <div className={styles.blurOverlay} style={{ zIndex: 3000 }} />

                <div className={styles.uploadFloatingWindow}>

                  <div className={styles.uploadHeader}>
                    <span>{t('dig.uploading')}</span>

                    <button
                      className={styles.closeButton}
                      onClick={handleCancelUpload}
                      title={t('dig.cancel')}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>

                  {uploadQueue.map((item) => (
                    <div key={item.id} className={styles.uploadItem}>

                      <div className={styles.uploadItemTop}>
                        <span className={styles.uploadFileName}>
                          {item.fileName}
                        </span>

                        <div className={styles.uploadStatus}>
                          {item.status === "uploading" && (
                            <span className={styles.progressText}>
                              {item.progress}%
                            </span>
                          )}

                          {item.status === "success" && (
                            <span className={`${styles.statusBadgeUpload} ${styles.successBadge}`}>
                              ✓
                            </span>
                          )}

                          {item.status === "error" && (
                            <span className={`${styles.statusBadgeUpload} ${styles.errorBadge}`}>
                              ✕
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>

                    </div>
            ))}

            </div>
          </>
        )}
    </div>
  );
}
