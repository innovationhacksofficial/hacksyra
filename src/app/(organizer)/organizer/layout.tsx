import { requireUser } from "@/lib/auth/server";
import { AppShell } from "@/components/layout/AppShell";

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/organizer");
  return <AppShell area="organizer">{children}</AppShell>;
}
