import { PricingControlSupplier, PricingControlStatusControl } from "./pricingControl";

export interface Customer {
  idCustomer: string;
  name: string;
  rfc: string;
}

export interface Service {
  _id: number;
  service_name: string;
  category: number;
  email_service_name: string;
  status: number;
  archived: boolean;
  data_state: number;
}

export interface ServiceOperation {
  idServiceItem: number;
  idControl?: string | null;
  control?: string | null;
  idService: number;
  nameService: string;
  // supplier: string;
  currentIndex: number;
  category: number;
  serviceDetail: ServiceDetail[];
}

export interface Transport {
  idCarrier: string;
  carrier: string;
  typeCarrier: number;
  bookingNumeber: string;
  bookingDate?: Date;
  typeUnit: string;
  nameTransport: string;
  typeOfMovement: string;
  typeRoute: string;
  guide: any;
  moreInformationTransport: any;
}

export interface ServiceDetail {
  idDetail: number;
  idTypeShipment: number;
  typeShipment?: string;
  idTypeOperation: number;
  typeOperation?: string;
  masterGuide?: string;
  consignee?: boolean;
  idIncoterm?: number;
  incoterm?: string;
  transport?: any;
  origin?: any;
  destination?: any;
  comments?: string;
  containers?: any;
  cargo?: any;
}

export interface UserInfo {
  userId: string;
  name: string;
}

export interface HistoryStatus {
  status: string;
  statusDate: Date;
  updatedBy: UserInfo;
}

export interface Operation {
  id: string;
  idReference?: number;
  reference: string;
  customer: Customer;
  services: ServiceOperation[];
  observations?: string;
  operationStatus: 'created' | 'pending' | 'completed' | 'failed';
  historyStatus: HistoryStatus[];
  listaParaFacturar: boolean;
  iCveMaestroOperaciones: number;
  createdAt: Date;
  createdBy: UserInfo;
  updatedAt: Date;
  updatedBy: UserInfo;
  status: 1 | 2; // 1: activo, 2: inactivo, ;
  archived: boolean;
  dataState: number;
}

export const formatDateTimeLocal = (
  value?: string | Date | null
): string => {

  if (!value) return '';

  const date = new Date(value);

  if (isNaN(date.getTime())) return '';

  const year = date.getUTCFullYear();

  const month = String(
    date.getUTCMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getUTCDate()
  ).padStart(2, '0');

  const hours = String(
    date.getUTCHours()
  ).padStart(2, '0');

  const minutes = String(
    date.getUTCMinutes()
  ).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const toDateTimeLocal = (
  value?: string | Date | null
): string => {
  if (!value) return "";

  const date = new Date(value);

  if (isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();

  const local = new Date(date.getTime() - offset * 60000);

  return local.toISOString().slice(0, 16);
};

export const toUtcISOString = (
  value?: string
): string | null => {

  if (!value) return null;

  return new Date(value).toISOString();
};