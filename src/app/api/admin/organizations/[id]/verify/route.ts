import { z } from "zod";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { audit } from "@/lib/server/audit";
import { notify } from "@/lib/server/notify";
import { route, Errors } from "@/lib/server/api";

const Body = z.object({
  status: z.enum(["verified", "rejected", "more_info_required", "suspended"]),
  note: z.string().trim().max(500).optional(),
});

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: ["admin", "super_admin"], body: Body, rateLimit: { limit: 30, windowSec: 60, name: "admin-org" } },
  async ({ user, body, params, req }) => {
    const ref = adminDb().collection(COLLECTIONS.ORGANIZATIONS).doc(params.id);
    const snap = await ref.get();
    if (!snap.exists) throw Errors.notFound("Organization not found.");
    const org = snap.data()!;

    const now = FieldValue.serverTimestamp();
    await ref.update({
      verificationStatus: body.status,
      ...(body.status === "verified" ? { verifiedAt: now } : {}),
      verificationNote: body.note ?? null,
      updatedAt: now,
    });
    await audit({ actorId: user!.uid, actorEmail: user!.email, action: `organization.${body.status}`, resource: "organizations", resourceId: params.id, notes: body.note, req });
    await notify({
      userId: org.ownerId,
      type: "system",
      title: `Organization verification: ${body.status.replace(/_/g, " ")}`,
      message: body.note || `Your organization "${org.name}" is now marked ${body.status}.`,
      linkUrl: "/organizer/settings",
      email: { subject: `Organizer verification update: ${org.name}` },
    });
    return { ok: true, status: body.status };
  }
);

