/**
 * Edge-runtime session-cookie verification (used by middleware.ts).
 * Firebase session cookies are RS256 JWTs signed with Google's
 * identitytoolkit keys; we verify them with `jose` because firebase-admin
 * cannot run on the Edge.
 *
 * Against the Auth emulator, cookies are unsigned (alg "none"), so we only
 * decode + validate claims — and only when the emulator flag is on.
 */
import { decodeJwt, decodeProtectedHeader, importX509, jwtVerify, type JWTPayload } from "jose";

const CERTS_URL = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys";

let certCache: { certs: Record<string, string>; expiresAt: number } | null = null;

async function getCerts(): Promise<Record<string, string>> {
  if (certCache && certCache.expiresAt > Date.now()) return certCache.certs;
  const res = await fetch(CERTS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch session cookie certs: ${res.status}`);
  const certs = (await res.json()) as Record<string, string>;
  const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get("cache-control") || "")?.[1] || 3600);
  certCache = { certs, expiresAt: Date.now() + maxAge * 1000 };
  return certs;
}

export type EdgeSession = {
  uid: string;
  email?: string;
  role?: string;
  emailVerified?: boolean;
};

function toSession(p: JWTPayload): EdgeSession | null {
  const uid = (p.sub || (p as { user_id?: string }).user_id) as string | undefined;
  if (!uid) return null;
  return {
    uid,
    email: (p as { email?: string }).email,
    role: (p as { role?: string }).role,
    emailVerified: (p as { email_verified?: boolean }).email_verified,
  };
}

export async function verifySessionCookieEdge(
  token: string,
  opts: { projectId: string; emulator: boolean }
): Promise<EdgeSession | null> {
  try {
    if (opts.emulator) {
      const p = decodeJwt(token);
      if (typeof p.exp === "number" && p.exp * 1000 < Date.now()) return null;
      if (p.aud && p.aud !== opts.projectId) return null;
      return toSession(p);
    }
    const { kid, alg } = decodeProtectedHeader(token);
    if (!kid || alg !== "RS256") return null;
    const certs = await getCerts();
    const pem = certs[kid];
    if (!pem) return null;
    const key = await importX509(pem, "RS256");
    const { payload } = await jwtVerify(token, key, {
      issuer: `https://session.firebase.google.com/${opts.projectId}`,
      audience: opts.projectId,
      algorithms: ["RS256"],
    });
    return toSession(payload);
  } catch {
    return null;
  }
}

