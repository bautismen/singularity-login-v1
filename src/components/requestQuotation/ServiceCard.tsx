import React from 'react';
import { X, Copy } from 'lucide-react';
import { Service, Shipment, Cargo, ContainerRequest } from '../../types/requestQuotation';
import { Container } from '../../types/container';
import { FreightShipmentForm, FreightShipmentFormProps, OrderBaseFormProps } from './FreightServiceForm';
import { OtherServicesForm, OtherServicesFormProps } from './OtherServicesForm';
import styles from '../../pages/Quotations.module.css';


// ─── Sets de clasificación de servicios ──────────────────────────────────────
const FREIGHT_SERVICE_IDS = new Set([1, 2, 3, 4, 5, 10, 11]);
// Si necesitas otros grupos en el futuro:
// const WAREHOUSE_SERVICE_IDS = new Set([6, 7]);

// ─── Función que resuelve el formulario ──────────────────────────────────────
const resolveShipmentForm = (idService: number): React.FC<any> => {
  if (FREIGHT_SERVICE_IDS.has(idService)) return FreightShipmentForm;
  // if (WAREHOUSE_SERVICE_IDS.has(idService)) return WarehouseForm;  ← futuro
  // if (PARCEL_SERVICE_IDS.has(idService))    return ParcelForm;     ← futuro
  return OtherServicesForm; // fallback para cualquier otro id
};

