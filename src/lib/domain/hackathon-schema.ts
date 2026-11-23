import { z } from "zod";
import { SLUG_RE, RESERVED_SLUGS } from "./slug";
import { validateTimeline } from "./timeline";
import { validateRubric } from "./rubric";

export const CATEGORIES = [
  "ai_ml",
  "web3",
  "fintech",
  "healthtech",
  "edtech",
  "sustainability",
  "social_impact",
  "developer_tools",
  "gaming",
  "iot",
  "cybersecurity",
  "open_innovation",
  "other",
] as const;

export const step1Schema = z.object({
  name: z.string().trim().min(3, "Event name must be at least 3 characters.").max(120),
  slug: z
    .string()
    .trim()
    .regex(SLUG_RE, "Slug must be 3–60 lowercase letters, numbers, or hyphens.")
    .refine((s) => !RESERVED_SLUGS.has(s), "This URL slug is reserved."),
  tagline: z.string().trim().min(6, "Add a concise tagline (6+ chars).").max(160),
  category: z.enum(CATEGORIES),
  themes: z.array(z.string().trim().min(1)).max(10).default([]),
  technologies: z.array(z.string().trim().min(1)).max(15).default([]),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "open"]),
  mode: z.enum(["online", "offline", "hybrid"]),
  visibility: z.enum(["public", "unlisted", "private", "invite_only"]),
  inviteCode: z.string().trim().max(40).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  logoImage: z.string().url().optional().or(z.literal("")),
  bannerImages: z.array(z.string().url()).max(5).default([]),
});

export const faqSchema = z.object({
  id: z.string(),
  question: z.string().trim().min(3, "FAQ question needed"),
  answer: z.string().trim().min(3, "FAQ answer needed"),
});

export const step2Schema = z.object({
  summary: z.string().trim().min(20, "Summary must be at least 20 characters.").max(500),
  description: z.string().trim().min(40, "Description must be at least 40 characters.").max(20000),
  rules: z.string().trim().min(10, "Include rules or a code of conduct.").max(15000),
  contactEmail: z.string().trim().email("Enter a valid contact email."),
  supportChannel: z.string().trim().max(200).optional(),
  studentsOnly: z.boolean().default(false),
  minAge: z.number().int().min(13).max(99).optional().nullable(),
  eligibleCountries: z.array(z.string()).default([]),
  emailDomainRestrictions: z.array(z.string()).default([]),
  requiresApproval: z.boolean().default(false),
  faq: z.array(faqSchema).default([]),
});

export const step3Schema = z
  .object({
    mode: z.enum(["online", "offline", "hybrid"]),
    country: z.string().trim().optional(),
    city: z.string().trim().optional(),
    venueName: z.string().trim().optional(),
    venueAddress: z.string().trim().optional(),
    onlinePlatform: z.string().trim().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.mode === "offline" || d.mode === "hybrid") {
      if (!d.city?.trim()) ctx.addIssue({ code: "custom", path: ["city"], message: "City is required for offline/hybrid events." });
      if (!d.venueName?.trim()) ctx.addIssue({ code: "custom", path: ["venueName"], message: "Venue name is required for offline/hybrid events." });
    }
    if (d.mode === "online" || d.mode === "hybrid") {
      if (!d.onlinePlatform?.trim()) {
        ctx.addIssue({ code: "custom", path: ["onlinePlatform"], message: "Specify the online platform or Discord/Meet link." });
      }
    }
  });

export const step5Schema = z
  .object({
    allowSolo: z.boolean(),
    minTeamSize: z.number().int().min(1).max(20),
    maxTeamSize: z.number().int().min(1).max(20),
    registrationCapacity: z.number().int().min(1).max(500000).optional().nullable(),
    hasWaitlist: z.boolean(),
    registrationMode: z.enum(["open", "application", "invite_only"]),
    publicTeamDiscovery: z.boolean().default(true),
    registrationQuestions: z
      .array(
        z.object({
          id: z.string(),
          label: z.string().trim().min(2, "Question label is required"),
          type: z.enum(["text", "textarea", "select", "file", "url"]),
          options: z.array(z.string()).optional(),
          required: z.boolean(),
        })
      )
      .default([]),
  })
  .refine((d) => d.minTeamSize <= d.maxTeamSize, {
    path: ["maxTeamSize"],
    message: "Max team size must be ≥ min team size.",
  });

