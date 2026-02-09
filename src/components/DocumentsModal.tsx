import React, { useState } from 'react';
import { X, Upload, Eye, Trash2, FileText } from 'lucide-react';
import styles from './DocumentsModal.module.css';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
}

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestData: {
    companyName: string;
    reference: string;
    location: string;
  };
}

export function DocumentsModal({ isOpen, onClose, requestData }: DocumentsModalProps) {
  const [documentType, setDocumentType] = useState('tarifa-final');
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'documento_1982', type: 'Tarifa', uploadedBy: 'Magali Tamayo Carrillo' },
    { id: '2', name: 'documento_1981', type: 'Tarifa', uploadedBy: 'Magali Tamayo Carrillo' },
  ]);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      console.log('Archivos seleccionados:', files);
    }
  };

  const handleViewDocument = (docId: string) => {
    console.log('Ver documento:', docId);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Nuevos Documentos</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.requestInfo}>
            <div className={styles.requestIcon}>
              <FileText size={20} color="#1B96A8" />
            </div>
            <div className={styles.requestDetails}>
              <h3 className={styles.companyName}>{requestData.companyName}</h3>
              <div className={styles.requestMeta}>
                <span className={styles.requestReference}>{requestData.reference}</span>
                <span className={styles.requestLocation}>{requestData.location}</span>
              </div>
            </div>
          </div>

          <div className={styles.uploadSection}>
            <div
              className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload size={48} className={styles.uploadIcon} />
              <p className={styles.dropZoneText}>Arrastre sus documentos aquí</p>
              <p className={styles.dropZoneSubtext}>Solo archivos PDF</p>
              <input
                type="file"
                accept=".pdf"
                multiple
                className={styles.fileInput}
                onChange={handleFileSelect}
                id="file-upload"
              />
            </div>

            <div className={styles.documentTypeSection}>
              <label className={styles.documentTypeLabel}>
                <span className={styles.required}>*</span> Tipo de documento
              </label>
              <select
                className={styles.documentTypeSelect}
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="tarifa-final">Tarifa final</option>
                <option value="cotizacion">Cotización</option>
                <option value="contrato">Contrato</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <button className={styles.addDocumentButton}>
              <span className={styles.plusIcon}>+</span>
              Agregar documentos
            </button>
          </div>

          <div className={styles.documentsListSection}>
            {documents.map((doc) => (
              <div key={doc.id} className={styles.documentItem}>
                <div className={styles.documentItemLeft}>
                  <div className={styles.documentDots}>⋮</div>
                  <FileText size={20} color="#3B82F6" />
                  <span className={styles.documentName}>{doc.name}</span>
                </div>
                <div className={styles.documentItemCenter}>
                  <span className={styles.documentType}>{doc.type}</span>
                </div>
                <div className={styles.documentItemRight}>
                  <div className={styles.documentUser}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>{doc.uploadedBy}</span>
                  </div>
                  <div className={styles.documentActions}>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleViewDocument(doc.id)}
                      title="Ver documento"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleDeleteDocument(doc.id)}
                      title="Eliminar documento"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
