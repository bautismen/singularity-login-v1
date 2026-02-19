// src/types/company.ts
export interface Company {
  _id?: string;
  business_name: string;
  rfc_taxid: string;
  nationality: 'nacional' | 'extranjero';
  country: string;
  state: string;
  status: 'activo' | 'inactivo' | 'eliminado';
  archivado: boolean;
  datastate: number;
  created_at?: Date;
  created_by?: {
    user_id: string;
    name: string;
  };
}
