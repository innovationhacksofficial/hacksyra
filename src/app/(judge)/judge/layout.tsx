import { requireUser } from "@/lib/auth/server";
import { AppShell } from "@/components/layout/AppShell";

export default async function JudgeLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/judge");
  return <AppShell area="judge">{children}</AppShell>;
}

