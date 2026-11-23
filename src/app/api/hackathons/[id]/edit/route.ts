import { z } from "zod";
import { adminDb, FieldValue, Timestamp } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { isAdminRole } from "@/lib/auth/roles";
import { isLive, EDITABLE_STATUSES } from "@/lib/domain/status";
import { toDate } from "@/lib/domain/dates";
import { buildSearchKeywords } from "@/lib/domain/slug";
import { route, Errors } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { notifyAdmins } from "@/lib/server/notify";
import type { Hackathon } from "@/types";

const ALLOWED_KEYS = new Set([
  "name",
  "tagline",
  "summary",
  "description",
  "rules",
  "category",
  "themes",
  "technologies",
  "difficulty",
  "mode",
  "visibility",
  "inviteCode",
  "coverImage",
  "logoImage",
  "bannerImages",
  "contactEmail",
  "supportChannel",
  "studentsOnly",
  "minAge",
  "eligibleCountries",
  "emailDomainRestrictions",
  "requiresApproval",
  "faq",
  "country",
  "city",
  "venueName",
  "venueAddress",
  "onlinePlatform",
  "eventTimezone",
  "publicationDate",
  "registrationOpenDate",
  "registrationCloseDate",
  "startDate",
  "endDate",
  "teamFormationDeadline",
  "submissionOpenDate",
  "submissionCloseDate",
  "judgingStartDate",
  "judgingEndDate",
  "resultsAnnouncementDate",
  "stages",
  "schedule",
  "allowSolo",
  "requiresTeam",
  "allowsIndividuals",
  "minTeamSize",
  "maxTeamSize",
  "registrationCapacity",
  "hasWaitlist",
  "registrationMode",
  "publicTeamDiscovery",
  "registrationQuestions",
  "tracks",
  "prizes",
  "totalPrizeInPaise",
  "sponsors",
  "judgingCriteria",
  "allowMultipleTracks",
  "allowMultipleProjects",
  "hasPublicVoting",
  "isBlindJudging",
  "completedSteps",
  "completionPercentage",
]);

const SENSITIVE_KEYS = new Set([
  "name",
  "summary",
  "description",
  "rules",
  "mode",
  "visibility",
  "studentsOnly",
  "eligibleCountries",
  "emailDomainRestrictions",
  "registrationOpenDate",
  "registrationCloseDate",
  "startDate",
  "endDate",
  "submissionOpenDate",
  "submissionCloseDate",
  "prizes",
]);

const DATE_KEYS = new Set([
  "publicationDate",
  "registrationOpenDate",
  "registrationCloseDate",
  "startDate",
  "endDate",
  "teamFormationDeadline",
  "submissionOpenDate",
  "submissionCloseDate",
  "judgingStartDate",
  "judgingEndDate",
  "resultsAnnouncementDate",
]);

function coerceDateField(val: unknown): Timestamp | null | undefined {
  if (val === undefined) return undefined;
  if (val === null || val === "") return null;
  const d = toDate(val as never);
  return d ? Timestamp.fromDate(d) : null;
}

const Body = z.object({
  patch: z.record(z.unknown()),
});

export const POST = route<z.infer<typeof Body>, { id: string }>(
  { auth: "required", body: Body, rateLimit: { limit: 40, windowSec: 60, name: "hackathon-edit" } },
  async ({ user, body, params, req }) => {
    const db = adminDb();
    const hRef = db.collection(COLLECTIONS.HACKATHONS).doc(params.id);
    const hSnap = await hRef.get();
    if (!hSnap.exists) throw Errors.notFound("Hackathon not found.");
    const h = hSnap.data() as Hackathon;

    const owns = h.organizerId === user!.uid || (h.coOrganizerIds ?? []).includes(user!.uid) || isAdminRole(user!.role);
    if (!owns) throw Errors.forbidden();

    const currentlyLive = isLive(h.status);
    if (!currentlyLive && !EDITABLE_STATUSES.includes(h.status)) {
      throw Errors.conflict(`Hackathon cannot be edited while status is "${h.status}".`);
    }

    const update: Record<string, unknown> = {};
    let sensitiveChanged = false;

    for (const [k, rawVal] of Object.entries(body.patch)) {
      if (!ALLOWED_KEYS.has(k)) continue;
      let val = rawVal;

      if (DATE_KEYS.has(k)) {
        val = coerceDateField(rawVal);
        if (val === undefined) continue;
      } else if (k === "schedule" && Array.isArray(rawVal)) {
        val = rawVal.map((item) => {
          const obj = item as Record<string, unknown>;
          return {
            ...obj,
            ...(obj.startTime ? { startTime: coerceDateField(obj.startTime) ?? obj.startTime } : {}),
            ...(obj.endTime ? { endTime: coerceDateField(obj.endTime) ?? obj.endTime } : {}),
          };
        });
      } else if (k === "stages" && Array.isArray(rawVal)) {
        val = rawVal.map((item) => {
          const obj = item as Record<string, unknown>;
          return {
            ...obj,
            ...(obj.startDate ? { startDate: coerceDateField(obj.startDate) ?? obj.startDate } : {}),
            ...(obj.endDate ? { endDate: coerceDateField(obj.endDate) ?? obj.endDate } : {}),
          };
        });
      }

      update[k] = val;
      if (SENSITIVE_KEYS.has(k) && JSON.stringify(val) !== JSON.stringify((h as unknown as Record<string, unknown>)[k])) {
        sensitiveChanged = true;
      }
    }

    if (Object.keys(update).length === 0) return { ok: true, requiresReview: false };

    const mergedName = (update.name as string | undefined) ?? h.name;
    const mergedTagline = (update.tagline as string | undefined) ?? h.tagline;
    const mergedCat = (update.category as string | undefined) ?? h.category;
    const mergedCity = (update.city as string | undefined) ?? h.city;
    const mergedThemes = (update.themes as string[] | undefined) ?? h.themes;
    const mergedTech = (update.technologies as string[] | undefined) ?? h.technologies;
    update.searchKeywords = buildSearchKeywords(mergedName, mergedTagline, mergedCat, mergedCity, mergedThemes, mergedTech);
    update.updatedAt = FieldValue.serverTimestamp();

    const requiresReview = currentlyLive && sensitiveChanged && !isAdminRole(user!.role);

    if (requiresReview) {
      update.status = "pending_review";
      update.isListed = false;
      update.review = {
        submittedAt: FieldValue.serverTimestamp(),
        message: "Re-submitted for review after editing live hackathon dates, rules, or prize terms.",
      };
    }

    await hRef.update(update);

    if (requiresReview) {
      const tiers = await db.collection(COLLECTIONS.TICKET_TIERS).where("hackathonId", "==", params.id).get();
      const batch = db.batch();
      tiers.docs.forEach((t) => batch.update(t.ref, { isPublic: false }));
      if (!tiers.empty) await batch.commit();

      await notifyAdmins({
        type: "system",
        title: `Re-review requested: ${mergedName}`,
        message: "Organizer updated sensitive details on a live hackathon.",
        linkUrl: `/admin/reviews/${params.id}`,
        hackathonId: params.id,
      });
    }

    await audit({
      actorId: user!.uid,
      action: requiresReview ? "hackathon.sensitive_edit_requeued" : "hackathon.live_minor_edit",
      resource: "hackathons",
      resourceId: params.id,
      metadata: { keys: Object.keys(update) },
      req,
    });

    return { ok: true, requiresReview };
  }
);
