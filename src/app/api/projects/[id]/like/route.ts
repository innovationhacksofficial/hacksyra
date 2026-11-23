import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { route, Errors } from "@/lib/server/api";

export const POST = route<undefined, { id: string }>(
  { auth: "required", rateLimit: { limit: 40, windowSec: 60, name: "project-like" } },
  async ({ user, params }) => {
    const db = adminDb();
    const pRef = db.collection(COLLECTIONS.PROJECTS).doc(params.id);
    const lRef = pRef.collection("likes").doc(user!.uid);

    const liked = await db.runTransaction(async (tx) => {
      const [pSnap, lSnap] = await Promise.all([tx.get(pRef), tx.get(lRef)]);
      if (!pSnap.exists) throw Errors.notFound("Project not found.");
      if (lSnap.exists) {
        tx.delete(lRef);
        tx.update(pRef, { likesCount: FieldValue.increment(-1) });
        return false;
      } else {
        tx.set(lRef, { userId: user!.uid, createdAt: FieldValue.serverTimestamp() });
        tx.update(pRef, { likesCount: FieldValue.increment(1) });
        return true;
      }
    });

    return { liked };
  }
);

