import { useState, useEffect } from 'react';
import { StatusRequestQuotation } from '../types/requestQuotation'

export interface QuotationRequestFormData {
  referenceRequest: string;
  customerId: string;
  client: string;
  prospect: string;
  showProspect: boolean;
  isPriority: boolean;
  isLicitation: boolean;
  customerCategory: number;
  requestTypeId: number;
  requestType: string;
  created: string;
  responseDeadline: string;
  statuscomments: string | null;
  idStatusRequest: StatusRequestQuotation;
}

interface UseQuotationRequestFormProps {
  mode: 'create' | 'edit' | 'view';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useRequestQuotationForm = ({ mode }: UseQuotationRequestFormProps) => {

  const [formData, setFormData] = useState<QuotationRequestFormData>({
    referenceRequest: 'QR...',
    customerId: '',
    client: '',
    prospect: '',
    showProspect: false,
    isPriority: false,
    isLicitation: false,
    customerCategory: 1,
    requestTypeId: 0,
    requestType: '',
    created: new Date().toISOString().split('T')[0],
    responseDeadline: '',
    statuscomments: null,
    idStatusRequest:  StatusRequestQuotation.Creada,
  });

  // ── Al crear, calcula el deadline automáticamente ────────────────────────────
  useEffect(() => {
    if (mode === 'create') {
      setFormData(prev => ({
        ...prev,
        responseDeadline: calculateResponseDeadline(prev.created).toISOString().split('T')[0],
      }));
    }
  }, [mode]);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /** Calcula 2 días hábiles a partir de una fecha ISO (string 'YYYY-MM-DD') */
  const calculateResponseDeadline = (fromDate: string): Date => {
    const [year, month, day] = fromDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    let workingDays = 0;

    while (workingDays < 2) {
      date.setDate(date.getDate() + 1);
      const d = date.getDay();
      if (d !== 0 && d !== 6) workingDays++;
    }
    return date;
  };

  const formatDateForInput = (date: string): string => {
    if (!date) return '';
    return date.split('T')[0];
  };

  // ── Acciones ─────────────────────────────────────────────────────────────────

  const updateRequestFormData = (changes: Partial<QuotationRequestFormData>) => {
    setFormData(prev => ({ ...prev, ...changes }));
  };

  const resetRequestFormData = () => {
    const created = new Date().toISOString().split('T')[0];
    setFormData({
      referenceRequest: 'QR...',
      customerId: '',
      client: '',
      prospect: '',
      showProspect: false,
      isPriority: false,
      isLicitation: false,
      customerCategory: 1,
      requestTypeId: 0,
      requestType: '',
      created,
      responseDeadline: calculateResponseDeadline(created).toISOString().split('T')[0],
      statuscomments: null,
      idStatusRequest: 1,
    });
  };

  /** Hidrata el form con datos que vienen del API (modo edit/view) */
  const setRequestFormData = (data: any) => {
    setFormData({
      referenceRequest: data.referenceRequest || '',
      customerId: data.customer?.idCustomer || '',
      client: data.customer?.customerName || '',
      prospect: data.customer?.prospectName || '',
      showProspect: !!data.customer?.prospectName,
      isPriority: data.priority === 1,
      isLicitation: data.licitation === 1,
      customerCategory: data.customer?.customerCategory || 1,
      requestTypeId: data.idRequestType?.toString() || 1,
      requestType: data.typeRequest || '',
      created: data.dateRequest
        ? new Date(data.dateRequest).toISOString().split('T')[0]
        : '',
      responseDeadline: data.dateDeadline
        ? new Date(data.dateDeadline).toISOString().split('T')[0]
        : '',
      statuscomments: data.statusComment || null,
      idStatusRequest: data.idStatusRequest || 1,
    });
  };

  return {
    formData,
    updateRequestFormData,
    resetRequestFormData,
    setRequestFormData,
    calculateResponseDeadline,
    formatDateForInput,
  };
};