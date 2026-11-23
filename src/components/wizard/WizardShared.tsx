"use client";

import Image from "next/image";
import { useState } from "react";
import { UploadCloud, X, Plus } from "lucide-react";
import { uploadToStorage } from "@/lib/storage/upload";
import { Button } from "@/components/ui";

export function ChipInput({
  label,
  values,
  onChange,
  placeholder,
  max = 12,
  hint,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  max?: number;
  hint?: string;
}) {
  const [text, setText] = useState("");

  function add() {
    const clean = text.trim();
    if (!clean || values.includes(clean) || values.length >= max) return;
    onChange([...values, clean]);
    setText("");
  }

  return (
    <div className="form-field">
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? "Type and press Enter"}
          className="input flex-1"
        />
        <Button variant="secondary" size="sm" onClick={add} leftIcon={<Plus size={14} />}>
          Add
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF4FF] text-[#1565D8] text-xs font-semibold border border-[#DCE9FF]"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                aria-label={`Remove ${v}`}
                className="hover:text-red-600"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function ImageUploader({
  label,
  storagePath,
  value,
  onChange,
  aspect = "aspect-[16/9]",
  hint,
}: {
  label: string;
  storagePath: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  aspect?: string;
  hint?: string;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    setProgress(0);
    try {
      const res = await uploadToStorage(`${storagePath}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`, file, {
        maxMb: 8,
        accept: ["image/"],
        onProgress: setProgress,
      });
      onChange(res.url);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Upload failed");
    } finally {
      setProgress(null);
      e.target.value = "";
    }
  }

  return (
    <div className="form-field">
      <span className="label">{label}</span>
      {value ? (
        <div className={`relative ${aspect} w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group`}>
          <Image src={value} alt={label} fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label={`Remove ${label}`}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-slate-900/75 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#1565D8]/60 bg-slate-50/70 hover:bg-[#EEF4FF]/30 cursor-pointer transition-colors text-center">
          <UploadCloud size={22} className="text-[#1565D8]" />
          <span className="text-xs font-semibold text-slate-700">
            {progress != null ? `Uploading... ${progress}%` : "Click to upload image (PNG, JPG, WebP ≤ 8 MB)"}
          </span>
          {progress != null && (
            <div className="w-40 progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          )}
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={progress != null} />
        </label>
      )}
      {err && <p className="text-xs text-red-600 font-medium">{err}</p>}
      {hint && !err && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

