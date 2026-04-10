import { Router, type IRouter } from "express";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db, savedProductsTable, userInquiriesTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

const saveProductSchema = z.object({
  productId: z.number().int().positive(),
  productName: z.string().min(1),
  productImageUrl: z.string().optional(),
  productCategory: z.string().optional(),
});

const addInquirySchema = z.object({
  productId: z.number().int().positive().optional(),
  productName: z.string().min(1),
  productSku: z.string().optional(),
  message: z.string().min(1),
  submissionId: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactCompany: z.string().optional(),
});

const bulkInquirySchema = z.object({
  submissionId: z.string().min(1),
  products: z.array(z.object({
    productId: z.number().int().positive().optional(),
    productName: z.string().min(1),
    productSku: z.string().optional(),
  })).min(1),
  message: z.string().min(1),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactCompany: z.string().optional(),
});

router.get("/account/saved-products", requireAuth, async (req, res): Promise<void> => {
  const saved = await db
    .select()
    .from(savedProductsTable)
    .where(eq(savedProductsTable.userId, req.userId!))
    .orderBy(savedProductsTable.createdAt);

  res.json(saved);
});

router.post("/account/saved-products", requireAuth, async (req, res): Promise<void> => {
  const parsed = saveProductSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
    return;
  }

  const existing = await db
    .select({ id: savedProductsTable.id })
    .from(savedProductsTable)
    .where(
      and(
        eq(savedProductsTable.userId, req.userId!),
        eq(savedProductsTable.productId, parsed.data.productId),
      ),
    );

  if (existing.length > 0) {
    res.status(409).json({ error: "Product already saved" });
    return;
  }

  const [saved] = await db.insert(savedProductsTable).values({
    userId: req.userId!,
    productId: parsed.data.productId,
    productName: parsed.data.productName,
    productImageUrl: parsed.data.productImageUrl ?? null,
    productCategory: parsed.data.productCategory ?? null,
  }).returning();

  res.status(201).json(saved);
});

router.delete("/account/saved-products/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  await db
    .delete(savedProductsTable)
    .where(and(eq(savedProductsTable.id, id), eq(savedProductsTable.userId, req.userId!)));

  res.status(204).send();
});

router.get("/account/inquiries", requireAuth, async (req, res): Promise<void> => {
  const inquiries = await db
    .select()
    .from(userInquiriesTable)
    .where(eq(userInquiriesTable.userId, req.userId!))
    .orderBy(userInquiriesTable.createdAt);

  res.json(inquiries);
});

router.post("/account/inquiries", requireAuth, async (req, res): Promise<void> => {
  const parsed = addInquirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
    return;
  }

  const [inquiry] = await db.insert(userInquiriesTable).values({
    userId: req.userId!,
    submissionId: parsed.data.submissionId ?? null,
    productId: parsed.data.productId ?? null,
    productName: parsed.data.productName,
    productSku: parsed.data.productSku ?? null,
    message: parsed.data.message,
    contactName: parsed.data.contactName ?? null,
    contactPhone: parsed.data.contactPhone ?? null,
    contactCompany: parsed.data.contactCompany ?? null,
  }).returning();

  res.status(201).json(inquiry);
});

router.post("/account/inquiries/bulk", requireAuth, async (req, res): Promise<void> => {
  const parsed = bulkInquirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
    return;
  }

  const rows = parsed.data.products.map((p) => ({
    userId: req.userId!,
    submissionId: parsed.data.submissionId,
    productId: p.productId ?? null,
    productName: p.productName,
    productSku: p.productSku ?? null,
    message: parsed.data.message,
    contactName: parsed.data.contactName ?? null,
    contactPhone: parsed.data.contactPhone ?? null,
    contactCompany: parsed.data.contactCompany ?? null,
  }));

  const inserted = await db.insert(userInquiriesTable).values(rows).returning();
  res.status(201).json(inserted);
});

router.delete("/account/inquiries/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  await db
    .delete(userInquiriesTable)
    .where(and(eq(userInquiriesTable.id, id), eq(userInquiriesTable.userId, req.userId!)));

  res.status(204).send();
});

export default router;
