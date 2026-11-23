# HACKSYRA — Engineering Guide (read before writing code)

This is the contract every contributor (human or agent) follows. See `PLAN.md` for scope and `DECISIONS.md` for the reasoning.

## Golden rules
1. **No fake data, no fake success.** No hardcoded demo arrays in user flows, no `setTimeout` pretending to save, no prefilled personal data, no "coming soon". If a service isn't configured, show a clear "not configured" state.
2. **Realtime by default.** Read Firestore through `src/lib/data/live.ts` (`useLiveQuery` / `useLiveDoc`) or a repository hook in `src/lib/data/*.ts`. Never call `getDocs` in components for lists that should update live.
3. **Privileged writes go through API routes** built with `route()` from `src/lib/server/api.ts` (auth, zod validation, rate limiting, consistent errors). The client calls them with `api()` from `src/lib/api-client.ts`. Clients only write owner-scoped data that `firestore.rules` allows: profile, hackathon drafts, project drafts, bookmarks, team chat, and notification read-state.
4. **Every list has loading skeleton, empty state, and error state.** Use the shared components in `src/components/ui/`.
5. **Mobile-first and responsive everywhere**: phone (360px) → tablet → laptop → TV (1920px+, use `max-w-*` containers and the `3xl` breakpoint). Touch targets ≥ 44px. Bottom tab bar on mobile for app areas.
6. **Motion**: Framer Motion with short, smooth easing (150–400ms); always respect `prefers-reduced-motion` (`useReducedMotion()` or the `motion-safe:` Tailwind variant).
7. **Accessibility**: labels on every input, `aria-live` for errors and toasts, visible focus rings, semantic landmarks, alt text.
8. **Never commit secrets.** Read config through `src/lib/env.ts`.

## Key modules
| Need | Use |
|---|---|
| Firebase client | `clientAuth()`, `clientDb()`, `clientStorage()`, `firebaseReady()` from `@/lib/firebase/client` (browser only, inside effects/handlers) |
| Firebase admin | `adminDb()`, `adminAuth()`, `FieldValue`, `Timestamp` from `@/lib/firebase/admin` (server only) |
| Current user (client) | `useAuth()` → `{ firebaseUser, user (live users doc), role, isAdmin, loading, notConfigured, signOut, refreshClaims }` |
| Current user (server component) | `getSessionUser()`, `requireUser()`, `requireAdmin()` from `@/lib/auth/server` |
| After sign-in | `completeSignIn(fbUser, { requestedRole, displayName, next })` from `@/lib/auth/client-flow`, then `router.replace(redirectTo)`; map errors with `authErrorMessage(err)` |
| API route | `export const POST = route({ auth: "required", body: ZodSchema, rateLimit: {limit, windowSec} }, async ({ user, body, params, req }) => {...})`; throw `Errors.badRequest(...)` etc. |
| Audit log | `audit({ actorId, actorEmail, action: "hackathon.approve", resource: "hackathons", resourceId, changes, req })` |
| Notify a user | `notify({ userId, type, title, message, linkUrl, email: { subject } })`; `notifyAdmins(...)` |
| Email | `sendEmail({ to, subject, html })` + `renderEmail({ title, bodyHtml, cta })` (escape user content with `escapeHtml`) |
| Dates | `toDate`, `timeLeft`, `formatInZone`, `zoneAbbr`, `viewerTimeZone` from `@/lib/domain/dates` |
| Status | `computeLiveStatus`, `canTransition`, `STATUS_LABELS`, `LIVE_STATUSES`, `isRegistrationOpenAt`, `isSubmissionOpenAt` from `@/lib/domain/status` |
| Timeline validation | `validateTimeline` from `@/lib/domain/timeline` |
| Money | `formatMoney(paise)`, `formatMajor(rupees)`, `applyCoupon` from `@/lib/domain/money` |
| Rubric | `validateRubric`, `weightedScore`, `aggregateScores` from `@/lib/domain/rubric` |
| Slugs/search | `slugify`, `isValidSlug`, `buildSearchKeywords` from `@/lib/domain/slug` |
| Razorpay | `razorpay()`, `verifyPaymentSignature`, `verifyWebhookSignature`, `signTicket`, `verifyTicketCode` from `@/lib/payments/razorpay` |
| Collections | `COLLECTIONS`, `DOCS`, `SUB` from `@/lib/firebase/collections` |
| Types | `@/types` (Hackathon has embedded tracks/prizes/sponsors/faq/schedule/judgingCriteria/registrationQuestions/stages) |

## Data rules worth remembering
- Public hackathon queries **must** include `where("isListed", "==", true)`; otherwise the rules reject them. Only the server sets `isListed` and `status` (after drafting).
- Registration doc id = `${hackathonId}_${uid}`; bookmark id = `${uid}_${hackathonId}`.
- Money is integer **paise**. Prize `cashAmount` is in **major** units (₹).
- Timestamps: store Firestore `Timestamp`s; convert with `toDate()` for display.
- Team invite codes live in `teams/{id}/private/meta` (members only), never on the public team doc.
- Ticket tiers and coupons are written by the server. The wizard keeps drafts in `hackathon.pricingDraft`, and the server materialises them on submission.

## Design system
- Brand blue `#1565D8` (`brand-*` in Tailwind; legacy `violet-*` maps to brand). Fonts: Space Grotesk (`font-display`) for headings, Inter for body.
- Reuse `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-outline`, `.card`, `.input`, `.label`, `.badge-*`, `.skeleton` from `globals.css`.
- White surfaces, `rounded-xl/2xl` cards, soft shadows, subtle borders (`border-slate-200`).

## Verification (concurrency-safe)
- Agents run **only** `npx tsc --noEmit`, `npx eslint <your paths>`, and `npx vitest run <your tests>`.
- **Do not** run `next build`, `npm install`, or git commands. The coordinator does those. If you need a package, ask the coordinator.
- Stay inside the files/folders you own; if you must touch a shared file (`src/types/index.ts`, `firestore.rules`, `firestore.indexes.json`, `src/lib/firebase/collections.ts`), make **small additive edits** and mention them in your report.

## Local run
```
npm run emulators          # terminal 1 (Auth 9099, Firestore 8080, Storage 9199, UI 4000)
npm run seed               # once: demo users + hackathons
npm run dev                # terminal 2
```
Demo logins (emulator only): `organizer@hacksyra.test`, `participant@hacksyra.test`, `admin@hacksyra.test`, all with password `Password123!`.
