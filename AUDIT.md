# HACKSYRA — Repository Audit

_Audited commit: `bd55abd` ("Initial commit: HACKSYRA platform"), 107 tracked files._

This audit checks the claims in the master build prompt against the code. Each item is marked **Confirmed**, **Corrected** (the claim was slightly off) or **New** (found during this audit).

---

## 1. Stack & config

| Item | Finding | Status |
|---|---|---|
| Framework | Next.js `^15.0.3` (App Router), React `^19`, TS `^5.9`, Tailwind 3, Framer Motion 11, TanStack Query 5, RHF + zod, Recharts | Confirmed |
| `next-auth` v5 beta | Installed, **never imported**. `.env.example` / `.env.local` still have `NEXTAUTH_*` | Confirmed |
| `@types/react` / `@types/react-dom` | v18 while React is 19 | Confirmed |
| `vitest` | `npm test` → `vitest run`, but vitest is **not installed**; there are 0 tests | Confirmed |
| `prettier` | `npm run format` uses prettier, **not installed** | New |
| ESLint | `npm run lint` → `next lint`, but there is **no eslint / eslint-config-next and no config** | New |
| `node_modules` | Not present in the checkout (fresh clone); `npm install` needed | New |
| `next.config.js` | Allows remote images from Unsplash / ui-avatars (used by mock data) | New |
| BOM characters | 12 stub pages start with a UTF-8 BOM (6 dashboard + 6 public) | Confirmed |
| Encoding | Source files are valid UTF-8 (the `â€”` seen in PowerShell is a console display issue, not file corruption) | Corrected |
| `.env.local` | Every Firebase / Razorpay / Resend value is a **placeholder**. No real credentials exist locally | New |

## 2. Firebase layer

- **`src/lib/firebase/client.ts`** — silently falls back to a dummy config (`AIzaSyDummyKey…`, `hacksyra-prod`) and returns `{}` cast as `Auth`/`Firestore` if init fails. Every consumer then has to check `typeof db.type === "string"`. **Confirmed.**
- **`src/lib/firebase/admin.ts`** — calls `cert()` at import time; it **throws during import/build** when env vars are missing. Nothing imports it yet, so it hasn't crashed so far. **Confirmed.**
- **`src/lib/firebase/collections.ts`** — 51 collection names, well thought out. **Confirmed.**
- **`src/types/index.ts`** (843 lines) — a complete domain model: users, profiles, orgs, hackathons (with full date set, eligibility, team config, wizard `completionPercentage`/`completedSteps`), tracks, prizes, schedule, registrations with status history, teams, projects, submissions, judging criteria/evaluations, ticket tiers, orders, payments, tickets (`qrSecret`), coupons, certificates, notifications, achievements, audit logs, plans, filters. **Confirmed.** Missing: `PlatformSettings`, `Invoice`, `WebhookEvent`, `Announcement`, `DiscussionThread`, `TeamMessage`, `Bookmark`, `Follow`, `RegistrationQuestion`, `Sponsor`, `Stage/Round` — will be added.
- **No** `firestore.rules`, `storage.rules`, `firestore.indexes.json`, `firebase.json`. **Confirmed.**

## 3. Auth

| File | Finding | Status |
|---|---|---|
| `(auth)/login/page.tsx` | `handleSubmit` `catch` → `router.push("/organizer" \| "/dashboard")` (comment: "Local fallback for smooth testing"). `handleOAuth` same. **A wrong password logs you in.** | Confirmed |
| `(auth)/login/page.tsx` | Default mode is `"otp"`; in OTP mode **no auth call happens at all**, it just navigates | Confirmed |
| `(auth)/login/page.tsx` | LinkedIn / Microsoft buttons fall through to the GitHub provider | New |
| `(auth)/login/page.tsx` | Copy is an Unstop clone: "Candidate / Employer", "Jobs", "Join Unstop to find your dream job", yellow `#FFC200` panel, navy `#1C4980` — **not** the IH `#1565D8` brand | Confirmed |
| `(auth)/signup/page.tsx` | Same catch-and-navigate bypass ("Fallback for demo"); never writes `users/{uid}` or `userProfiles/{uid}`; no username | Confirmed |
| `(auth)/layout.tsx` | Floating-avatar constellation uses 10 remote Unsplash photos via raw `<img>` | Confirmed |
| `AuthProvider.tsx` | Reads `users/{uid}` once with `getDoc` (not live). No ID token / session cookie, no claims | New |
| `onboarding/page.tsx` | Calls `updateDoc` on `users/{uid}`, which **fails** because signup never creates that doc | New |
| Dashboard / organizer layouts | Show a spinner while `loading`, but **never redirect** unauthenticated users | New |
| `middleware.ts` | Does not exist | Confirmed |
| Roles | `UserRole` includes `admin`/`super_admin`; nothing reads roles or custom claims | Confirmed |

## 4. Fake flows (`setTimeout` / prefilled data)

`setTimeout` in `src` — 11 hits:

