import React from 'react';
import { X } from 'lucide-react';
import styles from  '../../../pages/Quotations.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PackagingModalProps {
  useMetricSystem: boolean;
  onAdd:           (pkg: any) => void;
  onClose:         () => void;
  t:               (key: string) => string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PackagingModal: React.FC<PackagingModalProps> = ({
  useMetricSystem,
  onAdd,
  onClose,
  t,
}) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectElement = document.getElementById('package-type') as HTMLSelectElement;
    const unitCargo     = selectElement.options[selectElement.selectedIndex].text;
    const quantity      = (document.getElementById('package-quantity') as HTMLInputElement).value;
    const length        = (document.getElementById('package-length')   as HTMLInputElement).value;
    const height        = (document.getElementById('package-height')   as HTMLInputElement).value;
    const width         = (document.getElementById('package-width')    as HTMLInputElement).value;
    const weight        = (document.getElementById('package-weight')   as HTMLInputElement).value;

    if (unitCargo && quantity && length && height && width && weight) {
      onAdd({
        idUnitCargo: parseInt(selectElement.value),
        unitCargo,
        quantity:    parseInt(quantity),
        length,
        height,
        width,
        weight,
      });
    }
  };

  const dimensionUnit = useMetricSystem ? t('quote.cm') : t('quote.in');
  const weightUnit    = useMetricSystem ? t('quote.kg') : t('quote.lbs');

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>

          {/* Header */}
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{t('quote.addPackagingModal')}</h2>
            <button type="button" className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className={styles.modalBody}>

            {/* Tipo de empaque */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {t('quote.packagingType')}
              </label>
              <select className={styles.select} id="package-type" required>
                <option value="">{t('quote.selectOption')}</option>
                <option value={4}>{t('quote.box')}</option>
                <option value={18}>{t('quote.pallet')}</option>
                <option value={15}>{t('quote.sack')}</option>
              </select>
            </div>

            {/* Cantidad */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.required}>*</span>
                {t('quote.quantity')}
              </label>
              <input
                type="number"
                min="1"
                step="1"
                className={styles.input}
                placeholder="5"
                id="package-quantity"
                onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.slice(0, 9); }}
                required
              />
            </div>

            {/* Largo / Alto */}
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.length')} ({dimensionUnit})
                </label>
                <input
                  type="number" min="1" step="any"
                  className={styles.input} id="package-length" required
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') e.preventDefault();
                    if (e.currentTarget.value.length >= 6 && e.key !== 'Backspace' && e.key !== 'Delete') e.preventDefault();
                  }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.height')} ({dimensionUnit})
                </label>
                <input
                  type="number" min="1" step="any"
                  className={styles.input} id="package-height" required
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') e.preventDefault();
                    if (e.currentTarget.value.length >= 6 && e.key !== 'Backspace' && e.key !== 'Delete') e.preventDefault();
                  }}
                />
              </div>
            </div>

            {/* Ancho / Peso */}
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.width')} ({dimensionUnit})
                </label>
                <input
                  type="number" min="1" step="any"
                  className={styles.input} id="package-width" required
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') e.preventDefault();
                    if (e.currentTarget.value.length >= 6 && e.key !== 'Backspace' && e.key !== 'Delete') e.preventDefault();
                  }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span>
                  {t('quote.weight')} ({weightUnit})
                </label>
                <input
                  type="number" min="1" step="any"
                  className={styles.input} id="package-weight" required
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') e.preventDefault();
                    if (e.currentTarget.value.length >= 6 && e.key !== 'Backspace' && e.key !== 'Delete') e.preventDefault();
                  }}
                />
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button type="submit" className={styles.saveModalButton}>
              {t('quote.add')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PackagingModal;