alter table public.profiles
  add column if not exists timezone text not null default 'America/Panama';

alter table public.searches
  add column if not exists qualified_count integer generated always as (opportunities_count) stored;

alter table public.prospects
  add column if not exists official_website_url text generated always as (website_url) stored;

alter table public.contact_points
  add column if not exists source_type text not null default 'unknown',
  add constraint contact_points_source_type_check
    check (source_type in ('google_places', 'website', 'manual', 'directory', 'social', 'unknown'));

create or replace function public.classify_contact_source()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.source_type = 'unknown' then
    new.source_type := case
      when new.source_url ~* '^https?://([^/]+\.)?google\.[^/]+/maps' then 'google_places'
      when new.type in ('instagram', 'facebook') then 'social'
      else 'website'
    end;
  end if;
  return new;
end;
$$;

create trigger classify_contact_source_before_write
before insert or update of source_url, type, source_type on public.contact_points
for each row execute function public.classify_contact_source();

update public.contact_points
set source_type = 'unknown'
where source_type = 'unknown';

alter table public.website_audits
  add column if not exists initial_url text,
  add column if not exists has_mobile_viewport boolean,
  add column if not exists has_services_content boolean,
  add column if not exists has_meta_description boolean;

update public.website_audits
set initial_url = coalesce(initial_url, facts ->> 'initialUrl', final_url),
    has_mobile_viewport = coalesce(has_mobile_viewport, has_viewport),
    has_services_content = coalesce(has_services_content, (facts ->> 'hasServicesContent')::boolean),
    has_meta_description = coalesce(has_meta_description, meta_description is not null);

alter table public.proposals
  add column if not exists headline text,
  add column if not exists email_subject text,
  add column if not exists email_body text,
  add column if not exists whatsapp_message text;

create table public.place_discovery_cache (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  search_id uuid not null references public.searches(id) on delete cascade,
  google_place_id text not null check (length(trim(google_place_id)) > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  source text not null default 'google_places' check (source = 'google_places'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint place_discovery_cache_owner_id_unique unique (owner_id, id),
  constraint place_discovery_cache_search_owner_fk foreign key (owner_id, search_id)
    references public.searches(owner_id, id) on delete cascade,
  constraint place_discovery_cache_search_place_unique unique (search_id, google_place_id),
  constraint place_discovery_cache_expiration_check check (expires_at > created_at)
);

alter table public.place_discovery_cache enable row level security;

create policy "owners manage place discovery cache"
on public.place_discovery_cache
for all to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create trigger enforce_place_discovery_cache_owner
before insert or update on public.place_discovery_cache
for each row execute function public.enforce_owner_id();

create index place_discovery_cache_owner_expiry_idx
  on public.place_discovery_cache (owner_id, expires_at);
create index place_discovery_cache_search_idx
  on public.place_discovery_cache (search_id);

create or replace function public.delete_expired_place_discovery_cache()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  delete from public.place_discovery_cache
  where owner_id = auth.uid() and expires_at <= now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

grant select, insert, update, delete on public.place_discovery_cache to authenticated;
grant execute on function public.delete_expired_place_discovery_cache() to authenticated;

create index if not exists searches_owner_created_idx on public.searches (owner_id, created_at desc);
create index if not exists prospects_owner_score_idx on public.prospects (owner_id, opportunity_score desc);
create index if not exists prospects_owner_status_idx on public.prospects (owner_id, commercial_status);
create index if not exists ai_analyses_owner_input_hash_idx on public.ai_analyses (owner_id, input_hash);
create index if not exists activities_owner_created_idx on public.activities (owner_id, created_at desc);
