/* ==============================
 * Modelo de Tarifa de Venta Final (Actualizado)
 * ============================== */

export interface QuotedRate {
  _id: string | null;
  _idcuote: number | null;
  quote_number: string | null;
  version: number;
  _id_control: string;
  control_number: string;
  _idreferencerequest: string;
  referencerequest: string;
  prospect: string;
  _id_customer: string;
  customer_business_name: string;
  customer_address: string;
  customer_contact: CustomerContact;
  status_control: StatusControl;
  _iddocument: string | null;
  currency: string;
  exchange: number;
  targetcurrecy: string;
  environmentid: number;
  environment: string;
  details: QuoteDetail[];
  comments: string;
  conditions: string[];
  created_by: CreatedBy;
  created_at: string;
  updated_at: string;
  valid_from: string;
  valid_until: string;
  is_current: boolean;
  _id_status_quote: number;
  status_cuote_name: string;
  id_language: number;
  language: string;
  previous_version_id: string | null;
  previous_version_cuote: number | null;
  archived: boolean;
  data_state: number;
  status: number;
}

export interface QuoteDetail {
  services: ServiceItem[];
  charges: Charges;
  subtotal_import: string; // Viene como string "50" en el JSON
  sales_tax_import: string;
  total_import: string;
}

export interface ServiceItem {
  id_service_item: number;
  _id_service: number;
  category: number;
  service_name: string;
  shipments: Shipment[];
  order_service?: OrderService;
}

export interface OrderService {
  origin: Location;
  destination?: Location;
  _id_shipment_type?: number;
  shipment_type_name?: string;
  _id_operation_type?: number;
  operation_type_name?: string;
  departure_date_approximate?: string;
  projection_shipment?: ProjectionShipment;
  comments?: string;
  cargo: CargoItem[];
}

export interface ProjectionShipment {
  num?: number;
  _id_measurement_frequency?: number;
  measurement_frequency?: string;
  frequency?: string;
}

export interface Shipment {
  id_shipment: number;
  origin: Location;
  destination: Location;
  _id_shipment_type: number;
  shipment_type_name: string;
  _id_operation_type: number;
  operation_type_name: string;
  _id_incoterm: number;
  incoterm: string;
  services_asociated: ServiceAssociated[];
  cargo: CargoItem[];
  containers: Container[];
}

export interface Location {
  // snake_case (DB/API)
  _id_country?: string;
  country_code?: string;
  zip_code?: number;
  port_code?: string;
  airport_code?: string;
  // camelCase (frontend)
  idCountry?: string;
  countryCode?: string;
  zipCode?: number;
  portCode?: string;
  airportCode?: string;
  // comunes
  city?: string;
}

export interface ServiceAssociated {
  _id_service_associated: number;
  service_associated_name: string;
}

export interface CargoItem {
  merchandise: string;
  weight_total: number;
  unit_weight: string;
  volume_total: number;
  unit_measurement: string;
}

export interface Container {
  _id_container: number;
  name_type: string;
  quantity: number;
  gross_weight: number;
  comodity: string;
}

export interface Charges {
  maritime: MaritimeCharge[];
  air: AirCharges;
  land: LandCharge[];
  consulting_services: ConsultingServices[];
}

export interface MaritimeCharge {
  _id_type_of_charge: number;
  type_of_charge: string;
  concept: string;
  billing_base: string;
  container_type: string;
  unit: number;
  subtotal: number;
  vat: number; 
  rate: string;
  total: number;
}

export interface AirCharges {
  airline_costs: AirlineCost[];
  operational_costs: OperationalCost[];
}

export interface AirlineCost {
  concept: string;
  airline: string;
  route: string;
  transit_days: string;
  rate_per_kg: number;
  fuel_surcharge: number;
  security_surcharge: number;
  miscellaneous_charges: number;
  chargeable_weight: number;
  subtotal: number;
  vat: number; 
  rate: string;
  total: number;
}

export interface OperationalCost {
  _id_type_of_charge: number;
  type_of_charge: string;
  concept: string;
  billing_base: string;
  subtotal: number;
  vat: number; 
  rate: string;
  total: number;
}

export interface LandCharge {
  _id_type_of_charge: number;
  type_of_charge: string;
  concept: string;
  billing_base: string;
  unit: number;
  subtotal: number;
  vat: number; 
  rate: string;
  total: number;
}

export interface ConsultingServices {
  _id_type_of_charge: number;
  type_of_charge: string;
  concept: string;
  billing_base: string;
  unit: number;
  subtotal: number;
  vat: number; 
  rate: string;
  total: number;
}

export interface CreatedBy {
  _id_user_save: string;
  user_name: string;
}

export interface StatusControl {
  id_status_control: number;
  status_control_name: string;
}

export interface CustomerContact {
  type: string;
  name: string;
  email: string;
  phone: string;
}

/* ==============================
 * Catálogos (tipos reutilizables)
 * ============================== */

export type VatOption = {
  idVar: number;
  label: string;
  rate: number;
  value: number;
};

export type ServiceTypeOption = {
  idSer: number;
  label: string;
};

export type LanguageOption = {
  idLang: number;
  labelSpanish: string;
  labelEnglish: string;
  value: string;
};

export type StatusQuote = {
  idStatusQ: number;
  labelSpanish: string;
  labelEnglish: string;
};

export type CurrencyOption = {
  idCurrency: number;
  label: string;
  value: string;
};

export interface ResponseGet<T> {
  codeStatus: number;
  messageStatus: string;
  meta: MetaQuotedRate;
  data: T;
}

export interface MetaQuotedRate {
  data_response: string;
  data_items: number;
  data_atribute: {
    type: string;
    name: string;
  };
}
