import type { Category } from '@/lib/constants';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  category: Category;
  sizes: string[];
  images: string[];
  video?: string | null;
  inStock: boolean;
  badge?: string | null;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Conjunto Lenceria Negra',
    description: 'Conjunto de lenceria femenina en encaje negro con detalles de satin. Comodo, elegante y sensual.',
    price: 9999,
    originalPrice: 12500,
    category: 'mujer',
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['/producto-1.jpg'],
    inStock: true,
    badge: '-20%',
  },
  {
    id: 2,
    name: 'Pack Boxers Negros',
    description: 'Pack de 3 boxers negros de algodon premium. Corte comodo, tela suave y duradera.',
    price: 11999,
    originalPrice: 15000,
    category: 'hombre',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['/producto-2.jpg'],
    inStock: true,
    badge: 'PACK x3',
  },
  {
    id: 3,
    name: 'Remera Oversize Negra',
    description: 'Remera oversize fit negra, estilo urbano. Algodon 100% peinado de alto gramaje.',
    price: 8500,
    originalPrice: null,
    category: 'hombre',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['/producto-3.jpg'],
    inStock: true,
  },
  {
    id: 4,
    name: 'Top Crop Burdeos',
    description: 'Top crop en color burdeos, ideal para combinar. Tela elastica y fresca.',
    price: 6200,
    originalPrice: 7500,
    category: 'mujer',
    sizes: ['XS', 'S', 'M', 'L'],
    images: ['/producto-4.jpg'],
    inStock: true,
    badge: 'NUEVO',
  },
  {
    id: 5,
    name: 'Bombacha Clasica Pack x3',
    description: 'Pack de 3 bombachas clasicas de algodon. Diseno comodo para uso diario.',
    price: 7500,
    originalPrice: 9900,
    category: 'mujer',
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['/producto-1.jpg'],
    inStock: true,
    badge: '-24%',
  },
  {
    id: 6,
    name: 'Slip Hombre Algodon',
    description: 'Slip clasico masculino de algodon. Pack de 3 unidades en colores oscuros.',
    price: 8900,
    originalPrice: 11200,
    category: 'hombre',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['/producto-2.jpg'],
    inStock: true,
    badge: 'PACK x3',
  },
  {
    id: 7,
    name: 'Conjunto Deportivo Mujer',
    description: 'Conjunto deportivo femenino top + calza corta. Ideal para entrenar o salir.',
    price: 14200,
    originalPrice: 18500,
    category: 'mujer',
    sizes: ['XS', 'S', 'M', 'L'],
    images: ['/producto-4.jpg'],
    inStock: true,
    badge: '-23%',
  },
  {
    id: 8,
    name: 'Camiseta Basica Negra',
    description: 'Camiseta basica negra de ajuste regular. Algodon suave, ideal para capas.',
    price: 5500,
    originalPrice: null,
    category: 'hombre',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['/producto-3.jpg'],
    inStock: true,
  },
  {
    id: 9,
    name: 'Body Mujer Encaje',
    description: 'Body femenino en encaje negro. Elegante, versatil y comodo.',
    price: 11000,
    originalPrice: 13800,
    category: 'mujer',
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['/producto-1.jpg'],
    inStock: true,
    badge: '-20%',
  },
  {
    id: 10,
    name: 'Biker Shorts Negros',
    description: 'Biker shorts negros de tela compresiva. Ideal para deporte o look urbano.',
    price: 7800,
    originalPrice: null,
    category: 'mujer',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: ['/producto-4.jpg'],
    inStock: true,
    badge: 'TENDENCIA',
  },
  {
    id: 11,
    name: 'Gorra Snapback Negra',
    description: 'Gorra snapback negra con logo bordado. Estilo urbano, ajustable.',
    price: 6500,
    originalPrice: null,
    category: 'accesorios',
    sizes: ['UNICO'],
    images: ['/categoria-accesorios.jpg'],
    inStock: true,
    badge: 'NUEVO',
  },
  {
    id: 12,
    name: 'Reloj Minimalista',
    description: 'Reloj de pulsera con diseno minimalista. Correa de cuero negra.',
    price: 15800,
    originalPrice: 22000,
    category: 'accesorios',
    sizes: ['UNICO'],
    images: ['/categoria-accesorios.jpg'],
    inStock: true,
    badge: '-28%',
  },
];

// Get featured products (for home page)
export function getFeaturedProducts(count: number = 4): Product[] {
  return products.slice(0, count);
}

// Get products by category
export function getProductsByCategory(category: Category): Product[] {
  return products.filter((p) => p.category === category);
}

// Get a single product by ID
export function getProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}

// Search products
export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower)
  );
}
