import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <SiteHeader />
      <main className="flex-1 pt-[64px] md:pt-[68px] pb-16 md:pb-0">{children}</main>
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
