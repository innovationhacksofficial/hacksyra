import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { isSubmissionOpenAt } from "@/lib/domain/status";
import { route, Errors } from "@/lib/server/api";
import type { Hackathon } from "@/types";

export const POST = route<undefined, { id: string }>(
  { auth: "required", rateLimit: { limit: 15, windowSec: 60, name: "submit-withdraw" } },
  async ({ user, params }) => {
    const db = adminDb();
    const subRef = db.collection(COLLECTIONS.SUBMISSIONS).doc(params.id);
    const subSnap = await subRef.get();
    if (!subSnap.exists) throw Errors.notFound("Submission not found.");
    const sub = subSnap.data()!;
    if (!(sub.memberIds as string[]).includes(user!.uid)) throw Errors.forbidden();

    const hSnap = await db.collection(COLLECTIONS.HACKATHONS).doc(sub.hackathonId).get();
    const h = hSnap.data() as Hackathon;
    if (!isSubmissionOpenAt(h)) throw Errors.gone("Submissions can't be withdrawn after the deadline.");

    const now = FieldValue.serverTimestamp();
    await Promise.all([
      subRef.update({ status: "withdrawn", isPublic: false, updatedAt: now }),
      hSnap.ref.update({ submissionCount: FieldValue.increment(-1), updatedAt: now }),
    ]);
    return { ok: true };
  }
);

