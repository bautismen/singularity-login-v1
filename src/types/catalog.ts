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

export interface Country extends BaseCatalog {
  id_country: number;
  country_code: string;
  name_country: string;
}

export interface SectorOfBusiness extends BaseCatalog {
  name: string;
  description: string;
}

export type CatalogType = 'imo' | 'incoterms' | 'services' | 'request_types' | 'status' | 'countries' | 'sector_of_business';
