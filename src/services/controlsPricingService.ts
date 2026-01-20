const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quotation-requests`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface ControlsPricingRequest {
  _id: string;
  reference_request: string;
  priority: number;
  customer_category: number;
  _id_status_request: number;
  status_request_name: string;
  request_date: string;
  deadline_date: string;
  _id_request_type: number;
  request_type_name: string;
  customer_business_name: string;
  licitation: boolean;
  requesting_data: {
    _id_executive: string;
    complete_name: string;
  };
  assigned_to: Array<{
    _id_executive: string;
    complete_name: string;
    control_number?: string;
    pricing_control_numbers?: Array<{
      _id_pricing_controls: string;
      _id_status_control: number;
      control: string;
      updated_date: string;
    }>;
  }>;
  services: Array<{
    _id_operation_type: number;
    operation_type_name: string;
    origin?: { country: string };
    destination?: { country: string };
    used?: boolean;
  }>;
}

export const controlsPricingService = {
  async getAll() {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al cargar las cotizaciones');
    }

    const data = await response.json();
    return data.filter((item: ControlsPricingRequest) => item._id_status_request >= 3);
  },
};
