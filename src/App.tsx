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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Dashboard
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 mb-4"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Card {i}
                    </h3>
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">0</p>
                  </div>
                ))}
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
