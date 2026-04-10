import { Router } from "express";
import { db, quoteRequestsTable, quoteRequestItemsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger";
import { requireAdmin, requireAuth, verifyToken } from "../lib/auth";

export const quoteRequestsRouter = Router();

const VALID_STATUSES = ["new", "reviewing", "priced", "sent", "approved", "rejected", "completed"] as const;

const quoteItemSchema = z.object({
  productId: z.number().int().positive(),
  productName: z.string().min(1),
  productSku: z.string().optional(),
  productImageUrl: z.string().optional(),
  quantity: z.number().int().positive().default(1),
});

const createQuoteRequestSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  companyName: z.string().optional(),
  deliveryCity: z.string().optional(),
  message: z.string().optional(),
  items: z.array(quoteItemSchema).min(1),
});

function generateRequestNumber(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const randPart = Math.floor(1000 + Math.random() * 9000);
  return `QR-${datePart}-${randPart}`;
}

// ── POST / — Submit a new quote request ────────────────────────────────────
quoteRequestsRouter.post("/", async (req, res) => {
  const parsed = createQuoteRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
  }

  const { items, ...customerData } = parsed.data;

  let userId: number | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload) userId = payload.sub;
  }

  try {
    const requestNumber = generateRequestNumber();

    const [quoteRequest] = await db
      .insert(quoteRequestsTable)
      .values({
        requestNumber,
        userId,
        customerName: customerData.customerName,
        customerEmail: customerData.customerEmail,
        customerPhone: customerData.customerPhone ?? null,
        companyName: customerData.companyName ?? null,
        deliveryCity: customerData.deliveryCity ?? null,
        message: customerData.message ?? null,
        status: "new",
      })
      .returning();

    await db.insert(quoteRequestItemsTable).values(
      items.map((item) => ({
        quoteRequestId: quoteRequest.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku ?? null,
        productImageUrl: item.productImageUrl ?? null,
        quantity: item.quantity,
      }))
    );

    logger.info({ quoteRequestId: quoteRequest.id, requestNumber }, "Quote request submitted");

    return res.status(201).json({
      id: quoteRequest.id,
      requestNumber: quoteRequest.requestNumber,
      status: quoteRequest.status,
      createdAt: quoteRequest.createdAt,
    });
  } catch (err) {
    logger.error({ err }, "Failed to create quote request");
    return res.status(500).json({ error: "Failed to submit quote request" });
  }
});

// ── GET /my — Customer's own quote requests ────────────────────────────────
quoteRequestsRouter.get("/my", requireAuth, async (req, res) => {
  try {
    const requests = await db
      .select()
      .from(quoteRequestsTable)
      .where(eq(quoteRequestsTable.userId, req.userId!))
      .orderBy(desc(quoteRequestsTable.createdAt));

    const withItems = await Promise.all(
      requests.map(async (qr) => {
        const items = await db
          .select()
          .from(quoteRequestItemsTable)
          .where(eq(quoteRequestItemsTable.quoteRequestId, qr.id));
        return { ...qr, items };
      })
    );

    return res.json(withItems);
  } catch (err) {
    logger.error({ err }, "Failed to fetch user quote requests");
    return res.status(500).json({ error: "Failed to fetch quote requests" });
  }
});

// ── GET /admin — All quote requests for admin ──────────────────────────────
quoteRequestsRouter.get("/admin", requireAdmin, async (_req, res) => {
  try {
    const requests = await db
      .select()
      .from(quoteRequestsTable)
      .orderBy(desc(quoteRequestsTable.createdAt));

    const withItems = await Promise.all(
      requests.map(async (req) => {
        const items = await db
          .select()
          .from(quoteRequestItemsTable)
          .where(eq(quoteRequestItemsTable.quoteRequestId, req.id));
        return { ...req, items };
      })
    );

    return res.json(withItems);
  } catch (err) {
    logger.error({ err }, "Failed to fetch quote requests");
    return res.status(500).json({ error: "Failed to fetch quote requests" });
  }
});

// ── PATCH /admin/:id/status ────────────────────────────────────────────────
quoteRequestsRouter.patch("/admin/:id/status", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid status value", valid: VALID_STATUSES });
  }

  try {
    const [updated] = await db
      .update(quoteRequestsTable)
      .set({ status })
      .where(eq(quoteRequestsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Quote request not found" });
    return res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to update quote request status");
    return res.status(500).json({ error: "Failed to update status" });
  }
});

// ── PATCH /admin/:id/notes ─────────────────────────────────────────────────
quoteRequestsRouter.patch("/admin/:id/notes", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { adminNotes } = req.body as { adminNotes?: string };

  if (typeof adminNotes !== "string") {
    return res.status(400).json({ error: "adminNotes must be a string" });
  }

  try {
    const [updated] = await db
      .update(quoteRequestsTable)
      .set({ adminNotes: adminNotes || null })
      .where(eq(quoteRequestsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Quote request not found" });
    return res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to update admin notes");
    return res.status(500).json({ error: "Failed to update notes" });
  }
});

// ── PATCH /admin/:id/pricing — Save pricing + response to customer ─────────
quoteRequestsRouter.patch("/admin/:id/pricing", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { totalAmount, currency, responseMessage } = req.body as {
    totalAmount?: string;
    currency?: string;
    responseMessage?: string;
  };

  try {
    const [updated] = await db
      .update(quoteRequestsTable)
      .set({
        totalAmount: totalAmount ?? null,
        currency: currency ?? "USD",
        responseMessage: responseMessage ?? null,
      })
      .where(eq(quoteRequestsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Quote request not found" });
    return res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to update pricing");
    return res.status(500).json({ error: "Failed to update pricing" });
  }
});

// ── PATCH /admin/items/:itemId/price — Set unit price for an item ──────────
quoteRequestsRouter.patch("/admin/items/:itemId/price", requireAdmin, async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const { unitPrice } = req.body as { unitPrice?: string };

  try {
    const [updated] = await db
      .update(quoteRequestItemsTable)
      .set({ unitPrice: unitPrice ?? null })
      .where(eq(quoteRequestItemsTable.id, itemId))
      .returning();

    if (!updated) return res.status(404).json({ error: "Item not found" });
    return res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to update item price");
    return res.status(500).json({ error: "Failed to update item price" });
  }
});
