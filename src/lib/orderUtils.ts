import { formatPrice } from './constants';

// ─── Types ───────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: number;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  timeline: OrderTimelineStep[];
}

export interface OrderTimelineStep {
  label: string;
  date: string;
  completed: boolean;
  current: boolean;
}

// ─── Status Labels (Spanish) ─────────────────────────────────────────

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En Proceso',
  shipped: 'En Camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D4A574' },
  processing: { bg: '#DBEAFE', text: '#3B82F6' },
  shipped: { bg: '#EDE9FE', text: '#8B5CF6' },
  delivered: { bg: '#DCFCE7', text: '#22C55E' },
  cancelled: { bg: '#FEE2E2', text: '#EF4444' },
};

// ─── localStorage Key ────────────────────────────────────────────────

const ORDERS_KEY = 'marda_orders';
const CUSTOMER_PROFILE_KEY = 'marda_customer_profile';

// ─── Customer Profile ────────────────────────────────────────────────

export interface CustomerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export const DEFAULT_PROFILE: CustomerProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
};

// ─── localStorage Functions ──────────────────────────────────────────

export const MOCK_ORDERS: Order[] = [];

export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // silently fail
  }
}

export function addOrder(order: Order): void {
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
}

export function updateOrderStatus(id: string, status: OrderStatus): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    orders[idx].status = status;
    saveOrders(orders);
  }
}

// ─── Customer Profile localStorage ───────────────────────────────────

export function getCustomerProfile(): CustomerProfile {
  try {
    const raw = localStorage.getItem(CUSTOMER_PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveCustomerProfile(profile: CustomerProfile): void {
  try {
    localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // silently fail
  }
}

// ─── Stats ───────────────────────────────────────────────────────────

export interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  inTransit: number;
  delivered: number;
  favoriteCategory: string;
}

export function getOrderStats(orders: Order[]): OrderStats {
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const inTransit = orders.filter((o) => o.status === 'shipped').length;
  const delivered = orders.filter((o) => o.status === 'delivered').length;

  // Simple favorite category heuristic
  const categoryCount: Record<string, number> = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const cat = item.name.toLowerCase().includes('conjunto') ||
        item.name.toLowerCase().includes('lenceria') ||
        item.name.toLowerCase().includes('top') ||
        item.name.toLowerCase().includes('crop')
        ? 'Mujer'
        : item.name.toLowerCase().includes('boxer') ||
          item.name.toLowerCase().includes('remera') ||
          item.name.toLowerCase().includes('gorro')
          ? 'Hombre'
          : 'Accesorios';
      categoryCount[cat] = (categoryCount[cat] || 0) + item.quantity;
    });
  });

  const favoriteCategory =
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

  return { totalOrders, totalSpent, inTransit, delivered, favoriteCategory };
}

// ─── Date Formatter ──────────────────────────────────────────────────

export function formatOrderDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ─── WhatsApp Reorder Link ───────────────────────────────────────────

export function getReorderWhatsAppLink(items: OrderItem[]): string {
  const lineItems = items
    .map((i) => `- ${i.name} (Talle: ${i.size}, Cant: ${i.quantity})`)
    .join('\n');
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const message = `Hola MARDA! Quiero rehacer un pedido:\n${lineItems}\n\nTotal: ${formatPrice(total)}`;
  return `https://wa.me/5491139199537?text=${encodeURIComponent(message)}`;
}
