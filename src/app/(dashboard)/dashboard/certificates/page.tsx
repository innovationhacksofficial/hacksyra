"use client";

import Link from "next/link";
import { collection, orderBy, query, where } from "firebase/firestore";
import { Award, CheckCircle2, Compass, Download, ExternalLink, ShieldAlert } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { Button, CardSkeleton, CopyButton, EmptyState, NotConfigured, PageHeader } from "@/components/ui";
import type { Certificate } from "@/types";

export default function MyCertificatesPage() {
  const { firebaseUser, notConfigured } = useAuth();
  const uid = firebaseUser?.uid;
  const ready = Boolean(uid && firebaseReady());

  const { data: certs, isLoading } = useLiveQuery<Certificate>(
    ["my-certs", uid ?? null],
    ready
      ? () => query(collection(clientDb(), COLLECTIONS.CERTIFICATES), where("userId", "==", uid), orderBy("issuedAt", "desc"))
      : null
  );

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="My Certificates"
        description="Verified credentials and downloadable PDF certificates from your completed hackathons."
        actions={
          <Button variant="secondary" href="/hackathons" leftIcon={<Compass size={16} />}>
            Explore Hackathons
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !certs || certs.length === 0 ? (
        <EmptyState
          icon={<Award size={22} />}
          title="No certificates issued yet"
          description="Participate in or win a hackathon — your verifiable PDF certificates appear here automatically."
          action={<Button href="/hackathons">Browse Hackathons</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certs.map((c) => (
            <div key={c.id} className="card p-5 sm:p-6 space-y-4 border-2 border-[#DCEAFF]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#EEF4FF] text-[#1565D8] flex items-center justify-center shrink-0">
                    <Award size={22} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1565D8] capitalize">
                      {c.type.replace(/_/g, " ")} Certificate
                    </span>
                    <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 truncate">
                      {c.hackathonName}
                    </h3>
                  </div>
                </div>
                <span className={c.isRevoked ? "badge-red shrink-0" : "badge-green shrink-0"}>
                  {c.isRevoked ? <ShieldAlert size={12} /> : <CheckCircle2 size={12} />}
                  {c.isRevoked ? "Revoked" : "Verified"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">Recipient</span>
                  <span className="font-semibold text-slate-900">{c.recipientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Issued On</span>
                  <span className="font-semibold text-slate-900">{formatInZone(toDate(c.issuedAt))}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono text-slate-500 truncate">Serial: {c.serialNumber}</span>
                <CopyButton value={c.serialNumber} label="Copy Serial" />
              </div>

              {!c.isRevoked && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <a href={`/api/certificates/${c.serialNumber}/pdf`} className="btn-primary btn-sm flex-1 justify-center">
                    <Download size={14} /> Download PDF
                  </a>
                  <Link href={`/verify/${c.serialNumber}`} className="btn-secondary btn-sm">
                    <ExternalLink size={14} /> Public Verify
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
