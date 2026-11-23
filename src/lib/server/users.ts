import "server-only";
import { adminAuth, adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS, DOCS } from "@/lib/firebase/collections";
import { normalizeRole } from "@/lib/auth/roles";
import { serverEnv } from "@/lib/env";
import type { UserRole } from "@/types";

export function sanitizeUsername(raw: string): string {
  const base = raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/@.*$/, "")
    .replace(/[^a-z0-9_]+/g, "")
    .slice(0, 20);
  return base.length >= 3 ? base : `builder${base}`;
}

/** Sets the role custom claim and mirrors it into users/{uid}.roles (for admin queries). */
export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  const rec = await adminAuth().getUser(uid);
  await adminAuth().setCustomUserClaims(uid, { ...(rec.customClaims ?? {}), role });
  await adminDb()
    .collection(COLLECTIONS.USERS)
    .doc(uid)
    .set({ roles: Array.from(new Set(["participant", role])), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

/** Grants "organizer" if the user is still a plain participant (never downgrades admins). */
export async function ensureOrganizerRole(uid: string): Promise<void> {
  const rec = await adminAuth().getUser(uid);
  const current = normalizeRole(rec.customClaims?.role);
  if (current === "participant") await setUserRole(uid, "organizer");
}

/**
 * Idempotently creates users/{uid}, userProfiles/{uid} and a unique usernames/{username} lock.
 * Applies ADMIN_EMAILS bootstrap (verified emails only). Returns the resulting role.
 */
export async function bootstrapUser(params: {
  uid: string;
  requestedRole?: "participant" | "organizer";
  displayName?: string;
}): Promise<{ role: UserRole; created: boolean; username: string }> {
  const db = adminDb();
  const auth = adminAuth();
  const rec = await auth.getUser(params.uid);
  const email = (rec.email ?? "").toLowerCase();
  const displayName = (params.displayName || rec.displayName || email.split("@")[0] || "Builder").slice(0, 80);

  let role = normalizeRole(rec.customClaims?.role);
  const isBootstrapAdmin = email && rec.emailVerified && serverEnv.adminEmails.includes(email);
  if (isBootstrapAdmin && role !== "super_admin") role = "super_admin";
  else if (!rec.customClaims?.role) role = params.requestedRole === "organizer" ? "organizer" : "participant";

  const userRef = db.collection(COLLECTIONS.USERS).doc(params.uid);
  const base = sanitizeUsername(displayName || email);

  const result = await db.runTransaction(async (tx) => {
    const existing = await tx.get(userRef);
    if (existing.exists) {
      const data = existing.data() as { username?: string };
      tx.set(userRef, { roles: Array.from(new Set(["participant", role])), lastActiveAt: FieldValue.serverTimestamp() }, { merge: true });
      return { created: false, username: data.username ?? base };
    }

    // find a free username
    let username = base;
    for (let i = 0; i < 6; i++) {
      const candidate = i === 0 ? base : `${base}${Math.floor(1000 + Math.random() * 9000)}`;
      const lock = await tx.get(db.collection(COLLECTIONS.USERNAMES).doc(candidate));
      if (!lock.exists) {
        username = candidate;
        break;
      }
      if (i === 5) username = `${base}${Date.now().toString(36)}`;
    }

    const now = FieldValue.serverTimestamp();
    tx.set(db.collection(COLLECTIONS.USERNAMES).doc(username), { uid: params.uid, createdAt: now });
    tx.set(userRef, {
      uid: params.uid,
      email,
      displayName,
      username,
      photoURL: rec.photoURL ?? null,
      emailVerified: rec.emailVerified,
      roles: Array.from(new Set(["participant", role])),
      skills: [],
      interests: [],
      languages: [],
      portfolioLinks: [],
      onboardingComplete: false,
      isActive: true,
      isBanned: false,
      lookingForTeam: false,
      followersCount: 0,
      followingCount: 0,
      hackathonsJoined: 0,
      projectsPublished: 0,
      notificationPrefs: { email: true, reminders: true, marketing: false },
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    });
    tx.set(db.collection(COLLECTIONS.USER_PROFILES).doc(params.uid), {
      uid: params.uid,
      username,
      displayName,
      photoURL: rec.photoURL ?? null,
      skills: [],
      technologies: [],
      interests: [],
      socialLinks: [],
      featuredProjects: [],
      hackathonsJoined: 0,
      projectsPublished: 0,
      achievements: [],
      visibility: { email: "private", country: "public", college: "public", skills: "public" },
      isPublic: true,
      lookingForTeam: false,
      updatedAt: now,
    });
    tx.set(
      db.collection(COLLECTIONS.STATS).doc(DOCS.PLATFORM_STATS),
      { users: FieldValue.increment(1), updatedAt: now },
      { merge: true }
    );
    return { created: true, username };
  });

  if (normalizeRole(rec.customClaims?.role) !== role || !rec.customClaims?.role) {
    await auth.setCustomUserClaims(params.uid, { ...(rec.customClaims ?? {}), role });
  }

  return { role, ...result };
}

