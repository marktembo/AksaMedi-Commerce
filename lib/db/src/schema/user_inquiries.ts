import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const userInquiriesTable = pgTable("user_inquiries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id"),
  productName: text("product_name").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("sent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserInquiry = typeof userInquiriesTable.$inferSelect;
