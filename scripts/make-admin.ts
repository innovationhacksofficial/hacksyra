/**
 * Grant a role to a user (default: super_admin).
 *   npm run make-admin -- someone@example.com
 *   npm run make-admin -- someone@example.com admin
 * The user's sessions are revoked so their next sign-in carries the new claim.
 */
import { FieldValue } from "firebase-admin/firestore";
import { initAdmin } from "./_admin";

const ROLES = ["participant", "organizer", "judge", "mentor", "moderator", "admin", "super_admin"];

async function main() {
  const [email, role = "super_admin"] = process.argv.slice(2);
  if (!email) {
    console.error("Usage: npm run make-admin -- <email> [role]");
    process.exit(1);
  }
  if (!ROLES.includes(role)) {
    console.error(`Unknown role "${role}". One of: ${ROLES.join(", ")}`);
    process.exit(1);
  }
  const { auth, db } = initAdmin();
  const user = await auth.getUserByEmail(email).catch(() => null);
  if (!user) {
    console.error(`✖ No user with email ${email}. Ask them to sign up first.`);
    process.exit(1);
  }
  await auth.setCustomUserClaims(user.uid, { ...(user.customClaims ?? {}), role });
  await db.collection("users").doc(user.uid).set(
    { roles: Array.from(new Set(["participant", role])), updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  await auth.revokeRefreshTokens(user.uid);
  await db.collection("auditLogs").add({
    actorId: "cli",
    action: "user.role_set",
    resource: "users",
    resourceId: user.uid,
    changes: { role: { before: user.customClaims?.role ?? "participant", after: role } },
    status: "success",
    notes: "scripts/make-admin.ts",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log(`✔ ${email} is now "${role}". They must sign in again for it to take effect.`);
}

main().then(() => process.exit(0), (e) => {
  console.error(e);
  process.exit(1);
});

