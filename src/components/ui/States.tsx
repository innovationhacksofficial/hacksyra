import type { ReactNode } from "react";
import { AlertCircle, Inbox, RefreshCw, Wrench } from "lucide-react";
import { Button } from "./Button";

export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} aria-hidden />;
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card p-5 space-y-3" aria-busy="true">
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${i === lines - 1 ? "w-1/2" : "w-full"}`} />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card p-4 flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg hidden sm:block" />
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 space-y-2.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`card p-8 sm:p-12 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-[#EEF4FF] text-[#1565D8] flex items-center justify-center mb-4">
        {icon ?? <Inbox size={22} />}
      </div>
      <h3 className="font-display font-bold text-lg text-slate-900">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-md mt-1.5 leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something didn't load",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card p-6 sm:p-8 border-red-200 bg-red-50/40 text-center flex flex-col items-center">
      <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
        <AlertCircle size={20} />
      </div>
      <h3 className="font-display font-bold text-base text-slate-900">{title}</h3>
      {message && <p className="text-sm text-slate-600 mt-1 max-w-md">{message}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<RefreshCw size={14} />} className="mt-4">
          Try again
        </Button>
      )}
    </div>
  );
}

export function NotConfigured({
  service,
  hint,
}: {
  service: string;
  hint?: string;
}) {
  return (
    <div className="card p-6 border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
        <Wrench size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
          {service} is not configured in this environment
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {hint ?? "Check your .env.local keys (or start the local Firebase emulators with npm run emulators) and see README.md."}
        </p>
      </div>
    </div>
  );
}

