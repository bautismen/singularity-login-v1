import { PricingControl,CreatePricingControlAPI,QuotedControlRequest,ResquetQuote } from '../types/pricingControl';

const API_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const PRICING_API_URL = import.meta.env.VITE_PRICING_API_URL;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;
const API_KEYSL = import.meta.env.VITE_APIKEYSL;

class PricingControlService {
  private getHeaders() {
    return {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',      
    };
  }

  private getHeaders2() {
    return {
      'Authorization': `Bearer ${API_TOKENSL}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEYSL,
    };
  }

  async getByRequestId(requestId: string): Promise<PricingControl[]> {
    const response = await fetch(
      `${API_URL}/functions/v1/pricing-controls?requestId=${requestId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener controles de pricing');
    }

    return response.json();
  }

  async getById(id: string): Promise<PricingControl> {
    const response = await fetch(
      `${PRICING_API_URL}/kl/t/opertacion/v1/quotes/quote/getcontrolbyid?idcontrol_=${id}`,
      {
        method: 'GET',
        headers: this.getHeaders2(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener control de pricing');
    }
    const data = await response.json();
    return data.data[0];
  }

  async getResquetById(id: string): Promise<ResquetQuote> {
    const response = await fetch(
      `${PRICING_API_URL}/kl/t/opertacion/v1/quotes/quote/getresquetbyid?idresquet_=${id}`,
      {
        method: 'GET',
        headers: this.getHeaders2(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener control de pricing');
    }
    const data = await response.json();
    return data.data[0];
  }

  async create(data: CreatePricingControlAPI): Promise<PricingControl> {
    try {
      console.log('Creating pricing control with data:', data);
      console.log('API URL:', `${API_URL}/functions/v1/pricing-controls`);
      console.log(JSON.stringify(data));
      const response = await fetch(
        `${PRICING_API_URL}/kl/t/opertacion/v1/quotes/quote/add`,
        {
          method: 'POST',
          headers: this.getHeaders2(),
          body: JSON.stringify(data),
        }
      );

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);

        try {
          const error = JSON.parse(errorText);
          throw new Error(error.message || error.error || 'Error al crear control de pricing');
        } catch (e) {
          throw new Error(errorText || 'Error al crear control de pricing');
        }
      }

      const result = await response.json();
      console.log('Created control:', result);
      return result;
    } catch (error: any) {
      console.error('Fetch error:', error);
      throw new Error(error.message || 'Error de conexión al crear control de pricing');
    }
  }

  async updatenew(data: CreatePricingControlAPI): Promise<PricingControl> {
    try {
      console.log('Creating pricing control with data:', data);
      console.log('API URL:', `${API_URL}/functions/v1/pricing-controls`);
      console.log(JSON.stringify(data));
      const response = await fetch(
        `${PRICING_API_URL}/kl/t/opertacion/v1/quotes/quote/updatecontrol`,
        {
          method: 'POST',
          headers: this.getHeaders2(),
          body: JSON.stringify(data),
        }
      );

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);

        try {
          const error = JSON.parse(errorText);
          throw new Error(error.message || error.error || 'Error al crear control de pricing');
        } catch (e) {
          throw new Error(errorText || 'Error al crear control de pricing');
        }
      }

      const result = await response.json();
      console.log('Created control:', result);
      return result;
    } catch (error: any) {
      console.error('Fetch error:', error);
      throw new Error(error.message || 'Error de conexión al crear control de pricing');
    }
  }

  async QuoteControl(data: QuotedControlRequest): Promise<PricingControl> {    
     try {
      console.log(JSON.stringify(data))
        const response = await fetch(
            `${PRICING_API_URL}/kl/t/opertacion/v1/quotes/quote/quotedcontrol`,
            {
              method: 'POST',
              headers: this.getHeaders2(),
              body: JSON.stringify(data),
            }
          );    

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Error al actualizar control de pricing');
        }

        return response.json();
    } catch (error: any) {
      console.error('Fetch error:', error);
      throw new Error(error.message || 'Error de conexión al crear control de pricing');
    }
  }

   async DeclineControl(data: QuotedControlRequest): Promise<PricingControl> {    
     try {
      console.log(JSON.stringify(data))
        const response = await fetch(
            `${PRICING_API_URL}/kl/t/opertacion/v1/quotes/quote/declinerequest`,
            {
              method: 'POST',
              headers: this.getHeaders2(),
              body: JSON.stringify(data),
            }
          );    

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Error al actualizar control de pricing');
        }

        return response.json();
    } catch (error: any) {
      console.error('Fetch error:', error);
      throw new Error(error.message || 'Error de conexión al crear control de pricing');
    }
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(
      `${API_URL}/functions/v1/pricing-controls?id=${id}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al eliminar control de pricing');
    }
  }

  async markAsQuoted(id: string): Promise<PricingControl> {
    const response = await fetch(
      `${API_URL}/functions/v1/pricing-controls/mark-quoted`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ id }),
      }
    );

    if (!response.ok) {
      throw new Error('Error al marcar control como cotizado');
    }

    return response.json();
  }
}

export const pricingControlService = new PricingControlService();
