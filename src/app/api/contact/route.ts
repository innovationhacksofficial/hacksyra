import { z } from "zod";
import { nanoid } from "nanoid";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { serverEnv } from "@/lib/env";
import { sendEmail } from "@/lib/email/send";
import { escapeHtml, renderEmail } from "@/lib/email/layout";
import { contactConfirmationEmail } from "@/lib/email/templates";
import { route } from "@/lib/server/api";

const Body = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address."),
  topic: z.enum(["general", "organizer", "enterprise", "billing", "report"]).default("general"),
  subject: z.string().trim().min(3, "Subject is required.").max(160),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(4000),
});

export const POST = route(
  { auth: "optional", body: Body, rateLimit: { limit: 6, windowSec: 300, name: "contact" } },
  async ({ user, body, ip }) => {
    const db = adminDb();
    const id = `msg_${nanoid(12)}`;
    const now = FieldValue.serverTimestamp();

    await db.collection(COLLECTIONS.CONTACT_MESSAGES).doc(id).set({
      id,
      userId: user?.uid ?? null,
      name: body.name,
      email: body.email.toLowerCase(),
      topic: body.topic,
      subject: body.subject,
      message: body.message,
      status: "open",
      ipAddress: ip,
      createdAt: now,
      updatedAt: now,
    });

    const supportInbox = serverEnv.adminEmails[0];
    if (supportInbox) {
      await sendEmail({
        to: supportInbox,
        replyTo: body.email,
        subject: `[Contact · ${body.topic}] ${body.subject}`,
        tag: "contact_inbound",
        html: renderEmail({
          title: `New Contact Inquiry (${body.topic})`,
          bodyHtml: `<p><strong>From:</strong> ${escapeHtml(body.name)} (${escapeHtml(body.email)})</p><p><strong>Message:</strong></p><p>${escapeHtml(body.message).replace(/\n/g, "<br>")}</p>`,
        }),
      });
    }

    const ack = contactConfirmationEmail({ name: body.name, subject: body.subject });
    await sendEmail({ to: body.email, subject: ack.subject, html: ack.html, tag: "contact_ack" });

    return { ok: true, id };
  }
);

