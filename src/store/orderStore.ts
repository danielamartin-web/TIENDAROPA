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
  notes?: string;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  getOrderById: (id: string) => Order | undefined;
}

let orderCounter = 125;

function generateOrderId(): string {
  orderCounter++;
  return `MARDA-${String(orderCounter).padStart(5, '0')}`;
}

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const today = new Date();
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today); threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const fourDaysAgo = new Date(today); fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

const mockOrders: Order[] = [
  {
    id: 'MARDA-00121',
    customerName: 'Martin Garcia',
    whatsapp: '5491165432101',
    address: 'Av. Santa Fe 2345, CABA',
    items: [
      { productId: 1, name: 'Conjunto Lenceria Negra', price: 9999, quantity: 1, size: 'M', image: '/producto-1.jpg' },
      { productId: 4, name: 'Top Crop Burdeos', price: 6200, quantity: 2, size: 'S', image: '/producto-4.jpg' },
    ],
    total: 22399,
    status: 'pendiente',
    createdAt: formatDate(today),
  },
  {
    id: 'MARDA-00122',
    customerName: 'Daniela Lopez',
    whatsapp: '5491176543210',
    address: 'Calle Cordoba 1234, Rosario',
    items: [
      { productId: 2, name: 'Pack Boxers Negros', price: 11999, quantity: 1, size: 'L', image: '/producto-2.jpg' },
    ],
    total: 11999,
    status: 'en_proceso',
    createdAt: formatDate(yesterday),
  },
  {
    id: 'MARDA-00123',
    customerName: 'Carlos Ruiz',
    whatsapp: '5491187654321',
    address: 'Bv. San Juan 567, Mendoza',
    items: [
      { productId: 3, name: 'Remera Oversize Negra', price: 8500, quantity: 1, size: 'XL', image: '/producto-3.jpg' },
      { productId: 11, name: 'Gorra Snapback Negra', price: 6500, quantity: 1, size: 'UNICO', image: '/categoria-accesorios.jpg' },
    ],
    total: 15000,
    status: 'enviado',
    createdAt: formatDate(twoDaysAgo),
  },
  {
    id: 'MARDA-00124',
    customerName: 'Sofia Martinez',
    whatsapp: '5491198765432',
    address: 'Av. Libertador 789, CABA',
    items: [
      { productId: 7, name: 'Conjunto Deportivo Mujer', price: 14200, quantity: 1, size: 'M', image: '/producto-4.jpg' },
      { productId: 10, name: 'Biker Shorts Negros', price: 7800, quantity: 1, size: 'S', image: '/producto-4.jpg' },
    ],
    total: 22000,
    status: 'entregado',
    createdAt: formatDate(threeDaysAgo),
  },
  {
    id: 'MARDA-00120',
    customerName: 'Lucas Fernandez',
    whatsapp: '5491154321098',
    address: 'Calle Mitre 456, La Plata',
    items: [
      { productId: 6, name: 'Slip Hombre Algodon', price: 8900, quantity: 2, size: 'M', image: '/producto-2.jpg' },
      { productId: 8, name: 'Camiseta Basica Negra', price: 5500, quantity: 1, size: 'L', image: '/producto-3.jpg' },
    ],
    total: 23300,
    status: 'cancelado',
    createdAt: formatDate(fourDaysAgo),
  },
  {
    id: 'MARDA-00125',
    customerName: 'Valentina Perez',
    whatsapp: '5491143210987',
    address: 'Av. Corrientes 3210, CABA',
    items: [
      { productId: 9, name: 'Body Mujer Encaje', price: 11000, quantity: 1, size: 'S', image: '/producto-1.jpg' },
      { productId: 12, name: 'Reloj Minimalista', price: 15800, quantity: 1, size: 'UNICO', image: '/categoria-accesorios.jpg' },
    ],
    total: 26800,
    status: 'pendiente',
    createdAt: formatDate(today),
  },
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: mockOrders,

      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: generateOrderId(),
          createdAt: formatDate(new Date()),
        };
        set((state) => ({ orders: [newOrder, ...state.orders] }));
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

      getOrderById: (id) => {
        return get().orders.find((o) => o.id === id);
      },
    }),
    {
      name: 'marda-orders',
    }
  )
);
