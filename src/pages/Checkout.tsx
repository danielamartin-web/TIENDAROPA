import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants';
import { CheckCircle } from 'lucide-react';

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  if (items.length === 0 && !submitted) {
    return (
      <div className="pt-[72px] min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-h3 text-[#1A1A1A] mb-4">Carrito vacio</h1>
          <Link to="/shop" className="btn-primary inline-block">
            VER PRODUCTOS
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="pt-[72px] min-h-[100dvh] flex items-center justify-center">
        <div className="text-center py-20">
          <CheckCircle size={56} className="mx-auto text-[#22C55E] mb-4" />
          <h1 className="font-display text-h3 text-[#1A1A1A] mb-2">
            Pedido enviado por WhatsApp
          </h1>
          <p className="font-body text-[#6B6B6B] mb-6">
            Te contactaremos para confirmar tu pedido.
          </p>
          <Link to="/" className="btn-primary inline-block">
            VOLVER AL INICIO
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productList = items
      .map(
        (i) =>
          `- ${i.name} (Talle: ${i.size}) x${i.quantity} = $${(i.price * i.quantity).toLocaleString()}`
      )
      .join('\n');

    const message = `Hola MARDA! Quiero hacer un pedido:\n\n${productList}\n\n*Total: $${getTotalPrice().toLocaleString()}*\n\n*Nombre:* ${formData.name}\n*Telefono:* ${formData.phone}\n*Direccion:* ${formData.address}${formData.notes ? `\n*Notas:* ${formData.notes}` : ''}`;

    const url = `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    clearCart();
    setSubmitted(true);
  };

  return (
    <div className="pt-[72px] min-h-[100dvh]">
      <div className="content-max-width py-8 md:py-16">
        <h1 className="font-display text-h3 text-[#1A1A1A] mb-6">CHECKOUT</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-body text-sm font-medium text-[#1A1A1A] mb-1 block">
                Nombre completo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-[52px] px-4 border border-[#E5E5E5] font-body text-sm focus:outline-none focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] transition-all"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-[#1A1A1A] mb-1 block">
                Telefono *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-[52px] px-4 border border-[#E5E5E5] font-body text-sm focus:outline-none focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] transition-all"
                placeholder="+54 9 11 1234 5678"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-[#1A1A1A] mb-1 block">
                Direccion de envio *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full h-[52px] px-4 border border-[#E5E5E5] font-body text-sm focus:outline-none focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] transition-all"
                placeholder="Calle, numero, ciudad"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-[#1A1A1A] mb-1 block">
                Notas adicionales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full h-24 px-4 py-3 border border-[#E5E5E5] font-body text-sm focus:outline-none focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] transition-all resize-none"
                placeholder="Indicaciones especiales..."
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-4">
              ENVIAR PEDIDO POR WHATSAPP
            </button>
          </form>

          {/* Order summary */}
          <div className="border border-[#F0F0F0] p-6 h-fit">
            <h2 className="font-display text-xl text-[#1A1A1A] mb-4">Tu pedido</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex justify-between font-body text-sm"
                >
                  <span className="text-[#1A1A1A]">
                    {item.name} x{item.quantity} ({item.size})
                  </span>
                  <span className="text-[#6B6B6B]">
                    ${(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#F0F0F0] pt-4">
              <div className="flex justify-between font-body font-medium text-lg">
                <span>Total</span>
                <span className="text-[#6F1219]">${getTotalPrice().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
