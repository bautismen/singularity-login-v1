import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './ControlsPricing.module.css';

export function ControlsPricing() {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Controles pricing</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.emptyState}>
          <p>Módulo de Controles pricing</p>
        </div>
      </div>
    </div>
  );
}
