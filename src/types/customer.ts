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
  Sector_name: string;
}


export interface Contacts {
  // _idcontacts?: string;
  email: string;
  name: string;
  phone: string;
  position: string;
  status: number //'activo' | 'inactivo';
  type: string;
  validFrom: string;
  valiValidTo: string | null;
}

export interface Address {
  // _idaddress?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  status: 1 | 2 //'activo' | 'inactivo';
  validFrom: string;
  validTo: string | null;
}

export interface History {
  UserId: string;
  UserName: string;
  Date: Date;
  Changes: {
    Field: string;
    OldValue: string;
    NewValue: string;
  };
}

export interface Customer {
  Id: string;
  // _idcustomer?: string;
  IdCustomer: number;
  IsBranch: boolean;
  BranchName?: string;
  IsNational?: boolean;        
  IsPersonaFisica?: boolean; 
  Curp?: string; 
  // type: 'fisica' | 'moral';
  CompanyId?: string;
  PersonId?: string;
  // nationality: 'nacional' | 'extranjero';
  // client_level?: 'oro' | 'plata' | 'bronce';
  ClientLevelId?: 1 | 2 | 3;
  FiscalData: {
    BusinessName: string;
    TaxId: string;
    Country: string;
  };
  Contacts: Contacts[];
  Addresses: Address[];
  IsCorrespondent: boolean;
  Sector_id: number;
  Sector_name: string;
  History?: History[];
  CreatedAt?: Date;
  CreatedBy?: {
    IdUser: string;
    Name: string;
  };
  UpdatedAt: Date;
  Status: 1 | 0 //'activo' | 'inactivo';
  Archived: boolean;
  DataState: number;
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
  contacts: Contacts[];
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
