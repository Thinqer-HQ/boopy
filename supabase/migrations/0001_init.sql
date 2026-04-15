-- Enable extensions
create extension if not exists "pgcrypto";

-- Utility: keep updated_at correct
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Check helper for positive integer arrays.
-- CHECK constraints cannot contain subqueries directly, so this wraps the
-- unnest + aggregate validation in an immutable function.
create or replace function public.int_array_all_positive(input_values int[])
returns boolean
language sql
immutable
as $$
  select coalesce(bool_and(v > 0), true)
  from unnest(input_values) as v;
$$;

-- Enums
create type public.subscription_status as enum ('active', 'paused', 'cancelled');
create type public.subscription_cadence as enum ('monthly', 'yearly', 'custom');
create type public.notification_job_status as enum ('pending', 'sent', 'failed');
create type public.notification_channel as enum ('email', 'push');

-- Workspaces
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_workspaces_set_updated_at
before update on public.workspaces
for each row
execute function public.set_updated_at();

-- Clients
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_clients_workspace_id on public.clients (workspace_id);

create trigger trg_clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  vendor_name text not null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  cadence public.subscription_cadence not null default 'monthly',
  renewal_date date not null,
  status public.subscription_status not null default 'active',
  category text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_amount_nonnegative check (amount >= 0),
  constraint subscriptions_currency_is_uppercase_code check (
    char_length(currency) >= 3 and upper(currency) = currency
  )
);

create index idx_subscriptions_client_id on public.subscriptions (client_id);

create trigger trg_subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

-- Notification preferences (workspace-level)
create table public.notification_prefs (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  lead_times_days int[] not null default array[7,3,1],
  email_enabled boolean not null default true,
  push_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_prefs_lead_times_positive check (
    public.int_array_all_positive(lead_times_days)
  )
);

create trigger trg_notification_prefs_set_updated_at
before update on public.notification_prefs
for each row
execute function public.set_updated_at();

-- Push subscriptions (per user+workspace)
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null,
  subscription_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index idx_push_subscriptions_workspace_id on public.push_subscriptions (workspace_id);
create index idx_push_subscriptions_user_id on public.push_subscriptions (user_id);

create trigger trg_push_subscriptions_set_updated_at
before update on public.push_subscriptions
for each row
execute function public.set_updated_at();

-- Notification jobs for idempotency + auditability
create table public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  channel public.notification_channel not null,
  lead_time_days int not null,
  renewal_date date not null,
  scheduled_for timestamptz not null,
  idempotency_key text not null,
  status public.notification_job_status not null default 'pending',
  attempt_count int not null default 0,
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_jobs_lead_time_positive check (lead_time_days > 0),
  constraint notification_jobs_workspace_idempotency_unique unique (workspace_id, idempotency_key)
);

create index idx_notification_jobs_workspace_id on public.notification_jobs (workspace_id);
create index idx_notification_jobs_subscription_id on public.notification_jobs (subscription_id);

create trigger trg_notification_jobs_set_updated_at
before update on public.notification_jobs
for each row
execute function public.set_updated_at();

-- Audit events
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_events_workspace_id on public.audit_events (workspace_id);

-- RLS
alter table public.workspaces enable row level security;
alter table public.clients enable row level security;
alter table public.subscriptions enable row level security;
alter table public.notification_prefs enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_jobs enable row level security;
alter table public.audit_events enable row level security;

-- Policies: owner-only (v1)
create policy "workspaces_owner_rw"
on public.workspaces
for all
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "clients_owner_rw"
on public.clients
for all
using (
  exists (
    select 1 from public.workspaces w
    where w.id = clients.workspace_id
      and w.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = clients.workspace_id
      and w.owner_user_id = auth.uid()
  )
);

create policy "subscriptions_owner_rw"
on public.subscriptions
for all
using (
  exists (
    select 1
    from public.clients c
    join public.workspaces w on w.id = c.workspace_id
    where c.id = subscriptions.client_id
      and w.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.clients c
    join public.workspaces w on w.id = c.workspace_id
    where c.id = subscriptions.client_id
      and w.owner_user_id = auth.uid()
  )
);

create policy "notification_prefs_owner_rw"
on public.notification_prefs
for all
using (
  exists (
    select 1 from public.workspaces w
    where w.id = notification_prefs.workspace_id
      and w.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = notification_prefs.workspace_id
      and w.owner_user_id = auth.uid()
  )
);

create policy "push_subscriptions_owner_rw"
on public.push_subscriptions
for all
using (
  exists (
    select 1 from public.workspaces w
    where w.id = push_subscriptions.workspace_id
      and w.owner_user_id = auth.uid()
  )
  and user_id = auth.uid()
)
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = push_subscriptions.workspace_id
      and w.owner_user_id = auth.uid()
  )
  and user_id = auth.uid()
);

create policy "notification_jobs_owner_read"
on public.notification_jobs
for select
using (
  exists (
    select 1 from public.workspaces w
    where w.id = notification_jobs.workspace_id
      and w.owner_user_id = auth.uid()
  )
);

create policy "audit_events_owner_read"
on public.audit_events
for select
using (
  exists (
    select 1 from public.workspaces w
    where w.id = audit_events.workspace_id
      and w.owner_user_id = auth.uid()
  )
);
