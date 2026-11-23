import "server-only";
import type { NextRequest } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export type AuditInput = {
  actorId: string;
  actorEmail?: string;
  action: string; // e.g. "hackathon.approve", "payment.captured"
  resource: string; // e.g. "hackathons"
  resourceId?: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  status?: "success" | "failure";
  notes?: string;
  metadata?: Record<string, unknown>;
  req?: NextRequest;
};

/** Writes an audit log entry. Never throws (audit failures must not break the action). */
export async function audit(input: AuditInput): Promise<void> {
  try {
    const { req, ...rest } = input;
    await adminDb()
      .collection(COLLECTIONS.AUDIT_LOGS)
      .add({
        ...rest,
        status: rest.status ?? "success",
        ipAddress: req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        userAgent: req?.headers.get("user-agent") ?? null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
  } catch (e) {
    console.error("[audit] failed to write audit log", input.action, e);
  }
}

