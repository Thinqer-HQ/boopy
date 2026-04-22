alter type public.notification_channel add value if not exists 'slack';
alter type public.notification_channel add value if not exists 'discord';
alter type public.notification_channel add value if not exists 'webhook';

create table if not exists public.notification_destinations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel public.notification_channel not null,
  name text not null,
  target_url text,
  secret_header text,
  config jsonb not null default '{}'::jsonb,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_jobs
add column if not exists destination_id uuid references public.notification_destinations(id) on delete set null;

create table if not exists public.notification_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  destination_id uuid not null references public.notification_destinations(id) on delete cascade,
  lead_time_days int[] not null default '{1,3,7}',
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notification_destinations_workspace_id
on public.notification_destinations (workspace_id);

create index if not exists idx_notification_rules_workspace_id
on public.notification_rules (workspace_id);

create trigger trg_notification_destinations_set_updated_at
before update on public.notification_destinations
for each row
execute function public.set_updated_at();

create trigger trg_notification_rules_set_updated_at
before update on public.notification_rules
for each row
execute function public.set_updated_at();

alter table public.notification_destinations enable row level security;
alter table public.notification_rules enable row level security;

create policy "notification_destinations_owner_rw"
on public.notification_destinations
for all
using (
  exists (
    select 1 from public.workspaces w
    where w.id = notification_destinations.workspace_id and w.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = notification_destinations.workspace_id and w.owner_user_id = auth.uid()
  )
);

create policy "notification_rules_owner_rw"
on public.notification_rules
for all
using (
  exists (
    select 1 from public.workspaces w
    where w.id = notification_rules.workspace_id and w.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = notification_rules.workspace_id and w.owner_user_id = auth.uid()
  )
);
