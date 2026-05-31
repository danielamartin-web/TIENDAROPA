import { Link } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';

export default function CustomerDashboard() {
  return (
    <div className="pt-[72px] min-h-[100dvh]">
      <div className="content-max-width py-8 md:py-16">
        <h1 className="font-display text-h3 text-[#1A1A1A] mb-6">MI CUENTA</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders */}
          <div className="border border-[#F0F0F0] p-6">
            <Package size={28} className="text-[#6F1219] mb-3" />
            <h3 className="font-display text-lg text-[#1A1A1A] mb-1">Mis Pedidos</h3>
            <p className="font-body text-sm text-[#6B6B6B] mb-4">
              Ver historial de pedidos
            </p>
            <p className="font-body text-sm text-[#6B6B6B]">
              No tenes pedidos todavia.
            </p>
          </div>

          {/* Shop */}
          <Link
            to="/shop"
            className="border border-[#F0F0F0] p-6 hover:border-[#6F1219] transition-colors group"
          >
            <ShoppingBag size={28} className="text-[#6F1219] mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-display text-lg text-[#1A1A1A] mb-1">Ir de compras</h3>
            <p className="font-body text-sm text-[#6B6B6B]">
              Explorar productos
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
