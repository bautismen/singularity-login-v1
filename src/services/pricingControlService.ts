import { PricingControl,CreatePricingControlAPI,QuotedControlRequest,ResquetQuote } from '../types/pricingControl';

const API_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const PRICING_API_URL = import.meta.env.VITE_PRICING_API_URL;
const API_KEYPRICING = "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNpbmd1bGFyaXR5OjIwMjU6MSIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI2N2I5ZjNmYWQwM2QzZDRhOTNkZTI2MTgiLCJ1bmlxdWVfbmFtZSI6ImVyaWNrLmJhcnJpZW50b3NAa3JvbWxvZ2lzdGljYS5jb20iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL2FjY2Vzc2NvbnRyb2xzZXJ2aWNlLzIwMTAvMDcvY2xhaW1zL2lkZW50aXR5cHJvdmlkZXIiOiJBU1AuTkVUIElkZW50aXR5IiwiQXNwTmV0LklkZW50aXR5LlNlY3VyaXR5U3RhbXAiOiIzYTZkNzRlNS1kNjY1LTRkNjQtOTBlOC1jY2VjN2QzMTQzOTQiLCJyb2xlIjpbIkFETUlOU1lOQVBTSVMiLCI2N2I5ZjE2YzlkMDhhYWY0MTY1MjJjNjEiLCI2N2I5ZjE2YzlkMDhhYWY0MTY1MjJjNjEiLCJBRE1JTktST01CQVNFV0VCIiwiNjdiOWYxNmM5ZDA4YWFmNDE2NTIyYzYxIiwiQURNSU5LUk9NQkFTRVdFQiJdLCJlbWFpbCI6ImVyaWNrLmJhcnJpZW50b3NAa3JvbWxvZ2lzdGljYS5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9ob21lcGhvbmUiOiIyMjkyNTA2MDk0IiwiRmlyc3ROYW1lIjoiRXJpY2sgT2xzZW4iLCJMYXN0TmFtZSI6IkJhcnJpZW50b3MgTWFydGluZXoiLCJTaXN0ZW1hIjoiU2luZ3VsYXJpdHkiLCJTWU5BUFNJU0xvY2F0aW9uIjoiTlVMTCIsIlNZTkFQU0lTUGFuZWwgR2VuZXJhbF9mYXMgZmEtY2hhcnQtYmFyXzEiOiJodHRwOi8vU3luT3BlcmF0aW9ucy9Gcm9udEVuZC9Nb2R1bG9zL1RyYWZpY29BQS9Db25zdWx0YXNPcGVyYWNpb25lcy9HZXMwMDMtMDAxLUNvbnN1bHRhcy5QcmluY2lwYWwuYXNweCIsIlNZTkFQU0lTTW9kdWxvc19mYSBmYS1sYXB0b3BfMiI6IiMiLCJTWU5BUFNJU1BlZGltZW50b3NfIF8yIjoiaHR0cDovL1N5bk9wZXJhdGlvbnMvRnJvbnRFbmQvTW9kdWxvcy9UcmFmaWNvQUEvTWV0YWZvcmFQZWRpbWVudG8vR2VzMDIyLTAwMS1NZXRhZm9yYVBlZGltZW50by5hc3B4Iiwic2lkIjoiMSIsImp0aSI6IjY5ODY2MjBlOTYxNWE2YmFjYzY1ZGMyZCIsIm5iZiI6MTc3MDQxNDYwNywiZXhwIjoxNzcwNDE1NTA3LCJpYXQiOjE3NzA0MTQ2MDcsImlzcyI6Imh0dHBzOi8vbG9jYWxob3N0OjcyNjgiLCJhdWQiOiJDbGllbnQuU2luZ3VsYXJpdHkuQXV0aGVudGljYXRpb24ifQ.xX7fouZ75-WbhU70e8FXP-FkLFeR3MxwfneE_DGf429vYpf2bDS0hIdfQEVDcUOwHT-Yqm2mGPBSSVT5k_8s2_A1atI0uGABneHBEV9bBiRNPK87tNiMkXagQ5SCr_TYbDfGdvKKVhS61JoUxxEXsacgGmnoNd9mKnl8goFikAKWZdIxh9pqfDtVBMuhSnfJpmwirSKKixGgVHyk0aV0PwKv-LfQ61Gs-knRTDP5j4KwBSnbnZW_M_jN8KboAuyVLsKm9oXXU9RXBGoT-ovsDvly_b9EsYyKK3BjpFEtOMn0RgyJaPJL6n4oH0PrAr1EKHO-_j_GEH_04XOfer-HXg";
const API_KEYX = import.meta.env.VITE_APIKEYPRICING

class PricingControlService {
  private getHeaders() {
    return {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',      
    };
  }

  private getHeaders2() {
    return {
      'Authorization': `Bearer ${API_KEYPRICING}`,
      'Content-Type': 'application/json',
      'x-api-key': API_KEYX,
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
      `${PRICING_API_URL}/v1/quotes/quotation/getcontrolbyid?idcontrol_=${id}`,
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
      `${PRICING_API_URL}/v1/quotes/quotation/getresquetbyid?idresquet_=${id}`,
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
        `${PRICING_API_URL}/v1/quotes/quotation/createcontrol`,
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
        `${PRICING_API_URL}/v1/quotes/quotation/updatecontrol`,
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
            `${PRICING_API_URL}/v1/quotes/quotation/quotedcontrol`,
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
