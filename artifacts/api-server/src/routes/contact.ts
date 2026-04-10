import { Router } from "express";
import { db, contactSubmissionsTable } from "@workspace/db";
import { z } from "zod";
import { logger } from "../lib/logger";

export const contactRouter = Router();

const contactSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

contactRouter.post("/contact", async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid form data", details: parsed.error.flatten() });
  }

  try {
    const [submission] = await db
      .insert(contactSubmissionsTable)
      .values({
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone ?? null,
        companyName: parsed.data.companyName ?? null,
        subject: parsed.data.subject,
        message: parsed.data.message,
      })
      .returning();

    logger.info({ id: submission.id, email: submission.email }, "Contact form submitted");
    return res.status(201).json({ success: true, id: submission.id });
  } catch (err) {
    logger.error({ err }, "Failed to save contact submission");
    return res.status(500).json({ error: "Failed to submit your message. Please try again." });
  }
});
