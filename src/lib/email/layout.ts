/**
 * Minimal, inline-styled HTML email layout (works in Gmail/Outlook/Apple Mail).
 * Brand: #1565D8, white surfaces, Space Grotesk-ish system stack.
 */
import { publicEnv } from "@/lib/env";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EmailLayoutInput = {
  preheader?: string;
  title: string;
  /** Trusted HTML — escape any user content with escapeHtml() before passing it in. */
  bodyHtml: string;
  cta?: { label: string; url: string };
  footerNote?: string;
};

export function renderEmail({ preheader, title, bodyHtml, cta, footerNote }: EmailLayoutInput): string {
  const app = publicEnv.appUrl.replace(/\/$/, "");
  const ctaUrl = cta ? (cta.url.startsWith("http") ? cta.url : `${app}${cta.url}`) : "";
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${escapeHtml(preheader ?? title)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0;">
<tr><td style="background:#1565D8;padding:20px 28px;">
<a href="${app}" style="color:#FFFFFF;text-decoration:none;font-weight:800;font-size:20px;letter-spacing:-0.5px;">HACK<span style="color:#B3D1FF">SYRA</span></a>
<div style="color:#DCE9FF;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-top:2px;">An Innovation Hacks product</div>
</td></tr>
<tr><td style="padding:28px;">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0F172A;">${escapeHtml(title)}</h1>
<div style="font-size:15px;line-height:1.6;color:#334155;">${bodyHtml}</div>
${
  cta
    ? `<div style="margin-top:24px;"><a href="${ctaUrl}" style="display:inline-block;background:#1565D8;color:#FFFFFF;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px;font-size:15px;">${escapeHtml(cta.label)}</a></div>`
    : ""
}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #E2E8F0;font-size:12px;color:#64748B;line-height:1.5;">
${footerNote ? `${escapeHtml(footerNote)}<br>` : ""}You're receiving this because you have an account on HACKSYRA.
Manage email preferences in <a href="${app}/dashboard/settings" style="color:#1565D8;">Settings</a>.
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
