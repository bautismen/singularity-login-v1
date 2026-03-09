import { useState, useEffect, DragEvent, useRef } from "react";
import JSZip from "jszip";
import { useLanguage } from '../contexts/LanguageContext';
import { saveAs } from "file-saver";
import { Modal } from "../components/Modal";
import {
  RefreshCw,
  Filter,
  FilterX,
  UploadCloud,
  Trash2,
  Cloud,
  ArrowUp,X,
  ChevronUp, ChevronDown,
  Search,
  Plus
} from "lucide-react";
import { GrCloudDownload  } from "react-icons/gr";

import { FaFilePdf } from "react-icons/fa";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoDocumentText } from "react-icons/io5";
import { useAuth } from '../contexts/AuthContext';
import {
  DigitizationDocument, 
  DocumentTypeDTO,
  SectionDTO
} from "../types/digitization";
import {
  getDocumentsByReference,
  getDocumentsByReferenceSection,
  getDocumentsByReferenceSectionType,
  getRecentDocuments,
  SearchDocumentsByNameReferenceCustomer,
  downloadDocument,
  uploadDocuments,
  deleteDocument,
  getDocumentTypes,
  getSections
} from "../services/digitizationService";
import styles from "./Digitization.module.css";
import { useNotification } from "../contexts/NotificationContext";

interface UploadItem {
  id: string;
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
}

