/**
 * Centralised environment access.
 *
 * NEXT_PUBLIC_* values must be referenced literally so Next.js can inline them
 * into the client bundle — do not refactor these into dynamic lookups.
 */

const PLACEHOLDER = /^(your[-_]|rzp_test_your|re_your|sk-your|pk_test_your|sk_test_your|whsec_your)|dummy|changeme|xxxx/i;

export function isRealValue(v: string | undefined | null): v is string {
  return typeof v === "string" && v.trim().length > 0 && !PLACEHOLDER.test(v.trim());
}

const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  appName: process.env.NEXT_PUBLIC_APP_NAME || "HACKSYRA",
  useEmulators,
  emulatorHost: process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "127.0.0.1",
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  githubAuthEnabled: process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true",
};

/** Project id used when running against the local emulator suite. `demo-*` ids never touch real resources. */
export const EMULATOR_PROJECT_ID = "demo-hacksyra";

export function resolvedProjectId(): string | undefined {
  if (isRealValue(publicEnv.firebase.projectId)) return publicEnv.firebase.projectId;
  if (useEmulators) return EMULATOR_PROJECT_ID;
  return undefined;
}

export const isFirebaseClientConfigured =
  useEmulators ||
  (isRealValue(publicEnv.firebase.apiKey) && isRealValue(publicEnv.firebase.projectId));

export const isRazorpayClientConfigured = isRealValue(publicEnv.razorpayKeyId);

// ─────────────────────────────────────────────────────────────
// Server-only helpers (never import values into client components)
// ─────────────────────────────────────────────────────────────

export const serverEnv = {
  get razorpayKeyId() {
    return process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  },
  get razorpayKeySecret() {
    return process.env.RAZORPAY_KEY_SECRET || "";
  },
  get razorpayWebhookSecret() {
    return process.env.RAZORPAY_WEBHOOK_SECRET || "";
  },
  get resendApiKey() {
    return process.env.RESEND_API_KEY || "";
  },
  get emailFrom() {
    return process.env.EMAIL_FROM || "HACKSYRA <onboarding@resend.dev>";
  },
  get cronSecret() {
    return process.env.CRON_SECRET || "";
  },
  get ticketQrSecret() {
    return process.env.TICKET_QR_SECRET || "";
  },
  get adminEmails(): string[] {
    return (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  },
  get upstashUrl() {
    return process.env.UPSTASH_REDIS_REST_URL || "";
  },
  get upstashToken() {
    return process.env.UPSTASH_REDIS_REST_TOKEN || "";
  },
  /** Dev-only: lets the listing fee / ticket be marked paid without Razorpay. Refused in production. */
  get paymentsDevBypass() {
    return (
      process.env.PAYMENTS_DEV_BYPASS === "true" &&
      useEmulators &&
      process.env.VERCEL_ENV !== "production"
    );
  },
};

export const isRazorpayServerConfigured = () =>
  isRealValue(serverEnv.razorpayKeyId) && isRealValue(serverEnv.razorpayKeySecret);

export const isResendConfigured = () => isRealValue(serverEnv.resendApiKey);

