-- 0016_admin_v2_allowlist.sql
-- Allowlist of users who can access Boopy Admin v2, plus additive read
-- policies granting them select access across workspaces they don't own.
-- These policies are additive: they don't change any existing
-- owner-scoped policy, they just add a second way to qualify for `select`.

create table public.admin_users (
  user_id uuid primary key references auth.users(id),
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- A logged-in user can check whether THEY are an admin (used by the
-- client-side auth check). They cannot list other admins.
create policy "admin_users_can_read_own_row"
on public.admin_users
for select
using (user_id = auth.uid());

create policy "admin_users_can_read_all_workspaces"
on public.workspaces for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admin_users_can_read_all_workspace_billing"
on public.workspace_billing for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admin_users_can_read_all_groups"
on public.groups for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admin_users_can_read_all_subscriptions"
on public.subscriptions for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admin_users_can_read_all_notification_jobs"
on public.notification_jobs for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admin_users_can_read_all_notification_digest_runs"
on public.notification_digest_runs for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admin_users_can_read_all_audit_events"
on public.audit_events for select
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
