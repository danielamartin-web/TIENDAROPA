import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCartStore } from '@/store/cartStore';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  MessageCircle,
  Package,
  Truck,
  MapPin,
  User,
  Phone,
  Mail,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import {
  formatPrice,
  DEFAULT_WHATSAPP_NUMBER,
  STORE_NAME,
} from '@/lib/constants';
import type { CartItem } from '@/store/cartStore';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ShippingFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  deliveryMethod: 'standard' | 'express';
  notes: string;
}

interface SavedOrder {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  shipping: number;
  status: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    province: string;
    zipCode: string;
  };
  deliveryMethod: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PROVINCES = [
  'Buenos Aires',
  'Ciudad Autonoma de Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Cordoba',
  'Corrientes',
  'Entre Rios',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquen',
  'Rio Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucuman',
];

const SHIPPING_COST = 2500;
const SHIPPING_THRESHOLD = 30000;

/* ------------------------------------------------------------------ */
/*  Helper functions                                                   */
/* ------------------------------------------------------------------ */

function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `MARDA-${timestamp}${random}`;
}

function saveOrderToLocalStorage(order: SavedOrder): void {
  try {
    const existing = JSON.parse(
      localStorage.getItem('marda-orders') || '[]'
    ) as SavedOrder[];
    existing.unshift(order);
    localStorage.setItem('marda-orders', JSON.stringify(existing));
  } catch {
    // silently fail
  }
}

function buildWhatsAppMessage(
  items: CartItem[],
  subtotal: number,
  shipping: number,
  total: number,
  formData: ShippingFormData,
  orderId: string,
  deliveryMethod: string
): string {
  const itemLines = items
    .map(
      (i, idx) =>
        `${idx + 1}. ${i.name} (Talla: ${i.size}) x${i.quantity} - ${formatPrice(i.price * i.quantity)}`
    )
    .join('\n');

  const methodLabel = deliveryMethod === 'express' ? 'Express' : 'Standard';

  return (
    `Hola ${STORE_NAME}! 👋\n` +
    `Quiero hacer un pedido:\n\n` +
    `${itemLines}\n\n` +
    `💰 Subtotal: ${formatPrice(subtotal)}\n` +
    `📦 Envio: ${shipping === 0 ? 'Gratis' : formatPrice(shipping)} (${methodLabel})\n` +
    `💰 Total: ${formatPrice(total)}\n\n` +
    `Mis datos:\n` +
    `👤 Nombre: ${formData.fullName}\n` +
    `📱 WhatsApp: ${formData.phone}\n` +
    `📧 Email: ${formData.email}\n` +
    `📍 Direccion: ${formData.address}, ${formData.city}, ${formData.province}\n` +
    `📮 CP: ${formData.zipCode}${formData.notes ? `\n📝 Notas: ${formData.notes}` : ''}\n\n` +
    `Pedido: #${orderId}`
  );
}

/* ------------------------------------------------------------------ */
/*  Step indicator component                                           */
/* ------------------------------------------------------------------ */

