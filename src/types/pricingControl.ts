export interface PricingControlSupplier {
  idsuplier: number;
  supplier_associated_name: string;
}

export interface PricingControlStatusControl {
  _id_status_control: number;
  status_control_name: string;
}

export interface PricingControl {
  _id?: string;
  idcontrol: number;
  control: string;
  _idrequest: string;
  _id_executive: string;
  complete_name: string;
  creation_date: string;
  quotation_date?: string;
  updated_date: string;
  _id_request_type: number;
  request_type_name: string;
  _id_customer: string;
  customer_business_name: string;
  status_control: PricingControlStatusControl;
  suppliers: PricingControlSupplier[];
  services: any[];
  network?: string;
  complexity?: string;
  currency?: string;
  unit_profit?: string;
  general_profit?: string;
  comments_general?: string;
}

export interface CreatePricingControlRequest {
  _idrequest: string;
  suppliers: PricingControlSupplier[];
  services: any[];
  status_control: PricingControlStatusControl;
  network?: string;
  complexity?: string;
  currency?: string;
  unit_profit?: string;
  general_profit?: string;
  comments_general?: string;
}

export interface UpdatePricingControlRequest {
  _id: string;
  suppliers?: PricingControlSupplier[];
  services?: any[];
  status_control?: PricingControlStatusControl;
  network?: string;
  complexity?: string;
  currency?: string;
  unit_profit?: string;
  general_profit?: string;
  comments_general?: string;
}
