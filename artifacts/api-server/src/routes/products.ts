import { Router, type IRouter } from "express";
import { eq, ilike, and, sql } from "drizzle-orm";
import { db, productsTable, categoriesTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  CreateProductBody,
  GetProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { categoryId, search, page, limit, featured } = query.data;
  const offset = ((page ?? 1) - 1) * (limit ?? 20);

  const conditions = [eq(productsTable.published, true)];
  if (categoryId != null) {
    conditions.push(eq(productsTable.categoryId, categoryId));
  }
  if (search) {
    conditions.push(ilike(productsTable.name, `%${search}%`));
  }
  if (featured != null) {
    conditions.push(eq(productsTable.featured, featured));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, countResult] = await Promise.all([
    db
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
        prescriptionRequired: productsTable.prescriptionRequired,
        manufacturer: productsTable.manufacturer,
        sku: productsTable.sku,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where)
      .limit(limit ?? 20)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(where),
  ]);

  res.json({
    products: products.map((p) => ({
      ...p,
      price: parseFloat(p.price),
      originalPrice: p.originalPrice != null ? parseFloat(p.originalPrice) : null,
    })),
    total: countResult[0]?.count ?? 0,
    page: page ?? 1,
    limit: limit ?? 20,
  });
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db.insert(productsTable).values({
    ...parsed.data,
    price: String(parsed.data.price),
    originalPrice: parsed.data.originalPrice != null ? String(parsed.data.originalPrice) : null,
  }).returning();

  res.status(201).json({
    ...product,
    price: parseFloat(product.price),
    originalPrice: product.originalPrice != null ? parseFloat(product.originalPrice) : null,
  });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
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
      prescriptionRequired: productsTable.prescriptionRequired,
      manufacturer: productsTable.manufacturer,
      sku: productsTable.sku,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({
    ...product,
    price: parseFloat(product.price),
    originalPrice: product.originalPrice != null ? parseFloat(product.originalPrice) : null,
  });
});

export default router;
