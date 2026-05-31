import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { products } from '@/data/products';
import { Package, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

export default function AdminProducts() {
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
              { icon: Plus, label: 'Productos', to: '/admin/products', active: true },
              { icon: Edit, label: 'Pedidos', to: '/admin/orders' },
              { icon: Trash2, label: 'Configuracion', to: '/admin/settings' },
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl">Productos</h1>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#6F1219] text-white font-body text-sm rounded-lg hover:bg-[#5A0E14] transition-colors">
              <Plus size={16} />
              Nuevo producto
            </button>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2A2A]">
                    <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider text-[#6B6B6B]">ID</th>
                    <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider text-[#6B6B6B]">Nombre</th>
                    <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider text-[#6B6B6B]">Categoria</th>
                    <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider text-[#6B6B6B]">Precio</th>
                    <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider text-[#6B6B6B]">Stock</th>
                    <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-wider text-[#6B6B6B]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-[#2A2A2A]/50 hover:bg-[#2A2A2A]/30">
                      <td className="px-4 py-3 font-mono text-sm text-[#6B6B6B]">#{product.id}</td>
                      <td className="px-4 py-3 font-body text-sm">{product.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-[#6F1219]/20 text-[#D4A574] font-body text-xs rounded">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        ${product.price.toLocaleString()}
                        {product.originalPrice && (
                          <span className="text-[#6B6B6B] line-through ml-2">
                            ${product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-body text-xs ${product.inStock ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                          {product.inStock ? 'Disponible' : 'Sin stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 text-[#6B6B6B] hover:text-white transition-colors">
                            <Edit size={14} />
                          </button>
                          <button className="p-1.5 text-[#6B6B6B] hover:text-[#EF4444] transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
