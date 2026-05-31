import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Menu, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';


interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [useLocation().pathname]);

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="min-h-[100dvh] bg-[#0F0F0F] text-white flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 z-40">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 animate-slide-left">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-[260px]">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between px-4 flex-shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-white"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
          <span className="font-display text-lg text-white tracking-wide">MARDA</span>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-2 text-transparent pointer-events-none"
            aria-hidden
          >
            <X size={24} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {title && (
            <h1 className="font-display text-2xl md:text-[28px] text-white tracking-tight mb-6">
              {title}
            </h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
