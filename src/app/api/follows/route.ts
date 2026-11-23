import { z } from "zod";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { route, Errors } from "@/lib/server/api";

const Body = z.object({
  targetId: z.string().min(4),
  targetType: z.enum(["user", "organizer"]).default("user"),
});

export const POST = route(
  { auth: "required", body: Body, rateLimit: { limit: 40, windowSec: 60, name: "follows" } },
  async ({ user, body }) => {
    if (body.targetId === user!.uid) throw Errors.badRequest("You can't follow yourself.");
    const db = adminDb();
    const fId = `${user!.uid}_${body.targetId}`;
    const fRef = db.collection(COLLECTIONS.FOLLOWS).doc(fId);

    const following = await db.runTransaction(async (tx) => {
      const snap = await tx.get(fRef);
      const now = FieldValue.serverTimestamp();
      if (snap.exists) {
        tx.delete(fRef);
        tx.update(db.collection(COLLECTIONS.USERS).doc(user!.uid), { followingCount: FieldValue.increment(-1) });
        tx.update(db.collection(COLLECTIONS.USERS).doc(body.targetId), { followersCount: FieldValue.increment(-1) });
        return false;
      } else {
        tx.set(fRef, { id: fId, followerId: user!.uid, targetId: body.targetId, targetType: body.targetType, createdAt: now });
        tx.update(db.collection(COLLECTIONS.USERS).doc(user!.uid), { followingCount: FieldValue.increment(1) });
        tx.update(db.collection(COLLECTIONS.USERS).doc(body.targetId), { followersCount: FieldValue.increment(1) });
        return true;
      }
    });

    return { following };
  }
);

