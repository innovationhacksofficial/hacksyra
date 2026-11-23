"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Skeleton } from "@/components/ui";

export function QrDisplay({ value, size = 160, alt = "Ticket QR code" }: { value: string | null | undefined; size?: number; alt?: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) return;
    let active = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!value) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[11px] text-slate-400 text-center p-2"
      >
        QR unavailable
      </div>
    );
  }
  if (!dataUrl) return <Skeleton className="rounded-xl" />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={dataUrl} alt={alt} width={size} height={size} className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs" />
  );
}

