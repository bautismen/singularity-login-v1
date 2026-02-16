const API_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface CustomerSummaryLevel {
  _id: string;
  level: string;
  count: number;
  percentage: number;
  trend?: string;
}

export const customerSummaryService = {
  async getSummary(): Promise<CustomerSummaryLevel[]> {
    try {
      const response = await fetch(`${API_URL}/functions/v1/customer-summary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener el resumen de clientes');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching customer summary:', error);
      throw error;
    }
  },
};
