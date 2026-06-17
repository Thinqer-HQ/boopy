# Boopy Admin v2 — Foundation + Core CRUD (Sub-project 1 of 5)

## Context

The current admin dashboard (`apps/admin`, "v1") proxies through `/api/admin/*` REST
endpoints on the main app, gated by a shared `BOOPY_ADMIN_SECRET` header that has to be
kept in sync across two separate Vercel projects. That sync has broken repeatedly (BOM
characters in env vars, empty-string env vars silently bypassing `??` fallbacks, env
vars set before a redeploy picks them up), causing recurring 403s.

The user wants to track "every aspect of Boopy as a business" — users, subscriptions,
revenue, mobile metrics, cost/profit, and user feedback. That request was decomposed
into 5 independent sub-projects (see "Out of scope" below). This spec covers only
**sub-project 1: the Admin v2 foundation and its core CRUD modules**, which is the
prerequisite for everything else.

## Goals

- Stand up a new admin app that talks to Supabase **directly**, eliminating the
  cross-project secret-sync problem entirely.
- Reuse Boopy's existing visual identity rather than inventing a new one.
- Cover the data v1 already exposed (users, subscriptions, notifications, alerts) plus
  workspaces/groups.
- Add a small number of well-understood write actions on top of that read surface,
  specifically around the things support will actually need: pausing/cancelling a
  user's own tracked subscriptions, and pausing/cancelling/refunding their Boopy Pro
  plan.
- Run alongside v1 (not replace it) until v2 is proven out.

## Out of scope (deferred sub-projects — tracked, not built here)

1. **Revenue/Stripe dashboard** — MRR, churn, new subs, trial conversions. Needs a
   custom Stripe API integration; Refine has no Stripe data provider.
2. **Mobile crash metrics** — Firebase Crashlytics integration.
3. **Per-user cost/profit modeling** — depends on #1 existing first, plus a cost model
   (Stripe fees + infra cost attribution) that hasn't been defined yet.
4. **User feedback/concerns feature** — does not exist anywhere in the product today.
   `roadmap_items` is a public roadmap display, not a feedback inbox. This needs a new
   `feedback` table and a submission surface in the **web and mobile apps**, not just an
   admin view — it's a product feature that admin would read from, not an admin-only
   build.

## Architecture

- New app: `apps/admin-v2` (Next.js App Router), its own Vercel project, its own
  subdomain. Deployed and run alongside `apps/admin` (v1).
- **Refine** (`@refinedev/core`, `@refinedev/nextjs-router`) provides resource
  definitions, routing conventions, and CRUD scaffolding (list/show/edit pages, hooks
  like `useTable`, `useShow`).
- **`@refinedev/supabase`** as the data provider. The admin's authenticated Supabase
  session is used for reads (gated by new RLS policies, see Auth section). Writes that
  need to bypass per-workspace RLS (the billing actions) go through Next.js Route
  Handlers using the **service role** key, mirroring the pattern v1's admin API already
  used.
- **shadcn/ui** for components. Visual identity is copied from the main app, not
  reinvented:
  - Brand purple `oklch(0.549 0.231 281)` / `#6d5df6`
  - Accent wash `#efecfe`, warm off-white background `#f5f4fa`
  - Manrope (body) + Fredoka (headings)
  - 18px (`1.125rem`) base border radius
  - Light + dark mode via the same CSS variable structure as
    `src/app/globals.css`
  - shadcn `Sidebar` and `Table` components for navigation and data display (not
    custom-built equivalents)

## Auth & access control

- New table, new migration:

  ```sql
  create table public.admin_users (
    user_id uuid primary key references auth.users(id),
    email text not null,
    created_at timestamptz not null default now()
  );
  ```

- Login: admin enters their email on the Admin v2 login page → Supabase sends a magic
  link → clicking it establishes a session.
- After login, the app checks whether `auth.uid()` exists in `admin_users`. If not,
  show "not authorized" and sign them out immediately.
