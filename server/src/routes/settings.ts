import { Hono } from 'hono';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { settings } from '../db/schema.js';
import { requireAdmin } from '../middleware/auth.js';

const SETTINGS_KEY = 'store';

const settingsSchema = z.object({
  storeName: z.string().min(1).max(80).default('MARDA'),
  tagline: z.string().max(120).default(''),
  whatsapp: z.string().min(8).max(32).default(''),
  whatsappSecondary: z.string().max(32).optional(),
  email: z.string().email().max(200).default(''),
  address: z.string().max(200).default(''),
  hours: z.string().max(200).default(''),
  instagram: z.string().max(64).default(''),
  facebook: z.string().max(64).default(''),
  tiktok: z.string().max(64).default(''),
  metaTitle: z.string().max(160).default(''),
  metaDescription: z.string().max(320).default(''),
  keywords: z.string().max(500).default(''),
  googleAnalyticsId: z.string().max(32).default(''),
});

type StoreSettings = z.infer<typeof settingsSchema>;

const DEFAULT_SETTINGS: StoreSettings = settingsSchema.parse({
  storeName: 'MARDA',
  tagline: 'Ropa que te define',
  whatsapp: '5491139199537',
  whatsappSecondary: '5491178204224',
  email: 'info@marda.com.ar',
  address: 'Buenos Aires, Argentina',
  hours: 'Lunes a Viernes 9:00 - 18:00, Sabados 10:00 - 14:00',
  instagram: 'marda.oficial',
  facebook: 'mardaoficial',
  tiktok: 'marda.oficial',
  metaTitle: 'MARDA - Ropa Interior y Juvenil Argentina',
  metaDescription:
    'MARDA: ropa interior y ropa juvenil para hombres y mujeres. Envios a todo el pais. Compra por WhatsApp.',
  keywords: 'ropa interior, lenceria, ropa juvenil, MARDA',
  googleAnalyticsId: '',
});

async function readSettings(): Promise<StoreSettings> {
  const [row] = await db.select().from(settings).where(eq(settings.key, SETTINGS_KEY)).limit(1);
  if (!row) return DEFAULT_SETTINGS;
  const merged = { ...DEFAULT_SETTINGS, ...(row.value as Record<string, unknown>) };
  const parsed = settingsSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}

export const settingsRoutes = new Hono();

settingsRoutes.get('/', async (c) => {
  const value = await readSettings();
  return c.json({ settings: value });
});

settingsRoutes.patch('/', requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = settingsSchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: 'invalid_payload', issues: parsed.error.issues }, 400);

  const current = await readSettings();
  const merged = settingsSchema.parse({ ...current, ...parsed.data });

  await db
    .insert(settings)
    .values({ key: SETTINGS_KEY, value: merged })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: merged, updatedAt: sql`now()` },
    });

  return c.json({ settings: merged });
});
