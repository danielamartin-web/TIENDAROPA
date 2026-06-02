import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderStatus = 'pendiente' | 'en_proceso' | 'enviado' | 'entregado' | 'cancelado';

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  whatsapp: string;
  email?: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  createdAtISO: string;
  notes?: string;
}

interface OrderState {
  orders: Order[];
  counter: number;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'createdAtISO'>) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  getOrderById: (id: string) => Order | undefined;
  resetOrders: () => void;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      counter: 125,

      addOrder: (orderData) => {
        const counter = get().counter + 1;
        const now = new Date();
        const newOrder: Order = {
          ...orderData,
          id: `MARDA-${String(counter).padStart(5, '0')}`,
          createdAt: formatDate(now),
          createdAtISO: now.toISOString(),
        };
        set((state) => ({
          orders: [newOrder, ...state.orders],
          counter,
        }));
        return newOrder;
      },

      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));
      },

      deleteOrder: (id) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        }));
      },

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      resetOrders: () => set({ orders: [], counter: 125 }),
    }),
    {
      name: 'marda-orders',
      version: 2,
      migrate: (persisted: unknown, version) => {
        const state = (persisted as Partial<OrderState>) ?? {};
        if (version < 2) {
          const cleaned = (state.orders ?? []).filter(
            (o) => !o.id.startsWith('MARDA-00120') && !o.id.startsWith('MARDA-00121') &&
                   !o.id.startsWith('MARDA-00122') && !o.id.startsWith('MARDA-00123') &&
                   !o.id.startsWith('MARDA-00124') && !o.id.startsWith('MARDA-00125')
          );
          return { ...state, orders: cleaned, counter: state.counter ?? 125 } as OrderState;
        }
        return state as OrderState;
      },
    }
  )
);
