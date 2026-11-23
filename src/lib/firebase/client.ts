"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage";
import { publicEnv, isFirebaseClientConfigured, resolvedProjectId } from "@/lib/env";

export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super(
      "[HACKSYRA] Firebase is not configured. Set the NEXT_PUBLIC_FIREBASE_* variables in .env.local " +
        "(see README → Firebase setup), or run against the local emulators with " +
        "NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true and `npm run emulators`."
    );
    this.name = "FirebaseNotConfiguredError";
  }
}

export { isFirebaseClientConfigured };

type Services = { app: FirebaseApp; auth: Auth; db: Firestore; storage: FirebaseStorage };
let services: Services | null = null;
let warned = false;

function init(): Services {
  if (services) return services;
  if (typeof window === "undefined") {
    throw new Error("[HACKSYRA] The Firebase client SDK can only be used in the browser.");
  }
  if (!isFirebaseClientConfigured) {
    const err = new FirebaseNotConfiguredError();
    if (!warned && process.env.NODE_ENV !== "production") {
      console.error(err.message);
      warned = true;
    }
    throw err;
  }

  const emu = publicEnv.useEmulators;
  const projectId = resolvedProjectId()!;
  const config = {
    apiKey: publicEnv.firebase.apiKey && !emu ? publicEnv.firebase.apiKey : publicEnv.firebase.apiKey || "demo-api-key",
    authDomain: publicEnv.firebase.authDomain || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: publicEnv.firebase.storageBucket || `${projectId}.appspot.com`,
    messagingSenderId: publicEnv.firebase.messagingSenderId,
    appId: publicEnv.firebase.appId,
  };

  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);

  let db: Firestore;
  try {
    db = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      ...(emu ? {} : { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }),
    });
  } catch {
    db = getFirestore(app); // already initialised (HMR)
  }
  const storage = getStorage(app);

  if (emu) {
    const host = publicEnv.emulatorHost;
    const w = window as unknown as { __hacksyraEmu?: boolean };
    if (!w.__hacksyraEmu) {
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
      connectFirestoreEmulator(db, host, 8080);
      connectStorageEmulator(storage, host, 9199);
      w.__hacksyraEmu = true;
    }
  }

  services = { app, auth, db, storage };
  return services;
}

/** Returns true when Firebase can be used in this browser session. Never throws. */
export function firebaseReady(): boolean {
  if (typeof window === "undefined") return false;
  try {
    init();
    return true;
  } catch {
    return false;
  }
}

export const firebaseApp = () => init().app;
export const clientAuth = () => init().auth;
export const clientDb = () => init().db;
export const clientStorage = () => init().storage;
