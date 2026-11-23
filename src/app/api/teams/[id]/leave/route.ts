import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { route, Errors } from "@/lib/server/api";
import type { Team } from "@/types";

export const POST = route<undefined, { id: string }>(
  { auth: "required", rateLimit: { limit: 15, windowSec: 60, name: "team-leave" } },
  async ({ user, params }) => {
    const db = adminDb();
    const tRef = db.collection(COLLECTIONS.TEAMS).doc(params.id);
    const tSnap = await tRef.get();
    if (!tSnap.exists) throw Errors.notFound("Team not found.");
    const team = tSnap.data() as Team;

    if (!team.memberIds.includes(user!.uid)) throw Errors.forbidden("You are not in this team.");
    if (team.captainId === user!.uid && team.memberIds.length > 1) {
      throw Errors.conflict("Transfer captaincy to a teammate before leaving the team.");
    }

    const now = FieldValue.serverTimestamp();
    const batch = db.batch();
    const regRef = db.collection(COLLECTIONS.REGISTRATIONS).doc(`${team.hackathonId}_${user!.uid}`);
    batch.update(regRef, { teamId: FieldValue.delete(), registrationType: "individual", updatedAt: now });

    if (team.memberIds.length <= 1) {
      batch.update(tRef, { memberIds: [], status: "dissolved", updatedAt: now });
      batch.update(db.collection(COLLECTIONS.HACKATHONS).doc(team.hackathonId), {
        teamCount: FieldValue.increment(-1),
        updatedAt: now,
      });
    } else {
      batch.update(tRef, {
        memberIds: FieldValue.arrayRemove(user!.uid),
        status: "forming",
        updatedAt: now,
      });
    }
    await batch.commit();
    return { ok: true };
  }
);

