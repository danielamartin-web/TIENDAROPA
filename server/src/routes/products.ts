import { Hono } from 'hono';
import { z } from 'zod';
import { eq, desc, asc, and, SQL } from 'drizzle-orm';
import { db } from '../db/client.js';
import { products } from '../db/schema.js';
import { requireAdmin } from '../middleware/auth.js';

const CATEGORIES = ['hombre', 'mujer', 'accesorios'] as const;

const productInput = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  price: z.number().int().nonnegative(),
  originalPrice: z.number().int().nonnegative().nullable().optional(),
  category: z.enum(CATEGORIES),
  sizes: z.array(z.string().min(1).max(16)).max(20).default([]),
  stockBySize: z.record(z.string().min(1).max(16), z.number().int().min(0).max(100000)).default({}),
  images: z.array(z.string().url().or(z.string().startsWith('/'))).max(10).default([]),
  video: z.string().url().nullable().optional(),
  inStock: z.boolean().default(true),
  badge: z.string().max(32).nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const productRoutes = new Hono();

productRoutes.get('/', async (c) => {
  const category = c.req.query('category');
  const inStockOnly = c.req.query('inStock') === 'true';

  const conditions: SQL[] = [];
  if (category && (CATEGORIES as readonly string[]).includes(category)) {
    conditions.push(eq(products.category, category));
  }
  if (inStockOnly) conditions.push(eq(products.inStock, true));

  const rows = await db
    .select()
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(products.sortOrder), desc(products.createdAt));

  return c.json({ products: rows });
});

productRoutes.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id)) return c.json({ error: 'invalid_id' }, 400);

  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!row) return c.json({ error: 'not_found' }, 404);
  return c.json({ product: row });
});

productRoutes.post('/', requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = productInput.safeParse(body);
  if (!parsed.success) return c.json({ error: 'invalid_payload', issues: parsed.error.issues }, 400);

  const [created] = await db
    .insert(products)
    .values({
      ...parsed.data,
      originalPrice: parsed.data.originalPrice ?? null,
      video: parsed.data.video ?? null,
      badge: parsed.data.badge ?? null,
    })
    .returning();

  return c.json({ product: created }, 201);
});

productRoutes.patch('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id)) return c.json({ error: 'invalid_id' }, 400);

  const body = await c.req.json().catch(() => null);
  const parsed = productInput.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: 'invalid_payload', issues: parsed.error.issues }, 400);

  const [updated] = await db
    .update(products)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();

  if (!updated) return c.json({ error: 'not_found' }, 404);
  return c.json({ product: updated });
});

productRoutes.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isFinite(id)) return c.json({ error: 'invalid_id' }, 400);

  const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();
  if (!deleted) return c.json({ error: 'not_found' }, 404);
  return c.json({ ok: true });
});
