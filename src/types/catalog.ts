export interface BaseCatalog {
  id: number;
  status: number;
  archived: boolean;
  data_state: number;
  created_at?: string;
  updated_at?: string;
}

export interface ImoClass extends BaseCatalog {
  imo: string;
  description: string;
}

export interface Incoterm extends BaseCatalog {
  incoterm: string;
}

export interface Service extends BaseCatalog {
  service_name: string;
  category: number;
  email_service_name?: string;
}

export interface RequestType extends BaseCatalog {
  request_type_name: string;
}

export interface Status extends BaseCatalog {
  category: string;
  subcategory: string;
  code?: string;
  status_name: string;
  description?: string;
}

export interface Country {
  _id: string
  id_country: number;
  country_code: string;
  name_country: string;
  status: number;
  archived: boolean;
  data_state: number;
}

export interface SectorOfBusiness extends BaseCatalog {
  name: string;
  description: string;
  category?: number; 
}

export interface Clauses extends BaseCatalog {
  _id: string;
  _idclausula: number;
  tags: string[];
  title: string;
  conditions: {
    en: string;
    es: string;
  };
  created_at: string;
  created_by: { 
    user_id: string 
    name: string;
  };
  updated_at: string;
  status: number;
  archived: boolean;
  data_state: number;
}

export type CatalogType = 'imo' | 'incoterms' | 'services' | 'request_types' | 'status' | 'countries' | 'sector_of_business' | 'clauses';
