export interface PricingControlSupplier {
  idsuplier: string;
  supplier_associated_name: string;
}

export interface PricingControlSupplierAPI {
  Idsuplier: string;
  Supplier_associated_name: string;
}

export interface PricingControlStatusControl {
  _id_status_control: number;
  status_control_name: string;
}

export interface PricingControlStatusControlAPI {
  Id_status_control: number;
  Status_control_name: string;
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
  volume?: string;
  general_profit?: string;
  key_td?: string;
  comments_general?: string;
  _id_executive_pricing: string;
  complete_name_pricing: string;
  reason_for_cancellation?: string; ,
  Archived?: boolean;
  Data_state?: number;
}

export interface CreatePricingControlRequest {
  _idrequest: string;
   _id_executive: string;
  complete_name: string;
  _id_request_type: number;
  request_type_name: string;
  suppliers: PricingControlSupplier[];
  services: any[];
  status_control: PricingControlStatusControl;
  network?: string;
  complexity?: string;
  currency?: string;
  unit_profit?: string;
  volume?: string;
  general_profit?: string;
  key_td?: string;
  comments_general?: string;
  _id_executive_pricing: string;
  complete_name_pricing: string;
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
  volume?: string;
  general_profit?: string;
  key_td?: string;
  comments_general?: string;
}

export interface CreatePricingControlAPI {
  Id?: string;
  Idcontrol?: string;
  Control?: string;
  Idrequest: string;
  Id_executive: string;
  Complete_name: string;
  Creation_date: string;
  Quotation_date?: string;
  Updated_date: string;
  Id_request_type: number;
  Request_type_name: string;
  Id_customer: string;
  Customer_business_name: string;
  Status_control: PricingControlStatusControlAPI;
  Suppliers: PricingControlSupplierAPI[];
  Services: any[];
  Network?: string;
  Complexity?: string;
  Currency?: string;
  Unit_profit?: string;
  Volume?: string;
  General_profit?: string;
  Key_td?: string;
  Comments_general?: string;
  Id_executive_pricing: string;
  Complete_name_pricing: string;
  id_correspondent_country: string;
  correspondent_country: string;
  Archived?: boolean;
  Data_state?: number;
}

export interface QuotedControlRequest {
  idcontrol_: string;
  idresqued_?: string;  
  reason_for_cancellation?: string;  
  Suppliers?: any[];
}

export interface ResquetQuote {
  Id: string;
  ReferenceRequest: string;
  IdStatusRequest: number;
  StatusRequest: string;
  DateRequest: Date;
  DateDeadline?: Date;
  IdRequestType: number;
  TypeRequest: string;
  Priority: number;
  Licitation: number;
  DateCreated: Date;
  DateUpdated: Date;
  CreatedBy: any;
  Customer: any;
  AssignedTo: any[];
  Services: any[];
}

export interface ApiResponse {
  codeStatus: number;
  messageStatus: string;
  atrribute: any;
};