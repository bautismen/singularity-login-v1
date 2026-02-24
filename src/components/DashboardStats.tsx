import { useState, useEffect } from "react";
import { fetchDashboardStats, type DashboardStats } from "../services/dashboardService";
import { DonutChart } from "../components/DonutChart";

interface DashboardStatsProps {
  onNavigate?: (route: string) => void;
}

export function DashboardStats({ onNavigate }: DashboardStatsProps) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const stats = await fetchDashboardStats();
        setData(stats);
        setError(null);
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);


  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-teal-200 dark:border-teal-800 border-t-teal-600 dark:border-t-teal-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">
            Error al cargar estadísticas: {error}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-8 dark:bg-slate-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitoreo de rendimiento de clientes y estados de cotización.
        </p>
      </div>

      <div id="CustomerCategorization" className="mb-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-l-4 border-teal-500 pl-3">
            Categorización de Clientes
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            TOTAL: {data.stats.total.toLocaleString()} CLIENTES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
              <img
                src="/gold.png"
                alt="Gold Medal"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center mb-2 uppercase tracking-wide">
              Categoría Oro
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">
              {data.stats.gold.toLocaleString()}
            </p>
            <div className="flex items-center justify-center text-sm">
              <span className="text-teal-500 font-medium">
                {data.percentages.gold}% del total
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
              <img
                src="/silver.png"
                alt="Silver Medal"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center mb-2 uppercase tracking-wide">
              Categoría Plata
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">
              {data.stats.silver.toLocaleString()}
            </p>
            <div className="flex items-center justify-center text-sm">
              <span className="text-gray-500 font-medium">
                {data.percentages.silver}% del total
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
              <img
                src="/bronze.png"
                alt="Bronze Medal"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center mb-2 uppercase tracking-wide">
              Categoría Bronce
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">
              {data.stats.bronze.toLocaleString()}
            </p>
            <div className="flex items-center justify-center text-sm">
              <span className="text-amber-600 font-medium">
                {data.percentages.bronze}% del total
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4 "> 
        <button
          id="btnCotizacion"
          onClick={() => onNavigate?.('quotations')}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors"
        >
          + Solicitar cotización
        </button>
      </div>

      <div id="StatementofContributions" className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estado de Cotizaciones
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              2026
            </span>
          </div>
          {data.quotations?.statusPercentageCurrentMonth &&
          data.quotations.statusPercentageCurrentMonth.length > 0 ? (
            <DonutChart
              data={data.quotations.statusPercentageCurrentMonth}
              total={data.quotations.totalQuotationsCurrentMonth || 0}
            />
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No hay datos disponibles
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button className="pb-3 px-1 border-b-2 border-teal-500 text-teal-500 font-medium text-sm">
              Cotizaciones Urgentes
            </button>
            <button className="pb-3 px-1 text-gray-500 dark:text-gray-400 font-medium text-sm hover:text-teal-500">
              Cotizaciones Recientes
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Cliente
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Tipo
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Vencimiento
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Acciones
              </span>
            </div>

            {data.quotations?.upcomingDeadlines &&
            data.quotations.upcomingDeadlines.length > 0 ? (
              <>
                {data.quotations.upcomingDeadlines
                  .slice(0, 3)
                  .map((deadline, index) => {
                    const isOverdue =
                      new Date(deadline.deadlineDate) < new Date();
                    const medalIcon =
                      deadline.customer.customer_category === 1
                        ? "/gold.png"
                        : deadline.customer.customer_category === 2
                          ? "/silver.png"
                          : "/bronze.png";

                    return (
                      <div
                        key={index}
                        className="grid grid-cols-4 gap-4 items-center py-3 border-b border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-600 dark:text-teal-400 text-xs font-medium">
                            {deadline.customer.customer_name.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white truncate">
                            {deadline.customer.customer_name}
                          </span>
                        </div>
                        <div className="flex items-center justify-center">
                          <img
                            src={medalIcon}
                            alt="Category"
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div className="text-center">
                          <span
                            className={`text-sm ${isOverdue ? "text-red-500 font-semibold" : "text-gray-700 dark:text-gray-300"}`}
                          >
                            {isOverdue ? "+ " : ""}
                            {Math.abs(
                              Math.floor(
                                (new Date(deadline.deadlineDate).getTime() -
                                  new Date().getTime()) /
                                  (1000 * 60 * 60 * 24),
                              ),
                            )}
                            d
                          </span>
                        </div>
                        <div className="flex justify-center">
                          <button className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium flex items-center gap-1">
                            👁 Ver Detalle
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No hay cotizaciones urgentes
              </div>
            )}

            {data.quotations?.upcomingDeadlines &&
              data.quotations.upcomingDeadlines.length > 3 && (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Mostrando 3 de {data.quotations.upcomingDeadlines.length}{" "}
                    registros
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-teal-500 text-white hover:bg-teal-600">
                      1
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      2
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      3
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>


      <div id="Performanceperchannel" className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-l-4 border-teal-500 pl-3">
            Rendimiento por canal
          </h2>
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            <option value={2026}>Año 2026</option>
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Dirección
            </span>
            <span className="text-sm font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wide">
              Solicitudes Aceptadas
            </span>
          </div>

          {data.quotations?.acceptedByChannel &&
          data.quotations.acceptedByChannel.length > 0 ? (
            data.quotations.acceptedByChannel.map((channel) => (
              <div key={channel.requestTypeId} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {channel.requestTypeName}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {channel.totalAccepted}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min((channel.totalAccepted / 300) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No hay datos de canales disponibles
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