- **Adding a new admin is a manual SQL insert** via the Supabase dashboard — no UI for
  this, since admins are added rarely.
- RLS: every other table in this schema scopes access to
  `workspaces.owner_user_id = auth.uid()`. Admin v2 needs new policies that additionally
  grant **read** access when `auth.uid()` is present in `admin_users`, e.g.:

  ```sql
  create policy "admin_users_can_read_all_workspaces"
  on public.workspaces for select
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
  ```

  (and equivalent read policies for `workspace_billing`, `groups`, `subscriptions`,
  `notification_jobs`, `notification_digest_runs`, `audit_events`.) These are
  **additive** — they don't change any existing owner-scoped policy, they just add a
  second way to qualify for `select`.

- The billing actions (pause/cancel/refund Pro plan) and the subscription pause/cancel
  action are **not** performed via the admin's own RLS-scoped session — they go through
  dedicated Route Handlers that re-check `admin_users` membership server-side, then use
  the Supabase **service role** key to perform the write (and, for billing actions, call
  the Stripe API). This keeps the blast radius of "what can an admin's leaked session
  token do" limited to reads plus a short, explicit list of actions, rather than open
  write access to every table.

## Modules (Refine resources)

| Resource                       | Source                                                                                                            | Capability                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Users                          | `auth.users` + `workspaces` + `workspace_billing`                                                                 | List, view detail, billing actions (below) |
| Subscriptions (vendor-tracked) | `subscriptions`, `groups`                                                                                         | List, view detail, pause/cancel action     |
| Workspaces / Groups            | `workspaces`, `groups`                                                                                            | List, view detail                          |
| Notifications                  | `notification_jobs`, `notification_digest_runs`                                                                   | List, filter by status, view failures      |
| Alerts                         | Computed (churned pro, near free-limit) — reimplements v1's `/api/admin/alerts` logic as a Supabase view or query | List                                       |

### Action: pause/cancel a tracked subscription (Subscriptions module)

This acts on `subscriptions.status` — the user's own tracked vendor subscriptions
(Netflix, Spotify, etc.), **not** Boopy's billing of the user. Implemented as a single
Postgres RPC (`security definer`) so it's atomic:

1. Look up the subscription's `group_id` → `workspace_id` and current status.
2. Update `subscriptions.status` → `'paused'` or `'cancelled'`.
3. Cancel orphaned jobs: any `notification_jobs` for that subscription with
   `status = 'pending'` get set to `'failed'`, with
   `error = 'Subscription <paused/cancelled> by admin'`. This is necessary because
   **nothing in the current codebase does this today** — the cron job
   (`src/app/api/cron/route.ts`) only filters `status = 'active'` when _creating_ new
   jobs, but never cleans up jobs that already exist for a subscription that's since
   been paused/cancelled. Without this step, a user would still receive a renewal
   reminder for a subscription that was just paused/cancelled on their behalf.
4. Insert into `audit_events` (`action`, `entity_type: 'subscription'`, `entity_id`,
   `actor_user_id` = the admin, `workspace_id`,
   `metadata: { old_status, new_status, jobs_cancelled_count }`). This is the first
   real usage of `audit_events` — it exists in the schema today but nothing writes to
   it.

UI: Pause/Cancel buttons on the subscription's row. Confirmation dialog shows how many
pending reminders will be cancelled before the admin confirms.

Mobile reflects the change automatically — `apps/mobile/lib/sync.ts` is already
bidirectional and cloud-wins by `updated_at`, so no extra work is needed there.

### Actions: Boopy Pro plan management (Users module)

These act on `workspace_billing` / the user's actual Stripe subscription — completely
separate system from the action above. All four call the Stripe API directly and rely
on the **existing webhook** (`src/app/api/stripe/webhook/route.ts`) to sync
`workspace_billing.plan`/`status` back from Stripe's response, except where noted.

