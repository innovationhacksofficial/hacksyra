"use client";

import { useState } from "react";
import {
  Settings, Building, Globe, Mail, ShieldCheck, Key,
  CheckCircle2, Save, ExternalLink, Sparkles
} from "lucide-react";

export default function OrganizerSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [orgName, setOrgName] = useState("Innovation Hacks");
  const [website, setWebsite] = useState("https://www.innovationhacks.in/");
  const [email, setEmail] = useState("organizer@innovationhacks.in");
  const [bio, setBio] = useState(
    "Innovation Hacks is India's leading developer community and youth hackathon organizer, hosting flagship technology challenges in AI, Web3, FinTech, and Open Innovation."
  );
  const [razorpayKey, setRazorpayKey] = useState("rzp_live_84920491823");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
          Organizer Profile &amp; Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure your official organization identity, public builder portal, and payment API credentials.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          Organization settings saved successfully! Changes are live across all your public hackathon listings.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="text-base font-display font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="text-[#1565D8]" size={18} />
            Organization Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Official Website</label>
              <div className="relative">
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="input pl-9"
                  required
                />
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Public Contact Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="label">Organizer Verification</label>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2 text-xs font-semibold text-[#1565D8]">
                <ShieldCheck size={16} />
                <span>Verified Level 3 Partner · Innovation Hacks HQ</span>
              </div>
            </div>
          </div>

          <div>
            <label className="label">About / Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input resize-none"
            />
          </div>
        </div>

        {/* Payment Credentials */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="text-base font-display font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Key className="text-amber-500" size={18} />
            Payment Gateway &amp; Webhooks
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Razorpay Key ID</label>
              <input
                type="text"
                value={razorpayKey}
                onChange={(e) => setRazorpayKey(e.target.value)}
                className="input font-mono"
              />
            </div>

            <div>
              <label className="label">Webhook Secret</label>
              <input
                type="password"
                defaultValue="whsec_981249812903810"
                className="input font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1565D8] hover:bg-[#0F52B0] text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <Save size={15} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
