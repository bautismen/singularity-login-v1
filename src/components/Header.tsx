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
    <header className={styles.header}>
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
