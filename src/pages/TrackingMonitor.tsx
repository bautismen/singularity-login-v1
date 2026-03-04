import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";


export function TrackingMonitor() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timeout = 10000 ; // Tiempo máximo de espera para cargar el iframe (10 segundos)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setError(true);
        setLoading(false);
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [loading, timeout]);


  return (
    <div className="relative w-full h-full p-8">
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("tracking.title")}</h1>
          <span className="ml-4 text-gray-600 dark:text-gray-400 text-sm">{t("tracking.subtitle")}</span>
        </div>
      </div>


        {loading && (
          <div className="p-8">
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-teal-200 dark:border-teal-800 border-t-teal-600 dark:border-t-teal-400 rounded-full animate-spin"></div>
            </div>
          </div>
        )}


        {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 z-10">
          <p className="text-sm text-red-500 mb-2">
            El contenido tardó demasiado en cargar.
          </p>
          <button
            onClick={() => {
              setError(false);
              setLoading(true);
            }}
            className="px-4 py-2 bg-[#038C7F] hover:bg-[#03738C] text-white font-medium rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

        <iframe
          lang="es"
          src="https://krom-logistica.github.io/widgets-app/third-party-providers/searates/ContainerTracking.html"
          title={t("tracking.title")}
          className={`w-full h-full rounded-lg border-0 transition-opacity duration-700 ${
                    loading ? "opacity-0" : "opacity-100"
                    }`}
          onLoad={() => {
            setLoading(false);
            setError(false);
          }}
        />


    </div>
  );
}