function StepIndicator({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: { label: string }[];
}) {
  return (
    <div className="flex items-center justify-center mb-8 md:mb-10">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center">
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-body text-xs md:text-sm font-medium transition-all duration-300 ${
                index < currentStep
                  ? 'bg-[#22C55E] text-white'
                  : index === currentStep
                  ? 'bg-[#6F1219] text-white'
                  : 'bg-[#F0F0F0] text-[#6B6B6B]'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle size={18} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span
              className={`font-body text-[10px] md:text-xs mt-2 uppercase tracking-wider ${
                index === currentStep
                  ? 'text-[#6F1219] font-medium'
                  : 'text-[#6B6B6B]'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={`w-12 md:w-20 h-[2px] mx-2 md:mx-3 transition-all duration-300 ${
                index < currentStep ? 'bg-[#22C55E]' : 'bg-[#E5E5E5]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Checkout page                                                 */
/* ------------------------------------------------------------------ */

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState(0);
  const [orderId, setOrderId] = useState('');
  const [animateIn, setAnimateIn] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ShippingFormData>({
    mode: 'onChange',
    defaultValues: {
      deliveryMethod: 'standard',
    },
  });

  const formData = watch();

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Redirect if cart empty and not on confirmation
  if (items.length === 0 && step < 2) {
    return (
      <main className="pt-[72px] min-h-[100dvh] bg-[#FAFAFA]">
        <div className="content-max-width py-12 md:py-20">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#F0F0F0] flex items-center justify-center mb-5">
              <ShoppingBag size={32} className="text-[#C5C5C5]" />
            </div>
            <h1 className="font-display text-h4 text-[#1A1A1A] mb-3">
              Tu carrito esta vacio
            </h1>
            <p className="font-body text-sm text-[#6B6B6B] mb-6">
              Agrega productos para continuar con tu compra
            </p>
            <Link to="/shop" className="btn-primary">
              IR A LA TIENDA
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const subtotal = getTotalPrice();
  const freeShipping = subtotal >= SHIPPING_THRESHOLD;
  const shippingCost =
    formData.deliveryMethod === 'express'
      ? 4500
      : freeShipping
      ? 0
      : SHIPPING_COST;
  const total = subtotal + shippingCost;

  const steps = [
    { label: 'Envio' },
    { label: 'Confirmacion' },
  ];

  const onSubmitShipping = (_data: ShippingFormData) => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmOrder = () => {
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);

    // Save order to localStorage
    const order: SavedOrder = {
      id: newOrderId,
      date: new Date().toISOString(),
      items: [...items],
      total,
      shipping: shippingCost,
      status: 'Pendiente',
      customer: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        zipCode: formData.zipCode,
      },
      deliveryMethod: formData.deliveryMethod,
    };
    saveOrderToLocalStorage(order);

    // Open WhatsApp
    const message = buildWhatsAppMessage(
      items,
      subtotal,
      shippingCost,
      total,
      formData,
      newOrderId,
      formData.deliveryMethod
    );
    const url = `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    // Clear cart and move to confirmation
    clearCart();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ==================== STEP 2: CONFIRMATION ==================== */

  if (step === 2) {
    return (
      <main className="pt-[72px] min-h-[100dvh] bg-[#FAFAFA]">
        <div className="content-max-width py-12 md:py-20">
          <StepIndicator currentStep={2} steps={steps} />

          <div
            className={`max-w-lg mx-auto bg-white border border-[#E5E5E5] p-8 md:p-12 text-center transition-all duration-700 ${
              animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Success icon */}
            <div
              className="w-20 h-20 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-6"
              style={{
                animation: 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              <CheckCircle size={48} className="text-[#22C55E]" />
            </div>

            <h1
              className="font-display text-h3 text-[#1A1A1A] mb-3"
              style={{ animationDelay: '0.2s' }}
            >
              PEDIDO ENVIADO
            </h1>
            <p className="font-body text-base text-[#6B6B6B] mb-6">
              Tu pedido fue enviado por WhatsApp. Martin o Daniela se pondran en
              contacto con vos para confirmar.
            </p>

            {/* Order ID */}
            <div className="bg-[#FAFAFA] p-4 mb-6">
              <p className="font-body text-xs text-[#6B6B6B] uppercase tracking-wider mb-1">
                Numero de pedido
              </p>
              <p className="font-mono text-base text-[#1A1A1A] font-medium">
                #{orderId}
              </p>
            </div>

            {/* Order summary card */}
            <div className="bg-[#FAFAFA] p-5 text-left mb-6">
              <h3 className="font-body text-sm font-medium text-[#1A1A1A] mb-3">
                Resumen del pedido
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-[#6B6B6B]">Subtotal</span>
                  <span className="text-[#1A1A1A]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-[#6B6B6B]">Envio</span>
                  <span className={shippingCost === 0 ? 'text-[#22C55E]' : 'text-[#1A1A1A]'}>
                    {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="border-t border-[#E5E5E5] pt-2 flex justify-between font-body text-base font-medium">
                  <span className="text-[#1A1A1A]">Total</span>
                  <span className="text-[#6F1219]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Customer data summary */}
              <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                <p className="font-body text-xs text-[#6B6B6B] uppercase tracking-wider mb-2">
                  Datos de envio
                </p>
                <p className="font-body text-sm text-[#1A1A1A]">
                  {formData.fullName}
                </p>
                <p className="font-body text-sm text-[#6B6B6B]">
                  {formData.address}, {formData.city}, {formData.province}
                </p>
                <p className="font-body text-sm text-[#6B6B6B]">
                  CP: {formData.zipCode}
                </p>
              </div>
            </div>

            {/* WhatsApp button */}
            <a
              href={`https://wa.me/${DEFAULT_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-[52px] bg-[#25D366] text-white font-body text-sm font-medium uppercase tracking-[1px] flex items-center justify-center gap-2 hover:bg-[#1DA851] hover:-translate-y-0.5 hover:shadow-whatsapp transition-all mb-3"
            >
              <MessageCircle size={20} />
              Abrir WhatsApp
            </a>

            <Link
              to="/shop"
              className="w-full h-[44px] border border-[#1A1A1A] text-[#1A1A1A] font-body text-xs uppercase tracking-[1px] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ==================== MAIN RENDER ==================== */

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
          <Link
            to="/cart"
            className="font-body text-xs text-[#6B6B6B] hover:text-[#6F1219] transition-colors"
          >
            Carrito
          </Link>
          <ChevronRight size={12} className="text-[#6B6B6B]" />
          <span className="font-body text-xs text-[#1A1A1A]">Checkout</span>
        </nav>

        <h1 className="font-display text-h3 text-[#1A1A1A] mb-6 md:mb-8">
          CHECKOUT
        </h1>

        <StepIndicator currentStep={step} steps={steps} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          {/* ---------- Left column: form or review ---------- */}
          <div className="lg:col-span-3">
            {/* ===== STEP 0: Shipping form ===== */}
            {step === 0 && (
              <div
                className={`bg-white border border-[#E5E5E5] p-5 md:p-8 transition-all duration-700 ${
                  animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <h2 className="font-display text-h4 text-[#1A1A1A] mb-6">
                  Datos de Envio
                </h2>

                <form
                  onSubmit={handleSubmit(onSubmitShipping)}
                  className="space-y-4"
                >
                  {/* Full name */}
                  <div>
                    <label className="font-body text-sm font-medium text-[#1A1A1A] mb-1.5 flex items-center gap-1">
                      <User size={14} className="text-[#6B6B6B]" />
                      Nombre completo <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Martin Garcia"
                      className={`w-full h-[52px] px-4 border font-body text-sm placeholder:text-[#B0B0B0] focus:outline-none focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] transition-all ${
                        errors.fullName
                          ? 'border-[#EF4444]'
                          : 'border-[#E5E5E5]'
                      }`}
                      {...register('fullName', {
                        required: 'Este campo es obligatorio',
                        minLength: {
                          value: 3,
                          message: 'Minimo 3 caracteres',
                        },
                      })}
                    />
                    {errors.fullName && (
                      <p className="font-body text-xs text-[#EF4444] mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Phone + Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-sm font-medium text-[#1A1A1A] mb-1.5 flex items-center gap-1">
                        <Phone size={14} className="text-[#6B6B6B]" />
                        Telefono / WhatsApp{' '}
                        <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+54 11 1234-5678"
                        className={`w-full h-[52px] px-4 border font-body text-sm placeholder:text-[#B0B0B0] focus:outline-none focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] transition-all ${
                          errors.phone
                            ? 'border-[#EF4444]'
                            : 'border-[#E5E5E5]'
                        }`}
                        {...register('phone', {
                          required: 'Este campo es obligatorio',
                          pattern: {
                            value: /^[\d\s\-+()]{7,20}$/,
                            message: 'Numero invalido',
                          },
                        })}
                      />
                      {errors.phone && (
                        <p className="font-body text-xs text-[#EF4444] mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="font-body text-sm font-medium text-[#1A1A1A] mb-1.5 flex items-center gap-1">
                        <Mail size={14} className="text-[#6B6B6B]" />
                        Email <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="martin@email.com"
                        className={`w-full h-[52px] px-4 border font-body text-sm placeholder:text-[#B0B0B0] focus:outline-none focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] transition-all ${
                          errors.email
                            ? 'border-[#EF4444]'
                            : 'border-[#E5E5E5]'
                        }`}
                        {...register('email', {
                          required: 'Este campo es obligatorio',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Email invalido',
                          },
                        })}
                      />
                      {errors.email && (
                        <p className="font-body text-xs text-[#EF4444] mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="font-body text-sm font-medium text-[#1A1A1A] mb-1.5 flex items-center gap-1">
                      <MapPin size={14} className="text-[#6B6B6B]" />
                      Direccion <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Av. Corrientes 1234, Piso 2, Depto B"
                      className={`w-full h-[52px] px-4 border font-body text-sm placeholder:text-[#B0B0B0] focus:outline-none focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] transition-all ${
                        errors.address
                          ? 'border-[#EF4444]'
                          : 'border-[#E5E5E5]'
                      }`}
                      {...register('address', {
                        required: 'Este campo es obligatorio',
                        minLength: {
                          value: 5,
                          message: 'Minimo 5 caracteres',
                        },
                      })}
                    />
                    {errors.address && (
                      <p className="font-body text-xs text-[#EF4444] mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* City + ZIP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-sm font-medium text-[#1A1A1A] mb-1.5">
                        Ciudad <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Buenos Aires"
                        className={`w-full h-[52px] px-4 border font-body text-sm placeholder:text-[#B0B0B0] focus:outline-none focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] transition-all ${
                          errors.city
                            ? 'border-[#EF4444]'
                            : 'border-[#E5E5E5]'
                        }`}
                        {...register('city', {
                          required: 'Este campo es obligatorio',
                        })}
                      />
                      {errors.city && (
                        <p className="font-body text-xs text-[#EF4444] mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="font-body text-sm font-medium text-[#1A1A1A] mb-1.5">
                        Codigo Postal <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="C1043"
                        className={`w-full h-[52px] px-4 border font-body text-sm placeholder:text-[#B0B0B0] focus:outline-none focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] transition-all ${
                          errors.zipCode
                            ? 'border-[#EF4444]'
                            : 'border-[#E5E5E5]'
                        }`}
                        {...register('zipCode', {
                          required: 'Este campo es obligatorio',
                        })}
                      />
                      {errors.zipCode && (
                        <p className="font-body text-xs text-[#EF4444] mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.zipCode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Province select */}
                  <div>
                    <label className="font-body text-sm font-medium text-[#1A1A1A] mb-1.5">
                      Provincia <span className="text-[#EF4444]">*</span>
                    </label>
                    <select
                      className={`w-full h-[52px] px-4 border font-body text-sm focus:outline-none focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] transition-all appearance-none bg-white ${
                        errors.province
                          ? 'border-[#EF4444]'
                          : 'border-[#E5E5E5]'
                      }`}
                      {...register('province', {
                        required: 'Selecciona una provincia',
                      })}
                    >
                      <option value="">Seleccionar provincia</option>
                      {PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="font-body text-xs text-[#EF4444] mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.province.message}
                      </p>
                    )}
                  </div>

                  {/* Delivery method */}
                  <div>
                    <label className="font-body text-sm font-medium text-[#1A1A1A] mb-3 flex items-center gap-1">
                      <Truck size={14} className="text-[#6B6B6B]" />
                      Metodo de entrega
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${
                          formData.deliveryMethod === 'standard'
                            ? 'border-[#6F1219] bg-[#6F1219]/5'
                            : 'border-[#E5E5E5] hover:border-[#CCC]'
                        }`}
                      >
                        <input
                          type="radio"
                          value="standard"
                          className="sr-only"
                          {...register('deliveryMethod')}
                        />
                        <div className="flex-1">
                          <p className="font-body text-sm font-medium text-[#1A1A1A]">
                            Standard
                          </p>
                          <p className="font-body text-xs text-[#6B6B6B]">
                            {freeShipping
                              ? 'Envio gratis'
                              : `${formatPrice(SHIPPING_COST)}`}
                            {' — '}3 a 5 dias
                          </p>
                        </div>
                        {formData.deliveryMethod === 'standard' && (
                          <CheckCircle size={18} className="text-[#6F1219]" />
                        )}
                      </label>

                      <label
                        className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${
                          formData.deliveryMethod === 'express'
                            ? 'border-[#6F1219] bg-[#6F1219]/5'
                            : 'border-[#E5E5E5] hover:border-[#CCC]'
                        }`}
                      >
                        <input
                          type="radio"
                          value="express"
                          className="sr-only"
                          {...register('deliveryMethod')}
                        />
                        <div className="flex-1">
                          <p className="font-body text-sm font-medium text-[#1A1A1A]">
                            Express
                          </p>
                          <p className="font-body text-xs text-[#6B6B6B]">
                            {formatPrice(4500)} — 24 a 48hs
                          </p>
                        </div>
                        {formData.deliveryMethod === 'express' && (
                          <CheckCircle size={18} className="text-[#6F1219]" />
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="font-body text-sm font-medium text-[#1A1A1A] mb-1.5">
                      Notas adicionales{' '}
                      <span className="text-[#6B6B6B] font-normal">(opcional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Instrucciones de entrega, referencias, etc."
                      className="w-full px-4 py-3 border border-[#E5E5E5] font-body text-sm placeholder:text-[#B0B0B0] focus:outline-none focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] transition-all resize-none"
                      {...register('notes')}
                    />
                  </div>

                  {/* Submit button - desktop */}
                  <button
                    type="submit"
                    className="w-full h-[52px] bg-[#6F1219] text-white font-body text-sm font-medium uppercase tracking-[1px] hover:bg-[#5A0E14] hover:-translate-y-0.5 hover:shadow-burgundy transition-all mt-4"
                  >
                    Confirmar Pedido
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="w-full h-[44px] border border-[#E5E5E5] text-[#6B6B6B] font-body text-xs uppercase tracking-[1px] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={14} />
                    Volver al carrito
                  </button>
                </form>
              </div>
            )}

            {/* ===== STEP 1: Order review ===== */}
            {step === 1 && (
              <div
                className={`bg-white border border-[#E5E5E5] p-5 md:p-8 transition-all duration-700 ${
                  animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-h4 text-[#1A1A1A]">
                    Revisa tu pedido
                  </h2>
                  <button
                    onClick={() => setStep(0)}
                    className="font-body text-xs text-[#6B6B6B] hover:text-[#6F1219] transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft size={14} />
                    Editar datos
                  </button>
                </div>

                {/* Items list */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex gap-3 py-3 border-b border-[#F0F0F0] last:border-0"
                    >
                      <div className="w-16 h-20 bg-[#F0F0F0] shrink-0 overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={16} className="text-[#C5C5C5]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-body text-sm font-medium text-[#1A1A1A] truncate">
                          {item.name}
                        </h3>
                        <p className="font-body text-xs text-[#6B6B6B]">
                          Talla: {item.size} — x{item.quantity}
                        </p>
                        <p className="font-body text-sm font-medium text-[#6F1219] mt-1">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping data review */}
                <div className="bg-[#FAFAFA] p-4 mb-6">
                  <h3 className="font-body text-sm font-medium text-[#1A1A1A] mb-3">
                    Datos de envio
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-body text-sm">
                    <p className="text-[#6B6B6B]">
                      <span className="text-[#1A1A1A]">Nombre:</span>{' '}
                      {formData.fullName}
                    </p>
                    <p className="text-[#6B6B6B]">
                      <span className="text-[#1A1A1A]">Telefono:</span>{' '}
                      {formData.phone}
                    </p>
                    <p className="text-[#6B6B6B]">
                      <span className="text-[#1A1A1A]">Email:</span>{' '}
                      {formData.email}
                    </p>
                    <p className="text-[#6B6B6B]">
                      <span className="text-[#1A1A1A]">CP:</span>{' '}
                      {formData.zipCode}
                    </p>
                    <p className="text-[#6B6B6B] sm:col-span-2">
                      <span className="text-[#1A1A1A]">Direccion:</span>{' '}
                      {formData.address}, {formData.city},{' '}
                      {formData.province}
                    </p>
                    <p className="text-[#6B6B6B]">
                      <span className="text-[#1A1A1A]">Entrega:</span>{' '}
                      {formData.deliveryMethod === 'express'
                        ? 'Express (24-48hs)'
                        : 'Standard (3-5 dias)'}
                    </p>
                    {formData.notes && (
                      <p className="text-[#6B6B6B] sm:col-span-2">
                        <span className="text-[#1A1A1A]">Notas:</span>{' '}
                        {formData.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* WhatsApp note */}
                <div className="flex items-start gap-3 p-4 bg-[#25D366]/5 border border-[#25D366]/20 mb-6">
                  <MessageCircle size={20} className="text-[#25D366] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-body text-sm font-medium text-[#1A1A1A]">
                      Pago por WhatsApp
                    </p>
                    <p className="font-body text-xs text-[#6B6B6B] mt-0.5">
                      Al confirmar, te redirigiremos a WhatsApp con tu pedido
                      listo para enviar. Martin o Daniela te confirmaran el
                      pago y el envio.
                    </p>
                  </div>
                </div>

                {/* Confirm button - desktop */}
                <button
                  onClick={handleConfirmOrder}
                  className="w-full h-[52px] bg-[#25D366] text-white font-body text-sm font-medium uppercase tracking-[1px] hover:bg-[#1DA851] hover:-translate-y-0.5 hover:shadow-whatsapp transition-all mb-3 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} />
                  Enviar Pedido por WhatsApp
                </button>

                <button
                  onClick={() => setStep(0)}
                  className="w-full h-[44px] border border-[#E5E5E5] text-[#6B6B6B] font-body text-xs uppercase tracking-[1px] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={14} />
                  Volver a editar
                </button>
              </div>
            )}
          </div>

          {/* ---------- Right column: Order summary ---------- */}
          <div className="lg:col-span-2">
            <div
              className={`bg-white border border-[#E5E5E5] p-5 md:p-8 lg:sticky lg:top-[100px] transition-all duration-700 ${
                animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <h2 className="font-body text-sm font-medium uppercase tracking-[2px] text-[#1A1A1A] mb-5">
                RESUMEN DEL PEDIDO
              </h2>

              {/* Items summary */}
              <div className="space-y-3 mb-5 max-h-[300px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={`summary-${item.productId}-${item.size}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-10 h-10 bg-[#F0F0F0] shrink-0 overflow-hidden">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-xs text-[#1A1A1A] truncate">
                          {item.name}
                        </p>
                        <p className="font-body text-[11px] text-[#6B6B6B]">
                          {item.size} x{item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-body text-xs text-[#1A1A1A] shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E5E5E5] pt-4 space-y-3">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-[#6B6B6B]">Subtotal</span>
                  <span className="text-[#1A1A1A]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-[#6B6B6B]">Envio</span>
                  {shippingCost === 0 ? (
                    <span className="text-[#22C55E] font-medium">
                      Envio gratis
                    </span>
                  ) : (
                    <span className="text-[#1A1A1A]">
                      {formatPrice(shippingCost)}
                    </span>
                  )}
                </div>
                <div className="border-t border-[#E5E5E5] pt-3 flex justify-between items-center">
                  <span className="font-body text-base font-medium text-[#1A1A1A]">
                    Total
                  </span>
                  <span className="font-body text-xl md:text-2xl font-semibold text-[#1A1A1A]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Security note */}
              <div className="mt-5 pt-4 border-t border-[#F0F0F0] text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Package size={14} className="text-[#6B6B6B]" />
                  <span className="font-body text-xs text-[#6B6B6B]">
                    Envio a todo el pais
                  </span>
                </div>
                <p className="font-body text-[11px] text-[#999]">
                  Pago seguro via WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Mobile sticky bottom CTA ---------- */}
      {step === 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] p-4 md:hidden z-40">
          <button
            onClick={handleConfirmOrder}
            className="w-full h-[48px] bg-[#25D366] text-white font-body text-sm font-medium uppercase tracking-[1px] flex items-center justify-center gap-2 hover:bg-[#1DA851] transition-colors"
          >
            <MessageCircle size={18} />
            Enviar por WhatsApp
          </button>
        </div>
      )}

      {step === 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] p-4 md:hidden z-40">
          <button
            onClick={handleSubmit(onSubmitShipping)}
            className="w-full h-[48px] bg-[#6F1219] text-white font-body text-sm font-medium uppercase tracking-[1px] hover:bg-[#5A0E14] transition-colors"
          >
            Confirmar Pedido
          </button>
        </div>
      )}
    </main>
  );
}
