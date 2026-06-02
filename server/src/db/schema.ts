import { pgTable, serial, text, integer, boolean, timestamp, jsonb, varchar, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const admins = pgTable(
  'admins',
  {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 64 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 32 }).notNull().default('admin'),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    usernameUnique: uniqueIndex('admins_username_unique').on(t.username),
  })
);

export const products = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description').notNull().default(''),
    price: integer('price').notNull(),
    originalPrice: integer('original_price'),
    category: varchar('category', { length: 32 }).notNull(),
    sizes: jsonb('sizes').$type<string[]>().notNull().default([]),
    images: jsonb('images').$type<string[]>().notNull().default([]),
    video: text('video'),
    inStock: boolean('in_stock').notNull().default(true),
    badge: varchar('badge', { length: 32 }),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    categoryIdx: index('products_category_idx').on(t.category),
    inStockIdx: index('products_in_stock_idx').on(t.inStock),
  })
);

export const orders = pgTable(
  'orders',
  {
    id: varchar('id', { length: 32 }).primaryKey(),
    customerName: varchar('customer_name', { length: 200 }).notNull(),
    whatsapp: varchar('whatsapp', { length: 32 }).notNull(),
    email: varchar('email', { length: 200 }),
    address: text('address').notNull(),
    items: jsonb('items')
      .$type<Array<{ productId: number; name: string; price: number; quantity: number; size: string; image: string }>>()
      .notNull(),
    total: integer('total').notNull(),
    status: varchar('status', { length: 32 }).notNull().default('pendiente'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index('orders_status_idx').on(t.status),
    createdAtIdx: index('orders_created_at_idx').on(t.createdAt),
  })
);

export const newsletterSubscribers = pgTable(
  'newsletter_subscribers',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 320 }).notNull(),
    source: varchar('source', { length: 64 }).notNull().default('footer'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailUnique: uniqueIndex('newsletter_email_unique').on(t.email),
  })
);

export const settings = pgTable('settings', {
  key: varchar('key', { length: 64 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
