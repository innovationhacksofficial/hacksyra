/**
 * Shared bootstrap for CLI scripts (seed, make-admin). Loads .env.local and
 * initialises firebase-admin directly (scripts can't import `server-only` modules).
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* optional */
}

export const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
const placeholder = (v?: string) => !v || /^your[-_]|dummy/i.test(v);

export function initAdmin() {
  if (getApps().length) return { auth: getAuth(), db: getFirestore() };
  if (useEmulators) {
    const host = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "127.0.0.1";
    process.env.FIRESTORE_EMULATOR_HOST ||= `${host}:8080`;
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||= `${host}:9099`;
    const projectId = placeholder(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) ? "demo-hacksyra" : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
    initializeApp({ projectId });
    console.log(`→ Using Firebase EMULATORS (project ${projectId})`);
  } else {
    if (placeholder(process.env.FIREBASE_ADMIN_PRIVATE_KEY)) {
      console.error("✖ FIREBASE_ADMIN_* env vars are not set and emulators are off. See README → Firebase setup.");
      process.exit(1);
    }
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });
    console.log(`→ Using Firebase project ${process.env.FIREBASE_ADMIN_PROJECT_ID}`);
  }
  const db = getFirestore();
  db.settings({ ignoreUndefinedProperties: true });
  return { auth: getAuth(), db };
}

