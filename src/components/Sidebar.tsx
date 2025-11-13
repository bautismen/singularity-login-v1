import React, { useState } from 'react';
import {
  Menu,
  X,
  Layout,
  Truck,
  Users,
  Cog,
  BarChart3,
  FileText,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Sidebar.module.css';

const menuItems = [
  { key: 'nav.dashboard', icon: Layout },
  { key: 'nav.shipments', icon: Truck },
  { key: 'nav.customers', icon: Users },
  { key: 'nav.operations', icon: Zap },
  { key: 'nav.documents', icon: FileText },
  { key: 'nav.analytics', icon: BarChart3 },
  { key: 'nav.settings', icon: Cog },
];

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ onCollapsedChange }: SidebarProps) {
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
        {menuItems.map(({ key, icon: Icon }) => (
          <button
            key={key}
            className={styles.navButton}
            title={collapsed ? t(key) : ''}
          >
            <Icon size={20} />
            {!collapsed && <span>{t(key)}</span>}
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.footerButton}>
          <Cog size={18} />
          {!collapsed && <span>{t('nav.settings')}</span>}
        </button>
      </div>
    </aside>
  );
}
