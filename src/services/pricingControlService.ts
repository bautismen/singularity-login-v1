import { PricingControl,CreatePricingControlAPI,QuotedControlRequest,ResquetQuote } from '../types/pricingControl';

const PRICING_API_URL = import.meta.env.VITE_API_URL;
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
      `${PRICING_API_URL}/operations/v1/kl/controlnumbers/${id}`,
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
      `${PRICING_API_URL}/operations/v1/kl/controlnumbers/quotationrequests/${id}`,
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
        `${PRICING_API_URL}/operations/v1/kl/controlnumbers/quotationrequests/${data.Idrequest}/add`,
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
        `${PRICING_API_URL}/operations/v1/kl/controlnumbers/${data.Id}/update`,
        {
          method: 'PUT',
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
            `${PRICING_API_URL}/operations/v1/kl/controlnumbers/${data.idcontrol_}/quoted`,
            {
              method: 'PUT',
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
            `${PRICING_API_URL}/operations/v1/kl/controlnumbers/${data.idresqued_}/decline`,
            {
              method: 'PUT',
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

  async AcceptControl(data: string): Promise<PricingControl> {    
     try {      
        const response = await fetch(
            `${PRICING_API_URL}/operations/v1/kl/controlnumbers/${data}/aceppt`,
            {
              method: 'PUT',
              headers: this.getHeaders2()              
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
