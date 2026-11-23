"use client";

import { useState } from "react";
import {
  Award, Trophy, Download, Share2, ShieldCheck, QrCode,
  ExternalLink, Sparkles, CheckCircle2, Lock
} from "lucide-react";

interface Certificate {
  id: string;
  credentialId: string;
  title: string;
  event: string;
  role: string;
  date: string;
  tier: "winner" | "finalist" | "participant";
  issuer: string;
  verificationHash: string;
}

const DEMO_CERTIFICATES: Certificate[] = [
  {
    id: "cert-1",
    credentialId: "HACK-2026-ZK-001",
    title: "1st Place Grand Champion",
    event: "Autonomous Web3 & Zero-Knowledge Sprint",
    role: "Lead Cryptography Architect • Team ZeroState",
    date: "October 02, 2026",
    tier: "winner",
    issuer: "Innovation Hacks & Ethereum L2 Alliance",
    verificationHash: "0x7f9a...88b2c4",
  },
  {
    id: "cert-2",
    credentialId: "HACK-2026-CLEAN-042",
    title: "National Finalist — Excellence Award",
    event: "CleanTech & Smart Mobility Hackathon",
    role: "Full-Stack Engineer • Team EcoGrid",
    date: "August 24, 2026",
    tier: "finalist",
    issuer: "Innovation Hacks Foundation",
    verificationHash: "0x4b21...99e1a0",
  },
  {
    id: "cert-3",
    credentialId: "HACK-2026-AI-REG-912",
    title: "Verified Tournament Contender",
    event: "India AI Innovation Challenge 2026",
    role: "Active Competitor • NeuralSynthetix",
    date: "November 2026 (Live)",
    tier: "participant",
    issuer: "Google Cloud, Innovation Hacks & DeepMind",
    verificationHash: "Pending Submission",
  },
];

export default function CertificatesPage() {
  const [selectedCert, setSelectedCert] = useState<Certificate>(DEMO_CERTIFICATES[0]);
  const [showModal, setShowModal] = useState<boolean>(false);

  function viewCertificate(cert: Certificate) {
    setSelectedCert(cert);
    setShowModal(true);
  }

  function shareLinkedIn(cert: Certificate) {
    const url = encodeURIComponent(`https://hacksyra.com/verify/${cert.credentialId}`);
    const title = encodeURIComponent(`Honored to receive ${cert.title} at ${cert.event} on HACKSYRA!`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, "_blank");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display">Credentials &amp; Certificates</h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Cryptographically verifiable certificates issued by Innovation Hacks and event sponsors. Share on LinkedIn and resume portfolios.
        </p>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {DEMO_CERTIFICATES.map((cert) => (
          <div
            key={cert.id}
            className={`card p-6 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between ${
              cert.tier === "winner"
                ? "border-amber/40 bg-gradient-to-b from-amber/10 to-surface-1 shadow-lg"
                : cert.tier === "finalist"
                ? "border-aqua-400/30 bg-gradient-to-b from-aqua-400/10 to-surface-1"
                : "border-white/10 bg-surface-1"
            }`}
          >
            <div>
              {/* Top badge */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    cert.tier === "winner"
                      ? "bg-amber text-midnight"
                      : cert.tier === "finalist"
                      ? "bg-aqua-400 text-midnight"
                      : "bg-white/10 text-text-secondary"
                  }`}
                >
                  {cert.tier === "winner" ? "🏆 WINNER" : cert.tier === "finalist" ? "⭐ FINALIST" : "VERIFIED"}
                </span>
                <span className="text-[10px] font-mono text-text-secondary">{cert.credentialId}</span>
              </div>

              {/* Certificate Decorative Preview */}
              <div className="p-4 rounded-2xl bg-midnight border border-white/10 mb-4 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-20 h-20 bg-violet-500/10 rounded-full blur-xl pointer-events-none" />
                <Award className={`w-8 h-8 mx-auto mb-2 ${
                  cert.tier === "winner" ? "text-amber" : cert.tier === "finalist" ? "text-aqua-400" : "text-violet-400"
                }`} />
                <h4 className="font-extrabold text-sm text-white mb-0.5">{cert.title}</h4>
                <p className="text-[11px] text-text-secondary font-medium">{cert.event}</p>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-text-secondary">
                  <span>Issued: {cert.date}</span>
                  <span className="flex items-center gap-1 text-aqua-400 font-mono">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-text-secondary text-[11px]">{cert.role}</p>
                <p className="text-[10px] text-text-secondary/70">Issuer: {cert.issuer}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/8 mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => viewCertificate(cert)}
                className="btn-secondary text-[11px] justify-center py-2"
              >
                Inspect Pass
              </button>
              <button
                onClick={() => shareLinkedIn(cert)}
                className="btn-primary text-[11px] justify-center py-2"
              >
                <Share2 className="w-3 h-3 mr-1" /> LinkedIn
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Viewer Modal */}
      {showModal && selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-glass max-w-2xl w-full p-8 rounded-3xl border-2 border-amber/50 bg-surface-1 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white p-2"
            >
              ✕
            </button>

            {/* Formal Certificate Layout */}
            <div className="p-8 rounded-2xl bg-midnight border-2 border-dashed border-amber/40 text-center relative">
              <div className="text-[10px] uppercase font-bold tracking-widest text-amber mb-2">
                AN INNOVATION HACKS CERTIFIED CREDENTIAL
              </div>
              <h2 className="text-3xl font-black font-display text-white mb-1">
                CERTIFICATE OF ACHIEVEMENT
              </h2>
              <p className="text-xs text-text-secondary italic mb-6">
                This certifies that the recipient has demonstrated elite engineering and innovation.
              </p>

              <div className="text-sm font-semibold text-text-secondary mb-1">AWARDED TO</div>
              <div className="text-2xl font-black text-amber mb-4">AARAV SHARMA</div>

              <div className="text-xs text-text-secondary mb-1">FOR ACHIEVING</div>
              <div className="text-lg font-bold text-white mb-2">{selectedCert.title}</div>
              <div className="text-xs text-aqua-400 font-semibold mb-6">{selectedCert.event}</div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 text-left text-xs">
                <div>
                  <span className="text-[10px] text-text-secondary uppercase block">Credential ID</span>
                  <span className="font-mono text-white">{selectedCert.credentialId}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-text-secondary uppercase block">Verification Hash</span>
                  <span className="font-mono text-aqua-400">{selectedCert.verificationHash}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => alert("Downloading verified PDF certificate...")}
                className="btn-primary text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download High-Res PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
