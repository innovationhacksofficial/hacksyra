"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, orderBy, query, where } from "firebase/firestore";
import { Award, Download, ExternalLink, Sparkles } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { useMyHackathons } from "@/lib/data/hooks";
import { api } from "@/lib/api-client";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { Button, CardSkeleton, DataList, EmptyState, NotConfigured, PageHeader, useToast } from "@/components/ui";
import type { Certificate } from "@/types";

export default function OrganizerCertificatesPage() {
  const { firebaseUser, notConfigured } = useAuth();
  const toast = useToast();

  const { data: events } = useMyHackathons(firebaseUser?.uid);
  const [hackathonId, setHackathonId] = useState("");
  const [audience, setAudience] = useState<"all_confirmed" | "checked_in" | "submitted" | "winners">("all_confirmed");
  const [type, setType] = useState<"participation" | "finalist" | "winner" | "runner_up" | "judge" | "mentor" | "organizer">("participation");
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    if (!hackathonId && events && events.length > 0) setHackathonId(events[0].id);
  }, [events, hackathonId]);

  const { data: certs, isLoading } = useLiveQuery<Certificate>(
    ["org-certs", hackathonId || null],
    hackathonId && firebaseReady()
      ? () => query(collection(clientDb(), COLLECTIONS.CERTIFICATES), where("hackathonId", "==", hackathonId), orderBy("issuedAt", "desc"))
      : null
  );

  async function issueBulk(e: React.FormEvent) {
    e.preventDefault();
    if (!hackathonId) return;
    setIssuing(true);
    try {
      const res = await api<{ count: number }>(`/api/organizer/hackathons/${hackathonId}/certificates`, {
        method: "POST",
        body: { audience, type },
      });
      toast.success(`Issued ${res.count} certificates!`, "Recipients have been notified with verification links.");
    } catch (err) {
      toast.error("Couldn't issue certificates", err instanceof Error ? err.message : undefined);
    } finally {
      setIssuing(false);
    }
  }

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Certificates Issuer"
        description="Bulk-generate tamper-proof verifiable certificates with instant PDF download for participants and winners."
      />

      <form onSubmit={issueBulk} className="card p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div className="form-field">
          <label className="label">Hackathon</label>
          <select className="input" value={hackathonId} onChange={(e) => setHackathonId(e.target.value)}>
            {(events ?? []).map((h) => (
              <option key={h.id} value={h.id}>
                {h.name || "Untitled"}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="label">Audience</label>
          <select className="input" value={audience} onChange={(e) => setAudience(e.target.value as typeof audience)}>
            <option value="all_confirmed">All Confirmed Registrants</option>
            <option value="checked_in">Checked-In Attendees Only</option>
            <option value="submitted">Project Submitters Only</option>
            <option value="winners">Published Winners</option>
          </select>
        </div>

        <div className="form-field">
          <label className="label">Certificate Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            <option value="participation">Participation</option>
            <option value="finalist">Finalist</option>
            <option value="winner">Winner</option>
            <option value="runner_up">Runner-Up</option>
            <option value="judge">Judge</option>
            <option value="mentor">Mentor</option>
          </select>
        </div>

        <Button type="submit" loading={issuing} disabled={!hackathonId} leftIcon={<Sparkles size={15} />}>
          Issue Certificates
        </Button>
      </form>

      {isLoading ? (
        <CardSkeleton />
      ) : !certs || certs.length === 0 ? (
        <EmptyState icon={<Award size={22} />} title="No certificates issued yet" description="Choose an audience above and generate verifiable PDF certificates in one click." />
      ) : (
        <DataList
          items={certs}
          keyExtractor={(c) => c.id}
          columns={[
            {
              key: "recipient",
              header: "Recipient",
              cell: (c) => <span className="font-semibold text-slate-900">{c.recipientName}</span>,
            },
            {
              key: "type",
              header: "Type",
              cell: (c) => <span className="capitalize badge-blue">{c.type.replace(/_/g, " ")}</span>,
            },
            {
              key: "serial",
              header: "Serial",
              cell: (c) => <span className="font-mono text-xs text-slate-500">{c.serialNumber}</span>,
            },
            {
              key: "date",
              header: "Issued",
              cell: (c) => <span className="text-xs text-slate-500">{formatInZone(toDate(c.issuedAt))}</span>,
            },
            {
              key: "actions",
              header: "Links",
              cell: (c) => (
                <div className="flex items-center gap-2">
                  <Link href={`/verify/${c.serialNumber}`} className="btn-secondary btn-sm">
                    <ExternalLink size={12} /> Verify
                  </Link>
                  <a href={`/api/certificates/${c.serialNumber}/pdf`} className="btn-secondary btn-sm">
                    <Download size={12} /> PDF
                  </a>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
