This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Boopy — local env

Copy `.env.example` to `.env.local` and set at least `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Without them, the app still runs in dev and shows a setup screen instead of crashing.

To enable reminder dispatch:

- Set `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET`.
- Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` for email sends.
- Cron jobs hit `GET /api/cron` (scheduled in `vercel.json`) and authenticate with `CRON_SECRET`.

To enable Stripe billing:

- Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_PRICE_PRO_MONTHLY`.
- `POST /api/stripe/checkout` creates checkout sessions for the current workspace owner.
- `POST /api/stripe/webhook` upserts `workspace_billing` and updates plan state from Stripe events.

To enable groups + documents + automation channels + calendar sync:

- Run Supabase migrations in order through `supabase db push` (includes `0003_groups_migration.sql` to `0006_calendar_integrations.sql`).
- Set Google OAuth env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.
- Configure Slack/Discord/webhook destinations in `Settings -> Notifications`.
- Connect Google Calendar from `Settings -> Notifications` and run a manual re-sync when needed.

## Monorepo apps

- Dashboard app (core product): repository root (`src/app`)
- Marketing app (separate deploy target): `apps/marketing`

Run marketing app:

- `npm run dev:marketing` (http://localhost:3001)
- `npm run build:marketing`

Marketing stack:

- Landing template in `apps/marketing/app/page.tsx`
- Puck visual editor in `apps/marketing/app/studio/page.tsx`
- Payload headless content fetch in `apps/marketing/lib/payload.ts`
  - configure `PAYLOAD_API_URL` (+ optional `PAYLOAD_API_TOKEN`)
  - dashboard CTA driven by `NEXT_PUBLIC_DASHBOARD_URL`

Quality and verification commands:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `node scripts/qa/crawl-with-logs.mjs` (optionally set `CRAWL_EMAIL` and `CRAWL_PASSWORD` for authenticated crawl mode)

If `npm run dev` says **Another next dev server is already running**, stop the other process (or close the other terminal) or delete `.next/dev/lock` only after you are sure no dev server is using this folder.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
