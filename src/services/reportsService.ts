import { Report } from '../types/reports';

const REPORT_API_URL = import.meta.env.VITE_API_PDFGENERATOR;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;
const API_KEYSL = import.meta.env.VITE_APIKEYSL;

class reportsService {
  
  private getHeaders2() {
    return {
      'Authorization': `Bearer ${API_TOKENSL}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEYSL,
    };
  }
  
  async getall(): Promise<Report[]> {    
   const response = await fetch(
      `${REPORT_API_URL}/kl/reports/v1/report`,
      {
        method: 'GET',
        headers: this.getHeaders2(),
      }
    );
    if (!response.ok) {
      throw new Error('Error al obtener control de pricing');
    }
    const data = await response.json();
    return data.data.map(item => ({
    ...item,
    selected: item.selected ?? false
  }));
  }
  
  async getReport(id: string, data: any) : Promise<any> {
    const query = new URLSearchParams(data).toString();
    const response = await fetch(
      `${REPORT_API_URL}/kl/reports/v1/report/${id}`,
      {
        method: 'POST',
        headers: this.getHeaders2(),
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener el resultado del reporte');
    }
    const result = await response.json();
    return result.data;  
  }
}

export const reportsServices = new reportsService();
