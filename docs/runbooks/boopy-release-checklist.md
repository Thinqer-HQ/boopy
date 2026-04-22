# Boopy Release Checklist

## 1) Environment and config

- Verify `.env.local` has Supabase, Stripe, Resend, VAPID, and Google OAuth vars.
- Confirm `CRON_SECRET` matches deployment secret used by cron.
- Confirm `GOOGLE_REDIRECT_URI` points to `/api/integrations/google/callback`.

## 2) Database migration order

1. `0001_init.sql`
2. `0002_billing.sql`
3. `0003_groups_migration.sql`
4. `0004_documents_ingestion.sql`
5. `0005_notification_destinations.sql`
6. `0006_calendar_integrations.sql`

## 3) Backfill and compatibility checks

- Confirm `groups` table is populated from legacy `clients`.
- Confirm `subscriptions.group_id` backfill completed for existing rows.
- Spot-check legacy `/clients` route redirection to `/groups`.

## 4) Automated quality gates

- Run `npm run lint`
- Run `npm run typecheck`
- Run `npm run test`
- Run crawler: `node scripts/qa/crawl-with-logs.mjs`
- Auth crawler mode (optional): set `CRAWL_EMAIL` and `CRAWL_PASSWORD`

## 5) Integration smoke tests

- Billing: start Stripe checkout and verify webhook updates plan.
- Notifications: trigger `/api/cron` and confirm at least one sent/failed status update.
- Destinations: run send-test for Slack/Discord/webhook from settings.
- Documents: upload a receipt, parse candidate, confirm subscription creation.
- Calendar: connect Google, run re-sync, verify renewal events exist.

## 6) Rollback notes

- If migration regressions occur, disable cron and destination sends first.
- Keep legacy `clients` table until post-release validation confirms group migration health.
- Re-run migration in staging and compare counts (`clients` vs `groups`, subscriptions linked).
