import { PricingControl, CreatePricingControlRequest, UpdatePricingControlRequest } from '../types/pricingControl';

const API_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

class PricingControlService {
  private getHeaders() {
    return {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
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
      `${API_URL}/functions/v1/pricing-controls?id=${id}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener control de pricing');
    }

    return response.json();
  }

  async create(data: CreatePricingControlRequest): Promise<PricingControl> {
    try {
      console.log('Creating pricing control with data:', data);
      console.log('API URL:', `${API_URL}/functions/v1/pricing-controls`);

      const response = await fetch(
        `${API_URL}/functions/v1/pricing-controls`,
        {
          method: 'POST',
          headers: this.getHeaders(),
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

  async update(data: UpdatePricingControlRequest): Promise<PricingControl> {
    const response = await fetch(
      `${API_URL}/functions/v1/pricing-controls`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar control de pricing');
    }

    return response.json();
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
