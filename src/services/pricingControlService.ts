import { PricingControl,CreatePricingControlAPI,QuotedControlRequest,ResquetQuote } from '../types/pricingControl';

const PRICING_API_URL = import.meta.env.VITE_PRICING_API_URL;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;
const API_KEYSL = import.meta.env.VITE_APIKEYSL;

class PricingControlService {
  
  private getHeaders2() {
    return {
      'Authorization': `Bearer ${API_TOKENSL}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEYSL,
    };
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
      const response = await fetch(
        `${PRICING_API_URL}/kl/t/opertacion/v1/quotes/quote/add`,
        {
          method: 'POST',
          headers: this.getHeaders2(),
          body: JSON.stringify(data),
        }
      );  

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
      return result;
    } catch (error: any) {
      console.error('Fetch error:', error);
      throw new Error(error.message || 'Error de conexión al crear control de pricing');
    }
  }

  async updatenew(data: CreatePricingControlAPI): Promise<PricingControl> {
    try {    
      const response = await fetch(
        `${PRICING_API_URL}/kl/t/opertacion/v1/quotes/quote/updatecontrol`,
        {
          method: 'POST',
          headers: this.getHeaders2(),
          body: JSON.stringify(data),
        }
      );     

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
      return result;
    } catch (error: any) {
      console.error('Fetch error:', error);
      throw new Error(error.message || 'Error de conexión al crear control de pricing');
    }
  }

  async QuoteControl(data: QuotedControlRequest): Promise<PricingControl> {    
     try {      
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
}

export const pricingControlService = new PricingControlService();
