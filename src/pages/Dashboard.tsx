import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { customerSummaryService, CustomerSummaryLevel } from '../services/customerSummaryService';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Quotations from './Quotations';
import Executives from './Executives';
import Customers from './Customers';

type Page = 'dashboard' | 'quotations' | 'executives' | 'customers';

export function Dashboard() {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [customerSummary, setCustomerSummary] = useState<CustomerSummaryLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    loadCustomerSummary();
  }, []);

  const loadCustomerSummary = async () => {
    try {
      setLoading(true);
      const data = await customerSummaryService.getSummary();
      setCustomerSummary(data);

      const total = data.reduce((sum, item) => sum + (item.count || 0), 0);
      setTotalCustomers(total);
    } catch (error) {
      console.error('Error loading customer summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryData = (level: string) => {
    return customerSummary.find(item =>
      item.level?.toLowerCase() === level.toLowerCase()
    ) || { count: 0, percentage: 0 };
  };

  const getMedalIcon = (category: string) => {
    const icons = {
      'oro': '/gold.png',
      'plata': '/silver.png',
      'bronce': '/bronze.png',
    };
    return icons[category] || '';
  };

  const getTrendIcon = (trend: string | undefined) => {
    if (!trend) return <Minus className="w-4 h-4" />;
    if (trend.includes('+') || parseFloat(trend) > 0) {
      return <TrendingUp className="w-4 h-4 text-teal-500" />;
    }
    if (trend.includes('-') || parseFloat(trend) < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

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

          {/* Categorización de Clientes */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-l-4 border-teal-500 pl-4">
                Categorización de Clientes
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                TOTAL: <span className="font-bold text-gray-900 dark:text-white">{totalCustomers}</span> CLIENTES
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Categoría ORO */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
                  <div className="flex items-center mb-4">
                    <img
                      src={getMedalIcon('oro')}
                      alt="Oro"
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase">
                    Categoría Oro
                  </h3>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {getCategoryData('oro').count}
                  </p>
                  {getCategoryData('oro').percentage !== 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      {getTrendIcon(getCategoryData('oro').percentage > 0 ? '+' : '-')}
                      <span className={getCategoryData('oro').percentage > 0 ? 'text-teal-500' : 'text-red-500'}>
                        {Math.abs(getCategoryData('oro').percentage)}% este mes
                      </span>
                    </div>
                  )}
                </div>

                {/* Categoría PLATA */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
                  <div className="flex items-center mb-4">
                    <img
                      src={getMedalIcon('plata')}
                      alt="Plata"
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase">
                    Categoría Plata
                  </h3>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {getCategoryData('plata').count}
                  </p>
                  {getCategoryData('plata').percentage !== 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      {getTrendIcon('0')}
                      <span>Manteniendo ritmo</span>
                    </div>
                  )}
                </div>

                {/* Categoría BRONCE */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
                  <div className="flex items-center mb-4">
                    <img
                      src={getMedalIcon('bronce')}
                      alt="Bronce"
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase">
                    Categoría Bronce
                  </h3>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {getCategoryData('bronce').count}
                  </p>
                  {getCategoryData('bronce').percentage !== 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      {getTrendIcon(getCategoryData('bronce').percentage > 0 ? '+' : '-')}
                      <span className={getCategoryData('bronce').percentage < 0 ? 'text-teal-500' : 'text-red-500'}>
                        {Math.abs(getCategoryData('bronce').percentage)}% este mes
                      </span>
                    </div>
                  )}
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
