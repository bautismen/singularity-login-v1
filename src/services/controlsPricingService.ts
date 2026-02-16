const PRICING_API_URL = import.meta.env.VITE_PRICING_API_URL;
const API_KEYPRICING = import.meta.env.VITE_API_KEYPRICING;
const API_KEYX = import.meta.env.VITE_APIKEYPRICING;

export const controlsPricingService = {
  async getAll() {
    const response = await fetch(`${PRICING_API_URL}/kl/t/opertacion/v1/quotes/quote/getresquets`, {
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

    const data = await response.json();    
    return data.data;
  },
};
