CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(64) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(32) DEFAULT 'admin' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"source" varchar(64) DEFAULT 'footer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"customer_name" varchar(200) NOT NULL,
	"whatsapp" varchar(32) NOT NULL,
	"email" varchar(200),
	"address" text NOT NULL,
	"items" jsonb NOT NULL,
	"total" integer NOT NULL,
	"status" varchar(32) DEFAULT 'pendiente' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" integer NOT NULL,
	"original_price" integer,
	"category" varchar(32) NOT NULL,
	"sizes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"video" text,
	"in_stock" boolean DEFAULT true NOT NULL,
	"badge" varchar(32),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "admins_username_unique" ON "admins" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_email_unique" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "products_in_stock_idx" ON "products" USING btree ("in_stock");