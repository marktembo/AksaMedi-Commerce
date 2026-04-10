import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { PublicUser } from "@workspace/db";

const JWT_SECRET = process.env.SESSION_SECRET ?? "aksantimed-fallback-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";
const SALT_ROUNDS = 12;

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "aksantimed";
const ADMIN_JWT_SECRET = (process.env.SESSION_SECRET ?? "aksantimed-fallback-secret-change-in-production") + "_admin";

export function signToken(userId: number, role: string = "customer"): string {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { sub: number; role: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: number; role: string };
    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function signAdminToken(): string {
  return jwt.sign({ role: "admin" }, ADMIN_JWT_SECRET, { expiresIn: "12h" });
}

export function verifyAdminToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET) as { role: string };
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Admin authentication required" });
    return;
  }
  const token = authHeader.slice(7);

  if (verifyAdminToken(token)) {
    next();
    return;
  }

  const userPayload = verifyToken(token);
  if (userPayload && userPayload.role === "admin") {
    next();
    return;
  }

  res.status(401).json({ error: "Invalid or expired admin token" });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function toPublicUser(user: typeof usersTable.$inferSelect): PublicUser {
  const { passwordHash: _ph, resetToken: _rt, resetTokenExpiry: _rte, ...pub } = user;
  return pub;
}

declare module "express-serve-static-core" {
  interface Request {
    userId?: number;
    currentUser?: PublicUser;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.sub));
  if (!user || !user.isActive) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  req.userId = user.id;
  req.currentUser = toPublicUser(user);
  next();
}
