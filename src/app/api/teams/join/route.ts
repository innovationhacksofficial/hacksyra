import { z } from "zod";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { toMillis } from "@/lib/domain/dates";
import { route, Errors } from "@/lib/server/api";
import { notify } from "@/lib/server/notify";
import type { Hackathon, Team } from "@/types";

const Body = z.object({
  inviteCode: z.string().trim().min(4).max(32).optional(),
  teamId: z.string().min(4).optional(),
});

export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 20, windowSec: 60, name: "team-join" } },
  async ({ user, body }) => {
    const db = adminDb();
    let teamId = body.teamId;

    if (!teamId && body.inviteCode) {
      const code = body.inviteCode.toUpperCase();
      const metaQ = await db.collectionGroup("private").where("inviteCode", "==", code).limit(1).get();
      if (metaQ.empty) throw Errors.notFound("No team found with that invite code.");
      teamId = metaQ.docs[0].ref.parent.parent?.id;
    }
    if (!teamId) throw Errors.badRequest("Provide an invite code or team ID.");

    const teamRef = db.collection(COLLECTIONS.TEAMS).doc(teamId);
    const teamSnap = await teamRef.get();
    if (!teamSnap.exists) throw Errors.notFound("Team not found.");
    const team = teamSnap.data() as Team;

    if (team.memberIds.includes(user!.uid)) return { ok: true, teamId, alreadyMember: true };

    // If joining without inviteCode, team must be open/looking for members
    if (!body.inviteCode && !team.isLookingForMembers) {
      throw Errors.forbidden("This team requires an invite code to join.");
    }

    const hSnap = await db.collection(COLLECTIONS.HACKATHONS).doc(team.hackathonId).get();
    const h = hSnap.data() as Hackathon | undefined;
    const teamDeadline = toMillis(h?.teamFormationDeadline ?? h?.submissionCloseDate);
    if (teamDeadline && Date.now() >= teamDeadline) {
      throw Errors.gone("Team formation deadline has passed.");
    }

    const regRef = db.collection(COLLECTIONS.REGISTRATIONS).doc(`${team.hackathonId}_${user!.uid}`);
    const regSnap = await regRef.get();
    if (!regSnap.exists || !["confirmed", "checked_in"].includes(regSnap.data()?.status)) {
      throw Errors.forbidden("Register for this hackathon first before joining a team.");
    }
    if (regSnap.data()?.teamId) {
      throw Errors.conflict("You already belong to a team in this hackathon.");
    }

    await db.runTransaction(async (tx) => {
      const fresh = await tx.get(teamRef);
      const t = fresh.data() as Team;
      if (t.status === "locked" || t.status === "dissolved") throw Errors.conflict(`Team is ${t.status}.`);
      if (t.memberIds.length >= t.maxSize) throw Errors.conflict("This team is already full.");
      const nextMembers = [...t.memberIds, user!.uid];
      tx.update(teamRef, {
        memberIds: nextMembers,
        status: nextMembers.length >= t.maxSize ? "complete" : "forming",
        updatedAt: FieldValue.serverTimestamp(),
      });
      tx.update(regRef, { teamId, registrationType: "team_member", updatedAt: FieldValue.serverTimestamp() });
      if (t.projectId) {
        tx.update(db.collection(COLLECTIONS.PROJECTS).doc(t.projectId), {
          memberIds: FieldValue.arrayUnion(user!.uid),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    await notify({
      userId: team.captainId,
      type: "team_accepted",
      title: `New teammate joined ${team.name}`,
      message: `${user!.name || user!.email} joined your team.`,
      linkUrl: "/dashboard/teams",
      hackathonId: team.hackathonId,
    });

    return { ok: true, teamId };
  }
);

