import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Plus,
  Settings,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import { useProducts } from '@/lib/hooks/useProducts';
import { useAdminOrders } from '@/lib/hooks/useOrders';
import { getLast7DaysSales, getTodayDateString, formatPrice, getStatusLabel, getStatusColorClasses } from '@/lib/adminUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const { products } = useProducts();
  const { orders } = useAdminOrders();
  const salesData = getLast7DaysSales();

  const totalProducts = products.length;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const parseOrderDate = (iso: string): number => {
    const t = Date.parse(iso);
    return Number.isNaN(t) ? 0 : t;
  };

  const todayOrders = orders.filter((o) => parseOrderDate(o.createdAt) >= startOfToday).length;
  const monthOrders = orders.filter((o) => parseOrderDate(o.createdAt) >= startOfMonth).length;
  const estimatedRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const lowStockProducts = products.filter((p) => p.sizes.length < 3 || p.badge === '-20%').slice(0, 4);

  const recentOrders = orders.slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-3 shadow-lg">
          <p className="font-body text-[12px] text-[#6B6B6B] mb-1">{label}</p>
          <p className="font-mono text-[14px] text-white">{formatPrice(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Date */}
      <p className="font-body text-[13px] text-[#6B6B6B] -mt-4 mb-6">
        {getTodayDateString()}
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Productos"
          value={totalProducts}
          icon={Package}
          iconColor="#3B82F6"
          iconBgColor="rgba(59,130,246,0.1)"
          change="12 vs mes pasado"
          changePositive={true}
        />
        <StatCard
          title="Pedidos Hoy"
          value={todayOrders}
          icon={ShoppingCart}
          iconColor="#6F1219"
          iconBgColor="rgba(111,18,25,0.1)"
          change="2 vs ayer"
          changePositive={true}
        />
        <StatCard
          title="Pedidos Este Mes"
          value={monthOrders}
          icon={Users}
          iconColor="#D4A574"
          iconBgColor="rgba(212,165,116,0.1)"
          change="5% vs mes pasado"
          changePositive={true}
        />
        <StatCard
          title="Ingresos Estimados"
          value={formatPrice(estimatedRevenue)}
          icon={DollarSign}
          iconColor="#22C55E"
          iconBgColor="rgba(34,197,94,0.1)"
          change="8% vs mes pasado"
          changePositive={true}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="xl:col-span-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <h2 className="font-body text-[14px] text-white mb-6">
            Ventas de los ultimos 7 dias
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#6B6B6B', fontSize: 11, fontFamily: 'DM Sans' }}
                  axisLine={{ stroke: '#2A2A2A' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6B6B6B', fontSize: 11, fontFamily: 'DM Sans' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar
                  dataKey="amount"
                  fill="#6F1219"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-body text-[14px] text-white">Pedidos Recientes</h2>
            <Link
              to="/admin/orders"
              className="font-body text-[12px] text-[#6F1219] hover:text-[#D4A574] transition-colors flex items-center gap-1"
            >
              Ver todos
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-0">
            {recentOrders.map((order) => {
              const colorClasses = getStatusColorClasses(order.status);
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-[#2A2A2A] last:border-0"
                >
                  <div>
                    <p className="font-mono text-[13px] text-white">#{order.id}</p>
                    <p className="font-body text-[11px] text-[#6B6B6B] mt-0.5">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[13px] text-white">{formatPrice(order.total)}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full font-body text-[10px] font-medium border ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Low Stock + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={18} className="text-[#EF4444]" />
            <h2 className="font-body text-[14px] text-white">Alertas de Stock</h2>
          </div>
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-[#0F0F0F] rounded-lg"
              >
                <div className="w-10 h-10 rounded bg-[#2A2A2A] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={16} className="text-[#6B6B6B]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[13px] text-white truncate">{product.name}</p>
                  <p className="font-body text-[11px] text-[#6B6B6B]">{product.category}</p>
                </div>
                <span className="font-mono text-[12px] text-[#EF4444] flex-shrink-0">
                  Stock bajo
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <h2 className="font-body text-[14px] text-white mb-5">Acciones Rapidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              to="/admin/products"
              className="flex flex-col items-center gap-2 p-5 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg hover:border-[#6F1219] hover:bg-[#6F1219]/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#6F1219]/15 flex items-center justify-center group-hover:bg-[#6F1219]/25 transition-colors">
                <Plus size={20} className="text-[#6F1219]" />
              </div>
              <span className="font-body text-[12px] text-[#A1A1A1] group-hover:text-white transition-colors">
                Agregar Producto
              </span>
            </Link>
            <Link
              to="/admin/orders"
              className="flex flex-col items-center gap-2 p-5 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg hover:border-[#6F1219] hover:bg-[#6F1219]/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#6F1219]/15 flex items-center justify-center group-hover:bg-[#6F1219]/25 transition-colors">
                <ShoppingCart size={20} className="text-[#6F1219]" />
              </div>
              <span className="font-body text-[12px] text-[#A1A1A1] group-hover:text-white transition-colors">
                Ver Pedidos
              </span>
            </Link>
            <Link
              to="/admin/settings"
              className="flex flex-col items-center gap-2 p-5 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg hover:border-[#6F1219] hover:bg-[#6F1219]/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#6F1219]/15 flex items-center justify-center group-hover:bg-[#6F1219]/25 transition-colors">
                <Settings size={20} className="text-[#6F1219]" />
              </div>
              <span className="font-body text-[12px] text-[#A1A1A1] group-hover:text-white transition-colors">
                Editar Config
              </span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
