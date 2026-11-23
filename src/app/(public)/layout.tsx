"use client";

import { DevpostNavbar } from "@/components/layout/DevpostNavbar";
import { DevpostFooter } from "@/components/layout/DevpostFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Devpost Top Navigation Bar */}
      <DevpostNavbar />

      {/* Main Full-Width Content Area */}
      <main className="flex-1 pt-[104px] bg-white">
        {children}
      </main>

      {/* Devpost 4-Column Footer */}
      <DevpostFooter />
    </div>
  );
}
