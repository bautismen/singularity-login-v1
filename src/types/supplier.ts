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
  _Id?: string;
  Business_name: string;
  Rfc_taxid: string;
  Nationality: 'nacional' | 'extranjero';
  Country: string;  
  Status: number;
  Archived: boolean;
  Data_state: number;
  Created_at?: Date;
  Created_by?: {
    User_id: string;
    Name: string;
  };
  Sector_id: number;
  Sector: string;
}

export interface Contact {
  // _idcontacts?: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 1 | 0; // 1: activo, 0: inactivo
  validFrom: string;
  validTo: string | null;
}

export interface Address {
  // _idaddress?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  status: 1 | 0; // 1: activo, 0: inactivo
  validFrom: string;
  validTo: string | null;
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
  Id?: string;
  IdSupplier?: number;
  IsPersonaFisica?: boolean;
  Curp?: string; 
  CompanyId?: string;
  IsNational?: boolean;
  FiscalData: {
    BusinessName: string;
    RFCTaxId: string;
    Country: string;
  };
  SectorId: number;
  Sector_name: string;
  Contacts: Contact[];
  Addresses: Address[];
  History?: HistoryEntry[];
  CreatedAt?: Date;
  CreatedBy?: {
    IdUser: string;
    Name: string;
  };
  UpdatedAt: Date;
  UpdatedBy: {
    IdUser: string;
    Name: string;
  };
  Status: 1 | 2; // 1: activo, 2: inactivo, 
  Archived: boolean;
  DataState: number;
}

export interface SupplierFormData {
  is_persona_fisica: boolean;
  curp: string;
  company_id: string;
  is_national: boolean;
  fiscal_data: {
    supplier_name: string;
    rfc_taxid: string;
    country: string;
    state: string;
  }; 
  serctor_id: string;
  sector: string;
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
