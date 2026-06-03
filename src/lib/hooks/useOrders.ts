import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

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
  email: string | null;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  customerName: string;
  whatsapp: string;
  email?: string;
  address: string;
  items: OrderItem[];
  total: number;
  notes?: string;
}

interface OrdersResponse {
  orders: Order[];
}

interface OrderResponse {
  order: Order;
}

export function useAdminOrders(filterStatus?: OrderStatus) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setError(null);
    const qs = filterStatus ? `?status=${filterStatus}` : '';
    try {
      const data = await api.get<OrdersResponse>(`/api/orders${qs}`, { auth: true });
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown_error');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      const data = await api.patch<OrderResponse>(`/api/orders/${id}`, { status }, { auth: true });
      setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
      return data.order;
    },
    []
  );

  const deleteOrder = useCallback(async (id: string) => {
    await api.delete(`/api/orders/${id}`, { auth: true });
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  return { orders, loading, error, refetch: fetchOrders, updateStatus, deleteOrder };
}

export async function createOrderPublic(input: CreateOrderInput): Promise<Order> {
  const data = await api.post<OrderResponse>('/api/orders', input);
  return data.order;
}
