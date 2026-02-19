import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchDashboardStats } from '../services/dashboardService';
import Quotations from './Quotations';
import Executives from './Executives';
import Customers from './Customers';

type Page = 'dashboard' | 'quotations' | 'executives' | 'customers';

interface StatusPercentage {
  statusName: string;
  percentage: number;
}

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
  quotations?: {
    totalCurrentMonth: number;
    statusPercentageCurrentMonth: StatusPercentage[];
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

          {/* Cotización de Servicios Section */}
          {dashboardData?.quotations && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-l-4 border-teal-500 pl-3 mb-6">
                Cotización de servicios
              </h2>

              {/* Rendimiento por Canal */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Rendimiento por Canal
                  </h3>
                  <button className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium">
                    SOLICITUDES ACEPTADAS
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Dirección */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Dirección</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">62</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </div>

                  {/* TI/Extranet */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">TI/Extranet</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">75</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  {/* Clientes */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Clientes</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">214</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  {/* Filiales */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filiales</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">166</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: '83%' }}></div>
                    </div>
                  </div>

                  {/* Corresponsales */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Corresponsales</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">93</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: '46.5%' }}></div>
                    </div>
                  </div>

                  {/* Comerciales */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Comerciales</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">152</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado de Cotizaciones */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Estado de Cotizaciones
                </h3>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col lg:flex-row items-center justify-around gap-8">
                    {/* Donut Chart */}
                    <div className="relative w-64 h-64">
                      <svg viewBox="0 0 200 200" className="transform -rotate-90">
                        {dashboardData.quotations.statusPercentageCurrentMonth.map((status, index) => {
                          const colors = ['#14b8a6', '#ef4444', '#9ca3af', '#6b7280'];
                          const total = dashboardData.quotations!.statusPercentageCurrentMonth.reduce((sum, s) => sum + s.percentage, 0);

                          let startAngle = 0;
                          for (let i = 0; i < index; i++) {
                            startAngle += (dashboardData.quotations!.statusPercentageCurrentMonth[i].percentage / total) * 360;
                          }

                          const angle = (status.percentage / total) * 360;
                          const radius = 70;
                          const innerRadius = 45;

                          const startRad = (startAngle * Math.PI) / 180;
                          const endRad = ((startAngle + angle) * Math.PI) / 180;

                          const x1 = 100 + radius * Math.cos(startRad);
                          const y1 = 100 + radius * Math.sin(startRad);
                          const x2 = 100 + radius * Math.cos(endRad);
                          const y2 = 100 + radius * Math.sin(endRad);

                          const x3 = 100 + innerRadius * Math.cos(endRad);
                          const y3 = 100 + innerRadius * Math.sin(endRad);
                          const x4 = 100 + innerRadius * Math.cos(startRad);
                          const y4 = 100 + innerRadius * Math.sin(startRad);

                          const largeArc = angle > 180 ? 1 : 0;

                          const pathData = [
                            `M ${x1} ${y1}`,
                            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                            `L ${x3} ${y3}`,
                            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
                            'Z'
                          ].join(' ');

                          return (
                            <path
                              key={status.statusName}
                              d={pathData}
                              fill={colors[index % colors.length]}
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          {dashboardData.quotations.totalCurrentMonth}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">TOTAL</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-3">
                      {dashboardData.quotations.statusPercentageCurrentMonth.map((status, index) => {
                        const colors = [
                          { bg: 'bg-teal-500', text: 'text-teal-500' },
                          { bg: 'bg-red-500', text: 'text-red-500' },
                          { bg: 'bg-gray-400', text: 'text-gray-400' },
                          { bg: 'bg-gray-600', text: 'text-gray-600' }
                        ];
                        const color = colors[index % colors.length];

                        return (
                          <div key={status.statusName} className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${color.bg}`}></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[100px]">
                              {status.statusName}
                            </span>
                            <span className={`text-sm font-semibold ${color.text}`}>
                              {status.percentage}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {currentPage === 'quotations' && <Quotations />}
      {currentPage === 'executives' && <Executives />}
      {currentPage === 'customers' && <Customers />}
    </Layout>
  );
}
