import { z } from "zod";
import { nanoid } from "nanoid";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { isAdminRole } from "@/lib/auth/roles";
import { publicEnv } from "@/lib/env";
import { notify } from "@/lib/server/notify";
import { audit } from "@/lib/server/audit";
import { route, Errors } from "@/lib/server/api";
import type { CertificateType, Hackathon } from "@/types";

const Body = z.object({
  audience: z.enum(["all_confirmed", "checked_in", "submitted", "winners"]).default("all_confirmed"),
  type: z.enum(["participation", "finalist", "winner", "runner_up", "judge", "mentor", "organizer"]).default("participation"),
});

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: "required", body: Body, rateLimit: { limit: 10, windowSec: 60, name: "org-certs" } },
  async ({ user, body, params, req }) => {
    const db = adminDb();
    const hSnap = await db.collection(COLLECTIONS.HACKATHONS).doc(params.id).get();
    if (!hSnap.exists) throw Errors.notFound("Hackathon not found.");
    const h = hSnap.data() as Hackathon;
    if (!isAdminRole(user!.role) && h.organizerId !== user!.uid) throw Errors.forbidden();

    const targets = new Map<string, { name: string; type: CertificateType }>();

    if (body.audience === "submitted" || body.audience === "winners") {
      const subs = await db.collection(COLLECTIONS.SUBMISSIONS).where("hackathonId", "==", params.id).get();
      for (const d of subs.docs) {
        const s = d.data();
        if (s.status === "withdrawn" || s.status === "draft") continue;
        if (body.audience === "winners" && s.status !== "winner") continue;
        for (const uid of (s.memberIds as string[]) ?? []) {
          const uSnap = await db.collection(COLLECTIONS.USERS).doc(uid).get();
          targets.set(uid, {
            name: (uSnap.data()?.displayName as string) || "Participant",
            type: body.audience === "winners" ? "winner" : body.type,
          });
        }
      }
    } else {
      const statuses = body.audience === "checked_in" ? ["checked_in"] : ["confirmed", "checked_in"];
      const regs = await db.collection(COLLECTIONS.REGISTRATIONS).where("hackathonId", "==", params.id).where("status", "in", statuses).get();
      for (const d of regs.docs) {
        const r = d.data();
        targets.set(r.userId, { name: r.userName || "Participant", type: body.type });
      }
    }

    let issued = 0;
    const base = publicEnv.appUrl.replace(/\/$/, "");
    const now = FieldValue.serverTimestamp();

    for (const [uid, info] of targets) {
      const existing = await db
        .collection(COLLECTIONS.CERTIFICATES)
        .where("hackathonId", "==", params.id)
        .where("userId", "==", uid)
        .where("type", "==", info.type)
        .limit(1)
        .get();
      if (!existing.empty) continue;

      const serial = `HS-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
      await db.collection(COLLECTIONS.CERTIFICATES).doc(serial).set({
        id: serial,
        serialNumber: serial,
        hackathonId: params.id,
        hackathonName: h.name,
        organizerId: h.organizerId,
        userId: uid,
        recipientName: info.name,
        type: info.type,
        issuedAt: now,
        issuedBy: h.organizerName || user!.name || "Innovation Hacks",
        verificationUrl: `${base}/verify/${serial}`,
        isRevoked: false,
        createdAt: now,
        updatedAt: now,
      });

      await notify({
        userId: uid,
        type: "certificate_ready",
        title: `Your certificate for ${h.name} is ready!`,
        message: `Certificate #${serial} (${info.type}) can now be verified and downloaded as a PDF.`,
        linkUrl: `/verify/${serial}`,
        hackathonId: params.id,
        email: { subject: `Certificate issued: ${h.name}` },
      });
      issued += 1;
    }

    await audit({ actorId: user!.uid, action: "certificates.bulk_issued", resource: "certificates", resourceId: params.id, metadata: { issued, audience: body.audience }, req });
    return { ok: true, issued, totalMatched: targets.size };
  }
);

