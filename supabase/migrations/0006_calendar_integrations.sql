create table if not exists public.calendar_integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null default 'google',
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  calendar_id text not null default 'primary',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_integrations_provider_check check (provider in ('google')),
  constraint calendar_integrations_workspace_provider_unique unique (workspace_id, provider)
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  provider text not null default 'google',
  external_event_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_events_workspace_subscription_provider_unique unique (workspace_id, subscription_id, provider)
);

create index if not exists idx_calendar_integrations_workspace on public.calendar_integrations (workspace_id);
create index if not exists idx_calendar_events_workspace on public.calendar_events (workspace_id);

create trigger trg_calendar_integrations_set_updated_at
before update on public.calendar_integrations
for each row
execute function public.set_updated_at();

create trigger trg_calendar_events_set_updated_at
before update on public.calendar_events
for each row
execute function public.set_updated_at();

alter table public.calendar_integrations enable row level security;
alter table public.calendar_events enable row level security;

create policy "calendar_integrations_owner_rw"
on public.calendar_integrations
for all
using (
  exists (
    select 1 from public.workspaces w
    where w.id = calendar_integrations.workspace_id and w.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = calendar_integrations.workspace_id and w.owner_user_id = auth.uid()
  )
);

create policy "calendar_events_owner_rw"
on public.calendar_events
for all
using (
  exists (
    select 1 from public.workspaces w
    where w.id = calendar_events.workspace_id and w.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = calendar_events.workspace_id and w.owner_user_id = auth.uid()
  )
);
