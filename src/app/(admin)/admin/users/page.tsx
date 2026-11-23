"use client";

import { useMemo, useState } from "react";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { Users, Search, ShieldAlert, Ban } from "lucide-react";
import { clientDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLiveQuery } from "@/lib/data/live";
import { api } from "@/lib/api-client";
import { canGrantRole } from "@/lib/domain/admin-logic";
import { Avatar, Button, ConfirmDialog, DataList, EmptyState, Input, ListSkeleton, PageHeader, Select, StatusBadge, useToast } from "@/components/ui";
import type { AdminUserDoc } from "@/types/admin";
import type { UserRole } from "@/types";

const ALL_ROLES: UserRole[] = ["participant", "organizer", "judge", "mentor", "moderator", "admin", "super_admin"];

export default function AdminUsersPage() {
  const { role: actorRole } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [banTarget, setBanTarget] = useState<AdminUserDoc | null>(null);
  const [banReason, setBanReason] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: users, isLoading } = useLiveQuery<AdminUserDoc>(["admin", "users"], () =>
    query(collection(clientDb(), COLLECTIONS.USERS), orderBy("createdAt", "desc"), limit(150))
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (users ?? []).filter((u) => {
      if (!q) return true;
      return `${u.displayName ?? ""} ${u.email ?? ""} ${u.username ?? ""}`.toLowerCase().includes(q);
    });
  }, [users, search]);

  async function changeRole(uid: string, nextRole: UserRole) {
    try {
      await api(`/api/admin/users/${uid}/role`, { method: "POST", body: { role: nextRole } });
      toast.success("Role updated", `Granted "${nextRole}" (takes effect on user's next login).`);
    } catch (e) {
      toast.error("Couldn't change role", e instanceof Error ? e.message : undefined);
    }
  }

  async function toggleBan() {
    if (!banTarget) return;
    setBusy(true);
    try {
      const next = !banTarget.isBanned;
      await api(`/api/admin/users/${banTarget.id}/ban`, { method: "POST", body: { banned: next, reason: banReason || undefined } });
      toast.success(next ? "User banned" : "User unbanned");
      setBanTarget(null);
      setBanReason("");
    } catch (e) {
      toast.error("Failed", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description="Search accounts, assign roles (claims), or suspend abusive accounts." />

      <Input placeholder="Search by email, username, or name..." leftAdornment={<Search size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} />

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users size={22} />} title="No matching users" />
      ) : (
        <DataList
          items={filtered}
          keyExtractor={(u) => u.id}
          columns={[
            {
              key: "user",
              header: "User",
              cell: (u) => (
                <div className="flex items-center gap-3">
                  <Avatar name={u.displayName || u.email} src={u.photoURL} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{u.displayName || "Builder"}</p>
                    <p className="text-xs text-slate-500 truncate">@{u.username} · {u.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "roles",
              header: "Role",
              cell: (u) => {
                const topRole = (u.roles?.[u.roles.length - 1] ?? "participant") as UserRole;
                return (
                  <Select
                    aria-label={`Role for ${u.email}`}
                    value={topRole}
                    onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                    className="!min-h-[36px] text-xs w-36"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r} disabled={!canGrantRole(actorRole, r)}>
                        {r}
                      </option>
                    ))}
                  </Select>
                );
              },
            },
            {
              key: "status",
              header: "Account",
              cell: (u) => (u.isBanned ? <StatusBadge status="suspended" label="Banned" /> : <StatusBadge status="active" label="Active" />),
            },
            {
              key: "ban",
              header: "Actions",
              cell: (u) => (
                <Button
                  variant={u.isBanned ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setBanTarget(u)}
                  leftIcon={u.isBanned ? <ShieldAlert size={13} /> : <Ban size={13} className="text-red-600" />}
                >
                  {u.isBanned ? "Unban" : "Ban"}
                </Button>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!banTarget}
        onClose={() => setBanTarget(null)}
        onConfirm={toggleBan}
        loading={busy}
        danger={!banTarget?.isBanned}
        title={banTarget?.isBanned ? `Unban ${banTarget.email}?` : `Ban ${banTarget?.email}?`}
        confirmLabel={banTarget?.isBanned ? "Unban" : "Ban Account"}
      >
        {!banTarget?.isBanned && <Input label="Ban Reason" value={banReason} onChange={(e) => setBanReason(e.target.value)} />}
      </ConfirmDialog>
    </div>
  );
}

