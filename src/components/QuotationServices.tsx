import { useEffect, useState } from 'react';
import { fetchQuotationDashboard, QuotationDashboardData } from '../services/dashboardService';

export function QuotationServices() {
  const [data, setData] = useState<QuotationDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchQuotationDashboard();
        setData(result);
      } catch (error) {
        console.error('Error loading quotation dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const totalQuotations = data?.totalQuotations || 0;
  const statusData = data?.statusPercentageCurrentMonth || [];
  const channelData = data?.channelPerformance || [];

  const colors = [
    { bg: 'bg-teal-500', text: 'text-teal-500' },
    { bg: 'bg-red-400', text: 'text-red-400' },
    { bg: 'bg-gray-300', text: 'text-gray-500' },
    { bg: 'bg-gray-400', text: 'text-gray-600' },
  ];

  const maxChannelValue = Math.max(...channelData.map(item => item.value), 1);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-l-4 border-teal-500 pl-3 mb-6">
        Cotización de servicios
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Rendimiento por Canal
            </h3>
            <button className="text-xs text-teal-500 hover:text-teal-600 font-medium uppercase">
              Solicitudes recibidas
            </button>
          </div>

          <div className="space-y-4">
            {channelData.map((channel, index) => (
              <div key={channel.channelName}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {channel.channelName}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {channel.value}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${index % 2 === 0 ? 'bg-teal-500' : 'bg-teal-400'} rounded-full transition-all duration-500`}
                    style={{ width: `${(channel.value / maxChannelValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Estado de Cotizaciones
          </h3>

          <div className="flex items-center justify-center mb-6">
            <div className="relative" style={{ width: '200px', height: '200px' }}>
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                {statusData.map((status, index) => {
                  const total = statusData.reduce((sum, s) => sum + s.percentage, 0);
                  const startAngle = statusData
                    .slice(0, index)
                    .reduce((sum, s) => sum + (s.percentage / total) * 360, 0);
                  const angle = (status.percentage / total) * 360;

                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = ((startAngle + angle) * Math.PI) / 180;

                  const x1 = 100 + 80 * Math.cos(startRad);
                  const y1 = 100 + 80 * Math.sin(startRad);
                  const x2 = 100 + 80 * Math.cos(endRad);
                  const y2 = 100 + 80 * Math.sin(endRad);

                  const largeArc = angle > 180 ? 1 : 0;

                  const pathData = [
                    `M 100 100`,
                    `L ${x1} ${y1}`,
                    `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
                    `Z`
                  ].join(' ');

                  let fillColor = '#14b8a6';
                  if (index === 1) fillColor = '#f87171';
                  else if (index === 2) fillColor = '#d1d5db';
                  else if (index === 3) fillColor = '#9ca3af';

                  return (
                    <path
                      key={status.statusName}
                      d={pathData}
                      fill={fillColor}
                      className="transition-all duration-300"
                    />
                  );
                })}
                <circle cx="100" cy="100" r="55" fill="white" className="dark:fill-gray-800" />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {totalQuotations}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  TOTAL
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {statusData.map((status, index) => (
              <div key={status.statusName} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors[index]?.bg || 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {status.statusName}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${colors[index]?.text || 'text-gray-600'}`}>
                  {status.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
