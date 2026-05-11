import { Report } from '../types/reports';

const REPORT_API_URL = import.meta.env.VITE_API_REPORT;
const API_TOKENSL = import.meta.env.VITE_TOKENSL;
const API_KEYSL = import.meta.env.VITE_APIKEYSL;

const REPORTS: Report[] = [
  {
    id_report: '8821', category: 'Financial',
    name_report: 'Annual Balance Sheet Summary', description: 'Detailed breakdown of fiscal assets, liabilities ...',
    id_user: 'user1', user_name: 'M. Thompson', creation: new Date('2023-10-12'), archived: false,
  },
  {
    id_report: '7734', category: 'Operational',
    name_report: 'cotizaciones realizas', description: 'Reporte de cotizaciones realizas por el area de pricing',
    id_user: 'user2', user_name: 'Erick Barrientos', creation: new Date('2023-09-28'), archived: false,
    parameter: [{
      name: 'control',
      type: 'string',
      show: 'Numero de control',
    },
    {
      name: 'date',
      type: 'date',
      show: 'Fecha Alta',
    },
    {
      name: 'count',
      type: 'int',
      show: 'Cantidad',
    },
    {
      name: 'executive',
      type: 'catalogo',
      show: 'Ejecutivo',
      catalog: 'Ejecutivos',
    }
  ],
  },
  {
    id_report: '9012', category: 'Inventory',
    name_report: 'Regional Stock Variance Report', description: 'Audit of inventory levels across EMEA and AP...',
    id_user: 'user3', user_name: 'S. Chen', creation: new Date('2023-11-02'), archived: false,
     parameter: [{
      name: 'control',
      type: 'string',
      show: 'Numero de control',
    },
    {
      name: 'date',
      type: 'date',
      show: 'Fecha Alta',
    },
    {
      name: 'count',
      type: 'int',
      show: 'Cantidad',
    },
    {
      name: 'customer',
      type: 'catalogo',
      show: 'Cliente',
      catalog: 'Clientes',
    }
  ],
  },
];

class reportsService {
  
  private getHeaders2() {
    return {
      'Authorization': `Bearer ${API_TOKENSL}`,
        'Content-Type': 'application/json',
        'x-api-key': API_KEYSL,
    };
  }
  
  async getall(): Promise<Report[]> {    
    const data = REPORTS; // await response.json();
    return data.map(item => ({
    ...item,
    selected: item.selected ?? false
  }));
  }
}

export const reportsServices = new reportsService();
