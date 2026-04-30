import { Router } from "express";
import { db, usersTable, quoteRequestsTable, quoteRequestItemsTable } from "@workspace/db";
import { eq, desc, ilike, or, sql, and } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { logger } from "../lib/logger";

export const adminUsersRouter = Router();

// GET /admin/users  — paginated list with search + per-user quote count
adminUsersRouter.get("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(500, Math.max(1, parseInt((req.query.limit as string) || "20", 10)));
    const offset = (page - 1) * limit;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    const where = search
      ? or(
          ilike(usersTable.fullName, `%${search}%`),
          ilike(usersTable.email, `%${search}%`),
          ilike(usersTable.companyName, `%${search}%`),
        )
      : undefined;

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(where);

    const rows = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        phone: usersTable.phone,
        companyName: usersTable.companyName,
        jobTitle: usersTable.jobTitle,
        role: usersTable.role,
        isActive: usersTable.isActive,
        createdAt: usersTable.createdAt,
        quoteCount: sql<number>`(SELECT COUNT(*)::int FROM quote_requests WHERE quote_requests.user_id = ${usersTable.id})`,
      })
      .from(usersTable)
      .where(where)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ users: rows, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    logger.error({ err }, "Failed to list admin users");
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /admin/users/:id  — single user with all their quote requests
adminUsersRouter.get("/admin/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  try {
    const [user] = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        phone: usersTable.phone,
        companyName: usersTable.companyName,
        jobTitle: usersTable.jobTitle,
        role: usersTable.role,
        isActive: usersTable.isActive,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const quotes = await db
      .select()
      .from(quoteRequestsTable)
      .where(eq(quoteRequestsTable.userId, id))
      .orderBy(desc(quoteRequestsTable.createdAt));

    const quotesWithItems = await Promise.all(
      quotes.map(async (q) => {
        const items = await db
          .select()
          .from(quoteRequestItemsTable)
          .where(eq(quoteRequestItemsTable.quoteRequestId, q.id));
        return { ...q, items };
      }),
    );

    res.json({ user, quotes: quotesWithItems });
  } catch (err) {
    logger.error({ err }, "Failed to fetch admin user detail");
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PATCH /admin/users/:id/active  — toggle active status
adminUsersRouter.patch("/admin/users/:id/active", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { isActive } = req.body as { isActive?: boolean };
  if (isNaN(id) || typeof isActive !== "boolean") {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  try {
    const [updated] = await db
      .update(usersTable)
      .set({ isActive, updatedAt: new Date() })
      .where(and(eq(usersTable.id, id), eq(usersTable.role, "customer")))
      .returning({ id: usersTable.id, isActive: usersTable.isActive });
    if (!updated) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to toggle user active status");
    res.status(500).json({ error: "Failed to update user" });
  }
});
