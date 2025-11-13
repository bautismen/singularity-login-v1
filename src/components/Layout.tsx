import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar onCollapsedChange={setCollapsed} />
      <div className={`${styles.mainContainer} ${collapsed ? styles.collapsed : styles.expanded}`}>
        <Header />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
