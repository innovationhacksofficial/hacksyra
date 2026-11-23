import { nanoid } from "nanoid";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { ensureOrganizerRole } from "@/lib/server/users";
import { audit } from "@/lib/server/audit";
import { route } from "@/lib/server/api";

/** POST /api/hackathons/draft — creates an empty draft hackathon and grants organizer role. */
export const POST = route(
  { auth: "required", rateLimit: { limit: 15, windowSec: 60, name: "draft-create" } },
  async ({ user, req }) => {
    const db = adminDb();
    const id = `hack_${nanoid(12)}`;
    const now = FieldValue.serverTimestamp();

    const uSnap = await db.collection(COLLECTIONS.USERS).doc(user!.uid).get();
    const u = uSnap.data() as { displayName?: string; photoURL?: string; email?: string } | undefined;

    await db.collection(COLLECTIONS.HACKATHONS).doc(id).set({
      id,
      name: "",
      slug: "",
      tagline: "",
      summary: "",
      description: "",
      rules: "",
      category: "ai_ml",
      themes: [],
      technologies: [],
      difficulty: "open",
      mode: "online",
      status: "draft",
      visibility: "public",
      organizerId: user!.uid,
      organizerType: "user",
      organizerName: u?.displayName || user!.name || "Organizer",
      organizerPhotoURL: u?.photoURL ?? null,
      coOrganizerIds: [],
      contactEmail: u?.email || user!.email || "",
      bannerImages: [],
      eventTimezone: "Asia/Kolkata",
      isPublic: true,
      allowsIndividuals: true,
      requiresTeam: false,
      studentsOnly: false,
      requiresApproval: false,
      minTeamSize: 1,
      maxTeamSize: 4,
      allowSolo: true,
      publicTeamDiscovery: true,
      hasWaitlist: true,
      registrationMode: "open",
      isFree: true,
      currency: "INR",
      allowMultipleTracks: false,
      allowMultipleProjects: false,
      hasPublicVoting: false,
      isBlindJudging: false,
      registrationCount: 0,
      teamCount: 0,
      submissionCount: 0,
      viewCount: 0,
      isFeatured: false,
      isStaffPick: false,
      isListed: false,
      completionPercentage: 0,
      completedSteps: [],
      tracks: [],
      prizes: [],
      sponsors: [],
      faq: [],
      schedule: [],
      judgingCriteria: [
        { id: "c1", name: "Impact & Usefulness", description: "How well does it solve a real problem?", weight: 40, maxScore: 10 },
        { id: "c2", name: "Technical Execution", description: "Engineering depth and polish", weight: 35, maxScore: 10 },
        { id: "c3", name: "Innovation & Demo", description: "Originality and clarity of presentation", weight: 25, maxScore: 10 },
      ],
      judgeInvites: [],
      registrationQuestions: [],
      stages: [],
      pricingDraft: { isFree: true, currency: "INR", tiers: [], coupons: [] },
      createdAt: now,
      updatedAt: now,
    });

    await ensureOrganizerRole(user!.uid);
    await audit({ actorId: user!.uid, actorEmail: user!.email, action: "hackathon.draft_created", resource: "hackathons", resourceId: id, req });
    return { id };
  }
);

