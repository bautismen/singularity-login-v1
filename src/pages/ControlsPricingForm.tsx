import { useState, useEffect } from 'react';
import { ArrowLeft, Save, RefreshCw, Trash2, ChevronDown, Plus, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { quotationService } from '../services/quotationService';
import { pricingControlService } from '../services/pricingControlService';
import { PricingControlSupplier } from '../types/pricingControl';
import styles from './ControlsPricing.module.css';

interface ControlsPricingFormProps {
  requestId: string | null;
  controlId?: string;
  onBack: () => void;
}

export function ControlsPricingForm({ requestId, controlId, onBack }: ControlsPricingFormProps) {
  const { t } = useLanguage();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState<any>(null);
  const [controlData, setControlData] = useState<any>(null);

  const [suppliers, setSuppliers] = useState<PricingControlSupplier[]>([
    { idsuplier: 1, supplier_associated_name: 'Proveedor 1' }
  ]);

  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [statusControl, setStatusControl] = useState({
    _id_status_control: 4,
    status_control_name: 'Asignada'
  });

  useEffect(() => {
    loadData();
  }, [requestId, controlId]);

  const loadData = async () => {
    if (!requestId) return;

    try {
      setLoading(true);

      if (controlId) {
        const control = await pricingControlService.getById(controlId);
        setControlData(control);
        setSuppliers(control.suppliers || []);
        setSelectedServices(control.services || []);
        setStatusControl(control.status_control);

        const request = await quotationService.getById(control._idrequest);
        setRequestData(request);
      } else {
        const request = await quotationService.getById(requestId);
        setRequestData(request);
        setSelectedServices(request.services?.filter((s: any) => !s.used) || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const addSupplier = () => {
    const nextId = suppliers.length > 0
      ? Math.max(...suppliers.map(s => s.idsuplier)) + 1
      : 1;
    setSuppliers([...suppliers, {
      idsuplier: nextId,
      supplier_associated_name: `Proveedor ${nextId}`
    }]);
  };

  const removeSupplier = (id: number) => {
    setSuppliers(suppliers.filter(s => s.idsuplier !== id));
  };

  const updateSupplier = (id: number, name: string) => {
    setSuppliers(suppliers.map(s =>
      s.idsuplier === id ? { ...s, supplier_associated_name: name } : s
    ));
  };

  const toggleService = (serviceId: number) => {
    const service = requestData.services.find((s: any) => s.idservice === serviceId);
    if (!service) return;

    const isSelected = selectedServices.some(s => s.idservice === serviceId);

    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.idservice !== serviceId));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleSave = async () => {
    if (!requestId) return;

    try {
      setLoading(true);

      const servicesWithoutMerchandise = selectedServices.map(s => {
        const { merchandise, ...serviceData } = s;
        return serviceData;
      });

      if (controlId) {
        await pricingControlService.update({
          _id: controlId,
          suppliers,
          services: servicesWithoutMerchandise,
          status_control: statusControl
        });
        showSuccess('Control de pricing actualizado exitosamente');
      } else {
        await pricingControlService.create({
          _idrequest: requestId,
          suppliers,
          services: servicesWithoutMerchandise,
          status_control: statusControl
        });
        showSuccess('Control de pricing creado exitosamente');
      }

      onBack();
    } catch (error: any) {
      console.error('Error saving control:', error);
      showError(error.message || 'Error al guardar el control de pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!controlId) return;

    if (!confirm('¿Está seguro de eliminar este control de pricing?')) return;

    try {
      setLoading(true);
      await pricingControlService.delete(controlId);
      showSuccess('Control de pricing eliminado exitosamente');
      onBack();
    } catch (error) {
      console.error('Error deleting control:', error);
      showError('Error al eliminar el control de pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsQuoted = async () => {
    if (!controlId) return;

    try {
      setLoading(true);
      await pricingControlService.markAsQuoted(controlId);
      setStatusControl({
        _id_status_control: 5,
        status_control_name: 'Cotizada'
      });
      showSuccess('Control marcado como cotizado');
    } catch (error) {
      console.error('Error marking as quoted:', error);
      showError('Error al marcar como cotizado');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryMedal = (category: number) => {
    switch (category) {
      case 1: return '/gold.png';
      case 2: return '/silver.png';
      case 3: return '/bronze.png';
      default: return '';
    }
  };

  if (loading && !requestData) {
    return (
      <div className={styles.formContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className={styles.formContainer}>
        <div className={styles.emptyState}>
          <h3>No se encontró la solicitud</h3>
        </div>
      </div>
    );
  }

  const medalSrc = getCategoryMedal(requestData.customer_category);

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <div className={styles.formHeaderLeft}>
          <button onClick={onBack} className={styles.backButton} disabled={loading}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.formTitle}>Control de pricing</h1>
            <p className={styles.formSubtitle}>
              {controlId ? 'Editar número de control' : 'Nuevo número de control'}
            </p>
          </div>
        </div>
        <div className={styles.formHeaderRight}>
          <button className={styles.btnSave} onClick={handleSave} disabled={loading}>
            <Save size={18} />
            Guardar
          </button>
          <button className={styles.btnIconOnly} onClick={loadData} disabled={loading}>
            <RefreshCw size={18} />
          </button>
          {controlId && (
            <button className={styles.btnIconOnly} onClick={handleDelete} disabled={loading}>
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.formContent}>
        <div className={styles.clientSection}>
          <div className={styles.clientHeader}>
            <div className={styles.clientInfo}>
              {medalSrc && (
                <img src={medalSrc} alt="Medal" className={styles.clientMedal} />
              )}
              <div>
                <h2 className={styles.clientName}>
                  {requestData.customer_business_name}
                  {requestData.priority === 1 && (
                    <img src="/prioridad.png" alt="Prioridad" className={styles.priorityIcon} style={{width: '20px', height: '20px'}} />
                  )}
                </h2>
                <div className={styles.clientDetails}>
                  <span className={styles.clientId}>
                    Ref: {requestData.reference_request}
                  </span>
                  <span className={styles.clientExecutive}>
                    {requestData.requesting_data?.complete_name}
                  </span>
                </div>
                {controlData && (
                  <div className={styles.clientControl}>
                    <span className={styles.controlLabel}>Control</span>
                    <span className={styles.controlBadge}>{controlData.control}</span>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.clientMeta}>
              <div className={styles.clientType}>{requestData.request_type_name}</div>
              <div className={`${styles.statusBadge} ${styles.statusAsignada}`}>
                {statusControl.status_control_name}
              </div>
            </div>
          </div>
          {controlId && (
            <div className={styles.clientActions}>
              <button
                className={styles.btnQuote}
                onClick={handleMarkAsQuoted}
                disabled={loading || statusControl._id_status_control === 5}
              >
                Marcar como Cotizada
              </button>
            </div>
          )}
        </div>

        <div className={styles.suppliersSection}>
          <h3 className={styles.sectionTitle}>Asignación de proveedores</h3>
          <div className={styles.suppliersList}>
            {suppliers.map((supplier) => (
              <div key={supplier.idsuplier} className={styles.supplierItem}>
                <span className={styles.supplierLabel}>Proveedor {supplier.idsuplier}</span>
                <input
                  type="text"
                  value={supplier.supplier_associated_name}
                  onChange={(e) => updateSupplier(supplier.idsuplier, e.target.value)}
                  className={styles.supplierInput}
                  placeholder="Nombre del proveedor"
                  disabled={loading}
                />
                <button
                  className={styles.btnRemoveSupplier}
                  onClick={() => removeSupplier(supplier.idsuplier)}
                  disabled={loading}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            className={styles.btnAddSupplier}
            onClick={addSupplier}
            disabled={loading}
          >
            <Plus size={16} />
            Agregar proveedor
          </button>
        </div>

        <div className={styles.generalSection}>
          <h3 className={styles.sectionTitle}>Servicios disponibles</h3>
          <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem'}}>
            Seleccione los servicios que desea incluir en este número de control.
            Los servicios no usados de la solicitud original aparecen disponibles.
          </p>
          <div className={styles.servicesSection}>
            {requestData.services && requestData.services.length > 0 ? (
              requestData.services.map((service: any, index: number) => {
                const isSelected = selectedServices.some(s => s.idservice === service.idservice);
                const isUsed = service.used && !isSelected;

                return (
                  <div
                    key={service.idservice}
                    className={styles.serviceCard}
                    style={{
                      opacity: isUsed ? 0.5 : 1,
                      border: isSelected ? '2px solid #14b8a6' : '1px solid #e5e7eb'
                    }}
                  >
                    <div className={styles.serviceHeader}>
                      <div className={styles.serviceNumber}>{index + 1}</div>
                      <div style={{flex: 1}}>
                        <div style={{fontWeight: 600, marginBottom: '0.5rem'}}>
                          {service.service_name} - {service._id_operation_type === 1 ? 'Importación' : 'Exportación'}
                        </div>
                        <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                          {service.origin?.country} → {service.destination?.country}
                        </div>
                        {service.incoterm_name && (
                          <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                            Incoterm: {service.incoterm_name}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={styles.toggleLabel}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleService(service.idservice)}
                            disabled={isUsed || loading}
                          />
                          <span>{isSelected ? 'Seleccionado' : isUsed ? 'Ya usado' : 'Seleccionar'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <p>No hay servicios disponibles en esta solicitud</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
