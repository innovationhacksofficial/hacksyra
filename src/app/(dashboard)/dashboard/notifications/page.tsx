"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteDoc, doc, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNotifications } from "@/lib/data/hooks";
import { formatInZone, toDate } from "@/lib/domain/dates";
import { Button, EmptyState, ListSkeleton, NotConfigured, PageHeader, Tabs, useToast } from "@/components/ui";

export default function NotificationsPage() {
  const { firebaseUser, notConfigured } = useAuth();
  const toast = useToast();
  const uid = firebaseUser?.uid;
  const [tab, setTab] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);

  const { data: items, isLoading } = useNotifications(uid, 100);

  if (notConfigured) return <NotConfigured service="Firestore" />;

  const all = items ?? [];
  const unread = all.filter((n) => !n.isRead);
  const shown = tab === "unread" ? unread : all;

  async function markRead(id: string) {
    if (!firebaseReady()) return;
    try {
      await updateDoc(doc(clientDb(), COLLECTIONS.NOTIFICATIONS, id), {
        isRead: true,
        readAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch {
      toast.error("Couldn't mark as read");
    }
  }

  async function markAllRead() {
    if (!firebaseReady() || unread.length === 0) return;
    setMarkingAll(true);
    try {
      const db = clientDb();
      const batch = writeBatch(db);
      unread.forEach((n) => {
        batch.update(doc(db, COLLECTIONS.NOTIFICATIONS, n.id), {
          isRead: true,
          readAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Couldn't update notifications");
    } finally {
      setMarkingAll(false);
    }
  }

  async function remove(id: string) {
    if (!firebaseReady()) return;
    try {
      await deleteDoc(doc(clientDb(), COLLECTIONS.NOTIFICATIONS, id));
    } catch {
      toast.error("Couldn't delete notification");
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Notifications"
        description="Real-time alerts for registrations, team invites, event reviews, and judging results."
        actions={
          unread.length > 0 ? (
            <Button variant="secondary" size="sm" loading={markingAll} onClick={() => void markAllRead()} leftIcon={<CheckCheck size={15} />}>
              Mark all read ({unread.length})
            </Button>
          ) : null
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "all", label: "All", badge: all.length },
          { id: "unread", label: "Unread", badge: unread.length },
        ]}
      />

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={<Bell size={22} />}
          title={tab === "unread" ? "You're all caught up" : "No notifications yet"}
          description="Important updates about your hackathons and teams will arrive here instantly."
        />
      ) : (
        <div className="space-y-2.5">
          {shown.map((n) => (
            <div
              key={n.id}
              className={`card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                n.isRead ? "bg-white" : "bg-[#EEF4FF]/60 border-[#B3D1FF]"
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#1565D8] shrink-0" />}
                  <p className="font-display font-bold text-sm sm:text-base text-slate-900">{n.title}</p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">{n.message}</p>
                <p className="text-[11px] text-slate-400">{formatInZone(toDate(n.createdAt))}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.linkUrl && (
                  <Link href={n.linkUrl} className="btn-secondary btn-sm">
                    Open
                  </Link>
                )}
                {!n.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => void markRead(n.id)} aria-label="Mark as read">
                    <Check size={15} />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => void remove(n.id)} aria-label="Delete notification" className="text-slate-400 hover:text-red-600">
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
