import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { admins } from '../db/schema.js';
import { verifyPassword } from '../utils/hash.js';
import { signAdminToken } from '../utils/jwt.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { requireAdmin } from '../middleware/auth.js';

const loginSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(1).max(200),
});

export const authRoutes = new Hono();

authRoutes.post(
  '/login',
  rateLimit({ windowMs: 60_000, max: 5, keyPrefix: 'login' }),
  async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: 'invalid_payload' }, 400);

    const { username, password } = parsed.data;

    const [admin] = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
    if (!admin) return c.json({ error: 'invalid_credentials' }, 401);

    const ok = await verifyPassword(password, admin.passwordHash);
    if (!ok) return c.json({ error: 'invalid_credentials' }, 401);

    await db.update(admins).set({ lastLoginAt: new Date() }).where(eq(admins.id, admin.id));

    const token = await signAdminToken({
      sub: String(admin.id),
      username: admin.username,
      role: 'admin',
    });

    return c.json({ token, username: admin.username });
  }
);

authRoutes.get('/me', requireAdmin, (c) => {
  const admin = c.get('admin');
  return c.json({ username: admin.username, role: admin.role });
});
