import { Suspense } from "react";
import { WizardShell } from "@/components/wizard/WizardShell";
import { Skeleton } from "@/components/ui";

export default function CreateHackathonPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
      <WizardShell />
    </Suspense>
  );
}
