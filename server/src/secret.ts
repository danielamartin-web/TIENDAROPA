// Resolucion del JWT secret en runtime (zero-config).
//
// Orden de prioridad:
//   1. env.JWT_SECRET (si seteado, se usa)
//   2. settings.auto_jwt_secret en DB (persistido, sobrevive restarts)
//   3. Nuevo: genera 64 bytes random + persiste en DB
//
// Asi el usuario solo necesita DATABASE_URL en Railway; el resto se autoconfigura.

import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { env } from './env.js';
import { db } from './db/client.js';
import { settings } from './db/schema.js';

const SECRET_KEY = 'auto_jwt_secret';

let cached: Uint8Array | null = null;

export async function resolveJwtSecret(): Promise<Uint8Array> {
  if (cached) return cached;

  if (env.JWT_SECRET && env.JWT_SECRET.length >= 32) {
    cached = new TextEncoder().encode(env.JWT_SECRET);
    return cached;
  }

  try {
    const [row] = await db.select().from(settings).where(eq(settings.key, SECRET_KEY)).limit(1);
    if (row && typeof row.value === 'object' && row.value && 'secret' in (row.value as object)) {
      const secret = (row.value as { secret: string }).secret;
      if (typeof secret === 'string' && secret.length >= 64) {
        cached = new TextEncoder().encode(secret);
        console.log('[secret] usando JWT secret persistido en DB');
        return cached;
      }
    }

    const generated = randomBytes(64).toString('hex');
    await db
      .insert(settings)
      .values({ key: SECRET_KEY, value: { secret: generated } })
      .onConflictDoUpdate({
        target: settings.key,
        value: { secret: generated },
      } as never);
    cached = new TextEncoder().encode(generated);
    console.log('[secret] JWT secret generado y persistido en DB');
    return cached;
  } catch (err) {
    console.error('[secret] no se pudo leer/escribir auto_jwt_secret en DB:', err);
    // Fallback de emergencia: secret efimero. Las sesiones existentes se invalidan
    // en cada restart, pero el server arranca.
    const ephemeral = randomBytes(64).toString('hex');
    cached = new TextEncoder().encode(ephemeral);
    console.warn('[secret] usando secret efimero — sesiones se invalidaran en restart');
    return cached;
  }
}

export function getJwtSecretSync(): Uint8Array {
  if (!cached) {
    throw new Error('[secret] resolveJwtSecret() debe llamarse antes de getJwtSecretSync()');
  }
  return cached;
}
