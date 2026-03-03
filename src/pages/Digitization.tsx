import { useState, useEffect, DragEvent, useRef } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import {
  RefreshCw,
  Filter,
  FilterX,
  ChevronDown,
  ChevronUp,
  Download,
  UploadCloud,
  Trash2,
  Cloud,
  ArrowDown,
  ArrowUp,X,
  Plus
} from "lucide-react";

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

  /* ================= STATE ================= */
  const { user } = useAuth();   // 👈 aquí sí se puede usar
  const [documents, setDocuments] = useState<DigitizationDocument[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<DigitizationDocument[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [isBouncing, setIsBouncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const handleUpload = async () => {
  setIsBouncing(true);

  setTimeout(() => {
    setIsBouncing(false);
  }, 500);

  await uploadFiles();
};

  /* ========= UPLOAD MODAL ========= */

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);

  const [referenceUpload, setReferenceUpload] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

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

    // 🔥 Si el panel se está cerrando → limpiar todo
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
    showError("Debe ingresar una referencia");
    return;
  }

  try {
    setLoading(true);
    setError(null);

    let docs: DigitizationDocument[] = [];

    const ref = referenceFilter;
    const section = seccionFilter ? String(seccionFilter) : "";
    const docType = documentTypeFilter ? String(documentTypeFilter) : "";

    // ✅ 3 filtros → API más específica
    if (ref && section && docType) {
      docs = await getDocumentsByReferenceSectionType(
        ref,
        section,
        docType
      );
    }
    // ✅ referencia + sección
    else if (ref && section) {
      docs = await getDocumentsByReferenceSection(
        ref,
        section
      );
    }
    // ✅ solo referencia
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
    setError(err.message);
    setDocuments([]);
    setRecentDocuments([]);
    showError(err.message);
  } finally {
    setLoading(false);
  }
};

  const loadRecentDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getRecentDocuments(20);

      const sorted = [...docs].sort(
        (a, b) =>
          new Date(b.registrationDate).getTime() -
          new Date(a.registrationDate).getTime()
      );

      setRecentDocuments(sorted);
      setDocuments(sorted);
      setIsSearchResult(false);
    } catch (err: any) {
      setError(err.message);
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

        showSuccess(`Archivo ${fileName} descargado`);
        setSelectedDocuments([]);
        setSelectAll(false);
      } else {
        showError("Error al descargar archivo");
      }
    } catch {
      showError("No se pudo descargar el archivo");
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
    showError("Error al cargar catálogos");
  }
};

  const handleBulkDownload = async () => {
      try {

        if (selectedDocuments.length === 0) return;

        // ✅ SOLO 1 → descarga normal
        if (selectedDocuments.length === 1) {
          await handleDownload(selectedDocuments[0]);
          return;
        }

        // ✅ MÁS DE 1 → crear ZIP
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

        const nombre = `Documentos_${new Date().toISOString().replace(/[:.-]/g, "_")}.zip`;
        saveAs(zipBlob, nombre);

        showSuccess(`${selectedDocuments.length} archivos descargados en ZIP`);

        setSelectedDocuments([]);
        setSelectAll(false);

      } catch {
        showError("Error al descargar archivos");
      }
    };

  /* ================= DELETE ================= */

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const response = await deleteDocument(deleteTarget.id);

      if (![200, 204].includes(response.codeStatus)) {
        throw new Error(response.messageStatus);
      }

      showSuccess("Documento eliminado");
      loadRecentDocuments();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setDeleteTarget(null);
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
   /* ================= UPLOAD ================= */

