"use client";

import type { User as FirebaseUser } from "firebase/auth";
import { createServerSession } from "@/components/providers/AuthProvider";
import { homeForRole, normalizeRole, safeNext } from "@/lib/auth/roles";
import type { UserRole } from "@/types";

/**
 * Runs after ANY successful Firebase sign-in/sign-up:
 *  1. ensures users/{uid} + profile exist (server bootstrap, sets role claim)
 *  2. refreshes the ID token so it carries the claim
 *  3. exchanges it for an httpOnly session cookie (used by middleware)
 * Returns the role and where to navigate next. Throws on failure — callers must
 * show the error and NOT navigate.
 */
export async function completeSignIn(
  fbUser: FirebaseUser,
  opts: { requestedRole?: "participant" | "organizer"; displayName?: string; next?: string | null } = {}
): Promise<{ role: UserRole; redirectTo: string; isNewUser: boolean; onboardingComplete?: boolean }> {
  const token = await fbUser.getIdToken();
  const res = await fetch("/api/users/bootstrap", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role: opts.requestedRole, displayName: opts.displayName }),
  });
  const json = (await res.json().catch(() => ({}))) as { role?: string; created?: boolean; error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message ?? "We couldn't finish setting up your account. Please try again.");

  const ok = await createServerSession(fbUser, true);
  if (!ok) throw new Error("We couldn't start your session. Please try signing in again.");

  const role = normalizeRole(json.role);
  const next = safeNext(opts.next);
  const isNewUser = Boolean(json.created);
  const redirectTo = isNewUser ? `/onboarding${next ? `?next=${encodeURIComponent(next)}` : ""}` : next ?? homeForRole(role);
  return { role, redirectTo, isNewUser };
}

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/user-disabled": "This account has been disabled. Contact support if you think this is a mistake.",
  "auth/too-many-requests": "Too many attempts. Please wait a minute and try again.",
  "auth/email-already-in-use": "An account with this email already exists. Try logging in instead.",
  "auth/weak-password": "Please choose a stronger password (at least 8 characters).",
  "auth/popup-closed-by-user": "The sign-in window was closed before finishing.",
  "auth/cancelled-popup-request": "The sign-in window was closed before finishing.",
  "auth/popup-blocked": "Your browser blocked the sign-in popup. Allow popups and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
  "auth/operation-not-allowed": "This sign-in method isn't enabled yet.",
  "auth/missing-password": "Please enter your password.",
};

export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code;
  if (code && MESSAGES[code]) return MESSAGES[code];
  if (err instanceof Error && err.message && !err.message.startsWith("Firebase:")) return err.message;
  return "Something went wrong. Please try again.";
}

