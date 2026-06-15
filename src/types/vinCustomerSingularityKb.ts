export interface vinCustomerSingularityKb {
    _id: string | null;
    _idvincustomer: number;
    _idcustomer: number;
    _id_customer: string;
    cliente_KB: ClienteKBItem[];
    fiscal_data: FiscalDataKB;
    created_at: string;
    status: string;
    data_state: number;
    archived: boolean;
}

export interface ClienteKBItem {
    i_cve_clienteempresa_KB: number;
    i_cve_divisionmiempresa_KB: number;
}

export interface FiscalDataKB {
    taxid: string;
    curp: string;
}