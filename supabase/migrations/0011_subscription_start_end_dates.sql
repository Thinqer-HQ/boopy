-- Optional subscription term: when it started and when it ends (last billing date).
alter table public.subscriptions
  add column start_date date,
  add column end_date date;

alter table public.subscriptions
  add constraint subscriptions_start_before_end
  check (
    end_date is null
    or start_date is null
    or end_date >= start_date
  );
