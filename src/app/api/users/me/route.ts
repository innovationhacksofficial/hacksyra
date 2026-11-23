import { cookies } from "next/headers";
import { adminAuth, adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/server";
import { audit } from "@/lib/server/audit";
import { route } from "@/lib/server/api";

export const DELETE = route(
  { auth: "required", rateLimit: { limit: 3, windowSec: 300, name: "user-delete" } },
  async ({ user, req }) => {
    const db = adminDb();
    const uid = user!.uid;
    const now = FieldValue.serverTimestamp();

    await Promise.all([
      db.collection(COLLECTIONS.USERS).doc(uid).set(
        {
          isActive: false,
          displayName: "Deleted User",
          email: "",
          bio: "",
          githubUrl: "",
          linkedinUrl: "",
          deletedAt: now,
          updatedAt: now,
        },
        { merge: true }
      ),
      db.collection(COLLECTIONS.USER_PROFILES).doc(uid).set(
        { isPublic: false, displayName: "Deleted User", bio: "", updatedAt: now },
        { merge: true }
      ),
    ]);

    await audit({ actorId: uid, actorEmail: user!.email, action: "user.deleted_self", resource: "users", resourceId: uid, req });
    await adminAuth().deleteUser(uid).catch(() => {});
    const jar = await cookies();
    jar.set(SESSION_COOKIE, "", sessionCookieOptions(0));
    return { ok: true };
  }
);

