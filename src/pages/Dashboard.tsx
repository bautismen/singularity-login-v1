import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import Quotations from './Quotations';
import Executives from './Executives';
import Customers from './Customers';

type Page = 'dashboard' | 'quotations' | 'executives' | 'customers';

export function Dashboard() {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

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
                TOTAL: 1,248 CLIENTES
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
                  342
                </p>
                <div className="flex items-center justify-center text-sm">
                  <svg className="w-4 h-4 mr-1 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-teal-500 font-medium">+12% este mes</span>
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
                  512
                </p>
                <div className="flex items-center justify-center text-sm">
                  <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  <span className="text-gray-500 font-medium">Manteniendo ritmo</span>
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
                  394
                </p>
                <div className="flex items-center justify-center text-sm">
                  <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                  </svg>
                  <span className="text-red-500 font-medium">-4% este mes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {currentPage === 'quotations' && <Quotations />}
      {currentPage === 'executives' && <Executives />}
      {currentPage === 'customers' && <Customers />}
    </Layout>
  );
}
