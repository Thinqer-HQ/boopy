-- 0017_admin_views.sql

-- Added here (rather than later, with the rest of the Pro-plan billing work)
-- because admin_user_directory below references it.
alter table public.workspace_billing
  add column if not exists admin_paused boolean not null default false;

-- One row per Boopy user, joining their workspace + billing state.
-- Read-gated to admin_users members only (exists() check below).
create view public.admin_user_directory as
select
  u.id as user_id,
  u.email,
  u.created_at as joined_at,
  w.id as workspace_id,
  w.name as workspace_name,
  coalesce(wb.plan, 'free') as plan,
  wb.status as billing_status,
  wb.stripe_customer_id,
  wb.stripe_subscription_id,
  wb.admin_paused
from auth.users u
left join public.workspaces w on w.owner_user_id = u.id
left join public.workspace_billing wb on wb.workspace_id = w.id
where exists (select 1 from public.admin_users au where au.user_id = auth.uid());

-- Faithful port of the v1 /api/admin/alerts logic (churned Pro + free workspaces
-- near the 3-subscription limit), as a single queryable view instead of Node-side
-- batched auth.admin.getUserById calls.
create view public.admin_alerts as
select
  'churned_pro' as alert_type,
  w.id as workspace_id,
  w.name as workspace_name,
  u.email,
  'Pro subscription canceled' as detail
from public.workspace_billing wb
join public.workspaces w on w.id = wb.workspace_id
join auth.users u on u.id = w.owner_user_id
where wb.plan = 'pro'
  and wb.status = 'canceled'
  and exists (select 1 from public.admin_users au where au.user_id = auth.uid())
union all
select
  'near_free_limit' as alert_type,
  w.id as workspace_id,
  w.name as workspace_name,
  u.email,
  concat(active_counts.active_count, '/3 active subscriptions (Free plan)') as detail
from (
  select g.workspace_id, count(*) as active_count
  from public.groups g
  join public.subscriptions s on s.group_id = g.id
  where s.status = 'active'
  group by g.workspace_id
  having count(*) >= 2
) active_counts
join public.workspaces w on w.id = active_counts.workspace_id
join auth.users u on u.id = w.owner_user_id
left join public.workspace_billing wb on wb.workspace_id = w.id
where coalesce(wb.plan, 'free') = 'free'
  and exists (select 1 from public.admin_users au where au.user_id = auth.uid());
