import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ShoppingBag } from 'lucide-react';
import { useShopStore } from '@/store/shopStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/constants';
import type { Product } from '@/data/products';
import type { Category } from '@/lib/constants';

/* ────────────────────────────────
   Shop Page - Catalogo completo
   ──────────────────────────────── */

const CATEGORIES: { label: string; value: Category | 'todos' }[] = [
  { label: 'TODOS', value: 'todos' },
  { label: 'HOMBRE', value: 'hombre' },
  { label: 'MUJER', value: 'mujer' },
  { label: 'ACCESORIOS', value: 'accesorios' },
];

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const SORT_OPTIONS = [
  { value: 'relevant', label: 'Mas relevantes' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'name-asc', label: 'Nombre A-Z' },
  { value: 'name-desc', label: 'Nombre Z-A' },
  { value: 'newest', label: 'Mas nuevos' },
];

type SortValue = 'relevant' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest';

const MAX_PRICE = 50000;

/* ─── Helpers ─── */
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function getBadgeStyle(badge?: string) {
  if (!badge) return '';
  if (badge.startsWith('-') || badge.includes('%')) {
    return 'bg-[#6F1219] text-white';
  }
  if (badge === 'NUEVO' || badge === 'TENDENCIA') {
    return 'bg-[#1A1A1A] text-white';
  }
  if (badge.startsWith('PACK')) {
    return 'bg-[#D4A574] text-[#1A1A1A]';
  }
  return 'bg-[#6F1219] text-white';
}