const Digitization = () => {

  const { showError, showSuccess } = useNotification();
  const { t } = useLanguage();
  /* ================= STATE ================= */
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DigitizationDocument[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<DigitizationDocument[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [seccionFilter, setSeccionFilter] = useState<number | "">("");
const [documentTypeFilter, setDocumentTypeFilter] = useState<number | "">("");
const [seccionUpload, setSeccionUpload] = useState<number | "">("");
const [documentTypeUpload, setDocumentTypeUpload] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [isSearchResult, setIsSearchResult] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDTO[]>([]);
  const [sections, setSections] = useState<SectionDTO[]>([]);
  const [referenceFilter, setReferenceFilter] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const hasDocuments = recentDocuments.length > 0;
const [openReference, setOpenReference] = useState(true);
const [openSection, setOpenSection] = useState(true);
const [openDocType, setOpenDocType] = useState(true);

const refReference = useRef<HTMLDivElement>(null);
const refSection = useRef<HTMLDivElement>(null);
const refDocType = useRef<HTMLDivElement>(null);

  /* ========= UPLOAD MODAL ========= */

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);

  const [referenceUpload, setReferenceUpload] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);


  const [modalState, setModalState] = useState<{
  isOpen: boolean;
  type: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const toggleSelectAll = () => {

  if (!selectAll) {
    setSelectedDocuments(
      recentDocuments.map(doc => doc.documentId)
    );
  } else {
    setSelectedDocuments([]);
  }

  setSelectAll(!selectAll);
};

  /* ================= DELETE ================= */
const handleDelete = (id: number, name: string) => {

  setModalState({
    isOpen: true,
    type: 'confirm',
    title: t('dig.deleteDocument'),
    message: t('dig.deleteDocumentConfirm')
      .replace('{{name}}', name),
    showCancel: true,
    onConfirm: async () => {

      try {

        const response = await deleteDocument(id);

        if (![200, 204].includes(response.codeStatus)) {
          throw new Error(response.messageStatus);
        }

        showSuccess(t('dig.deleteSuccess'));

        await loadRecentDocuments();

      } catch (error: any) {
        showError(t('dig.deleteError'));
      }
    }
  });
};

  /* ================= consultar por barra de busqueda ================= */
const handleSearchDocuments = async (term: string) => {

  if (!term.trim()) {
    loadRecentDocuments();
    return;
  }

  try {

    setLoading(true);

    const docs = await SearchDocumentsByNameReferenceCustomer(term);

    const sorted = [...docs].sort(
      (a, b) =>
        new Date(b.registrationDate).getTime() -
        new Date(a.registrationDate).getTime()
    );

    setRecentDocuments(sorted);
    setDocuments(sorted);
    setIsSearchResult(true);

  } catch (error) {

    showError(t('dig.searchError'));

  } finally {
    setLoading(false);
  }
};

useEffect(() => {

  const delay = setTimeout(() => {

    if (searchTerm) {
      handleSearchDocuments(searchTerm);
    } else {
      loadRecentDocuments();
    }

  }, 500); // espera 500ms

  return () => clearTimeout(delay);

}, [searchTerm]);

  /* ================= cierra modal carga documentos ================= */
const closeUploadModal = () => {
  setShowUploadModal(false);
  setPreviewFiles([]);
  setFiles([]);
  setReferenceUpload("");
  setDocumentTypeUpload("");
  setSeccionUpload("");
};

  /* ================= abrir/cerrar filtrado de la barra ================= */

const toggleFilters = () => {
  setShowFilters(prev => {
    const willClose = prev;

    // Si el panel se está cerrando → limpiar todo
    if (willClose) {
      setReferenceFilter("");
      setSeccionFilter("");
      setDocumentTypeFilter("");
      setSelectedDocuments([]);
      setSelectAll(false);
      loadRecentDocuments();
    }

    return !prev;
  });
};
  /* ================= LOAD RECENT ================= */

const fetchDocuments = async () => {
  if (!referenceFilter) {
    showError(t('dig.referenceRequired'));
    return;
  }

  try {
    setLoading(true);

    let docs: DigitizationDocument[] = [];

    const ref = referenceFilter;
    const section = seccionFilter ? String(seccionFilter) : "";
    const docType = documentTypeFilter ? String(documentTypeFilter) : "";

    //3 filtros → API más específica
    if (ref && section && docType) {
      docs = await getDocumentsByReferenceSectionType(
        ref,
        section,
        docType
      );
    }
    // referencia + sección
    else if (ref && section) {
      docs = await getDocumentsByReferenceSection(
        ref,
        section
      );
    }
    // solo referencia
    else if (ref) {
      docs = await getDocumentsByReference(ref);
    }

    const sorted = [...docs].sort(
      (a, b) =>
        new Date(b.registrationDate).getTime() -
        new Date(a.registrationDate).getTime()
    );

    setDocuments(sorted);
    setRecentDocuments(sorted);
    setIsSearchResult(true);

    setSelectedDocuments(sorted.map(doc => doc.documentId));
    setSelectAll(sorted.length > 0);

  } catch (err: any) {
    setDocuments([]);
    setRecentDocuments([]);
    showError(t('dig.catalogError'));
  } finally {
    setLoading(false);
  }
};

  const loadRecentDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getRecentDocuments(18);

      const sorted = [...docs].sort(
        (a, b) =>
          new Date(b.registrationDate).getTime() -
          new Date(a.registrationDate).getTime()
      );

      setRecentDocuments(sorted);
      setDocuments(sorted);
      setIsSearchResult(false);
    } catch (err: any) {
      showError(t('dig.catalogError'));
    } finally {
      setLoading(false);
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

 useEffect(() => {
  loadRecentDocuments();
  loadCatalogs();
}, []);

  useEffect(() => {

  if (!recentDocuments.length) {
    setSelectAll(false);
    return;
  }

  setSelectAll(
    selectedDocuments.length === recentDocuments.length
  );

}, [selectedDocuments, recentDocuments]);

  /* ================= DOWNLOAD ================= */

  const handleDownload = async (id: number) => {
    try {
      const response = await downloadDocument(id);

      if (response.codeStatus === 200) {
        const { fileBytes, fileName } = response.meta;

        const byteCharacters = atob(fileBytes);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const blob = new Blob([new Uint8Array(byteNumbers)]);
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);

        showSuccess(
          t('dig.fileDownloaded').replace('{{name}}', fileName)
        );
        setSelectedDocuments([]);
        setSelectAll(false);
      } else {
      showError(t('dig.downloadError'));
      }
    } catch {
      showError(t('dig.downloadFailed'));
    }
  };

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

  const handleBulkDownload = async () => {
      try {

        if (selectedDocuments.length === 0) return;

        // SOLO 1 → descarga normal
        if (selectedDocuments.length === 1) {
          await handleDownload(selectedDocuments[0]);
          return;
        }

        // MÁS DE 1 → crear ZIP
        const zip = new JSZip();

        for (const id of selectedDocuments) {

          const response = await downloadDocument(id);

          if (response.codeStatus === 200) {

            const { fileBytes, fileName } = response.meta;

            // convertir base64 a binary
            const byteCharacters = atob(fileBytes);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const fileData = new Uint8Array(byteNumbers);

            zip.file(fileName, fileData);
          }
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });

        const nombre = `${t('dig.documents')}_${new Date().toISOString().slice(0,10)}.zip`;
        
        saveAs(zipBlob, nombre);

        showSuccess(
          t('dig.zipDownloaded')
            .replace('{{count}}', String(selectedDocuments.length))
        );
        setSelectedDocuments([]);
        setSelectAll(false);

      } catch {
        showError(t('dig.downloadFilesError'));
      }
    };



  /* ================= UPLOAD ================= */

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
    setPreviewFiles(prev => [...prev, ...droppedFiles]);
  };

    const handleResetFilters = () => {
    setReferenceFilter("");
    setSeccionFilter("");
    setDocumentTypeFilter("");
  };

