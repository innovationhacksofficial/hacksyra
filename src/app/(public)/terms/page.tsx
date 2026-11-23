import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Platform rules, organizer obligations, and builder rights on HACKSYRA.",
};

export default function TermsPage() {
  return (
    <div className="container-app py-10 sm:py-14 max-w-3xl space-y-8">
      <div className="space-y-2">
        <span className="section-tag">Legal</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">Terms of Service</h1>
        <p className="text-xs text-slate-500">Last updated: November 2026 · Operated by Innovation Hacks</p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-900">1. Eligibility &amp; Accounts</h2>
          <p>
            You are responsible for maintaining the accuracy of your profile and safeguarding access to your HACKSYRA credentials. Accounts suspected of spam, automated abuse, or impersonation may be suspended.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-900">2. Hosting &amp; Listing Review</h2>
          <p>
            All public hackathons require payment of any applicable listing fee and approval from HACKSYRA administrators before becoming publicly searchable. Organizers must honor announced prize pools, eligibility criteria, timelines, and participant refund policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-900">3. Intellectual Property</h2>
          <p>
            Builders retain full ownership of the code, designs, and intellectual property created during hackathons unless explicitly governed by a hackathon&apos;s published official rules agreed to at registration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-lg text-slate-900">4. Reporting &amp; Contact</h2>
          <p>
            Violations, spam events, or judging disputes can be reported directly from hackathon pages or via{" "}
            <Link href="/contact" className="text-[#1565D8] font-semibold hover:underline">
              Contact Support
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
