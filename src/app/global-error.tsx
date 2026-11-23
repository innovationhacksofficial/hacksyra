"use client";

import Link from "next/link";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans text-slate-900">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertOctagon size={24} />
          </div>
          <h1 className="font-bold text-xl">Application Error</h1>
          <p className="text-sm text-slate-600 mt-2">Something unexpected broke. Try refreshing the app.</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1565D8] text-white text-sm font-semibold"
            >
              <RefreshCw size={15} /> Reload
            </button>
            <Link href="/" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold">
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

