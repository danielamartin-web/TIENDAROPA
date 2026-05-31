import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard' },
  { icon: Package, label: 'Productos', to: '/admin/products' },
  { icon: ShoppingCart, label: 'Pedidos', to: '/admin/orders' },
  { icon: Settings, label: 'Configuracion', to: '/admin/settings' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'bg-[#0F0F0F] border-r border-[#2A2A2A] flex flex-col transition-all duration-300 h-full',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#2A2A2A]">
        <div className={cn('overflow-hidden', collapsed && 'w-0 opacity-0')}>
          <Link to="/admin/dashboard" className="flex flex-col">
            <span className="font-display text-xl text-white tracking-wide whitespace-nowrap">
              MARDA
            </span>
            <span className="font-body text-[11px] text-[#6B6B6B] uppercase tracking-wider whitespace-nowrap">
              Admin
            </span>
          </Link>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-white hover:bg-[#2A2A2A] transition-colors flex-shrink-0"
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-3 font-body text-sm rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-[#6F1219]/15 text-white border-l-[3px] border-[#6F1219]'
                  : 'text-[#A1A1A1] hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-[#2A2A2A]">
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 px-3 py-3 font-body text-sm text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors w-full',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Salir' : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Salir</span>}
        </button>
      </div>
    </aside>
  );
}
