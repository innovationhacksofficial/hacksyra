"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { doc } from "firebase/firestore";
import { Award, CheckCircle2, Download, ShieldAlert } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useLiveDoc } from "@/lib/data/live";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { Button, EmptyState, Skeleton } from "@/components/ui";
import type { Certificate } from "@/types";

export default function VerifyCertificatePage() {
  const { serial } = useParams<{ serial: string }>();
  const { data: cert, isLoading } = useLiveDoc<Certificate>(
    ["verify-cert", serial],
    serial ? () => doc(clientDb(), COLLECTIONS.CERTIFICATES, serial) : null
  );

  if (isLoading) return <div className="container-app py-12 max-w-xl"><Skeleton className="h-72 rounded-2xl" /></div>;

  if (!cert) {
    return (
      <div className="container-app py-14 max-w-xl">
        <EmptyState
          icon={<ShieldAlert size={24} />}
          title="Certificate not found"
          description={`We couldn't verify serial number "${serial}".`}
          action={<Button href="/">Return home</Button>}
        />
      </div>
    );
  }

  return (
    <div className="container-app py-10 max-w-2xl">
      <div className="card p-7 sm:p-10 space-y-6 border-2 border-[#B3D1FF]">
        <div className="flex items-center justify-between gap-4">
          <span className={cert.isRevoked ? "badge-red" : "badge-green"}>
            <CheckCircle2 size={13} /> {cert.isRevoked ? "Revoked Certificate" : "Verified Authentic"}
          </span>
          <span className="font-mono text-xs font-bold text-slate-500">{cert.serialNumber}</span>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF4FF] text-[#1565D8] flex items-center justify-center shrink-0">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Awarded to</p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">{cert.recipientName}</h1>
            <p className="text-sm text-slate-600 mt-1 capitalize">
              <strong className="text-[#1565D8]">{cert.type.replace(/_/g, " ")}</strong> · {cert.hackathonName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 block text-xs">Issued By</span>
            <span className="font-semibold text-slate-900">{cert.issuedBy}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Issued On</span>
            <span className="font-semibold text-slate-900">{formatInZone(toDate(cert.issuedAt))}</span>
          </div>
        </div>

        {!cert.isRevoked && (
          <div className="flex flex-wrap gap-3">
            <a href={`/api/certificates/${cert.serialNumber}/pdf`} className="btn-primary">
              <Download size={16} /> Download PDF Certificate
            </a>
            <Link href="/hackathons" className="btn-secondary">
              Explore Hackathons
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

