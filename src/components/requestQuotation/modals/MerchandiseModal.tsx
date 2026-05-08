import React from 'react';
import { X, Plus } from 'lucide-react';
import { Cargo } from '../../../types/requestQuotation';
import { ClassificationFlags } from '../../../hooks/useMerchandise';
import { PackagingModal } from './PackageModal';
import styles from '../../../pages/Quotations.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MerchandiseModalProps {
  // Estado
  merchandiseForm:     Cargo;
  currentPackages:     any[];
  useMetricSystem:     boolean;
  byUnitsMerch:        boolean;
  classificationFlags: ClassificationFlags;
  imoList:             any[];
  mode:                'create' | 'edit' | 'view';
  idStatusRequest:     number;
  showPackagingModal:  boolean;
  // Acciones form
  onChangeMerchandiseForm: (changes: Partial<Cargo>) => void;
  onChangeMetricSystem:    (value: boolean) => void;
  onChangeByUnits:         (value: boolean) => void;
  onChangeClassificationFlags: (changes: Partial<ClassificationFlags>) => void;
  // Acciones packages
  onOpenPackagingModal:  () => void;
  onClosePackagingModal: () => void;
  onAddPackage:          (pkg: any) => void;
  onRemovePackage:       (pkg: any) => void;
  // Acciones modal
  onSave:  () => void;
  onClose: () => void;
  // Utils
  calculateTotals: () => { totalVolume: number; totalWeight: number };
  t:               (key: string) => string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MerchandiseModal: React.FC<MerchandiseModalProps> = ({
  merchandiseForm,
  currentPackages,
  useMetricSystem,
  byUnitsMerch,
  classificationFlags,
  imoList,
  mode,
  idStatusRequest,
  showPackagingModal,
  onChangeMerchandiseForm,
  onChangeMetricSystem,
  onChangeByUnits,
  onChangeClassificationFlags,
  onOpenPackagingModal,
  onClosePackagingModal,
  onAddPackage,
  onRemovePackage,
  onSave,
  onClose,
  calculateTotals,
  t,
}) => {

  const isDisabled = mode === 'view' || idStatusRequest >= 2;
  const { totalVolume, totalWeight } = calculateTotals();

  // ── Helper: toggle clasificación ─────────────────────────────────────────────
  const toggleClassification = (
    flagKey: keyof ClassificationFlags,
    idClass: number,
    classificationName: string
  ) => {
    onChangeClassificationFlags({ [flagKey]: !classificationFlags[flagKey] });
    const current = merchandiseForm.classification ?? [];
    const exists  = current.some(c => c.idClassificationMerchandise === idClass);
    onChangeMerchandiseForm({
      classification: exists
        ? current.filter(c => c.idClassificationMerchandise !== idClass)
        : [...current, { idClassificationMerchandise: idClass, classificationMerchandise: classificationName }],
    });
  };

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{t('quote.merchandiseModal')}</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className={styles.modalBody}>

            {/* Nombre + Estibable */}
            <div className={styles.modalRow}>
              <div className={styles.modalFieldLarge}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.merchandise')}
                </label>
                <input
                  type="text"
                  maxLength={80}
                  minLength={3}
                  placeholder="Baterías de Teléfonos Modelo 388"
                  className={styles.input}
                  value={merchandiseForm.merchandiseName}
                  onChange={(e) => onChangeMerchandiseForm({ merchandiseName: e.target.value })}
                  disabled={isDisabled}
                />
              </div>
              <div className={styles.modalFieldSmall}>
                <label className={styles.label}>{t('quote.isStackable')}</label>
                <div className={styles.toggleContainer}>
                  <button
                    type="button"
                    className={`${styles.toggleSwitch} ${merchandiseForm.stowable === 1 ? styles.active : ''}`}
                    onClick={() => onChangeMerchandiseForm({ stowable: merchandiseForm.stowable ? 0 : 1 })}
                    disabled={isDisabled}
                  >
                    <div className={styles.toggleThumb} />
                  </button>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('quote.merchandiseDescription')}</label>
              <textarea
                className={styles.textarea}
                maxLength={500}
                rows={3}
                value={merchandiseForm.merchandiseDescription}
                disabled={isDisabled}
                onChange={(e) => onChangeMerchandiseForm({ merchandiseDescription: e.target.value })}
              />
            </div>

            {/* ── Clasificación ── */}
            <div style={{ marginTop: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.merchandiseClassification')}
                </label>

                <div className={styles.classificationGrid}>

                  {/* Columna izquierda: checkboxes */}
                  <div className={styles.classificationColumn}>

                    {/* Peligrosa */}
                    <div className={styles.classificationCheckbox}>
                      <input type="checkbox" id="peligrosa" className={styles.checkbox}
                        checked={classificationFlags.showDangerouseMerch}
                        disabled={isDisabled}
                        onChange={() => toggleClassification('showDangerouseMerch', 7, 'Peligrosa')}
                      />
                      <label htmlFor="peligrosa" className={styles.classificationLabel}>
                        {t('quote.dangerousClass')}
                      </label>
                    </div>

                    {/* Refrigerada */}
                    <div className={styles.classificationCheckbox}>
                      <input type="checkbox" id="refrigerada" className={styles.checkbox}
                        checked={classificationFlags.showRefrigeratedMerch}
                        disabled={isDisabled}
                        onChange={() => toggleClassification('showRefrigeratedMerch', 10, 'Refrigerada')}
                      />
                      <label htmlFor="refrigerada" className={styles.classificationLabel}>
                        {t('quote.refrigeratedClass')}
                      </label>
                    </div>

                    {/* Sobredimensionada */}
                    <div className={styles.classificationCheckbox}>
                      <input type="checkbox" id="sobredimensionada" className={styles.checkbox}
                        checked={classificationFlags.showOversizedMerch}
                        disabled={isDisabled}
                        onChange={() => toggleClassification('showOversizedMerch', 8, 'Sobredimensionada')}
                      />
                      <label htmlFor="sobredimensionada" className={styles.classificationLabel}>
                        {t('quote.oversizedClass')}
                      </label>
                    </div>

                    {/* Granel */}
                    <div className={styles.classificationCheckbox}>
                      <input type="checkbox" id="granel" className={styles.checkbox}
                        checked={classificationFlags.showBulkClassMerch}
                        disabled={isDisabled}
                        onChange={() => toggleClassification('showBulkClassMerch', 5, 'Granel')}
                      />
                      <label htmlFor="granel" className={styles.classificationLabel}>
                        {t('quote.bulkClass')}
                      </label>
                    </div>

                    {/* General */}
                    <div className={styles.classificationCheckbox}>
                      <input type="checkbox" id="general" className={styles.checkbox}
                        checked={classificationFlags.showGeneralMerch}
                        disabled={isDisabled}
                        onChange={() => toggleClassification('showGeneralMerch', 11, 'General')}
                      />
                      <label htmlFor="general" className={styles.classificationLabel}>
                        General
                      </label>
                    </div>

                  </div>

                  {/* Columna derecha: campos extra según clasificación */}
                  <div className={styles.classificationColumn}>

                    {/* IMO + UN (Peligrosa) */}
                    {classificationFlags.showDangerouseMerch && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>*{t('quote.imo')}</label>
                          <select
                            className={styles.select}
                            value={merchandiseForm.classification?.find(c => c.idClassificationMerchandise === 7)?.imo ?? ''}
                            onChange={(e) => {
                              const selectedImo = imoList.find(i => i.imo === e.target.value);
                              onChangeMerchandiseForm({
                                classification: merchandiseForm.classification.map(c =>
                                  c.idClassificationMerchandise === 7
                                    ? { ...c, imo: e.target.value, imoDescription: selectedImo?.description }
                                    : c
                                ),
                              });
                            }}
                          >
                            <option value="">{t('quote.selectOption')}</option>
                            {imoList.map((item) => (
                              <option key={item._id} value={item.imo}>
                                {item.imo} - {item.description}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>*{t('quote.un')}</label>
                          <input
                            type="number" min="0" step="1"
                            placeholder="19"
                            className={styles.input}
                            style={{ width: '80px' }}
                            onInput={(e) => { e.currentTarget.value = e.currentTarget.value.slice(0, 9); }}
                            onKeyDown={(e) => {
                              if (e.key === '.' || e.key === '-' || e.key === 'e') e.preventDefault();
                            }}
                            value={merchandiseForm.classification?.find(c => c.idClassificationMerchandise === 7)?.un ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || Number(value) > 0) {
                                onChangeMerchandiseForm({
                                  classification: merchandiseForm.classification.map(c =>
                                    c.idClassificationMerchandise === 7 ? { ...c, un: value } : c
                                  ),
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Temperatura (Refrigerada) */}
                    {classificationFlags.showRefrigeratedMerch && (
                      <div className={styles.formGroup}>
                        <label className={styles.label}>*{t('quote.temperature')}</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="80"
                            className={styles.input}
                            style={{ width: '100px' }}
                            value={merchandiseForm.classification?.find(c => c.idClassificationMerchandise === 10)?.temperature ?? ''}
                            onChange={(e) => {
                              let value = e.target.value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '');
                              onChangeMerchandiseForm({
                                classification: merchandiseForm.classification.map(c =>
                                  c.idClassificationMerchandise === 10 ? { ...c, temperature: value } : c
                                ),
                              });
                            }}
                          />
                          <select
                            className={styles.select}
                            style={{ width: '80px' }}
                            value={merchandiseForm.classification?.find(c => c.idClassificationMerchandise === 10)?.tempUnit ?? '°C'}
                            onChange={(e) => {
                              onChangeMerchandiseForm({
                                classification: merchandiseForm.classification.map(c =>
                                  c.idClassificationMerchandise === 10 ? { ...c, tempUnit: e.target.value } : c
                                ),
                              });
                            }}
                          >
                            <option>°C</option>
                            <option>°F</option>
                          </select>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>

            {/* ── Toggle por unidades / sistema métrico ── */}
            <div className={styles.modalRow} style={{ marginTop: '1rem' }}>
              <div>
                <input
                  type="checkbox"
                  checked={byUnitsMerch}
                  onChange={() => { onChangeByUnits(!byUnitsMerch); }}
                  className={styles.checkbox}
                  disabled={isDisabled}
                />
                <label className={styles.checkboxLabel}> Por unidades</label>
              </div>
              <div className={styles.formGroup}>
                <div className={styles.unitTypeToggle}>
                  <span className={!useMetricSystem ? styles.activeUnitLabel : styles.inactiveUnitLabel}>
                    {t('quote.units.lbsInches')}
                  </span>
                  <button
                    type="button"
                    className={`${styles.toggleSwitch} ${useMetricSystem ? styles.active : ''}`}
                    onClick={() => onChangeMetricSystem(!useMetricSystem)}
                    disabled={isDisabled}
                  >
                    <div className={styles.toggleThumb} />
                  </button>
                  <span className={useMetricSystem ? styles.activeUnitLabel : styles.inactiveUnitLabel}>
                    {t('quote.units.kgCm')}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Volumen / Peso manual ── */}
            {!byUnitsMerch ? (
              <div className={styles.modalRow} style={{ marginTop: '1rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {t('quote.totalVolume')} ({useMetricSystem ? t('quote.cm') : t('quote.in')})
                  </label>
                  <input
                    type="number" min="1" step="any" placeholder="0"
                    className={styles.input}
                    value={merchandiseForm.volumeTotal}
                    disabled={isDisabled}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e') e.preventDefault();
                      if (e.currentTarget.value.length >= 7 && e.key !== 'Backspace' && e.key !== 'Delete') e.preventDefault();
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || Number(value) > 0) {
                        onChangeMerchandiseForm({ volumeTotal: Number(value) });
                      }
                    }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {t('quote.totalWeight')} ({useMetricSystem ? t('quote.kg') : t('quote.lbs')})
                  </label>
                  <input
                    type="number" min="0" step="any" placeholder="0"
                    className={styles.input}
                    value={merchandiseForm.weigthTotal}
                    disabled={isDisabled}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e') e.preventDefault();
                      if (e.currentTarget.value.length >= 7 && e.key !== 'Backspace' && e.key !== 'Delete') e.preventDefault();
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || Number(value) > 0) {
                        onChangeMerchandiseForm({ weigthTotal: Number(value) });
                      }
                    }}
                  />
                </div>
              </div>

            ) : (
              /* ── Tabla de paquetes ── */
              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className={styles.addPackageButtonIcon}
                  onClick={onOpenPackagingModal}
                  disabled={isDisabled}
                >
                  <Plus size={18} />
                  {t('quote.addPackaging')}
                </button>

                {currentPackages.length > 0 && (
                  <div className={styles.packagesTable} style={{ marginTop: '1rem' }}>
                    <table className={styles.simpleTable}>
                      <thead>
                        <tr>
                          <th>{t('quote.packagingTable.packaging')}</th>
                          <th>{t('quote.packagingTable.quantity')}</th>
                          <th>{t('quote.packagingTable.length')} ({useMetricSystem ? t('quote.cm') : t('quote.in')})</th>
                          <th>{t('quote.packagingTable.height')} ({useMetricSystem ? t('quote.cm') : t('quote.in')})</th>
                          <th>{t('quote.packagingTable.width')}  ({useMetricSystem ? t('quote.cm') : t('quote.in')})</th>
                          <th>{t('quote.packagingTable.weight')} ({useMetricSystem ? t('quote.kg') : t('quote.lbs')})</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPackages.map((pkg, index) => (
                          <tr key={index}>
                            <td>{pkg.unitCargo}</td>
                            <td>{pkg.quantity}</td>
                            <td>{pkg.length}</td>
                            <td>{pkg.height}</td>
                            <td>{pkg.width}</td>
                            <td>{pkg.weight}</td>
                            <td>
                              <button
                                type="button"
                                className={styles.removeRowButton}
                                onClick={() => onRemovePackage(pkg)}
                                disabled={isDisabled}
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Totales */}
                {currentPackages.length > 0 && (
                  <div className={styles.modalFooterInfo}>
                    <div className={styles.totalsDisplay}>
                      <div>
                        <div className={styles.totalLabel}>{t('quote.totalVolume')}</div>
                        <div className={styles.totalValue}>
                          {totalVolume.toFixed(2)} {useMetricSystem ? 'cm³' : 'in³'}
                        </div>
                      </div>
                      <div>
                        <div className={styles.totalLabel}>{t('quote.totalWeight')}</div>
                        <div className={styles.totalValue}>
                          {totalWeight.toFixed(2)} {useMetricSystem ? 'kg' : 'lbs'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ── Footer ── */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.saveModalButton}
              onClick={onSave}
              disabled={isDisabled}
            >
              {t('quote.save')}
            </button>
          </div>

        </div>
      </div>

      {/* Sub-modal de packaging */}
      {showPackagingModal && (
        <PackagingModal
          useMetricSystem={useMetricSystem}
          onAdd={onAddPackage}
          onClose={onClosePackagingModal}
          t={t}
        />
      )}
    </>
  );
};

export default MerchandiseModal;