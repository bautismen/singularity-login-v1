import React from 'react';
import { X, Plus } from 'lucide-react';
import { Container } from '../../../types/container';
import { ContainerRequest } from '../../../types/requestQuotation';
import styles from '../../../pages/Quotations.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContainersModalProps {
  availableContainers:   Container[];
  containersInShipment:  ContainerRequest[];
  loading:               boolean;
  onAdd:                 (container: ContainerRequest) => void;
  onClose:               () => void;
  t:                     (key: string) => string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ContainersModal: React.FC<ContainersModalProps> = ({
  availableContainers,
  containersInShipment,
  loading,
  onAdd,
  onClose,
  t,
}) => {

  // Contenedores que aún no han sido agregados al shipment
  const unselected = availableContainers.filter(
    cont => !containersInShipment.some(c => c.idContainer === cont._Id)
  );

  // Contenedores ya agregados (para mostrar el mensaje de "todos agregados")
  const allAdded =
    availableContainers.filter(cont =>
      containersInShipment.some(c => c.idContainer === cont._Id)
    ).length === availableContainers.length && availableContainers.length > 0;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{t('quote.selectcontainer')}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
            </div>
          ) : (
            <div className={styles.executiveSelectionList}>
              {unselected.map((container) => (
                <div
                  key={container._Id}
                  className={styles.executiveSelectionItem}
                  onClick={() => {
                    onAdd({
                      idContainer:       container._Id,
                      nameTypeContainer: container.name_type,
                      quantity:          1,
                    });
                    onClose();
                  }
                  }>
                  <span>{container.name_type}</span>
                  <Plus size={18} className={styles.addIcon} />
                </div>
              ))}

              {allAdded && (
                <div className={styles.noExecutivesMessage}>
                  {t('quote.allContainersAdded')}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ContainersModal;