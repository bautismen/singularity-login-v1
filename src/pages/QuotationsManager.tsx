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
    console.log('BACK',newId);
    if (newId) {
    setHighlightId(newId);
    }
    setSelectedQuotationId(null);
    setViewMode('list');
  };

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
