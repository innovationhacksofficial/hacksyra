import "server-only";
import { Resend } from "resend";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { isResendConfigured, serverEnv } from "@/lib/env";

let resend: Resend | null = null;

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  tag?: string;
  replyTo?: string;
};

export type SendEmailResult = { sent: boolean; id?: string; reason?: string };

/**
 * Sends a transactional email via Resend. When RESEND_API_KEY is absent the
 * email is NOT faked as sent: it is logged to the console and to `emailLog`
 * with status "not_configured", and `{ sent: false }` is returned.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const to = Array.isArray(input.to) ? input.to : [input.to];
  if (!to.length) return { sent: false, reason: "no_recipient" };

  let result: SendEmailResult;
  if (!isResendConfigured()) {
    console.info(`[email:not-configured] "${input.subject}" → ${to.join(", ")}`);
    result = { sent: false, reason: "not_configured" };
  } else {
    try {
      resend ??= new Resend(serverEnv.resendApiKey);
      const { data, error } = await resend.emails.send({
        from: serverEnv.emailFrom,
        to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
        tags: input.tag ? [{ name: "category", value: input.tag.replace(/[^a-zA-Z0-9_-]/g, "_") }] : undefined,
      });
      result = error ? { sent: false, reason: error.message } : { sent: true, id: data?.id };
    } catch (e) {
      result = { sent: false, reason: e instanceof Error ? e.message : "send_failed" };
    }
  }

  try {
    await adminDb()
      .collection(COLLECTIONS.EMAIL_LOG)
      .add({
        to,
        subject: input.subject,
        tag: input.tag ?? null,
        status: result.sent ? "sent" : result.reason === "not_configured" ? "not_configured" : "failed",
        providerId: result.id ?? null,
        error: result.sent ? null : result.reason ?? null,
        createdAt: FieldValue.serverTimestamp(),
      });
  } catch {
    /* logging is best-effort */
  }
  return result;
}

