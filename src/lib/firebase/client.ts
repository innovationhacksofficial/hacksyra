import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForLocalDevHacksyra2026",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hacksyra-prod.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hacksyra-prod",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "hacksyra-prod.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

// Prevent duplicate app initialization in Next.js dev mode
let app: FirebaseApp;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch {
  app = (getApps()[0] || {}) as FirebaseApp;
}

function getSafeService<T>(getter: () => T, name: string): T {
  try {
    return getter();
  } catch (err) {
    if (typeof window === "undefined") {
      return {} as T;
    }
    console.warn(`[Firebase] Failed to initialize ${name}:`, err);
    return {} as T;
  }
}

export const auth: Auth = getSafeService(() => getAuth(app), "auth");
export const db: Firestore = getSafeService(() => getFirestore(app), "firestore");
export const storage: FirebaseStorage = getSafeService(() => getStorage(app), "storage");

export { app };
export default app;
