# HACKSYRA — Build Plan

Companion to [AUDIT.md](./AUDIT.md). Phases are executed in order. Each phase ends with `npm run type-check && npm run lint && npm run build && npm test`, a browser check against the Firebase Emulator Suite, and one commit (`feat(phase-N): …`).

---

## 0. Key architecture decisions

Each of these will also be recorded in `DECISIONS.md`.

| # | Decision | Why |
|---|---|---|
| D1 | **Firebase Auth + session cookie** (`__session`, httpOnly, secure, sameSite=lax, 5 days). Created by `POST /api/auth/session` from an ID token via Admin `createSessionCookie`. Remove `next-auth`. | One auth system. The cookie lets middleware and server code trust the user. |
| D2 | **Middleware verifies the session cookie on the Edge with `jose`** against Google's public session-cookie certs (iss `https://session.firebase.google.com/<project>`, aud `<project>`), then reads the `role` claim. Server routes re-verify with Admin SDK `verifySessionCookie(…, checkRevoked=true)`. | `firebase-admin` can't run in Edge middleware. `jose` gives a real signature check, not just "a cookie exists". |
| D3 | **Roles via custom claims** `{ role }`. Values: `participant` (default), `organizer`, `judge`, `admin`, `super_admin`. Mirrored to `users/{uid}.roles` for display only. **Any signed-in user may host**; `organizer` is granted automatically when they create their first hackathon. | Matches "anyone can host". Rules trust claims, never the user doc. |
| D4 | **Privileged writes go only through Next route handlers using the Admin SDK**: payments, status changes, registrations, team join, submissions, judging, approvals. Clients write directly only for owner-scoped data: profile, hackathon **draft**, project drafts, bookmarks, team chat, notification `isRead`. | Rules stay simple and the server enforces business logic and deadlines. |
| D5 | **Public listing flag** `isListed: boolean` (+ `listedStatus`) on hackathons, set **only by the server** when approved and visibility is `public`. Public queries: `where("isListed","==",true)`. Rules: public read only if `isListed` (or unlisted/invite with the slug + server route), owner, or admin. | Gives one indexable field that both queries and rules agree on, so unapproved events can't leak. |
| D6 | **Hackathon sub-data embedded** in the hackathon doc: tracks, prizes, sponsors, FAQ, schedule, rubric criteria, registration questions, stages. **Separate collections** for anything with counters, secrets or high volume: `ticketTiers`, `coupons` (owner/admin-only reads), `registrations`, `teams`, `orders`, `payments`, … | The wizard autosaves atomically; docs stay well under 1 MB. Counters need transactions. |
| D7 | **Scheduler = Next route `GET /api/cron/tick`** (protected by `CRON_SECRET`), run every 10 min by **GitHub Actions** (`.github/workflows/cron.yml`, free) and optionally `vercel.json` crons (Vercel Pro). The server also **computes the effective status from dates on every write**, so deadlines hold even if cron is late. | No Firebase Blaze plan needed for Functions. Vercel Hobby crons only run daily, so GitHub Actions is the free 10-minute trigger. |
| D8 | **Razorpay only** (INR, test mode in dev). Stripe is removed from copy and the env template; the type union stays for later. All money goes to the **platform** Razorpay account; there are no per-organizer keys. Organizer payouts are tracked as a ledger (`payouts`) and settled manually or via RazorpayX later. | Consistent and honest. The prompt explicitly wants no per-organizer key. |
| D9 | **Realtime data layer**: `useLiveQuery` / `useLiveDoc` hooks wrap `onSnapshot` and push into the TanStack Query cache (keyed by query), so components get `{data, isLoading, error}` and share subscriptions. | One pattern for every list, with loading/empty/error states built in. |
| D10 | **Platform counters** in `stats/platform` (users, liveHackathons, totalRegistrations, totalPrizePoolInPaise, projects), updated with `FieldValue.increment` by server routes and cron. | Landing page stats with no collection scans. |
| D11 | **Local dev = Firebase Emulator Suite** (Auth, Firestore, Storage) via `firebase-tools` devDependency. Java 21 is already installed. `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true` connects client and admin to the emulators. Seed script targets the emulator by default. | `.env.local` has no real Firebase keys, so this is how every flow gets tested end to end without inventing credentials. |
| D12 | Libraries to add: `razorpay`, `resend`, `jose`, `qrcode`, `pdf-lib`, `react-markdown` + `remark-gfm` (safe, no raw HTML), `@upstash/ratelimit` + `@upstash/redis` (optional), `nanoid`, `vitest`, `@testing-library/react`, `jsdom`, `eslint` + `eslint-config-next`, `prettier`, `firebase-tools`, `tsx` (scripts), `@playwright/test` (smoke). Remove `next-auth`. Bump `@types/react{,-dom}` to 19. | — |
| D13 | **Keep the white + `#1565D8` system.** Clean `globals.css` duplicates; add proper `brand-*` names and keep the old `violet/midnight` aliases so existing pages don't break. Delete dead components (`Navbar`, `Footer`, unused `home/*`, `AiCopilotBanner`) once their replacements land. | Keep the existing design; less dead code. |

