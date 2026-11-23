import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, SUB } from "@/lib/firebase/collections";
import { route } from "@/lib/server/api";
import type { Hackathon, Submission } from "@/types";

export const GET = route({ auth: "required" }, async ({ user }) => {
  const db = adminDb();
  const uid = user!.uid;
  const email = (user!.email ?? "").toLowerCase();

  // Check organizer's own hackathons + judge subcollections matching uid or email
  const [byUid, byEmail, own] = await Promise.all([
    db.collectionGroup(SUB.JUDGES).where("uid", "==", uid).get(),
    email ? db.collectionGroup(SUB.JUDGES).where("email", "==", email).get() : Promise.resolve(null),
    db.collection(COLLECTIONS.HACKATHONS).where("organizerId", "==", uid).get(),
  ]);

  const hackIds = new Set<string>();
  byUid.docs.forEach((d) => {
    const hid = d.ref.parent.parent?.id;
    if (hid) hackIds.add(hid);
  });
  byEmail?.docs.forEach((d) => {
    const hid = d.ref.parent.parent?.id;
    if (hid) hackIds.add(hid);
  });
  own.docs.forEach((d) => hackIds.add(d.id));

  const hackathons: (Hackathon & { submissions: Submission[] })[] = [];
  for (const hid of hackIds) {
    const [hSnap, sSnap] = await Promise.all([
      db.collection(COLLECTIONS.HACKATHONS).doc(hid).get(),
      db.collection(COLLECTIONS.SUBMISSIONS).where("hackathonId", "==", hid).get(),
    ]);
    if (!hSnap.exists) continue;
    const h = hSnap.data() as Hackathon;
    const subs = sSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Submission))
      .filter((s) => s.status !== "withdrawn" && s.status !== "draft");
    hackathons.push({ ...h, id: hSnap.id, submissions: subs });
  }

  return { hackathons };
});

