import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Executive } from '../../types/requestQuotation';
import styles from '../../pages/Quotations.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExecutivesSectionProps {
  executives:      Executive[];
  mode:            'create' | 'edit' | 'view';
  idStatusRequest: number;
  isPricingUser:   boolean;
  onOpenModal:     () => void;
  onRemove:        (idEmployee: string) => void;
  t:               (key: string) => string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ExecutivesSection: React.FC<ExecutivesSectionProps> = ({
  executives,
  mode,
  idStatusRequest,
  isPricingUser,
  onOpenModal,
  onRemove,
  t,
}) => {

  // Solo visible si el usuario es pricing y la solicitud ya fue enviada
  const isVisible = isPricingUser && idStatusRequest >= 2;
  if (isVisible === false) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{t('quote.executiveAssignment')}</h2>
      <div className={styles.executivesCard}>

        {/* Lista de ejecutivos asignados */}
        <div className={styles.executivesList}>
          {executives.map((executive) => (
            <div key={executive.idEmployee} className={styles.executiveItemSimple}>
              <span className={styles.executiveLabel}>Ejecutivo</span>
              <span className={styles.executiveNameSimple}>{executive.nameEmployee}</span>
              <button
                type="button"
                className={styles.removeIconButton}
                onClick={() => onRemove(executive.idEmployee || '')}
                title={t('quote.delete')}
                disabled={mode === 'view'}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Botón agregar */}
        <button
          type="button"
          className={styles.addExecutiveButton}
          onClick={onOpenModal}
          disabled={mode === 'view'}>
          <Plus size={16} />
          {t('quote.addExecutive')}
        </button>

      </div>
    </div>
  );
};

export default ExecutivesSection;