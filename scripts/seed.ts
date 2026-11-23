/**
 * Seeds local development data (emulators by default). Every seeded doc has `isSeed: true`.
 *   npm run seed            → emulators
 *   npm run seed -- --prod  → real project (asks nothing; use with care)
 * Creates: platformSettings/main, stats/platform, a demo organizer + participant + admin
 * (emulator only), and a handful of realistic listed hackathons across lifecycle stages.
 */
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { initAdmin, useEmulators } from "./_admin";

const DAY = 86_400_000;
const HOUR = 3_600_000;
const ts = (ms: number) => Timestamp.fromMillis(ms);

function keywords(...parts: (string | string[])[]) {
  const set = new Set<string>();
  for (const p of parts.flat()) for (const w of p.toLowerCase().split(/[^a-z0-9+#.]+/)) {
    if (w.length < 2) continue;
    set.add(w);
    for (let i = 2; i < Math.min(w.length, 10); i++) set.add(w.slice(0, i));
  }
  return [...set].slice(0, 200);
}

async function ensureUser(auth: ReturnType<typeof initAdmin>["auth"], email: string, password: string, displayName: string, role: string) {
  let u = await auth.getUserByEmail(email).catch(() => null);
  if (!u) u = await auth.createUser({ email, password, displayName, emailVerified: true });
  await auth.setCustomUserClaims(u.uid, { role });
  return u;
}

async function main() {
  if (!useEmulators && !process.argv.includes("--prod")) {
    console.error("✖ Refusing to seed a real project. Set NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true or pass --prod.");
    process.exit(1);
  }
  const { auth, db } = initAdmin();
  const now = Date.now();
  const server = FieldValue.serverTimestamp();

  // ── platform ──
  await db.doc("platformSettings/main").set(
    {
      listingFeeInPaise: 300,
      listingFeeCurrency: "INR",
      categories: [
        { id: "ai_ml", label: "AI / ML" }, { id: "web3", label: "Web3" }, { id: "fintech", label: "FinTech" },
        { id: "healthtech", label: "HealthTech" }, { id: "edtech", label: "EdTech" }, { id: "sustainability", label: "Sustainability" },
        { id: "social_impact", label: "Social impact" }, { id: "developer_tools", label: "Developer tools" }, { id: "gaming", label: "Gaming" },
        { id: "iot", label: "IoT" }, { id: "cybersecurity", label: "Cybersecurity" }, { id: "open_innovation", label: "Open innovation" },
        { id: "other", label: "Other" },
      ],
      featureFlags: { publicVoting: true, mentorSessions: true },
      supportEmail: "support@innovationhacks.in",
      updatedAt: server,
    },
    { merge: true }
  );

  // ── users (emulator only — never create accounts in a real project) ──
  let organizerId = "seed-organizer";
  const organizerName = "Innovation Hacks";
  if (useEmulators) {
    const org = await ensureUser(auth, "organizer@hacksyra.test", "Password123!", "Innovation Hacks", "organizer");
    const part = await ensureUser(auth, "participant@hacksyra.test", "Password123!", "Demo Participant", "participant");
    const admin = await ensureUser(auth, "admin@hacksyra.test", "Password123!", "Platform Admin", "super_admin");
    organizerId = org.uid;
    for (const [u, role, username] of [[org, "organizer", "innovationhacks"], [part, "participant", "demoparticipant"], [admin, "super_admin", "platformadmin"]] as const) {
      await db.doc(`users/${u.uid}`).set({
        uid: u.uid, email: u.email, displayName: u.displayName, username, emailVerified: true,
        roles: Array.from(new Set(["participant", role])), skills: [], interests: [], languages: [], portfolioLinks: [],
        onboardingComplete: true, isActive: true, isBanned: false, lookingForTeam: false, followersCount: 0, followingCount: 0,
        hackathonsJoined: 0, projectsPublished: 0, notificationPrefs: { email: true, reminders: true, marketing: false },
        isSeed: true, createdAt: server, updatedAt: server,
      }, { merge: true });
      await db.doc(`userProfiles/${u.uid}`).set({
        uid: u.uid, username, displayName: u.displayName, skills: [], technologies: [], interests: [], socialLinks: [],
        featuredProjects: [], hackathonsJoined: 0, projectsPublished: 0, achievements: [],
        visibility: { email: "private", country: "public", college: "public", skills: "public" },
        isPublic: true, lookingForTeam: false, isSeed: true, updatedAt: server,
      }, { merge: true });
      await db.doc(`usernames/${username}`).set({ uid: u.uid, createdAt: server });
    }
    console.log("✔ Users: organizer@hacksyra.test / participant@hacksyra.test / admin@hacksyra.test (password: Password123!)");
  }

  // ── hackathons ──
  type Seed = { slug: string; name: string; tagline: string; category: string; mode: "online" | "offline" | "hybrid"; city?: string;
    offsetStartDays: number; durationHours: number; prize: number; isFree: boolean; price?: number; techs: string[]; featured?: boolean; difficulty: string };
  const seeds: Seed[] = [
    { slug: "india-ai-buildathon-2026", name: "India AI Buildathon 2026", tagline: "Ship an AI product that solves a real Indian problem in 48 hours.", category: "ai_ml", mode: "online", offsetStartDays: 12, durationHours: 48, prize: 300000, isFree: true, techs: ["Python", "LLMs", "LangChain", "Next.js"], featured: true, difficulty: "intermediate" },
    { slug: "greenstack-climate-hack", name: "GreenStack Climate Hack", tagline: "Build tools that cut emissions, waste and water use.", category: "sustainability", mode: "hybrid", city: "Bengaluru", offsetStartDays: 20, durationHours: 36, prize: 150000, isFree: false, price: 9900, techs: ["IoT", "React", "Data"], featured: true, difficulty: "open" },
    { slug: "fintech-sprint-chennai", name: "FinTech Sprint Chennai", tagline: "Reimagine payments, lending and savings for Bharat.", category: "fintech", mode: "offline", city: "Chennai", offsetStartDays: -0.5, durationHours: 36, prize: 200000, isFree: true, techs: ["Node.js", "UPI", "Flutter"], difficulty: "intermediate" },
    { slug: "campus-code-jam", name: "Campus Code Jam", tagline: "A beginner-friendly weekend jam for first-time hackers.", category: "open_innovation", mode: "online", offsetStartDays: 4, durationHours: 24, prize: 25000, isFree: true, techs: ["HTML", "JavaScript", "Python"], difficulty: "beginner" },
    { slug: "secure-the-stack-ctf", name: "Secure the Stack", tagline: "Defensive security challenges + build-a-tool track.", category: "cybersecurity", mode: "online", offsetStartDays: 35, durationHours: 72, prize: 120000, isFree: false, price: 4900, techs: ["Rust", "Go", "Security"], difficulty: "advanced" },
  ];

  for (const s of seeds) {
    const start = now + s.offsetStartDays * DAY;
    const end = start + s.durationHours * HOUR;
    const regOpen = Math.min(now - 2 * DAY, start - 20 * DAY);
    const regClose = start - 1 * HOUR;
    const status = now >= end ? "judging" : now >= start ? "ongoing" : now >= regClose ? "registration_closed" : now >= regOpen ? "registration_open" : "published";
    const ref = db.collection("hackathons").doc(`seed-${s.slug}`);
    await ref.set({
      id: ref.id, name: s.name, slug: s.slug, tagline: s.tagline,
      summary: s.tagline,
      description: `## About\n${s.name} brings builders together to ${s.tagline.toLowerCase()}\n\n## What to build\nAnything that fits the theme — web, mobile, hardware or data.\n\n## Who can join\nStudents and professionals, solo or in teams.`,
      rules: "1. All code must be written during the hackathon.\n2. Teams of up to 4.\n3. Be respectful — our code of conduct applies.",
      category: s.category, themes: [], technologies: s.techs, difficulty: s.difficulty, mode: s.mode,
      status, visibility: "public", isListed: true, isSeed: true,
      organizerId, organizerType: "user", organizerName, coOrganizerIds: [], contactEmail: "hello@innovationhacks.in",
      bannerImages: [], country: s.city ? "India" : undefined, city: s.city, venueName: s.city ? `${s.city} Innovation Hub` : undefined,
      onlinePlatform: s.mode === "online" ? "Discord + HACKSYRA" : undefined,
      registrationOpenDate: ts(regOpen), registrationCloseDate: ts(regClose), startDate: ts(start), endDate: ts(end),
      submissionOpenDate: ts(start), submissionCloseDate: ts(end), judgingStartDate: ts(end), judgingEndDate: ts(end + 3 * DAY),
      resultsAnnouncementDate: ts(end + 4 * DAY), certificateReleaseDate: ts(end + 5 * DAY), eventTimezone: "Asia/Kolkata",
      isPublic: true, allowsIndividuals: true, requiresTeam: false, studentsOnly: false, requiresApproval: false,
      minTeamSize: 1, maxTeamSize: 4, allowSolo: true, publicTeamDiscovery: true,
      registrationCapacity: 500, hasWaitlist: true, registrationMode: "open",
      isFree: s.isFree, currency: "INR", lowestTicketPriceInPaise: s.isFree ? 0 : s.price,
      allowMultipleTracks: false, allowMultipleProjects: false, hasPublicVoting: true, isBlindJudging: false,
      registrationCount: 0, teamCount: 0, submissionCount: 0, viewCount: 0,
      isFeatured: !!s.featured, isStaffPick: !!s.featured,
      tracks: [{ id: "t1", name: "Main track", description: "Build anything on theme." }, { id: "t2", name: "Best beginner project", description: "For first-time hackers." }],
      prizes: [
        { id: "p1", name: "Winner", rank: 1, type: "cash", cashAmount: Math.round(s.prize * 0.5), currency: "INR", winnersCount: 1 },
        { id: "p2", name: "Runner-up", rank: 2, type: "cash", cashAmount: Math.round(s.prize * 0.3), currency: "INR", winnersCount: 1 },
        { id: "p3", name: "Best beginner project", type: "cash", cashAmount: Math.round(s.prize * 0.2), currency: "INR", trackId: "t2", winnersCount: 1 },
      ],
      totalPrizeInPaise: s.prize * 100,
      sponsors: [], faq: [{ id: "f1", question: "Is it free?", answer: s.isFree ? "Yes, completely free." : "There is a small ticket fee." }],
      schedule: [
        { id: "s1", title: "Opening ceremony", type: "ceremony", startTime: ts(start) },
        { id: "s2", title: "Submissions close", type: "judging", startTime: ts(end) },
      ],
      judgingCriteria: [
        { id: "c1", name: "Impact", description: "How useful is it?", weight: 40, maxScore: 10 },
        { id: "c2", name: "Technical depth", description: "Quality of engineering", weight: 35, maxScore: 10 },
        { id: "c3", name: "Presentation", description: "Clarity of the demo", weight: 25, maxScore: 10 },
      ],
      registrationQuestions: [], stages: [],
      listingFee: { amountInPaise: 300, paid: true, provider: "dev" },
      completionPercentage: 100, completedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      searchKeywords: keywords(s.name, s.tagline, s.techs, s.city ?? "", s.category),
      createdAt: ts(now - 10 * DAY), updatedAt: server, approvedAt: ts(now - 9 * DAY), approvedBy: "seed",
    });
    await db.doc(`slugs/${s.slug}`).set({ hackathonId: ref.id, isSeed: true });
    if (!s.isFree) {
      await db.doc(`ticketTiers/seed-${s.slug}-standard`).set({
        id: `seed-${s.slug}-standard`, hackathonId: ref.id, organizerId, name: "Standard", type: "standard", price: s.price,
        currency: "INR", capacity: 300, sold: 0, reserved: 0, perPersonLimit: 1, isActive: true, isPublic: true, order: 0,
        isSeed: true, createdAt: server, updatedAt: server,
      });
    }
  }

  const live = seeds.length;
  await db.doc("stats/platform").set(
    {
      liveHackathons: live, totalHackathons: live,
      totalPrizePoolInPaise: seeds.reduce((s, x) => s + x.prize * 100, 0),
      users: FieldValue.increment(0), totalRegistrations: FieldValue.increment(0), totalProjects: FieldValue.increment(0),
      listingFeeRevenueInPaise: FieldValue.increment(0), updatedAt: server,
    },
    { merge: true }
  );
  console.log(`✔ Seeded ${seeds.length} hackathons (isSeed: true)`);
}

main().then(() => process.exit(0), (e) => {
  console.error(e);
  process.exit(1);
});
