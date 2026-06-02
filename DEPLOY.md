# Deploy MARDA en Railway

## Resumen

Una sola Railway service que sirve frontend (Vite build) + backend (Hono API) en el mismo proceso, con Postgres como dependencia.

## Pasos (primera vez)

### 1. Crear Postgres en Railway

En el dashboard del proyecto Railway:
- New → Database → Add PostgreSQL
- Railway inyecta `DATABASE_URL` al servicio automáticamente cuando linkeás los servicios.

### 2. Variables de entorno del servicio web

En el servicio donde corre el código, agregar:

```
NODE_ENV=production
JWT_SECRET=<openssl rand -hex 32>       # secreto fuerte
ADMIN_USERNAME=mardadmin                # o el que quieras
ADMIN_INITIAL_PASSWORD=<contraseña fuerte>
CORS_ORIGINS=https://marda.com.ar,https://www.marda.com.ar
STATIC_DIR=../dist
```

`DATABASE_URL` lo inyecta Railway al linkear con Postgres.

### 3. Deploy

Push a `main` (o la branch que Railway esté escuchando). Railway corre:

```
Build:  npm install && npm run build:all
       (compila frontend a /dist + backend a /server/dist)
Start: npm run db:migrate && npm run start
       (aplica migrations Drizzle + arranca Hono)
```

Ver `nixpacks.toml` y `railway.toml` para detalles.

### 4. Sembrar admin + productos (primera vez)

Una vez que el deploy esté arriba con Postgres, conectate al servicio y corré:

```
npm --prefix server run db:seed
```

Esto:
- Crea el admin con `ADMIN_USERNAME` + `ADMIN_INITIAL_PASSWORD`
- Inserta los 12 productos iniciales

Después del primer seed, **borrá `ADMIN_INITIAL_PASSWORD`** del env y cambiá la contraseña desde el panel admin (cuando tengamos el endpoint de change-password).

### 5. Dominio

Railway → Settings → Networking → Generate Domain (te da `*.up.railway.app`)
o
Settings → Custom Domain → agregar `marda.com.ar` y configurar el CNAME en tu DNS.

Cuando tengas el dominio final, actualizá:
- `VITE_SITE_URL` (env var del servicio) — rebuild necesario porque Vite la inlinea al bundle
- `public/sitemap.xml`, `public/robots.txt`, `index.html` y `src/lib/constants.ts` ya tienen `marda.com.ar` como default. Si tu dominio real es distinto, hacé find/replace global.

## Local dev

```
# Terminal 1 — backend
cd server
cp .env.example .env       # editar DATABASE_URL local + JWT_SECRET
npm install
npm run db:migrate
npm run db:seed
npm run dev                # :3001

# Terminal 2 — frontend
npm install
npm run dev                # :3000, proxies /api → :3001
```

## Endpoints actuales

Públicos:
- `POST /api/orders` — crear pedido (rate-limited)
- `POST /api/newsletter` — suscribir email (rate-limited)
- `GET /api/products` — listar productos (`?category=hombre` para filtrar)
- `GET /api/products/:id` — producto individual
- `GET /api/health` — health check (para Railway)

Admin (requieren `Authorization: Bearer <token>`):
- `POST /api/auth/login` — devuelve token JWT
- `GET /api/auth/me` — admin actual
- `POST /api/products` — crear producto
- `PATCH /api/products/:id` — actualizar
- `DELETE /api/products/:id` — eliminar
- `GET /api/orders` — listar (opcional `?status=pendiente`)
- `GET /api/orders/:id` — pedido individual
- `PATCH /api/orders/:id` — cambiar status / notas
- `DELETE /api/orders/:id` — eliminar
- `GET /api/newsletter` — suscriptores

## Rate limits

- Login: 5 / minuto / IP
- Newsletter: 5 / minuto / IP
- Orders: 8 / minuto / IP

Token-bucket en memoria. Si escalás a múltiples instancias, mover a Redis.

## Migrations futuras

```
cd server
# editar src/db/schema.ts
npm run db:generate         # crea migrations/NNNN_xxx.sql
git commit migrations/
# en prod, db:migrate se corre automáticamente al deploy
```
