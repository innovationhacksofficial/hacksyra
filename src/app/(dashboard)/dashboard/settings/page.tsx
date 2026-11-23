"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Download, ExternalLink, KeyRound, Save, Trash2, Upload } from "lucide-react";
import { clientAuth, clientDb, firebaseReady } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveDoc } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import { uploadToStorage } from "@/lib/storage/upload";
import {
  Avatar,
  Button,
  ConfirmDialog,
  Input,
  NotConfigured,
  PageHeader,
  Skeleton,
  Textarea,
  useToast,
} from "@/components/ui";
import type { SocialLink, User, UserProfile } from "@/types";

type ExtendedUser = User & {
  city?: string;
  portfolioUrl?: string;
  notificationPrefs?: { email?: boolean; reminders?: boolean; marketing?: boolean };
};
type ExtendedProfile = UserProfile & {
  city?: string;
  organization?: string;
};

export default function SettingsPage() {
  const { firebaseUser, user, signOut, notConfigured } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const uid = firebaseUser?.uid;

  const { data: profile, isLoading } = useLiveDoc<ExtendedProfile>(
    ["settings-profile", uid ?? null],
    uid && firebaseReady() ? () => doc(clientDb(), COLLECTIONS.USER_PROFILES, uid) : null
  );

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [organization, setOrganization] = useState("");
  const [college, setCollege] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [lookingForTeam, setLookingForTeam] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [reminderAlerts, setReminderAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<number | null>(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user && !profile) return;
    const extUser = user as ExtendedUser | null;
    const links = profile?.socialLinks ?? [];
    setDisplayName(extUser?.displayName || profile?.displayName || "");
    setBio(extUser?.bio || profile?.bio || "");
    setCity(extUser?.city || profile?.city || "");
    setCountry(extUser?.country || profile?.country || "");
    setOrganization(extUser?.organization || profile?.organization || "");
    setCollege(extUser?.college || profile?.college || "");
    setSkillsText((extUser?.skills || profile?.skills || []).join(", "));
    setGithubUrl(extUser?.githubUrl || links.find((l) => l.platform === "github")?.url || "");
    setLinkedinUrl(extUser?.linkedinUrl || links.find((l) => l.platform === "linkedin")?.url || "");
    setPortfolioUrl(extUser?.portfolioUrl || links.find((l) => l.platform === "website")?.url || "");
    setLookingForTeam(Boolean(extUser?.lookingForTeam ?? profile?.lookingForTeam));
    setIsPublic(profile?.isPublic ?? true);
    setEmailAlerts(extUser?.notificationPrefs?.email ?? true);
    setReminderAlerts(extUser?.notificationPrefs?.reminders ?? true);
  }, [user, profile]);

  if (notConfigured) return <NotConfigured service="Firestore" />;
  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !firebaseReady()) return;
    setSaving(true);
    try {
      const db = clientDb();
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20);
      const shared = {
        displayName: displayName.trim() || "Builder",
        bio: bio.trim(),
        city: city.trim(),
        country: country.trim(),
        organization: organization.trim(),
        college: college.trim(),
        skills,
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        lookingForTeam,
        updatedAt: serverTimestamp(),
      };
      const socialLinks: SocialLink[] = [];
      if (githubUrl.trim()) socialLinks.push({ platform: "github", url: githubUrl.trim() });
      if (linkedinUrl.trim()) socialLinks.push({ platform: "linkedin", url: linkedinUrl.trim() });
      if (portfolioUrl.trim()) socialLinks.push({ platform: "website", url: portfolioUrl.trim() });

      await Promise.all([
        updateDoc(doc(db, COLLECTIONS.USERS, uid), {
          ...shared,
          notificationPrefs: { email: emailAlerts, reminders: reminderAlerts, marketing: false },
        }),
        updateDoc(doc(db, COLLECTIONS.USER_PROFILES, uid), {
          ...shared,
          socialLinks,
          isPublic,
        }),
      ]);
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Couldn't save profile", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    if (!uid || !firebaseReady()) return;
    setUploadingAvatar(1);
    try {
      const res = await uploadToStorage(`users/${uid}/avatar-${Date.now()}`, file, {
        maxMb: 3,
        accept: ["image/"],
        onProgress: (p) => setUploadingAvatar(p),
      });
      const db = clientDb();
      await Promise.all([
        updateDoc(doc(db, COLLECTIONS.USERS, uid), { photoURL: res.url, updatedAt: serverTimestamp() }),
        updateDoc(doc(db, COLLECTIONS.USER_PROFILES, uid), { photoURL: res.url, updatedAt: serverTimestamp() }),
      ]);
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error("Upload failed", err instanceof Error ? err.message : undefined);
    } finally {
      setUploadingAvatar(null);
    }
  }

  async function handlePasswordReset() {
    if (!firebaseUser?.email) return;
    setSendingReset(true);
    try {
      await sendPasswordResetEmail(clientAuth(), firebaseUser.email);
      toast.success("Password reset email sent", `Check ${firebaseUser.email}`);
    } catch (err) {
      toast.error("Couldn't send reset link", err instanceof Error ? err.message : undefined);
    } finally {
      setSendingReset(false);
    }
  }

  async function handleExportData() {
    try {
      const data = await api<Record<string, unknown>>("/api/users/me/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hacksyra-export-${user?.username || "account"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Export failed", err instanceof Error ? err.message : undefined);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await api("/api/users/me", { method: "DELETE" });
      await signOut();
      router.replace("/");
    } catch (err) {
      toast.error("Couldn't delete account", err instanceof Error ? err.message : undefined);
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 pb-8 max-w-4xl">
      <PageHeader
        title="Profile & Settings"
        description="Manage your public builder identity, skills, notification preferences, and account security."
        actions={
          user?.username ? (
            <Link href={`/u/${user.username}`} className="btn-secondary btn-sm">
              <ExternalLink size={14} /> Public Profile
            </Link>
          ) : null
        }
      />

      <form onSubmit={saveProfile} className="card p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-slate-100">
          <Avatar name={displayName || firebaseUser?.displayName} src={user?.photoURL} size="xl" />
          <div className="space-y-2">
            <p className="font-display font-bold text-base text-slate-900">@{user?.username || "builder"}</p>
            <label className="btn-secondary btn-sm cursor-pointer inline-flex">
              <Upload size={14} /> {uploadingAvatar !== null ? `Uploading ${uploadingAvatar}%...` : "Upload Photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleAvatarUpload(f);
                }}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Display Name *" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input label="Skills (comma separated)" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="TypeScript, Next.js, AI/ML" />
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bengaluru" />
          <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="India" />
          <Input label="Company / Organization" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          <Input label="College / University" value={college} onChange={(e) => setCollege(e.target.value)} />
          <Input label="GitHub URL" type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." />
          <Input label="LinkedIn URL" type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
        </div>

        <Input label="Portfolio / Website" type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://..." />
        <Textarea label="Short Bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell teammates what you love building..." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer text-sm">
            <input type="checkbox" checked={lookingForTeam} onChange={(e) => setLookingForTeam(e.target.checked)} className="rounded border-slate-300" />
            <span>Open to joining hackathon teams</span>
          </label>
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer text-sm">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded border-slate-300" />
            <span>Public builder directory profile</span>
          </label>
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer text-sm">
            <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} className="rounded border-slate-300" />
            <span>Transactional &amp; team email updates</span>
          </label>
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer text-sm">
            <input type="checkbox" checked={reminderAlerts} onChange={(e) => setReminderAlerts(e.target.checked)} className="rounded border-slate-300" />
            <span>Deadline reminder alerts (24h &amp; 1h)</span>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={saving} leftIcon={<Save size={15} />}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Account Security & Data */}
      <div className="card p-5 sm:p-6 space-y-4">
        <h2 className="font-display font-bold text-base text-slate-900">Account Security &amp; Data</h2>
        <div className="flex flex-wrap items-center gap-3">
          {firebaseUser?.email && (
            <Button variant="secondary" size="sm" loading={sendingReset} onClick={() => void handlePasswordReset()} leftIcon={<KeyRound size={15} />}>
              Send Password Reset Email
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => void handleExportData()} leftIcon={<Download size={15} />}>
            Download My Data (JSON)
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)} leftIcon={<Trash2 size={15} />} className="sm:ml-auto">
            Delete Account
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        loading={deleting}
        danger
        title="Permanently delete your HACKSYRA account?"
        message="This deactivates your profile, clears personal details, and signs you out across all sessions. Certificates remain verifiable for authenticity."
        confirmLabel="Delete My Account"
      />
    </div>
  );
}
