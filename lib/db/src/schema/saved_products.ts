import { pgTable, serial, integer, timestamp, text, unique } from "drizzle-orm/pg-core";

export const savedProductsTable = pgTable("saved_products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImageUrl: text("product_image_url"),
  productCategory: text("product_category"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("uq_user_product").on(table.userId, table.productId),
]);

export type SavedProduct = typeof savedProductsTable.$inferSelect;
