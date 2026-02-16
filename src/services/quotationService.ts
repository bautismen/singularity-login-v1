import {QuotationRequest} from '../types/requestQuotation';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quotation-requests`;
//const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_REQUESTQUOTATION = import.meta.env.VITE_REQUESTQUOTATION;
const API_KEYX = import.meta.env.VITE_APIKEYPRICING;
const API_KEYPRICING = import.meta.env.VITE_API_KEYPRICING;


/*interface QuotationRequest {
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
}*/

export const quotationService = {
  async getAll() {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEYPRICING}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEYX,
      },
    });

    if (!response.ok) {
      throw new Error('Error al cargar las cotizaciones');
    }

    return response.json();
  },

  async getById(id: string) {
    const response = await fetch(`${API_REQUESTQUOTATION}/v1/api/quotationrequest/getById?id=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEYPRICING}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEYX,
      },
    });
    console.log('API: ', response)
    if (!response.ok) {
      throw new Error('Error al cargar la cotización');
    }

    return response.json();
  },

  async create(data: QuotationRequest) {
    const response = await fetch(`${API_REQUESTQUOTATION}/v1/api/quotationrequest/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYPRICING}`,
        'Content-Type': 'application/json',
         'x-api-key': API_KEYX,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al crear la cotización');
    }

    return response.json();
  },

  async update(data: QuotationRequest) {
    const response = await fetch(`${API_REQUESTQUOTATION}/v1/api/quotationrequest/`, {
      method: 'PUT',
      headers: {       
        'Content-Type': 'application/json',
         'x-api-key': API_KEYX,
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
        'Authorization': `Bearer ${API_KEYPRICING}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEYX,
      },
    });

    if (!response.ok) {
      throw new Error('Error al eliminar la cotización');
    }

    return response.json();
  },
};
