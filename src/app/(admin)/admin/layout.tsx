import { requireAdmin } from "@/lib/auth/server";
import { AppShell } from "@/components/layout/AppShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AppShell area="admin">{children}</AppShell>;
}

