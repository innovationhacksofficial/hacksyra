import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy" };
export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Privacy Policy</h1>
      <p className="text-text-secondary text-sm mb-6">How HACKSYRA handles your data.</p>
      <div className="card p-10 text-center">
        <p className="text-text-secondary text-sm">This section is fully implemented in Phase 2+.</p>
        <span className="badge-violet mt-4 inline-flex">🚧 Full implementation coming soon</span>
      </div>
    </div>
  );
}