export const step6Schema = z.object({
  tracks: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().trim().min(2, "Track name required"),
        description: z.string().trim().min(3, "Track description required"),
        sponsorName: z.string().optional(),
      })
    )
    .min(1, "Add at least one track."),
  prizes: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().trim().min(2, "Prize name required"),
        rank: z.number().int().positive().optional().nullable(),
        type: z.enum(["cash", "non_cash"]),
        cashAmount: z.number().min(0).optional().nullable(),
        currency: z.string().default("INR"),
        description: z.string().optional(),
        sponsorName: z.string().optional(),
        trackId: z.string().optional(),
        winnersCount: z.number().int().min(1).default(1),
      })
    )
    .min(1, "Add at least one prize."),
  sponsors: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1),
        tier: z.enum(["title", "platinum", "gold", "silver", "community", "partner"]),
        logoUrl: z.string().optional(),
        website: z.string().optional(),
      })
    )
    .default([]),
});

export const step7Schema = z.object({
  judgingCriteria: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().trim().min(2),
        description: z.string().default(""),
        weight: z.number().int().min(1).max(100),
        maxScore: z.number().int().min(1).max(100),
      })
    )
    .superRefine((criteria, ctx) => {
      for (const msg of validateRubric(criteria)) {
        ctx.addIssue({ code: "custom", message: msg });
      }
    }),
  isBlindJudging: z.boolean().default(false),
  hasPublicVoting: z.boolean().default(false),
  judgeInvites: z
    .array(
      z.object({
        email: z.string().trim().email("Invalid judge email"),
        name: z.string().optional(),
        status: z.enum(["invited", "accepted", "declined"]).default("invited"),
      })
    )
    .default([]),
});

export const step8Schema = z
  .object({
    isFree: z.boolean(),
    currency: z.string().default("INR"),
    tiers: z
      .array(
        z.object({
          id: z.string(),
          name: z.string().trim().min(2, "Tier name required"),
          description: z.string().optional(),
          type: z.enum(["free", "early_bird", "standard", "student", "team", "premium", "vip", "sponsor", "workshop", "custom"]),
          price: z.number().int().min(0), // paise
          capacity: z.number().int().min(1).optional().nullable(),
          perPersonLimit: z.number().int().min(1).max(10).default(1),
          saleStartDate: z.string().optional(),
          saleEndDate: z.string().optional(),
        })
      )
      .default([]),
    coupons: z
      .array(
        z.object({
          id: z.string(),
          code: z.string().trim().min(3).max(32),
          type: z.enum(["percentage", "fixed"]),
          value: z.number().int().positive(),
          usageLimit: z.number().int().positive().optional().nullable(),
          validUntil: z.string().optional(),
        })
      )
      .default([]),
  })
  .superRefine((d, ctx) => {
    if (!d.isFree && d.tiers.length === 0) {
      ctx.addIssue({ code: "custom", path: ["tiers"], message: "Paid hackathons need at least one ticket tier." });
    }
    if (!d.isFree && d.tiers.some((t) => t.price > 0 && t.price < 100)) {
      ctx.addIssue({ code: "custom", path: ["tiers"], message: "Paid ticket tiers must be at least ₹1 (100 paise) or ₹0." });
    }
  });

export type StepIssueMap = { step: number; title: string; errors: string[] };

const STEP_TITLES = [
  "",
  "Basics",
  "Details & Rules",
  "Location",
  "Dates & Timeline",
  "Teams & Registration",
  "Tracks & Prizes",
  "Judging",
  "Pricing",
];

/** Runs complete validation across steps 1–8 for both the Step 9 review checklist and server /submit. */
export function validateAllWizardSteps(
  doc: Record<string, unknown>,
  opts: { requireFutureDates?: boolean; now?: number } = {}
): StepIssueMap[] {
  const out: StepIssueMap[] = [];
  const check = (step: number, schema: z.ZodTypeAny, payload: unknown) => {
    const r = schema.safeParse(payload);
    if (!r.success) {
      out.push({ step, title: STEP_TITLES[step], errors: r.error.issues.map((i) => i.message) });
    }
  };

  check(1, step1Schema, doc);
  check(2, step2Schema, doc);
  check(3, step3Schema, doc);

  const tlIssues = validateTimeline(doc as Record<string, unknown>, {
    requireFuture: opts.requireFutureDates,
    now: opts.now,
  });
  if (!doc.eventTimezone || typeof doc.eventTimezone !== "string") {
    tlIssues.unshift({ field: "startDate", message: "Event timezone is required." });
  }
  if (tlIssues.length) {
    out.push({ step: 4, title: STEP_TITLES[4], errors: tlIssues.map((i) => i.message) });
  }

  check(5, step5Schema, doc);
  check(6, step6Schema, doc);
  check(7, step7Schema, doc);

  const pricing = (doc.pricingDraft as Record<string, unknown>) ?? {
    isFree: doc.isFree ?? true,
    currency: doc.currency ?? "INR",
    tiers: [],
    coupons: [],
  };
  check(8, step8Schema, pricing);

  return out;
}

