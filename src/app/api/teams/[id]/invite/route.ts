import { z } from "zod";
import { nanoid } from "nanoid";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { route, Errors } from "@/lib/server/api";
import { sendEmail } from "@/lib/email/send";
import { renderEmail, escapeHtml } from "@/lib/email/layout";
import type { Team } from "@/types";

const Body = z.object({ email: z.string().trim().email() });

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: "required", body: Body, rateLimit: { limit: 20, windowSec: 60, name: "team-invite" } },
  async ({ user, body, params }) => {
    const db = adminDb();
    const tSnap = await db.collection(COLLECTIONS.TEAMS).doc(params.id).get();
    if (!tSnap.exists) throw Errors.notFound("Team not found.");
    const team = tSnap.data() as Team;
    if (!team.memberIds.includes(user!.uid)) throw Errors.forbidden();

    const meta = await tSnap.ref.collection("private").doc("meta").get();
    const code = (meta.data()?.inviteCode as string) || "";

    const invId = `inv_${nanoid(10)}`;
    await db.collection(COLLECTIONS.TEAM_INVITATIONS).doc(invId).set({
      id: invId,
      teamId: team.id,
      teamName: team.name,
      hackathonId: team.hackathonId,
      inviterId: user!.uid,
      inviteeEmail: body.email.toLowerCase(),
      inviteCode: code,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    });

    await sendEmail({
      to: body.email,
      subject: `Team invitation: join "${team.name}" on HACKSYRA`,
      tag: "team_invitation",
      html: renderEmail({
        title: `You're invited to join ${team.name}`,
        bodyHtml: `<p><strong>${escapeHtml(user!.name || user!.email || "A builder")}</strong> invited you to join team <strong>${escapeHtml(team.name)}</strong> on HACKSYRA.</p><p>Use invite code: <code style="background:#EEF4FF;padding:4px 8px;border-radius:6px;font-weight:bold;color:#1565D8">${escapeHtml(code)}</code></p>`,
        cta: { label: "Join Team", url: `/dashboard/teams?code=${encodeURIComponent(code)}` },
      }),
    });

    return { ok: true, id: invId };
  }
);

