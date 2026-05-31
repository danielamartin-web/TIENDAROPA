import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ShoppingCart, Package, ArrowLeft } from 'lucide-react';

export default function AdminOrders() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) navigate('/admin/login');
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="min-h-[100dvh] bg-[#0F0F0F] text-white">
      <header className="h-16 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-[#6B6B6B] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-display text-xl tracking-wide">MARDA</span>
          <span className="font-body text-xs text-[#6B6B6B] uppercase tracking-wider">Admin</span>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] min-h-[calc(100dvh-64px)] hidden md:block">
          <nav className="p-4 space-y-1">
            {[
              { icon: Package, label: 'Dashboard', to: '/admin/dashboard' },
              { icon: Package, label: 'Productos', to: '/admin/products' },
              { icon: ShoppingCart, label: 'Pedidos', to: '/admin/orders', active: true },
              { icon: Package, label: 'Configuracion', to: '/admin/settings' },
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

        <main className="flex-1 p-6">
          <h1 className="font-display text-2xl mb-6">Pedidos</h1>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-8 text-center">
            <ShoppingCart size={48} className="mx-auto text-[#6B6B6B] mb-4" />
            <p className="font-body text-[#6B6B6B]">No hay pedidos registrados todavia.</p>
            <p className="font-body text-sm text-[#6B6B6B] mt-2">
              Los pedidos llegan por WhatsApp y se guardan automaticamente.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
