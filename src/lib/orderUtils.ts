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
  firstName: 'Cliente',
  lastName: 'MARDA',
  email: 'cliente@marda.com',
  phone: '+54 9 11 2345 6789',
  address: 'Av. Siempre Viva 123, 4B',
  city: 'Buenos Aires',
  province: 'CABA',
  postalCode: 'C1000',
};

// ─── Mock Orders ─────────────────────────────────────────────────────

export const MOCK_ORDERS: Order[] = [
  {
    id: 'PED-2025-001',
    date: '2025-01-15T10:30:00',
    status: 'delivered',
    items: [
      {
        productId: 1,
        name: 'Conjunto Lenceria Elegance',
        size: 'M',
        quantity: 1,
        price: 12999,
        image: '/producto-1.jpg',
      },
      {
        productId: 3,
        name: 'Remera Oversize Negra',
        size: 'L',
        quantity: 2,
        price: 8999,
        image: '/producto-3.jpg',
      },
    ],
    total: 30997,
    customerName: 'Cliente MARDA',
    customerEmail: 'cliente@marda.com',
    customerPhone: '+54 9 11 2345 6789',
    shippingAddress: 'Av. Siempre Viva 123, 4B, Buenos Aires',
    timeline: [
      { label: 'Pedido recibido', date: '15/01/2025', completed: true, current: false },
      { label: 'Confirmado', date: '15/01/2025', completed: true, current: false },
      { label: 'En camino', date: '16/01/2025', completed: true, current: false },
      { label: 'Entregado', date: '18/01/2025', completed: true, current: false },
    ],
  },
  {
    id: 'PED-2025-002',
    date: '2025-02-20T14:15:00',
    status: 'shipped',
    items: [
      {
        productId: 2,
        name: 'Boxer Premium Pack x3',
        size: 'L',
        quantity: 1,
        price: 15999,
        image: '/producto-2.jpg',
      },
      {
        productId: 4,
        name: 'Top Crop Burdeos',
        size: 'S',
        quantity: 1,
        price: 7499,
        image: '/producto-4.jpg',
      },
      {
        productId: 5,
        name: 'Gorro Beanie Urban',
        size: 'UNICO',
        quantity: 1,
        price: 4999,
        image: '/producto-1.jpg',
      },
    ],
    total: 28497,
    customerName: 'Cliente MARDA',
    customerEmail: 'cliente@marda.com',
    customerPhone: '+54 9 11 2345 6789',
    shippingAddress: 'Av. Siempre Viva 123, 4B, Buenos Aires',
    timeline: [
      { label: 'Pedido recibido', date: '20/02/2025', completed: true, current: false },
      { label: 'Confirmado', date: '20/02/2025', completed: true, current: false },
      { label: 'En camino', date: '21/02/2025', completed: true, current: true },
      { label: 'Entregado', date: 'Pendiente', completed: false, current: false },
    ],
  },
  {
    id: 'PED-2025-003',
    date: '2025-03-10T09:00:00',
    status: 'processing',
    items: [
      {
        productId: 6,
        name: 'Conjunto Deportivo Air',
        size: 'M',
        quantity: 1,
        price: 18999,
        image: '/producto-3.jpg',
      },
    ],
    total: 18999,
    customerName: 'Cliente MARDA',
    customerEmail: 'cliente@marda.com',
    customerPhone: '+54 9 11 2345 6789',
    shippingAddress: 'Av. Siempre Viva 123, 4B, Buenos Aires',
    timeline: [
      { label: 'Pedido recibido', date: '10/03/2025', completed: true, current: false },
      { label: 'Confirmado', date: '10/03/2025', completed: true, current: true },
      { label: 'En camino', date: 'Pendiente', completed: false, current: false },
      { label: 'Entregado', date: 'Pendiente', completed: false, current: false },
    ],
  },
];

// ─── localStorage Functions ──────────────────────────────────────────

export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      // Seed with mock data on first load
      saveOrders(MOCK_ORDERS);
      return MOCK_ORDERS;
    }
    const parsed = JSON.parse(raw) as Order[];
    return parsed;
  } catch {
    return MOCK_ORDERS;
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
    if (!raw) {
      saveCustomerProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
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
  return `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`;
}
