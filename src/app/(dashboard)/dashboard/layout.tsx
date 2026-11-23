import { requireUser } from "@/lib/auth/server";
import { AppShell } from "@/components/layout/AppShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/dashboard");
  return <AppShell area="participant">{children}</AppShell>;
}
