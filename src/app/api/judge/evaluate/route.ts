import { z } from "zod";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS, SUB } from "@/lib/firebase/collections";
import { aggregateScores, weightedScore } from "@/lib/domain/rubric";
import { isAdminRole } from "@/lib/auth/roles";
import { route, Errors } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import type { Hackathon } from "@/types";

const Body = z.object({
  hackathonId: z.string().min(4),
  submissionId: z.string().min(4),
  scores: z.array(z.object({ criterionId: z.string(), score: z.number().min(0), comment: z.string().optional() })),
  comments: z.string().max(2000).optional(),
  hasConflict: z.boolean().default(false),
  submit: z.boolean().default(true),
});

export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 40, windowSec: 60, name: "judge-eval" } },
  async ({ user, body, req }) => {
    const db = adminDb();
    const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(body.hackathonId);
    const subRef = db.collection(COLLECTIONS.SUBMISSIONS).doc(body.submissionId);

    const [hSnap, subSnap] = await Promise.all([hRef.get(), subRef.get()]);
    if (!hSnap.exists || !subSnap.exists) throw Errors.notFound("Hackathon or submission not found.");
    const h = hSnap.data() as Hackathon;
    const sub = subSnap.data()!;

    // Verify caller is assigned judge, organizer, or admin
    const email = (user!.email ?? "").toLowerCase();
    const [jUid, jEmail] = await Promise.all([
      hRef.collection(SUB.JUDGES).where("uid", "==", user!.uid).limit(1).get(),
      email ? hRef.collection(SUB.JUDGES).where("email", "==", email).limit(1).get() : Promise.resolve(null),
    ]);
    const isJudge = !jUid.empty || (jEmail ? !jEmail.empty : false) || (sub.judgeIds ?? []).includes(user!.uid);
    const isOwner = h.organizerId === user!.uid || isAdminRole(user!.role);
    if (!isJudge && !isOwner) throw Errors.forbidden("You are not assigned to judge this hackathon.");

    const total = body.hasConflict ? 0 : weightedScore(h.judgingCriteria ?? [], body.scores);
    const evalId = `${body.submissionId}_${user!.uid}`;
    const evalRef = db.collection(COLLECTIONS.EVALUATIONS).doc(evalId);
    const now = FieldValue.serverTimestamp();

    await evalRef.set({
      id: evalId,
      hackathonId: body.hackathonId,
      submissionId: body.submissionId,
      organizerId: h.organizerId,
      judgeId: user!.uid,
      judgeName: user!.name || user!.email || "Judge",
      scores: body.scores,
      totalScore: total,
      comments: body.comments ?? "",
      hasConflict: body.hasConflict,
      isDraft: !body.submit,
      ...(body.submit ? { submittedAt: now } : {}),
      createdAt: now,
      updatedAt: now,
    });

    // Recompute submission aggregate score across all submitted evaluations
    const allEvals = await db.collection(COLLECTIONS.EVALUATIONS).where("submissionId", "==", body.submissionId).get();
    const avg = aggregateScores(allEvals.docs.map((d) => d.data() as { totalScore: number; hasConflict?: boolean; isDraft?: boolean }));

    if (avg !== null) {
      await subRef.update({ finalScore: avg, status: "judged", updatedAt: now });
    }

    await audit({ actorId: user!.uid, action: "judge.evaluation_saved", resource: "evaluations", resourceId: evalId, metadata: { total, finalScore: avg }, req });
    return { ok: true, totalScore: total, finalScore: avg };
  }
);

