"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  description,
  maxWidth = "max-w-lg",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  maxWidth?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // move focus inside dialog
    const t = window.setTimeout(() => panelRef.current?.focus(), 10);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: reduced ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 w-full ${maxWidth} bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col outline-none safe-bottom`}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100 shrink-0">
                <div>
                  {title && <h2 className="font-display font-bold text-lg text-slate-900">{title}</h2>}
                  {description && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="p-5 overflow-y-auto flex-1">{children}</div>
            {footer && <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/70 rounded-b-2xl flex items-center justify-end gap-2.5 shrink-0">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Responsive Sheet: draggable bottom sheet on <md, right-side drawer on md+. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  side = "right",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "right" | "left";
}) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal flex items-end md:items-stretch justify-end" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs"
          />
          <motion.div
            initial={reduced ? { opacity: 0 } : { y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={reduced ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 260 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 400) onClose();
            }}
            className={`relative z-10 w-full md:w-[400px] bg-white rounded-t-3xl md:rounded-none ${
              side === "left" ? "md:mr-auto" : "md:ml-auto"
            } max-h-[88vh] md:max-h-full flex flex-col shadow-2xl border-t md:border-t-0 md:border-l border-slate-200 safe-bottom`}
          >
            <div className="md:hidden flex justify-center pt-2.5 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h2 className="font-display font-bold text-base text-slate-900">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

