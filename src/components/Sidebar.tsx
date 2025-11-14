import React, { useState } from 'react';
import {
  Menu,
  X,
  Layout,
  FileText,
  Truck,
  Users,
  Cog,
  BarChart3,
  FileCheck,
  Zap,
  UserCheck,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Sidebar.module.css';

const menuItems = [
  { key: 'nav.dashboard', icon: Layout, route: 'dashboard' },
  { key: 'nav.quotations', icon: FileCheck, route: 'quotations' },
  { key: 'nav.executives', icon: UserCheck, route: 'executives' },
  { key: 'nav.shipments', icon: Truck, route: 'shipments' },
  { key: 'nav.customers', icon: Users, route: 'customers' },
  { key: 'nav.operations', icon: Zap, route: 'operations' },
  { key: 'nav.documents', icon: FileText, route: 'documents' },
  { key: 'nav.analytics', icon: BarChart3, route: 'analytics' },
];

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
  currentRoute?: string;
  onNavigate?: (route: string) => void;
}

export function Sidebar({ onCollapsedChange, currentRoute = 'dashboard', onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();

  const handleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : styles.expanded}`}>
      <div className={styles.sidebarHeader}>
        {!collapsed && <span className={styles.logo}>Singularity</span>}
        <button onClick={handleCollapse} className={styles.collapseButton}>
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map(({ key, icon: Icon, route }) => (
          <button
            key={key}
            onClick={() => onNavigate?.(route)}
            className={`${styles.navButton} ${currentRoute === route ? styles.active : ''}`}
            title={collapsed ? t(key) : ''}
          >
            <Icon size={20} />
            {!collapsed && <span>{t(key)}</span>}
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        <button
          onClick={() => onNavigate?.('settings')}
          className={`${styles.footerButton} ${currentRoute === 'settings' ? styles.active : ''}`}
        >
          <Cog size={18} />
          {!collapsed && <span>{t('nav.settings')}</span>}
        </button>
      </div>
    </aside>
  );
}
