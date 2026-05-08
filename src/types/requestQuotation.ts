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
    prospectName: string;
  };
  assignedTo : Executive[];
  services: Service[];
}

export interface Service {
  idServiceItem: number;
  idService: number;
  nameService: string;
  used?: boolean;  
  shipments?: Shipment[];
  orderService?: OrderService;
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
  containers?: ContainerRequest[];
  servicesAsociated?: any[];
  cargo : any[];  
}

export interface OrderService {
  origin?: any;
  destination?: any;
  idTypeShipment?: number;
  typeShipment?: string;
  idTypeOperation?: number;
  typeOperation?: string;
  departureDateAproximate?: string;
  projectionShipment?: any; 
  comments?: string;
  cargo? : Cargo[]; 
}

export interface LocationPlace {
  idCountry : string;
  countryCode: string;
  City? : string;
  zipCode? : number;
  portCode?: string;
  airportCode?: string;
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

export interface ContainerRequest {
  idContainer? : number;
  nameTypeContainer : string;  
  quantity: number;
  idUnitVolume?: number ,
  unitVolume?: string, 
  volumeTotal?: number, 
  idUnitWeight? : number, 
  unitWeight?: number, 
  weigthTotal?: number
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

export enum StatusRequestQuotation {
  Creada = 1,
  Enviada = 2,
  Asignada = 3,
  Parcialmente = 4,
  Cotizada = 5,
  Declinada = 6,
  Expirada = 7,
  Aceptada = 8,
  Rechazada = 9,
  Cancelada = 10
}

export const StatusRequestQuotationLabel: Record<StatusRequestQuotation, string> = {
  [StatusRequestQuotation.Creada]: "Creada",
  [StatusRequestQuotation.Enviada]: "Enviada",
  [StatusRequestQuotation.Asignada]: "Asignada",
  [StatusRequestQuotation.Parcialmente]: "Parcialmente Cotizada",
  [StatusRequestQuotation.Cotizada]: "Cotizada",
  [StatusRequestQuotation.Declinada]: "Declinada",
  [StatusRequestQuotation.Expirada]: "Expirada",
  [StatusRequestQuotation.Aceptada]: "Aceptada",
  [StatusRequestQuotation.Rechazada]: "Rechazada",
  [StatusRequestQuotation.Cancelada]: "Cancelada"
};