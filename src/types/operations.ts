import { PricingControlSupplier, PricingControlStatusControl } from "./pricingControl";

export interface Customer {
    idCustomer: string;
    name: string;
    rfc: string;
}

export interface Control {
    _idcontrol: string;
    control: string;
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

export interface ServiceOperation{
    idServiceItem: number;
    idControl: string;
    idtype_service: number;
    nameService: string;
    // supplier: string;
    ObservationsService: string;
}

export interface Operation {
    id: string;
    idreference?: number;
    reference: string;
    customer: Customer;
    controls: Control[];
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