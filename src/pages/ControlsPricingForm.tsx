import { useState } from 'react';
import { ArrowLeft, Save, RefreshCw, Trash2, ChevronDown, Plus, Copy, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import styles from './ControlsPricing.module.css';

interface Merchandise {
  id: string;
  name: string;
  dangerous: boolean;
  classification: string;
  stackable: boolean;
  totalVolume: number;
  totalWeight: number;
}

interface Service {
  id: string;
  service: string;
  operation: string;
  incoterm: string;
  expectedDeparture: string;
  origin: string;
  destination: string;
  destinationPostalCode: string;
  shippingType: string;
  associatedServices: string[];
  comments: string;
  scheduledFrequency: boolean;
  frequency: string;
  quantity: number;
  measure: string;
  merchandise: Merchandise[];
}

interface Supplier {
  id: string;
  name: string;
}

interface ControlsPricingFormProps {
  requestId?: string;
  onBack: () => void;
}

export function ControlsPricingForm({ requestId, onBack }: ControlsPricingFormProps) {
  const { t } = useLanguage();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    customerName: 'JUGOS DEL VALLE SAPL SR',
    customerId: '0825-052455',
    executive: 'Misael Tamayo',
    controlNumber: 'C2601-001',
    priority: false,
    bidding: false,
    type: 'Comercial',
    origin: 'Canadá',
    destination: 'México',
    status: 'En proceso',
    network: 'WTC Alliance',
    complexity: 'Media',
    currency: 'USD',
    unitProfit: '',
    generalProfit: '',
    comments: ''
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: '1', name: 'Hapag Lloyd SC de RL' },
    { id: '2', name: 'Mediterran Shiping SC de RL' }
  ]);

  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      service: 'Marítimo LCL',
      operation: 'Importación',
      incoterm: 'EXW',
      expectedDeparture: '2025-12-18',
      origin: '(XX)',
      destination: '(AF)',
      destinationPostalCode: '',
      shippingType: 'Door to Door',
      associatedServices: ['Seguro', 'Maniobra', 'Custodia', 'Inspección', 'Despacho aduanal'],
      comments: '',
      scheduledFrequency: true,
      frequency: 'Semanal',
      quantity: 23,
      measure: 'Kilos',
      merchandise: [
        {
          id: '1',
          name: 'eeeeee',
          dangerous: false,
          classification: 'General',
          stackable: true,
          totalVolume: 272,
          totalWeight: 20
        },
        {
          id: '2',
          name: 'aaaa',
          dangerous: false,
          classification: 'Refrigerada',
          stackable: false,
          totalVolume: 81,
          totalWeight: 9
        }
      ]
    },
    {
      id: '2',
      service: 'Marítimo LCL',
      operation: 'Importación',
      incoterm: 'EXW',
      expectedDeparture: '2025-12-20',
      origin: '(AF)',
      destination: '(AF)',
      destinationPostalCode: '',
      shippingType: 'Port to Port',
      associatedServices: ['Seguro', 'Maniobra', 'Custodia', 'Inspección', 'Despacho aduanal'],
      comments: '333',
      scheduledFrequency: false,
      frequency: '',
      quantity: 0,
      measure: '',
      merchandise: []
    }
  ]);

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      service: 'Marítimo LCL',
      operation: 'Importación',
      incoterm: 'EXW',
      expectedDeparture: '',
      origin: '',
      destination: '',
      destinationPostalCode: '',
      shippingType: 'Door to Door',
      associatedServices: [],
      comments: '',
      scheduledFrequency: false,
      frequency: '',
      quantity: 0,
      measure: '',
      merchandise: []
    };
    setServices([...services, newService]);
  };

  const removeService = (serviceId: string) => {
    setServices(services.filter(s => s.id !== serviceId));
  };

  const duplicateService = (serviceId: string) => {
    const serviceToDuplicate = services.find(s => s.id === serviceId);
    if (serviceToDuplicate) {
      const newService = {
        ...serviceToDuplicate,
        id: Date.now().toString()
      };
      setServices([...services, newService]);
    }
  };

  const updateService = (serviceId: string, field: string, value: any) => {
    setServices(services.map(s =>
      s.id === serviceId ? { ...s, [field]: value } : s
    ));
  };

  const toggleAssociatedService = (serviceId: string, serviceName: string) => {
    setServices(services.map(s => {
      if (s.id === serviceId) {
        const exists = s.associatedServices.includes(serviceName);
        return {
          ...s,
          associatedServices: exists
            ? s.associatedServices.filter(name => name !== serviceName)
            : [...s.associatedServices, serviceName]
        };
      }
      return s;
    }));
  };

  const addMerchandise = (serviceId: string) => {
    const newMerchandise: Merchandise = {
      id: Date.now().toString(),
      name: '',
      dangerous: false,
      classification: 'General',
      stackable: false,
      totalVolume: 0,
      totalWeight: 0
    };
    setServices(services.map(s =>
      s.id === serviceId
        ? { ...s, merchandise: [...s.merchandise, newMerchandise] }
        : s
    ));
  };

  const removeMerchandise = (serviceId: string, merchandiseId: string) => {
    setServices(services.map(s =>
      s.id === serviceId
        ? { ...s, merchandise: s.merchandise.filter(m => m.id !== merchandiseId) }
        : s
    ));
  };

  const updateMerchandise = (serviceId: string, merchandiseId: string, field: string, value: any) => {
    setServices(services.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          merchandise: s.merchandise.map(m =>
            m.id === merchandiseId ? { ...m, [field]: value } : m
          )
        };
      }
      return s;
    }));
  };

  const addSupplier = () => {
    const newSupplier: Supplier = {
      id: Date.now().toString(),
      name: ''
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const removeSupplier = (supplierId: string) => {
    setSuppliers(suppliers.filter(s => s.id !== supplierId));
  };

  const handleSave = () => {
    showSuccess('Control de pricing guardado exitosamente');
  };

  const handleDecline = () => {
    showError('Control de pricing rechazado');
  };

  const handleQuote = () => {
    showSuccess('Control marcado como cotizado');
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <div className={styles.formHeaderLeft}>
          <button onClick={onBack} className={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.formTitle}>Control de pricing</h1>
            <p className={styles.formSubtitle}>Nuevo número de control</p>
          </div>
        </div>
        <div className={styles.formHeaderRight}>
          <button className={styles.btnSave} onClick={handleSave}>
            <Save size={18} />
            Guardar
          </button>
          <button className={styles.btnIconOnly}>
            <RefreshCw size={18} />
          </button>
          <button className={styles.btnIconOnly}>
            <Trash2 size={18} />
          </button>
          <button className={styles.btnActions}>
            Acciones
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      <div className={styles.formContent}>
        <div className={styles.clientSection}>
          <div className={styles.clientHeader}>
            <div className={styles.clientInfo}>
              <img src="/gold.png" alt="Medal" className={styles.clientMedal} />
              <div>
                <h2 className={styles.clientName}>
                  {formData.customerName}
                  <span className={styles.clientBadge}>🔴</span>
                </h2>
                <div className={styles.clientDetails}>
                  <span className={styles.clientId}>📋 {formData.customerId}</span>
                  <span className={styles.clientExecutive}>👤 {formData.executive}</span>
                </div>
                <div className={styles.clientControl}>
                  <span className={styles.controlLabel}>Control</span>
                  <span className={styles.controlBadge}>{formData.controlNumber}</span>
                </div>
              </div>
            </div>
            <div className={styles.clientMeta}>
              <div className={styles.clientType}>{formData.type}</div>
              <div className={styles.clientRoute}>
                {formData.origin} - {formData.destination}
              </div>
              <div className={styles.clientToggles}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.checked})}
                  />
                  <span>prioridad</span>
                </label>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={formData.bidding}
                    onChange={(e) => setFormData({...formData, bidding: e.target.checked})}
                  />
                  <span>licitación</span>
                </label>
              </div>
            </div>
          </div>
          <div className={styles.clientActions}>
            <button className={styles.btnDecline} onClick={handleDecline}>
              Declinar
            </button>
            <button className={styles.btnQuote} onClick={handleQuote}>
              Cotizada
            </button>
          </div>
        </div>

        <div className={styles.suppliersSection}>
          <h3 className={styles.sectionTitle}>Asignación de proveedores</h3>
          <div className={styles.suppliersList}>
            {suppliers.map((supplier, index) => (
              <div key={supplier.id} className={styles.supplierItem}>
                <span className={styles.supplierLabel}>Proveedor</span>
                <input
                  type="text"
                  value={supplier.name}
                  className={styles.supplierInput}
                  placeholder="Nombre del proveedor"
                  readOnly
                />
                <button
                  className={styles.btnRemoveSupplier}
                  onClick={() => removeSupplier(supplier.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button className={styles.btnAddSupplier} onClick={addSupplier}>
            <Plus size={16} />
            Agregar proveedor
          </button>
        </div>

        <div className={styles.generalSection}>
          <h3 className={styles.sectionTitle}>General</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>* Estatus</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className={styles.formSelect}
              >
                <option>En proceso</option>
                <option>Asignada</option>
                <option>Cotizada</option>
                <option>Nueva</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>* Red / Alianza</label>
              <select
                value={formData.network}
                onChange={(e) => setFormData({...formData, network: e.target.value})}
                className={styles.formSelect}
              >
                <option>WTC Alliance</option>
                <option>Otra red</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>* Complejidad</label>
              <select
                value={formData.complexity}
                onChange={(e) => setFormData({...formData, complexity: e.target.value})}
                className={styles.formSelect}
              >
                <option>Media</option>
                <option>Baja</option>
                <option>Alta</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>* Moneda</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className={styles.formSelect}
              >
                <option>USD</option>
                <option>MXN</option>
                <option>EUR</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>* Profit Unitario</label>
              <input
                type="text"
                value={formData.unitProfit}
                onChange={(e) => setFormData({...formData, unitProfit: e.target.value})}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>* Profit general</label>
              <input
                type="text"
                value={formData.generalProfit}
                onChange={(e) => setFormData({...formData, generalProfit: e.target.value})}
                className={styles.formInput}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Comentarios</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
              className={styles.formTextarea}
              rows={3}
            />
          </div>
        </div>

        <div className={styles.servicesSection}>
          <h3 className={styles.sectionTitle}>Servicios</h3>
          {services.map((service, index) => (
            <div key={service.id} className={styles.serviceCard}>
              <div className={styles.serviceHeader}>
                <div className={styles.serviceNumber}>{index + 1}</div>
                <div className={styles.serviceActions}>
                  <button
                    className={styles.btnServiceAction}
                    onClick={() => duplicateService(service.id)}
                    title="Duplicar"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    className={styles.btnServiceAction}
                    onClick={() => removeService(service.id)}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className={styles.btnServiceAction}>
                    <ChevronDown size={16} />
                  </button>
                  <button className={styles.btnServiceAction}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.serviceGrid}>
                <div className={styles.formGroup}>
                  <label>*Servicio</label>
                  <select
                    value={service.service}
                    onChange={(e) => updateService(service.id, 'service', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option>Marítimo LCL</option>
                    <option>Marítimo FCL</option>
                    <option>Aéreo</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>*Operación</label>
                  <select
                    value={service.operation}
                    onChange={(e) => updateService(service.id, 'operation', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option>Importación</option>
                    <option>Exportación</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>*Incoterm</label>
                  <select
                    value={service.incoterm}
                    onChange={(e) => updateService(service.id, 'incoterm', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option>EXW</option>
                    <option>FOB</option>
                    <option>CIF</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Salida esperada</label>
                  <input
                    type="date"
                    value={service.expectedDeparture}
                    onChange={(e) => updateService(service.id, 'expectedDeparture', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>*Origen</label>
                  <select
                    value={service.origin}
                    onChange={(e) => updateService(service.id, 'origin', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option>(XX)</option>
                    <option>(AF)</option>
                    <option>(US)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>*Destino</label>
                  <select
                    value={service.destination}
                    onChange={(e) => updateService(service.id, 'destination', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option>(AF)</option>
                    <option>(XX)</option>
                    <option>(US)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>*Código postal de destino</label>
                  <input
                    type="text"
                    value={service.destinationPostalCode}
                    onChange={(e) => updateService(service.id, 'destinationPostalCode', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>*Tipo de envío</label>
                  <select
                    value={service.shippingType}
                    onChange={(e) => updateService(service.id, 'shippingType', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option>Door to Door</option>
                    <option>Port to Port</option>
                    <option>Door to Port</option>
                  </select>
                </div>
              </div>

              <div className={styles.associatedServices}>
                <label>Servicios Asociados</label>
                <div className={styles.servicesChips}>
                  {['Seguro', 'Maniobra', 'Custodia', 'Inspección', 'Despacho aduanal'].map(serviceName => (
                    <button
                      key={serviceName}
                      className={`${styles.serviceChip} ${
                        service.associatedServices.includes(serviceName) ? styles.serviceChipActive : ''
                      }`}
                      onClick={() => toggleAssociatedService(service.id, serviceName)}
                    >
                      {serviceName}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Comentarios</label>
                <textarea
                  value={service.comments}
                  onChange={(e) => updateService(service.id, 'comments', e.target.value)}
                  className={styles.formTextarea}
                  rows={2}
                />
              </div>

              <div className={styles.frequencySection}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={service.scheduledFrequency}
                    onChange={(e) => updateService(service.id, 'scheduledFrequency', e.target.checked)}
                  />
                  Programar frecuencia
                </label>
                {service.scheduledFrequency && (
                  <div className={styles.frequencyGrid}>
                    <div className={styles.formGroup}>
                      <label>Frecuencia</label>
                      <select
                        value={service.frequency}
                        onChange={(e) => updateService(service.id, 'frequency', e.target.value)}
                        className={styles.formSelect}
                      >
                        <option>Semanal</option>
                        <option>Mensual</option>
                        <option>Diaria</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Cantidad</label>
                      <input
                        type="number"
                        value={service.quantity}
                        onChange={(e) => updateService(service.id, 'quantity', parseInt(e.target.value))}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Medida</label>
                      <select
                        value={service.measure}
                        onChange={(e) => updateService(service.id, 'measure', e.target.value)}
                        className={styles.formSelect}
                      >
                        <option>Kilos</option>
                        <option>Toneladas</option>
                        <option>Metros cúbicos</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.merchandiseSection}>
                <h4 className={styles.merchandiseTitle}>MERCANCÍA</h4>
                <div className={styles.merchandiseTable}>
                  <div className={styles.merchandiseHeader}>
                    <div>MERCANCÍA</div>
                    <div>PELIGROSA</div>
                    <div>CLASIFICACIÓN</div>
                    <div>ESTIBABLE</div>
                    <div>VOL. TOTAL</div>
                    <div>PESO TOTAL</div>
                    <div></div>
                  </div>
                  {service.merchandise.map((merch) => (
                    <div key={merch.id} className={styles.merchandiseRow}>
                      <input
                        type="text"
                        value={merch.name}
                        onChange={(e) => updateMerchandise(service.id, merch.id, 'name', e.target.value)}
                        className={styles.merchandiseInput}
                        placeholder="Nombre"
                      />
                      <select
                        value={merch.dangerous ? 'Sí' : 'No'}
                        onChange={(e) => updateMerchandise(service.id, merch.id, 'dangerous', e.target.value === 'Sí')}
                        className={styles.merchandiseSelect}
                      >
                        <option>No</option>
                        <option>Sí</option>
                      </select>
                      <input
                        type="text"
                        value={merch.classification}
                        onChange={(e) => updateMerchandise(service.id, merch.id, 'classification', e.target.value)}
                        className={styles.merchandiseInput}
                      />
                      <select
                        value={merch.stackable ? 'Sí' : 'No'}
                        onChange={(e) => updateMerchandise(service.id, merch.id, 'stackable', e.target.value === 'Sí')}
                        className={styles.merchandiseSelect}
                      >
                        <option>Sí</option>
                        <option>No</option>
                      </select>
                      <input
                        type="number"
                        value={merch.totalVolume}
                        onChange={(e) => updateMerchandise(service.id, merch.id, 'totalVolume', parseFloat(e.target.value))}
                        className={styles.merchandiseInput}
                      />
                      <input
                        type="number"
                        value={merch.totalWeight}
                        onChange={(e) => updateMerchandise(service.id, merch.id, 'totalWeight', parseFloat(e.target.value))}
                        className={styles.merchandiseInput}
                      />
                      <div className={styles.merchandiseActions}>
                        <button
                          className={styles.btnMerchandiseAction}
                          onClick={() => removeMerchandise(service.id, merch.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className={styles.btnAddMerchandise}
                  onClick={() => addMerchandise(service.id)}
                >
                  <Plus size={16} />
                  Agregar mercancía
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className={styles.btnAddService} onClick={addService}>
          <Plus size={18} />
          Agregar Servicio
        </button>
      </div>
    </div>
  );
}