const uploadFiles = async () => {
  if (
    !referenceUpload ||
    !seccionUpload ||
    !documentTypeUpload ||
    files.length === 0
  ) {
    showError("Debes llenar los campos referencia, tipo doc. y sección");
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
              ? { ...item, status: "uploading", progress: 50 }
              : item
          )
        );

        // 🔥 Upload real
        await uploadDocuments(
          referenceUpload,
          Number(seccionUpload),
          Number(documentTypeUpload),
          [file],
          abortControllerRef.current?.signal
        );

        // ✅ success solo si no hubo error
        setUploadQueue(prev =>
          prev.map(item =>
            item.id === currentId
              ? { ...item, status: "success", progress: 100 }
              : item
          )
        );

        showSuccess(`Registro del archivo ${file.name}`);

      } catch (err: any) {

        if (err.name === "AbortError") throw err;

        setUploadQueue(prev =>
          prev.map(item =>
            item.id === currentId
              ? { ...item, status: "error", progress: 100 }
              : item
          )
        );

        showError(`Error al subir ${file.name}`);
      }
    }

    if (!abortControllerRef.current?.signal.aborted) {

      setFiles([]);
      setPreviewFiles([]);

      await loadRecentDocuments();
      handleResetFilters();

      setTimeout(() => {
        setUploadQueue([]);
      }, 2000);
    }

  } catch (error: any) {

    if (error.name === "AbortError") {
      showError("Carga cancelada");
    } else {
      showError("Error al subir archivos");
    }

  } finally {
    setUploading(false);
    abortControllerRef.current = null;
  }
};

  /* ================= RENDER ================= */

  return (
    <div className={styles.contentWrapper}>
      
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersHeader}>
            <h3>Refina tu búsqueda</h3>
          </div>

          {/* REFERENCIA */}
          <div className={styles.filterBlock}>
            <label>Referencia</label>
            <input
              type="text"
              placeholder="Buscar referencia..."
              value={referenceFilter}
              onChange={(e) => setReferenceFilter(e.target.value)}
              className={styles.input}
            />
          </div>

          {/* SECCIÓN */}
          <div className={styles.filterBlock}>
            <label>Sección</label>
            <select
              value={seccionFilter}
              onChange={(e) =>
                setSeccionFilter(
                e.target.value ? Number(e.target.value) : ""
              )
              }
              className={styles.select}
            >
              <option value="">Todas</option>
              {sections.map(s => (
                <option key={s.sectionid} value={s.sectionid}>
                  {s.section}
                </option>
              ))}
            </select>
          </div>

          {/* TIPO DOCUMENTO */}
          <div className={styles.filterBlock}>
            <label>Tipo de documento</label>
            <select
              value={documentTypeFilter}
              onChange={(e) =>
                setDocumentTypeFilter(
                e.target.value ? Number(e.target.value) : ""
              )
              }
              className={styles.select}
            >
              <option value="">Todos</option>
              {documentTypes.map(d => (
                <option key={d.documenttypeid} value={d.documenttypeid}>
                  {d.documentnametype}
                </option>
              ))}
            </select>
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
              Restaurar
            </button>

            <button
              className={styles.applyButton}
              onClick={() => fetchDocuments()}
            >
              Aplicar
            </button>
          </div>

        </div>
      )}


      <div className={styles.container}>

        {/* ===== HEADER ===== */}
        <div className={styles.header}>
          <h1 className={styles.title}>Digitalización</h1>

          <div className={styles.buttonGroup}>
            <button
              onClick={loadRecentDocuments}
              className={styles.headerButton}
              disabled={loading}
              title="Actualizar"
            >
              <RefreshCw size={20} />
            </button>

            <button
              onClick={toggleFilters}
              className={styles.headerButton}
              title="Filtros"
            >
          {showFilters ? <FilterX size={20} /> : <Filter size={20} />}
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className={styles.headerButton}
              title="Cargar archivos"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
        <div className={styles.recentHeaderRow}>
          <h2 className={styles.recentTitle}>
            Archivos cargados recientemente...
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
                {selectAll ? "Deseleccionar todo" : "Seleccionar todo"}
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
              seleccionados
            </span>
          </div>

          <div className={styles.bulkActions}>

            <button
              className={styles.DownloadButton}
              onClick={handleBulkDownload}
            >
              <Download size={16} />
              Descargar
            </button>

            <button
              className={styles.DeleteDocument}
              onClick={() => {
                selectedDocuments.forEach(id =>
                  setDeleteTarget({
                    id,
                    name: "Documento seleccionado"
                  })
                );
              }}
            >
              <Trash2 size={16} />
              Eliminar
            </button>

          </div>

        </div>
      )}
        {/* ===== LISTADO ===== */}

        <div className={styles.recentGrid}>
          {recentDocuments.length === 0 ? (
            <div className={styles.noResults}>
              No se encontraron resultados
            </div>
          ) : (
            recentDocuments.map(doc => (
              <div key={doc.documentId} className={styles.recentCard}>
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

                <div className={styles.fileInfo}>
                  <div className={styles.fileIcon}>📄</div>

                  <div className={styles.fileText}>
                    <span className={styles.fileName}>
                      {doc.documentName}
                    </span>

                    <span className={styles.fileMeta}>
                      {doc.documenttype?.documentNameType ?? ""}
                    </span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleDownload(doc.documentId)}
                  >
                    <Download size={17} />
                  </button>

                  <button
                    className={styles.actionButtonDelete}
                    onClick={() =>
                      setDeleteTarget({
                        id: doc.documentId,
                        name: doc.documentName
                      })
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      
      {/* ================= MODAL UPLOAD ================= */}

      {showUploadModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.uploadModal}>

            <div className={styles.modalHeader}>
              <h3>Cargar documentos</h3>
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
                Arrastra archivos aquí
              </p>

              <span className={styles.dropSubtitle}>
                o haz clic para seleccionar desde tu equipo
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
                placeholder="Referencia"
                value={referenceUpload}
                onChange={(e) => setReferenceUpload(e.target.value)}
              />

              <select
                value={documentTypeUpload}
                onChange={(e) =>
                  setDocumentTypeUpload(e.target.value)
                }
                className={styles.select}
              >
                <option value="">Tipo documento</option>
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
                className={styles.select}
              >
                <option value="">Sección</option>

                {sections.map(s => (
                  <option
                    key={s.sectionid}
                    value={s.sectionid}
                  >
                    {s.section}
                  </option>
                ))}
              </select>

              {/* 🔥 BOTÓN AQUÍ */}
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
                    ? `Subiendo ${files.length} ${files.length === 1 ? "archivo..." : "archivos..."}`
                    : files.length > 0
                      ? `Subir ${files.length} ${files.length === 1 ? "archivo" : "archivos"}`
                      : "Subir archivo"
                  }
                </div>
              </div>
            </div>
            )}
            {/* ===== ARCHIVOS SELECCIONADOS QUE SE CARGARON AL MODAL UPLOAD ===== */}
            {previewFiles.length > 0 && (
              <div className={styles.modalFilesContainer}>
                <h4 className={styles.modalFilesTitle}>
                  Archivos seleccionados ({previewFiles.length})
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
                    <span>Subiendo archivos...</span>

                    <button
                      className={styles.closeButton}
                      onClick={handleCancelUpload}
                      title="Cancelar"
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
                          className={styles.progressFill}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>

                    </div>
                  ))}

            </div>
          </>
        )}
      
      {/* ================= CONFIRM DELETE ================= */}

      {deleteTarget && (
        <div className={styles.blurOverlay}>
          <div className={styles.confirmModal}>
            <p>¿Eliminar {deleteTarget.name}?</p>
            <button onClick={confirmDelete}>Eliminar</button>
            <button onClick={() => setDeleteTarget(null)}>Cancelar</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Digitization;