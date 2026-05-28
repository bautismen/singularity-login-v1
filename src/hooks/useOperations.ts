import { useState, useEffect } from 'react';
import { Operation, Customer, Service, ServiceOperation, ServiceDetail } from '../types/operations';
import { useAuth } from '../contexts/AuthContext';

export interface OperationsFormData {
    Id: string,
    IdReference: number,
    Reference: string,
    Customer: Customer,
    Services: ServiceOperation[],
    OperationStatus: string,
    Observations: string,
    ListaParaFacturar: boolean,
    CreatedAt: Date,
    CreatedBy: {
        UserId: string,
        Name: string
    },
    UpdatedAt: Date,
    UpdateBy: {
        UserId: string,
        Name: string
    },
    Status: number,
    Archived: boolean,
    DataState: number,
}

export const useOperations = () => {

const { user } = useAuth();
    
const [formData, setFormData] = useState<OperationsFormData>({
    Id: '',
    IdReference: 0,
    Reference: '',
    Customer: {} as Customer,
    Services: [] as ServiceOperation[],
    OperationStatus: 'Alta referencia' as 'Alta referencia' | 'pending' | 'completed' | 'failed',
    Observations: '',
    ListaParaFacturar: false,
    CreatedAt: new Date,
    CreatedBy: {
      UserId: user?._id || '',
      Name: user?.name || ''
    },
    UpdatedAt: new Date,
    UpdateBy: {
      UserId: user?._id || '',
      Name: user?.name || ''
    },
    Status: 1,
    Archived: false,
    DataState: 1,
});

const resetFormData = () => {
    setFormData({
        Id: '',
        IdReference: 0,
        Reference: '',
        Customer: {} as Customer,
        Services: [] as ServiceOperation[],
        OperationStatus: 'Alta referencia' as 'Alta referencia' | 'pending' | 'completed' | 'failed',
        Observations: '',
        ListaParaFacturar: false,
        CreatedAt: new Date,
        CreatedBy: {
        UserId: user?._id || '',
        Name: user?.name || ''
        },
        UpdatedAt: new Date,
        UpdateBy: {
        UserId: user?._id || '',
        Name: user?.name || ''
        },
        Status: 1,
        Archived: false,
        DataState: 1,
    })
}

const setCompleteFormData = ( operation: Operation, selectedCustomer: Customer) => {
    setFormData({
      Id: operation.id,
      IdReference: operation.idReference,
      Reference: operation.reference,
      Customer: selectedCustomer ? {
        idCustomer: selectedCustomer.id,
        name: selectedCustomer.fiscalData.businessName,
        rfc: selectedCustomer.fiscalData.taxId
      } : operation.customer,
      Services: operation.services,
      OperationStatus: operation.operationStatus,
      ListaParaFacturar: operation.listaParaFacturar || false,
      Observations: operation.observations || '',
      CreatedAt: operation.createdAt,
      CreatedBy: operation.createdBy,
      UpdatedAt: Date,
      UpdateBy: {
        UserId: user?._id || '',
        Name: user?.name || ''
      },
      Status: operation.status,
      Archived: operation.archived,
      DataState: operation.dataState,
    })
}

const updateFormData = (changes: 
                        | Partial<OperationsFormData> 
                        | ((prev: OperationsFormData) => Partial<OperationsFormData>)) => {
    setFormData(prev => ({ 
        ...prev, 
        ...(typeof changes === 'function' ? changes(prev) : changes )
    }));
};

 const updateServiceFormData = (idServiceItem: number, detailId: number, field: string, value: any) => {
    setFormData(formData => ({ 
      ...formData,
      Services: formData.Services.map(service =>
        service.idServiceItem === idServiceItem ? {
          ...service,
          serviceDetail: service.serviceDetail.map(detail =>
            detail.sequence === detailId ? {
              ...detail,
              [field]: value
            } : detail
          )
        } : service
      )
    }));
  };

  const updateServiceDetail = (idServiceItem: number, detailId: number, collection: string, field: string, value: any) => {

    setFormData(formData => ({
      ...formData,
      Services: formData.Services.map(service =>
        service.idServiceItem === idServiceItem ? {
          ...service,
          serviceDetail: service.serviceDetail.map(detail =>
            detail.sequence === detailId ? {
              ...detail,
              [collection]: {
                ...detail[collection],
                [field]: value
              }
            } : detail
          )
        } : service
      )
    }));
  // console.log(formData)
  };

  const duplicateDetail = (idServiceItem: number, detailId: number, newDetail: object) => {

    setFormData(prev => ({
      ...prev,
      Services: prev.Services.map(service =>
        service.idServiceItem === idServiceItem
          ? {
            ...service,
            serviceDetail: [
              ...service.serviceDetail,
              newDetail
            ]
          }
          : service
      )
    }));
 
    console.log(formData)
  };


return {
    formData, 
    resetFormData,
    setCompleteFormData,
    updateFormData, 
    updateServiceFormData,
    updateServiceDetail,
    duplicateDetail
}
}