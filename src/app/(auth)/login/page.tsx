import { Suspense } from "react";
import { AuthFlipCard } from "@/components/auth/AuthFlipCard";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-3xl border border-slate-200 min-h-[600px] skeleton" />}>
      <AuthFlipCard initialMode="login" />
    </Suspense>
  );
}
