import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Zap, BarChart3, Shield, Globe, Users, Trophy, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Host a Hackathon",
  description: "Run your own hackathon on HACKSYRA. Free to start, with paid plans for professional organizers.",
};

const FEATURES = [
  { icon: Zap, title: "20-Step Wizard", description: "Guided event creation with autosave and progress tracking" },
  { icon: Shield, title: "Secure Payments", description: "Razorpay & Stripe with webhook verification and refunds" },
  { icon: BarChart3, title: "Real Analytics", description: "Live dashboards for registrations, submissions, and revenue" },
  { icon: Globe, title: "Global Audience", description: "Reach 2M+ builders across 150+ countries" },
  { icon: Users, title: "Team Management", description: "Formation, invitations, and roster control built in" },
  { icon: Trophy, title: "Judging System", description: "Weighted rubrics, blind judging, and automatic scoring" },
];

const PLANS = [
  { name: "Community", price: "Free", description: "Perfect for student clubs and community organizers", features: ["Up to 100 participants", "3 hackathons/year", "Basic analytics", "Email support", "Certificate templates", "Public listing"], cta: "Start Free", href: "/signup" },
  { name: "Growth", price: "₹2,999/mo", description: "For growing organizations running regular events", features: ["Up to 1,000 participants", "Unlimited hackathons", "Paid ticket support (5% fee)", "Advanced analytics", "Custom registration forms", "Priority support", "Team management"], cta: "Start Growth", href: "/signup?plan=growth", popular: true },
  { name: "Professional", price: "₹7,999/mo", description: "For professional organizers and companies", features: ["Unlimited participants", "Razorpay + Stripe (3% fee)", "Custom domain support", "White-label options", "API access", "Dedicated account manager", "SLA guarantee"], cta: "Start Professional", href: "/signup?plan=professional" },
  { name: "Enterprise", price: "Custom", description: "For large organizations with advanced needs", features: ["Custom contract", "SSO / SAML integration", "On-premise deployment options", "Custom SLA", "Audit logging", "Data residency options", "Custom integrations"], cta: "Contact Sales", href: "/contact?intent=enterprise" },
];

export default function HostPage() {
  return (
    <div className="bg-midnight min-h-screen">
      {/* Hero */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-aqua-400/8 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="section-tag"><Zap size={13} />For Organizers</span>
          <h1 className="text-5xl font-display font-bold text-text-primary mb-4">
            Run the World's Next<br /><span className="gradient-text">Great Hackathon.</span>
          </h1>
          <p className="text-text-secondary text-lg mb-10 max-w-2xl mx-auto">
            HACKSYRA gives you every tool you need — from event creation to payment processing, judging to certificate issuance — in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-aqua btn-lg">Create Free Account <ArrowRight size={18} /></Link>
            <Link href="/resources/organizer-guide" className="btn-secondary btn-lg">Read Organizer Guide</Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title text-center mb-12">Everything You Need to Run a Professional Event</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center mb-4">
                <f.icon size={20} className="text-violet-400" />
              </div>
              <h3 className="font-display font-semibold text-text-primary mb-1.5">{f.title}</h3>
              <p className="text-sm text-text-secondary">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="pricing">
        <div className="text-center mb-12">
          <h2 className="section-title">Transparent Pricing</h2>
          <p className="section-subtitle mx-auto">Start free. Pay only when you scale. No hidden fees.</p>
          <p className="text-xs text-amber/70 font-mono mt-2">* Indicative prices — final pricing subject to change before launch</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`card p-6 flex flex-col ${plan.popular ? "border-violet-500/40 bg-violet-500/5 relative" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge-violet text-xs px-3 py-1"><Star size={11} />Most Popular</span>
                </div>
              )}
              <h3 className="font-display font-bold text-text-primary mb-1">{plan.name}</h3>
              <p className="text-2xl font-display font-black gradient-text mb-1">{plan.price}</p>
              <p className="text-xs text-text-secondary mb-5">{plan.description}</p>
              <ul className="flex flex-col gap-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-text-secondary">
                    <Check size={13} className="text-aqua-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className={plan.popular ? "btn-primary w-full justify-center" : "btn-secondary w-full justify-center"}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
