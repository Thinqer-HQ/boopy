-- Add per-item progress status to roadmap_items for in-app status badges.
alter table public.roadmap_items
  add column if not exists progress_status text
    check (progress_status is null or progress_status in ('planned', 'in-progress', 'doing', 'done'));
