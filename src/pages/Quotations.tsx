import React, { useState } from 'react';
import { Trash2, ChevronDown, Plus, Copy, X, MapPin, Search, RotateCcw, Save, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Quotations.module.css';

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
  description: string;
  dangerous: boolean;
  refrigerated: boolean;
  oversized: boolean;
  imoClass: string;
  un: string;
  temperature: number;
  tempUnit: string;
  grain: boolean;
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
  shippingType: string;
  programFrequency: boolean;
  frequency: string;
  quantity: string;
  unit: string;
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
      shippingType: 'Door to Door',
      programFrequency: true,
      frequency: 'Semanal',
      quantity: '19',
      unit: 'Toneladas',
      merchandise: [
        {
          id: 1,
          name: 'Tenis de futbol',
          description: '',
          dangerous: false,
          refrigerated: false,
          oversized: false,
          imoClass: '',
          un: '',
          temperature: 80,
          tempUnit: '°C',
          grain: false,
          stackable: false,
          unitType: 'kg',
          totalVolume: 80,
          totalWeight: 100,
          packages: []
        },
        {
          id: 2,
          name: 'Mochilas Deportivas',
          description: '',
          dangerous: false,
          refrigerated: true,
          oversized: false,
          imoClass: '',
          un: '',
          temperature: 80,
          tempUnit: '°C',
          grain: false,
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
    isPriority: true,
    isQuote: false,
    requestType: 'Corresponsal',
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
      shippingType: 'Door to Door',
      programFrequency: false,
      frequency: '',
      quantity: '',
      unit: '',
      merchandise: [],
    };
    setServices([...services, newService]);
  };

  const removeService = (id: number) => {
    setServices(services.filter(s => s.id !== id));
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

  const copyMerchandise = (serviceId: number, merchandiseId: number) => {
    const service = services.find(s => s.id === serviceId);
    const merchToCopy = service?.merchandise.find(m => m.id === merchandiseId);
    if (merchToCopy) {
      const newMerch = { ...merchToCopy, id: Date.now() };
      setServices(services.map(s =>
        s.id === serviceId
          ? { ...s, merchandise: [...s.merchandise, newMerch] }
          : s
      ));
    }
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
        <h2 className={styles.sectionTitle}>Datos Generales</h2>
        <div className={styles.generalDataGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>Cliente
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>Tipo de solicitud
            </label>
            <select
              value={formData.requestType}
              onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
              className={styles.select}
            >
              <option>Corresponsal</option>
              <option>Directo</option>
              <option>Agente</option>
            </select>
          </div>

          <div className={styles.formGroupWithToggle}>
            <label className={styles.label}>Es prioritaria</label>
            <div
              className={`${styles.toggleSwitch} ${formData.isPriority ? styles.active : ''}`}
              onClick={() => setFormData({ ...formData, isPriority: !formData.isPriority })}
            >
              <div className={styles.toggleThumb}></div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>Fecha solicitud
            </label>
            <input
              type="text"
              value={formData.created}
              onChange={(e) => setFormData({ ...formData, created: e.target.value })}
              className={styles.input}
              placeholder="01/01/2022"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Límite de respuesta</label>
            <input
              type="date"
              value={formData.responseDeadline}
              onChange={(e) => setFormData({ ...formData, responseDeadline: e.target.value })}
              className={styles.input}
              placeholder="dd/mm/aaaa"
            />
          </div>

          <div className={styles.formGroupWithToggle}>
            <label className={styles.label}>Es licitación</label>
            <div
              className={`${styles.toggleSwitch} ${formData.isQuote ? styles.active : ''}`}
              onClick={() => setFormData({ ...formData, isQuote: !formData.isQuote })}
            >
              <div className={styles.toggleThumb}></div>
            </div>
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
                <label className={styles.label}>
                  <span className={styles.required}>*</span>Tipo de envío
                </label>
                <select
                  value={service.shippingType}
                  onChange={(e) => updateService(service.id, 'shippingType', e.target.value)}
                  className={styles.select}
                >
                  <option>Door to Door</option>
                  <option>Port to Port</option>
                  <option>Door to Port</option>
                  <option>Port to Door</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label className={styles.label}>Salida esperada</label>
              <input
                type="date"
                value={service.expectedDeparture}
                onChange={(e) => updateService(service.id, 'expectedDeparture', e.target.value)}
                className={styles.input}
              />
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label className={styles.label}>Servicios Asociados</label>
              <div className={styles.associatedServices}>
                <div
                  className={`${styles.serviceChip} ${service.custody ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'custody', !service.custody)}
                >
                  <span>Custodia</span>
                </div>
                <div
                  className={`${styles.serviceChip} ${service.insurance ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'insurance', !service.insurance)}
                >
                  <span>Seguro</span>
                </div>
                <div
                  className={`${styles.serviceChip} ${service.inspection ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'inspection', !service.inspection)}
                >
                  <span>Inspección</span>
                </div>
                <div
                  className={`${styles.serviceChip} ${service.customsClearance ? styles.selected : ''}`}
                  onClick={() => updateService(service.id, 'customsClearance', !service.customsClearance)}
                >
                  <span>Despacho aduanal</span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
              <label className={styles.label}>Comentarios</label>
              <textarea
                value={service.comments}
                onChange={(e) => updateService(service.id, 'comments', e.target.value)}
                className={styles.textarea}
                rows={3}
                placeholder=""
              />
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <div className={styles.frequencyHeader}>
                <input
                  type="checkbox"
                  id={`freq-${service.id}`}
                  checked={service.programFrequency}
                  onChange={(e) => updateService(service.id, 'programFrequency', e.target.checked)}
                  className={styles.checkbox}
                />
                <label htmlFor={`freq-${service.id}`} className={styles.checkboxLabel}>
                  Programar frecuencia
                </label>
              </div>
              <div className={styles.frequencyGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Frecuencia</label>
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
                <div className={styles.formGroup}>
                  <label className={styles.label}>Cantidad</label>
                  <input
                    type="text"
                    value={service.quantity}
                    onChange={(e) => updateService(service.id, 'quantity', e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Medida</label>
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
              </div>
            </div>

            <div className={styles.merchandiseSection}>
              <h3 className={styles.subsectionTitle}>MERCANCÍA</h3>
              <div className={styles.merchandiseTable}>
                <table className={styles.simpleTable}>
                  <thead>
                    <tr>
                      <th>MERCANCÍA</th>
                      <th>PELIGROSA</th>
                      <th>CLASIFICACIÓN</th>
                      <th>ESTIBABLE</th>
                      <th>VOL. TOTAL</th>
                      <th>PESO TOTAL</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.merchandise.map((merch) => (
                      <tr key={merch.id}>
                        <td>{merch.name}</td>
                        <td>{merch.dangerous ? 'No' : 'No'}</td>
                        <td>{merch.refrigerated ? 'Refrigerada' : 'General'}</td>
                        <td>{merch.stackable ? 'Sí' : 'No'}</td>
                        <td>{merch.totalVolume} KG</td>
                        <td>{merch.totalWeight} KG</td>
                        <td>
                          <div className={styles.tableActions}>
                            <button
                              className={styles.iconButtonSmall}
                              onClick={() => copyMerchandise(service.id, merch.id)}
                              title="Copiar"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              className={styles.iconButtonSmall}
                              onClick={() => removeMerchandise(service.id, merch.id)}
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              className={styles.viewButtonGreen}
                              onClick={() => openMerchandiseModal(service.id, merch)}
                              title="Ver"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                className={styles.addItemButton}
                onClick={() => openMerchandiseModal(service.id)}
              >
                <Plus size={16} />
                Agregar mercancía
              </button>
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
          <div className={styles.executivesList}>
            {executives.map((executive) => (
              <div key={executive.id} className={styles.executiveItemSimple}>
                <span className={styles.executiveLabel}>Ejecutivo</span>
                <span className={styles.executiveNameSimple}>{executive.name}</span>
                <button
                  className={styles.removeIconButton}
                  onClick={() => removeExecutive(executive.id)}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button className={styles.addExecutiveButton}>
            <Plus size={16} />
            Agregar ejecutivo
          </button>
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
              <div className={styles.modalRow}>
                <div className={styles.modalFieldLarge}>
                  <label className={styles.label}>
                    <span className={styles.required}>*</span>Mercancía
                  </label>
                  <input
                    type="text"
                    placeholder="Baterías de Telefonos Modelo 388"
                    className={styles.input}
                  />
                </div>
                <div className={styles.modalFieldSmall}>
                  <label className={styles.label}>Es estibable</label>
                  <div className={styles.toggleContainer}>
                    <div className={styles.toggleSwitch}>
                      <div className={styles.toggleThumb}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Descripción de mercancía</label>
                <textarea className={styles.textarea} rows={3}></textarea>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>Clasificación de la mercancía
                </label>
                <div className={styles.classificationGrid}>
                  <div className={styles.classificationColumn}>
                    <div className={styles.classificationCheckbox}>
                      <input type="checkbox" id="peligrosa" className={styles.checkbox} />
                      <label htmlFor="peligrosa" className={styles.classificationLabel}>
                        Peligrosa
                      </label>
                    </div>
                    <div className={styles.classificationCheckbox}>
                      <input type="checkbox" id="refrigerada" className={styles.checkbox} checked readOnly />
                      <label htmlFor="refrigerada" className={styles.classificationLabel}>
                        Refrigerada
                      </label>
                    </div>
                    <div className={styles.classificationCheckbox}>
                      <input type="checkbox" id="sobredimensionada" className={styles.checkbox} checked readOnly />
                      <label htmlFor="sobredimensionada" className={styles.classificationLabel}>
                        Sobredimensionada
                      </label>
                    </div>
                  </div>
                  <div className={styles.classificationColumn}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>IMO</label>
                      <select className={styles.select}>
                        <option>1.1 Materia y explosivos</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Temperatura</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" placeholder="80" className={styles.input} style={{ flex: 1 }} />
                        <select className={styles.select} style={{ width: '80px' }}>
                          <option>°C</option>
                          <option>°F</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.classificationCheckbox}>
                      <input type="checkbox" id="granel" className={styles.checkbox} checked readOnly />
                      <label htmlFor="granel" className={styles.classificationLabel}>
                        Granel
                      </label>
                    </div>
                  </div>
                  <div className={styles.classificationColumn}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>UN</label>
                      <input type="text" placeholder="19" className={styles.input} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button className={styles.addPackageButtonIcon}>
                  <Plus size={18} />
                  Agregar embalaje
                </button>
                <div className={styles.packagesTable} style={{ marginTop: '1rem' }}>
                  <table className={styles.simpleTable}>
                    <thead>
                      <tr>
                        <th>EMBALAJE</th>
                        <th>CANTIDAD</th>
                        <th>LARGO</th>
                        <th>ALTO</th>
                        <th>ANCHO</th>
                        <th>PESO</th>
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
                            <X size={14} />
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
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.modalFooterInfo}>
                <div className={styles.unitTypeToggle}>
                  <span>Lbs/Pulgadas</span>
                  <div className={styles.toggleSwitch}>
                    <div className={styles.toggleThumb}></div>
                  </div>
                  <span>Kgm/Cm</span>
                </div>
                <div className={styles.totalsDisplay}>
                  <div>
                    <div className={styles.totalLabel}>Volumen total</div>
                    <div className={styles.totalValue}>90 KG</div>
                  </div>
                  <div>
                    <div className={styles.totalLabel}>Peso total</div>
                    <div className={styles.totalValue}>90 KG</div>
                  </div>
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