**Pause / Resume** — pausing must drop the user to Free _immediately_ and stop billing,
in a way that's resumable. Stripe's native `pause_collection` stops invoicing but does
**not** change `subscription.status`, so the existing webhook would keep seeing
`status: 'active'` and silently re-grant `plan: 'pro'` the next time _any_ webhook event
fired for that subscription. To make the pause actually stick:

1. New migration: `alter table workspace_billing add column admin_paused boolean not null default false;`
2. **Pause action**: `stripe.subscriptions.update(id, { pause_collection: { behavior: 'void' } })`, then directly set `admin_paused = true, plan = 'free'` in the same write (don't wait for the webhook).
3. **Webhook handler change** (`src/app/api/stripe/webhook/route.ts`): when computing `plan` from `subscription.status`, also check the row's current `admin_paused` flag — if true, force `plan = 'free'` regardless of what Stripe reports. This is the one code change to existing logic this spec requires.
4. **Resume action**: `stripe.subscriptions.update(id, { pause_collection: null })`, set `admin_paused = false`, and re-sync `plan` from the subscription's actual current status (re-fetch from Stripe).

**Cancel / Undo cancellation** — takes effect at the end of the current paid period, so the user keeps the access they already paid for:

- **Cancel**: `stripe.subscriptions.update(id, { cancel_at_period_end: true })`. The existing webhook handles the eventual `customer.subscription.deleted` event at period end and flips `plan` to `'free'` automatically — no webhook changes needed for this path.
- **Undo cancellation**: `stripe.subscriptions.update(id, { cancel_at_period_end: false })`, for when an admin cancels by mistake or the customer calls back before the period ends.

**Cancel & Refund** — gated to a 15-day window from when the user's **current** Pro subscription started (not their account creation date, and not a value cached in our own DB — see rationale below):

- Eligibility: `now - subscription.start_date <= 15 days`, where `subscription.start_date` is fetched **live** from `stripe.subscriptions.retrieve(stripeSubscriptionId)` at the time of the check — never cached or read from a local timestamp. Rationale: `workspace_billing.created_at` only reflects the first time that row was ever created; since it's upserted on the same primary key (`workspace_id`), a user who cancels and resubscribes months later wouldn't get a fresh window if we used that field. Stripe's own `start_date` on the _current_ subscription object always reflects the current subscription's actual start, so resubscribing correctly resets the window.
- Two-step flow mirroring the existing `switch-interval` route's GET-preview/POST-commit pattern:
  - **GET (preview)**: checks eligibility, fetches all `paid` invoices for the subscription (`stripe.invoices.list({ subscription, status: 'paid' })`), returns the total refundable amount and which invoices. Shown in a confirmation dialog before the admin commits.
  - **POST (commit)**: re-verifies eligibility server-side (never trusts a client-supplied "eligible" flag), refunds each paid invoice's charge via `stripe.refunds.create`, then immediately cancels the subscription (`stripe.subscriptions.cancel` — not end-of-period, since the user is getting their money back and shouldn't keep access). The webhook's `customer.subscription.deleted` handling flips `plan`/`status` to free automatically.
  - **Partial failure handling**: if any refund fails partway through, stop immediately and do **not** cancel the subscription. Report exactly which charges succeeded and which failed so the failure can be resolved manually. Access must never be revoked while a refund is in a failed or unknown state.

**Manual override** — for special cases that fall outside the standard 15-day policy (goodwill, escalations, etc.). This extends the same action rather than being a separate one:

