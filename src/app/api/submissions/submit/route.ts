import { z } from "zod";
import { nanoid } from "nanoid";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS, DOCS } from "@/lib/firebase/collections";
import { isSubmissionOpenAt } from "@/lib/domain/status";
import { route, Errors } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { notify } from "@/lib/server/notify";
import type { Hackathon, Project, Team } from "@/types";

const Body = z.object({
  hackathonId: z.string().min(4),
  projectId: z.string().min(4),
  trackIds: z.array(z.string()).min(1, "Select at least one track."),
});

export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 15, windowSec: 60, name: "submit-project" } },
  async ({ user, body, req }) => {
    const db = adminDb();
    const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(body.hackathonId);
    const pRef = db.collection(COLLECTIONS.PROJECTS).doc(body.projectId);
    const regRef = db.collection(COLLECTIONS.REGISTRATIONS).doc(`${body.hackathonId}_${user!.uid}`);

    const [hSnap, pSnap, regSnap] = await Promise.all([hRef.get(), pRef.get(), regRef.get()]);
    if (!hSnap.exists) throw Errors.notFound("Hackathon not found.");
    if (!pSnap.exists) throw Errors.notFound("Project not found.");
    if (!regSnap.exists || !["confirmed", "checked_in"].includes(regSnap.data()?.status)) {
      throw Errors.forbidden("You must be registered for this hackathon to submit a project.");
    }

    const h = hSnap.data() as Hackathon;
    if (!isSubmissionOpenAt(h)) {
      throw Errors.gone("The submission deadline for this hackathon has passed.");
    }

    const p = pSnap.data() as Project;
    if (!p.memberIds.includes(user!.uid)) throw Errors.forbidden("You aren't a member of this project.");
    if (!p.title?.trim() || !p.description?.trim()) {
      throw Errors.badRequest("Give your project a title and story description before submitting.");
    }

    const teamId = regSnap.data()?.teamId as string | undefined;
    let memberIds = [user!.uid];
    let teamName: string | null = null;
    if (teamId) {
      const tSnap = await db.collection(COLLECTIONS.TEAMS).doc(teamId).get();
      if (tSnap.exists) {
        const t = tSnap.data() as Team;
        memberIds = t.memberIds;
        teamName = t.name;
      }
    } else if (h.requiresTeam || !h.allowSolo) {
      throw Errors.forbidden("This hackathon requires forming or joining a team before submitting.");
    }

    const subId = `${body.hackathonId}_${teamId || user!.uid}`;
    const subRef = db.collection(COLLECTIONS.SUBMISSIONS).doc(subId);
    const snapId = `snap_${nanoid(12)}`;

    const isNew = await db.runTransaction(async (tx) => {
      const existing = await tx.get(subRef);
      const firstSubmit = !existing.exists || existing.data()?.status === "draft" || existing.data()?.status === "withdrawn";
      const now = FieldValue.serverTimestamp();

      // Immutable snapshot at submission time
      tx.set(db.collection(COLLECTIONS.SUBMISSION_SNAPSHOTS).doc(snapId), {
        id: snapId,
        submissionId: subId,
        hackathonId: body.hackathonId,
        projectId: body.projectId,
        project: {
          title: p.title,
          tagline: p.tagline ?? "",
          description: p.description,
          inspiration: p.inspiration ?? "",
          howItWorks: p.howItWorks ?? "",
          challenges: p.challenges ?? "",
          achievements: p.achievements ?? "",
          lessonsLearned: p.lessonsLearned ?? "",
          futurePlans: p.futurePlans ?? "",
          technologies: p.technologies ?? [],
          repositoryUrl: p.repositoryUrl ?? "",
          liveUrl: p.liveUrl ?? "",
          demoVideoUrl: p.demoVideoUrl ?? "",
          coverImage: p.coverImage ?? "",
        },
        capturedAt: now,
        submittedBy: user!.uid,
      });

      tx.set(
        subRef,
        {
          id: subId,
          hackathonId: body.hackathonId,
          hackathonName: h.name,
          hackathonSlug: h.slug,
          organizerId: h.organizerId,
          projectId: body.projectId,
          projectTitle: p.title,
          projectTagline: p.tagline ?? "",
          technologies: p.technologies ?? [],
          coverImage: p.coverImage ?? null,
          teamId: teamId ?? null,
          teamName,
          memberIds,
          submittedBy: user!.uid,
          status: "submitted",
          isPublic: true,
          trackIds: body.trackIds,
          snapshotId: snapId,
          judgesAssigned: [],
          judgeIds: [],
          submittedAt: now,
          createdAt: existing.exists ? existing.data()!.createdAt : now,
          updatedAt: now,
        },
        { merge: true }
      );

      tx.update(pRef, {
        status: "published",
        isPublic: true,
        linkedHackathons: FieldValue.arrayUnion(body.hackathonId),
        updatedAt: now,
      });

      if (teamId) {
        tx.update(db.collection(COLLECTIONS.TEAMS).doc(teamId), {
          projectId: body.projectId,
          submissionId: subId,
          updatedAt: now,
        });
      }

      if (firstSubmit) {
        tx.update(hRef, { submissionCount: FieldValue.increment(1), updatedAt: now });
        tx.set(
          db.collection(COLLECTIONS.STATS).doc(DOCS.PLATFORM_STATS),
          { totalProjects: FieldValue.increment(1), updatedAt: now },
          { merge: true }
        );
      }
      return firstSubmit;
    });

    await audit({ actorId: user!.uid, action: "submission.submitted", resource: "submissions", resourceId: subId, metadata: { snapId, isNew }, req });
    await Promise.all(
      memberIds.map((uid) =>
        notify({
          userId: uid,
          type: "submission_confirmed",
          title: `Submission received for ${h.name}!`,
          message: `"${p.title}" is submitted and locked in.`,
          linkUrl: "/dashboard/submissions",
          hackathonId: h.id,
          email: { subject: `Project submitted: ${p.title}` },
        })
      )
    );

    return { ok: true, id: subId, snapshotId: snapId };
  }
);

