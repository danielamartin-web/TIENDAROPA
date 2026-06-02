// Brand
export const STORE_NAME = 'MARDA';
export const STORE_TAGLINE = 'Ropa que te define';
export const STORE_DESCRIPTION =
  'MARDA - Tienda online de ropa interior y ropa juvenil para hombres y mujeres. Envios a todo el pais. Compra facil por WhatsApp.';

// Site URL (canonical/OG). Configurable por env, fallback razonable.
export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://marda.com.ar';

// API backend URL (vacio = mismo origen).
export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';

// WhatsApp contacts (datos publicos del negocio, OK en cliente)
export const WHATSAPP_MARTIN = '5491139199537';
export const WHATSAPP_DANIELA = '5491178204224';
export const DEFAULT_WHATSAPP_NUMBER = WHATSAPP_MARTIN;
export const DEFAULT_INSTAGRAM = 'marda.oficial';
export const DEFAULT_FACEBOOK = 'mardaoficial';
export const DEFAULT_TIKTOK = 'marda.oficial';

export const getWhatsAppUrl = (number: string = DEFAULT_WHATSAPP_NUMBER) =>
  `https://wa.me/${number}`;
export const getWhatsAppMartinUrl = (message?: string) =>
  `https://wa.me/${WHATSAPP_MARTIN}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
export const getWhatsAppDanielaUrl = (message?: string) =>
  `https://wa.me/${WHATSAPP_DANIELA}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
export const getInstagramUrl = (user: string = DEFAULT_INSTAGRAM) =>
  `https://instagram.com/${user}`;
export const getFacebookUrl = (page: string = DEFAULT_FACEBOOK) =>
  `https://facebook.com/${page}`;
export const getTikTokUrl = (user: string = DEFAULT_TIKTOK) =>
  `https://tiktok.com/@${user}`;

// SEO defaults
export const SEO_DEFAULTS = {
  title: `${STORE_NAME} - Ropa Interior y Juvenil`,
  description: STORE_DESCRIPTION,
  keywords:
    'ropa interior, lenceria, ropa juvenil, moda masculina, moda femenina, tienda online, MARDA, comprar ropa, WhatsApp pedidos',
  author: `${STORE_NAME} - Martin y Daniela`,
  ogImage: '/og-image.svg',
};

// Contact (placeholders genericos, sin "Av. Siempre Viva"). Configurable desde admin/backend.
export const DEFAULT_ADDRESS = 'Ciudad Autonoma de Buenos Aires, Argentina';
export const DEFAULT_HOURS = 'Lunes a Viernes: 9:00 - 18:00 | Sabados: 10:00 - 14:00';
export const DEFAULT_EMAIL = 'info@marda.com.ar';

// Currency
export const CURRENCY = '$';
export const CURRENCY_LOCALE = 'es-AR';

// Categorias
export const CATEGORIES = ['hombre', 'mujer', 'accesorios'] as const;
export type Category = (typeof CATEGORIES)[number];

// Talles
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'UNICO'] as const;
export type Size = (typeof SIZES)[number];

// Animation easing tokens
export const EASING = {
  smooth: [0.65, 0, 0.35, 1] as [number, number, number, number],
  entrance: [0.16, 1, 0.3, 1] as [number, number, number, number],
  exit: [0.7, 0, 0.84, 0] as [number, number, number, number],
};

export function formatPrice(price: number): string {
  return `${CURRENCY}${price.toLocaleString(CURRENCY_LOCALE)}`;
}

export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}
