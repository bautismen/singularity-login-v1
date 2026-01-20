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
    const response = await fetch(
      `${API_URL}/functions/v1/pricing-controls`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear control de pricing');
    }

    return response.json();
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
