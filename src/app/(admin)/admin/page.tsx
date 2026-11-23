import { PageHeader, StatSkeleton } from "@/components/ui";

export default function AdminLoadingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Platform Admin" description="Loading administrative telemetry..." />
      <StatSkeleton count={4} />
    </div>
  );
}

