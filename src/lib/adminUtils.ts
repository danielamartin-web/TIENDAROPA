import type { Order, OrderStatus } from '@/store/orderStore';

export const statusLabels: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const statusColors: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  pendiente: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/30' },
  en_proceso: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  enviado: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  entregado: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  cancelado: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

export function getStatusLabel(status: OrderStatus): string {
  return statusLabels[status] || status;
}

export function getStatusColorClasses(status: OrderStatus) {
  return statusColors[status] || statusColors.pendiente;
}

export function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR')}`;
}

function csvEscape(value: unknown): string {
  const s = value == null ? '' : String(value);
  if (s === '') return '""';
  return `"${s.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
}

export function exportOrdersToCSV(orders: Order[]): string {
  const headers = ['Pedido', 'Fecha', 'Cliente', 'WhatsApp', 'Direccion', 'Productos', 'Total', 'Estado'];
  const rows = orders.map((o) => [
    o.id,
    o.createdAt,
    o.customerName,
    o.whatsapp,
    o.address,
    o.items.map((i) => `${i.name} (x${i.quantity})`).join('; '),
    o.total,
    statusLabels[o.status],
  ]);
  return [
    headers.map(csvEscape).join(','),
    ...rows.map((r) => r.map(csvEscape).join(',')),
  ].join('\n');
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate simple 7-day sales data for chart
export function getLast7DaysSales() {
  const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = days[d.getDay()];
    // Deterministic pseudo-random based on date for consistency
    const baseAmount = 15000 + Math.sin(i * 2.5) * 8000 + Math.cos(i * 1.3) * 5000;
    const amount = Math.max(5000, Math.round(baseAmount / 100) * 100);
    data.push({
      day: dayName,
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      amount,
    });
  }
  return data;
}

export function getTodayDateString(): string {
  const d = new Date();
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

// Available sizes for products
export const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Available categories
export const ADMIN_CATEGORIES = [
  { value: 'hombre', label: 'Hombre' },
  { value: 'mujer', label: 'Mujer' },
  { value: 'accesorios', label: 'Accesorios' },
];
