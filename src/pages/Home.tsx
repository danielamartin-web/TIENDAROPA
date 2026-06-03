import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { Instagram } from 'lucide-react';

// Inline SVG icons for social media
function WhatsAppIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

function FacebookIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TikTokIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  );
}

function InstagramIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

/* ===========================
   Section 1: Hero
   =========================== */
function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex flex-col md:flex-row"
    >
      {/* Left - Men */}
      <div className="relative flex-1 min-h-[50dvh] md:min-h-full overflow-hidden">
        <img
          src="/hero-hombre.jpg"
          alt="Hombre"
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[2000ms]"
          style={{
            transform: loaded ? 'scale(1)' : 'scale(1.1)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(26,26,26,0.7), rgba(26,26,26,0.3))',
          }}
        />
        <div
          className="relative z-10 h-full flex flex-col justify-center items-start px-8 md:px-16 py-16"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}
        >
          <span className="font-body text-xs uppercase tracking-[3px] text-[#D4A574] mb-3">
            PARA EL
          </span>
          <h2 className="font-display text-[40px] md:text-[64px] text-white leading-[0.95] mb-3">
            HOMBRE
          </h2>
          <p className="font-body text-base font-light text-white/80 mb-6 max-w-xs">
            Estilo urbano. Comodidad total.
          </p>
          <Link
            to="/shop?category=hombre"
            className="btn-ghost text-sm"
          >
            COMPRAR AHORA
          </Link>
        </div>
      </div>

      {/* Right - Women */}
      <div className="relative flex-1 min-h-[50dvh] md:min-h-full overflow-hidden">
        <img
          src="/hero-mujer.jpg"
          alt="Mujer"
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[2000ms]"
          style={{
            transform: loaded ? 'scale(1)' : 'scale(1.1)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to left, rgba(26,26,26,0.7), rgba(26,26,26,0.3))',
          }}
        />
        <div
          className="relative z-10 h-full flex flex-col justify-center items-start md:items-end px-8 md:px-16 py-16 text-left md:text-right"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(60px)',
            transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
          }}
        >
          <span className="font-body text-xs uppercase tracking-[3px] text-[#D4A574] mb-3">
            PARA ELLA
          </span>
          <h2 className="font-display text-[40px] md:text-[64px] text-white leading-[0.95] mb-3">
            MUJER
          </h2>
          <p className="font-body text-base font-light text-white/80 mb-6 max-w-xs">
            Lenceria y moda juvenil.
          </p>
          <Link
            to="/shop?category=mujer"
            className="btn-ghost text-sm"
          >
            VER COLECCION
          </Link>
        </div>
      </div>

      {/* Center Logo */}
      <div
        className="absolute top-4 md:top-1/2 left-1/2 -translate-x-1/2 md:-translate-y-1/2 z-20"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(20px) scale(0.9)',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.8s',
        }}
      >
        <span
          className="font-display text-[36px] md:text-[48px] font-semibold text-white"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
        >
          MARDA
        </span>
      </div>
    </section>
  );
}

/* ===========================
   Section 2: Categories
   =========================== */
function CategoriesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const categories = [
    {
      title: 'HOMBRE',
      image: '/categoria-hombre.jpg',
      link: '/shop?category=hombre',
    },
    {
      title: 'MUJER',
      image: '/categoria-mujer.jpg',
      link: '/shop?category=mujer',
    },
    {
      title: 'ACCESORIOS',
      image: '/categoria-accesorios.jpg',
      link: '/shop?category=accesorios',
    },
  ];

  return (
    <section ref={sectionRef} className="bg-white section-padding">
      <div className="content-max-width">
        {/* Header */}
        <div
          className="text-center mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <h2 className="font-display text-h3 text-[#1A1A1A] mb-2">
            NUESTRAS CATEGORIAS
          </h2>
          <p className="font-body text-[#6B6B6B] mb-6">Encontra lo que buscas</p>
          <div className="w-[60px] h-[2px] bg-[#6F1219] mx-auto" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {categories.map((cat, index) => (
            <Link
              key={cat.title}
              to={cat.link}
              className="group relative overflow-hidden aspect-[2/3] block"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(40px)',
                transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 * (index + 1)}s`,
              }}
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.08]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[#1A1A1A]/0 group-hover:bg-[#1A1A1A]/50 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3
                  className="font-display text-[28px] md:text-[32px] text-white transition-transform duration-300 group-hover:-translate-y-2"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                >
                  {cat.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===========================
   Section 3: Featured Products
   =========================== */
function FeaturedProductsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const featuredProducts = getFeaturedProducts(4);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#FAFAFA] section-padding">
      <div className="content-max-width">
        {/* Header */}
        <div
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div>
            <h2 className="font-display text-h3 text-[#1A1A1A] mb-2">
              LO MAS VENDIDO
            </h2>
            <p className="font-body text-[#6B6B6B]">
              Los favoritos de nuestros clientes
            </p>
          </div>
          <Link to="/shop" className="btn-secondary text-sm self-start md:self-auto">
            VER TODOS
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group bg-white border border-[#F0F0F0] overflow-hidden"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 * (index + 1)}s`,
              }}
            >
              {/* Image */}
              <Link to={`/product/${product.id}`} className="relative block aspect-[3/4] overflow-hidden bg-[#F5F5F5]">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-top transition-transform duration-400 group-hover:scale-105"
                  loading="lazy"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-[#6F1219] text-white font-body text-xs font-semibold px-2.5 py-1">
                    {product.badge}
                  </span>
                )}
              </Link>

              {/* Info */}
              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-body text-sm text-[#1A1A1A] mb-2 hover:text-[#6F1219] transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  {product.originalPrice && (
                    <span className="font-body text-sm text-[#6B6B6B] line-through">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="font-body text-lg font-semibold text-[#6F1219]">
                    ${product.price.toLocaleString()}
                  </span>
                </div>
                {/* Quick add - uses first size as default */}
                <button
                  onClick={() =>
                    addItem({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      size: product.sizes[0],
                      image: product.images[0],
                    })
                  }
                  className="mt-3 w-full h-10 border border-[#E5E5E5] font-body text-xs uppercase tracking-[1px] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                >
                  AGREGAR
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="text-center mt-12"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.6s',
          }}
        >
          <Link to="/shop" className="btn-primary text-sm">
            VER TODOS LOS PRODUCTOS
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ===========================
   Section 4: Promo Banner
   =========================== */
function PromoBannerSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[300px] md:h-[400px] overflow-hidden"
    >
      <img
        src="/promo-banner.jpg"
        alt="Promo especial"
        className="absolute inset-0 w-full h-full object-cover object-center parallax-bg"
      />
      <div className="absolute inset-0 bg-[#1A1A1A]/75" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <span
          className="font-body text-xs uppercase tracking-[4px] text-[#D4A574] mb-3"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          PROMO ESPECIAL
        </span>
        <h2
          className="font-display text-[32px] md:text-[56px] text-white leading-[1] mb-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
          }}
        >
          2x1 EN SELECCIONADOS
        </h2>
        <p
          className="font-body text-base md:text-lg text-white/80 max-w-[600px] mb-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
          }}
        >
          Lleva 2 prendas y pagas 1. Valido en productos seleccionados de hombre y mujer.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center px-12 py-[18px] bg-[#6F1219] text-white font-body text-sm font-medium uppercase tracking-[1px] hover:bg-[#5A0E14] transition-colors"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.5s ease 0.5s',
          }}
        >
          APROVECHAR AHORA
        </Link>
      </div>
    </section>
  );
}

/* ===========================
   Section 5: About MARDA
   =========================== */
function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white section-padding">
      <div className="content-max-width">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Image */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-40px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="aspect-[4/3] overflow-hidden border border-[#F0F0F0]">
              <img
                src="/about-marda.jpg"
                alt="Martin y Daniela - Fundadores de MARDA"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>
          </div>

          {/* Text */}
          <div>
            <span
              className="font-body text-xs uppercase tracking-[3px] text-[#6F1219] mb-3 block"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(40px)',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
              }}
            >
              NUESTRA HISTORIA
            </span>
            <h2
              className="font-display text-h3 text-[#1A1A1A] mb-5"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(40px)',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              }}
            >
              Martin + Daniela = MARDA
            </h2>
            <p
              className="font-body text-[#6B6B6B] leading-[1.7] mb-4"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(40px)',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
              }}
            >
              MARDA nacio de la pasion compartida de Martin y Daniela por la moda. Juntos crearon una marca que fusiona estilo, comodidad y actitud para hombres y mujeres jovenes.
            </p>
            <p
              className="font-body text-[#6B6B6B] leading-[1.7] mb-6"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(40px)',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
              }}
            >
              Cada pieza esta pensada para que te sientas bien, te veas bien y expreses quien sos. Desde lenceria intima hasta ropa urbana, MARDA te acompana en cada momento.
            </p>
            <span
              className="font-display text-xl italic text-[#1A1A1A]"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(40px)',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
              }}
            >
              Martin & Daniela
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===========================
   Section 6: Social Media
   =========================== */
function SocialSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Grid images (reuse product images for the social grid)
  const gridImages = [
    '/producto-1.jpg',
    '/hero-mujer.jpg',
    '/producto-2.jpg',
    '/hero-hombre.jpg',
    '/producto-3.jpg',
    '/producto-4.jpg',
  ];

  return (
    <section ref={sectionRef} className="bg-[#1A1A1A] py-20 md:py-24">
      <div className="content-max-width">
        {/* Header */}
        <div
          className="text-center mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <h2 className="font-display text-h3 text-white mb-2">SEGUINOS</h2>
          <p className="font-body text-lg text-[#D4A574]">@Marda.0ficial</p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-10">
          {gridImages.map((img, index) => (
            <a
              key={index}
              href="https://instagram.com/Marda.0ficial"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden block"
              style={{
                opacity: visible ? 1 : 0,
                transition: `opacity 0.6s ease ${0.08 * (index + 1)}s`,
              }}
            >
              <img
                src={img}
                alt={`MARDA Instagram ${index + 1}`}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[#6F1219]/0 group-hover:bg-[#6F1219]/80 transition-colors duration-300 flex items-center justify-center">
                <Instagram
                  size={28}
                  className="text-white opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300"
                />
              </div>
            </a>
          ))}
        </div>

        {/* Social Links */}
        <div
          className="flex items-center justify-center gap-6"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.5s',
          }}
        >
          {[
            { Icon: WhatsAppIcon, href: 'https://wa.me/5491139199537', label: 'WhatsApp' },
            { Icon: InstagramIcon, href: 'https://instagram.com/Marda.0ficial', label: 'Instagram' },
            { Icon: FacebookIcon, href: 'https://www.facebook.com/profile.php?id=61590784251900', label: 'Facebook' },
            { Icon: TikTokIcon, href: 'https://tiktok.com/@marda.oficial', label: 'TikTok' },
          ].map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#D4A574] transition-colors"
              aria-label={label}
            >
              <Icon size={40} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===========================
   Main Home Page
   =========================== */
export default function Home() {
  return (
    <div>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <PromoBannerSection />
      <AboutSection />
      <SocialSection />
    </div>
  );
}
