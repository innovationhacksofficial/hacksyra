"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { DEFAULT_LISTING_FEE_PAISE, usePlatformSettings } from "@/lib/data/hooks";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/domain/money";
import { Button, Input, PageHeader, Skeleton, useToast } from "@/components/ui";

export default function AdminSettingsPage() {
  const toast = useToast();
  const { data: settings, isLoading } = usePlatformSettings();

  const [feeRupees, setFeeRupees] = useState(String(DEFAULT_LISTING_FEE_PAISE / 100));
  const [supportEmail, setSupportEmail] = useState("support@innovationhacks.in");
  const [flags, setFlags] = useState<Record<string, boolean>>({ publicVoting: true, mentorSessions: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setFeeRupees(String((settings.listingFeeInPaise ?? DEFAULT_LISTING_FEE_PAISE) / 100));
    if (settings.supportEmail) setSupportEmail(settings.supportEmail);
    if (settings.featureFlags) setFlags(settings.featureFlags);
  }, [settings]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const paise = Math.round(Number(feeRupees) * 100);
    setSaving(true);
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: { listingFeeInPaise: paise, supportEmail, featureFlags: flags },
      });
      toast.success("Platform settings saved", `Listing fee is now ${formatMoney(paise)}.`);
    } catch (err) {
      toast.error("Couldn't save settings", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Platform Settings" description="Configure the organizer listing fee, support email, and global feature flags." />

      {isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : (
        <form onSubmit={save} className="card p-6 space-y-5">
          <Input
            label="Hackathon Listing Fee (₹ INR)"
            type="number"
            min={0}
            max={1000}
            step={1}
            value={feeRupees}
            onChange={(e) => setFeeRupees(e.target.value)}
            hint="Set 0 for free listing, or ₹1–₹1000 (e.g. ₹2 or ₹3). Applies immediately to new submissions."
          />

          <Input
            label="Support Email"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
          />

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <span className="label">Feature Flags</span>
            {[
              { key: "publicVoting", label: "Public project voting / likes" },
              { key: "mentorSessions", label: "Mentor session booking" },
            ].map((f) => (
              <label key={f.key} className="flex items-center gap-2.5 text-sm text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(flags[f.key])}
                  onChange={(e) => setFlags((prev) => ({ ...prev, [f.key]: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#1565D8]"
                />
                {f.label}
              </label>
            ))}
          </div>

          <Button type="submit" loading={saving} leftIcon={<Save size={15} />}>
            Save Platform Settings
          </Button>
        </form>
      )}
    </div>
  );
}

