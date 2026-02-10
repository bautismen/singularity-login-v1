export interface Person {
  _id?: string;
  name: string;
  rfc: string;
  nationality: 'nacional' | 'extranjero';
  country: string;
  state: string;
  birth_date: string;
  status: 'activo' | 'inactivo' | 'eliminado';
  archivado: boolean;
  created_at?: Date;
  created_by?: {
    user_id: string;
    name: string;
  };
}

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

export interface Contact {
  _idcontacts?: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 'activo' | 'inactivo';
  valid_from: string;
  valid_to: string | null;
}

export interface Address {
  _idaddress?: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  status: 'activo' | 'inactivo';
  valid_from: string;
  valid_to: string | null;
}

export interface SectorOfBusiness {
  _id?: string;
  name: string;
  description: string;
}

export interface HistoryEntry {
  date: Date;
  user_id: string;
  user_name: string;
  changes: {
    field: string;
    old_value: string;
    new_value: string;
  };
}

export interface Supplier {
  _id?: string;
  _idsupplier?: number;
  is_persona_fisica?: boolean;
  company_id?: string;
  is_national?: boolean;
  datastate: number;
  fiscal_data: {
    supplier_name: string;
    rfc_taxid: string;
    country: string;
    state: string;
  };
  serctor_id: number,
  sector: string,
  contacts: Contact[];
  addresses: Address[];
  status: 'activo' | 'inactivo';
  archivado: boolean;
  history?: HistoryEntry[];
  created_at?: Date;
  created_by?: {
    user_id: string;
    name: string;
  };
}

export interface SupplierFormData {
  is_persona_fisica: boolean;
  company_id: string;
  is_national: boolean;
  fiscal_data: {
    supplier_name: string;
    rfc_taxid: string;
    country: string;
    state: string;
  };
  serctor_id: number,
  sector: string,
  contacts: Contact[];
  addresses: Address[];
}

export const MEXICAN_STATES = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'México',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
] as const;

export const CONTACT_TYPES = ['ventas', 'compras', 'facturación', 'operaciones', 'general'] as const;
