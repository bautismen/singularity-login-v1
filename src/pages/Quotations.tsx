import React, { useState } from 'react';
import { Trash2, ChevronDown, Plus, Copy, X, MapPin, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Quotations.module.css';

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
    },
  ]);

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
    };
    setServices([...services, newService]);
  };

  const removeService = (id: number) => {
    setServices(services.filter(s => s.id !== id));
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
        <div className={styles.headerActions}>
          <button className={styles.saveButton}>{t('quote.save')}</button>
          <button className={styles.sendButton}>{t('quote.send')}</button>
          <button className={styles.deleteButton}>
            <Trash2 size={18} />
          </button>
          <button className={styles.moreButton}>
            <ChevronDown size={18} />
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

            <div className={styles.merchandiseSection}>
              <div className={styles.merchandiseHeader}>
                <h3 className={styles.merchandiseTitle}>{t('quote.merchandise')}</h3>
                <div className={styles.serviceActions}>
                  <button className={styles.iconButton}>
                    <Plus size={18} />
                  </button>
                  <button className={styles.iconButton}>
                    <Copy size={18} />
                  </button>
                  <button className={styles.iconButton}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className={styles.searchBar}>
                <div className={styles.inputWithIcon} style={{ flex: 1 }}>
                  <Search className={styles.inputIcon} size={16} />
                  <input
                    type="text"
                    placeholder={t('quote.search')}
                    className={`${styles.input} ${styles.inputWithIconField}`}
                  />
                </div>
                <button className={styles.iconButton}>
                  <Search size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button className={styles.addServiceButton} onClick={addService}>
          <Plus size={20} />
          <span>Agregar Servicio</span>
        </button>
      </div>
    </div>
  );
}
