import { z } from "zod";
import { adminAuth, adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS, SUB } from "@/lib/firebase/collections";
import { isAdminRole } from "@/lib/auth/roles";
import { sendEmail } from "@/lib/email/send";
import { renderEmail, escapeHtml } from "@/lib/email/layout";
import { route, Errors } from "@/lib/server/api";
import { notify } from "@/lib/server/notify";

const Body = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().max(80).optional(),
  action: z.enum(["add", "remove", "assign_all"]).default("add"),
});

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: "required", body: Body, rateLimit: { limit: 30, windowSec: 60, name: "org-judges" } },
  async ({ user, body, params }) => {
    const db = adminDb();
    const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(params.id);
    const hSnap = await hRef.get();
    if (!hSnap.exists) throw Errors.notFound("Hackathon not found.");
    const h = hSnap.data()!;
    if (!isAdminRole(user!.role) && h.organizerId !== user!.uid) throw Errors.forbidden();

    const email = body.email.toLowerCase();
    const fbUser = await adminAuth().getUserByEmail(email).catch(() => null);
    const judgeKey = fbUser?.uid ?? email.replace(/[^a-z0-9]/g, "_");
    const jRef = hRef.collection(SUB.JUDGES).doc(judgeKey);

    if (body.action === "remove") {
      await jRef.delete();
      const filtered = ((h.judgeInvites as { email: string }[]) ?? []).filter((j) => j.email.toLowerCase() !== email);
      await hRef.update({ judgeInvites: filtered, updatedAt: FieldValue.serverTimestamp() });
      return { ok: true };
    }

    const now = FieldValue.serverTimestamp();
    await jRef.set({
      uid: fbUser?.uid ?? null,
      email,
      name: body.name || fbUser?.displayName || email.split("@")[0],
      hackathonId: params.id,
      status: fbUser ? "accepted" : "invited",
      addedBy: user!.uid,
      createdAt: now,
      updatedAt: now,
    });

    // Assign this judge UID to all existing hackathon submissions when fbUser exists
    if (fbUser) {
      const subs = await db.collection(COLLECTIONS.SUBMISSIONS).where("hackathonId", "==", params.id).get();
      const batch = db.batch();
      subs.docs.forEach((d) => batch.update(d.ref, { judgeIds: FieldValue.arrayUnion(fbUser.uid) }));
      if (!subs.empty) await batch.commit();

      await notify({
        userId: fbUser.uid,
        type: "judge_invitation",
        title: `You've been assigned as a judge for ${h.name}`,
        message: "Open the Judge Portal to review submissions and score the rubric.",
        linkUrl: "/judge",
        hackathonId: params.id,
        email: { subject: `Judge assignment: ${h.name}` },
      });
    } else {
      await sendEmail({
        to: email,
        subject: `Judge Invitation: ${h.name}`,
        tag: "judge_invitation",
        html: renderEmail({
          title: `You're invited to judge ${h.name}`,
          bodyHtml: `<p>Hi ${escapeHtml(body.name || "Judge")},</p><p>You have been invited to judge <strong>${escapeHtml(h.name)}</strong> on HACKSYRA. Sign up with this email address (${escapeHtml(email)}) to access the Judge Portal.</p>`,
          cta: { label: "Open Judge Portal", url: "/judge" },
        }),
      });
    }

    const invites = ((h.judgeInvites as { email: string; name?: string; status: string; uid?: string }[]) ?? []).filter(
      (j) => j.email.toLowerCase() !== email
    );
    invites.push({ email, name: body.name || fbUser?.displayName, status: fbUser ? "accepted" : "invited", uid: fbUser?.uid });
    await hRef.update({ judgeInvites: invites, updatedAt: now });

    return { ok: true, uid: fbUser?.uid ?? null };
  }
);

