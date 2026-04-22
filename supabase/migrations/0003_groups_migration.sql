-- Groups replace clients as the primary container for subscriptions.
-- Keep clients/client_id for compatibility while we migrate UI/API paths.

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  notes text,
  legacy_client_id uuid unique references public.clients(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_groups_workspace_name_unique on public.groups (workspace_id, name);
create index if not exists idx_groups_workspace_id on public.groups (workspace_id);

create trigger trg_groups_set_updated_at
before update on public.groups
for each row
execute function public.set_updated_at();

alter table public.groups enable row level security;

create policy "groups_owner_rw"
on public.groups
for all
using (
  exists (
    select 1 from public.workspaces w
    where w.id = groups.workspace_id
      and w.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = groups.workspace_id
      and w.owner_user_id = auth.uid()
  )
);

alter table public.subscriptions
add column if not exists group_id uuid references public.groups(id) on delete cascade;

create index if not exists idx_subscriptions_group_id on public.subscriptions (group_id);

insert into public.groups (workspace_id, name, notes, legacy_client_id)
select c.workspace_id, c.name, c.notes, c.id
from public.clients c
where not exists (
  select 1 from public.groups g
  where g.legacy_client_id = c.id
);

update public.subscriptions s
set group_id = g.id
from public.groups g
where s.group_id is null
  and s.client_id is not null
  and g.legacy_client_id = s.client_id;

drop policy if exists "subscriptions_owner_rw" on public.subscriptions;

create policy "subscriptions_owner_rw"
on public.subscriptions
for all
using (
  exists (
    select 1
    from public.workspaces w
    left join public.groups g on g.workspace_id = w.id
    left join public.clients c on c.workspace_id = w.id
    where w.owner_user_id = auth.uid()
      and (
        (subscriptions.group_id is not null and g.id = subscriptions.group_id) or
        (subscriptions.client_id is not null and c.id = subscriptions.client_id)
      )
  )
)
with check (
  exists (
    select 1
    from public.workspaces w
    left join public.groups g on g.workspace_id = w.id
    left join public.clients c on c.workspace_id = w.id
    where w.owner_user_id = auth.uid()
      and (
        (subscriptions.group_id is not null and g.id = subscriptions.group_id) or
        (subscriptions.client_id is not null and c.id = subscriptions.client_id)
      )
  )
);

drop trigger if exists trg_clients_enforce_limit on public.clients;
drop trigger if exists trg_groups_enforce_limit on public.groups;

create or replace function public.enforce_group_limit()
returns trigger
language plpgsql
as $$
declare
  plan_value text;
  current_count integer;
begin
  plan_value := public.workspace_plan(new.workspace_id);
  select count(*) into current_count from public.groups where workspace_id = new.workspace_id;

  if plan_value = 'free' and current_count >= 3 then
    raise exception 'Free plan allows up to 3 groups. Upgrade to Pro to add more.';
  end if;

  return new;
end;
$$;

create trigger trg_groups_enforce_limit
before insert on public.groups
for each row
execute function public.enforce_group_limit();

create or replace function public.enforce_subscription_limit()
returns trigger
language plpgsql
as $$
declare
  target_workspace_id uuid;
  plan_value text;
  current_count integer;
begin
  if new.group_id is not null then
    select workspace_id into target_workspace_id from public.groups where id = new.group_id;
  elsif new.client_id is not null then
    select workspace_id into target_workspace_id from public.clients where id = new.client_id;
  end if;

  if target_workspace_id is null then
    raise exception 'Group or client not found for subscription insert';
  end if;

  plan_value := public.workspace_plan(target_workspace_id);

  select count(*) into current_count
  from public.subscriptions s
  left join public.groups g on g.id = s.group_id
  left join public.clients c on c.id = s.client_id
  where coalesce(g.workspace_id, c.workspace_id) = target_workspace_id;

  if plan_value = 'free' and current_count >= 30 then
    raise exception 'Free plan allows up to 30 subscriptions. Upgrade to Pro to add more.';
  end if;

  return new;
end;
$$;

