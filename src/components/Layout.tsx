import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
//import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute?: string;
  onNavigate?: (route: string) => void;
}

export function Layout({ children, currentRoute, onNavigate }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout">
      <Sidebar onCollapsedChange={setCollapsed} currentRoute={currentRoute} onNavigate={onNavigate} />
      <div className={`mainContainer ${collapsed ? "collapsed" : "expanded"}`}>
        <Header />
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}
