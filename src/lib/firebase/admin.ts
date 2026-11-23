import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";
import { isRealValue, publicEnv, resolvedProjectId } from "@/lib/env";

export class AdminNotConfiguredError extends Error {
  constructor(missing: string[]) {
    super(
      `[HACKSYRA] Firebase Admin SDK is not configured. Missing: ${missing.join(", ")}. ` +
        "Add a service account to .env.local (README → Firebase setup) or run with the emulators " +
        "(NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true)."
    );
    this.name = "AdminNotConfiguredError";
  }
}

const APP_NAME = "hacksyra-admin";
let cached: { app: App; db: Firestore; auth: Auth; storage: Storage } | null = null;

export function isAdminConfigured(): boolean {
  if (publicEnv.useEmulators) return true;
  return (
    isRealValue(process.env.FIREBASE_ADMIN_PROJECT_ID) &&
    isRealValue(process.env.FIREBASE_ADMIN_CLIENT_EMAIL) &&
    isRealValue(process.env.FIREBASE_ADMIN_PRIVATE_KEY)
  );
}

function init() {
  if (cached) return cached;

  const existing = getApps().find((a) => a.name === APP_NAME);
  let app: App;

  if (existing) {
    app = existing;
  } else if (publicEnv.useEmulators) {
    const host = publicEnv.emulatorHost;
    process.env.FIRESTORE_EMULATOR_HOST ||= `${host}:8080`;
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||= `${host}:9099`;
    process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= `${host}:9199`;
    const projectId = resolvedProjectId()!;
    app = initializeApp(
      { projectId, storageBucket: publicEnv.firebase.storageBucket || `${projectId}.appspot.com` },
      APP_NAME
    );
  } else {
    const missing = [
      ["FIREBASE_ADMIN_PROJECT_ID", process.env.FIREBASE_ADMIN_PROJECT_ID],
      ["FIREBASE_ADMIN_CLIENT_EMAIL", process.env.FIREBASE_ADMIN_CLIENT_EMAIL],
      ["FIREBASE_ADMIN_PRIVATE_KEY", process.env.FIREBASE_ADMIN_PRIVATE_KEY],
    ]
      .filter(([, v]) => !isRealValue(v))
      .map(([k]) => k as string);
    if (missing.length) throw new AdminNotConfiguredError(missing);

    app = initializeApp(
      {
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        }),
        storageBucket: publicEnv.firebase.storageBucket,
      },
      APP_NAME
    );
  }

  const db = getFirestore(app);
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    /* settings already applied (hot reload) */
  }
  cached = { app, db, auth: getAuth(app), storage: getStorage(app) };
  return cached;
}

export const adminDb = () => init().db;
export const adminAuth = () => init().auth;
export const adminStorage = () => init().storage;
export { FieldValue, Timestamp } from "firebase-admin/firestore";