/* ─── Product Card ─── */
function ProductCard({ product, index }: { product: Product; index: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Staggered fade-in on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 80);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px 50px 0px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes[0] || 'M';
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: defaultSize,
      image: product.images[0],
    });
    // Show mini-toast
    const toast = document.getElementById('shop-toast');
    if (toast) {
      toast.textContent = `${product.name} agregado al carrito`;
      toast.classList.remove('translate-y-[-120%]', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.add('translate-y-[-120%]', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 2500);
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'group transition-all duration-500',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image container */}
        <div
          className="relative aspect-[3/4] overflow-hidden bg-[#F0F0F0] border border-[#F0F0F0]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Loading skeleton */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-[#F0F0F0] animate-pulse" />
          )}
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={cn(
              'w-full h-full object-cover transition-transform duration-500 ease-out',
              isHovered && 'scale-105',
              imgLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />

          {/* Badge */}
          {product.badge && (
            <span
              className={cn(
                'absolute top-3 left-3 px-2.5 py-1 text-[11px] font-body font-semibold tracking-wide',
                getBadgeStyle(product.badge)
              )}
            >
              {product.badge}
            </span>
          )}

          {/* Quick add button on hover */}
          <button
            onClick={handleQuickAdd}
            className={cn(
              'absolute bottom-0 left-0 right-0 h-[48px] bg-[#1A1A1A] text-white font-body text-[12px] font-medium uppercase tracking-[1px] flex items-center justify-center gap-2 transition-transform duration-300',
              isHovered ? 'translate-y-0' : 'translate-y-full'
            )}
          >
            <ShoppingBag size={16} />
            AGREGAR
          </button>
        </div>

        {/* Product info */}
        <div className="pt-3 pb-1">
          <h3 className="font-body text-[14px] font-normal text-[#1A1A1A] leading-[1.4] line-clamp-2 mb-1.5">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {product.originalPrice && (
              <span className="font-body text-[13px] text-[#6B6B6B] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="font-body text-[16px] font-semibold text-[#6F1219]">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ─── Sort Select ─── */
function SortSelect({ value, onChange }: { value: SortValue; onChange: (v: SortValue) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortValue)}
        className="appearance-none h-10 pl-4 pr-10 border border-[#E5E5E5] bg-white font-body text-[13px] text-[#1A1A1A] cursor-pointer focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] focus:outline-none transition-shadow"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B] pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

/* ─── Mobile Filter Drawer ─── */
function MobileFilterDrawer({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-[360px] bg-white shadow-lg flex flex-col animate-slide-left">
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]">
          <h3 className="font-body text-[14px] font-medium uppercase tracking-[1.5px] text-[#1A1A1A]">
            Filtrar
          </h3>
          <button onClick={onClose} className="p-1 text-[#1A1A1A]" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/* ─── Filter Content (shared desktop & mobile) ─── */
function FilterContent({
  priceRange,
  setPriceRange,
  selectedSizes,
  toggleSize,
  onClear,
}: {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedSizes: string[];
  toggleSize: (size: string) => void;
  onClear: () => void;
}) {
  const localMin = priceRange[0];
  const localMax = priceRange[1];

  return (
    <div className="flex flex-col gap-8">
      {/* Price Range */}
      <div>
        <h4 className="font-body text-[12px] font-medium uppercase tracking-[1.5px] text-[#1A1A1A] mb-4">
          PRECIO
        </h4>
        <div className="mb-4">
          <div className="flex items-center justify-between text-[13px] font-body text-[#6B6B6B] mb-3">
            <span>{formatPrice(localMin)}</span>
            <span>{formatPrice(localMax)}</span>
          </div>
          {/* Dual range using two native inputs */}
          <div className="relative h-6">
            <input
              type="range"
              min={0}
              max={MAX_PRICE}
              step={500}
              value={localMin}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v <= localMax - 1000) setPriceRange([v, localMax]);
              }}
              className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#6F1219] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-sm"
              style={{ zIndex: 2 }}
            />
            <input
              type="range"
              min={0}
              max={MAX_PRICE}
              step={500}
              value={localMax}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= localMin + 1000) setPriceRange([localMin, v]);
              }}
              className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#6F1219] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-sm"
              style={{ zIndex: 2 }}
            />
            {/* Track background */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-[#E5E5E5] rounded-full" />
            {/* Active range */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-[#6F1219] rounded-full"
              style={{
                left: `${(localMin / MAX_PRICE) * 100}%`,
                right: `${100 - (localMax / MAX_PRICE) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h4 className="font-body text-[12px] font-medium uppercase tracking-[1.5px] text-[#1A1A1A] mb-4">
          TALLA
        </h4>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                'w-11 h-11 border font-body text-[13px] font-medium transition-all duration-200',
                selectedSizes.includes(size)
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                  : 'border-[#E5E5E5] text-[#1A1A1A] hover:border-[#1A1A1A]'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      <button
        onClick={onClear}
        className="h-12 border border-[#1A1A1A] font-body text-[13px] font-medium uppercase tracking-[1px] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
      >
        LIMPIAR FILTROS
      </button>
    </div>
  );
}

/* ═════════════════════════════════
   MAIN SHOP PAGE
   ═════════════════════════════════ */
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const selectedCategory = useShopStore((s) => s.selectedCategory);
  const searchQuery = useShopStore((s) => s.searchQuery);
  const priceRange = useShopStore((s) => s.priceRange);
  const selectedSizes = useShopStore((s) => s.selectedSizes);
  const setCategory = useShopStore((s) => s.setCategory);
  const setSearchQuery = useShopStore((s) => s.setSearchQuery);
  const setPriceRange = useShopStore((s) => s.setPriceRange);
  const toggleSize = useShopStore((s) => s.toggleSize);
  const clearFilters = useShopStore((s) => s.clearFilters);
  const getFilteredProducts = useShopStore((s) => s.getFilteredProducts);

  const [sortValue, setSortValue] = useState<SortValue>('relevant');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  // Sync category from URL
  useEffect(() => {
    if (categoryParam && ['hombre', 'mujer', 'accesorios'].includes(categoryParam)) {
      setCategory(categoryParam as Category);
    } else {
      setCategory('todos');
    }
  }, [categoryParam, setCategory]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // Header entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Get filtered + sorted products
  const filteredProducts = useMemo(() => {
    const products = getFilteredProducts();
    switch (sortValue) {
      case 'price-asc':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...products].sort((a, b) => b.price - a.price);
      case 'name-asc':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return [...products].sort((a, b) => b.name.localeCompare(a.name));
      case 'newest':
        return [...products].sort((a, b) => b.id - a.id);
      default:
        return products;
    }
  }, [getFilteredProducts, sortValue]);

  const activeFilterCount =
    (selectedCategory !== 'todos' ? 1 : 0) +
    selectedSizes.length +
    (priceRange[0] > 0 || priceRange[1] < MAX_PRICE ? 1 : 0);

  // SEO
  useEffect(() => {
    document.title = 'Tienda - MARDA | Ropa Interior y Juvenil';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Explora la coleccion completa MARDA. Ropa interior, ropa juvenil y accesorios para hombres y mujeres. Envios a todo el pais.'
      );
    }
  }, []);

  const handleCategoryChange = (value: Category | 'todos') => {
    const params = new URLSearchParams(searchParams);
    if (value === 'todos') {
      params.delete('category');
    } else {
      params.set('category', value);
    }
    setSearchParams(params, { replace: true });
    setCategory(value);
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA]">
      {/* ── SEO ── */}
      <h1 className="sr-only">Tienda MARDA - Catalogo completo de ropa interior y juvenil</h1>

      {/* ── Toast ── */}
      <div
        id="shop-toast"
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 bg-[#1A1A1A] text-white font-body text-[13px] font-medium shadow-lg translate-y-[-120%] opacity-0 transition-all duration-300 pointer-events-none whitespace-nowrap"
      >
        Producto agregado
      </div>

      {/* ═══════════ HEADER ═══════════ */}
      <div
        ref={headerRef}
        className={cn(
          'pt-[72px] transition-all duration-700 ease-out',
          headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        <div className="content-max-width pt-10 pb-8 md:pt-14 md:pb-10">
          {/* Breadcrumb */}
          <nav className="mb-4">
            <ol className="flex items-center gap-2 font-body text-[12px] text-[#6B6B6B]">
              <li>
                <Link to="/" className="hover:text-[#1A1A1A] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>/</li>
              <li className="text-[#1A1A1A]">Tienda</li>
            </ol>
          </nav>

          {/* Title */}
          <h2 className="font-display text-[40px] md:text-[64px] leading-[1] tracking-[-1.5px] text-[#1A1A1A] mb-3">
            TIENDA
          </h2>
          <p className="font-body text-[14px] text-[#6B6B6B]">
            Mostrando {filteredProducts.length} productos
          </p>

          <div className="mt-8 h-px bg-[#E5E5E5]" />
        </div>
      </div>

      {/* ═══════════ FILTER BAR ═══════════ */}
      <div className="content-max-width pb-8 md:pb-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Category tabs */}
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={cn(
                  'relative px-4 py-3 font-body text-[13px] uppercase tracking-[1px] whitespace-nowrap transition-colors duration-200',
                  selectedCategory === cat.value
                    ? 'text-[#1A1A1A] font-medium'
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                )}
              >
                {cat.label}
                {selectedCategory === cat.value && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#6F1219]" />
                )}
              </button>
            ))}
          </div>

          {/* Right: Search + Sort + Mobile filter */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 md:w-[260px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 border border-[#E5E5E5] bg-white font-body text-[13px] text-[#1A1A1A] placeholder:text-[#6B6B6B] focus:border-[#6F1219] focus:shadow-[0_0_0_3px_rgba(111,18,25,0.1)] focus:outline-none transition-shadow"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <SortSelect value={sortValue} onChange={setSortValue} />

            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 h-10 px-4 border border-[#E5E5E5] bg-white font-body text-[13px] text-[#1A1A1A] relative"
            >
              <Filter size={16} />
              Filtros
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#6F1219] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="content-max-width pb-16 md:pb-24">
        <div className="flex gap-8">
          {/* ── Desktop Sidebar Filters ── */}
          <aside className="hidden lg:block w-[240px] flex-shrink-0">
            <div className="sticky top-[90px]">
              <h3 className="font-body text-[14px] font-medium uppercase tracking-[1.5px] text-[#1A1A1A] mb-6">
                Filtrar
              </h3>
              <FilterContent
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedSizes={selectedSizes}
                toggleSize={toggleSize}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* ── Product Grid ── */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Search size={48} className="text-[#6B6B6B] mb-4" />
                <h3 className="font-body text-[18px] text-[#6B6B6B] mb-2">
                  No encontramos productos con esos filtros
                </h3>
                <p className="font-body text-[14px] text-[#6B6B6B] mb-6">
                  Intenta con otros terminos o limpia los filtros
                </p>
                <button
                  onClick={clearFilters}
                  className="h-12 px-10 border border-[#1A1A1A] font-body text-[13px] font-medium uppercase tracking-[1px] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300"
                >
                  LIMPIAR FILTROS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ Mobile Filter Drawer ═══════════ */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
      >
        <FilterContent
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedSizes={selectedSizes}
          toggleSize={toggleSize}
          onClear={() => {
            clearFilters();
            setMobileFiltersOpen(false);
          }}
        />
        <button
          onClick={() => setMobileFiltersOpen(false)}
          className="mt-6 w-full h-12 bg-[#6F1219] text-white font-body text-[13px] font-medium uppercase tracking-[1px] hover:bg-[#5A0E14] transition-colors"
        >
          APLICAR FILTROS
        </button>
      </MobileFilterDrawer>
    </div>
  );
}
