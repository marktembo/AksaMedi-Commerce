import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, categoriesTable, productsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      description: categoriesTable.description,
      imageUrl: categoriesTable.imageUrl,
      slug: categoriesTable.slug,
      productCount: sql<number>`(
        SELECT COUNT(*)::int FROM products p WHERE p.category_id = ${categoriesTable.id}
      )`,
    })
    .from(categoriesTable)
    .orderBy(categoriesTable.name);

  res.json(categories);
});

export default router;
