import { Router } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger";
import { requireAdmin } from "../lib/auth";
import fs from "fs";
import path from "path";

export const adminProductsRouter = Router();

const UPLOADS_DIR = "/home/runner/workspace/artifacts/aksantimed/public/products";

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.string().min(1),
  originalPrice: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  categoryId: z.number().int().positive().optional().nullable(),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  prescriptionRequired: z.boolean().default(false),
  manufacturer: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
});

adminProductsRouter.get("/admin/products", requireAdmin, async (req, res): Promise<void> => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;

    const conditions = [];
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
    if (categoryId) conditions.push(eq(productsTable.categoryId, categoryId));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const products = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        originalPrice: productsTable.originalPrice,
        imageUrl: productsTable.imageUrl,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        inStock: productsTable.inStock,
        stockQuantity: productsTable.stockQuantity,
        featured: productsTable.featured,
        published: productsTable.published,
        prescriptionRequired: productsTable.prescriptionRequired,
        manufacturer: productsTable.manufacturer,
        sku: productsTable.sku,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where)
      .orderBy(desc(productsTable.createdAt));

    res.json(products);
  } catch (err) {
    logger.error({ err }, "Failed to list admin products");
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

adminProductsRouter.post("/admin/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product data", details: parsed.error.flatten() });
    return;
  }

  try {
    const [product] = await db
      .insert(productsTable)
      .values({
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        originalPrice: parsed.data.originalPrice ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
        categoryId: parsed.data.categoryId ?? null,
        inStock: parsed.data.inStock,
        stockQuantity: parsed.data.stockQuantity,
        featured: parsed.data.featured,
        published: parsed.data.published,
        prescriptionRequired: parsed.data.prescriptionRequired,
        manufacturer: parsed.data.manufacturer ?? null,
        sku: parsed.data.sku ?? null,
      })
      .returning();

    logger.info({ productId: product.id }, "Product created by admin");
    res.status(201).json(product);
  } catch (err) {
    logger.error({ err }, "Failed to create product");
    res.status(500).json({ error: "Failed to create product" });
  }
});

adminProductsRouter.put("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product data", details: parsed.error.flatten() });
    return;
  }

  try {
    const [product] = await db
      .update(productsTable)
      .set({
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        originalPrice: parsed.data.originalPrice ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
        categoryId: parsed.data.categoryId ?? null,
        inStock: parsed.data.inStock,
        stockQuantity: parsed.data.stockQuantity,
        featured: parsed.data.featured,
        published: parsed.data.published,
        prescriptionRequired: parsed.data.prescriptionRequired,
        manufacturer: parsed.data.manufacturer ?? null,
        sku: parsed.data.sku ?? null,
      })
      .where(eq(productsTable.id, id))
      .returning();

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    logger.info({ productId: id }, "Product updated by admin");
    res.json(product);
  } catch (err) {
    logger.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Failed to update product" });
  }
});

adminProductsRouter.delete("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    logger.info({ productId: id }, "Product deleted by admin");
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

adminProductsRouter.patch("/admin/products/:id/toggle", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { field } = req.body as { field: "inStock" | "featured" | "published" };

  if (!["inStock", "featured", "published"].includes(field)) {
    res.status(400).json({ error: "Invalid field" });
    return;
  }

  const colMap: Record<string, keyof typeof productsTable.$inferSelect> = {
    inStock: "inStock",
    featured: "featured",
    published: "published",
  };

  try {
    const current = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    if (!current[0]) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const currentValue = current[0][colMap[field] as keyof typeof current[0]] as boolean;

    const updateData: Partial<typeof productsTable.$inferInsert> = {};
    if (field === "inStock") updateData.inStock = !currentValue;
    if (field === "featured") updateData.featured = !currentValue;
    if (field === "published") updateData.published = !currentValue;

    const [updated] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to toggle product field");
    res.status(500).json({ error: "Failed to update product" });
  }
});

adminProductsRouter.patch("/admin/products/:id/stock", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { stockQuantity, inStock } = req.body as { stockQuantity?: number; inStock?: boolean };

  try {
    const updateData: Partial<typeof productsTable.$inferInsert> = {};
    if (typeof stockQuantity === "number") updateData.stockQuantity = stockQuantity;
    if (typeof inStock === "boolean") updateData.inStock = inStock;

    const [updated] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to update stock");
    res.status(500).json({ error: "Failed to update stock" });
  }
});

adminProductsRouter.post("/admin/upload", requireAdmin, async (req, res): Promise<void> => {
  const { imageData, fileName } = req.body as { imageData: string; fileName?: string };

  if (!imageData || !imageData.startsWith("data:image/")) {
    res.status(400).json({ error: "Invalid image data" });
    return;
  }

  try {
    ensureUploadsDir();

    const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      res.status(400).json({ error: "Invalid base64 image format" });
      return;
    }

    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    const safeName = (fileName ?? "upload")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase()
      .slice(0, 40);

    const outputName = `${safeName}-${Date.now()}.${ext}`;
    const outputPath = path.join(UPLOADS_DIR, outputName);

    fs.writeFileSync(outputPath, buffer);

    logger.info({ fileName: outputName }, "Image uploaded by admin");
    res.json({ url: `/products/${outputName}` });
  } catch (err) {
    logger.error({ err }, "Failed to upload image");
    res.status(500).json({ error: "Failed to save image" });
  }
});
