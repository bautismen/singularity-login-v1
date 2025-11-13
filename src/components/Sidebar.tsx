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
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-56'
      } bg-[#16293a] dark:bg-[#0f1e2b] text-white transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen border-r border-[#1e3548] z-40`}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && <span className="font-bold text-lg">Singularity</span>}
        <button
          onClick={handleCollapse}
          className="p-2 hover:bg-[#1e3548] rounded-lg transition-colors"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {menuItems.map(({ key, icon: Icon }) => (
          <button
            key={key}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#1e3548] transition-colors group text-gray-200 hover:text-white"
            title={collapsed ? t(key) : ''}
          >
            <Icon size={20} />
            {!collapsed && <span>{t(key)}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1e3548] space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#1e3548] transition-colors text-sm text-gray-200 hover:text-white">
          <Cog size={18} />
          {!collapsed && <span>{t('nav.settings')}</span>}
        </button>
      </div>
    </aside>
  );
}
