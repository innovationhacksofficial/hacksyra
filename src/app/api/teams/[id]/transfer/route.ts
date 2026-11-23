import { z } from "zod";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { route, Errors } from "@/lib/server/api";
import type { Team } from "@/types";

const Body = z.object({ newCaptainId: z.string().min(4) });

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: "required", body: Body, rateLimit: { limit: 15, windowSec: 60, name: "team-transfer" } },
  async ({ user, body, params }) => {
    const db = adminDb();
    const tRef = db.collection(COLLECTIONS.TEAMS).doc(params.id);
    const tSnap = await tRef.get();
    if (!tSnap.exists) throw Errors.notFound("Team not found.");
    const team = tSnap.data() as Team;

    if (team.captainId !== user!.uid) throw Errors.forbidden("Only the team captain can transfer captaincy.");
    if (!team.memberIds.includes(body.newCaptainId)) throw Errors.badRequest("Selected user is not in your team.");

    const now = FieldValue.serverTimestamp();
    const batch = db.batch();
    batch.update(tRef, { captainId: body.newCaptainId, updatedAt: now });
    batch.update(db.collection(COLLECTIONS.REGISTRATIONS).doc(`${team.hackathonId}_${user!.uid}`), {
      registrationType: "team_member",
      updatedAt: now,
    });
    batch.update(db.collection(COLLECTIONS.REGISTRATIONS).doc(`${team.hackathonId}_${body.newCaptainId}`), {
      registrationType: "team_captain",
      updatedAt: now,
    });
    await batch.commit();
    return { ok: true };
  }
);

