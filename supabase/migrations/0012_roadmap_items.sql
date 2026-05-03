-- Product roadmap entries (marketing / feature status). Managed in Supabase; app users read published rows.
create type public.roadmap_feature_status as enum (
  'shipped',
  'planned',
  'considering',
  'feedback'
);

create table public.roadmap_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  feature_status public.roadmap_feature_status not null,
  link_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roadmap_items_title_length check (char_length(trim(title)) > 0),
  constraint roadmap_items_link_url_length check (link_url is null or char_length(link_url) <= 2048)
);

create index idx_roadmap_items_published_status_order
  on public.roadmap_items (is_published, feature_status, sort_order, id);

create trigger trg_roadmap_items_set_updated_at
before update on public.roadmap_items
for each row
execute function public.set_updated_at();

alter table public.roadmap_items enable row level security;

create policy "roadmap_items_authenticated_read_published"
on public.roadmap_items
for select
to authenticated
using (is_published = true);

-- Seed defaults (edit or replace via Supabase dashboard / SQL).
insert into public.roadmap_items (title, description, feature_status, link_url, sort_order) values
  (
    'Subscription term dates',
    'Start and optional end dates for bounded billing, calendar, and reminders.',
    'shipped',
    null,
    0
  ),
  (
    'Calendar recurrence',
    'Monthly, quarterly, yearly, and custom cadences on the renewal calendar.',
    'shipped',
    null,
    1
  ),
  (
    'Exports & Google Calendar',
    'CSV, XLSX, PDF, Google Sheets, and Google Calendar sync.',
    'shipped',
    null,
    2
  ),
  (
    'Team workspaces',
    'Shared groups and collaboration across accounts.',
    'considering',
    null,
    0
  ),
  (
    'Bulk CSV import',
    'Import subscriptions from bank or card export files.',
    'considering',
    null,
    1
  ),
  (
    'Spend forecasting',
    'What-if scenarios and renewal projections.',
    'planned',
    null,
    0
  ),
  (
    'Share feedback',
    'Tell us what would make renewals painless—we read every request.',
    'feedback',
    null,
    0
  ),
  (
    'Boopy Assistant (Pro)',
    'Suggest improvements from inside the app using your workspace context.',
    'feedback',
    null,
    1
  );
