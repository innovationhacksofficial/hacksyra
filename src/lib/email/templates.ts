import { renderEmail, escapeHtml } from "./layout";

export function welcomeEmail(opts: { name: string; role: string; username: string }) {
  const isOrganizer = opts.role === "organizer";
  return {
    subject: "Welcome to HACKSYRA — You're in!",
    html: renderEmail({
      preheader: `Your @${opts.username} builder profile is live on HACKSYRA.`,
      title: `Welcome aboard, ${opts.name}!`,
      bodyHtml: `<p>Your HACKSYRA account (<strong>@${escapeHtml(opts.username)}</strong>) is ready.</p>
<p>${
        isOrganizer
          ? "Launch your first hackathon with our 9-step autosaved wizard, Razorpay ticket checkout, QR check-in, weighted judging rubrics, and instant verifiable certificates."
          : "Explore live hackathons across India and globally, form teams, publish project showcases, and earn verifiable credentials."
      }</p>`,
      cta: {
        label: isOrganizer ? "Open Organizer Console" : "Explore Hackathons",
        url: isOrganizer ? "/organizer/create" : "/hackathons",
      },
    }),
  };
}

export function contactConfirmationEmail(opts: { name: string; subject: string }) {
  return {
    subject: `We received your message: ${opts.subject}`,
    html: renderEmail({
      title: "Thanks for reaching out to HACKSYRA",
      bodyHtml: `<p>Hi ${escapeHtml(opts.name)},</p>
<p>Our Innovation Hacks support team received your inquiry regarding <strong>${escapeHtml(opts.subject)}</strong> and will reply shortly.</p>`,
      cta: { label: "Visit Help Center", url: "/help" },
    }),
  };
}

export function paymentReceiptEmail(opts: { name: string; orderNumber: string; amountFormatted: string; hackathonName: string }) {
  return {
    subject: `Receipt ${opts.orderNumber} — ${opts.amountFormatted}`,
    html: renderEmail({
      title: "Payment Receipt",
      bodyHtml: `<p>Hi ${escapeHtml(opts.name)},</p>
<p>We received your payment of <strong>${escapeHtml(opts.amountFormatted)}</strong> for <strong>${escapeHtml(opts.hackathonName)}</strong> (Order <code>${escapeHtml(opts.orderNumber)}</code>).</p>`,
      cta: { label: "View Payment History", url: "/dashboard/payments" },
    }),
  };
}

export function deadlineReminderEmail(opts: { hackathonName: string; slug: string; windowLabel: string; deadlineLabel: string }) {
  return {
    subject: `Reminder: ${opts.hackathonName} deadline in ${opts.windowLabel}`,
    html: renderEmail({
      title: `${opts.windowLabel} left for ${opts.hackathonName}`,
      bodyHtml: `<p>Your ${escapeHtml(opts.deadlineLabel)} deadline closes in <strong>${escapeHtml(opts.windowLabel)}</strong>. Lock in your team and submit your project before the cutoff.</p>`,
      cta: { label: "Open Submissions", url: `/hackathons/${opts.slug}` },
    }),
  };
}

