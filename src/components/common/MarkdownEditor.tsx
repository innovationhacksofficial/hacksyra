"use client";

import { useState, useRef } from "react";
import { Bold, Italic, Heading2, List, Link as LinkIcon, Code, Eye, Edit3 } from "lucide-react";
import { Markdown } from "./Markdown";

export function MarkdownEditor({
  label,
  value,
  onChange,
  placeholder,
  rows = 7,
  error,
  hint,
  required,
}: {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const areaRef = useRef<HTMLTextAreaElement>(null);

  function wrapSelection(before: string, after = "") {
    const el = areaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "text";
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    window.requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  return (
    <div className="form-field">
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label className="label flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              tab === "write" ? "bg-white text-[#1565D8] shadow-xs" : "text-slate-600"
            }`}
          >
            <Edit3 size={12} /> Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              tab === "preview" ? "bg-white text-[#1565D8] shadow-xs" : "text-slate-600"
            }`}
          >
            <Eye size={12} /> Preview
          </button>
        </div>
      </div>

      <div className={`rounded-xl border bg-white overflow-hidden ${error ? "border-red-500" : "border-slate-200"}`}>
        {tab === "write" ? (
          <>
            <div className="flex items-center gap-1 px-2.5 py-1.5 border-b border-slate-100 bg-slate-50/70 overflow-x-auto">
              {[
                { icon: Heading2, title: "Heading", fn: () => wrapSelection("## ") },
                { icon: Bold, title: "Bold", fn: () => wrapSelection("**", "**") },
                { icon: Italic, title: "Italic", fn: () => wrapSelection("_", "_") },
                { icon: List, title: "Bullet list", fn: () => wrapSelection("- ") },
                { icon: Code, title: "Code", fn: () => wrapSelection("`", "`") },
                { icon: LinkIcon, title: "Link", fn: () => wrapSelection("[", "](https://)") },
              ].map((b) => (
                <button
                  key={b.title}
                  type="button"
                  title={b.title}
                  onClick={b.fn}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-[#1565D8] hover:bg-white transition-colors shrink-0"
                >
                  <b.icon size={15} />
                </button>
              ))}
            </div>
            <textarea
              ref={areaRef}
              rows={rows}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-y min-h-[140px]"
            />
          </>
        ) : (
          <div className="p-4 min-h-[180px] max-h-[380px] overflow-y-auto bg-slate-50/30">
            {value.trim() ? (
              <Markdown content={value} />
            ) : (
              <p className="text-xs text-slate-400 italic">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

