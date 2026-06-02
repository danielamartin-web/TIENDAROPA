import { lazy, Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#FAFAFA]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#6F1219] border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-xs text-[#6B6B6B] uppercase tracking-[2px]">Cargando</p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <main className="pt-[120px] min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-6">
        <p className="font-mono text-xs text-[#6F1219] tracking-[3px] mb-3">ERROR 404</p>
        <h1 className="font-display text-4xl md:text-6xl text-[#1A1A1A] mb-4">
          Pagina no encontrada
        </h1>
        <p className="font-body text-[#6B6B6B] mb-8 max-w-md mx-auto">
          La pagina que buscas no existe o fue movida.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#6F1219] text-white font-body text-sm uppercase tracking-[1px] px-8 h-[48px] leading-[48px] hover:bg-[#5A0E14] transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requireAdmin>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute requireAdmin>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requireAdmin>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
