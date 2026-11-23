# HACKSYRA

**DISCOVER. BUILD. COMPETE.** — An Innovation Hacks product.

HACKSYRA is a real-time, full-stack hackathon platform built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Firebase (Auth, Firestore, Storage, Admin SDK)**, **Razorpay**, and **Resend**.

---

## Core Architecture

- **Real-Time Data (`onSnapshot`):** Listings, hackathon statuses, participant counts, team rosters, team chat messages, notifications, judging scores, and leaderboards update live across connected devices.
- **Role-Based Security:** Firebase Auth ID tokens + `httpOnly` `__session` cookies verified in Edge middleware (`jose`) and API routes (`firebase-admin`), paired with custom role claims (`participant`, `organizer`, `moderator`, `admin`, `super_admin`).
- **Organizer Flow:** Any signed-in builder can host a hackathon through a 9-step autosaved wizard (`/organizer/create`) -> pay a configurable listing verification fee via Razorpay -> enter `pending_review` -> go live immediately upon Admin approval (`/admin/reviews`).
- **End-to-End Lifecycle:** Event discovery, registration with custom answers / promo coupons / 15-minute seat reservations / QR tickets, camera QR check-in, invite-code teams & real-time chat, Devpost-style project showcase & immutable submission snapshots, weighted blind judging, winner publishing, and verifiable PDF certificates (`/verify/[serial]`).

---

## Local Development Setup

### 1. Prerequisites
- **Node.js** 20+ and **npm**
- **Java** 11+ (required by Firebase Emulator Suite for local Firestore)
- **Firebase CLI** (`npx firebase` or global `firebase-tools`)

### 2. Install & Configure Environment

```bash
npm install
cp .env.example .env.local
```

For fast local development using the Firebase Emulator Suite (`project: demo-hacksyra`), keep these flags in `.env.local`:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1
PAYMENTS_DEV_BYPASS=true
CRON_SECRET=dev-cron-secret
TICKET_QR_SECRET=dev-ticket-qr-secret-change-in-prod
```

*(Never commit `.env.local` or real API keys.)*

### 3. Start Emulators, Seed Demo Data, and Run Dev Server

In terminal 1:
```bash
npm run emulators
```

In terminal 2:
```bash
npm run seed
npm run dev
```

Open `http://localhost:3000`. Seeded emulator test accounts (password: `Password123!`):
- Organizer: `organizer@hacksyra.test`
- Participant: `participant@hacksyra.test`
- Super Admin: `admin@hacksyra.test`

---

## Environment Variables Reference

See [`.env.example`](.env.example) for the full list:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Canonical base URL (`http://localhost:3000` or your production domain) |
| `NEXT_PUBLIC_USE_FIREBASE_EMULATORS` | Set `true` for local emulator dev, `false` in production |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Web SDK keys from Firebase Console |
| `FIREBASE_ADMIN_PROJECT_ID` / `CLIENT_EMAIL` / `PRIVATE_KEY` | Firebase service account credentials (server only) |
| `ADMIN_EMAILS` | Comma-separated verified emails auto-promoted to `super_admin` on bootstrap |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay API keys (`rzp_test_...` for test mode) |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook secret configured in Razorpay Dashboard for `/api/webhooks/razorpay` |
| `PAYMENTS_DEV_BYPASS` | `true` only with emulators for testing payments without live Razorpay keys |
| `TICKET_QR_SECRET` | 32+ char secret for HMAC-signing QR tickets |
| `RESEND_API_KEY` / `EMAIL_FROM` | Optional transactional email delivery via Resend |
| `CRON_SECRET` | Bearer secret protecting `GET /api/cron/tick` |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional distributed rate limiter (falls back to in-memory locally) |

---

## Firebase Setup (Production)

1. Enable **Email/Password** and **Google** providers in Firebase Authentication (optionally GitHub if `NEXT_PUBLIC_AUTH_GITHUB_ENABLED=true`).
2. Create Firestore and Cloud Storage buckets.
3. Deploy rules and composite indexes:
   ```bash
   npm run rules:deploy
   ```
4. Add your service account credentials (`FIREBASE_ADMIN_*`) to your hosting environment.

---

## Razorpay Setup & Testing Payments

1. In the **Razorpay Dashboard**, switch to **Test Mode** and copy your Key ID (`rzp_test_...`) and Key Secret into `.env.local` (with `PAYMENTS_DEV_BYPASS=false`).
2. Configure a webhook pointing to `https://<your-domain>/api/webhooks/razorpay` for `payment.captured`, `payment.failed`, and `refund.processed`, and set `RAZORPAY_WEBHOOK_SECRET`.
3. Organizers pay the listing fee (`₹3` default, configurable by admins at `/admin/settings`) during Step 9 of `/organizer/create`.
4. **Without Razorpay keys (Emulator Mode):** Set `PAYMENTS_DEV_BYPASS=true` with `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true` to test both listing fee verification and paid participant registration end-to-end safely.

---

## Creating the First Super Admin

Option A (Automatic): Add your verified email address to `ADMIN_EMAILS` in `.env.local` before signing in for the first time.
Option B (CLI): After signing up, run:
```bash
npm run make-admin -- you@example.com
```
Then sign out and sign back in so the updated custom claim (`role: "super_admin"`) is reflected in your session cookie.

---

## Scheduled Jobs (Cron)

`GET /api/cron/tick` expires stale 15-minute seat reservations, reconciles time-based hackathon lifecycle transitions (`registration_open` -> `ongoing` -> `judging`), and sends 7d / 24h / 1h deadline reminder notifications.
- Configured in [`vercel.json`](vercel.json) (`*/10 * * * *`) and [`.github/workflows/cron.yml`](.github/workflows/cron.yml).

---

## Scripts & Testing

```bash
npm run type-check   # TypeScript compiler check
npm run lint         # ESLint across src/
npm test             # Vitest unit test suite
npm run build        # Production Next.js build
```

