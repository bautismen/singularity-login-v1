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
    observationsService: string;
    isShipment: boolean;
    serviceDetail: ServiceDetail[];
}

export interface Transport{
  idTransport: string;
  nameTransport: string;
//   typeTransport: number;
//   carrier: string;
//   typeUnit: string;
}

export interface ServiceDetail {
  sequence: number;
  idTypeShipment: number;
  typeShipment?: string;
  idTypeOperation: number;
  typeOperation?: string;
  typeShippingReference?: string;
  shippingReferenceNumber?: string;
  shippingDate?: Date;
  masterGuide?: string;
  consignee?: boolean;
  idIncoterm?: number;
  incoterm?: string;
  transport?: any;
  origin?: any;
  destination?: any;
  
//   // Fechas
//   departureDateAproximate?: Date;
//   arrivalDateAproximate?: Date;

//   // Transporte
//   masterBill?: string;
//   incoterm?: string;

//   // Ubicaciones
//   origin?: {
//     city?: string;
//     portCode?: string;
//     country?: string;
//   };

//   destination?: {
//     city?: string;
//     portCode?: string;
//     country?: string;
//   };

//   // Comentarios
//   comments?: string;

//   // Extras dinámicos
//   extraData?: any;
}

export interface Operation {
    id: string;
    idreference?: number;
    reference: string;
    customer: Customer;
    services: ServiceOperation[];
    operationStatus: 'created' | 'pending' | 'completed' | 'failed';
    observations?: string;
    listaparafacturar: boolean;
    createdAt: Date;
    createdBy: {
        userId: string;
        name: string;
    };
    updatedAt: Date;
    updatedBy: {
        userId: string;
        name: string;
    };
    status: 1 | 2; // 1: activo, 2: inactivo, ;
    archived: boolean;
    dataState: number;
}