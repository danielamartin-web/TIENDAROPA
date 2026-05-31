import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="min-h-[100dvh] bg-[#0F0F0F] text-white">
      {/* Admin Header */}
      <header className="h-16 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl tracking-wide">MARDA</span>
          <span className="font-body text-xs text-[#6B6B6B] uppercase tracking-wider">
            Admin
          </span>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex items-center gap-2 text-[#6B6B6B] hover:text-white transition-colors font-body text-sm"
        >
          <LogOut size={16} />
          Salir
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] min-h-[calc(100dvh-64px)] hidden md:block">
          <nav className="p-4 space-y-1">
            {[
              { icon: BarChart3, label: 'Dashboard', to: '/admin/dashboard', active: true },
              { icon: Package, label: 'Productos', to: '/admin/products' },
              { icon: ShoppingCart, label: 'Pedidos', to: '/admin/orders' },
              { icon: Settings, label: 'Configuracion', to: '/admin/settings' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 font-body text-sm rounded-lg transition-colors ${
                  item.active
                    ? 'bg-[#6F1219]/15 text-white border-l-[3px] border-[#6F1219]'
                    : 'text-[#6B6B6B] hover:text-white hover:bg-[#2A2A2A]'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <h1 className="font-display text-2xl mb-6">Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Productos', value: '12', icon: Package },
              { label: 'Pedidos', value: '0', icon: ShoppingCart },
              { label: 'Visitas', value: '124', icon: BarChart3 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-sm text-[#6B6B6B]">{stat.label}</span>
                  <stat.icon size={18} className="text-[#6F1219]" />
                </div>
                <span className="font-mono text-2xl text-white">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-5">
            <h2 className="font-display text-lg mb-4">Acciones rapidas</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/products"
                className="px-5 py-2.5 bg-[#6F1219] text-white font-body text-sm rounded-lg hover:bg-[#5A0E14] transition-colors"
              >
                Gestionar productos
              </Link>
              <Link
                to="/admin/settings"
                className="px-5 py-2.5 border border-[#2A2A2A] text-white font-body text-sm rounded-lg hover:bg-[#2A2A2A] transition-colors"
              >
                Configuracion
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
