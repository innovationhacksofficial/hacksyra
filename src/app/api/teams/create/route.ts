import { z } from "zod";
import { nanoid } from "nanoid";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { slugify } from "@/lib/domain/slug";
import { toMillis } from "@/lib/domain/dates";
import { route, Errors } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import type { Hackathon } from "@/types";

const Body = z.object({
  hackathonId: z.string().min(4),
  name: z.string().trim().min(2, "Team name must be at least 2 characters.").max(60),
  description: z.string().trim().max(300).optional(),
  skills: z.array(z.string().trim()).max(10).default([]),
  isLookingForMembers: z.boolean().default(true),
});

export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 15, windowSec: 60, name: "team-create" } },
  async ({ user, body, req }) => {
    const db = adminDb();
    const hSnap = await db.collection(COLLECTIONS.HACKATHONS).doc(body.hackathonId).get();
    if (!hSnap.exists) throw Errors.notFound("Hackathon not found.");
    const h = hSnap.data() as Hackathon;

    const teamDeadline = toMillis(h.teamFormationDeadline ?? h.submissionCloseDate);
    if (teamDeadline && Date.now() >= teamDeadline) {
      throw Errors.gone("Team formation deadline has passed for this hackathon.");
    }

    const regRef = db.collection(COLLECTIONS.REGISTRATIONS).doc(`${body.hackathonId}_${user!.uid}`);
    const regSnap = await regRef.get();
    if (!regSnap.exists || !["confirmed", "checked_in"].includes(regSnap.data()?.status)) {
      throw Errors.forbidden("You must have a confirmed registration for this hackathon before forming a team.");
    }
    if (regSnap.data()?.teamId) {
      throw Errors.conflict("You're already in a team for this hackathon. Leave it first to create a new one.");
    }

    const teamId = `team_${nanoid(12)}`;
    const inviteCode = nanoid(8).toUpperCase();
    const now = FieldValue.serverTimestamp();

    const batch = db.batch();
    batch.set(db.collection(COLLECTIONS.TEAMS).doc(teamId), {
      id: teamId,
      hackathonId: body.hackathonId,
      hackathonName: h.name,
      hackathonSlug: h.slug,
      name: body.name,
      slug: `${slugify(body.name) || "team"}-${nanoid(4).toLowerCase()}`,
      description: body.description ?? "",
      captainId: user!.uid,
      memberIds: [user!.uid],
      skills: body.skills,
      status: "forming",
      isPublic: true,
      isLookingForMembers: body.isLookingForMembers,
      maxSize: h.maxTeamSize || 4,
      createdAt: now,
      updatedAt: now,
    });
    // Secret invite code stored in members-only private subcollection (per firestore.rules)
    batch.set(db.collection(COLLECTIONS.TEAMS).doc(teamId).collection("private").doc("meta"), {
      inviteCode,
      createdAt: now,
    });
    batch.update(regRef, { teamId, registrationType: "team_captain", updatedAt: now });
    batch.update(hSnap.ref, { teamCount: FieldValue.increment(1), updatedAt: now });
    await batch.commit();

    await audit({ actorId: user!.uid, action: "team.created", resource: "teams", resourceId: teamId, req });
    return { id: teamId, inviteCode };
  }
);

