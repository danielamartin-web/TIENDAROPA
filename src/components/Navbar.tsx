import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const totalItems = useCartStore((s) => s.getTotalItems());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';
  const isScrolledOrNotHome = scrolled || !isHome;

  const navLinks = [
    { label: 'HOMBRE', to: '/shop?category=hombre' },
    { label: 'MUJER', to: '/shop?category=mujer' },
    { label: 'TODOS', to: '/shop' },
    { label: 'CONTACTO', to: '/#footer' },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolledOrNotHome
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        )}
        style={{ height: 72 }}
      >
        <div className="content-max-width h-full flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu
              size={24}
              className={isScrolledOrNotHome ? 'text-[#1A1A1A]' : 'text-white'}
            />
          </button>

          {/* Logo */}
          <Link
            to="/"
            className={cn(
              'font-display text-2xl font-semibold tracking-wide select-none',
              isScrolledOrNotHome ? 'text-[#1A1A1A]' : 'text-white'
            )}
          >
            MARDA
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={cn(
                  'font-body text-[13px] font-medium uppercase tracking-[1.5px] transition-colors duration-300',
                  isScrolledOrNotHome
                    ? 'text-[#1A1A1A] hover:text-[#6F1219]'
                    : 'text-white/90 hover:text-[#D4A574]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className={cn(
                'p-2 transition-colors',
                isScrolledOrNotHome
                  ? 'text-[#1A1A1A] hover:text-[#6F1219]'
                  : 'text-white/90 hover:text-[#D4A574]'
              )}
              aria-label="Buscar"
            >
              <Search size={20} />
            </Link>
            <Link
              to="/customer/dashboard"
              className={cn(
                'p-2 transition-colors hidden sm:block',
                isScrolledOrNotHome
                  ? 'text-[#1A1A1A] hover:text-[#6F1219]'
                  : 'text-white/90 hover:text-[#D4A574]'
              )}
              aria-label="Mi cuenta"
            >
              <User size={20} />
            </Link>
            <Link
              to="/cart"
              className={cn(
                'p-2 transition-colors relative',
                isScrolledOrNotHome
                  ? 'text-[#1A1A1A] hover:text-[#6F1219]'
                  : 'text-white/90 hover:text-[#D4A574]'
              )}
              aria-label="Carrito"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#6F1219] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-[360px] bg-[#1A1A1A] p-6 overflow-y-auto animate-slide-left">
            <div className="flex items-center justify-between mb-10">
              <span className="font-display text-2xl font-semibold text-white tracking-wide">
                MARDA
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-white"
                aria-label="Cerrar menu"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="font-body text-[15px] font-medium uppercase tracking-[1.5px] text-white/90 py-4 border-b border-white/10 hover:text-[#D4A574] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/customer/dashboard"
                className="font-body text-[15px] font-medium uppercase tracking-[1.5px] text-white/90 py-4 border-b border-white/10 hover:text-[#D4A574] transition-colors flex items-center gap-3"
                onClick={() => setMobileOpen(false)}
              >
                <User size={18} />
                MI CUENTA
              </Link>
              <Link
                to="/cart"
                className="font-body text-[15px] font-medium uppercase tracking-[1.5px] text-white/90 py-4 border-b border-white/10 hover:text-[#D4A574] transition-colors flex items-center gap-3"
                onClick={() => setMobileOpen(false)}
              >
                <ShoppingCart size={18} />
                CARRITO ({totalItems})
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

// Simple cn utility inline to avoid import issues
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
