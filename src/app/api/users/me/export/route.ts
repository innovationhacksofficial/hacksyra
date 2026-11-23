import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { route } from "@/lib/server/api";

export const GET = route(
  { auth: "required", rateLimit: { limit: 5, windowSec: 300, name: "user-export" } },
  async ({ user }) => {
    const db = adminDb();
    const uid = user!.uid;
    const [uSnap, pSnap, regs, projects, orders, certs] = await Promise.all([
      db.collection(COLLECTIONS.USERS).doc(uid).get(),
      db.collection(COLLECTIONS.USER_PROFILES).doc(uid).get(),
      db.collection(COLLECTIONS.REGISTRATIONS).where("userId", "==", uid).get(),
      db.collection(COLLECTIONS.PROJECTS).where("memberIds", "array-contains", uid).get(),
      db.collection(COLLECTIONS.ORDERS).where("userId", "==", uid).get(),
      db.collection(COLLECTIONS.CERTIFICATES).where("userId", "==", uid).get(),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      user: uSnap.data() ?? null,
      profile: pSnap.data() ?? null,
      registrations: regs.docs.map((d) => d.data()),
      projects: projects.docs.map((d) => d.data()),
      orders: orders.docs.map((d) => d.data()),
      certificates: certs.docs.map((d) => d.data()),
    };
  }
);