const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

   /* ================= UPLOAD ================= */

const uploadFiles = async () => {
  if (
    !referenceUpload ||
    !seccionUpload ||
    !documentTypeUpload ||
    files.length === 0
  ) {
    showError(t('dig.uploadValidation'));
    return;
  }

  abortControllerRef.current = new AbortController();
  setUploading(true);

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

        //  estado uploading
        setUploadQueue(prev =>
          prev.map(item =>
            item.id === currentId
              ? { ...item, status: "uploading", progress: 25 }
              : item
          )
        );

        await sleep(150);

        //  estado uploading
        setUploadQueue(prev =>
          prev.map(item =>
            item.id === currentId
              ? { ...item, status: "uploading", progress: 50 }
              : item
          )
        );

        //  Upload real
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

        // success solo si no hubo error
        setUploadQueue(prev =>
          prev.map(item =>
            item.id === currentId
              ? { ...item, status: "success", progress: 75 }
              : item
          )
        );

        await sleep(150);

        // success solo si no hubo error
        setUploadQueue(prev =>
          prev.map(item =>
            item.id === currentId
              ? { ...item, status: "success", progress: 100 }
              : item
          )
        );

        showSuccess(
          t('dig.fileUploaded').replace('{{name}}', file.name)
        );
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

    setFiles([]);
    
    setPreviewFiles([]);

    await loadRecentDocuments();

    handleResetFilters();

    closeUploadModal();

    setTimeout(() => {
      setUploadQueue([]);
    }, 2000);
  }

  } catch (error: any) {

    if (error.name === "AbortError") {
      showError(t('dig.uploadCanceled'));
    } else {
      showError(t('dig.uploadError'));
    }

  } finally {
    setUploading(false);
    abortControllerRef.current = null;
  }
};

