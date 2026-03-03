import {AsignateToRequest, ChangeStatusRequest, QuotationRequest} from '../types/requestQuotation';

//const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quotation-requests`;
const API_REQUESTQUOTATION = import.meta.env.VITE_REQUESTQUOTATION;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;
const API_KEYSL = import.meta.env.VITE_APIKEYSL;


export const quotationService = {

  async getRecentQuotations() {
    const response = await fetch(`${API_REQUESTQUOTATION}/operations/v1/kl/quotationrequest/getRecentRequestQuotations?limit_=200`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKENSL}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEYSL,
      },
    });
    if (!response.ok) {
        throw new Error('Error al cargar las cotizaciones');
    }
    if (response.status === 204) {
        throw new Error('No hay solicitudes disponibles');        
    }
    const data = await response.json()
    return {data: data.data || []};
  },

  async getById(id: string) {
    const response = await fetch(`${API_REQUESTQUOTATION}/operations/v1/kl/quotationrequest/getById?id=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKENSL}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEYSL,
      },
    });
    if (!response.ok) {
      throw new Error('Error al cargar la cotización');
    }
    return response.json();
  },

  async create(data: QuotationRequest) {
    const response = await fetch(`${API_REQUESTQUOTATION}/operations/v1/kl/quotationrequest/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKENSL}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEYSL,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al crear la cotización');
    }

    return response.json();
  },

  async update(data: QuotationRequest) {    
    const response = await fetch(`${API_REQUESTQUOTATION}/operations/v1/kl/quotationrequest/update`, {
      method: 'PUT',
      headers: {   
        'Authorization': `Bearer ${API_TOKENSL}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEYSL,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la cotización');
    }
    return response.json();
  },

  /*async delete(id: string) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
         'Authorization': `Bearer ${API_TOKENSL}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEYSL,
      },
    });
    if (!response.ok) {
      throw new Error('Error al eliminar la cotización');
    }

    return response.json();
  },*/

  async changeStatus(data: ChangeStatusRequest) {    
    const response = await fetch(`${API_REQUESTQUOTATION}/operations/v1/kl/quotationrequest/changestatus`, {
      method: 'PUT',
      headers: {   
        'Authorization': `Bearer ${API_TOKENSL}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEYSL,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la cotización');
    }

    return response.json();
  },

  async AsignateExecutive(data: AsignateToRequest) {    
       try {
          const response = await fetch(
              `${API_REQUESTQUOTATION}/operations/v1/kl/quotationrequest/addasigneto`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${API_TOKENSL}`,
                  'Content-Type': 'application/json',
                  'x-api-key': API_KEYSL,
                },
                body: JSON.stringify(data),
              }
            );    
  
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al asignar el ejecutivo de pricing a la solicitud de cotización');
          }
  
          return response.json();
      } catch (error: any) {
        console.error('Fetch error:', error);
        throw new Error(error.message || 'Error de conexión al asignar el ejecutivo de pricing a la solicitud de cotización');
      }
    }

};