## 1. Firestore data model

Top-level collections; `★` = written only by the server (Admin SDK).

```
users/{uid}                    profile + settings (owner rw, roles field ★)
userProfiles/{uid}             public portfolio projection (public read if isPublic)
usernames/{username}           { uid } uniqueness lock ★
platformSettings/main          listingFeeInPaise (300), categories[], featureFlags{} (public read, admin write)
stats/platform                 counters ★ (public read)

hackathons/{id}                full Hackathon + embedded tracks/prizes/sponsors/faq/schedule/
                               criteria/registrationQuestions/stages; status ★ (except draft edits),
                               isListed ★, listingFee{orderId,paid} ★, review{…} ★
hackathons/{id}/announcements/{aid}   organizer posts (public read if listed)
hackathons/{id}/discussions/{tid}     Q&A threads, /replies/{rid}
hackathons/{id}/judges/{uid}          judge assignment + conflicts ★
slugs/{slug}                   { hackathonId } uniqueness lock ★

ticketTiers/{id}               hackathonId, price (paise), capacity, sold ★, reserved ★
coupons/{id}                   owner/admin read only; validated server-side
seatReservations/{id}          ★ hold with expiresAt (15 min)
registrations/{hackathonId_uid}  ★ deterministic id = no duplicates; statusHistory; answers
teams/{id}                     ★ create/join via API; captainId, memberIds, inviteCode
teams/{id}/messages/{mid}      team chat (members rw)
teamInvitations/{id}           ★
projects/{id}                  owner/team rw while draft; likesCount ★
projects/{id}/likes/{uid}, /comments/{cid}
submissions/{hackathonId_teamOrUid}  ★ status machine; snapshot on submit
submissionSnapshots/{id}       ★ immutable copy at submit time
evaluations/{submissionId_judgeId}  judge rw own until submitted; totals ★
winners/{id}                   ★
certificates/{serial}          ★ public read (verify page)
orders/{id}  payments/{id}  invoices/{id}  refunds/{id}   ★ (owner read)
webhookEvents/{razorpayEventId}  ★ idempotency ledger
tickets/{id}                   ★ owner read; qrSecret never sent to client
notifications/{id}             owner read + mark read; create ★
bookmarks/{uid_hackathonId}    owner rw
follows/{followerUid_targetId} owner rw
moderationReports/{id}         create by any user; admin rw
contactMessages/{id}           create by anyone (rate-limited route) ★
auditLogs/{id}                 ★ admin read
mentorSessions/{id}            organizer rw, participants book via API
reminderLog/{hackathonId_kind} ★ cron dedupe (7d / 24h / 1h)
```

**Status machine** (`src/lib/domain/status.ts`, unit-tested):

```
draft → payment_pending → pending_review ⇄ more_info_required
pending_review → approved → registration_open → registration_closed → ongoing → judging → results_announced → completed
                ↘ rejected                     any live → suspended (admin) / cancelled (owner)
```

The `HackathonStatus` type gets `payment_pending`, `more_info_required` and `suspended`. `approved` immediately resolves to the date-correct live status (`computeLiveStatus(h, now)`).

## 2. Phases — file-level changes

