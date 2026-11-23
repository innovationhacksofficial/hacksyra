import type { Timestamp } from "firebase/firestore";
import type { HackathonCategory, HackathonStatus, UserRole, VerificationStatus } from "@/types";

// ============================================
// ADMIN — types used by the admin console and /api/admin/*
// ============================================

export type AdminActor = { uid: string; email?: string | null; role?: UserRole };

export type ReviewDecision = "approved" | "rejected" | "more_info_required" | "suspended" | "unsuspended";

export type ReviewHistoryEntry = {
  at: Timestamp;
  by: string;
  byEmail?: string | null;
  decision: ReviewDecision | string;
  message?: string;
  fromStatus?: HackathonStatus;
  toStatus?: HackathonStatus;
};

/** Result of every review action. `changed: false` = idempotent no-op. */
export type ReviewActionResult = {
  ok: true;
  changed: boolean;
  status: HackathonStatus;
  isListed: boolean;
};

export type ModerationTargetType = "hackathon" | "project" | "user" | "comment" | "discussion" | "team" | "other";
export type ModerationReportStatus = "open" | "resolved" | "dismissed";

export type ModerationReport = {
  id: string;
  reporterId: string;
  reporterEmail?: string;
  targetType: ModerationTargetType;
  targetId: string;
  targetUrl?: string;
  targetTitle?: string;
  reason: string;
  details?: string;
  status: ModerationReportStatus;
  actionNote?: string;
  resolvedBy?: string;
  resolvedByEmail?: string;
  resolvedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
};

export type OrgVerificationTarget = Extract<VerificationStatus, "verified" | "rejected" | "more_info_required" | "suspended">;

export type OrgVerificationHistoryEntry = {
  at: Timestamp;
  by: string;
  from: VerificationStatus;
  to: VerificationStatus;
  note?: string;
};

/** Body for PUT /api/admin/settings (all fields optional; at least one required). */
export type PlatformSettingsInput = {
  listingFeeInPaise?: number;
  categories?: { id: HackathonCategory; label: string }[];
  featureFlags?: Record<string, boolean>;
  supportEmail?: string;
};

/** Order/payment "kind" (written by the payments agent). */
export type PaymentKind = "listing_fee" | "registration" | "other";

/** Loose shape of orders/payments as read by the admin payments page. */
export type AdminLedgerDoc = {
  id: string;
  kind?: PaymentKind | string;
  purpose?: string;
  hackathonId?: string;
  hackathonName?: string;
  userId?: string;
  userEmail?: string;
  organizerId?: string;
  orderId?: string;
  orderNumber?: string;
  provider?: string;
  providerPaymentId?: string;
  providerOrderId?: string;
  amount?: number;
  amountInPaise?: number;
  total?: number;
  amountRefunded?: number;
  refundedAmountInPaise?: number;
  currency?: string;
  status?: string;
  method?: string;
  createdAt?: Timestamp;
  capturedAt?: Timestamp;
  paidAt?: Timestamp;
};

export type AdminUserDoc = {
  id: string;
  uid?: string;
  email?: string;
  displayName?: string;
  username?: string;
  photoURL?: string;
  roles?: UserRole[];
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: Timestamp;
  emailVerified?: boolean;
  createdAt?: Timestamp;
  lastActiveAt?: Timestamp;
  college?: string;
  organization?: string;
  country?: string;
};
