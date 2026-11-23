import type { UserRole } from "@/types";

export const ROLES: UserRole[] = [
  "participant",
  "organizer",
  "judge",
  "mentor",
  "sponsor_rep",
  "moderator",
  "admin",
  "super_admin",
];

export const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];

export function isAdminRole(role?: string | null): boolean {
  return role === "admin" || role === "super_admin";
}

export function normalizeRole(role: unknown): UserRole {
  return typeof role === "string" && (ROLES as string[]).includes(role) ? (role as UserRole) : "participant";
}

/** Where to send a user after login, honouring a safe same-origin `next` param. */
export function homeForRole(role: UserRole | string | undefined | null): string {
  if (isAdminRole(role)) return "/admin";
  if (role === "organizer") return "/organizer";
  if (role === "judge") return "/judge";
  return "/dashboard";
}

export function safeNext(next: string | null | undefined): string | null {
  if (!next) return null;
  try {
    // only allow relative, same-origin paths
    if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
    if (next.startsWith("/login") || next.startsWith("/signup")) return null;
    return next;
  } catch {
    return null;
  }
}
