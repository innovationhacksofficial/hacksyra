import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { route, ApiError, Errors } from "@/lib/server/api";
import { createSessionCookieFromIdToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/server";
import { adminAuth } from "@/lib/firebase/admin";

const Body = z.object({ idToken: z.string().min(20) });

/** POST /api/auth/session — exchange a fresh Firebase ID token for an httpOnly session cookie. */
export const POST = route(
  { auth: "none", body: Body, rateLimit: { limit: 20, windowSec: 60, name: "auth-session" } },
  async ({ body }) => {
    try {
      const { cookie, user } = await createSessionCookieFromIdToken(body.idToken);
      const res = NextResponse.json({ ok: true, user: { uid: user.uid, role: user.role } });
      res.cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions());
      return res;
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === "recent_login_required") {
        throw new ApiError(401, "recent_login_required", "Please sign in again to continue.");
      }
      if (code?.startsWith("auth/")) throw Errors.unauthorized("Your sign-in could not be verified. Please try again.");
      throw e;
    }
  }
);

/** DELETE /api/auth/session — sign out: clear the cookie (and revoke all sessions with ?everywhere=1). */
export const DELETE = route({ auth: "optional" }, async ({ user, req }) => {
  if (user && req.nextUrl.searchParams.get("everywhere") === "1") {
    await adminAuth().revokeRefreshTokens(user.uid);
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  return NextResponse.json({ ok: true });
});

/** GET /api/auth/session — is the server-side session valid? */
export const GET = route({ auth: "optional" }, async ({ user }) => {
  return { authenticated: Boolean(user), uid: user?.uid ?? null, role: user?.role ?? null };
});
