"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

export type ToastInput = {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

type ToastItem = ToastInput & { id: string };

// Lightweight store so useToast() works regardless of where <Toaster /> is mounted.
const listeners = new Set<(t: ToastItem) => void>();

export function pushToast(input: ToastInput) {
  const item: ToastItem = { ...input, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
  listeners.forEach((fn) => fn(item));
}

const api = {
  toast: pushToast,
  success: (title: string, message?: string) => pushToast({ type: "success", title, message }),
  error: (title: string, message?: string) => pushToast({ type: "error", title, message }),
  info: (title: string, message?: string) => pushToast({ type: "info", title, message }),
  warning: (title: string, message?: string) => pushToast({ type: "warning", title, message }),
};

export function useToast() {
  return api;
}

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES: Record<ToastType, string> = {
  success: "bg-white border-emerald-200 text-slate-900 [&_.toast-icon]:text-emerald-600",
  error: "bg-white border-red-200 text-slate-900 [&_.toast-icon]:text-red-600",
  info: "bg-white border-blue-200 text-slate-900 [&_.toast-icon]:text-[#1565D8]",
  warning: "bg-white border-amber-200 text-slate-900 [&_.toast-icon]:text-amber-600",
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const reduced = useReducedMotion();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (item: ToastItem) => {
      setToasts((prev) => [...prev.slice(-3), item]);
      window.setTimeout(() => removeToast(item.id), item.duration ?? 4500);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, [removeToast]);

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-20 md:bottom-5 right-3 sm:right-5 left-3 sm:left-auto z-toast flex flex-col gap-2 sm:w-96 pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: 32, scale: 0.96 }}
              transition={{ duration: reduced ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl pointer-events-auto ${STYLES[t.type]}`}
              role="alert"
            >
              <Icon size={18} className="toast-icon shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                {t.message && <p className="text-xs mt-0.5 text-slate-600">{t.message}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
