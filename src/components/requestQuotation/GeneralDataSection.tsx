import React from 'react';
import { QuotationRequestFormData } from '../../hooks/useRequestQuotationForm';
import styles from '../../pages/Quotations.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeneralDataSectionProps {
  formData:        QuotationRequestFormData;
  mode:            'create' | 'edit' | 'view';
  loading:         boolean;
  customers:       any[];
  requestTypes:    any[];
  onChangeFormData:(changes: Partial<QuotationRequestFormData>) => void;
  calculateResponseDeadline: (fromDate: string) => Date;
  t:               (key: string) => string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const GeneralDataSection: React.FC<GeneralDataSectionProps> = ({
  formData,
  mode,
  loading,
  customers,
  requestTypes,
  onChangeFormData,
  calculateResponseDeadline,
  t,
}) => {

  const isDisabled = mode === 'view' || formData.idStatusRequest >= 2;

  // ── Deadline ─────────────────────────────────────────────────────────────────

  const renderResponseDeadline = () => {
    if (formData.isLicitation) {
      return (
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.required}>*</span>
            {t('quote.responseDeadline')}
          </label>
          <input
            type="date"
            required
            className={styles.input}
            placeholder="dd/mm/aaaa"
            onKeyDown={(e) => e.preventDefault()}
            min={mode === 'create' ? new Date().toISOString().split('T')[0] : undefined}
            value={formData.responseDeadline}
            disabled={isDisabled}
            onChange={(e) => onChangeFormData({ responseDeadline: e.target.value })}
          />
        </div>
      );
    }

    if (!formData.isLicitation && mode !== 'create') {
      return (
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('quote.responseDeadline')}</label>
          <input
            className={styles.input}
            value={formData.responseDeadline}
            disabled
          />
        </div>
      );
    }

    return <div />;
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{t('quote.generalData')}</h2>

      {/* Comentario de cancelación */}
      {formData.statuscomments && (
        <div>
          <label className={styles.label}>Comentarios por cancelación</label>
          <label className={styles.labelInfoRed}>{formData.statuscomments}</label>
        </div>
      )}

      {/* ── Fila 1: Referencia / Tipo solicitud / Fecha ── */}
      <div className={styles.formGrid} style={{ marginTop: '1.5rem' }}>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.required}>*</span>
            {t('quote.reference')}
          </label>
          <input
            type="text"
            value={formData.referenceRequest}
            className={styles.input}
            disabled
            onChange={(e) => onChangeFormData({ referenceRequest: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.required}>*</span>
            {t('quote.requestType')}
          </label>
          <select
            value={formData.requestTypeId}
            className={styles.select}
            disabled={loading || isDisabled}
            required
            onChange={(e) => {
              const requestType = requestTypes.find(r => r._Id === parseInt(e.target.value));
              onChangeFormData({
                requestTypeId: parseInt(e.target.value),
                requestType:   requestType?.request_type_name || '',
              });
            }}
          >
            <option value="">{t('quote.selectType')}</option>
            {requestTypes.map((type) => (
              <option key={type._Id} value={type._Id}>
                {type.request_type_name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.required}>*</span>
            {t('quote.requestDate')}
          </label>
          <input
            type="date"
            className={styles.input}
            onKeyDown={(e) => e.preventDefault()}
            max={mode === 'create' ? new Date().toISOString().split('T')[0] : undefined}
            value={formData.created}
            disabled={isDisabled}
            onChange={(e) => onChangeFormData({ created: e.target.value })}
          />
        </div>

      </div>

      {/* ── Fila 2: Toggles + Cliente ── */}
      <div className={styles.formGrid} style={{ marginTop: '1.5rem' }}>

        {/* Toggles: Licitación / Prioridad / Prospecto */}
        <div className={styles.formGroupElementsInline}>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('quote.isBid')}</label>
            <button
              type="button"
              className={`${styles.toggleSwitch} ${formData.isLicitation ? styles.active : ''}`}
              disabled={isDisabled}
              onClick={() => onChangeFormData({ isLicitation: !formData.isLicitation })}
            >
              <div className={styles.toggleThumb} />
            </button>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('quote.isPriority')}</label>
            <button
              type="button"
              className={`${styles.toggleSwitch} ${formData.isPriority ? styles.active : ''}`}
              disabled={isDisabled}
              onClick={() => onChangeFormData({ isPriority: !formData.isPriority })}
            >
              <div className={styles.toggleThumb} />
            </button>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('quote.prospect')}</label>
            <button
              type="button"
              className={`${styles.toggleSwitch} ${formData.showProspect ? styles.active : ''}`}
              disabled={loading || mode === 'view' || mode === 'edit' || formData.idStatusRequest >= 2}
              onClick={() => onChangeFormData({ showProspect: !formData.showProspect })}
            >
              <div className={styles.toggleThumb} />
            </button>
          </div>

        </div>

        {/* Cliente o Prospecto */}
        {!formData.showProspect ? (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('quote.client')}
            </label>
            <input
              list='customers-list'
              value={formData.client ||''}
              className={styles.clientSelect}
              disabled={loading || mode === 'view' || mode === 'edit' || formData.idStatusRequest >= 2}
              required
              placeholder={t('quote.selectClient')}
              onChange={(e) => {
                const selectedText = e.target.value;
                const customer = customers.find((c) => {
                  const label = c.branchName
                    ? `${c.branchName}, ${c.fiscalData?.businessName}`
                    : c.fiscalData?.businessName;
                  return label === selectedText;
                });
                onChangeFormData({
                  customerId: customer?.id || '',
                  client: selectedText,                 
                  customerCategory: customer?.clientLevelId,
                });
              }} />
            <datalist id='customers-list'>
              {customers.map((customer) => {
                const label = customer.branchName
                  ? `${customer.branchName}, ${customer.fiscalData?.businessName}`
                  : customer.fiscalData?.businessName;
                return (
                  <option key={customer.id} value={label} />
                );
              })}
            </datalist>
            {/*<select
              value={formData.customerId}
              className={styles.clientSelect}
              disabled={loading || mode === 'view' || mode === 'edit' || formData.idStatusRequest >= 2}
              required
              onChange={(e) => {
                const customer = customers.find(c => c.id === e.target.value);
                onChangeFormData({
                  customerId:       e.target.value,
                  client:           customer?.fiscalData?.businessName || '',
                  customerCategory: customer?.clientLevelId,
                });
              }}
            >
              <option value="">{t('quote.selectClient')}</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.branchName
                    ? `${customer.branchName}, ${customer.fiscalData?.businessName}`
                    : customer.fiscalData?.businessName}
                </option>
              ))}
            </select>*/}
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.required}>*</span>
              {t('quote.prospect')}
            </label>
            <input
              type="text"
              maxLength={50}
              minLength={3}
              required
              className={styles.input}
              value={formData.prospect}
              disabled={isDisabled}
              onChange={(e) => onChangeFormData({ prospect: e.target.value })}
            />
          </div>
        )}

        {/* Categoría de cliente */}
        {!formData.showProspect ? (
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('quote.customerCategory')}</label>
            <select
              value={formData.customerCategory}
              className={styles.select}
              disabled
              onChange={(e) => onChangeFormData({ customerCategory: parseInt(e.target.value) })}>
              <option value={1}>Golden</option>
              <option value={2}>Silver</option>
              <option value={3}>Bronze</option>
            </select>
          </div>
        ) : <div />}

      </div>

      {/* ── Fila 3: Deadline ── */}
      <div className={styles.formGrid} style={{ marginTop: '1.5rem' }}>
        {renderResponseDeadline()}
        <div /><div />
      </div>

    </div>
  );
};

export default GeneralDataSection;