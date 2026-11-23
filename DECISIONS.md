# HACKSYRA — Decisions log

Product and engineering decisions made while building. New entries go at the bottom.

| # | Decision | Rationale |
|---|---|---|
| D1 | **Firebase Auth + httpOnly session cookie** (`__session`, 14 days, `sameSite=lax`, `secure` in prod). `next-auth` removed. | A single auth system. Middleware and server code can trust the cookie. |
| D2 | **Middleware verifies the cookie on the Edge with `jose`** against Google's session-cookie certs. Server routes re-verify with the Admin SDK (`checkRevoked`). In emulator mode cookies are unsigned, so they are only decoded, and only when `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`. | `firebase-admin` can't run on the Edge, and a real signature check beats "a cookie exists". |
| D3 | **Roles = custom claim `role`**, mirrored to `users.roles` for querying. Anyone signed in can host; `organizer` is granted at signup (if chosen) or on first hackathon creation. Role changes made by an admin revoke the user's sessions so the next sign-in carries the new claim. API role checks always read **fresh** claims. | "Anyone can host" without trusting client-written roles. |
| D4 | **Privileged writes only through Next route handlers** (Admin SDK). Clients write only owner-scoped data allowed by `firestore.rules`. | Business rules, deadlines and money stay on the server. |
| D5 | **`isListed`** (server-only) is the single public-visibility flag; public queries filter on it and the rules enforce it. | Unapproved events can't leak through either queries or rules. |
| D6 | **Embedded hackathon sub-data** (tracks, prizes, sponsors, FAQ, schedule, rubric, questions, stages). Ticket tiers and coupons are **separate** server-written collections, drafted in `hackathon.pricingDraft` and materialised on submission. Coupon codes are removed from the public doc. | Atomic wizard autosave; counters need transactions; coupon codes stay secret. |
| D7 | **Scheduler = `GET /api/cron/tick`** with `Authorization: Bearer $CRON_SECRET`, triggered every 10 min by GitHub Actions (free). `vercel.json` cron is provided for Vercel Pro. Every write also checks deadlines on the server, so a late cron can't let anyone in after a deadline. | No Firebase Blaze plan needed. Vercel Hobby crons only run daily. |
| D8 | **Razorpay only (INR)**; Stripe removed from copy and env. All money goes to the **platform** account; organizer earnings are tracked in `payouts` and settled manually or via RazorpayX later. | Consistent, honest, matches the spec (no per-organizer keys). |
| D9 | **Realtime data layer** (`useLiveQuery`/`useLiveDoc`) mirrors `onSnapshot` into the TanStack Query cache. | One pattern; instant back-navigation; always live. |
| D10 | **`stats/platform` counters** are updated with `FieldValue.increment` by the server. | Landing stats without collection scans. |
| D11 | **Local dev on the Firebase Emulator Suite** (`demo-hacksyra`). The seed script creates demo users (emulator only) and listed hackathons marked `isSeed: true`. | `.env.local` has no real Firebase keys; every flow is still testable. Production never falls back to fake data. |
| D12 | **`PAYMENTS_DEV_BYPASS`** marks a payment paid **only** when emulators are on and not on Vercel production. Bypassed payments are recorded with `provider: "dev"` and audited. | Lets the full create → pay → approve flow be tested before Razorpay test keys are added. |
| D13 | **Admin bootstrap via `ADMIN_EMAILS`** requires a **verified** email; otherwise use `npm run make-admin -- <email>`. | Stops someone pre-registering an admin's address with a password account. |
| D14 | **Email OTP login removed**; the UI offers password, Google and (optionally) GitHub. LinkedIn/Microsoft buttons are removed. | OTP was never implemented; we don't fake auth methods. |
| D15 | **Ticket QR = `ticketId.HMAC(TICKET_QR_SECRET)`**: verifiable at check-in, with no per-ticket secret stored in Firestore. | Matches "signed QR" while keeping the secret off the client. |

