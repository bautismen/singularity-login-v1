import { useState, useEffect } from 'react';
import { QuotationsList } from './QuotationsList';
import { Quotations } from './Quotations';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export function QuotationsManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    if(highlightId) {
      const timer = setTimeout(() => {
        setHighlightId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightId])

  const handleCreateNew = () => {
    setSelectedQuotationId(null);
    setViewMode('create');
  };

  const handleEdit = (id: string) => {
    setSelectedQuotationId(id);
    setViewMode('edit');
  };

  const handleView = (id: string) => {
    setSelectedQuotationId(id);
    setViewMode('view');
  };

  const handleBack = (newId? : string) => {
    if (newId) {
    setHighlightId(newId);
    }
    setSelectedQuotationId(null);
    setViewMode('list');
  };

  /* Al cargar la página, verificamos si hay una cotización específica que se deba abrir
  * esto se puede establecer desde otras partes de la aplicación al guardar el ID de la cotización en sessionStorage 
  * con la clave 'quotationToOpen'. Si se encuentra un ID, se cambia el modo de vista a 'view'
  * para mostrar esa cotización directamente. Después de intentar abrir la cotización,
  * se limpia el valor de sessionStorage para evitar comportamientos inesperados en futuras visitas a esta página.
  * un ejemplo cuando se invoca desde el dashboard al hacer click ver mas en una cotización urgente o reciente
  */
  useEffect(() => {
    try {
      const ref_id = sessionStorage.getItem('quotationToOpen');
      if (ref_id) {
        setSelectedQuotationId(ref_id);
        setViewMode('view');
      }
    } catch {
      // Ignorado intencionalmente: este error no afecta la UI
    } finally {
      try {sessionStorage.removeItem('quotationToOpen'); } catch { /** ignorado */ }
    }
  }, []);

  if (viewMode === 'list') {
    return (
      <QuotationsList
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onView={handleView}
        highlightId={highlightId}
      />
    );
  }

  return (
    <Quotations
      mode={viewMode}
      quotationId={selectedQuotationId}
      onBack={handleBack}
    />
  );
}
