const PRICING_API_URL = import.meta.env.VITE_PRICING_API_URL;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;
const API_KEYSL = import.meta.env.VITE_APIKEYSL;

export const controlsPricingService = {
  async getAll() {
    const response = await fetch(`${PRICING_API_URL}/kl/t/opertacion/v1/quotes/quote/getresquets`, {
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
        return {
        message: 'No hay solicitudes disponibles',
        data: [],
        };
      }
      else {
        const data = await response.json();
        return {
            message: '',
            data: data.data || [],
        }; 
      }
  },
};
