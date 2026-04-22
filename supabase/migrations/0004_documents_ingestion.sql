create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  uploader_user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  parse_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_parse_status_check check (parse_status in ('pending', 'parsed', 'failed'))
);

create table if not exists public.parsed_subscription_candidates (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  vendor_name text,
  amount numeric(12, 2),
  currency text,
  cadence text,
  renewal_date date,
  confidence numeric(5, 4) not null default 0,
  raw_payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_subscription_id uuid references public.subscriptions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parsed_candidates_status_check check (status in ('pending', 'confirmed', 'rejected')),
  constraint parsed_candidates_cadence_check check (cadence is null or cadence in ('monthly', 'yearly', 'custom'))
);

create index if not exists idx_documents_workspace_id on public.documents (workspace_id);
create index if not exists idx_candidates_workspace_id on public.parsed_subscription_candidates (workspace_id);
create index if not exists idx_candidates_status on public.parsed_subscription_candidates (status);

create trigger trg_documents_set_updated_at
before update on public.documents
for each row
execute function public.set_updated_at();

create trigger trg_candidates_set_updated_at
before update on public.parsed_subscription_candidates
for each row
execute function public.set_updated_at();

alter table public.documents enable row level security;
alter table public.parsed_subscription_candidates enable row level security;

create policy "documents_owner_rw"
on public.documents
for all
using (
  exists (
    select 1 from public.workspaces w
    where w.id = documents.workspace_id and w.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = documents.workspace_id and w.owner_user_id = auth.uid()
  )
);

create policy "parsed_candidates_owner_rw"
on public.parsed_subscription_candidates
for all
using (
  exists (
    select 1 from public.workspaces w
    where w.id = parsed_subscription_candidates.workspace_id and w.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = parsed_subscription_candidates.workspace_id and w.owner_user_id = auth.uid()
  )
);
