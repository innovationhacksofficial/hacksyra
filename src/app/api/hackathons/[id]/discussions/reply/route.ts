import { z } from "zod";
import { nanoid } from "nanoid";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS, SUB } from "@/lib/firebase/collections";
import { route, Errors } from "@/lib/server/api";

const Body = z.object({
  threadId: z.string().min(4),
  body: z.string().trim().min(1).max(3000),
});

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: "required", body: Body, rateLimit: { limit: 30, windowSec: 60, name: "discussion-reply" } },
  async ({ user, body, params }) => {
    const db = adminDb();
    const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(params.id);
    const tRef = hRef.collection(SUB.DISCUSSIONS).doc(body.threadId);

    const [hSnap, tSnap, uSnap] = await Promise.all([
      hRef.get(),
      tRef.get(),
      db.collection(COLLECTIONS.USERS).doc(user!.uid).get(),
    ]);
    if (!hSnap.exists || !tSnap.exists) throw Errors.notFound("Discussion thread not found.");
    const h = hSnap.data()!;
    const isOrganizer = h.organizerId === user!.uid || (h.coOrganizerIds ?? []).includes(user!.uid);
    const authorName = (uSnap.data()?.displayName as string) || user!.name || "Builder";

    const rid = `rep_${nanoid(10)}`;
    const now = FieldValue.serverTimestamp();
    const batch = db.batch();
    batch.set(tRef.collection(SUB.REPLIES).doc(rid), {
      id: rid,
      threadId: body.threadId,
      authorId: user!.uid,
      authorName,
      body: body.body,
      isOrganizer,
      createdAt: now,
      updatedAt: now,
    });
    batch.update(tRef, { replyCount: FieldValue.increment(1), updatedAt: now });
    await batch.commit();

    return { ok: true, id: rid };
  }
);