| Location | Kind |
|---|---|
| `organizer/create/page.tsx:98` | **Fake publish** — nothing saved. State prefilled with "GenAI Global Odyssey 2026", 3 tracks, prizes, rubric, "Bengaluru" |
| `hackathons/[slug]/register/page.tsx:31` | **Fake registration** — prefilled "Aarav Sharma / aarav.sharma@gmail.com / IIT Bombay / NeuralSynthetix", default slug `india-ai-2026` |
| `organizer/certificates/page.tsx:17` | **Fake "certificates sent"** |
| `organizer/settings/page.tsx:22` | Fake "saved"; hardcoded `rzp_live_84920491823` in state |
| `AiCopilotBanner.tsx:148` | Fake AI response (component is unused) |
| `HackathonDetail.tsx:90`, `teams/page.tsx:109`, `AiCopilotBanner.tsx:157`, `settings:22`, `certificates:21` | Legit "copied!"/toast resets |
| `DevpostNavbar.tsx:88`, `Toaster.tsx:61` | Legit UI timers |

## 5. Hardcoded data (every list)

Confirmed hardcoded arrays in: `(public)/page.tsx` (`HACKATHONS_FOR_YOU`, `DEFAULT_ORGANIZATIONS`, project gallery), `HackathonsDiscovery.tsx`, `hackathons/[slug]/page.tsx` (`DEMO_EVENTS` keyed by slug), `HackathonDetail.tsx`, `FeaturedHackathons.tsx`, `FeaturedOrganizers.tsx`, `WinnersShowcase.tsx`, `TestimonialsSection.tsx` ("Sample testimonials for demonstration"), `leaderboard`, `projects`, all `dashboard/*` pages with content, all `organizer/*` pages, `LivePulseTicker`.

The **only** `onSnapshot` in the app: `collaborations` collection on the landing page (falls back to the hardcoded logos).

## 6. Stub pages

12 files with `🚧 Full implementation coming soon`: dashboard `payments`, `tickets`, `messages`, `notifications`, `saved`, `settings`; public `contact`, `help`, `pricing`, `privacy`, `terms`, `resources`. **Confirmed.**
Also: `builders` = `🚧 Coming in Phase 4`; `hackathons` = a thin wrapper around the hardcoded `HackathonsDiscovery`. **Confirmed.**

## 7. Backend

- `route.ts` files: **0**. Server actions: **0**. `middleware.ts`: **none**. Cron / functions: **none**. **Confirmed.**
- Payments: `razorpay` / `stripe` packages are not installed; they appear only in copy and type unions. **Confirmed.**
- Email: no Resend code. **Confirmed.**

## 8. Layout & UI consistency

- **Two navbars and two footers.** `(public)/layout.tsx` uses `DevpostNavbar` + `DevpostFooter`. `Navbar.tsx` (583 lines) and `Footer.tsx` are **unused**. `UnstopSidebar` / `UnstopTopBar` are layout pieces for the dashboard. **Confirmed.**
- **Unused home components.** Only `TeamFinderSection` (landing) and `LivePulseTicker` (navbar) are imported. `HeroSection`, `FeaturedHackathons`, `FeaturedOrganizers`, `WinnersShowcase`, `TestimonialsSection`, `HowItWorks`, `StatsSection`, `TrendingTech`, `BenefitsSection`, `FinalCTA`, `AiCopilotBanner` (~2,300 lines) are **dead code**; the landing page inlines its own versions. **New.**
- **Theme.** Tailwind remaps the old dark tokens (`midnight`, `violet`, `surface-*`) to white/blue, so `bg-midnight` pages render light. It works, but the names are misleading. Login/signup ignore the brand and use Unstop navy/yellow. **New.**
- `globals.css` defines several classes twice (`.badge-*`, `.prose-hacksyra`, `.btn-sm/.btn-lg`) — the later definition wins. **New.**
- Remote images (Unsplash, ui-avatars) everywhere in the mock data; no `next/image` in the constellation.

## 9. Security summary

1. Authentication bypass on login and signup (critical).
2. No server-side authorization anywhere (no middleware, rules or API routes).
3. Without rules, Firestore is either locked or wide open depending on console defaults; nothing enforces `status` transitions.
4. A live-looking Razorpay key is hardcoded in client state.
5. Admin SDK init throws at import.

## 10. Baseline checks

Run on Node v24.12.0 after `npm install` (376 packages):

| Check | Result |
|---|---|
| `npm run type-check` | ✅ passes (0 errors) |
| `npm run build` | ✅ passes. All pages are static except `/hackathons/[slug]` and `/hackathons/[slug]/register` |
| `npm run lint` | ❌ not runnable: no ESLint installed or configured |
| `npm test` | ❌ not runnable: vitest not installed, no tests |
| Firebase emulators | Possible: Java 21 and `firebase-tools` 15.20 are available on this machine |

The build passes **because nothing talks to a backend**. A green build doesn't mean the features work.
