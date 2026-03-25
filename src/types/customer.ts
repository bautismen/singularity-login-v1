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
  // _idcontacts?: string;
  Email: string;
  Name: string;
  Phone: string;
  Position: string;
  Status: 1 | 2 //'activo' | 'inactivo';
  Type: string;
  ValidFrom: string;
  valiValidTo: string | null;
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

export interface History {
  date: Date;
  user_id: string;
  user_name: string;
  changes: {
    field: string;
    old_value: string;
    new_value: string;
  };
}

export interface Customer {
  _id: string;
  // _idcustomer?: string;
  _idcustomer: number;
  is_branch: boolean;
  branch_name?: string;
  is_national?: boolean;        
  is_persona_fisica?: boolean; 
  curp?: string; 
  // type: 'fisica' | 'moral';
  company_id?: string;
  person_id?: string;
  // nationality: 'nacional' | 'extranjero';
  // client_level?: 'oro' | 'plata' | 'bronce';
  client_level_id?: 1 | 2 | 3;
  fiscal_data: {
    business_name: string;
    taxid: string;
    country: string;
    state: string;
  };
  contacts: Contact[];
  addresses: Address[];
  is_corresponsal: boolean;
  history?: History[];
  created_at?: Date;
  created_by?: {
    user_id: string;
    name: string;
  };
  updated_at?: Date;
  status: 1 | 0 //'activo' | 'inactivo';
  archived: boolean;
  data_state: number;
}

export interface CustomerFormData {
  is_branch: boolean;
  branch_name: string;
  type: 'fisica' | 'moral';
  company_id: string;
  person_id: string;
  nationality: 'nacional' | 'extranjero';
  fiscal_data: {
    business_name: string;
    taxid: string;
    country: string;
    state: string;
  };
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
