import { useState, useEffect } from 'react';
import { fetchDashboardStats } from '../services/dashboardService';

interface DashboardStatsData {
  stats: {
    gold: number;
    silver: number;
    bronze: number;
    total: number;
  };
  percentages: {
    gold: string;
    silver: string;
    bronze: string;
  };
}

export function DashboardStats() {
  const [data, setData] = useState<DashboardStatsData | null>(null);
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
        console.error('Error loading dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
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
          <p className="text-red-600 dark:text-red-400">Error al cargar estadísticas: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitoreo de rendimiento de clientes y estados de cotización.
        </p>
      </div>

      <div className="mb-6">
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
              <img src="/gold.png" alt="Gold Medal" className="w-full h-full object-contain" />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center mb-2 uppercase tracking-wide">
              Categoría Oro
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">
              {data.stats.gold.toLocaleString()}
            </p>
            <div className="flex items-center justify-center text-sm">
              <span className="text-teal-500 font-medium">{data.percentages.gold}% del total</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
              <img src="/silver.png" alt="Silver Medal" className="w-full h-full object-contain" />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center mb-2 uppercase tracking-wide">
              Categoría Plata
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">
              {data.stats.silver.toLocaleString()}
            </p>
            <div className="flex items-center justify-center text-sm">
              <span className="text-gray-500 font-medium">{data.percentages.silver}% del total</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
              <img src="/bronze.png" alt="Bronze Medal" className="w-full h-full object-contain" />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center mb-2 uppercase tracking-wide">
              Categoría Bronce
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">
              {data.stats.bronze.toLocaleString()}
            </p>
            <div className="flex items-center justify-center text-sm">
              <span className="text-amber-600 font-medium">{data.percentages.bronze}% del total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
