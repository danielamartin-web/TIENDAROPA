// Reset (o crear) el admin con la pass del env.
// Uso:
//   ADMIN_USERNAME=mardadmin ADMIN_RESET_PASSWORD='Marda2025Admin!' npm --prefix server run admin:reset
//
// Hace upsert: si el admin existe le cambia la pass; si no existe lo crea.

import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db, pool } from './client.js';
import { admins } from './schema.js';
import { hashPassword } from '../utils/hash.js';

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_RESET_PASSWORD;

  if (!username || username.length < 3) {
    console.error('[admin:reset] ADMIN_USERNAME no esta seteado (min 3 chars)');
    process.exit(1);
  }
  if (!password || password.length < 8) {
    console.error('[admin:reset] ADMIN_RESET_PASSWORD no esta seteado (min 8 chars)');
    process.exit(1);
  }

  const hash = await hashPassword(password);
  const [existing] = await db.select().from(admins).where(eq(admins.username, username)).limit(1);

  if (existing) {
    await db
      .update(admins)
      .set({ passwordHash: hash })
      .where(eq(admins.id, existing.id));
    console.log(`[admin:reset] OK — password actualizada para "${username}"`);
  } else {
    await db.insert(admins).values({ username, passwordHash: hash, role: 'admin' });
    console.log(`[admin:reset] OK — admin "${username}" creado`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error('[admin:reset] failed:', err);
  process.exit(1);
});
