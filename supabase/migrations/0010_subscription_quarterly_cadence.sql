-- Add quarterly billing cadence (calendar + spend normalization in app).
alter type public.subscription_cadence add value 'quarterly';

alter table public.parsed_candidates
  drop constraint if exists parsed_candidates_cadence_check;

alter table public.parsed_candidates
  add constraint parsed_candidates_cadence_check
  check (cadence is null or cadence in ('monthly', 'yearly', 'quarterly', 'custom'));
