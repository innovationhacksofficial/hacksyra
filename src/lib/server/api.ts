import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodType, type ZodTypeDef } from "zod";
import { cookies } from "next/headers";
import { adminAuth, AdminNotConfiguredError } from "@/lib/firebase/admin";
import { SESSION_COOKIE, type SessionUser } from "@/lib/auth/server";
import { isAdminRole, normalizeRole } from "@/lib/auth/roles";
import { rateLimit } from "@/lib/server/ratelimit";
import type { UserRole } from "@/types";

// ─────────────────────────────────────────────────────────────
// Errors — consistent shape: { error: { code, message, details? } }
// ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export const Errors = {
  badRequest: (message = "Invalid request.", details?: unknown) => new ApiError(400, "bad_request", message, details),
  unauthorized: (message = "Please sign in to continue.") => new ApiError(401, "unauthorized", message),
  forbidden: (message = "You don't have permission to do that.") => new ApiError(403, "forbidden", message),
  notFound: (message = "Not found.") => new ApiError(404, "not_found", message),
  conflict: (message: string, details?: unknown) => new ApiError(409, "conflict", message, details),
  gone: (message: string) => new ApiError(410, "deadline_passed", message),
  tooMany: () => new ApiError(429, "rate_limited", "Too many requests. Please slow down and try again shortly."),
  notConfigured: (service: string) =>
    new ApiError(503, "not_configured", `${service} is not configured on this server yet.`),
  internal: (message = "Something went wrong. Please try again.") => new ApiError(500, "internal", message),
};

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) } },
      { status: err.status }
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "validation_error", message: err.issues[0]?.message ?? "Invalid input.", details: err.flatten() } },
      { status: 422 }
    );
  }
  if (err instanceof AdminNotConfiguredError) {
    console.error(err.message);
    return NextResponse.json(
      {
        error: {
          code: "not_configured",
          message:
            "Firebase Admin SDK is not configured on the server yet. Add FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY to .env.local.",
        },
      },
      { status: 503 }
    );
  }
  console.error("[api] unhandled error", err);
  return NextResponse.json({ error: { code: "internal", message: "Something went wrong. Please try again." } }, { status: 500 });
}

// ─────────────────────────────────────────────────────────────
// Auth resolution: Bearer ID token (fresh claims) → session cookie
// ─────────────────────────────────────────────────────────────

export async function resolveUser(req: NextRequest): Promise<SessionUser | null> {
  const authz = req.headers.get("authorization");
  if (authz?.startsWith("Bearer ")) {
    try {
      const d = await adminAuth().verifyIdToken(authz.slice(7), true);
      return {
        uid: d.uid,
        email: d.email,
        emailVerified: Boolean(d.email_verified),
        name: d.name as string | undefined,
        picture: d.picture,
        role: normalizeRole(d.role),
      };
    } catch (e) {
      if (e instanceof AdminNotConfiguredError) throw e;
      return null;
    }
  }
  const jar = await cookies();
  const c = jar.get(SESSION_COOKIE)?.value;
  if (!c) return null;
  try {
    const d = await adminAuth().verifySessionCookie(c, true);
    return {
      uid: d.uid,
      email: d.email,
      emailVerified: Boolean(d.email_verified),
      name: d.name as string | undefined,
      picture: d.picture,
      role: normalizeRole(d.role),
    };
  } catch (e) {
    if (e instanceof AdminNotConfiguredError) throw e;
    return null;
  }
}

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Basic CSRF defence for cookie-authenticated state-changing requests. */
function assertSameOrigin(req: NextRequest) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return;
  if (req.headers.get("authorization")?.startsWith("Bearer ")) return; // token auth isn't ambient
  const origin = req.headers.get("origin");
  if (!origin) return; // non-browser clients
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  try {
    if (new URL(origin).host !== host) throw Errors.forbidden("Cross-origin request blocked.");
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw Errors.forbidden("Cross-origin request blocked.");
  }
}

// ─────────────────────────────────────────────────────────────
// Route wrapper
// ─────────────────────────────────────────────────────────────

type AuthMode = "none" | "optional" | "required" | UserRole[];

export type RouteCtx<B, P> = {
  req: NextRequest;
  user: SessionUser | null;
  body: B;
  params: P;
  ip: string;
};

type Options<B> = {
  auth?: AuthMode;
  body?: ZodType<B, ZodTypeDef, unknown>;
  /** e.g. { limit: 10, windowSec: 60 }. Keyed by user (if signed in) else IP. */
  rateLimit?: { limit: number; windowSec: number; name?: string };
  /** Skip same-origin check (webhooks, cron). */
  skipOriginCheck?: boolean;
};

export function route<B = undefined, P = Record<string, string>>(
  opts: Options<B>,
  fn: (ctx: RouteCtx<B, P>) => Promise<unknown>
) {
  return async (req: NextRequest, context: { params: Promise<P> }) => {
    try {
      if (!opts.skipOriginCheck) assertSameOrigin(req);
      const ip = clientIp(req);
      const mode = opts.auth ?? "required";

      let user: SessionUser | null = null;
      if (mode !== "none") {
        user = await resolveUser(req);
        if (!user && mode !== "optional") throw Errors.unauthorized();
        if (user && Array.isArray(mode)) {
          // role-gated: always use fresh claims
          const rec = await adminAuth().getUser(user.uid);
          const role = normalizeRole(rec.customClaims?.role);
          user = { ...user, role };
          const allowed = mode.includes(role) || (isAdminRole(role) && mode.some((m) => isAdminRole(m)));
          if (!allowed) throw Errors.forbidden();
        }
      }

      if (opts.rateLimit) {
        const key = `${opts.rateLimit.name ?? req.nextUrl.pathname}:${user?.uid ?? ip}`;
        const r = await rateLimit(key, opts.rateLimit.limit, opts.rateLimit.windowSec);
        if (!r.ok) throw Errors.tooMany();
      }

      let body = undefined as B;
      if (opts.body) {
        let json: unknown = {};
        if (req.method !== "GET") {
          try {
            json = await req.json();
          } catch {
            throw Errors.badRequest("Request body must be valid JSON.");
          }
        } else {
          json = Object.fromEntries(req.nextUrl.searchParams.entries());
        }
        body = opts.body.parse(json);
      }

      const params = (await context?.params) ?? ({} as P);
      const result = await fn({ req, user, body, params, ip });
      if (result instanceof Response) return result;
      return NextResponse.json(result ?? { ok: true });
    } catch (err) {
      return errorResponse(err);
    }
  };
}

