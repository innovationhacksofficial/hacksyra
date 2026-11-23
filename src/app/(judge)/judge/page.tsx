import { PageHeader, ListSkeleton } from "@/components/ui";

export default function JudgeLoadingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Judge Portal" description="Loading your hackathon assignments..." />
      <ListSkeleton rows={3} />
    </div>
  );
}

