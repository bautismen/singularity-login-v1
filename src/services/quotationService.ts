const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quotation-requests`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface QuotationRequest {
  reference_request: string;
  priority: number;
  customer_category: number;
  _id_status_request: number;
  status_request_name: string;
  request_date: Date | string;
  deadline_date?: Date | string;
  _id_request_type: number;
  request_type_name: string;
  _id_customer?: string;
  customer_business_name: string;
  licitation: boolean;
  requesting_data: {
    _id_executive: string;
    complete_name: string;
  };
  assigned_to: Array<{
    _id_executive: string;
    complete_name: string;
    control_number: string;
  }>;
  services: any[];
}

export const quotationService = {
  async getAll() {
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

    return response.json();
  },

  async getById(id: string) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al cargar la cotización');
    }

    return response.json();
  },

  async create(data: QuotationRequest) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al crear la cotización');
    }

    return response.json();
  },

  async update(id: string, data: Partial<QuotationRequest>) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la cotización');
    }

    return response.json();
  },

  async delete(id: string) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al eliminar la cotización');
    }

    return response.json();
  },
};
