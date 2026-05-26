create table if not exists public.notification_digest_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel public.notification_channel not null,
  window_start timestamptz not null,
  window_end timestamptz not null,
  idempotency_key text not null,
  status text not null default 'pending',
  attempt_count int not null default 0,
  provider_message_id text,
  last_error text,
  last_attempt_at timestamptz,
  next_attempt_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_digest_runs_status_check check (status in ('pending', 'sent', 'failed')),
  constraint notification_digest_runs_workspace_window_unique unique (workspace_id, channel, window_start),
  constraint notification_digest_runs_workspace_idempotency_unique unique (workspace_id, idempotency_key),
  constraint notification_digest_runs_window_order check (window_end > window_start)
);

create index if not exists idx_notification_digest_runs_workspace_status
on public.notification_digest_runs (workspace_id, status, window_start);

create index if not exists idx_notification_digest_runs_next_attempt
on public.notification_digest_runs (next_attempt_at)
where status = 'pending';

create trigger trg_notification_digest_runs_set_updated_at
before update on public.notification_digest_runs
for each row
execute function public.set_updated_at();

alter table public.notification_digest_runs enable row level security;

create policy "notification_digest_runs_owner_read"
on public.notification_digest_runs
for select
using (
  exists (
    select 1 from public.workspaces w
    where w.id = notification_digest_runs.workspace_id
      and w.owner_user_id = auth.uid()
  )
);

