import { Router, type IRouter } from "express";
import { sql, eq } from "drizzle-orm";
import { db, productsTable, categoriesTable, ordersTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [
    productCount,
    categoryCount,
    featuredCount,
    orderCount,
    recentOrderCount,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(productsTable),
    db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable),
    db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.featured, true)),
    db.select({ count: sql<number>`count(*)::int` }).from(ordersTable),
    db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(
      sql`created_at > NOW() - INTERVAL '7 days'`
    ),
  ]);

  res.json({
    totalProducts: productCount[0]?.count ?? 0,
    totalCategories: categoryCount[0]?.count ?? 0,
    featuredProducts: featuredCount[0]?.count ?? 0,
    totalOrders: orderCount[0]?.count ?? 0,
    recentOrdersCount: recentOrderCount[0]?.count ?? 0,
  });
});

router.get("/stats/featured-categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      imageUrl: categoriesTable.imageUrl,
      description: categoriesTable.description,
      productCount: sql<number>`(
        SELECT COUNT(*)::int FROM products p WHERE p.category_id = ${categoriesTable.id}
      )`,
    })
    .from(categoriesTable)
    .orderBy(
      sql`(SELECT COUNT(*) FROM products p WHERE p.category_id = ${categoriesTable.id}) DESC`
    )
    .limit(8);

  res.json(categories);
});

export default router;
