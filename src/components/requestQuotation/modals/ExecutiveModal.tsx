import React from 'react';
import { X, Plus } from 'lucide-react';
import { Executive } from '../../../types/requestQuotation';
import styles from '../../../pages/Quotations.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExecutiveModalProps {
  availableExecutives: any[];
  assignedExecutives:  Executive[];
  onAdd:               (executive: Executive) => void;
  onClose:             () => void;
  t:                   (key: string) => string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ExecutiveModal: React.FC<ExecutiveModalProps> = ({
  availableExecutives,
  assignedExecutives,
  onAdd,
  onClose,
  t,
}) => {

  const unassigned = availableExecutives.filter(
    exec => !assignedExecutives.some(e => e.idEmployee === exec._Id)
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{t('quote.selectExecutive')}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <div className={styles.executiveSelectionList}>

            {unassigned.map((executive) => (
              <div
                key={executive._Id}
                className={styles.executiveSelectionItem}
                onClick={() =>
                  onAdd({
                    idEmployee:   executive._Id,
                    nameEmployee: `${executive.nombre} ${executive.apellido_paterno} ${executive.apellido_materno}`,
                    idUser:       executive._Iduser,
                  })
                }
              >
                <span>
                  {executive.nombre} {executive.apellido_paterno} {executive.apellido_materno}
                </span>
                <Plus size={18} className={styles.addIcon} />
              </div>
            ))}

            {unassigned.length === 0 && (
              <div className={styles.noExecutivesMessage}>
                {t('quote.allExecutivesAdded')}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ExecutiveModal;