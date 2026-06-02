import { env } from '../env.js';
import { db, pool } from './client.js';
import { admins, products } from './schema.js';
import { hashPassword } from '../utils/hash.js';
import { eq } from 'drizzle-orm';

const SEED_PRODUCTS = [
  { name: 'Conjunto Lenceria Negra', description: 'Conjunto de lenceria femenina en encaje negro con detalles de satin. Comodo, elegante y sensual.', price: 9999, originalPrice: 12500, category: 'mujer', sizes: ['S', 'M', 'L', 'XL'], stockBySize: { S: 8, M: 12, L: 10, XL: 6 }, images: ['/producto-1.jpg'], inStock: true, badge: '-20%', sortOrder: 1 },
  { name: 'Pack Boxers Negros', description: 'Pack de 3 boxers negros de algodon premium. Corte comodo, tela suave y duradera.', price: 11999, originalPrice: 15000, category: 'hombre', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stockBySize: { S: 10, M: 15, L: 15, XL: 10, XXL: 5 }, images: ['/producto-2.jpg'], inStock: true, badge: 'PACK x3', sortOrder: 2 },
  { name: 'Remera Oversize Negra', description: 'Remera oversize fit negra, estilo urbano. Algodon 100% peinado de alto gramaje.', price: 8500, originalPrice: null, category: 'hombre', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stockBySize: { S: 12, M: 18, L: 18, XL: 12, XXL: 8 }, images: ['/producto-3.jpg'], inStock: true, sortOrder: 3 },
  { name: 'Top Crop Burdeos', description: 'Top crop en color burdeos, ideal para combinar. Tela elastica y fresca.', price: 6200, originalPrice: 7500, category: 'mujer', sizes: ['XS', 'S', 'M', 'L'], stockBySize: { XS: 5, S: 10, M: 12, L: 8 }, images: ['/producto-4.jpg'], inStock: true, badge: 'NUEVO', sortOrder: 4 },
  { name: 'Bombacha Clasica Pack x3', description: 'Pack de 3 bombachas clasicas de algodon. Diseno comodo para uso diario.', price: 7500, originalPrice: 9900, category: 'mujer', sizes: ['S', 'M', 'L', 'XL'], stockBySize: { S: 10, M: 15, L: 12, XL: 8 }, images: ['/producto-1.jpg'], inStock: true, badge: '-24%', sortOrder: 5 },
  { name: 'Slip Hombre Algodon', description: 'Slip clasico masculino de algodon. Pack de 3 unidades en colores oscuros.', price: 8900, originalPrice: 11200, category: 'hombre', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stockBySize: { S: 8, M: 14, L: 14, XL: 10, XXL: 5 }, images: ['/producto-2.jpg'], inStock: true, badge: 'PACK x3', sortOrder: 6 },
  { name: 'Conjunto Deportivo Mujer', description: 'Conjunto deportivo femenino top + calza corta. Ideal para entrenar o salir.', price: 14200, originalPrice: 18500, category: 'mujer', sizes: ['XS', 'S', 'M', 'L'], stockBySize: { XS: 4, S: 8, M: 10, L: 6 }, images: ['/producto-4.jpg'], inStock: true, badge: '-23%', sortOrder: 7 },
  { name: 'Camiseta Basica Negra', description: 'Camiseta basica negra de ajuste regular. Algodon suave, ideal para capas.', price: 5500, originalPrice: null, category: 'hombre', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stockBySize: { S: 15, M: 20, L: 20, XL: 15, XXL: 10 }, images: ['/producto-3.jpg'], inStock: true, sortOrder: 8 },
  { name: 'Body Mujer Encaje', description: 'Body femenino en encaje negro. Elegante, versatil y comodo.', price: 11000, originalPrice: 13800, category: 'mujer', sizes: ['S', 'M', 'L', 'XL'], stockBySize: { S: 6, M: 10, L: 8, XL: 4 }, images: ['/producto-1.jpg'], inStock: true, badge: '-20%', sortOrder: 9 },
  { name: 'Biker Shorts Negros', description: 'Biker shorts negros de tela compresiva. Ideal para deporte o look urbano.', price: 7800, originalPrice: null, category: 'mujer', sizes: ['XS', 'S', 'M', 'L', 'XL'], stockBySize: { XS: 5, S: 10, M: 12, L: 10, XL: 6 }, images: ['/producto-4.jpg'], inStock: true, badge: 'TENDENCIA', sortOrder: 10 },
  { name: 'Gorra Snapback Negra', description: 'Gorra snapback negra con logo bordado. Estilo urbano, ajustable.', price: 6500, originalPrice: null, category: 'accesorios', sizes: ['UNICO'], stockBySize: { UNICO: 20 }, images: ['/categoria-accesorios.jpg'], inStock: true, badge: 'NUEVO', sortOrder: 11 },
  { name: 'Reloj Minimalista', description: 'Reloj de pulsera con diseno minimalista. Correa de cuero negra.', price: 15800, originalPrice: 22000, category: 'accesorios', sizes: ['UNICO'], stockBySize: { UNICO: 8 }, images: ['/categoria-accesorios.jpg'], inStock: true, badge: '-28%', sortOrder: 12 },
];

async function seedAdmin() {
  const username = env.ADMIN_USERNAME;
  const password = env.ADMIN_INITIAL_PASSWORD;

  if (!password) {
    console.log('[seed] ADMIN_INITIAL_PASSWORD not set — skipping admin seed');
    return;
  }

  const [existing] = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
  if (existing) {
    console.log(`[seed] admin "${username}" already exists`);
    return;
  }

  const hash = await hashPassword(password);
  await db.insert(admins).values({ username, passwordHash: hash, role: 'admin' });
  console.log(`[seed] admin "${username}" created`);
}

async function seedProducts() {
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length > 0) {
    console.log('[seed] products already exist — skipping');
    return;
  }
  await db.insert(products).values(SEED_PRODUCTS as never);
  console.log(`[seed] ${SEED_PRODUCTS.length} products inserted`);
}

async function main() {
  console.log('[seed] starting');
  await seedAdmin();
  await seedProducts();
  console.log('[seed] done');
  await pool.end();
}

main().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
