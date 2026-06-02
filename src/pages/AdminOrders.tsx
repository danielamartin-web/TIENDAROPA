import { useMemo, useState } from 'react';
import {
  Search,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  ExternalLink,
  ShoppingCart,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminOrders, type Order, type OrderStatus } from '@/lib/hooks/useOrders';
import {
  formatPrice,
  getStatusLabel,
  getStatusColorClasses,
  exportOrdersToCSV,
  downloadCSV,
} from '@/lib/adminUtils';
import { Toaster, toast } from 'sonner';

const STATUS_TABS: { key: OrderStatus | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'en_proceso', label: 'En Proceso' },
  { key: 'enviado', label: 'Enviado' },
  { key: 'entregado', label: 'Entregado' },
  { key: 'cancelado', label: 'Cancelado' },
];

const ITEMS_PER_PAGE = 8;

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

export default function AdminOrders() {
  const { orders, loading, error, refetch, updateStatus, deleteOrder } = useAdminOrders();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'todos'>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;
      const matchesSearch =
        !search ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.whatsapp.includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await updateStatus(id, status);
      toast.success(`Estado actualizado a ${getStatusLabel(status)}`);
      setStatusDropdown(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm((curr) => (curr === id ? null : curr)), 3000);
      return;
    }
    try {
      await deleteOrder(id);
      toast.success('Pedido eliminado');
      setDeleteConfirm(null);
      if (detailOrder?.id === id) setDetailOrder(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleExportCSV = () => {
    const rows = filtered.map((o) => ({
      ...o,
      createdAt: formatDate(o.createdAt),
      createdAtISO: o.createdAt,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const csv = exportOrdersToCSV(rows as any);
    const now = new Date();
    const filename = `marda-pedidos-${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}.csv`;
    downloadCSV(csv, filename);
    toast.success('CSV descargado');
  };

  const openWhatsApp = (number: string) => {
    window.open(`https://wa.me/${number}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <AdminLayout title="Pedidos">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#FFFFFF' },
        }}
      />

      {error && (
        <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-[#EF4444] font-body text-sm flex items-center justify-between gap-3">
          <span>Error al cargar pedidos: {error}</span>
          <button onClick={refetch} className="underline whitespace-nowrap">
            Reintentar
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {STATUS_TABS.map((tab) => {
          const count = tab.key === 'todos' ? orders.length : orders.filter((o) => o.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setCurrentPage(1);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                statusFilter === tab.key
                  ? 'bg-[#6F1219]/15 border-[#6F1219]/40'
                  : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#3A3A3A]'
              }`}
            >
              <p className="font-body text-[11px] text-[#6B6B6B] uppercase tracking-wider mb-1">{tab.label}</p>
              <p className="font-mono text-[20px] text-white">{count}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por pedido, cliente o WhatsApp..."
            className="w-full h-[44px] pl-10 pr-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors placeholder:text-[#6B6B6B]"
          />
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] text-white font-body text-sm rounded-lg hover:bg-[#2A2A2A] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refrescar
        </button>
        <button
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] text-white font-body text-sm rounded-lg hover:bg-[#2A2A2A] transition-colors disabled:opacity-50"
        >
          <Download size={16} />
          Exportar CSV
        </button>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left px-4 py-3 font-body text-[12px] uppercase tracking-[1px] text-[#6B6B6B] font-medium">Pedido</th>
                <th className="text-left px-4 py-3 font-body text-[12px] uppercase tracking-[1px] text-[#6B6B6B] font-medium hidden md:table-cell">Fecha</th>
                <th className="text-left px-4 py-3 font-body text-[12px] uppercase tracking-[1px] text-[#6B6B6B] font-medium">Cliente</th>
                <th className="text-left px-4 py-3 font-body text-[12px] uppercase tracking-[1px] text-[#6B6B6B] font-medium hidden sm:table-cell">Productos</th>
                <th className="text-left px-4 py-3 font-body text-[12px] uppercase tracking-[1px] text-[#6B6B6B] font-medium">Total</th>
                <th className="text-left px-4 py-3 font-body text-[12px] uppercase tracking-[1px] text-[#6B6B6B] font-medium">Estado</th>
                <th className="text-right px-4 py-3 font-body text-[12px] uppercase tracking-[1px] text-[#6B6B6B] font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((order) => {
                const colorClasses = getStatusColorClasses(order.status);
                return (
                  <tr key={order.id} className="border-b border-[#2A2A2A] last:border-0 hover:bg-[#222222] transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => setDetailOrder(order)} className="font-mono text-[13px] text-[#D4A574] hover:text-[#6F1219] transition-colors">
                        #{order.id}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-body text-[12px] text-[#A1A1A1]">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-body text-[13px] text-white">{order.customerName}</p>
                      <p className="font-body text-[11px] text-[#6B6B6B] mt-0.5">{order.whatsapp}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-body text-[12px] text-[#A1A1A1]">{order.items.length} item(s)</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[13px] text-white">{formatPrice(order.total)}</span>
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => setStatusDropdown(statusDropdown === order.id ? null : order.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-body text-[11px] font-medium border ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}
                      >
                        {getStatusLabel(order.status)}
                      </button>
                      {statusDropdown === order.id && (
                        <div className="absolute z-30 mt-1 w-[140px] bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl py-1">
                          {(['pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado'] as OrderStatus[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(order.id, s)}
                              className="w-full text-left px-3 py-2 font-body text-[12px] text-[#A1A1A1] hover:text-white hover:bg-[#2A2A2A] transition-colors"
                            >
                              {getStatusLabel(s)}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailOrder(order)} className="p-2 text-[#6B6B6B] hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors" aria-label="Ver detalle">
                          <ExternalLink size={16} />
                        </button>
                        <button onClick={() => openWhatsApp(order.whatsapp)} className="p-2 text-[#6B6B6B] hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors" aria-label="Enviar WhatsApp">
                          <MessageCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            deleteConfirm === order.id ? 'text-[#EF4444] bg-[#EF4444]/20' : 'text-[#6B6B6B] hover:text-[#EF4444] hover:bg-[#EF4444]/10'
                          }`}
                          aria-label="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <ShoppingCart className="mx-auto mb-3 text-[#2A2A2A]" size={40} />
                    <p className="font-body text-[14px] text-[#6B6B6B]">
                      {loading ? 'Cargando pedidos...' : 'No se encontraron pedidos'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 text-[#6B6B6B] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label="Pagina anterior">
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-8 h-8 rounded-lg font-body text-[12px] transition-colors ${p === currentPage ? 'bg-[#6F1219] text-white' : 'text-[#6B6B6B] hover:text-white hover:bg-[#2A2A2A]'}`}
            >
              {p}
            </button>
          ))}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 text-[#6B6B6B] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label="Pagina siguiente">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {detailOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setDetailOrder(null)} />
          <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A]">
              <div>
                <h2 className="font-display text-lg text-white">Pedido #{detailOrder.id}</h2>
                <p className="font-body text-[12px] text-[#6B6B6B] mt-0.5">{formatDate(detailOrder.createdAt)}</p>
              </div>
              <button onClick={() => setDetailOrder(null)} className="p-2 text-[#6B6B6B] hover:text-white transition-colors" aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              <div className="flex items-center gap-3">
                <span className="font-body text-[13px] text-[#A1A1A1]">Estado:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full font-body text-[12px] font-medium border ${getStatusColorClasses(detailOrder.status).bg} ${getStatusColorClasses(detailOrder.status).text} ${getStatusColorClasses(detailOrder.status).border}`}>
                  {getStatusLabel(detailOrder.status)}
                </span>
              </div>

              <div className="bg-[#0F0F0F] rounded-xl p-4">
                <h3 className="font-body text-[13px] text-[#A1A1A1] uppercase tracking-wider mb-3">Informacion del Cliente</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="font-body text-[11px] text-[#6B6B6B]">Nombre</p>
                    <p className="font-body text-[13px] text-white">{detailOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="font-body text-[11px] text-[#6B6B6B]">WhatsApp</p>
                    <button onClick={() => openWhatsApp(detailOrder.whatsapp)} className="font-body text-[13px] text-[#25D366] hover:underline flex items-center gap-1">
                      <MessageCircle size={12} />
                      {detailOrder.whatsapp}
                    </button>
                  </div>
                  {detailOrder.email && (
                    <div>
                      <p className="font-body text-[11px] text-[#6B6B6B]">Email</p>
                      <p className="font-body text-[13px] text-white">{detailOrder.email}</p>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <p className="font-body text-[11px] text-[#6B6B6B]">Direccion</p>
                    <p className="font-body text-[13px] text-white">{detailOrder.address}</p>
                  </div>
                  {detailOrder.notes && (
                    <div className="sm:col-span-2">
                      <p className="font-body text-[11px] text-[#6B6B6B]">Notas</p>
                      <p className="font-body text-[13px] text-white">{detailOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-body text-[13px] text-[#A1A1A1] uppercase tracking-wider mb-3">Productos</h3>
                <div className="space-y-2">
                  {detailOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-[#0F0F0F] rounded-lg">
                      <div className="w-12 h-12 rounded bg-[#2A2A2A] overflow-hidden flex-shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-[13px] text-white truncate">{item.name}</p>
                        <p className="font-body text-[11px] text-[#6B6B6B]">Talle: {item.size}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono text-[13px] text-white">{formatPrice(item.price)}</p>
                        <p className="font-body text-[11px] text-[#6B6B6B]">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#2A2A2A]">
                <span className="font-body text-[14px] text-[#A1A1A1]">Total</span>
                <span className="font-mono text-[22px] text-white">{formatPrice(detailOrder.total)}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={() => openWhatsApp(detailOrder.whatsapp)} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] text-white font-body text-sm font-medium rounded-lg hover:bg-[#128C7E] transition-colors">
                  <MessageCircle size={18} />
                  Enviar WhatsApp
                </button>
                <button
                  onClick={() => {
                    setDetailOrder(null);
                    setTimeout(() => setStatusDropdown(detailOrder.id), 100);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#6F1219] text-white font-body text-sm font-medium rounded-lg hover:bg-[#5A0E14] transition-colors"
                >
                  Actualizar Estado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