### Phase 0 — Foundation
- `package.json`: deps per D12; scripts `emulators`, `seed`, `make-admin`, `test`, `test:e2e`, `lint` (eslint flat config).
- `src/lib/env.ts` — zod-validated env with clear "not configured" flags (`isRazorpayConfigured`, `isResendConfigured`, …).
- `src/lib/firebase/client.ts` — no dummy fallback. Throws a helpful error in dev if config is missing. Connects to emulators when the flag is set.
- `src/lib/firebase/admin.ts` — lazy `getAdmin()`; emulator-aware; clear error message; never throws at import.
- `src/lib/auth/session.ts` (create/verify/clear cookie), `src/lib/auth/edge-verify.ts` (jose), `src/lib/auth/server.ts` (`requireUser`, `requireRole`), `src/lib/auth/roles.ts`.
- `src/app/api/auth/session/route.ts` (POST create, DELETE logout), `src/app/api/auth/refresh-claims/route.ts`.
- `middleware.ts` — protects `/dashboard`, `/organizer`, `/admin`, `/judge`, `/onboarding`; `?next=` redirect; admin gate.
- `firebase.json`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`, `.firebaserc.example`.
- `src/lib/data/` — `useLiveQuery`, `useLiveDoc`, repositories (`hackathons.ts`, `registrations.ts`, `teams.ts`, `projects.ts`, `notifications.ts`, …) and converters (Timestamp ⇄ Date).
- `src/lib/server/` — `audit.ts`, `notify.ts` (in-app + email), `api.ts` (route wrapper: auth, zod, rate limit, error format `{error:{code,message}}`), `ratelimit.ts`.
- `src/types/index.ts` — add the missing types (see AUDIT §2).
- `scripts/make-admin.ts`, `scripts/seed.ts` (`isSeed: true`), plus `ADMIN_EMAILS` bootstrap on first session.
- Remove BOMs, fix the `@types` versions, `.env.example` rewritten.

### Phase 1 — Auth, flip card, onboarding
- `src/app/(auth)/layout.tsx` — new lightweight constellation (SVG + initials/gradient nodes, no remote photos, reduced-motion aware).
- `src/components/auth/AuthFlipCard.tsx` — Framer `rotateY` 0↔180, `perspective`, `backface-visibility:hidden`, 600 ms; `LoginFace.tsx`, `SignupFace.tsx`, `PasswordStrength.tsx`, `AuthStatsPanel.tsx` (live `stats/platform`).
- `login/page.tsx` and `signup/page.tsx` render the same card with a different initial face (deep links work).
- `src/app/api/users/bootstrap/route.ts` — creates `users`, `userProfiles` and `usernames` in one transaction (unique username), sets the default claim, applies `ADMIN_EMAILS`.
- Email+password, Google, GitHub (only if `NEXT_PUBLIC_AUTH_GITHUB_ENABLED`), forgot password, verify-email banner, role redirect honoring `?next=`. Real errors via `aria-live`.
- `onboarding/page.tsx` — writes to `users/{uid}`, skip allowed, shown once (`onboardingComplete`).

### Phase 2 — Landing page
- One `SiteHeader` (global search: hackathons / projects / builders) + `SiteFooter`; delete `Navbar`, `Footer`, `DevpostNavbar`, `DevpostFooter`.
- `(public)/page.tsx` rebuilt from sections in `src/components/home/`: Hero (Explore / Host CTAs), LiveStats, Featured, Live now, Ending soon, Upcoming, Trending, HowHostingWorks (4 steps + live fee), Organizers, Winners, Testimonials (Firestore `testimonials`, hidden if empty), FAQ, FinalCTA. Skeletons, lazy sections, `next/image`.
- `src/app/sitemap.ts`, `src/app/robots.ts`, OG metadata, `opengraph-image.tsx`.

### Phase 3 — Creation wizard
- `src/app/(organizer)/organizer/create/page.tsx` → `src/components/wizard/*` (9 step components + `WizardShell`, `useHackathonDraft` with debounced autosave, `?id=` resume).
- `src/lib/domain/hackathon-schema.ts` — per-step zod schemas, date-ordering validator, rubric = 100.
- `src/lib/storage/upload.ts` — typed uploads with size/type limits. `src/app/api/hackathons/slug-check/route.ts`.
- Markdown editor with preview (`react-markdown`).

### Phase 4 — Razorpay
- `src/lib/payments/razorpay.ts` (client, `verifyPaymentSignature`, `verifyWebhookSignature` with `timingSafeEqual`), `src/lib/payments/checkout.ts` (lazy `checkout.js`).
- Routes: `api/payments/listing-fee/create-order`, `api/payments/registration/create-order`, `api/payments/verify`, `api/payments/refund`, `api/webhooks/razorpay` (raw body, `webhookEvents` dedupe), `api/coupons/validate`.
- Seat reservation transaction + expiry release (cron). Tickets with an HMAC QR (`TICKET_QR_SECRET`).
- Pages: `payments/receipt/[orderId]`, `organizer/payments`, `dashboard/payments` (CSV export). Remove `rzp_live_…`.

### Phase 5 — Admin
- `src/app/(admin)/admin/` — `layout`, `page` (live counts), `reviews` + `reviews/[id]`, `organizations`, `users`, `reports`, `payments`, `settings`, `audit`.
- `api/admin/hackathons/[id]/{approve,reject,request-info,feature,suspend}`, `api/admin/users/[uid]/{role,ban}`, `api/admin/settings`. Each writes an audit log and notifies (in-app + email).

### Phase 6 — Participant
- Hackathon page with tabs (Overview, Rules, Prizes, Schedule, Judges, Participants, Resources, Updates, Discussions, Gallery); timezone-dual timeline; .ics + Google Calendar; share.
- Discovery with full filters/sort (client-side over listed set + Firestore indexed filters). Bookmark, follow organizer, looking-for-team board.
- `api/registrations` (free), teams API (create/join/invite/leave/transfer), projects + submissions API (autosave, submit snapshot, withdraw), deadline enforcement in each route.
- `api/cron/tick` — status transitions, reminders (7d/24h/1h, deduped), reservation expiry.
- Dashboard pages: overview, hackathons, teams, projects, submissions, tickets (QR), payments, certificates, notifications (bell + page), messages (team chat), saved, settings (prefs, export, delete account).
- `verify/[serial]` public page + `api/certificates/[serial]/pdf` (pdf-lib).
- Public `projects` gallery (likes/comments/filters), `builders` directory, `u/[username]` portfolio, `leaderboard`.

### Phase 7 — Organizer
- Events list (statuses + rejection reason), edit (sensitive fields re-trigger review), participants (filters, approve/reject, bulk, CSV, **QR check-in** via `BarcodeDetector` with a manual code fallback), teams, submissions, judging (assign, conflicts, `/judge` scoring UI, aggregation → rankings → winners), announcements (+ email blast), analytics (Recharts from real data), certificates (bulk generate/send), coupons, ticket tiers, earnings.

### Phase 8 — Remaining pages, email, quality
- Real `pricing`, `help` (searchable FAQ), `contact` (→ `api/contact`, Resend), `privacy`, `terms`, `resources`.
- `src/lib/email/` — Resend client + HTML templates (welcome, verify, listing-fee receipt, submitted, approved, rejected, more-info, registration confirmed, payment receipt/failure, team invite, reminders, results, certificate ready). Silent no-op + log when not configured.
- `error.tsx`, `not-found.tsx`, `global-error.tsx`; a11y and mobile pass.
- Tests: `vitest` for date ordering, status machine, signatures, coupon math, rubric weights, verify route; Playwright smoke test (emulators + Razorpay test mode).
- `README.md`, `DECISIONS.md`, final checklist (`CHECKLIST.md`).

## 3. Test strategy without real credentials
- **Firebase:** Emulator Suite locally. `npm run dev:full` starts the emulators + seed + next dev.
- **Razorpay:** signature logic is unit-tested with known vectors. The full Checkout popup needs your **test** keys (`rzp_test_…`). Without them the UI shows "Payments not configured", and a **dev-only** `PAYMENTS_DEV_BYPASS=true` lets the listing fee be marked paid locally. It is gated to emulator mode, refused in production, logged in audit with `provider: "dev"`, and documented.
- **Resend:** without a key, emails are logged to the console and the `emailLog` collection.

## 4. Scope & cadence
This is large (estimate: 25–35k changed lines). I will work phase by phase with a green build and a commit after each, pushing to `main` only if you want (say so). After each phase I'll post a short summary of what's verified.

