import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";
import { publicEnv } from "@/lib/env";
import { isAdminRole, normalizeRole } from "@/lib/auth/roles";
import type { UserRole } from "@/types";

export const SESSION_COOKIE = "__session";
/** 14 days — the maximum Firebase allows for session cookies. */
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 14;

export type SessionUser = {
  uid: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  role: UserRole;
};

export function sessionCookieOptions(
  maxAge = SESSION_MAX_AGE_SEC,
  secure = publicEnv.appUrl.startsWith("https://")
) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Exchanges a fresh ID token (signed in < 5 min ago) for a session cookie value. */
export async function createSessionCookieFromIdToken(idToken: string): Promise<{ cookie: string; user: SessionUser }> {
  const decoded = await adminAuth().verifyIdToken(idToken, true);
  const authAgeSec = Date.now() / 1000 - decoded.auth_time;
  if (authAgeSec > 5 * 60) {
    const err = new Error("recent_login_required");
    (err as Error & { code?: string }).code = "recent_login_required";
    throw err;
  }
  const cookie = await adminAuth().createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_SEC * 1000 });
  return {
    cookie,
    user: {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: Boolean(decoded.email_verified),
      name: decoded.name as string | undefined,
      picture: decoded.picture,
      role: normalizeRole(decoded.role),
    },
  };
}

/** Reads + verifies the session cookie (with revocation check). Returns null when signed out. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const value = jar.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const d = await adminAuth().verifySessionCookie(value, true);
    return {
      uid: d.uid,
      email: d.email,
      emailVerified: Boolean(d.email_verified),
      name: d.name as string | undefined,
      picture: d.picture,
      role: normalizeRole(d.role),
    };
  } catch {
    return null;
  }
}

/** For server components/layouts: redirect to /login when signed out. */
export async function requireUser(nextPath?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    const h = await headers();
    const next = nextPath ?? h.get("x-hacksyra-path") ?? "/dashboard";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return user;
}

/** Fresh role straight from Auth (custom claims), bypassing a possibly stale cookie. */
export async function freshRole(uid: string): Promise<UserRole> {
  const rec = await adminAuth().getUser(uid);
  return normalizeRole(rec.customClaims?.role);
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser("/admin");
  const role = await freshRole(user.uid);
  if (!isAdminRole(role)) redirect("/dashboard?denied=admin");
  return { ...user, role };
}

