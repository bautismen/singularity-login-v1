import { useState } from 'react';
import { Service, Shipment, ContainerRequest } from '../types/requestQuotation';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [projectionShipmentState, setProjectionShipmentState] = useState<{ [key: number]: boolean }>({});

  // ── CRUD de servicios ────────────────────────────────────────────────────────

  const addService = () => {
    const newService: Service = {
      idServiceItem: services.length + 1,
      idService: 0,
      nameService: '',
      used: false,
      /*shipments: [{
        idShipment: 1,
        origin: '',
        destination: '',
        idTypeShipment: 0,
        typeShipment: '',
        idTypeOperation: 0,
        typeOperation: '',
        idIncoterm: 0,
        incoterm: '',
        departureDateAproximate: '',
        projectionShipment: '',
        comments: '',
        servicesAsociated: [],
        cargo: [],
      }],*/
    };
    setServices(prev => [...prev, newService]);
  };

  const removeService = (idServiceItem: number) => {
    setServices(prev => prev.filter(s => s.idServiceItem !== idServiceItem));
  };

  const duplicateService = (idServiceItem: number) => {
    const toDuplicate = services.find(s => s.idServiceItem === idServiceItem);
    if (!toDuplicate) return;

    const newId = services.length + 1;
    setServices(prev => [...prev, { ...toDuplicate, idServiceItem: newId }]);
    setProjectionShipmentState(prev => ({
      ...prev,
      [newId]: prev[idServiceItem] ?? false,
    }));
  };

  const updateService = (id: number, changes: Record<string, any>) => {
    setServices(prev =>
      prev.map(s => s.idServiceItem === id ? { ...s, ...changes } : s)
    );
  };

  /** Hidrata los servicios con datos del API (modo edit/view) */
  const setAllServices = (rawServices: any[]) => {
    const loaded: Service[] = rawServices.map((service: any, idx: number) => ({
      idServiceItem: idx + 1,

      idService: service.idService,
      nameService: service.nameService || '',
      used: service.used || false,
      ...(service.shipments?.length ? 
        { shipments: service.shipments?.map((shipment: any) => {
          if ('projectionShipment' in shipment) {
            setProjectionShipmentState(prev => ({
              ...prev,
              [idx + 1]: true,
            }));
          }
        return shipment;
      })
      } : {
        orderService : service.orderService
      }
    )      
    }));
    setServices(loaded);
  };

  // ── Order Service ────────────────────────────────────────────────────────────
  const updateOrderService = (     
    idServiceItem: number,
    changes: Record<string, any>
  ) => {    
     setServices(prev =>         
        prev.map(s => s.idServiceItem !== idServiceItem ? s : {
        ...s,
        orderService:  { ...s.orderService, ...changes}
        })        
    );    
  };

  // ── Shipment ─────────────────────────────────────────────────────────────────
  const updateShipment = (
    idServiceItem: number,
    idShipment: number,
    field: keyof Shipment,
    value: any
  ) => {
    setServices(prev =>
      prev.map(s => s.idServiceItem !== idServiceItem ? s : {
        ...s,
        shipments: s.shipments?.map(sh => sh.idShipment !== idShipment ? sh : {
          ...sh,
          [field]: value,
        }),
      })
    );
  };

  const updateOrigin = (
    idServiceItem: number,    
    changes: Record<string, any>,
    idShipment?: number,
  ) => {
    setServices(prev =>
      prev.map(s => s.idServiceItem !== idServiceItem ? s : {
        ...s,
        ...(idShipment !== undefined ?   
          { 
            shipments: s.shipments?.map(sh => sh.idShipment !== idShipment ? sh : {
              ...sh,
              origin: { ...sh.origin, ...changes },
            })
          } : {
            orderService: {
              ...s.orderService,
             origin: { ...s.orderService?.origin, ...changes }
            }            
          }),
      })
    );
  };

  const updateDestination = (
    idServiceItem: number,    
    changes: Record<string, any>,
    idShipment?: number,
  ) => {
    setServices(prev =>
      prev.map(s => s.idServiceItem !== idServiceItem ? s : {
        ...s,
        ...(idShipment !== undefined ? {
          shipments: s.shipments?.map(sh => sh.idShipment !== idShipment ? sh : {
          ...sh,
          destination: { ...sh.destination, ...changes },
        })} : {
          orderService: {
            ...s.orderService,
            destination: { ...s.orderService?.destination, ...changes }            
          }          
        })        
      })
    );
  };  

  const handleTypeOperationChange = (
    idServiceItem: number,    
    idShipment: number,
    value: number,
    text: string    
  ) => {
    setServices(prev =>
      prev.map(s => s.idServiceItem !== idServiceItem ? s : {
        ...s,
        shipments: s.shipments?.map(sh => sh.idShipment !== idShipment ? sh : {
          ...sh,
          idTypeOperation: value,
          typeOperation: text,
          // Si es Nacional(3) o LocalUSA(4) → fuerza incoterm N/A
          ...(([3, 4].includes(value)) && { idIncoterm: 13, incoterm: 'N/A' }),
        })
      })
    );
  };

  const handleIncotermChange = (
    idServiceItem: number,
    idShipment: number,
    value: number,
    text: string
  ) => {
    setServices(prev =>
      prev.map(s => s.idServiceItem !== idServiceItem ? s : {
        ...s,
        shipments: s.shipments?.map(sh => sh.idShipment !== idShipment ? sh : {
          ...sh,
          idIncoterm: value,
          incoterm: text,
        }),
      })
    );
  };

  const handleTypeShipmentChange = (
    idServiceItem: number,
    idShipment: number,
    value: number,
    text: string
  ) => {
    setServices(prev =>
      prev.map(s => s.idServiceItem !== idServiceItem ? s : {
        ...s,
        shipments: s.shipments?.map(sh => sh.idShipment !== idShipment ? sh : {
          ...sh,
          idTypeShipment: value,
          typeShipment: text,
        }),
      })
    );
  };

  const updateProjectionShipment = (
    idServiceItem: number,
    idShipment: number,
    changes: Record<string, any>
  ) => {
    setServices(prev =>
      prev.map(s => s.idServiceItem !== idServiceItem ? s : {
        ...s,
        shipments: s.shipments?.map(sh => sh.idShipment !== idShipment ? sh : {
          ...sh,
          projectionShipment: { ...sh.projectionShipment, ...changes },
        }),
      })
    );
  };

  const handleProjectionShipmentState = (idServiceItem: number) => {
    setProjectionShipmentState(prev => ({
      ...prev,
      [idServiceItem]: !(prev[idServiceItem] ?? false),
    }));
  };

  // ── Servicios asociados ──────────────────────────────────────────────────────
  const updateServicesAssociated = (
    idServiceItem: number,
    idShipment: number,
    serviceAsociated: any
  ) => {
    setServices(prev =>
      prev.map(s => s.idServiceItem !== idServiceItem ? s : {
        ...s,
        shipments: s.shipments?.map(sh => {
          if (sh.idShipment !== idShipment) return sh;
          const current = sh.servicesAsociated ?? [];
          const exists  = current.some(x => x.idServiceAsociated === serviceAsociated.idServiceAsociated);
          return {
            ...sh,
            servicesAsociated: exists
              ? current.filter(x => x.idServiceAsociated !== serviceAsociated.idServiceAsociated)
              : [...current, serviceAsociated],
          };
        }),
      })
    );
  };

  // ── Contenedores ─────────────────────────────────────────────────────────────
  const updateContainersShipment = (
    idServiceItem: number,
    idShipment: number,
    containerUpdate: ContainerRequest
  ) => {
    setServices(prev =>
      prev.map(service => service.idServiceItem !== idServiceItem ? service : {
        ...service,
        shipments: service.shipments?.map(shipment => {
          if (shipment.idShipment !== idShipment) return shipment;
          const current = shipment.containers ?? [];
          const exists  = current.some(c => c.idContainer === containerUpdate.idContainer);
          return {
            ...shipment,
            containers: exists
              ? current.filter(c => c.idContainer !== containerUpdate.idContainer)
              : [...current, containerUpdate],
          };
        }),
      })
    );
  };

  const updateContainersQuantityShipment = (
    idServiceItem: number,
    idShipment: number,
    idContainer: number,
    changes: Record<string, any>
  ) => {
    setServices(prev =>
      prev.map(s => s.idServiceItem !== idServiceItem ? s : {
        ...s,
        shipments: s.shipments?.map(sh => {
          if (sh.idShipment !== idShipment) return sh;
          return {
            ...sh,
            containers: (sh.containers ?? []).map(c =>
              c.idContainer === idContainer ? { ...c, ...changes } : c
            ),
          };
        }),
      })
    );
  };

  // ── Mercancía ────────────────────────────────────────────────────────────────
  const removeMerchandise = (idServiceItem: number, merchandise: any) => {
    setServices(prev =>
      prev.map(s => s.idServiceItem !== idServiceItem ? s : {
        ...s,
        shipments: s.shipments?.map(sh => sh.idShipment !== 1 ? sh : {
          ...sh,
          cargo: sh.cargo.filter(m => m !== merchandise),
        }),
      })
    );
  };

  const saveMerchandise = (idServiceItem: number, newMerchandise: any, editingMerchandise: any | null) => {
    setServices(prev =>
      prev.map(s => {
        if (s.idServiceItem !== idServiceItem) return s;        
          return {
            ...s,
            ...(s.shipments !== undefined ? 
            {
              shipments: s.shipments?.map(sh => {
                if (sh.idShipment !== 1) return sh;
                return {
                  ...sh,
                  cargo: editingMerchandise
                    ? sh.cargo.map(m => m === editingMerchandise ? newMerchandise : m)
                    : [...sh.cargo, newMerchandise],
                };
              }),
            } : {
              orderService : {
                 ...s.orderService,
                 cargo: editingMerchandise ?  s.orderService?.cargo?.map(m => m === editingMerchandise ? newMerchandise : m) : 
                  [...(s.orderService?.cargo ?? []), newMerchandise]
              }
            })            
          };        
      })
    );
  };

  return {
    // estado
    services,
    projectionShipmentState,
    // servicios
    addService,
    removeService,
    duplicateService,
    updateService,
    setAllServices,
    //other services
    updateOrderService,
    // shipment
    updateShipment,
    updateOrigin,
    updateDestination,
    handleTypeOperationChange,
    handleIncotermChange,
    handleTypeShipmentChange,
    updateProjectionShipment,
    handleProjectionShipmentState,
    // asociados
    updateServicesAssociated,
    // contenedores
    updateContainersShipment,
    updateContainersQuantityShipment,
    // mercancía
    removeMerchandise,
    saveMerchandise,
  };
};