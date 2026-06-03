import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  // JWT_SECRET y ADMIN_USERNAME son opcionales: zero-config.
  // Si no estan seteados, el server auto-genera el secret (persistido en DB)
  // y crea el admin via /api/auth/setup en la primera visita a /admin/login.
  JWT_SECRET: z.string().min(32).optional(),
  ADMIN_USERNAME: z.string().min(3).optional(),
  ADMIN_INITIAL_PASSWORD: z.string().min(8).optional(),
  ADMIN_RESET_PASSWORD: z.string().min(8).optional(),
  CORS_ORIGINS: z.string().optional(),
  STATIC_DIR: z.string().default('../dist'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
