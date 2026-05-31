import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle,
  User,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  MessageCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/constants';
import {
  getOrders,
  getCustomerProfile,
  saveCustomerProfile,
  getOrderStats,
  formatOrderDate,
  getReorderWhatsAppLink,
  STATUS_LABELS,
  STATUS_COLORS,
} from '@/lib/orderUtils';
import type { Order, OrderStatus, CustomerProfile } from '@/lib/orderUtils';

// ─── Animation Variants ──────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.25 },
  },
};

// ─── Status Badge ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-body"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

// ─── Order Timeline ──────────────────────────────────────────────────

function OrderTimeline({ timeline }: { timeline: Order['timeline'] }) {
  return (
    <div className="flex items-start justify-between mt-4 mb-2">
      {timeline.map((step, idx) => (
        <div key={idx} className="flex flex-col items-center flex-1 relative">
          {/* Connector line */}
          {idx < timeline.length - 1 && (
            <div
              className="absolute top-3 left-1/2 w-full h-[2px]"
              style={{
                backgroundColor: step.completed ? '#22C55E' : '#E5E5E5',
              }}
            />
          )}
          {/* Circle */}
          <div
            className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2"
            style={{
              borderColor: step.completed
                ? '#22C55E'
                : step.current
                  ? '#6F1219'
                  : '#E5E5E5',
              backgroundColor: step.completed
                ? '#22C55E'
                : step.current
                  ? '#6F1219'
                  : '#FFFFFF',
            }}
          >
            {step.completed && (
              <CheckCircle size={12} className="text-white" />
            )}
            {step.current && !step.completed && (
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </div>
          {/* Label */}
          <span className="text-[10px] font-body text-[#6B6B6B] mt-1.5 text-center leading-tight hidden sm:block">
            {step.label}
          </span>
          <span className="text-[10px] font-body text-[#6B6B6B] mt-0.5 text-center">
            {step.date}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Order Card ──────────────────────────────────────────────────────

function OrderCard({ order, index }: { order: Order; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleReorder = () => {
    order.items.forEach((item) => {
      addItem({
        productId: item.productId,
        name: item.name,
        price: item.price,
        size: item.size,
        image: item.image,
      });
    });
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.08 }}
      className="bg-white border border-[#E5E5E5] p-5 mb-4 transition-shadow duration-300 hover:shadow-card"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-body text-sm font-semibold text-[#1A1A1A]">
            Pedido #{order.id}
          </h4>
          <p className="font-body text-xs text-[#6B6B6B] mt-0.5">
            Realizado el {formatOrderDate(order.date)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Product thumbnails */}
      <div className="flex items-center gap-2 mb-3">
        {order.items.slice(0, 3).map((item, i) => (
          <div
            key={i}
            className="w-[50px] h-[50px] bg-[#F5F5F0] rounded overflow-hidden flex items-center justify-center"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ))}
        {order.items.length > 3 && (
          <span className="text-xs font-body text-[#6B6B6B]">
            +{order.items.length - 3} mas
          </span>
        )}
      </div>

      {/* Timeline */}
      <OrderTimeline timeline={order.timeline} />

      {/* Card Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F0F0F0]">
        <span className="font-body text-sm font-semibold text-[#1A1A1A]">
          Total: {formatPrice(order.total)}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="font-body text-xs font-medium text-[#6F1219] hover:text-[#5A0E14] transition-colors flex items-center gap-1"
          >
            {expanded ? (
              <>
                Ocultar <ChevronUp size={14} />
              </>
            ) : (
              <>
                Ver Detalle <ChevronDown size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-3 border-t border-[#F0F0F0]">
              <h5 className="font-body text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">
                Productos
              </h5>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-[60px] h-[60px] bg-[#F5F5F0] rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-[#1A1A1A] truncate">
                        {item.name}
                      </p>
                      <p className="font-body text-xs text-[#6B6B6B]">
                        Talle: {item.size} &middot; Cant: {item.quantity}
                      </p>
                    </div>
                    <span className="font-body text-sm font-medium text-[#1A1A1A]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 pt-3 border-t border-[#F0F0F0]">
                <a
                  href={getReorderWhatsAppLink(order.items)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-center text-xs py-3 px-4 flex items-center justify-center gap-2 flex-1"
                >
                  <MessageCircle size={14} />
                  REORDENAR POR WHATSAPP
                </a>
                <button
                  onClick={handleReorder}
                  className="btn-secondary text-center text-xs py-3 px-4 flex items-center justify-center gap-2 flex-1"
                >
                  <ShoppingBag size={14} />
                  COMPRAR DE NUEVO
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Empty Orders State ──────────────────────────────────────────────

function EmptyOrders() {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-[#F5F5F0] flex items-center justify-center mb-5">
        <Package size={40} className="text-[#E5E5E5]" />
      </div>
      <h3 className="font-display text-2xl text-[#1A1A1A] mb-2">
        Aun no tienes pedidos
      </h3>
      <p className="font-body text-sm text-[#6B6B6B] mb-6 max-w-xs">
        Tus pedidos apareceran aqui una vez que realices tu primera compra.
      </p>
      <Link
        to="/shop"
        className="btn-primary flex items-center gap-2"
      >
        IR A COMPRAR
        <ArrowRight size={16} />
      </Link>
    </motion.div>
  );
}

// ─── Profile Form ────────────────────────────────────────────────────

interface ProfileFormProps {
  profile: CustomerProfile;
  onSave: (profile: CustomerProfile) => void;
  onCancel: () => void;
}

function ProfileForm({ profile, onSave, onCancel }: ProfileFormProps) {
  const [form, setForm] = useState<CustomerProfile>({ ...profile });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerProfile, string>>>({});
  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerProfile, string>> = {};

    if (!form.firstName.trim()) newErrors.firstName = 'El nombre es obligatorio';
    if (!form.lastName.trim()) newErrors.lastName = 'El apellido es obligatorio';
    if (!form.phone.trim()) newErrors.phone = 'El telefono es obligatorio';
    if (!form.address.trim()) newErrors.address = 'La direccion es obligatoria';

    // Phone validation (basic)
    if (form.phone && !/^[\d\s\+\-\(\)]{7,}$/.test(form.phone)) {
      newErrors.phone = 'Ingresa un numero de telefono valido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    // Simulate save delay
    setTimeout(() => {
      onSave(form);
      setSaving(false);
    }, 400);
  };

  const updateField = (field: keyof CustomerProfile, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const inputClass = (field: keyof CustomerProfile) =>
    `w-full h-[52px] px-4 border font-body text-sm bg-white transition-all duration-200 outline-none ${
      errors[field]
        ? 'border-[#EF4444] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
        : 'border-[#E5E5E5] focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)]'
    }`;

  return (
    <motion.form
      variants={tabContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block font-body text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">
            Nombre
          </label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            className={inputClass('firstName')}
            placeholder="Tu nombre"
          />
          {errors.firstName && (
            <p className="text-[#EF4444] text-xs font-body mt-1">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block font-body text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">
            Apellido
          </label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            className={inputClass('lastName')}
            placeholder="Tu apellido"
          />
          {errors.lastName && (
            <p className="text-[#EF4444] text-xs font-body mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block font-body text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">
          Email
        </label>
        <input
          type="email"
          value={form.email}
          disabled
          className="w-full h-[52px] px-4 border border-[#E5E5E5] bg-[#F5F5F0] font-body text-sm text-[#6B6B6B] cursor-not-allowed"
        />
        <p className="text-[10px] font-body text-[#6B6B6B] mt-1">
          El email no se puede modificar.
        </p>
      </div>

      {/* Phone */}
      <div>
        <label className="block font-body text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">
          Telefono / WhatsApp
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          className={inputClass('phone')}
          placeholder="+54 9 11 3919-9537"
        />
        {errors.phone && (
          <p className="text-[#EF4444] text-xs font-body mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block font-body text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">
          Direccion de envio
        </label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
          className={inputClass('address')}
          placeholder="Calle, numero, departamento"
        />
        {errors.address && (
          <p className="text-[#EF4444] text-xs font-body mt-1">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* City */}
        <div>
          <label className="block font-body text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">
            Ciudad
          </label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
            className={inputClass('city')}
            placeholder="Ciudad"
          />
        </div>

        {/* Province */}
        <div>
          <label className="block font-body text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">
            Provincia
          </label>
          <input
            type="text"
            value={form.province}
            onChange={(e) => updateField('province', e.target.value)}
            className={inputClass('province')}
            placeholder="Provincia"
          />
        </div>

        {/* Postal Code */}
        <div>
          <label className="block font-body text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">
            Codigo Postal
          </label>
          <input
            type="text"
            value={form.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            className={inputClass('postalCode')}
            placeholder="CP"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              GUARDANDO...
            </>
          ) : (
            <>
              <Save size={14} />
              GUARDAR CAMBIOS
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex items-center gap-2"
        >
          <X size={14} />
          CANCELAR
        </button>
      </div>
    </motion.form>
  );
}

// ─── Profile Display ─────────────────────────────────────────────────

function ProfileDisplay({
  profile,
  onEdit,
}: {
  profile: CustomerProfile;
  onEdit: () => void;
}) {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <motion.div
      variants={tabContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#E5E5E5]">
        <div className="w-16 h-16 rounded-full bg-[#6F1219] flex items-center justify-center flex-shrink-0">
          <User size={28} className="text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl text-[#1A1A1A]">{fullName}</h3>
          <p className="font-body text-sm text-[#6B6B6B]">{profile.email}</p>
        </div>
        <button
          onClick={onEdit}
          className="ml-auto btn-secondary text-xs py-3 px-5 flex items-center gap-2"
        >
          <Edit3 size={14} />
          EDITAR
        </button>
      </div>

      {/* Profile Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5E5E5] p-5">
          <h4 className="font-body text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">
            Informacion de Contacto
          </h4>
          <div className="space-y-3">
            <div>
              <p className="font-body text-xs text-[#6B6B6B]">Nombre completo</p>
              <p className="font-body text-sm text-[#1A1A1A]">{fullName}</p>
            </div>
            <div>
              <p className="font-body text-xs text-[#6B6B6B]">Email</p>
              <p className="font-body text-sm text-[#1A1A1A]">{profile.email}</p>
            </div>
            <div>
              <p className="font-body text-xs text-[#6B6B6B]">Telefono / WhatsApp</p>
              <p className="font-body text-sm text-[#1A1A1A]">{profile.phone || 'No especificado'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] p-5">
          <h4 className="font-body text-xs font-medium text-[#6B6B6B] uppercase tracking-wider mb-3">
            Direccion de Envio
          </h4>
          <div className="space-y-3">
            <div>
              <p className="font-body text-xs text-[#6B6B6B]">Direccion</p>
              <p className="font-body text-sm text-[#1A1A1A]">{profile.address || 'No especificada'}</p>
            </div>
            <div>
              <p className="font-body text-xs text-[#6B6B6B]">Ciudad</p>
              <p className="font-body text-sm text-[#1A1A1A]">{profile.city || 'No especificada'}</p>
            </div>
            <div>
              <p className="font-body text-xs text-[#6B6B6B]">Provincia / CP</p>
              <p className="font-body text-sm text-[#1A1A1A]">
                {profile.province || '-'} {profile.postalCode ? `/ ${profile.postalCode}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

type Tab = 'orders' | 'profile';

export default function CustomerDashboard() {
  const { isAuthenticated, customerName, customerLogin } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  // Auto-login customer for demo if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      customerLogin('Cliente MARDA');
    }
  }, [isAuthenticated, customerLogin]);

  // Load orders and profile
  useEffect(() => {
    setOrders(getOrders());
    setProfile(getCustomerProfile());
  }, []);

  const stats = getOrderStats(orders);

  const handleSaveProfile = useCallback(
    (updated: CustomerProfile) => {
      saveCustomerProfile(updated);
      setProfile(updated);
      setEditingProfile(false);
      setToast({ message: 'Perfil actualizado correctamente', visible: true });
      setTimeout(() => setToast({ message: '', visible: false }), 3000);
    },
    []
  );

  const displayName = customerName || profile?.firstName || 'Cliente';

  return (
    <>
      {/* SEO Meta Tags */}
      <title>Mi Cuenta | MARDA</title>
      <meta
        name="description"
        content="Panel de cliente MARDA. Ver tus pedidos, seguir envios y gestionar tu perfil."
      />
      <meta
        name="keywords"
        content="MARDA, mi cuenta, pedidos, perfil, ropa interior, tienda online"
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-[#1A1A1A] text-white px-6 py-3 font-body text-sm flex items-center gap-2 shadow-lg"
          >
            <CheckCircle size={16} className="text-[#22C55E]" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-[72px] min-h-[100dvh] bg-[#FAFAFA]">
        <div className="max-w-[960px] mx-auto px-5 md:px-8 py-8 md:py-12">
          {/* ─── Header ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#6F1219] flex items-center justify-center flex-shrink-0">
                <User size={26} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-h4 text-[#1A1A1A]">
                  Hola, {displayName}!
                </h1>
                <p className="font-body text-sm text-[#6B6B6B]">
                  Bienvenido a tu cuenta MARDA
                </p>
              </div>
            </div>
          </motion.div>

          {/* ─── Stats Cards ────────────────────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white border border-[#E5E5E5] p-5 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-[#F5F5F0] flex items-center justify-center flex-shrink-0">
                <Package size={22} className="text-[#6F1219]" />
              </div>
              <div>
                <p className="font-body text-2xl font-semibold text-[#1A1A1A] leading-none">
                  {stats.totalOrders}
                </p>
                <p className="font-body text-xs text-[#6B6B6B] mt-1">Pedidos</p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white border border-[#E5E5E5] p-5 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                <Truck size={22} className="text-[#D4A574]" />
              </div>
              <div>
                <p className="font-body text-2xl font-semibold text-[#D4A574] leading-none">
                  {stats.inTransit}
                </p>
                <p className="font-body text-xs text-[#6B6B6B] mt-1">En camino</p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white border border-[#E5E5E5] p-5 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
                <CheckCircle size={22} className="text-[#22C55E]" />
              </div>
              <div>
                <p className="font-body text-2xl font-semibold text-[#22C55E] leading-none">
                  {stats.delivered}
                </p>
                <p className="font-body text-xs text-[#6B6B6B] mt-1">Entregados</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ─── Extra Stats (spent + fav category) ───────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 text-sm font-body text-[#6B6B6B]"
          >
            <span>
              Total gastado:{" "}
              <strong className="text-[#1A1A1A]">{formatPrice(stats.totalSpent)}</strong>
            </span>
            {stats.favoriteCategory !== 'N/A' && (
              <span>
                Categoria favorita:{" "}
                <strong className="text-[#1A1A1A]">{stats.favoriteCategory}</strong>
              </span>
            )}
          </motion.div>

          {/* ─── Tab Navigation ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="border-b border-[#E5E5E5] mb-6"
          >
            <div className="flex gap-0">
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setEditingProfile(false);
                }}
                className={`font-body text-sm uppercase tracking-[1px] px-6 py-3.5 border-b-2 transition-colors duration-200 ${
                  activeTab === 'orders'
                    ? 'border-[#6F1219] text-[#1A1A1A] font-medium'
                    : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                Mis Pedidos
              </button>
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setEditingProfile(false);
                }}
                className={`font-body text-sm uppercase tracking-[1px] px-6 py-3.5 border-b-2 transition-colors duration-200 ${
                  activeTab === 'profile'
                    ? 'border-[#6F1219] text-[#1A1A1A] font-medium'
                    : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                Mi Perfil
              </button>
            </div>
          </motion.div>

          {/* ─── Tab Content ────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {activeTab === 'orders' ? (
              <motion.div
                key="orders"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {orders.length === 0 ? (
                  <EmptyOrders />
                ) : (
                  <div>
                    {orders.map((order, i) => (
                      <OrderCard key={order.id} order={order} index={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <div key="profile">
                {profile && (
                  <AnimatePresence mode="wait">
                    {editingProfile ? (
                      <ProfileForm
                        key="profile-form"
                        profile={profile}
                        onSave={handleSaveProfile}
                        onCancel={() => setEditingProfile(false)}
                      />
                    ) : (
                      <ProfileDisplay
                        key="profile-display"
                        profile={profile}
                        onEdit={() => setEditingProfile(true)}
                      />
                    )}
                  </AnimatePresence>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
