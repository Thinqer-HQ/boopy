# Boopy — Design Spec (v1)

Date: 2026-04-15  
Owner: Solo engineering (Cursor)  
Goal: ship fast, production-safe, sellable MVP for subscription renewal notifications

## Summary
Boopy is a web app for individuals and agencies to track recurring subscriptions and get notified before renewals. v1 focuses on **manual subscription entry** with a data model and ingestion boundary that supports future automation (invoice drop + email receipt sync) without rewrites.

**Core v1 outcomes**
- Users can create a **workspace**, add **clients**, and manage **subscriptions** per client.
- Users can set notification lead-times and receive **email + PWA push** reminders.
- Agencies can manage many clients under a workspace (secure multi-tenancy).
- The system is observable from day 1: analytics, error tracking, logs, audit trail.

## Non-goals (v1)
- Automatic ingestion from email/bank/Plaid.
- SMS notifications.
- Multi-member workspaces / invites (we will keep schema-compatible).
- Native mobile apps (PWA only).

## Principles
- **Secure by default**: Postgres + RLS for strict workspace scoping.
- **Fast iteration**: one codebase (Next.js) for UI + API + jobs.
- **Operational clarity**: every notification is traceable end-to-end.
- **Sellable fast**: Stripe billing early, minimal UX surface area, strong dashboard.

