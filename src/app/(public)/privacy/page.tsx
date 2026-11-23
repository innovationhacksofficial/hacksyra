import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Innovation Hacks collects, uses, and protects your data on HACKSYRA.",
};

export default function PrivacyPage() {
  return (
    <div className="container-app py-10 sm:py-14 max-w-3xl space-y-8">
      <div className="space-y-2">
        <span className="section-tag">Legal</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Last updated: November 2026 · Operated by Innovation Hacks</p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-900">1. Information We Collect</h2>
          <p>
            When you create an account, register for a hackathon, submit a project, or host an event, we collect your name, email address, username, profile skills, team memberships, submission metadata, and registration answers provided explicitly to organizers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-900">2. Payments &amp; Razorpay Processing</h2>
          <p>
            Listing fees and paid hackathon tickets are processed securely via Razorpay. HACKSYRA never stores raw credit/debit card numbers or UPI PINs — we store verified Razorpay order IDs, payment IDs, receipts, and invoice metadata needed for auditing and refunds.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-900">3. Visibility &amp; Public Profiles</h2>
          <p>
            Public builder profiles, published projects, leaderboard placements, and issued certificate verification pages are visible to visitors when marked public. Registration form responses and attendee tickets remain strictly private to you, event organizers, and platform administrators.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-900">4. Your Rights: Export &amp; Deletion</h2>
          <p>
            You can export a complete JSON copy of your profile, registrations, teams, orders, and certificates or permanently deactivate and scrub your account at any time inside{" "}
            <Link href="/dashboard/settings" className="text-[#1565D8] font-semibold hover:underline">
              Dashboard → Settings
            </Link>
            . For privacy inquiries, reach us via the{" "}
            <Link href="/contact" className="text-[#1565D8] font-semibold hover:underline">
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
