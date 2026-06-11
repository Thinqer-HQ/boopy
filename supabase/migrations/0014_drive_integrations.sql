-- Google Drive integration storage
create table public.drive_integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  root_folder_name text not null default 'Boopy',
  root_folder_id text,
  last_synced_at timestamptz,
  last_manual_sync_at timestamptz,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint drive_integrations_workspace_unique unique (workspace_id)
);

-- Track which Drive files have already been processed
create table public.drive_processed_files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  drive_file_id text not null,
  file_name text,
  processed_at timestamptz not null default now(),
  status text not null default 'processed', -- 'processed' | 'skipped' | 'failed'
  constraint drive_processed_files_workspace_file_unique unique (workspace_id, drive_file_id)
);

-- Inbox: files that were extracted but need review (no matching group, or low confidence)
create table public.subscription_drafts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source text not null default 'drive', -- 'drive' | 'chat'
  drive_file_id text,
  drive_file_name text,
  folder_name text,
  suggested_group_id uuid references public.groups(id) on delete set null,
  extracted_fields jsonb,
  status text not null default 'pending', -- 'pending' | 'accepted' | 'rejected'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.drive_integrations enable row level security;
alter table public.drive_processed_files enable row level security;
alter table public.subscription_drafts enable row level security;

create policy "owner_drive_integrations" on public.drive_integrations
  for all using (
    workspace_id in (select id from public.workspaces where owner_user_id = auth.uid())
  );

create policy "owner_drive_processed_files" on public.drive_processed_files
  for all using (
    workspace_id in (select id from public.workspaces where owner_user_id = auth.uid())
  );

create policy "owner_subscription_drafts" on public.subscription_drafts
  for all using (
    workspace_id in (select id from public.workspaces where owner_user_id = auth.uid())
  );
