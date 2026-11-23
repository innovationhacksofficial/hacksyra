"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { User } from "@/types";

type AuthContextValue = {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserDoc(uid: string) {
    try {
      if (!db || typeof db.type !== "string") return;
      const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
      if (snap.exists()) {
        setUser({ uid, ...snap.data() } as User);
      }
    } catch (e) {
      console.warn("fetchUserDoc failed:", e);
    }
  }

  useEffect(() => {
    if (!auth || typeof auth.onAuthStateChanged !== "function") {
      setLoading(false);
      return;
    }

    try {
      const unsub = onAuthStateChanged(
        auth,
        async (fbUser) => {
          setFirebaseUser(fbUser);
          if (fbUser) {
            await fetchUserDoc(fbUser.uid);
          } else {
            setUser(null);
          }
          setLoading(false);
        },
        (error) => {
          console.warn("Auth state change error:", error);
          setLoading(false);
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn("Failed to subscribe to auth state:", err);
      setLoading(false);
    }
  }, []);

  async function handleSignOut() {
    try {
      if (auth && typeof auth.signOut === "function") {
        await signOut(auth);
      }
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    setFirebaseUser(null);
    setUser(null);
  }

  async function refreshUser() {
    if (firebaseUser) {
      await fetchUserDoc(firebaseUser.uid);
    }
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, user, loading, signOut: handleSignOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
