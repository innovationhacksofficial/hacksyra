"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  onIdTokenChanged,
  signOut as fbSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { clientAuth, clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { isAdminRole, normalizeRole } from "@/lib/auth/roles";
import type { User, UserRole } from "@/types";

type AuthContextValue = {
  firebaseUser: FirebaseUser | null;
  /** Live users/{uid} document (null until created by /api/users/bootstrap). */
  user: (User & { id?: string }) | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  /** Firebase isn't configured in this environment (shows setup hints instead of crashing). */
  notConfigured: boolean;
  signOut: () => Promise<void>;
  /** Force-refresh the ID token (picks up new custom claims) and re-sync the session cookie. */
  refreshClaims: () => Promise<UserRole>;
  /** Kept for backwards compatibility — the user doc is live, so this is a no-op refresh of claims. */
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  user: null,
  role: "participant",
  isAdmin: false,
  loading: true,
  notConfigured: false,
  signOut: async () => {},
  refreshClaims: async () => "participant",
  refreshUser: async () => {},
});

/** Exchange the current ID token for an httpOnly session cookie. */
export async function createServerSession(fbUser: FirebaseUser, forceRefresh = false): Promise<boolean> {
  const idToken = await fbUser.getIdToken(forceRefresh);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    credentials: "same-origin",
  });
  return res.ok;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [role, setRole] = useState<UserRole>("participant");
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);
  const userUnsub = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!firebaseReady()) {
      setNotConfigured(true);
      setLoading(false);
      return;
    }
    const auth = clientAuth();
    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      userUnsub.current?.();
      userUnsub.current = null;

      if (!fbUser) {
        setUser(null);
        setRole("participant");
        setLoading(false);
        return;
      }

      try {
        const token = await fbUser.getIdTokenResult();
        setRole(normalizeRole(token.claims.role));
      } catch {
        setRole("participant");
      }

      userUnsub.current = onSnapshot(
        doc(clientDb(), COLLECTIONS.USERS, fbUser.uid),
        (snap) => {
          setUser(snap.exists() ? ({ id: snap.id, uid: snap.id, ...snap.data() } as AuthContextValue["user"]) : null);
          setLoading(false);
        },
        () => setLoading(false)
      );
    });
    return () => {
      unsub();
      userUnsub.current?.();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
    } catch {
      /* ignore network errors; local sign-out still happens */
    }
    if (firebaseReady()) await fbSignOut(clientAuth());
    setUser(null);
    setFirebaseUser(null);
    setRole("participant");
  }, []);

  const refreshClaims = useCallback(async (): Promise<UserRole> => {
    if (!firebaseReady()) return "participant";
    const u = clientAuth().currentUser;
    if (!u) return "participant";
    const res = await u.getIdTokenResult(true);
    const r = normalizeRole(res.claims.role);
    setRole(r);
    return r;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      user,
      role,
      isAdmin: isAdminRole(role),
      loading,
      notConfigured,
      signOut,
      refreshClaims,
      refreshUser: async () => {
        await refreshClaims();
      },
    }),
    [firebaseUser, user, role, loading, notConfigured, signOut, refreshClaims]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
