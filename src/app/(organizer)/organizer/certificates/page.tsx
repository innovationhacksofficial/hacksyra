"use client";

import { useState } from "react";
import {
  Award, ShieldCheck, Download, CheckCircle2, Sparkles,
  ExternalLink, Send, Eye, FileText, Check, Copy
} from "lucide-react";

export default function CertificatesPage() {
  const [selectedType, setSelectedType] = useState<"participation" | "winner" | "runner_up">("winner");
  const [issuedCount, setIssuedCount] = useState(3840);
  const [isIssuing, setIsIssuing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleBulkIssue = () => {
    setIsIssuing(true);
    setTimeout(() => {
      setIsIssuing(false);
      setIssuedCount((prev) => prev + 340);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
            Verifiable Digital Certificates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Issue cryptographically verifiable certificates and badges to hackathon winners &amp; participants.
          </p>
        </div>

        <button
          onClick={handleBulkIssue}
          disabled={isIssuing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1565D8] hover:bg-[#0F52B0] text-white font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          {isIssuing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Generating Signatures...</span>
            </>
          ) : (
            <>
              <Send size={15} />
              <span>Bulk Issue Remaining (340)</span>
            </>
          )}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          Successfully dispatched 340 digital certificates with verifiable hashes via Innovation Hacks credential network!
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Issued</span>
          <p className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-1">
            {issuedCount.toLocaleString()}
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">100% Cryptographically Signed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Public Verification Views</span>
          <p className="text-2xl sm:text-3xl font-display font-black text-[#1565D8] mt-1">
            14,890 Views
          </p>
          <span className="text-xs text-slate-500 mt-1 inline-block">Verified on LinkedIn &amp; Resumes</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Templates</span>
          <p className="text-2xl sm:text-3xl font-display font-black text-purple-600 mt-1">
            3 Ready
          </p>
          <span className="text-xs text-slate-500 mt-1 inline-block">Grand Winner · Runner-up · Participant</span>
        </div>
      </div>

      {/* Main Studio View: Selector & Live Certificate Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
              <Award className="text-[#1565D8]" size={18} />
              Select Certificate Category
            </h3>

            <div className="space-y-2">
              {[
                { id: "winner", title: "1st Place Grand Champion", desc: "Gold podium border with custom trophy seal" },
                { id: "runner_up", title: "Runner Up & Track Winners", desc: "Silver accent with sponsor attribution" },
                { id: "participation", title: "Participation Certificate", desc: "Official verification for all team builders" },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedType(tmpl.id as any)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedType === tmpl.id
                      ? "bg-[#EEF4FF] border-[#1565D8] shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{tmpl.title}</span>
                    {selectedType === tmpl.id && <CheckCircle2 size={16} className="text-[#1565D8]" />}
                  </div>
                  <p className="text-[11px] text-slate-500">{tmpl.desc}</p>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Authorized Signatory
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1565D8] text-white flex items-center justify-center font-bold text-xs">
                  IH
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">Innovation Hacks Executive Council</p>
                  <p className="text-[10px] text-slate-500">Verified Organization Authority</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Certificate Preview Column */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                <Eye className="text-[#1565D8]" size={18} />
                Live Preview
              </h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verifiable QR Enabled
              </span>
            </div>

            {/* Certificate Canvas Render */}
            <div className="relative aspect-[1.414/1] w-full rounded-2xl border-4 border-slate-800 bg-[#FDFBF7] p-6 sm:p-8 flex flex-col justify-between shadow-md text-slate-900">
              {/* Inner Decorative Border */}
              <div className="absolute inset-2 border-2 border-amber-600/30 rounded-xl pointer-events-none" />

              {/* Certificate Top Header */}
              <div className="text-center relative z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="font-display font-black text-base sm:text-lg tracking-wider text-[#1565D8]">
                    HACK<span className="text-slate-900">SYRA</span>
                  </span>
                  <span className="text-slate-400">×</span>
                  <span className="font-display font-bold text-xs sm:text-sm text-slate-700">
                    INNOVATION HACKS
                  </span>
                </div>
                <h2 className="font-serif italic text-lg sm:text-2xl text-slate-800 font-bold">
                  {selectedType === "winner"
                    ? "Certificate of Grand Victory"
                    : selectedType === "runner_up"
                    ? "Certificate of Achievement"
                    : "Certificate of Participation"}
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest mt-1">
                  Presented to
                </p>
              </div>

              {/* Recipient Name */}
              <div className="text-center my-auto relative z-10">
                <p className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 underline decoration-amber-500/40 underline-offset-8">
                  Rohan Varma &amp; Team NeuralSynthetix
                </p>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-4 leading-relaxed">
                  for outstanding demonstration of ingenuity and technical excellence in the{" "}
                  <strong>India AI Innovation Challenge 2026</strong>.
                </p>
              </div>

              {/* Certificate Footer */}
              <div className="flex items-end justify-between relative z-10 text-[10px] sm:text-xs pt-4 border-t border-slate-200/80">
                <div>
                  <p className="font-bold text-slate-900">Innovation Hacks HQ</p>
                  <p className="text-slate-500">Official Hackathon Host</p>
                </div>

                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full bg-amber-100/80 border border-amber-300 flex items-center justify-center font-bold text-amber-800 text-xs mb-1">
                    SEAL
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">ID: IH-AI-2026-9812</span>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900">October 18, 2026</p>
                  <p className="text-[#1565D8] font-semibold">verify.hacksyra.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
