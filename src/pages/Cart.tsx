import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="pt-[72px] min-h-[100dvh] flex items-center justify-center">
        <div className="text-center py-20">
          <ShoppingBag size={48} className="mx-auto text-[#6B6B6B] mb-4" />
          <h1 className="font-display text-h3 text-[#1A1A1A] mb-2">Tu carrito esta vacio</h1>
          <p className="font-body text-[#6B6B6B] mb-6">Agrega productos para comenzar tu compra.</p>
          <Link to="/shop" className="btn-primary inline-block">
            VER PRODUCTOS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[72px] min-h-[100dvh]">
      <div className="content-max-width py-8 md:py-16">
        <h1 className="font-display text-h3 text-[#1A1A1A] mb-6">CARRITO</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex gap-4 p-4 border border-[#F0F0F0] bg-white"
              >
                <div className="w-24 h-32 bg-[#F5F5F5] overflow-hidden shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-body text-sm font-medium text-[#1A1A1A]">
                      {item.name}
                    </h3>
                    <p className="font-body text-xs text-[#6B6B6B] mt-0.5">
                      Talle: {item.size}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.quantity - 1)
                        }
                        className="w-8 h-8 border border-[#E5E5E5] flex items-center justify-center hover:border-[#6F1219] transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-body text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.quantity + 1)
                        }
                        className="w-8 h-8 border border-[#E5E5E5] flex items-center justify-center hover:border-[#6F1219] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-body font-medium text-[#6F1219]">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        className="text-[#6B6B6B] hover:text-[#EF4444] transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border border-[#F0F0F0] p-6 h-fit">
            <h2 className="font-display text-xl text-[#1A1A1A] mb-4">Resumen</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between font-body text-sm">
                <span className="text-[#6B6B6B]">Subtotal</span>
                <span className="text-[#1A1A1A]">${getTotalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-[#6B6B6B]">Envio</span>
                <span className="text-[#22C55E]">Gratis</span>
              </div>
            </div>
            <div className="border-t border-[#F0F0F0] pt-4 mb-6">
              <div className="flex justify-between font-body font-medium">
                <span>Total</span>
                <span className="text-[#6F1219]">${getTotalPrice().toLocaleString()}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full h-[52px] bg-[#6F1219] text-white font-body text-sm font-medium uppercase tracking-[1px] text-center leading-[52px] hover:bg-[#5A0E14] transition-colors mb-3"
            >
              FINALIZAR COMPRA
            </Link>
            <button
              onClick={clearCart}
              className="block w-full h-[44px] border border-[#E5E5E5] text-[#6B6B6B] font-body text-xs uppercase tracking-[1px] text-center hover:border-[#EF4444] hover:text-[#EF4444] transition-colors"
            >
              VACIAR CARRITO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
