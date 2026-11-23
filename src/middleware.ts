import { NextResponse, type NextRequest } from "next/server";
import { verifySessionCookieEdge } from "@/lib/auth/edge-verify";

const SESSION_COOKIE = "__session";
const PROTECTED = ["/dashboard", "/organizer", "/admin", "/judge", "/onboarding"];

function projectId(): string {
  const real = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (real && !/^your[-_]/i.test(real)) return real;
  return "demo-hacksyra";
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-hacksyra-path", pathname + search);

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const emulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
  const session = token ? await verifySessionCookieEdge(token, { projectId: projectId(), emulator }) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(SESSION_COOKIE); // stale / invalid
    return res;
  }

  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && session.role !== "admin" && session.role !== "super_admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "?denied=admin";
    return NextResponse.redirect(url);
  }

  requestHeaders.set("x-hacksyra-uid", session.uid);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Run on everything except static assets & API routes (API routes do their own auth)
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|logos|images|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)$).*)",
  ],
};
