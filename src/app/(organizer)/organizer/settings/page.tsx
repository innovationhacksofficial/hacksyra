"use client";

import { useEffect, useState } from "react";
import { collection, doc, limit, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { Building2, ShieldCheck, Save, CheckCircle2 } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import { Button, Input, PageHeader, Select, Skeleton, StatusBadge, Textarea, useToast } from "@/components/ui";
import type { Organization, OrgType } from "@/types";

export default function OrganizerSettingsPage() {
  const { firebaseUser, user } = useAuth();
  const toast = useToast();

  const { data: orgs, isLoading } = useLiveQuery<Organization>(
    ["my-org", firebaseUser?.uid ?? null],
    firebaseUser?.uid
      ? () => query(collection(clientDb(), COLLECTIONS.ORGANIZATIONS), where("ownerId", "==", firebaseUser.uid), limit(1))
      : null
  );
  const org = orgs?.[0];

  const [name, setName] = useState("");
  const [type, setType] = useState<OrgType>("community");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [country, setCountry] = useState("India");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (org) {
      setName(org.name || "");
      setType(org.type || "community");
      setWebsite(org.website || "");
      setContactEmail(org.contactEmail || "");
      setCountry(org.country || "India");
      setDescription(org.description || "");
    } else if (user) {
      setName(user.organization || user.displayName || "");
      setContactEmail(user.email || "");
      setCountry(user.country || "India");
    }
  }, [org, user]);

  async function save(submitForVerification = false) {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      await Promise.all([
        api("/api/organizer/organization", {
          method: "POST",
          body: { name, type, website, contactEmail, country, description, submitForVerification },
        }),
        updateDoc(doc(clientDb(), COLLECTIONS.USERS, firebaseUser.uid), {
          organization: name.trim(),
          updatedAt: serverTimestamp(),
        }),
      ]);
      toast.success(
        submitForVerification ? "Verification requested" : "Organization settings saved",
        submitForVerification ? "Admins will review your organizer profile shortly." : undefined
      );
    } catch (e) {
      toast.error("Couldn't save settings", e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Organizer Profile & Verification"
        description="Manage your organization identity shown on your hackathon pages. All payments are handled centrally via HACKSYRA's platform Razorpay account."
        badge={org ? <StatusBadge status={org.verificationStatus} /> : undefined}
      />

      {isLoading ? (
        <Skeleton className="h-80 rounded-2xl" />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save(false);
          }}
          className="card p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 size={18} className="text-[#1565D8]" />
            <h2 className="font-display font-bold text-base text-slate-900">Organization Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Organization / Host Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Select label="Organization Type" value={type} onChange={(e) => setType(e.target.value as OrgType)}>
              <option value="college">College / Student Club</option>
              <option value="university">University</option>
              <option value="company">Company</option>
              <option value="startup">Startup</option>
              <option value="community">Developer Community</option>
              <option value="nonprofit">Non-profit</option>
              <option value="individual">Individual Host</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Contact Email" type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            <Input label="Website (optional)" type="url" placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          <Input label="Country" required value={country} onChange={(e) => setCountry(e.target.value)} />

          <Textarea
            label="About the Organization"
            rows={3}
            placeholder="Describe your community or organization..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="p-4 rounded-2xl bg-[#EEF4FF]/60 border border-[#DCE9FF] flex items-start gap-3 text-xs text-slate-700">
            <ShieldCheck size={18} className="text-[#1565D8] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Centralized Platform Payments</p>
              <p className="mt-0.5 leading-relaxed">
                Paid hackathon tickets and listing fees process securely through HACKSYRA&apos;s platform Razorpay account—there are no organizer API keys to configure. View your ticket revenue and issue refunds anytime from{" "}
                <strong className="text-[#1565D8]">Organizer → Payments</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {(!org || org.verificationStatus === "unverified" || org.verificationStatus === "more_info_required") && (
              <Button
                variant="outline"
                type="button"
                loading={saving}
                onClick={() => void save(true)}
                leftIcon={<CheckCircle2 size={15} />}
              >
                Request Organizer Verification
              </Button>
            )}
            <Button type="submit" loading={saving} leftIcon={<Save size={15} />} className="ml-auto">
              Save Organization
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
