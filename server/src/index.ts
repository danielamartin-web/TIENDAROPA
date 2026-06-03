import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { logger } from 'hono/logger';
import { compress } from 'hono/compress';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { env } from './env.js';
import { pingDb } from './db/client.js';
import { bootstrapAdmin } from './bootstrap.js';
import { authRoutes } from './routes/auth.js';
import { productRoutes } from './routes/products.js';
import { orderRoutes } from './routes/orders.js';
import { newsletterRoutes } from './routes/newsletter.js';
import { settingsRoutes } from './routes/settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = path.resolve(__dirname, env.STATIC_DIR);

const app = new Hono();

app.use('*', logger());
app.use('*', secureHeaders());

const allowedOrigins = (env.CORS_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use('/api/*', cors({
  origin: (origin) => {
    if (!origin) return origin;
    if (env.NODE_ENV !== 'production') return origin;
    return allowedOrigins.includes(origin) ? origin : null;
  },
  credentials: true,
}));

app.use('/api/*', compress());

app.get('/api/health', async (c) => {
  const dbOk = await pingDb();
  return c.json({ ok: dbOk, env: env.NODE_ENV, time: new Date().toISOString() }, dbOk ? 200 : 503);
});

app.route('/api/auth', authRoutes);
app.route('/api/products', productRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/newsletter', newsletterRoutes);
app.route('/api/settings', settingsRoutes);

app.notFound((c) => {
  if (c.req.path.startsWith('/api')) {
    return c.json({ error: 'not_found' }, 404);
  }
  return c.text('Not found', 404);
});

app.onError((err, c) => {
  console.error('[error]', err);
  if (c.req.path.startsWith('/api')) {
    return c.json({ error: 'internal_error' }, 500);
  }
  return c.text('Internal Server Error', 500);
});

async function bootStatic() {
  try {
    await fs.access(STATIC_DIR);
    console.log(`[static] serving ${STATIC_DIR}`);

    app.use('/assets/*', serveStatic({
      root: path.relative(process.cwd(), STATIC_DIR),
      onFound: (_p, c) => {
        c.header('Cache-Control', 'public, max-age=31536000, immutable');
      },
    }));

    app.get('*', serveStatic({
      root: path.relative(process.cwd(), STATIC_DIR),
    }));

    const indexHtml = await fs.readFile(path.join(STATIC_DIR, 'index.html'), 'utf8');
    app.get('*', (c) => {
      c.header('Cache-Control', 'no-cache');
      return c.html(indexHtml);
    });
  } catch {
    console.warn(`[static] dir not found at ${STATIC_DIR} — serving API only`);
    app.get('*', (c) => c.text('Backend OK. Build the frontend (npm run build) to serve the SPA.', 200));
  }
}

async function main() {
  await bootStatic();
  // Bootstrap admin desde env vars (no-throw: si falla, el server arranca igual).
  await bootstrapAdmin().catch((err) => console.error('[bootstrap] fatal:', err));
  serve({
    fetch: app.fetch,
    port: env.PORT,
  });
  console.log(`[server] listening on :${env.PORT} (${env.NODE_ENV})`);
}

main().catch((err) => {
  console.error('[server] fatal', err);
  process.exit(1);
});
