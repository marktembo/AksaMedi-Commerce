import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quoteRequestsTable = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  requestNumber: text("request_number").notNull().unique(),
  userId: integer("user_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  companyName: text("company_name"),
  deliveryCity: text("delivery_city"),
  message: text("message"),
  status: text("status").notNull().default("new"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quoteRequestItemsTable = pgTable("quote_request_items", {
  id: serial("id").primaryKey(),
  quoteRequestId: integer("quote_request_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  productSku: text("product_sku"),
  productImageUrl: text("product_image_url"),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequestsTable).omit({ id: true, createdAt: true });
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type QuoteRequest = typeof quoteRequestsTable.$inferSelect;

export const insertQuoteRequestItemSchema = createInsertSchema(quoteRequestItemsTable).omit({ id: true, createdAt: true });
export type InsertQuoteRequestItem = z.infer<typeof insertQuoteRequestItemSchema>;
export type QuoteRequestItem = typeof quoteRequestItemsTable.$inferSelect;
