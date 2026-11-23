"use client";

import { collection, orderBy, query, where } from "firebase/firestore";
import { Ticket, ExternalLink } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { Button, EmptyState, ErrorState, ListSkeleton, PageHeader, StatusBadge } from "@/components/ui";
import { QrDisplay } from "@/components/payments/QrDisplay";
import type { TicketDoc } from "@/types/commerce";

export default function DashboardTicketsPage() {
  const { firebaseUser } = useAuth();
  const { data: tickets, isLoading, error } = useLiveQuery<TicketDoc>(
    ["tickets", "user", firebaseUser?.uid ?? null],
    firebaseUser?.uid
      ? () => query(collection(clientDb(), COLLECTIONS.TICKETS), where("userId", "==", firebaseUser.uid), orderBy("createdAt", "desc"))
      : null
  );

  return (
    <div className="space-y-6">
      <PageHeader title="My Tickets & QR Passes" description="Show your QR code at venue check-in or view your confirmed passes." />

      {error ? (
        <ErrorState message={error.message} />
      ) : isLoading ? (
        <ListSkeleton rows={3} />
      ) : !tickets || tickets.length === 0 ? (
        <EmptyState
          icon={<Ticket size={22} />}
          title="No tickets yet"
          description="Register for a hackathon to generate your verified check-in QR pass."
          action={<Button href="/hackathons">Explore hackathons</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tickets.map((t) => (
            <div key={t.id} className="card p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5">
              <QrDisplay value={t.qrCode} size={130} />
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                <StatusBadge status={t.status} />
                <h3 className="font-display font-bold text-lg text-slate-900 truncate">{t.hackathonName}</h3>
                <p className="text-xs font-mono font-semibold text-[#1565D8]">{t.ticketNumber}</p>
                <p className="text-xs text-slate-500">
                  {t.attendeeName} · {t.tierName}
                </p>
                <div className="pt-2">
                  <Button variant="secondary" size="sm" href={`/hackathons/${t.hackathonSlug}`} rightIcon={<ExternalLink size={12} />}>
                    Event Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
