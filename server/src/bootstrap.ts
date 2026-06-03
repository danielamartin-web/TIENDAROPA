// Bootstrap del admin desde env vars al arrancar el server.
//
// - ADMIN_INITIAL_PASSWORD: crea el admin si no existe. NO sobreescribe.
// - ADMIN_RESET_PASSWORD:   crea o resetea la pass del admin. UPSERT idempotente.
//
// Pensado para Railway: setás la env var, redeploy, login, despues borras la env var.

import { eq } from 'drizzle-orm';
import { env } from './env.js';
import { db } from './db/client.js';
import { admins } from './db/schema.js';
import { hashPassword } from './utils/hash.js';

export async function bootstrapAdmin(): Promise<void> {
  const username = env.ADMIN_USERNAME;

  // Sin username, no hay bootstrap via env vars; usar setup flow desde UI.
  if (!username) {
    if (env.ADMIN_INITIAL_PASSWORD || env.ADMIN_RESET_PASSWORD) {
      console.warn('[bootstrap] ADMIN_INITIAL_PASSWORD/ADMIN_RESET_PASSWORD ignorados — falta ADMIN_USERNAME');
    }
    return;
  }

  // ADMIN_RESET_PASSWORD tiene prioridad — fuerza upsert.
  if (env.ADMIN_RESET_PASSWORD) {
    try {
      const hash = await hashPassword(env.ADMIN_RESET_PASSWORD);
      const [existing] = await db.select().from(admins).where(eq(admins.username, username)).limit(1);

      if (existing) {
        await db.update(admins).set({ passwordHash: hash }).where(eq(admins.id, existing.id));
        console.log(
          `[bootstrap] admin "${username}" password RESETEADA via ADMIN_RESET_PASSWORD env. ` +
          `⚠️  Borrá esa env var ahora — sino se resetea en cada deploy.`
        );
      } else {
        await db.insert(admins).values({ username, passwordHash: hash, role: 'admin' });
        console.log(
          `[bootstrap] admin "${username}" CREADO via ADMIN_RESET_PASSWORD env. ` +
          `⚠️  Borrá esa env var ahora — sino se resetea en cada deploy.`
        );
      }
    } catch (err) {
      console.error('[bootstrap] no se pudo aplicar ADMIN_RESET_PASSWORD:', err);
    }
    return;
  }

  // ADMIN_INITIAL_PASSWORD solo crea si no existe — no sobreescribe.
  if (env.ADMIN_INITIAL_PASSWORD) {
    try {
      const [existing] = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
      if (existing) {
        console.log(`[bootstrap] admin "${username}" ya existe — set ADMIN_RESET_PASSWORD para resetear`);
        return;
      }
      const hash = await hashPassword(env.ADMIN_INITIAL_PASSWORD);
      await db.insert(admins).values({ username, passwordHash: hash, role: 'admin' });
      console.log(`[bootstrap] admin "${username}" CREADO via ADMIN_INITIAL_PASSWORD env`);
    } catch (err) {
      console.error('[bootstrap] no se pudo aplicar ADMIN_INITIAL_PASSWORD:', err);
    }
  } else {
    console.log('[bootstrap] sin ADMIN_INITIAL_PASSWORD ni ADMIN_RESET_PASSWORD — admin no se gestiona desde env');
  }
}
