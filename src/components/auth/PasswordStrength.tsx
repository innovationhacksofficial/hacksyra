"use client";

import { Check } from "lucide-react";

export function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Symbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const barColor =
    score <= 1 ? "bg-red-500" : score === 2 ? "bg-amber-500" : score === 3 ? "bg-sky-500" : "bg-emerald-500";
  const label = score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";

  if (!password) return null;

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 grid grid-cols-4 gap-1 h-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`rounded-full transition-colors ${i < score ? barColor : "bg-slate-200"}`} />
          ))}
        </div>
        <span className="text-[11px] font-semibold text-slate-600">{label}</span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`inline-flex items-center gap-1 text-[11px] font-medium ${c.ok ? "text-emerald-700" : "text-slate-400"}`}
          >
            <Check size={11} className={c.ok ? "opacity-100" : "opacity-30"} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

