alter table public.documents
add column if not exists parse_error text,
add column if not exists parsed_at timestamptz;

update public.documents
set parsed_at = coalesce(parsed_at, updated_at, created_at)
where parse_status = 'parsed'
  and parsed_at is null;

alter table public.documents
drop constraint if exists documents_parse_status_check;

alter table public.documents
add constraint documents_parse_status_check
check (parse_status in ('pending', 'processing', 'parsed', 'failed'));
