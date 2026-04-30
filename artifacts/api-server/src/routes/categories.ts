import { Router, type IRouter } from "express";
import { sql, eq } from "drizzle-orm";
import { z } from "zod";
import { db, categoriesTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";
import { logger } from "../lib/logger";

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
        SELECT COUNT(*)::int FROM products p WHERE p.category_id = ${categoriesTable.id} AND p.published = true
      )`,
    })
    .from(categoriesTable)
    .orderBy(categoriesTable.name);

  res.json(categories);
});

// Admin: create a new category. Slug auto-generated from name; if a name
// collision happens, returns 409 with the existing row so the client can
// just select it instead.
const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
  description: z.string().trim().max(500).optional().nullable(),
});

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "category";
}

router.post("/admin/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const name = parsed.data.name;
  const description = parsed.data.description ?? null;

  // Case-insensitive duplicate check on name
  const [existing] = await db
    .select()
    .from(categoriesTable)
    .where(sql`lower(${categoriesTable.name}) = lower(${name})`)
    .limit(1);
  if (existing) {
    res.status(409).json({ error: "Category already exists", category: existing });
    return;
  }

  // Generate a unique slug (suffix with -2, -3 if needed)
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let attempt = 1;
  // Cap retries to avoid pathological loops
  while (attempt < 50) {
    const [clash] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, slug)).limit(1);
    if (!clash) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  try {
    const [created] = await db
      .insert(categoriesTable)
      .values({ name, description, slug })
      .returning();
    logger.info({ categoryId: created.id, name }, "Category created");
    res.status(201).json(created);
  } catch (err) {
    logger.error({ err }, "Failed to create category");
    res.status(500).json({ error: "Failed to create category" });
  }
});

export default router;
