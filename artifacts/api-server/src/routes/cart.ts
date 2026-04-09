import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import {
  GetCartQueryParams,
  AddToCartBody,
  UpdateCartItemParams,
  UpdateCartItemBody,
  RemoveCartItemParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function buildCart(sessionId: string) {
  const items = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      productName: productsTable.name,
      productImageUrl: productsTable.imageUrl,
      price: cartItemsTable.price,
      quantity: cartItemsTable.quantity,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  const cartItems = items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.productName ?? "Unknown",
    productImageUrl: item.productImageUrl ?? null,
    price: parseFloat(item.price),
    quantity: item.quantity,
    subtotal: parseFloat(item.price) * item.quantity,
  }));

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    sessionId,
    items: cartItems,
    subtotal,
    total: subtotal,
    itemCount,
  };
}

router.get("/cart", async (req, res): Promise<void> => {
  const query = GetCartQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const cart = await buildCart(query.data.sessionId);
  res.json(cart);
});

router.post("/cart", async (req, res): Promise<void> => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, productId, quantity } = parsed.data;
  const qty = quantity ?? 1;

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [existingItem] = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)));

  if (existingItem) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existingItem.quantity + qty })
      .where(eq(cartItemsTable.id, existingItem.id));
  } else {
    await db.insert(cartItemsTable).values({
      sessionId,
      productId,
      quantity: qty,
      price: product.price,
    });
  }

  const cart = await buildCart(sessionId);
  res.json(cart);
});

router.put("/cart/items/:itemId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const params = UpdateCartItemParams.safeParse({ itemId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, quantity } = parsed.data;

  if (quantity <= 0) {
    await db
      .delete(cartItemsTable)
      .where(and(eq(cartItemsTable.id, params.data.itemId), eq(cartItemsTable.sessionId, sessionId)));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(and(eq(cartItemsTable.id, params.data.itemId), eq(cartItemsTable.sessionId, sessionId)));
  }

  const cart = await buildCart(sessionId);
  res.json(cart);
});

router.delete("/cart/items/:itemId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const params = RemoveCartItemParams.safeParse({ itemId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { sessionId } = req.body as { sessionId: string };
  if (!sessionId) {
    res.status(400).json({ error: "sessionId required in body" });
    return;
  }

  await db
    .delete(cartItemsTable)
    .where(and(eq(cartItemsTable.id, params.data.itemId), eq(cartItemsTable.sessionId, sessionId)));

  const cart = await buildCart(sessionId);
  res.json(cart);
});

export default router;
