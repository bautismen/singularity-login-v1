export interface CustomerKB {
    i_Cve_ClienteEmpresa: number;
    i_Cve_DivisionMiEmpresa: number;
    i_Cve_Status: number;
    t_Status: string;
    f_FechaAlta: string;
    t_EmpresaCliente: string;
    t_RFCClienteFusion: string;
    i_Extranjero: number;
    i_Cve_Estado: number;
}

export interface MetaCustomerKB {
    data_response: string;
    data_items: number;
    data_atribute: {
        type: string;
        name: string;
    };
}

export interface ResponseGetCustomerKB {
    codeStatus: number;
    messageStatus: string;
    meta: MetaCustomerKB;
    data: CustomerKB[];
}