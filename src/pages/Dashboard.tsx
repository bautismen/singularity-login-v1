import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchDashboardStats } from '../services/dashboardService';
import Quotations from './Quotations';
import Executives from './Executives';
import Customers from './Customers';

type Page = 'dashboard' | 'quotations' | 'executives' | 'customers';

interface DashboardData {
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

export function Dashboard() {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardStats();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentPage === 'dashboard') {
      loadDashboardData();
    }
  }, [currentPage]);

  return (
    <Layout onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && (
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
                TOTAL: {loading ? '...' : dashboardData?.stats.total || 0} CLIENTES
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
                    <img src="/gold.png" alt="Gold Medal" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center mb-2 uppercase tracking-wide">
                    Categoría Oro
                  </p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">
                    {dashboardData?.stats.gold || 0}
                  </p>
                  <div className="flex items-center justify-center text-sm">
                    <span className="text-teal-500 font-medium">{dashboardData?.percentages.gold || '0.0'}% del total</span>
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
                    {dashboardData?.stats.silver || 0}
                  </p>
                  <div className="flex items-center justify-center text-sm">
                    <span className="text-gray-500 font-medium">{dashboardData?.percentages.silver || '0.0'}% del total</span>
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
                    {dashboardData?.stats.bronze || 0}
                  </p>
                  <div className="flex items-center justify-center text-sm">
                    <span className="text-orange-500 font-medium">{dashboardData?.percentages.bronze || '0.0'}% del total</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {currentPage === 'quotations' && <Quotations />}
      {currentPage === 'executives' && <Executives />}
      {currentPage === 'customers' && <Customers />}
    </Layout>
  );
}
