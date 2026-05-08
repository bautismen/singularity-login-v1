import React from 'react';
import { Plus, Trash2, Eye } from 'lucide-react';
import { Cargo, Service } from '../../types/requestQuotation';
import styles from '../../pages/Quotations.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MerchandiseTableProps {
  service:    Service;
  cargo:      Cargo[];
  mode:       'create' | 'edit' | 'view';
  idStatusRequest: number;
  onOpenMerchandiseModal: (service: Service, cargo?: Cargo) => void;
  onRemoveMerchandise:    (idServiceItem: number, merchandise: Cargo) => void;
  t: (key: string) => string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MerchandiseTable: React.FC<MerchandiseTableProps> = ({
  service,
  cargo,
  mode,
  idStatusRequest,
  onOpenMerchandiseModal,
  onRemoveMerchandise,
  t,
}) => {

  const isDisabled = mode === 'view' || idStatusRequest >= 2;
  return (
    <div className={styles.merchandiseSection}>
      <h3 className={styles.subsectionTitle}>{t('quote.merchandise')}</h3>
      <div className={styles.merchandiseTable}>
        <table className={styles.simpleTable}>
          <thead>
            <tr>
              <th>{t('quote.merchandise')}</th>
              <th>{t('quote.dangerous')}</th>
              <th>{t('quote.refrigerated')}</th>
              <th>{t('quote.stackable')}</th>
              <th>{t('quote.totalVolume')}</th>
              <th>{t('quote.totalWeight')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cargo?.map((merch, index) => (
              <tr key={index}>
                <td>{merch.merchandiseName}</td>
                <td>{merch.classification?.some(c => c.idClassificationMerchandise === 7) ? 'Si' : 'No'}</td>
                <td>{merch.classification?.some(c => c.idClassificationMerchandise === 10) ? 'Si' : 'No'}</td>
                <td>{merch.stowable ? 'Si' : 'No'}</td>
                <td>{merch.volumeTotal} {merch.unitMeasurement}</td>
                <td>{merch.weigthTotal} {merch.unitWeight}</td>
                <td>
                  <div className={styles.tableActions}>
                    <button
                      type="button"
                      className={styles.iconButtonSmall}
                      title={t('quote.delete')}
                      disabled={isDisabled}
                      onClick={() => onRemoveMerchandise(service.idServiceItem, merch)}
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type="button"
                      className={styles.viewButtonGreen}
                      title={t('quote.view')}
                      onClick={() => onOpenMerchandiseModal(service, merch)}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {cargo?.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '1rem', opacity: 0.5 }}>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className={styles.addItemButton}
        disabled={isDisabled}
        onClick={() => onOpenMerchandiseModal(service)}
      >
        <Plus size={16} />
        {t('quote.addMerchandise')}
      </button>
    </div>
  );
};

export default MerchandiseTable;