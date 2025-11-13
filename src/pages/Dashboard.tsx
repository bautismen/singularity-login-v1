import React from 'react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export function Dashboard() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t('nav.dashboard')}
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
    </Layout>
  );
}