## Architecture (Option 1)
### Stack
- **Frontend/App**: Next.js (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **DB/Auth**: Supabase Postgres + Supabase Auth + Row Level Security (RLS)
- **Email**: Resend
- **Push**: Web Push (VAPID) + PWA install
- **Scheduling**: Vercel Cron → secured API endpoint (idempotent processing)
- **Billing**: Stripe (Boopy subscription plans)
- **Analytics**: PostHog
- **Error tracking / performance**: Sentry
- **Logs**: Axiom (structured logs + queryable cron/job logs)

### High-level components
- **Web app**: onboarding, dashboard, CRUD, settings, billing portal
- **API layer**: typed endpoints / actions for CRUD + notifications + billing webhooks
- **Scheduler**: periodic job to compute and dispatch reminders
- **Observability**: structured logs, Sentry errors, PostHog events, audit trail

## Data model (logical)
Boopy data is organized as: **Workspace → Client → Subscription**.

### Entities
- **users**: Supabase Auth users (id from auth provider)
- **workspaces**
  - `id`, `owner_user_id`, `name`, timestamps
  - Personal users: one workspace; agencies: one+ workspaces
- **workspace_members** (schema reserved for later)
  - v1: owner-only behavior; table may exist for forward-compat
- **clients**
  - `id`, `workspace_id`, `name`, optional metadata (email, notes)
- **subscriptions**
  - `id`, `client_id`, `vendor_name`, `amount`, `currency`
  - `cadence` (monthly/yearly/custom), `renewal_date`
  - `status` (active/cancelled/paused)
  - optional: `category`, `notes`, `payment_method_hint`
- **notification_prefs**
  - scope: workspace-level defaults with optional per-subscription override later
  - `lead_times_days` (e.g. [1,3,7]), channels enabled (email, push)
- **push_subscriptions**
  - stores Web Push subscription JSON per user/workspace (encrypted-at-rest where possible)
- **notification_jobs**
  - computed reminders to send; used for idempotency + traceability
  - `idempotency_key`, `subscription_id`, `channel`, `scheduled_for`, `sent_at`, `status`, `error`
- **audit_events**
  - workspace-scoped append-only log of important actions (CRUD + notification sends)

### Multi-tenancy + security
All workspace-owned tables must include `workspace_id` (directly or derivable by join) and be protected by **RLS**:
- A user can only read/write rows for workspaces they own (v1) or belong to (later).
- Use “least privilege” policies; avoid service-role access except server-only tasks that must bypass user auth (e.g., cron), and then implement additional checks.

## Key user flows (v1)
### Onboarding
- Sign up / sign in
- Create workspace (or auto-create “Personal” workspace on first login)
- Create first client (“Me” by default)
- Add first subscription
- Enable notifications (email default on, push opt-in)

### Dashboard
- Upcoming renewals (next 30 days) grouped by client
- Monthly / yearly spend summaries
- Quick add subscription
- Filters: client, vendor, status

### Subscription management
- Create/edit/cancel/pause subscription
- Renewal date recalculation rules:
  - monthly/yearly: next renewal computed deterministically
  - custom cadence: v1 can store explicit `renewal_date` only (simple); cadence metadata informational

### Notifications
- User configures lead-times: default [7, 3, 1] days (editable)
- Reminders are sent for each lead time before `renewal_date`
- Deduping via `idempotency_key = subscription_id + channel + lead_time + renewal_date`

## Scheduler design (Vercel Cron)
### Trigger
Cron runs every X minutes (e.g., 15) and calls a secured endpoint.

### Algorithm (idempotent)
- Query subscriptions whose renewal date is within max lead-time window.
- For each subscription and each lead time:
  - compute `scheduled_for = renewal_date - lead_time`
  - if `scheduled_for` is now/past and not yet sent, upsert a `notification_job` row
- Dispatch channel send (email/push) for pending jobs
- Update `sent_at`, `status`, and record errors

### Failure handling
- Retries: failed jobs remain with status=failed and eligible for retry with backoff rules (v1 can be simple: retry on next cron run up to N times).
- Alerting: Sentry captures exceptions; Axiom logs include job ids; optionally PostHog event for `notification_failed`.

## Email (Resend)
- Transactional templates for renewal reminders
- Include workspace name + client name + subscription details
- Include “manage notification settings” link

## Push (PWA + Web Push)
### Requirements
- Service worker registered
- Web Push subscription stored per user/workspace
- Opt-in UX: clear explanation and retry affordances

### Payload
- Minimal: vendor + amount + renewal date + client
- Deep link into subscription detail

## Billing (Stripe)
### Plans (v1)
- Trial + paid tier(s), priced per workspace or per seat (v1: per workspace simplest)
- Feature gating: e.g., number of clients/subscriptions, push notifications, future ingest

### Integrations
- Checkout session creation
- Customer portal link
- Webhook handling for subscription state changes (store in DB for gating)

## Observability from day 1
### Product analytics (PostHog)
Track events with workspace_id and (when relevant) client_id (hashed/uuid; avoid PII):
- `workspace_created`
- `client_created`
- `subscription_created` / `subscription_updated` / `subscription_cancelled`
- `push_opt_in` / `push_opt_out`
- `notification_job_created`
- `notification_sent` (channel)
- `billing_checkout_started` / `plan_activated` / `plan_cancelled`

### Error tracking + performance (Sentry)
- Capture client + server errors
- Tag by environment + release
- Add breadcrumbs for: cron run id, job id, workspace id

### Logs (Axiom)
- Structured JSON logs only
- Correlation id on every request (and propagate into job processing)
- Redaction: never log auth tokens, Stripe secrets, push subscription keys, full email addresses

### Audit trail (DB)
`audit_events` records significant actions for support/debugging (workspace-scoped):
- who did what, on which entity, when
- store actor user id (not email)

## Privacy & data handling
- Minimize PII: clients can be named without emails; do not require client emails.
- If user emails are used for notifications, treat as sensitive; redact in logs.
- Push subscription objects treated as secrets; store carefully and restrict access.

## Future: invoice drop + receipt sync (designed-in)
### Ingestion boundary
Define an internal interface:
- Input: file upload or email message
- Output: `ParsedSubscriptionCandidate[]` (vendor, amount, cadence guess, renewal guess, confidence)
Candidates are presented to the user for confirmation (human-in-the-loop).

### Storage
- `uploads` table + object storage bucket
- Process pipeline can run asynchronously later (not in v1)

## Testing strategy (v1)
- **Unit**: date computations, idempotency keys, notification eligibility logic
- **Integration**: API endpoints (CRUD + cron handler) against a test DB
- **E2E smoke (Playwright)**: sign up → create workspace/client/subscription → enable push (where feasible) → see dashboard

## CI/CD and guardrails (v1)
- Typecheck + lint + tests in CI
- Env var validation at startup
- Feature flags for future ingestion features
- No deploy will occur without explicit user instruction (“tell me before you deploy”)

## Open decisions (explicit)
- Exact cron frequency (start 15 min; tune later)
- Whether to store per-subscription lead-time overrides in v1 (default: workspace-level only)
- Pricing model (per workspace vs usage-based) (default: per workspace)

