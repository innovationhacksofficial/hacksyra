import "server-only";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { sendEmail } from "@/lib/email/send";
import { renderEmail, type EmailLayoutInput } from "@/lib/email/layout";
import type { NotificationType } from "@/types";

export type NotifyInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  hackathonId?: string;
  metadata?: Record<string, string | number | boolean>;
  /** If set, also email the user (respecting their email preferences). */
  email?: { subject?: string; layout?: Partial<EmailLayoutInput>; force?: boolean };
};

/** Creates an in-app notification (real-time via onSnapshot) and optionally emails the user. */
export async function notify(input: NotifyInput): Promise<void> {
  const db = adminDb();
  try {
    await db.collection(COLLECTIONS.NOTIFICATIONS).add({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      linkUrl: input.linkUrl ?? null,
      hackathonId: input.hackathonId ?? null,
      metadata: input.metadata ?? {},
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error("[notify] failed to create notification", e);
  }

  if (!input.email) return;
  try {
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(input.userId).get();
    const u = userSnap.data() as { email?: string; notificationPrefs?: { email?: boolean } } | undefined;
    if (!u?.email) return;
    if (!input.email.force && u.notificationPrefs?.email === false) return;
    await sendEmail({
      to: u.email,
      subject: input.email.subject ?? input.title,
      tag: input.type,
      html: renderEmail({
        title: input.title,
        bodyHtml: `<p>${input.message.replace(/</g, "&lt;")}</p>`,
        cta: input.linkUrl ? { label: "Open HACKSYRA", url: input.linkUrl } : undefined,
        ...input.email.layout,
      }),
    });
  } catch (e) {
    console.error("[notify] email failed", e);
  }
}

/** Notifies every admin / super_admin (users.roles is server-maintained). */
export async function notifyAdmins(input: Omit<NotifyInput, "userId">): Promise<void> {
  const snap = await adminDb()
    .collection(COLLECTIONS.USERS)
    .where("roles", "array-contains-any", ["admin", "super_admin"])
    .limit(50)
    .get();
  await Promise.all(snap.docs.map((d) => notify({ ...input, userId: d.id })));
}
