export interface QuotationRequest {
  id: string;
  referenceRequest: string;
  idStatusRequest: number;
  statusRequest: string;
  dateRequest: string;
  dateDeadline?: string;
  idRequestType: number;
  typeRequest: string;
  priority: number;
  licitation: number;
  dateCreated: string;
  dateUpdated?: string;
  createdBy: Executive;
  customer: {
    idCustomer: string;
    customerName: string;
    customerCategory: number;
  };
  assignedTo : Executive[];
  services: Service[];
}

export interface Service {
  idServiceItem: number;
  idService: number;
  nameService: string;
  used?: boolean;  
  shipments: Shipment[];
}

export interface Shipment{
  idShipment:number;
  origin: any;
  destination: any;
  idTypeShipment: number;
  typeShipment: string;
  idTypeOperation: number;
  typeOperation: string;
  idInconterm: number;
  incoterm: string;
  departureDateAproximate?: string;
  projectionShipment?: any; 
  comments: string;
  servicesAsociated: any[];
  cargo : any[];  
}

export interface Cargo {
  nameMerchandise: string;
  descriptionMerchandise: string;
  merchandiseClassification: any[];
  stowable: number;
  typeCargo: string; 
  idUnitCargo: number;
  unitCargo: string;
  idUnitMeasurement: number;
  unitMeasurement: string;
  idUnitWeight: number;
  unitWeight: string;
  totalVolume: number;
  totalWeight: number;
  packages: MerchandisePackage[];
}

export interface MerchandisePackage {
  id: number;
  type: string;
  quantity: number;
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface Executive {
  idEmployee?: string;
  idUser: string;
  nameEmployee: string;
}