import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export const metadata: Metadata = { title: "Builders" };
export default function BuildersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-8"><ArrowLeft size={16}/>Back</Link>
      <div className="text-center py-24">
        <h1 className="text-4xl font-display font-bold text-text-primary mb-4">Builders Directory</h1>
        <p className="text-text-secondary mb-8">Find developers, designers, and innovators worldwide.</p>
        <span className="badge-violet text-sm px-4 py-2">🚧 Coming in Phase 4</span>
      </div>
    </div>
  );
}
