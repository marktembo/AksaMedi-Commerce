import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, cartItemsTable, productsTable } from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AKS-${ts}-${rand}`;
}

async function buildOrder(order: typeof ordersTable.$inferSelect) {
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    sessionId: order.sessionId,
    status: order.status,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone ?? null,
    shippingAddress: order.shippingAddress,
    city: order.city,
    country: order.country,
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      price: parseFloat(i.price),
      quantity: i.quantity,
      subtotal: parseFloat(i.subtotal),
    })),
    subtotal: parseFloat(order.subtotal),
    shippingCost: parseFloat(order.shippingCost),
    total: parseFloat(order.total),
    notes: order.notes ?? null,
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/orders", async (_req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.createdAt);

  const result = await Promise.all(orders.map(buildOrder));
  res.json(result);
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, customerName, customerEmail, customerPhone, shippingAddress, city, country, notes } = parsed.data;

  const cartItems = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      productName: productsTable.name,
      price: cartItemsTable.price,
      quantity: cartItemsTable.quantity,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  );
  const shippingCost = subtotal > 200 ? 0 : 15;
  const total = subtotal + shippingCost;

  const [order] = await db
    .insert(ordersTable)
    .values({
      orderNumber: generateOrderNumber(),
      sessionId,
      status: "pending",
      customerName,
      customerEmail,
      customerPhone: customerPhone ?? null,
      shippingAddress,
      city,
      country,
      subtotal: String(subtotal),
      shippingCost: String(shippingCost),
      total: String(total),
      notes: notes ?? null,
    })
    .returning();

  await db.insert(orderItemsTable).values(
    cartItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName ?? "Unknown",
      price: item.price,
      quantity: item.quantity,
      subtotal: String(parseFloat(item.price) * item.quantity),
    })),
  );

  await db
    .delete(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  const result = await buildOrder(order);
  res.status(201).json(result);
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOrderParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const result = await buildOrder(order);
  res.json(result);
});

export default router;
