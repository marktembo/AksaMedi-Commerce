import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, usersTable, userInquiriesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { verifyAdminCredentials, signAdminToken, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  if (!verifyAdminCredentials(parsed.data.username, parsed.data.password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signAdminToken();
  res.json({ token });
});

router.get("/admin/customers", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db
    .select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      email: usersTable.email,
      phone: usersTable.phone,
      companyName: usersTable.companyName,
      jobTitle: usersTable.jobTitle,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));

  res.json(users);
});

router.get("/admin/inquiries", requireAdmin, async (_req, res): Promise<void> => {
  const inquiries = await db
    .select({
      id: userInquiriesTable.id,
      userId: userInquiriesTable.userId,
      submissionId: userInquiriesTable.submissionId,
      productId: userInquiriesTable.productId,
      productName: userInquiriesTable.productName,
      productSku: userInquiriesTable.productSku,
      message: userInquiriesTable.message,
      contactName: userInquiriesTable.contactName,
      contactPhone: userInquiriesTable.contactPhone,
      contactCompany: userInquiriesTable.contactCompany,
      status: userInquiriesTable.status,
      createdAt: userInquiriesTable.createdAt,
      customerEmail: usersTable.email,
      customerName: usersTable.fullName,
      customerCompany: usersTable.companyName,
    })
    .from(userInquiriesTable)
    .leftJoin(usersTable, eq(userInquiriesTable.userId, usersTable.id))
    .orderBy(desc(userInquiriesTable.createdAt));

  res.json(inquiries);
});

router.patch("/admin/inquiries/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const { status } = req.body as { status?: string };
  if (!status || !["sent", "responded"].includes(status)) {
    res.status(400).json({ error: "Status must be 'sent' or 'responded'" });
    return;
  }

  const [updated] = await db
    .update(userInquiriesTable)
    .set({ status })
    .where(eq(userInquiriesTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Inquiry not found" });
    return;
  }

  res.json(updated);
});

export default router;
