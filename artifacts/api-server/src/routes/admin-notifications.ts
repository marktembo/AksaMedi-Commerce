import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { logger } from "../lib/logger";

export const adminNotificationsRouter = Router();

// GET /admin/notifications  — list (latest first), optionally filtered by unread
adminNotificationsRouter.get("/admin/notifications", requireAdmin, async (req, res): Promise<void> => {
  try {
    const limit = Math.min(200, Math.max(1, parseInt((req.query.limit as string) || "50", 10)));
    const onlyUnread = req.query.unread === "true";

    const rows = await db
      .select()
      .from(notificationsTable)
      .where(onlyUnread ? eq(notificationsTable.isRead, false) : undefined)
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit);

    const [{ unreadCount }] = await db
      .select({ unreadCount: sql<number>`count(*) FILTER (WHERE is_read = false)::int` })
      .from(notificationsTable);

    // Normalize for the admin client
    const notifications = rows.map((r) => ({
      id: String(r.id),
      type: r.type,
      title: r.title,
      message: r.message,
      link: r.link ?? null,
      read: r.isRead,
      createdAt: r.createdAt,
    }));

    res.json({ notifications, unreadCount });
  } catch (err) {
    logger.error({ err }, "Failed to list notifications");
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// GET /admin/notifications/unread-count — small endpoint for the bell badge
adminNotificationsRouter.get("/admin/notifications/unread-count", requireAdmin, async (_req, res): Promise<void> => {
  try {
    const [{ unreadCount }] = await db
      .select({ unreadCount: sql<number>`count(*) FILTER (WHERE is_read = false)::int` })
      .from(notificationsTable);
    res.json({ unreadCount });
  } catch (err) {
    logger.error({ err }, "Failed to get unread count");
    res.status(500).json({ error: "Failed" });
  }
});

// PATCH /admin/notifications/:id/read
adminNotificationsRouter.patch("/admin/notifications/:id/read", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [row] = await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    res.json(row);
  } catch (err) {
    logger.error({ err }, "Failed to mark notification read");
    res.status(500).json({ error: "Failed to update" });
  }
});

// PATCH /admin/notifications/read-all
adminNotificationsRouter.patch("/admin/notifications/read-all", requireAdmin, async (_req, res): Promise<void> => {
  try {
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.isRead, false));
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Failed to mark all read");
    res.status(500).json({ error: "Failed to update" });
  }
});

// Helper to insert a notification — used by other route modules.
export async function createNotification(data: {
  type: string;
  title: string;
  message: string;
  link?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    await db.insert(notificationsTable).values({
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link ?? null,
      metadata: data.metadata ?? null,
    });
  } catch (err) {
    logger.error({ err, type: data.type }, "Failed to insert notification");
  }
}
