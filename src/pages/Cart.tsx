import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { getProductById } from '@/data/products';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  MessageCircle,
  Tag,
  ChevronRight,
  Package,
} from 'lucide-react';
import { formatPrice, DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants';
import type { CartItem } from '@/store/cartStore';

/* ------------------------------------------------------------------ */
/*  Formatter helpers                                                  */
/* ------------------------------------------------------------------ */

function getWhatsAppCartUrl(items: CartItem[], total: number): string {
  const lines = items
    .map(
      (i) =>
        `- ${i.name} (Talle: ${i.size}) x${i.quantity} — ${formatPrice(i.price * i.quantity)}`
    )
    .join('\n');

  const message =
    `¡Hola MARDA! 👋\nQuiero hacer un pedido:\n\n${lines}\n\n` +
    `💰 Total: ${formatPrice(total)}\n📦 Envío: Gratis`;

  return `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ------------------------------------------------------------------ */
/*  Promotion / coupon helpers                                        */
/* ------------------------------------------------------------------ */

interface PromoCode {
  code: string;
  discount: number; // percentage, e.g. 10 = 10%
  type: 'percentage';
}

const VALID_PROMOS: PromoCode[] = [
  { code: 'MARDA10', discount: 10, type: 'percentage' },
  { code: 'BIENVENIDO', discount: 15, type: 'percentage' },
];

/* ------------------------------------------------------------------ */
/*  Cart page                                                          */
/* ------------------------------------------------------------------ */

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  const subtotal = getTotalPrice();
  const shippingThreshold = 30000;
  const freeShipping = subtotal >= shippingThreshold;
  const shippingCost = freeShipping ? 0 : 2500;

  const discountAmount = promoApplied
    ? Math.round(subtotal * (promoApplied.discount / 100))
    : 0;

  const total = subtotal + shippingCost - discountAmount;

  const handleRemove = (productId: number, size: string) => {
    const key = `${productId}-${size}`;
    setRemovingId(key);
    setTimeout(() => {
      removeItem(productId, size);
      setRemovingId(null);
    }, 300);
  };

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    const trimmed = promoCode.trim().toUpperCase();
    if (!trimmed) return;

    const found = VALID_PROMOS.find((p) => p.code === trimmed);
    if (found) {
      setPromoApplied(found);
      setPromoSuccess(`¡Codigo aplicado! ${found.discount}% de descuento`);
    } else {
      setPromoApplied(null);
      setPromoError('Codigo invalido o expirado');
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(null);
    setPromoCode('');
    setPromoError('');
    setPromoSuccess('');
  };

  /* -------------------- Empty state -------------------- */

  if (items.length === 0) {
    return (
      <main className="pt-[72px] min-h-[100dvh] bg-[#FAFAFA]">
        <div className="content-max-width py-12 md:py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-6 md:mb-8">
            <Link
              to="/"
              className="font-body text-xs text-[#6B6B6B] hover:text-[#6F1219] transition-colors"
            >
              Inicio
            </Link>
            <ChevronRight size={12} className="text-[#6B6B6B]" />
            <span className="font-body text-xs text-[#1A1A1A]">Carrito</span>
          </nav>

          <div
            className={`flex flex-col items-center justify-center text-center transition-all duration-700 ${
              animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-[#F0F0F0] flex items-center justify-center mb-6">
              <ShoppingCart size={40} className="text-[#C5C5C5]" />
            </div>
            <h1 className="font-display text-h4 text-[#6B6B6B] mb-3">
              Tu carrito esta vacio
            </h1>
            <p className="font-body text-sm text-[#6B6B6B] mb-8 max-w-xs">
              Agrega productos para comenzar tu compra
            </p>
            <Link to="/shop" className="btn-primary">
              IR A COMPRAR
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* -------------------- Cart with items -------------------- */

  return (
    <main className="pt-[72px] min-h-[100dvh] bg-[#FAFAFA]">
      <div className="content-max-width py-6 md:py-10 pb-32 md:pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-4 md:mb-6">
          <Link
            to="/"
            className="font-body text-xs text-[#6B6B6B] hover:text-[#6F1219] transition-colors"
          >
            Inicio
          </Link>
          <ChevronRight size={12} className="text-[#6B6B6B]" />
          <span className="font-body text-xs text-[#1A1A1A]">Carrito</span>
        </nav>

        {/* Header */}
        <div
          className={`mb-6 md:mb-8 transition-all duration-700 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h1 className="font-display text-h3 text-[#1A1A1A] mb-1">
            TU CARRITO
          </h1>
          <p className="font-body text-sm text-[#6B6B6B]">
            {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          {/* ---------- Items column ---------- */}
          <div className="lg:col-span-3 space-y-0">
            {items.map((item, index) => {
              const key = `${item.productId}-${item.size}`;
              const isRemoving = removingId === key;
              const product = getProductById(item.productId);
              const originalPrice = product?.originalPrice ?? null;

              return (
                <div
                  key={key}
                  className={`flex gap-3 md:gap-5 py-5 border-b border-[#E5E5E5] transition-all duration-500 ${
                    animateIn
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-8'
                  } ${isRemoving ? 'opacity-0 translate-x-12 scale-95' : ''}`}
                  style={{
                    transitionDelay: animateIn ? `${index * 100}ms` : '0ms',
                    transitionDuration: isRemoving ? '300ms' : '700ms',
                  }}
                >
                  {/* Product image */}
                  <div className="w-[80px] h-[110px] md:w-[100px] md:h-[130px] bg-[#F0F0F0] shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} className="text-[#C5C5C5]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-body text-sm md:text-base font-medium text-[#1A1A1A] truncate">
                          {item.name}
                        </h3>
                        <p className="font-body text-xs md:text-[13px] text-[#6B6B6B] mt-0.5">
                          Talla: {item.size}
                        </p>
                        {originalPrice && originalPrice > item.price && (
                          <p className="font-body text-xs text-[#6B6B6B] line-through mt-0.5">
                            {formatPrice(originalPrice)}
                          </p>
                        )}
                        <p className="font-body text-sm text-[#6F1219] font-medium mt-0.5">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(item.productId, item.size)}
                        className="p-1.5 text-[#6B6B6B] hover:text-[#EF4444] transition-colors shrink-0"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Quantity + Subtotal row */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-0">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          className="w-9 h-9 border border-[#E5E5E5] flex items-center justify-center hover:border-[#6F1219] transition-colors bg-white"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 h-9 flex items-center justify-center font-body text-sm text-[#1A1A1A] border-y border-[#E5E5E5]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          className="w-9 h-9 border border-[#E5E5E5] flex items-center justify-center hover:border-[#6F1219] transition-colors bg-white"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="font-body text-sm md:text-base font-semibold text-[#1A1A1A]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Clear cart link */}
            <div className="pt-4">
              <button
                onClick={clearCart}
                className="font-body text-xs text-[#6B6B6B] underline hover:text-[#EF4444] transition-colors"
              >
                Vaciar carrito
              </button>
            </div>
          </div>

          {/* ---------- Summary sidebar ---------- */}
          <div className="lg:col-span-2">
            <div
              className={`bg-white border border-[#E5E5E5] p-5 md:p-8 lg:sticky lg:top-[100px] transition-all duration-700 ${
                animateIn
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-8'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <h2 className="font-body text-sm font-medium uppercase tracking-[2px] text-[#1A1A1A] mb-5">
                RESUMEN
              </h2>

              {/* Promo code */}
              <div className="mb-5">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
                    />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      placeholder="Codigo de descuento"
                      disabled={!!promoApplied}
                      className="w-full h-[44px] pl-9 pr-3 border border-[#E5E5E5] font-body text-sm placeholder:text-[#999] focus:outline-none focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] transition-all disabled:bg-[#F5F5F5] disabled:text-[#6B6B6B]"
                    />
                  </div>
                  {promoApplied ? (
                    <button
                      onClick={handleRemovePromo}
                      className="h-[44px] px-4 border border-[#EF4444] text-[#EF4444] font-body text-xs uppercase tracking-[1px] hover:bg-[#EF4444] hover:text-white transition-colors"
                    >
                      Quitar
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyPromo}
                      className="h-[44px] px-4 border border-[#1A1A1A] text-[#1A1A1A] font-body text-xs uppercase tracking-[1px] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                    >
                      Aplicar
                    </button>
                  )}
                </div>
                {promoError && (
                  <p className="font-body text-xs text-[#EF4444] mt-2">
                    {promoError}
                  </p>
                )}
                {promoSuccess && (
                  <p className="font-body text-xs text-[#22C55E] mt-2">
                    {promoSuccess}
                  </p>
                )}
              </div>

              {/* Calculations */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-[#6B6B6B]">Subtotal</span>
                  <span className="text-[#1A1A1A]">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between font-body text-sm">
                  <span className="text-[#6B6B6B]">Envio</span>
                  {freeShipping ? (
                    <span className="text-[#22C55E] font-medium">
                      Envio gratis
                    </span>
                  ) : (
                    <div className="text-right">
                      <span className="text-[#1A1A1A]">
                        {formatPrice(shippingCost)}
                      </span>
                      <p className="font-body text-[11px] text-[#6B6B6B] mt-0.5">
                        Gratis en compras mayores a{' '}
                        {formatPrice(shippingThreshold)}
                      </p>
                    </div>
                  )}
                </div>

                {promoApplied && discountAmount > 0 && (
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-[#22C55E]">
                      Descuento ({promoApplied.discount}%)
                    </span>
                    <span className="text-[#22C55E] font-medium">
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Divider + Total */}
              <div className="border-t border-[#E5E5E5] pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-body text-base font-medium text-[#1A1A1A]">
                    Total
                  </span>
                  <span className="font-body text-xl md:text-2xl font-semibold text-[#1A1A1A]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full h-[52px] bg-[#6F1219] text-white font-body text-sm font-medium uppercase tracking-[1px] hover:bg-[#5A0E14] hover:-translate-y-0.5 hover:shadow-burgundy transition-all mb-3"
              >
                Finalizar Compra
              </button>

              <a
                href={getWhatsAppCartUrl(items, total)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-[48px] border border-[#25D366] text-[#25D366] font-body text-sm font-medium uppercase tracking-[1px] flex items-center justify-center gap-2 hover:bg-[#25D366] hover:text-white transition-all mb-3"
              >
                <MessageCircle size={18} />
                Comprar por WhatsApp
              </a>

              <button
                onClick={() => navigate('/shop')}
                className="w-full h-[44px] border border-[#E5E5E5] text-[#6B6B6B] font-body text-xs uppercase tracking-[1px] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
              >
                Seguir Comprando
              </button>

              {/* Payment methods note */}
              <div className="mt-5 pt-4 border-t border-[#F0F0F0] text-center">
                <p className="font-body text-[11px] text-[#6B6B6B]">
                  Paga de forma segura
                </p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className="font-body text-[10px] text-[#999] uppercase tracking-wider">
                    MercadoPago
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#D5D5D5]" />
                  <span className="font-body text-[10px] text-[#999] uppercase tracking-wider">
                    Tarjetas
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#D5D5D5]" />
                  <span className="font-body text-[10px] text-[#999] uppercase tracking-wider">
                    Transferencia
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Mobile sticky bottom bar ---------- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] p-4 md:hidden z-40">
        <div className="flex items-center justify-between mb-3">
          <span className="font-body text-sm text-[#6B6B6B]">Total</span>
          <span className="font-body text-lg font-semibold text-[#1A1A1A]">
            {formatPrice(total)}
          </span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full h-[48px] bg-[#6F1219] text-white font-body text-sm font-medium uppercase tracking-[1px] hover:bg-[#5A0E14] transition-colors"
        >
          Finalizar Compra
        </button>
      </div>
    </main>
  );
}
