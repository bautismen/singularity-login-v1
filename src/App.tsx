import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { QuotationsManager } from './pages/QuotationsManager';
import { ControlsPricing } from './pages/ControlsPricing';
import { TrackingMonitor } from './pages/TrackingMonitor';
import { Executives } from './pages/Executives';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import { CatalogIMO } from './pages/CatalogIMO';
import { CatalogIncoterms } from './pages/CatalogIncoterms';
import { CatalogServices } from './pages/CatalogServices';
import { CatalogStatus } from './pages/CatalogStatus';
import { CatalogRequestTypes } from './pages/CatalogRequestTypes';
import { CatalogCountries } from './pages/CatalogCountries';
import { CatalogUsers } from './pages/CatalogUsers';
import { CatalogSectorOfBusiness } from './pages/CatalogSectorOfBusiness';
import { Layout } from './components/Layout';
import Companies from './pages/Companies';

type Route = 'dashboard' | 'quotations' | 'controls-pricing' | 'tracking-monitor' | 'executives' | 'shipments' | 'customers' | 'suppliers' | 'operations' | 'documents' | 'analytics' | 'settings' | 'catalogs/imo' | 'catalogs/incoterms' | 'catalogs/services' | 'catalogs/status' | 'catalogs/request-types' | 'catalogs/countries' | 'catalogs/users' | 'catalogs/sector-of-business'| 'catalogs/companies';

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');

  try {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-teal-200 dark:border-teal-800 border-t-teal-600 dark:border-t-teal-400 rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!user) {
      return <Login />;
    }

    const handleNavigate = (route: string) => {
      setCurrentRoute(route as Route);
    };

    const renderContent = () => {
      switch (currentRoute) {
        case 'quotations':
          return <QuotationsManager />;
        case 'controls-pricing':
          return <ControlsPricing />;
        case 'tracking-monitor':
          return <TrackingMonitor />;
        case 'executives':
          return <Executives />;
        case 'catalogs/companies':
          return <Companies />;
        case 'customers':
          return <Customers onNavigate={handleNavigate} />;
        case 'suppliers':
          return <Suppliers onNavigate={handleNavigate}/>;
        case 'catalogs/imo':
          return <CatalogIMO />;
        case 'catalogs/incoterms':
          return <CatalogIncoterms />;
        case 'catalogs/services':
          return <CatalogServices />;
        case 'catalogs/status':
          return <CatalogStatus />;
        case 'catalogs/request-types':
          return <CatalogRequestTypes />;
        case 'catalogs/countries':
          return <CatalogCountries />;
        case 'catalogs/users':
          return <CatalogUsers />;
        case 'catalogs/sector-of-business':
          return <CatalogSectorOfBusiness />;
        case 'dashboard':
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
          );
        default:
          return (
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1)}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                This module is coming soon...
              </p>
            </div>
          );
      }
    };

    return (
      <Layout currentRoute={currentRoute} onNavigate={handleNavigate}>
        {renderContent()}
      </Layout>
    );
  } catch (error) {
    console.error('App error:', error);
    return (
      <div className="min-h-screen bg-red-50 dark:bg-red-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h1>
          <p className="text-gray-700 dark:text-gray-300">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }
}

export default App;
