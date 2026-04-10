import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const userInquiriesTable = pgTable("user_inquiries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  submissionId: text("submission_id"),
  productId: integer("product_id"),
  productName: text("product_name").notNull(),
  productSku: text("product_sku"),
  message: text("message").notNull(),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactCompany: text("contact_company"),
  status: text("status").notNull().default("sent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserInquiry = typeof userInquiriesTable.$inferSelect;
