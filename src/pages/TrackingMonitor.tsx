import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Customers.module.css';

export function TrackingMonitor() {
  const { t } = useLanguage();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.searates.com/container/widget';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('tracking.title')}</h1>
          <p className={styles.subtitle}>{t('tracking.subtitle')}</p>
        </div>
      </div>

      <div className={styles.content}>
        <div id="UFWX" data-filter='{"platform":33840, "lang": "en"}'></div>
      </div>
    </div>
  );
}
