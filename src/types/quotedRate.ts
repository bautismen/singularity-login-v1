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
  status_control: StatusControl;
  currency: string;
  exchange: number;
  environmentid: number;
  environment: string;
  details: QuoteDetail[];
  comments: string;
  conditions: string;
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
  previous_version_id: number | null;
  previous_version_cuote: number | null;
  archived: boolean;
  data_state: number;
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
  _id_country: string;
  country_code: string;
  city: string;
  zip_code: number;
  port_code: string;
  airport_code: string;
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
  type_of_charge: number;
  concept: string;
  billing_base: string;
  container_type: string;
  unit: number;
  subtotal: number;
  vat: string; // Viene como string "16" en el JSON
  total: number;
}

export interface AirCharges {
  airline_costs: AirlineCost[];
  operational_costs: OperationalCost[];
}

export interface AirlineCost {
  type_of_charge: string;
  airline: string;
  route: string;
  transit_days: string;
  rate_per_kg: number;
  fuel_surcharge: number;
  security_surcharge: number;
  miscellaneous_charges: number;
  chargeable_weight: number;
  subtotal: number;
  vat: string;
  total: number;
}

export interface OperationalCost {
  type_of_charge: number;
  concept: string;
  billing_base: string;
  subtotal: number;
  vat: string;
  total: number;
}

export interface LandCharge {
  type_of_charge: number;
  concept: string;
  billing_base: string;
  unit: number;
  subtotal: number;
  vat: string;
  total: number;
}

export interface ConsultingServices {
  type_of_charge: number;
  concept: string;
  billing_base: string;
  unit: number;
  subtotal: number;
  vat: string;
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

/* ==============================
 * Catálogos (tipos reutilizables)
 * ============================== */

export type VatOption = {
  idVar: number;
  label: string;
  value: number;
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