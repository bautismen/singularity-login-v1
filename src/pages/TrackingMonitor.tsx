import { useLanguage } from "../contexts/LanguageContext";
import styles from "./Customers.module.css";

export function TrackingMonitor() {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className="flex items-baseline gap-2">
          <h1 className={styles.title}>{t("tracking.title")}</h1>
          <span className="ml-4 text-slate-500 text-sm">{t("tracking.subtitle")}</span>
        </div>
      </div>

      <div className="sm:h-[200px] md:h-[437px] lg:h-[437px] xl:h-[900px]">
        <iframe
          lang="es"
          src="https://krom-logistica.github.io/widgets-app/third-party-providers/searates/ContainerTracking.html"
          title={t("tracking.title")}
          className="w-full h-full border-0"
        />

      </div>
    </div>
  );
}
