"use client";

import { collection, deleteDoc, doc, orderBy, query, where } from "firebase/firestore";
import { Bookmark, Compass, Trash2 } from "lucide-react";
import { clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { useHackathon } from "@/lib/data/hooks";
import { HackathonCard } from "@/components/hackathons/HackathonCard";
import { Button, CardSkeleton, EmptyState, NotConfigured, PageHeader, useToast } from "@/components/ui";
import type { Bookmark as BookmarkType } from "@/types";

function SavedHackathonTile({ bookmark }: { bookmark: BookmarkType }) {
  const toast = useToast();
  const { data: h, isLoading } = useHackathon(bookmark.hackathonId);

  async function remove() {
    if (!firebaseReady()) return;
    try {
      await deleteDoc(doc(clientDb(), COLLECTIONS.BOOKMARKS, bookmark.id));
      toast.info("Removed from saved");
    } catch {
      toast.error("Couldn't remove bookmark");
    }
  }

  if (isLoading) return <CardSkeleton />;
  if (!h) {
    return (
      <div className="card p-5 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">This hackathon is no longer listed.</p>
        <Button variant="ghost" size="sm" onClick={() => void remove()} aria-label="Remove">
          <Trash2 size={15} />
        </Button>
      </div>
    );
  }

  return <HackathonCard hackathon={h} bookmarked />;
}

export default function SavedHackathonsPage() {
  const { firebaseUser, notConfigured } = useAuth();
  const uid = firebaseUser?.uid;
  const ready = Boolean(uid && firebaseReady());

  const { data: bookmarks, isLoading } = useLiveQuery<BookmarkType>(
    ["my-bookmarks", uid ?? null],
    ready ? () => query(collection(clientDb(), COLLECTIONS.BOOKMARKS), where("userId", "==", uid), orderBy("createdAt", "desc")) : null
  );

  if (notConfigured) return <NotConfigured service="Firestore" />;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Saved Hackathons"
        description="Your bookmarked events, synced live across mobile, tablet, and desktop."
        actions={
          <Button variant="secondary" href="/hackathons" leftIcon={<Compass size={16} />}>
            Browse Directory
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !bookmarks || bookmarks.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={22} />}
          title="No saved hackathons yet"
          description="Tap the bookmark icon on any hackathon card to track deadlines and revisit it later."
          action={<Button href="/hackathons">Explore Hackathons</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarks.map((b) => (
            <SavedHackathonTile key={b.id} bookmark={b} />
          ))}
        </div>
      )}
    </div>
  );
}
