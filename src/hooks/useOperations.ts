import { useState, useEffect } from 'react';
import { Operation, Customer, Service, ServiceOperation, ServiceDetail, HistoryStatus, UserInfo } from '../types/operations';
import { useAuth } from '../contexts/AuthContext';

export interface OperationsFormData {
    Id: string,
    IdReference: number,
    Reference: string,
    Customer: Customer,
    Services: ServiceOperation[],
    Observations: string,
    OperationStatus: string,
    HistoryStatus: HistoryStatus[],
    ListaParaFacturar: boolean,
    ICveMaestroOperaciones: number,
    CreatedAt: Date,
    CreatedBy: UserInfo,
    UpdatedAt: Date,
    UpdateBy: UserInfo,
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
    Observations: '',
    OperationStatus: 'Alta referencia' as 'Alta referencia' | 'pending' | 'completed' | 'failed',
    HistoryStatus: [{
      status: 'Alta referencia',
      statusDate: new Date,
      updatedBy: {
        UserId: user?._id || '',
        Name: user?.name || ''
      },
    }],
    ListaParaFacturar: false,
    ICveMaestroOperaciones: 0,
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
        Observations: '',
        OperationStatus: 'Alta referencia' as 'Alta referencia' | 'pending' | 'completed' | 'failed',
        HistoryStatus: [{
          status: 'Alta referencia',
          statusDate: new Date,
          updatedBy: {
            UserId: user?._id || '',
            Name: user?.name || ''
          },
        }],
        ListaParaFacturar: false,
        ICveMaestroOperaciones: 0,
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
      IdReference: operation.idReference || 0,
      Reference: operation.reference,
      Customer: selectedCustomer ? {
        idCustomer: selectedCustomer.id,
        name: selectedCustomer.fiscalData.businessName,
        rfc: selectedCustomer.fiscalData.taxId
      } : operation.customer,
      Services: operation.services,
      Observations: operation.observations || '',
      OperationStatus: operation.operationStatus,
      ListaParaFacturar: operation.listaParaFactura || false,
      ICveMaestroOperaciones: operation.iCveMaestroOperaciones,
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
  console.log('updateServiceFormData',idServiceItem, detailId, field, value,formData)
    setFormData(formData => ({ 
      ...formData,
      Services: formData.Services.map(service =>
        service.idServiceItem === idServiceItem ? {
          ...service,
          serviceDetail: service.serviceDetail?.map(detail =>
            detail.idDetail === detailId ? {
              ...detail,
              [field]:
                value !== null &&
                  typeof value === 'object' &&
                  !Array.isArray(value)
                  ? {
                    ...(detail[field] || {}),
                    ...value
                  } : value
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
            detail.idDetail === detailId ? {
              ...detail,
              [collection]: {
                ...detail[collection],
                [field]:
                  typeof value === 'object' &&
                  value !== null &&
                  !Array.isArray(value)
                    ? {
                        ...detail[collection]?.[field],
                        ...value
                      }
                    : value
              }
            } : detail
          )
        } : service
      )
    }));

    console.log('updateServiceDetail', formData);

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

  };

  const removeDetail = (idServiceItem: number, idDetail: number) => {
    setFormData(prev => ({
      ...prev,
      Services: prev.Services.map(service => service.idServiceItem === idServiceItem ? 
        {
          ...service,
          serviceDetail: service.serviceDetail.filter(det => det.idDetail !== idDetail)

        } : service
      )
    })
    )
  };


return {
    formData, 
    resetFormData,
    setCompleteFormData,
    updateFormData, 
    updateServiceFormData,
    updateServiceDetail,
    duplicateDetail,
    removeDetail
}
}