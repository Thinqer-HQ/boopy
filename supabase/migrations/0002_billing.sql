create table public.workspace_billing (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'free',
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_billing_plan_check check (plan in ('free', 'pro'))
);

create trigger trg_workspace_billing_set_updated_at
before update on public.workspace_billing
for each row
execute function public.set_updated_at();

alter table public.workspace_billing enable row level security;

create policy "workspace_billing_owner_read"
on public.workspace_billing
for select
using (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_billing.workspace_id
      and w.owner_user_id = auth.uid()
  )
);

create or replace function public.workspace_plan(input_workspace_id uuid)
returns text
language sql
stable
as $$
  select coalesce(
    (select wb.plan from public.workspace_billing wb where wb.workspace_id = input_workspace_id limit 1),
    'free'
  );
$$;

create or replace function public.enforce_client_limit()
returns trigger
language plpgsql
as $$
declare
  plan_value text;
  current_count integer;
begin
  plan_value := public.workspace_plan(new.workspace_id);
  select count(*) into current_count from public.clients where workspace_id = new.workspace_id;

  if plan_value = 'free' and current_count >= 3 then
    raise exception 'Free plan allows up to 3 clients. Upgrade to Pro to add more.';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_subscription_limit()
returns trigger
language plpgsql
as $$
declare
  target_workspace_id uuid;
  plan_value text;
  current_count integer;
begin
  select workspace_id into target_workspace_id from public.clients where id = new.client_id;
  if target_workspace_id is null then
    raise exception 'Client not found for subscription insert';
  end if;

  plan_value := public.workspace_plan(target_workspace_id);

  select count(*) into current_count
  from public.subscriptions s
  join public.clients c on c.id = s.client_id
  where c.workspace_id = target_workspace_id;

  if plan_value = 'free' and current_count >= 30 then
    raise exception 'Free plan allows up to 30 subscriptions. Upgrade to Pro to add more.';
  end if;

  return new;
end;
$$;

create trigger trg_clients_enforce_limit
before insert on public.clients
for each row
execute function public.enforce_client_limit();

create trigger trg_subscriptions_enforce_limit
before insert on public.subscriptions
for each row
execute function public.enforce_subscription_limit();
