import React, { useState } from 'react';
import { Trash2, ChevronDown, Plus, Copy, X, MapPin, Search, RotateCcw, Save, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Quotations.module.css';

interface Container {
  id: number;
  type: string;
  quantity: number;
}

interface MerchandisePackage {
  id: number;
  type: string;
  quantity: number;
  length: number;
  width: number;
  height: number;
  weight: number;
}

interface Merchandise {
  id: number;
  name: string;
  dangerous: boolean;
  imoClass: string;
  un: string;
  classification: string;
  temperature: number;
  tempUnit: string;
  description: string;
  stackable: boolean;
  unitType: 'lbs' | 'kg';
  totalVolume: number;
  totalWeight: number;
  packages: MerchandisePackage[];
}

interface Executive {
  id: number;
  name: string;
}

interface Service {
  id: number;
  service: string;
  operation: string;
  incoterm: string;
  origin: string;
  destination: string;
  destinationZip: string;
  expectedDeparture: string;
  custody: boolean;
  insurance: boolean;
  inspection: boolean;
  customsClearance: boolean;
  comments: string;
  quantity: string;
  unit: string;
  frequency: string;
  containers: Container[];
  merchandise: Merchandise[];
}

export function Quotations() {
  const { t } = useLanguage();
  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      service: 'Marítimo LCL',
      operation: 'Exportación',
      incoterm: 'DDP',
      origin: 'Veracruz (MXVER)',
      destination: 'BARCELONA(ESP)',
      destinationZip: '08003',
      expectedDeparture: '',
      custody: true,
      insurance: false,
      inspection: true,
      customsClearance: false,
      comments: '',
      quantity: '19',
      unit: 'Toneladas',
      frequency: 'Semanal',
      containers: [
        { id: 1, type: "Contenedor de 40' Standard", quantity: 10 },
        { id: 2, type: "40' High Cube Pallet Wide", quantity: 10 }
      ],
      merchandise: [
        {
          id: 1,
          name: 'Tenis de futbol',
          dangerous: false,
          imoClass: '',
          un: '',
          classification: 'General',
          temperature: 80,
          tempUnit: '°C',
          description: '',
          stackable: false,
          unitType: 'kg',
          totalVolume: 80,
          totalWeight: 100,
          packages: []
        },
        {
          id: 2,
          name: 'Mochilas Deportivas',
          dangerous: false,
          imoClass: '',
          un: '',
          classification: 'Refrigerada',
          temperature: 80,
          tempUnit: '°C',
          description: '',
          stackable: false,
          unitType: 'kg',
          totalVolume: 40,
          totalWeight: 140,
          packages: []
        }
      ],
    },
  ]);

  const [executives, setExecutives] = useState<Executive[]>([
    { id: 1, name: 'Fabiola Abigail Sanchez Paisfor' },
    { id: 2, name: 'Denisse Alvarez Guerra' }
  ]);

  const [showMerchandiseModal, setShowMerchandiseModal] = useState(false);
  const [editingMerchandise, setEditingMerchandise] = useState<Merchandise | null>(null);
  const [currentServiceId, setCurrentServiceId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    client: 'Nike Mexico SA DE CV',
    isProspect: false,
    isPriority: true,
    isQuote: false,
    requestType: 'Corresponsal',
    applicant: 'J Forwarders Inc Revolution',
    created: '01/01/2022',
    responseDeadline: '',
  });

  const addService = () => {
    const newService: Service = {
      id: services.length + 1,
      service: '',
      operation: '',
      incoterm: '',
      origin: '',
      destination: '',
      destinationZip: '',
      expectedDeparture: '',
      custody: false,
      insurance: false,
      inspection: false,
      customsClearance: false,
      comments: '',
      quantity: '',
      unit: '',
      frequency: '',
      containers: [],
      merchandise: [],
    };
    setServices([...services, newService]);
  };

  const removeService = (id: number) => {
    setServices(services.filter(s => s.id !== id));
  };

  const removeContainer = (serviceId: number, containerId: number) => {
    setServices(services.map(s =>
      s.id === serviceId
        ? { ...s, containers: s.containers.filter(c => c.id !== containerId) }
        : s
    ));
  };

  const removeMerchandise = (serviceId: number, merchandiseId: number) => {
    setServices(services.map(s =>
      s.id === serviceId
        ? { ...s, merchandise: s.merchandise.filter(m => m.id !== merchandiseId) }
        : s
    ));
  };

  const removeExecutive = (id: number) => {
    setExecutives(executives.filter(e => e.id !== id));
  };

  const openMerchandiseModal = (serviceId: number, merchandise?: Merchandise) => {
    setCurrentServiceId(serviceId);
    setEditingMerchandise(merchandise || null);
    setShowMerchandiseModal(true);
  };

  const closeMerchandiseModal = () => {
    setShowMerchandiseModal(false);
    setEditingMerchandise(null);
    setCurrentServiceId(null);
  };

  const duplicateService = (id: number) => {
    const serviceToDuplicate = services.find(s => s.id === id);
    if (serviceToDuplicate) {
      const newService = { ...serviceToDuplicate, id: Date.now() };
      setServices([...services, newService]);
    }
  };

  const updateService = (id: number, field: keyof Service, value: any) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('quote.title')}</h1>
        <div className={styles.actionBar}>
          <button className={styles.actionBarSaveButton}>
            <Save size={18} />
            <span>{t('quote.save')}</span>
          </button>
          <button className={styles.actionBarResetButton}>
            <RotateCcw size={18} />
          </button>
          <button className={styles.actionBarDeleteButton}>
            <Trash2 size={18} />
          </button>
          <button className={styles.actionBarDropdownButton}>
            <span>{t('quote.actions')}</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quote.generalData')}</h2>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('quote.client')}
            </label>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className={`${styles.input} ${styles.inputWithIconField}`}
              />
              <button className={styles.clearButton}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>&nbsp;</label>
            <div className={styles.toggleGroup}>
              <div className={styles.toggleItem}>
                <input
                  type="checkbox"
                  checked={formData.isProspect}
                  onChange={(e) => setFormData({ ...formData, isProspect: e.target.checked })}
                  className={styles.checkbox}
                />
                <span className={styles.label}>{t('quote.isProspect')}</span>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>&nbsp;</label>
            <div className={styles.toggleGroup}>
              <div className={styles.toggleItem}>
                <label className={styles.label}>{t('quote.isPriority')}</label>
                <div
                  className={`${styles.toggle} ${formData.isPriority ? styles.active : ''}`}
                  onClick={() => setFormData({ ...formData, isPriority: !formData.isPriority })}
                >
                  <div className={styles.toggleThumb}></div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>&nbsp;</label>
            <div className={styles.toggleGroup}>
              <div className={styles.toggleItem}>
                <label className={styles.label}>{t('quote.isQuote')}</label>
                <div
                  className={`${styles.toggle} ${formData.isQuote ? styles.active : ''}`}
                  onClick={() => setFormData({ ...formData, isQuote: !formData.isQuote })}
                >
                  <div className={styles.toggleThumb}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formGrid} style={{ marginTop: '1.25rem' }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('quote.requestType')}
            </label>
            <select value={formData.requestType} onChange={(e) => setFormData({ ...formData, requestType: e.target.value })} className={styles.select}>
              <option>Corresponsal</option>
              <option>Directo</option>
              <option>Agente</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('quote.applicant')}
            </label>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                value={formData.applicant}
                onChange={(e) => setFormData({ ...formData, applicant: e.target.value })}
                className={`${styles.input} ${styles.inputWithIconField}`}
              />
              <button className={styles.clearButton}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('quote.created')}
            </label>
            <input
              type="text"
              value={formData.created}
              onChange={(e) => setFormData({ ...formData, created: e.target.value })}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('quote.responseDeadline')}</label>
            <input
              type="date"
              value={formData.responseDeadline}
              onChange={(e) => setFormData({ ...formData, responseDeadline: e.target.value })}
              className={styles.input}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quote.services')}</h2>

        {services.map((service, index) => (
          <div key={service.id} className={styles.serviceCard}>
            <div className={styles.serviceHeader}>
              <div className={styles.serviceNumber}>{index + 1}</div>
              <div className={styles.serviceActions}>
                <button className={`${styles.iconButton} ${styles.primary}`}>
                  <Plus size={18} />
                </button>
                <button className={styles.iconButton} onClick={() => duplicateService(service.id)}>
                  <Copy size={18} />
                </button>
                <button className={styles.iconButton}>
                  <Trash2 size={18} />
                </button>
                <button className={styles.iconButton}>
                  <ChevronDown size={18} />
                </button>
                {services.length > 1 && (
                  <button
                    className={`${styles.iconButton} ${styles.danger}`}
                    onClick={() => removeService(service.id)}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.service')}
                </label>
                <select
                  value={service.service}
                  onChange={(e) => updateService(service.id, 'service', e.target.value)}
                  className={styles.select}
                >
                  <option value="">Seleccionar...</option>
                  <option>Marítimo LCL</option>
                  <option>Marítimo FCL</option>
                  <option>Aéreo</option>
                  <option>Terrestre</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.operation')}
                </label>
                <select
                  value={service.operation}
                  onChange={(e) => updateService(service.id, 'operation', e.target.value)}
                  className={styles.select}
                >
                  <option value="">Seleccionar...</option>
                  <option>Exportación</option>
                  <option>Importación</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.incoterm')}
                </label>
                <select
                  value={service.incoterm}
                  onChange={(e) => updateService(service.id, 'incoterm', e.target.value)}
                  className={styles.select}
                >
                  <option value="">Seleccionar...</option>
                  <option>DDP</option>
                  <option>FOB</option>
                  <option>CIF</option>
                  <option>EXW</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('quote.expectedDeparture')}</label>
                <input
                  type="date"
                  value={service.expectedDeparture}
                  onChange={(e) => updateService(service.id, 'expectedDeparture', e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGrid} style={{ marginTop: '1.25rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.origin')}
                </label>
                <div className={styles.inputWithIcon}>
                  <MapPin className={styles.inputIcon} size={16} />
                  <input
                    type="text"
                    value={service.origin}
                    onChange={(e) => updateService(service.id, 'origin', e.target.value)}
                    className={`${styles.input} ${styles.inputWithIconField}`}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.destination')}
                </label>
                <div className={styles.inputWithIcon}>
                  <MapPin className={styles.inputIcon} size={16} />
                  <input
                    type="text"
                    value={service.destination}
                    onChange={(e) => updateService(service.id, 'destination', e.target.value)}
                    className={`${styles.input} ${styles.inputWithIconField}`}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.destinationZip')}
                </label>
                <input
                  type="text"
                  value={service.destinationZip}
                  onChange={(e) => updateService(service.id, 'destinationZip', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('quote.shippingType')}: {t('quote.portToPort')}</label>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label className={styles.label}>{t('quote.associatedServices')}</label>
              <div className={styles.associatedServices}>
                <div
                  className={`${styles.serviceChip} ${service.custody ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'custody', !service.custody)}
                >
                  <span>{t('quote.custody')}</span>
                </div>
                <div
                  className={`${styles.serviceChip} ${service.insurance ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'insurance', !service.insurance)}
                >
                  <span>{t('quote.insurance')}</span>
                </div>
                <div
                  className={`${styles.serviceChip} ${service.inspection ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'inspection', !service.inspection)}
                >
                  <span>{t('quote.inspection')}</span>
                </div>
                <div
                  className={`${styles.serviceChip} ${service.customsClearance ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'customsClearance', !service.customsClearance)}
                >
                  <span>{t('quote.customsClearance')}</span>
                </div>
              </div>
            </div>

            <div className={styles.formGrid} style={{ marginTop: '1.25rem' }}>
              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.label}>{t('quote.comments')}</label>
                <textarea
                  value={service.comments}
                  onChange={(e) => updateService(service.id, 'comments', e.target.value)}
                  className={styles.textarea}
                  placeholder=""
                />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label className={styles.label}>{t('quote.frequency')}</label>
              <div className={styles.frequencyGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('quote.quantity')}</label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="text"
                      value={service.quantity}
                      onChange={(e) => updateService(service.id, 'quantity', e.target.value)}
                      className={`${styles.input} ${styles.inputWithIconField}`}
                    />
                    <button className={styles.clearButton}>
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('quote.unit')}</label>
                  <select
                    value={service.unit}
                    onChange={(e) => updateService(service.id, 'unit', e.target.value)}
                    className={styles.select}
                  >
                    <option>Toneladas</option>
                    <option>Kilogramos</option>
                    <option>Metros cúbicos</option>
                    <option>Contenedores</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('quote.frequencyPeriod')}</label>
                  <select
                    value={service.frequency}
                    onChange={(e) => updateService(service.id, 'frequency', e.target.value)}
                    className={styles.select}
                  >
                    <option>Semanal</option>
                    <option>Mensual</option>
                    <option>Trimestral</option>
                    <option>Anual</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.containersSection}>
              <h3 className={styles.subsectionTitle}>CONTENEDORES</h3>
              <div className={styles.searchBarSmall}>
                <Search className={styles.searchIcon} size={16} />
                <input
                  type="text"
                  placeholder="Buscar"
                  className={styles.searchInputSmall}
                />
              </div>
              <div className={styles.containersTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Contenedores</th>
                      <th>Cantidad</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.containers.map((container) => (
                      <tr key={container.id}>
                        <td>{container.type}</td>
                        <td>{container.quantity}</td>
                        <td>
                          <button
                            className={styles.removeRowButton}
                            onClick={() => removeContainer(service.id, container.id)}
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.merchandiseSection}>
              <h3 className={styles.subsectionTitle}>MERCANCIA</h3>
              <div className={styles.merchandiseToolbar}>
                <button
                  className={styles.toolbarButton}
                  onClick={() => openMerchandiseModal(service.id)}
                >
                  <Plus size={18} />
                </button>
                <button className={styles.toolbarButton}>
                  <Copy size={18} />
                </button>
                <button className={styles.toolbarButton}>
                  <Trash2 size={18} />
                </button>
                <div className={styles.searchBarSmall} style={{ marginLeft: 'auto' }}>
                  <Search className={styles.searchIcon} size={16} />
                  <input
                    type="text"
                    placeholder="Buscar"
                    className={styles.searchInputSmall}
                  />
                </div>
              </div>
              <div className={styles.merchandiseTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Mercancía</th>
                      <th>Peligrosa</th>
                      <th>Clasificación</th>
                      <th>Estibable</th>
                      <th>Vol. Total</th>
                      <th>Peso Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.merchandise.map((merch) => (
                      <tr key={merch.id}>
                        <td>{merch.name}</td>
                        <td>{merch.dangerous ? 'Sí' : 'No'}</td>
                        <td>{merch.classification}</td>
                        <td>{merch.stackable ? 'Sí' : 'No'}</td>
                        <td>{merch.totalVolume} KG</td>
                        <td>{merch.totalWeight} KG</td>
                        <td>
                          <div className={styles.tableActions}>
                            <button
                              className={styles.viewButton}
                              onClick={() => openMerchandiseModal(service.id, merch)}
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}

        <button className={styles.addServiceButton} onClick={addService}>
          <Plus size={20} />
          <span>Agregar Servicio</span>
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Asignación de Ejecutivos</h2>
        <div className={styles.executivesCard}>
          <div className={styles.searchBarSmall} style={{ marginBottom: '1rem' }}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="text"
              placeholder="Buscar"
              className={styles.searchInputSmall}
            />
          </div>
          <div className={styles.executivesList}>
            {executives.map((executive) => (
              <div key={executive.id} className={styles.executiveItem}>
                <span className={styles.executiveName}>Ejecutivo</span>
                <span className={styles.executiveNameValue}>{executive.name}</span>
                <button
                  className={styles.removeExecutiveButton}
                  onClick={() => removeExecutive(executive.id)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showMerchandiseModal && (
        <div className={styles.modalOverlay} onClick={closeMerchandiseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Mercancía</h2>
              <button className={styles.closeButton} onClick={closeMerchandiseModal}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>Mercancía
                  </label>
                  <input
                    type="text"
                    placeholder="Baterías de Telefonos Modelo 388"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Es peligrosa</label>
                  <div className={styles.toggle} style={{ marginTop: '0.5rem' }}>
                    <div className={`${styles.toggleSwitch} ${styles.active}`}>
                      <div className={styles.toggleThumb}></div>
                    </div>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>Clase /IMO CODE
                  </label>
                  <select className={styles.select}>
                    <option>1.1 Materia y explosivos</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>UN
                  </label>
                  <input type="text" placeholder="80" className={styles.input} />
                </div>
              </div>

              <div className={styles.formGrid} style={{ marginTop: '1rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>Clasificación de la mercancía
                  </label>
                  <select className={styles.select}>
                    <option>Refrigerada</option>
                    <option>General</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>Temperatura
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" placeholder="80" className={styles.input} style={{ flex: 1 }} />
                    <select className={styles.select} style={{ width: '80px' }}>
                      <option>°C</option>
                      <option>°F</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                <label className={styles.label}>Descripción de mercancía</label>
                <textarea className={styles.textarea} rows={3}></textarea>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                <label className={styles.label}>Es estibable</label>
                <div className={styles.toggle} style={{ marginTop: '0.5rem' }}>
                  <div className={styles.toggleSwitch}>
                    <div className={styles.toggleThumb}></div>
                  </div>
                  <span style={{ marginLeft: '0.5rem' }}>No</span>
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>CARGA
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span>Lbs/Pulgadas</span>
                  <div className={styles.toggle}>
                    <div className={styles.toggleSwitch}>
                      <div className={styles.toggleThumb}></div>
                    </div>
                  </div>
                  <span>Kgm/Cm</span>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Volumen total</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>90 KG</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Peso total</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>90 KG</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button className={styles.addPackageButton}>
                  <Plus size={18} />
                </button>
                <div className={styles.packagesTable} style={{ marginTop: '1rem' }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Embalaje</th>
                        <th>Cantidad</th>
                        <th>Largo</th>
                        <th>Alto</th>
                        <th>Ancho</th>
                        <th>Peso</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Caja</td>
                        <td>50</td>
                        <td>40</td>
                        <td>50</td>
                        <td>30</td>
                        <td>30</td>
                        <td>
                          <button className={styles.removeRowButton}>
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>Bulto</td>
                        <td>50</td>
                        <td>50</td>
                        <td>5</td>
                        <td>60</td>
                        <td>40</td>
                        <td>
                          <button className={styles.removeRowButton}>
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveModalButton} onClick={closeMerchandiseModal}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
