-- Groups are now the primary parent for subscriptions.
-- Keep client_id for backward compatibility, but make it optional.
alter table public.subscriptions
alter column client_id drop not null;
