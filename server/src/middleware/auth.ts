import type { MiddlewareHandler } from 'hono';
import { verifyAdminToken, type JwtPayload } from '../utils/jwt.js';

declare module 'hono' {
  interface ContextVariableMap {
    admin: JwtPayload;
  }
}

export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const auth = c.req.header('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return c.json({ error: 'unauthorized' }, 401);

  const payload = await verifyAdminToken(token);
  if (!payload) return c.json({ error: 'unauthorized' }, 401);

  c.set('admin', payload);
  await next();
};