- An "Use manual override" control on the Cancel & Refund panel reveals a warning banner ("This bypasses the standard 15-day refund policy. Use only for special/manual cases. This action is logged with your admin account.") plus:
  - A **required reason field** (free text) — mandatory, since this is a deliberate policy exception. Stored in the audit log.
  - A table of **all payments for this Stripe customer** (`stripe.charges.list({ customer: stripeCustomerId })` or the equivalent paid-invoice listing) — their full lifetime payment history, not just charges tied to the current subscription, since they may have subscribed/cancelled/resubscribed before and the admin needs full context.
  - Per payment row, a checkbox plus a **manually-editable refund amount** (prefilled with that charge's full amount, editable down for a partial refund). A running total updates as rows are selected.
- The 15-day eligibility check is skipped entirely in this path.
- **Commit**: for each selected charge+amount pair, call `stripe.refunds.create({ charge, amount })` — Stripe itself rejects an amount exceeding what's left refundable on that charge, giving free validation. Same partial-failure handling as the standard path: any failed refund call stops everything immediately, the subscription is **not** cancelled, and exact per-charge success/failure is reported. Once all selected refunds succeed, cancel the subscription immediately, same as the standard path.
- Audit log uses `action: 'admin_cancel_and_refund_override'` (distinct from the standard path's action name) with `metadata: { override: true, reason, refunded_charges, refunded_total_amount }`.

All billing actions log to `audit_events` with `entity_type: 'workspace_billing'`, `entity_id: workspace_id`, `actor_user_id` = the admin, and action-specific metadata (`old_plan`/`new_plan`, `stripe_subscription_id`, and for refunds, `refunded_charges`, `refunded_total_amount`, plus `days_since_subscription_start` for the standard path or `reason` for the override path).

UI: all actions live in a "Billing" panel on the user's detail page. The standard Cancel & Refund is only shown/enabled when the user is currently on Pro and within the 15-day window; the manual override is always available as a secondary, warning-gated option whenever the user has at least one payment on record.

## Data model changes (new migration)

```sql
-- admin_users: allowlist for who can access Admin v2
create table public.admin_users (
  user_id uuid primary key references auth.users(id),
  email text not null,
  created_at timestamptz not null default now()
);

-- additive read policies for admin_users members across existing tables
-- (workspaces, workspace_billing, groups, subscriptions, notification_jobs,
--  notification_digest_runs, audit_events) — see Auth section for the pattern.

-- workspace_billing: tracks an admin-initiated pause independent of Stripe's
-- own subscription.status, so routine webhook events can't silently undo it
alter table public.workspace_billing
  add column admin_paused boolean not null default false;
```

## Code changes to existing app (not just additions)

- `src/app/api/stripe/webhook/route.ts`: when deriving `plan` from
  `subscription.status` on `customer.subscription.updated`/`deleted`, also check the
  row's `admin_paused` flag and force `plan = 'free'` if set, regardless of what Stripe
  reports.

## Testing / verification plan

- Magic-link login flow: confirm a non-`admin_users` email is rejected and signed out;
  confirm an allowlisted email reaches the dashboard.
- RLS: confirm an admin session can read all workspaces' data (not just none, given no
  `owner_user_id` match) without using the service role key.
- Subscription pause/cancel: create a subscription with a pending `notification_job`,
  pause it via the admin action, confirm the job's status flips to `'failed'` and the
  `audit_events` row is written.
- Pro plan pause: pause an active Pro subscription, confirm `admin_paused = true` and
  `plan = 'free'` immediately; manually trigger a webhook event for that subscription
  and confirm `plan` stays `'free'` (proving the webhook respects the flag) before
  resuming.
- Pro plan cancel: confirm `cancel_at_period_end` is set and plan remains `'pro'` until
  the period actually ends.
- Cancel & Refund: test both eligible (within 15 days of `subscription.start_date`) and
  ineligible (past the window) cases; confirm a simulated partial-refund failure does
  **not** cancel the subscription.
- Cancel & Refund override: confirm the action is rejected without a reason; confirm a
  manual amount greater than what's left refundable on a charge is rejected by Stripe;
  confirm an ineligible (>15 day) subscription can still be refunded via this path; confirm
  the resulting `audit_events` row has `action: 'admin_cancel_and_refund_override'` and
  includes the reason.

## Open questions / explicitly deferred

None outstanding for this sub-project — all decisions above were confirmed during
brainstorming. The four items under "Out of scope" are tracked for future sub-projects,
not decided here.
