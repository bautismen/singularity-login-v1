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
    prospectName: String;
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
  idIncoterm: number;
  incoterm: string;
  departureDateAproximate?: string;
  projectionShipment?: any; 
  comments: string;
  servicesAsociated?: any[];
  cargo : any[];  
}

export interface Cargo {
  merchandiseName: string;
  merchandiseDescription: string;
  classification: any[];
  stowable: number;
  shipmentTypeCargo: string; 
  idUnitMeasurement: number;
  unitMeasurement: string;  
  idUnitWeight: number;
  unitWeight: string;
  volumeTotal: number;
  weigthTotal: number;
  units?: MerchandisePackage[];
}

export interface MerchandisePackage {
  quantity: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  idUnitCargo: number;
  unitCargo: string;
}

export interface Executive {
  idEmployee?: string;
  idUser: string;
  nameEmployee: string;
}

export interface ChangeStatusRequest {
  IdRequest: string;
  IdStatusRequest: number;
  StatusRequest: string;
  statusComment?: string;
}

export interface AsignateToRequest {
  IdRequest: string;
  Employees: any[];
}