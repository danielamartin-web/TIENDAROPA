import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { admins } from '../db/schema.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { signAdminToken } from '../utils/jwt.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { requireAdmin } from '../middleware/auth.js';

const loginSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(1).max(200),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'passwords_do_not_match',
    path: ['confirmPassword'],
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

authRoutes.post(
  '/change-password',
  requireAdmin,
  rateLimit({ windowMs: 5 * 60_000, max: 5, keyPrefix: 'change_pw' }),
  async (c) => {
    const adminCtx = c.get('admin');
    const body = await c.req.json().catch(() => null);
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'invalid_payload';
      return c.json({ error: msg }, 400);
    }

    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, Number(adminCtx.sub)))
      .limit(1);
    if (!admin) return c.json({ error: 'unauthorized' }, 401);

    const ok = await verifyPassword(parsed.data.currentPassword, admin.passwordHash);
    if (!ok) return c.json({ error: 'invalid_current_password' }, 401);

    if (parsed.data.currentPassword === parsed.data.newPassword) {
      return c.json({ error: 'new_password_must_differ' }, 400);
    }

    const newHash = await hashPassword(parsed.data.newPassword);
    await db.update(admins).set({ passwordHash: newHash }).where(eq(admins.id, admin.id));

    return c.json({ ok: true });
  }
);
