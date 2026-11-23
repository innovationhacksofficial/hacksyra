"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[HACKSYRA error boundary]", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-white">
      <div className="max-w-md w-full card p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} />
        </div>
        <h1 className="font-display font-bold text-2xl text-slate-900">Something went wrong</h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          We hit an unexpected snag while rendering this page. Your data is safe—try reloading.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <Button onClick={reset} leftIcon={<RefreshCw size={15} />}>
            Try again
          </Button>
          <Link href="/" className="btn-secondary">
            <Home size={15} /> Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