const getFileIcon = (name?: string) => {
  const ext = name?.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return <FaFilePdf size={22} className={styles.iconPdf} />;
    case "xls":
    case "xlsx":
      return <PiMicrosoftExcelLogoFill size={22} className={styles.iconExcel} />;
    default:
      return <IoDocumentText size={22} className={styles.iconDoc} />;
  }
};

  /* ================= RENDER ================= */

  return (
    <div className={styles.contentWrapper}>
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersPanelHeader}>
            <h3>{t('dig.refineSearch')}</h3>
          </div>

          {/* REFERENCIA */}
          <div className={styles.filterSection}>
            <div className={styles.headerRow}>
              <h4 className={styles.filterTitle}>{t('dig.reference')}</h4>
              <button
                onClick={() => setOpenReference(!openReference)}
                className={styles.iconbutonlucide}
              >
                {openReference ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            <div
              ref={refReference}
              style={{
                maxHeight: openReference
                  ? refReference.current?.scrollHeight + "px"
                  : "0px",
                overflow: "hidden",
                transition: "max-height 0.3s ease"
              }}
            >
              <input
                type="text"
                placeholder={t('dig.searchReference')}
                value={referenceFilter}
                onChange={(e) => setReferenceFilter(e.target.value)}
                className={styles.executiveSelect}
              />
            </div>
          </div>

          {/* SECCIÓN */}
          <div className={styles.filterSection}>
            <div className={styles.headerRow}>
              <h4 className={styles.filterTitle}>{t('dig.section')}</h4>
              <button
                onClick={() => setOpenSection(!openSection)}
                className={styles.iconbutonlucide}
              >
                {openSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            <div
              ref={refSection}
              style={{
                maxHeight: openSection
                  ? refSection.current?.scrollHeight + "px"
                  : "0px",
                overflow: "hidden",
                transition: "max-height 0.3s ease"
              }}
            >
              <select
                value={seccionFilter}
                onChange={(e) =>
                  setSeccionFilter(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className={styles.executiveSelect}
              >
                <option value="">{t('dig.all')}</option>
                {sections.map(s => (
                  <option key={s.sectionid} value={s.sectionid}>
                    {s.section}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TIPO DOCUMENTO */}
          <div className={styles.filterSection}>
            <div className={styles.headerRow}>
              <h4 className={styles.filterTitle}>{t('dig.documentType')}</h4>
              <button
                onClick={() => setOpenDocType(!openDocType)}
                className={styles.iconbutonlucide}
              >
                {openDocType ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            <div
              ref={refDocType}
              style={{
                maxHeight: openDocType
                  ? refDocType.current?.scrollHeight + "px"
                  : "0px",
                overflow: "hidden",
                transition: "max-height 0.3s ease"
              }}
            >
              <select
                value={documentTypeFilter}
                onChange={(e) =>
                  setDocumentTypeFilter(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className={styles.executiveSelect}
              >
                <option value="">{t('dig.all')}</option>
                {documentTypes.map(d => (
                  <option key={d.documenttypeid} value={d.documenttypeid}>
                    {d.documentnametype}
                  </option>
                ))}
              </select>
            </div>
          </div>

          

          {/* BOTONES */}
          <div className={styles.filterActions}>
            <button
              className={styles.resetButton}
              onClick={() => {
                setReferenceFilter("");
                setSeccionFilter("");
                setDocumentTypeFilter("");
                loadRecentDocuments();
              }}
            >
              {t('dig.restore')}
            </button>

            <button
              className={styles.applyButton}
              onClick={() => fetchDocuments()}
            >
              {t('dig.apply')}
            </button>
          </div>

        </div>
      )}

      <div className={styles.container}>

        {/* ===== HEADER ===== */}
        <div className={styles.header}>
          <h1 className={styles.title}>{t('dig.title')}</h1>

          <div className={styles.buttonGroup}>
            <button
              onClick={loadRecentDocuments}
              className={`${styles.headerButton} `}
              disabled={loading}
              title={t('dig.refresh')}
            >
              <RefreshCw size={20} />
            </button>

            <button
              onClick={toggleFilters}
              className={styles.headerButton}
              title={t('dig.filters')}
            >
          {showFilters ? <FilterX size={20} /> : <Filter size={20} />}
            </button>

            <button
              onClick={() => {
                setShowUploadModal(true);

                // limpiar selección al abrir modal
                setSelectedDocuments([]);
                setSelectAll(false);
              }}
              className={styles.headerButton}
              title={t('dig.uploadFiles')}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
        {/* ===== SEARCH BAR ===== */}
        <div className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t('dig.searchDocument')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={() => setSearchTerm("")}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <div className={styles.recentHeaderRow}>
          <h2 className={styles.recentTitle}>
            {t('dig.recentFiles')}
          </h2>

          {hasDocuments && (
            <div
              className={`${styles.selectAllChip} ${
                selectAll ? styles.selectAllChipActive : ""
              }`}
              onClick={toggleSelectAll}
            >
              <div className={styles.selectAllDot} />
              <span>
                {selectAll ? t('dig.unselectAll') : t('dig.selectAll')}
              </span>
            </div>
          )}
        </div>
        {selectedDocuments.length > 0 && (
        <div className={styles.bulkToolbar}>

          <div className={styles.bulkLeft}>
            <div className={styles.bulkCounter}>
              {selectedDocuments.length}
            </div>

            <span className={styles.bulkText}>
              {t('dig.selected')}
            </span>
          </div>

          <div className={styles.bulkActions}>

            <button
              className={styles.DownloadButton}
              onClick={handleBulkDownload}
            >
              <GrCloudDownload size={16} />
              {t('dig.download')}
            </button>

            <button
            className={styles.DeleteDocument}
            onClick={() => {

              setModalState({
                isOpen: true,
                type: 'confirm',
                title: t('dig.deleteDocuments'),
                message: t('dig.deleteDocumentsConfirm')
                  .replace('{{count}}', String(selectedDocuments.length)),
                showCancel: true,
                onConfirm: async () => {

                  try {

                    for (const id of selectedDocuments) {
                      await deleteDocument(id);
                    }

                    showSuccess(t('dig.deleteDocumentsSuccess'));

                    setSelectedDocuments([]);
                    setSelectAll(false);

                    await loadRecentDocuments();

                  } catch (error: any) {
                    showError(t('dig.deleteError'));
                  }

                }
              });

            }}
          >
              <Trash2 size={16} />
              {t('dig.delete')}
            </button>

          </div>

        </div>
      )}
        {/* ===== LISTADO ===== */}

        
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
            </div>
          ) : recentDocuments.length > 0 ? (
            <div className={styles.recentGrid}>
              {recentDocuments.map(doc => (
              <div key={doc.documentId} className={styles.recentCard}>
                <div className={styles.fileInfo}>
                <div className={styles.fileIconContainer}>
                  <div className={styles.fileIcon}>
                    {getFileIcon(doc.documentName)}
                  </div>
                  <input
                    type="checkbox"
                    className={styles.cardCheckbox}
                    checked={selectedDocuments.includes(doc.documentId)}
                    onChange={() => {
                      setSelectedDocuments(prev => {
                        if (prev.includes(doc.documentId)) {
                          return prev.filter(id => id !== doc.documentId);
                        }
                        return [...prev, doc.documentId];
                      });
                    }}
                  />
                </div>
                  <div className={styles.fileText}>
                    <span className={styles.fileName}>
                      {doc.documentName}
                    </span>

                    <span className={styles.fileMetaTypedoc}>
                      {doc.documenttype?.documentNameType ?? ""}
                    </span>

                    <span className={styles.fileMetaReference}>
                      {doc.reference}
                    </span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleDownload(doc.documentId)}
                    title={t('dig.downloadfile')}
                  >
                    <GrCloudDownload size={20} />
                  </button>

                  <button
                    className={styles.actionButtonDelete}
                    onClick={() =>
                      handleDelete(doc.documentId, doc.documentName)
                    }
                    title={t('dig.delete')}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
            </div>
          ): (
            <div className={styles.noResults}>
              {t('dig.noResults')}
            </div>
          )
          }
        </div>
      
      
      {/* ================= MODAL UPLOAD ================= */}

      {showUploadModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.uploadModal}>

            <div className={styles.modalHeader}>
              <h3>{t('dig.uploadDocuments')}</h3>
              <button onClick={closeUploadModal} className={styles.closeButton}>
                                  <X size={24} />
                                </button>
            </div>

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
              onClick={() => document.getElementById("fileInputModal")?.click()}
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

            {previewFiles.length > 0 && (
            <div className={styles.uploadFieldsModal}>
              <input
                type="text"
                placeholder={t('dig.reference')}
                value={referenceUpload}
                onChange={(e) => setReferenceUpload(e.target.value)}
              />

              <select
                value={documentTypeUpload}
                onChange={(e) =>
                  setDocumentTypeUpload(e.target.value)
                }
                className={styles.selectupload}
              >
                <option value="">{t('dig.documentType')}</option>
                {documentTypes.map(d => (
                <option key={d.documenttypeid} value={d.documenttypeid}>
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
              >
                <option value="">{t('dig.section')}</option>

                {sections.map(s => (
                  <option
                    key={s.sectionid}
                    value={s.sectionid}
                  >
                    {s.section}
                  </option>
                ))}
              </select>

              {/* BOTÓN AQUÍ */}
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
            )}
            {/* ===== ARCHIVOS SELECCIONADOS QUE SE CARGARON AL MODAL UPLOAD ===== */}
            {previewFiles.length > 0 && (
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
            )}      

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
                            <span className={`${styles.statusBadge} ${styles.successBadge}`}>
                              ✓
                            </span>
                          )}

                          {item.status === "error" && (
                            <span className={`${styles.statusBadge} ${styles.errorBadge}`}>
                              ✕
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={styles.progressBar}>
                        <div
                          className={`${styles.progressFill} ${
                            item.status === "error" ? styles.progressError : ""
                          } ${
                            item.status === "success" ? styles.progressSuccess : ""
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>

                    </div>
                  ))}

            </div>
          </>
        )}
      
      {/* ================= CONFIRM DELETE ================= */}
        <Modal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onConfirm={modalState.onConfirm}
          title={modalState.title}
          message={modalState.message}
          type={modalState.type}
          showCancel={modalState.showCancel}
          confirmText={t('dig.delete')}
          cancelText={t('dig.cancel')}
        />

    </div>
  );
};

export default Digitization;