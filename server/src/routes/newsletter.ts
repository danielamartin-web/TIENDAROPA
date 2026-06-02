import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/client.js';
import { newsletterSubscribers } from '../db/schema.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { requireAdmin } from '../middleware/auth.js';
import { desc } from 'drizzle-orm';

const subscribeSchema = z.object({
  email: z.string().email().max(320),
  source: z.string().max(64).optional(),
});

export const newsletterRoutes = new Hono();

newsletterRoutes.post(
  '/',
  rateLimit({ windowMs: 60_000, max: 5, keyPrefix: 'nl' }),
  async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: 'invalid_email' }, 400);

    try {
      await db
        .insert(newsletterSubscribers)
        .values({
          email: parsed.data.email.toLowerCase(),
          source: parsed.data.source ?? 'footer',
        });
      return c.json({ ok: true }, 201);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === '23505') return c.json({ ok: true, alreadySubscribed: true }, 409);
      throw err;
    }
  }
);

newsletterRoutes.get('/', requireAdmin, async (c) => {
  const rows = await db
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.createdAt))
    .limit(2000);
  return c.json({ subscribers: rows });
});
