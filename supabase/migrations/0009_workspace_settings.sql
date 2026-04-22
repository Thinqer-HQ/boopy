alter table public.workspaces
add column if not exists default_currency text not null default 'USD',
add column if not exists setup_completed_at timestamptz;

alter table public.workspaces
drop constraint if exists workspaces_default_currency_check;

alter table public.workspaces
add constraint workspaces_default_currency_check
check (
  char_length(default_currency) >= 3
  and upper(default_currency) = default_currency
);
