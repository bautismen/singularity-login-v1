import React, { useState } from 'react';
import { Search, Globe, Moon, Sun, LogOut, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-gradient-to-r from-[#1a8fa4] to-[#1c9bab] dark:from-[#167888] dark:to-[#188997] text-white shadow-lg border-b border-[#1a8fa4]">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <img src="/logo_png_small 1.png" alt="Singularity" className="h-10 w-auto object-contain" />
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-white text-opacity-70" size={18} />
            <input
              type="text"
              placeholder={t('header.search')}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:bg-opacity-30 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors flex items-center gap-1"
              title="Toggle language"
            >
              <Globe size={18} />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>

          <div className="h-8 w-px bg-white bg-opacity-20"></div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <User size={16} />
              </div>
              <span className="text-sm font-medium hidden sm:block">{user?.email?.split('@')[0]}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <User size={16} />
                  <span>{t('header.profile')}</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-200 dark:border-gray-700"
                >
                  <LogOut size={16} />
                  <span>{t('header.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