// ─── Mapa de formularios ──────────────────────────────────────────────────────
// Para agregar un nuevo tipo de servicio:
//   1. Crea XxxForm.tsx que extienda ShipmentFormProps
//   2. Agrégalo aquí con su idService
const ShipmentFormMap: Record<number, React.FC<any>> = {
  1:  FreightShipmentForm,  // Marítimo FCL
  2:  FreightShipmentForm,  // Marítimo LCL
  3:  FreightShipmentForm,  // Terrestre FTL
  4:  FreightShipmentForm,  // Terrestre LTL
  5:  FreightShipmentForm,  // Aéreo
  10: FreightShipmentForm,  // Terrestre FCL
  11: FreightShipmentForm,  // Terrestre LCL
   6:  OtherServicesForm,     // Almacén    ← futuro
  // 8:  ParcelForm,        // Paquetería ← futuro
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface ServiceCardProps {
  service:           Service;
  index:             number;
  mode:              'create' | 'edit' | 'view';
  idStatusRequest:   number;
  availableServices: any[];
  projectionShipmentState: { [key: number]: boolean };
  // Handlers del servicio (solo ServiceCard los necesita)
  onUpdateService:    (id: number, changes: Record<string, any>) => void;
  onRemoveService:    (idServiceItem: number) => void;
  onDuplicateService: (idServiceItem: number) => void;
  // Props base — se pasan a cualquier ShipmentForm
  onUpdateShipment:           (idServiceItem: number, idShipment: number, field: keyof Shipment, value: any) => void;
  onUpdateProjection:         (idServiceItem: number, idShipment: number, changes: Record<string, any>) => void;
  onProjectionStateChange:    (idServiceItem: number) => void;
  onUpdateServicesAssociated: (idServiceItem: number, idShipment: number, service: any) => void;
  onOpenMerchandiseModal:     (service: Service, cargo?: Cargo) => void;
  onRemoveMerchandise:        (idServiceItem: number, merchandise: Cargo) => void;
  currentServiceId:           number | null;
  t:                          (key: string) => string;
  // Props específicos de flete — solo se usan con FreightShipmentForm
  incoterms:                  any[];
  countries:                  any[];
  availableContainers:        Container[];
  loadingContainers:          boolean;
  showContainersModal:        boolean;
  onOpenContainerModal:       (idServiceItem: number, containers: ContainerRequest[]) => void;
  onUpdateContainersShipment: (idServiceItem: number, idShipment: number, container: ContainerRequest) => void;
  onUpdateContainersQuantity: (idServiceItem: number, idShipment: number, idContainer: number, changes: Record<string, any>) => void;
  onCloseContainerModal:      () => void;
  onUpdateOrigin:             (idServiceItem: number, changes: Record<string, any>,  idShipment?: number,) => void;
  onUpdateDestination:        (idServiceItem: number, changes: Record<string, any>,  idShipment?: number,) => void;
  onTypeOperationChange:      (idServiceItem: number, idShipment: number, value: number, text: string) => void;
  onIncotermChange:           (idServiceItem: number, idShipment: number, value: number, text: string) => void;
  onTypeShipmentChange:       (idServiceItem: number, idShipment: number, value: number, text: string) => void;
  //props especificos de otros servicios
  onUpdateOrderService:       (idServiceItem: number, changes: Record<string, any>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  index,
  mode,
  idStatusRequest,
  availableServices,
  projectionShipmentState,
  onUpdateService,
  onRemoveService,
  onDuplicateService,
  // base
  onUpdateShipment,
  onUpdateProjection,
  onProjectionStateChange,
  onUpdateServicesAssociated,
  onOpenMerchandiseModal,
  onRemoveMerchandise,
  currentServiceId,
  t,
  // flete
  incoterms,
  countries,
  availableContainers,
  loadingContainers,
  showContainersModal,
  onOpenContainerModal,
  onUpdateContainersShipment,
  onUpdateContainersQuantity,
  onCloseContainerModal,
  onUpdateOrigin,
  onUpdateDestination,
  onTypeOperationChange,
  onIncotermChange,
  onTypeShipmentChange,
  //otros servicios
  onUpdateOrderService
}) => {

  const isDisabled     = mode === 'view' || idStatusRequest >= 2;
  const showProjection = projectionShipmentState[service.idServiceItem] ?? (!!service.shipments?.[0]?.projectionShipment || !!service.orderService?.projectionShipment);

  // Props base — los recibe cualquier ShipmentForm
  const baseProps: OrderBaseFormProps = {
    availableServices,
    service,
    mode,
    idStatusRequest,
    showProjection,
    currentServiceId,
    onUpdateService,
    onUpdateShipment,
    onUpdateProjection,
    onProjectionStateChange,
    onUpdateServicesAssociated,
    onOpenMerchandiseModal,
    onRemoveMerchandise,
    t,
  };

  // Props extendidos para FreightShipmentForm - servicios de fletes
  const freightProps: FreightShipmentFormProps = {
    ...baseProps,
    incoterms,
    countries,
    availableContainers,
    loadingContainers,
    showContainersModal,
    onOpenContainerModal,
    onUpdateContainersShipment,
    onUpdateContainersQuantity,
    onCloseContainerModal,
    onUpdateOrigin,
    onUpdateDestination,
    onTypeOperationChange,
    onIncotermChange,
    onTypeShipmentChange,
  };

  //Props para Otros Servicios
  const otherServicesProps: OtherServicesFormProps = {
   ...baseProps,
    countries,    
    onUpdateOrigin,
    onUpdateDestination,
    onTypeOperationChange,
    onTypeShipmentChange,
    onUpdateOrderService, 
};

  // Selecciona el formulario; si no hay mapeo usa FreightShipmentForm como fallback
  const ShipmentForm = resolveShipmentForm(service.idService); //ShipmentFormMap[service.idService] ?? FreightShipmentForm;

  // Pasa los props correctos según el formulario seleccionado.
  // Cuando existan otros formularios (Almacén, etc.) se agrega su propio
  // bloque de props aquí y se pasa condicionalmente.
  const formProps = 
                    ShipmentForm === FreightShipmentForm ? freightProps : 
                    ShipmentForm === OtherServicesForm       ? otherServicesProps :
                    baseProps;

  return (
    <div className={styles.serviceCard}>
      {/* ── Header ── */}
      <div className={styles.serviceHeader}>
        <div className={styles.serviceNumber}>{index + 1}</div>
        <div className={styles.serviceActions}>
          <button
            type="button" className={styles.iconButton}
            disabled={isDisabled}
            onClick={() => onDuplicateService(service.idServiceItem)}>
            <Copy size={18} />
          </button>
          <button
            type="button" className={`${styles.iconButton} ${styles.danger}`}
            disabled={isDisabled}
            onClick={() => onRemoveService(service.idServiceItem)}>
            <X size={18} />
          </button>
        </div>
      </div>
      
        {/* ── Formulario del servicio ── */}
        <ShipmentForm {...formProps} />
        
    </div>
  );
};

export default ServiceCard;