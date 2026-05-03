-- Add quarterly billing cadence (calendar + spend normalization in app).
do $enum$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on e.enumtypid = t.oid
    join pg_namespace n on t.typnamespace = n.oid
    where n.nspname = 'public'
      and t.typname = 'subscription_cadence'
      and e.enumlabel = 'quarterly'
  ) then
    alter type public.subscription_cadence add value 'quarterly';
  end if;
end
$enum$;

-- Documents pipeline table may not exist on all deployments.
do $parsed$
begin
  if to_regclass('public.parsed_candidates') is not null then
    execute 'alter table public.parsed_candidates drop constraint if exists parsed_candidates_cadence_check';
    execute
      'alter table public.parsed_candidates add constraint parsed_candidates_cadence_check check (cadence is null or cadence in (''monthly'', ''yearly'', ''quarterly'', ''custom''))';
  end if;
end
$parsed$;
