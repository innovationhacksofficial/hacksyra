import { z } from "zod";
import { nanoid } from "nanoid";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS, SUB } from "@/lib/firebase/collections";
import { isAdminRole } from "@/lib/auth/roles";
import { notify } from "@/lib/server/notify";
import { audit } from "@/lib/server/audit";
import { route, Errors } from "@/lib/server/api";
import type { Hackathon } from "@/types";

const Body = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(5).max(5000),
  pinned: z.boolean().default(false),
  sendEmail: z.boolean().default(true),
});

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: "required", body: Body, rateLimit: { limit: 20, windowSec: 60, name: "org-announce" } },
  async ({ user, body, params, req }) => {
    const db = adminDb();
    const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(params.id);
    const hSnap = await hRef.get();
    if (!hSnap.exists) throw Errors.notFound("Hackathon not found.");
    const h = hSnap.data() as Hackathon;
    if (!isAdminRole(user!.role) && h.organizerId !== user!.uid) throw Errors.forbidden();

    const aid = `ann_${nanoid(10)}`;
    const now = FieldValue.serverTimestamp();
    await hRef.collection(SUB.ANNOUNCEMENTS).doc(aid).set({
      id: aid,
      hackathonId: params.id,
      authorId: user!.uid,
      title: body.title,
      body: body.body,
      pinned: body.pinned,
      emailed: body.sendEmail,
      createdAt: now,
      updatedAt: now,
    });

    const regs = await db
      .collection(COLLECTIONS.REGISTRATIONS)
      .where("hackathonId", "==", params.id)
      .where("status", "in", ["confirmed", "checked_in", "waitlisted"])
      .limit(500)
      .get();

    for (const r of regs.docs) {
      const uid = (r.data() as { userId: string }).userId;
      await notify({
        userId: uid,
        type: "announcement",
        title: `[${h.name}] ${body.title}`,
        message: body.body.slice(0, 220),
        linkUrl: `/hackathons/${h.slug}?tab=updates`,
        hackathonId: params.id,
        email: body.sendEmail ? { subject: `${h.name}: ${body.title}` } : undefined,
      });
    }

    await audit({ actorId: user!.uid, action: "hackathon.announcement_posted", resource: "hackathons", resourceId: params.id, metadata: { aid, recipients: regs.size }, req });
    return { ok: true, id: aid, recipients: regs.size };
  }
);

