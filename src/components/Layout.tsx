import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute?: string;
  onNavigate?: (route: string) => void;
}

export function Layout({ children, currentRoute, onNavigate }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar onCollapsedChange={setCollapsed} currentRoute={currentRoute} onNavigate={onNavigate} />
      <div className={`${styles.mainContainer} ${collapsed ? styles.collapsed : styles.expanded}`}>
        <Header />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
