import { Hono } from 'hono';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { orders } from '../db/schema.js';
import { requireAdmin } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const ORDER_STATUSES = ['pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado'] as const;

const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1).max(200),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive().max(50),
  size: z.string().min(1).max(16),
  image: z.string().min(1).max(500),
});

const orderInput = z.object({
  customerName: z.string().min(2).max(200),
  whatsapp: z.string().min(8).max(32),
  email: z.string().email().max(200).optional().or(z.literal('').transform(() => undefined)),
  address: z.string().min(5).max(500),
  items: z.array(orderItemSchema).min(1).max(50),
  total: z.number().int().nonnegative(),
  notes: z.string().max(1000).optional(),
});

function generateOrderId(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 36 ** 4).toString(36).toUpperCase().padStart(4, '0');
  return `MARDA-${ymd}-${rand}`;
}

export const orderRoutes = new Hono();

orderRoutes.post(
  '/',
  rateLimit({ windowMs: 60_000, max: 8, keyPrefix: 'order' }),
  async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = orderInput.safeParse(body);
    if (!parsed.success) return c.json({ error: 'invalid_payload', issues: parsed.error.issues }, 400);

    const recomputed = parsed.data.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = parsed.data.total === recomputed ? parsed.data.total : recomputed;

    const id = generateOrderId();
    const [created] = await db
      .insert(orders)
      .values({
        id,
        customerName: parsed.data.customerName,
        whatsapp: parsed.data.whatsapp,
        email: parsed.data.email ?? null,
        address: parsed.data.address,
        items: parsed.data.items,
        total,
        status: 'pendiente',
        notes: parsed.data.notes ?? null,
      })
      .returning();

    return c.json({ order: created }, 201);
  }
);

orderRoutes.get('/', requireAdmin, async (c) => {
  const status = c.req.query('status');
  const conditions =
    status && (ORDER_STATUSES as readonly string[]).includes(status)
      ? eq(orders.status, status)
      : undefined;

  const rows = await db
    .select()
    .from(orders)
    .where(conditions)
    .orderBy(desc(orders.createdAt))
    .limit(500);

  return c.json({ orders: rows });
});

orderRoutes.get('/:id', requireAdmin, async (c) => {
  const id = c.req.param('id');
  const [row] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!row) return c.json({ error: 'not_found' }, 404);
  return c.json({ order: row });
});

orderRoutes.patch('/:id', requireAdmin, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    status: z.enum(ORDER_STATUSES).optional(),
    notes: z.string().max(1000).nullable().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'invalid_payload' }, 400);

  const [updated] = await db
    .update(orders)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();

  if (!updated) return c.json({ error: 'not_found' }, 404);
  return c.json({ order: updated });
});

orderRoutes.delete('/:id', requireAdmin, async (c) => {
  const id = c.req.param('id');
  const [deleted] = await db.delete(orders).where(eq(orders.id, id)).returning();
  if (!deleted) return c.json({ error: 'not_found' }, 404);
  return c.json({ ok: true });
});
