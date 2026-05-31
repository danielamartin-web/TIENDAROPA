import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,

  CheckCircle,
  Truck,
  Share2,
  Package,
  Minus,
  Plus,
  X,
  Play,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { getProductById, products } from '@/data/products';
import { formatPrice, DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/* ────────────────────────────────
   Product Detail Page
   ──────────────────────────────── */

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const SIZE_GUIDE = [
  { size: 'XS', chest: '82-86', waist: '66-70', hips: '90-94' },
  { size: 'S', chest: '86-90', waist: '70-74', hips: '94-98' },
  { size: 'M', chest: '90-94', waist: '74-78', hips: '98-102' },
  { size: 'L', chest: '94-98', waist: '78-82', hips: '102-106' },
  { size: 'XL', chest: '98-102', waist: '82-86', hips: '106-110' },
  { size: 'XXL', chest: '102-106', waist: '86-90', hips: '110-114' },
];

/* ─── WhatsApp Icon SVG ─── */
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

/* ─── Schema.org Product markup ─── */
function ProductSchema({
  name,
  price,
  description,
  image,
  inStock,
}: {
  name: string;
  price: number;
  description: string;
  image: string;
  inStock: boolean;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: window.location.origin + image,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ARS',
      price: price.toString(),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'MARDA',
      },
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/* ─── Related Product Card ─── */
function RelatedCard({ product }: { product: (typeof products)[0] }) {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="aspect-[3/4] overflow-hidden bg-[#F0F0F0] border border-[#F0F0F0] mb-3">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h4 className="font-body text-[14px] text-[#1A1A1A] line-clamp-2 mb-1.5 leading-[1.4]">
        {product.name}
      </h4>
      <div className="flex items-center gap-2 flex-wrap">
        {product.originalPrice && (
          <span className="font-body text-[13px] text-[#6B6B6B] line-through">
            {formatPrice(product.originalPrice)}
          </span>
        )}
        <span className="font-body text-[15px] font-semibold text-[#6F1219]">
          {formatPrice(product.price)}
        </span>
      </div>
    </Link>
  );
}

/* ═════════════════════════════════
   MAIN PRODUCT DETAIL PAGE
   ═════════════════════════════════ */
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const product = getProductById(productId);

  const addItem = useCartStore((s) => s.addItem);

  // ── Local state ──
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const mainImageRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [galleryReady, setGalleryReady] = useState(false);

  // Entrance animation
  useEffect(() => {
    const t1 = setTimeout(() => setHeaderVisible(true), 100);
    const t2 = setTimeout(() => setGalleryReady(true), 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Reset state on product change
  useEffect(() => {
    setSelectedSize('');
    setQuantity(1);
    setCurrentImageIndex(0);
    setAddedToCart(false);
    setIsZoomed(false);
    setShowSizeGuide(false);
    setHeaderVisible(false);
    setGalleryReady(false);
    const t1 = setTimeout(() => setHeaderVisible(true), 100);
    const t2 = setTimeout(() => setGalleryReady(true), 200);
    window.scrollTo(0, 0);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [productId]);

  // SEO
  useEffect(() => {
    if (product) {
      document.title = `${product.name} - MARDA`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', product.description);
      }
    } else {
      document.title = 'Producto no encontrado - MARDA';
    }
  }, [product]);

  // Keyboard navigation for images
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!product || !product.images.length) return;
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((i) => (i > 0 ? i - 1 : product.images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((i) => (i < product.images.length - 1 ? i + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [product]);

  // ── Derived values ──
  const allMedia = useMemo(() => {
    if (!product) return [] as string[];
    const imgs = [...product.images];
    if (product.video) imgs.push(product.video);
    return imgs;
  }, [product]);

  const isVideo = (url: string) =>
    url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  // ── Handlers ──
  const handleAddToCart = () => {
    if (!product || !selectedSize) {
      toast.error('Selecciona una talla primero');
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      image: product.images[0],
    });
    setAddedToCart(true);
    toast.success(`${product.name} agregado al carrito`, {
      description: `Talle: ${selectedSize} | Cantidad: ${quantity}`,
    });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyWhatsApp = () => {
    if (!product) return;
    const size = selectedSize || product.sizes[0] || '';
    const msg = `Hola MARDA! Quiero comprar:${encodeURIComponent('\n')}- ${product.name} (Talle: ${size})${encodeURIComponent('\n')}Precio: ${formatPrice(product.price)}${encodeURIComponent('\n\n')}Link: ${window.location.href}`;
    window.open(`https://wa.me/${DEFAULT_WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name, url });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado al portapapeles');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current || !isZoomed) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((i) => (i < allMedia.length - 1 ? i + 1 : 0));
  };

  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((i) => (i > 0 ? i - 1 : allMedia.length - 1));
  };

  // ── Not found state ──
  if (!product) {
    return (
      <div className="pt-[72px] min-h-[100dvh] flex items-center justify-center">
        <div className="text-center px-6">
          <Package size={64} className="mx-auto text-[#6B6B6B] mb-6" />
          <h1 className="font-display text-[32px] text-[#1A1A1A] mb-3">
            Producto no encontrado
          </h1>
          <p className="font-body text-[15px] text-[#6B6B6B] mb-8">
            El producto que buscas no existe o fue removido.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center h-[52px] px-10 bg-[#6F1219] text-white font-body text-[14px] font-medium uppercase tracking-[1px] hover:bg-[#5A0E14] transition-colors"
          >
            VOLVER A LA TIENDA
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const currentMedia = allMedia[currentImageIndex] || product.images[0];
  const showVideo = isVideo(currentMedia);

  return (
    <div className="min-h-[100dvh] bg-white">
      {/* Schema.org markup */}
      <ProductSchema
        name={product.name}
        price={product.price}
        description={product.description}
        image={product.images[0]}
        inStock={product.inStock}
      />

      {/* ═══ BREADCRUMB ═══ */}
      <div className="pt-[72px]">
        <div className="content-max-width pt-6 pb-2">
          <nav
            className={cn(
              'transition-all duration-600 ease-out',
              headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <ol className="flex items-center gap-2 font-body text-[12px] text-[#6B6B6B] flex-wrap">
              <li>
                <Link to="/" className="hover:text-[#1A1A1A] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link to="/shop" className="hover:text-[#1A1A1A] transition-colors">
                  Tienda
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link
                  to={`/shop?category=${product.category}`}
                  className="capitalize hover:text-[#1A1A1A] transition-colors"
                >
                  {product.category}
                </Link>
              </li>
              <li>/</li>
              <li className="text-[#1A1A1A] line-clamp-1">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ═══ MAIN PRODUCT ═══ */}
      <div className="content-max-width pb-12 md:pb-20">
        <div className="flex flex-col lg:flex-row lg:gap-12">
          {/* ── Gallery ── */}
          <div
            className={cn(
              'lg:w-[55%] flex-shrink-0 transition-all duration-700 ease-out',
              galleryReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            )}
          >
            <div className="flex gap-3">
              {/* Thumbnails - desktop vertical strip */}
              {allMedia.length > 1 && (
                <div className="hidden md:flex flex-col gap-2 w-[72px] flex-shrink-0 max-h-[520px] overflow-y-auto scrollbar-hide">
                  {allMedia.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        'relative w-[68px] h-[68px] flex-shrink-0 overflow-hidden border-2 transition-all duration-200 bg-[#F5F5F5]',
                        currentImageIndex === idx
                          ? 'border-[#6F1219]'
                          : 'border-[#E5E5E5] hover:border-[#1A1A1A]'
                      )}
                    >
                      {isVideo(media) ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play size={20} className="text-[#6B6B6B]" />
                        </div>
                      ) : (
                        <img
                          src={media}
                          alt={`${product.name} ${idx + 1}`}
                          className="w-full h-full object-cover object-top"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 min-w-0">
                <div
                  ref={mainImageRef}
                  className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F5] cursor-zoom-in"
                  onClick={() => setIsZoomed(!isZoomed)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setIsZoomed(false)}
                >
                  {showVideo ? (
                    <video
                      src={currentMedia}
                      controls
                      className="w-full h-full object-cover"
                      poster={product.images[0]}
                    />
                  ) : (
                    <img
                      src={currentMedia}
                      alt={product.name}
                      className={cn(
                        'w-full h-full object-cover object-top transition-transform duration-500',
                        isZoomed && 'scale-150'
                      )}
                      style={
                        isZoomed
                          ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                          : undefined
                      }
                    />
                  )}

                  {/* Image counter */}
                  {allMedia.length > 1 && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 font-body text-[12px] text-[#1A1A1A]">
                      {currentImageIndex + 1} / {allMedia.length}
                    </span>
                  )}

                  {/* Video badge */}
                  {showVideo && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-[#6F1219] text-white font-body text-[11px] font-semibold">
                      VIDEO
                    </span>
                  )}

                  {/* Desktop navigation arrows */}
                  {allMedia.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* Mobile thumbnail strip - horizontal scroll */}
                {allMedia.length > 1 && (
                  <div className="flex md:hidden gap-2 mt-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
                    {allMedia.map((media, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={cn(
                          'relative w-16 h-16 flex-shrink-0 overflow-hidden border-2 snap-start transition-all duration-200 bg-[#F5F5F5]',
                          currentImageIndex === idx
                            ? 'border-[#6F1219]'
                            : 'border-[#E5E5E5]'
                        )}
                      >
                        {isVideo(media) ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play size={16} className="text-[#6B6B6B]" />
                          </div>
                        ) : (
                          <img
                            src={media}
                            alt=""
                            className="w-full h-full object-cover object-top"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Mobile swipe instruction */}
                <p className="md:hidden text-center font-body text-[12px] text-[#6B6B6B] mt-2">
                  Desliza para ver mas imagenes
                </p>
              </div>
            </div>
          </div>

          {/* ── Product Info ── */}
          <div
            className={cn(
              'lg:w-[45%] mt-8 lg:mt-0 flex flex-col transition-all duration-700 ease-out delay-100',
              galleryReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            )}
          >
            {/* Product name */}
            <h1 className="font-display text-[24px] md:text-[32px] leading-[1.2] tracking-[-0.5px] text-[#1A1A1A] mb-2">
              {product.name}
            </h1>

            {/* Stock badge */}
            <span
              className={cn(
                'inline-flex items-center self-start px-2 py-0.5 font-body text-[12px] font-medium mb-4',
                product.inStock
                  ? 'text-[#22C55E]'
                  : 'text-[#EF4444]'
              )}
            >
              {product.inStock ? (
                <>
                  <CheckCircle size={14} className="mr-1" /> EN STOCK
                </>
              ) : (
                'SIN STOCK'
              )}
            </span>

            {/* Price */}
            <div className="flex items-center gap-3 flex-wrap mb-4">
              {product.originalPrice && (
                <span className="font-body text-[18px] text-[#6B6B6B] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="font-body text-[28px] md:text-[32px] font-semibold text-[#6F1219] leading-none">
                {formatPrice(product.price)}
              </span>
              {discount > 0 && (
                <span className="px-2 py-0.5 bg-[#6F1219] text-white font-body text-[12px] font-semibold">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Savings */}
            {product.originalPrice && (
              <p className="font-body text-[13px] text-[#22C55E] mb-4">
                Ahorras {formatPrice(product.originalPrice - product.price)}
              </p>
            )}

            {/* Short description */}
            <p className="font-body text-[15px] text-[#6B6B6B] leading-[1.7] mb-6">
              {product.description}
            </p>

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="font-body text-[12px] font-medium uppercase tracking-[1.5px] text-[#1A1A1A]">
                  SELECCIONA TU TALLA
                </label>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="font-body text-[13px] text-[#6F1219] underline underline-offset-2"
                >
                  Guia de tallas
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'min-w-[52px] h-[44px] px-4 rounded-full border font-body text-[14px] font-medium transition-all duration-200',
                        isSelected
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-transparent text-[#1A1A1A] border-[#E5E5E5] hover:border-[#1A1A1A]'
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {!selectedSize && (
                <p className="font-body text-[12px] text-[#EF4444] mt-2">
                  Selecciona una talla para continuar
                </p>
              )}
            </div>

            {/* Quantity selector */}
            <div className="mb-6">
              <label className="font-body text-[12px] font-medium uppercase tracking-[1.5px] text-[#1A1A1A] mb-3 block">
                CANTIDAD
              </label>
              <div className="inline-flex items-center border border-[#E5E5E5]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  <Minus size={16} />
                </button>
                <span className="w-[60px] h-11 flex items-center justify-center font-body text-[16px] text-[#1A1A1A] border-x border-[#E5E5E5]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              className={cn(
                'w-full h-[56px] font-body text-[14px] font-medium uppercase tracking-[1px] transition-all duration-300 flex items-center justify-center gap-2',
                addedToCart
                  ? 'bg-[#22C55E] text-white'
                  : 'bg-[#6F1219] text-white hover:bg-[#5A0E14] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(111,18,25,0.3)]'
              )}
            >
              {addedToCart ? (
                <>
                  <CheckCircle size={18} />
                  AGREGADO!
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  AGREGAR AL CARRITO
                </>
              )}
            </button>

            {/* WhatsApp button */}
            <button
              onClick={handleBuyWhatsApp}
              className="w-full h-[52px] mt-3 font-body text-[14px] font-medium uppercase tracking-[1px] border-2 border-[#25D366] text-[#25D366] flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#25D366] hover:text-white"
            >
              <WhatsAppIcon size={18} />
              COMPRAR POR WHATSAPP
            </button>

            {/* Shipping info */}
            <div className="flex items-center gap-2 mt-4 text-[#6B6B6B]">
              <Truck size={16} />
              <span className="font-body text-[13px]">
                Envio gratis en compras mayores a $50.000
              </span>
            </div>

            {/* Share */}
            <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
              <span className="font-body text-[12px] font-medium uppercase tracking-[1.5px] text-[#1A1A1A] mb-3 block">
                COMPARTIR
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
                  aria-label="Compartir"
                >
                  <Share2 size={18} />
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${product.name} - ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center text-[#25D366] hover:opacity-80 transition-opacity"
                  aria-label="Compartir por WhatsApp"
                >
                  <WhatsAppIcon size={18} />
                </a>
              </div>
            </div>

            {/* ── Accordions ── */}
            <div className="mt-8">
              <Accordion type="single" collapsible defaultValue="description">
                <AccordionItem value="description">
                  <AccordionTrigger className="font-body text-[13px] font-medium uppercase tracking-[1px] text-[#1A1A1A]">
                    DESCRIPCION DEL PRODUCTO
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="font-body text-[14px] text-[#6B6B6B] leading-[1.7]">
                      {product.description}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {[
                        '100% materiales premium',
                        product.sizes.length > 1
                          ? `Disponible en ${product.sizes.join(', ')}`
                          : 'Talle unico',
                        'Envio a todo el pais',
                        'Garantia de satisfaccion',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-[#22C55E] mt-0.5 flex-shrink-0" />
                          <span className="font-body text-[14px] text-[#6B6B6B]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shipping">
                  <AccordionTrigger className="font-body text-[13px] font-medium uppercase tracking-[1px] text-[#1A1A1A]">
                    ENVIO Y DEVOLUCIONES
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 font-body text-[14px] text-[#6B6B6B] leading-[1.7]">
                      <p>
                        Realizamos envios a todo el territorio argentino mediante correos
                        privados. El tiempo de entrega estimado es de 3 a 7 dias habiles.
                      </p>
                      <p>
                        <strong className="text-[#1A1A1A]">Envio gratis</strong> en compras
                        mayores a $50.000. Para compras menores, el costo de envio se calcula
                        al finalizar la compra.
                      </p>
                      <p>
                        Aceptamos devoluciones dentro de los 30 dias de recibida la compra.
                        El producto debe estar sin uso y con etiquetas.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="size-guide">
                  <AccordionTrigger className="font-body text-[13px] font-medium uppercase tracking-[1px] text-[#1A1A1A]">
                    GUIA DE TALLAS
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto">
                      <table className="w-full font-body text-[13px]">
                        <thead>
                          <tr className="border-b border-[#E5E5E5]">
                            <th className="text-left py-2 px-2 text-[#1A1A1A] font-medium">
                              Talle
                            </th>
                            <th className="text-left py-2 px-2 text-[#6B6B6B]">
                              Pecho (cm)
                            </th>
                            <th className="text-left py-2 px-2 text-[#6B6B6B]">
                              Cintura (cm)
                            </th>
                            <th className="text-left py-2 px-2 text-[#6B6B6B]">
                              Cadera (cm)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {SIZE_GUIDE.map((row) => (
                            <tr
                              key={row.size}
                              className={cn(
                                'border-b border-[#F0F0F0]',
                                selectedSize === row.size && 'bg-[#6F1219]/5'
                              )}
                            >
                              <td className="py-2 px-2 font-medium text-[#1A1A1A]">
                                {row.size}
                              </td>
                              <td className="py-2 px-2 text-[#6B6B6B]">{row.chest}</td>
                              <td className="py-2 px-2 text-[#6B6B6B]">{row.waist}</td>
                              <td className="py-2 px-2 text-[#6B6B6B]">{row.hips}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="font-body text-[12px] text-[#6B6B6B] mt-3">
                      Las medidas corresponden al contorno del cuerpo en centimetros.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RELATED PRODUCTS ═══ */}
      {relatedProducts.length > 0 && (
        <section className="bg-[#FAFAFA] py-16 md:py-20">
          <div className="content-max-width">
            <h2 className="font-display text-[28px] md:text-[36px] text-[#1A1A1A] text-center mb-10 tracking-[-0.5px]">
              TAMBIEN TE PUEDE GUSTAR
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rp) => (
                <RelatedCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Size Guide Modal ═══ */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSizeGuide(false)} />
          <div className="relative bg-white w-full max-w-[520px] max-h-[80vh] overflow-y-auto shadow-xl animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]">
              <h3 className="font-body text-[14px] font-medium uppercase tracking-[1.5px] text-[#1A1A1A]">
                Guia de Tallas
              </h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="p-1 text-[#1A1A1A]"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full font-body text-[14px]">
                  <thead>
                    <tr className="border-b-2 border-[#1A1A1A]">
                      <th className="text-left py-3 px-3 text-[#1A1A1A] font-medium">
                        Talle
                      </th>
                      <th className="text-left py-3 px-3 text-[#6B6B6B]">Pecho</th>
                      <th className="text-left py-3 px-3 text-[#6B6B6B]">Cintura</th>
                      <th className="text-left py-3 px-3 text-[#6B6B6B]">Cadera</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_GUIDE.map((row) => (
                      <tr
                        key={row.size}
                        className={cn(
                          'border-b border-[#F0F0F0]',
                          selectedSize === row.size && 'bg-[#6F1219]/5'
                        )}
                      >
                        <td className="py-3 px-3 font-medium text-[#1A1A1A]">{row.size}</td>
                        <td className="py-3 px-3 text-[#6B6B6B]">{row.chest} cm</td>
                        <td className="py-3 px-3 text-[#6B6B6B]">{row.waist} cm</td>
                        <td className="py-3 px-3 text-[#6B6B6B]">{row.hips} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="font-body text-[13px] text-[#6B6B6B] mt-4 leading-[1.6]">
                Las medidas corresponden al contorno del cuerpo en centimetros. Si estas entre
                dos tallas, te recomendamos elegir la mayor para mayor comodidad.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Mobile Sticky Bottom Bar ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E5E5] p-3 md:hidden lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBuyWhatsApp}
            className="flex-1 h-[48px] border-2 border-[#25D366] text-[#25D366] font-body text-[12px] font-medium uppercase tracking-[0.5px] flex items-center justify-center gap-1.5"
          >
            <WhatsAppIcon size={16} />
            WhatsApp
          </button>
          <button
            onClick={handleAddToCart}
            className={cn(
              'flex-[2] h-[48px] font-body text-[13px] font-medium uppercase tracking-[0.5px] flex items-center justify-center gap-2 transition-colors',
              addedToCart ? 'bg-[#22C55E] text-white' : 'bg-[#6F1219] text-white'
            )}
          >
            {addedToCart ? (
              <>
                <CheckCircle size={16} />
                AGREGADO
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                AGREGAR
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
