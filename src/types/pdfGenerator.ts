export interface pdfGeneratorQuotedRate {
    typeOfDocument: string;
    typeOfLanguage: string;
    inline: boolean;
    includeWatermark: boolean;
    watermarkText: string;
    data: Data;
}

export interface Data {
    Header: Header;
    Services: Service[];
    Concepts: Concept[];
    Comments: string;
    TermsAndConditions: string[];
}

export interface Header {
    QuoteNumber: string;
    QuotedRateVersion: number;
    CostumerProspect: string;
    Adress: string;
    ExchangeRate: ExchangeRate;
    ValidFrom: string; // ISO date
    ValidUntil: string; // ISO date
    QuotedRateUserName: string;
    QuotedRateUserContact: string;
}

export interface ExchangeRate {
    BaseCurrency: string;
    TargetCurrency: string;
    Rate: number;
}

export interface Service {
    Category: number;
    ServiceName: string;
    Origin: string;
    Destination: string;
    ShipmentTypeName: string;
    Operation: string;
    Incoterm?: string; // opcional porque no siempre viene
    Cargo: string[];
    ServicesAsociated: string[];
}

export interface Concept {
    ServiceType: number;
    Charge: string;
    Concept: string;
    Base: string;
    Container: string;
    Quantity: number;
    SubTotal: number;
    Rate: number;
    Total: number;
}