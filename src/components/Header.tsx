import React, { useState } from 'react';
import { Search, Globe, Moon, Sun, LogOut, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import styles from './Header.module.css';

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="text-white shadow-md border-b border-[#1a8fa4] bg-[linear-gradient(90deg,rgba(3,115,140,1)_0%,rgba(3,127,140,1)_40%,rgba(3,140,127,1)_100%)]
                                                dark:border-[#002d47] dark:bg-[linear-gradient(90deg,rgba(0,45,71,1)_0%,rgba(0,61,80,1)_40%,rgba(0,69,84,1)_100%)]">
      <div className={styles.headerContent}>
        <div className={styles.leftSection}>
          <img src="/logo_png_small_1.png" alt="Singularity" className={styles.logo} />
        </div>

        <div className={styles.rightSection}>
          <div className={styles.controls}>
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className={styles.languageButton}
              title="Toggle language"
            >
              <Globe size={18} />
              <span className={styles.languageText}>{language.toUpperCase()}</span>
            </button>

            <button
              onClick={toggleTheme}
              className={styles.themeButton}
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.userMenuWrapper}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={styles.userButton}
            >
              <div className={styles.userAvatar}>
                <User size={16} />
              </div>
              <span className={styles.userName}>{user?.email?.split('@')[0]}</span>
            </button>

            {showUserMenu && (
              <div className={styles.userMenu}>
                <div className={styles.userMenuHeader}>
                  <p className={styles.userEmail}>{user?.email}</p>
                </div>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className={styles.menuButton}
                >
                  <User size={16} />
                  <span>{t('header.profile')}</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className={`${styles.menuButton} ${styles.logout}`}
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
