alter table public.searches
  add column if not exists provisional_website_count integer not null default 0
    check (provisional_website_count >= 0 and provisional_website_count <= results_count),
  add column if not exists no_website_count integer not null default 0
    check (no_website_count >= 0 and no_website_count <= results_count);

alter table public.prospects
  add column if not exists website_url_source text
    check (website_url_source in ('google_places_cache', 'official_website', 'manual')),
  add column if not exists website_url_verified_at timestamptz;

alter table public.contact_points drop constraint if exists contact_points_source_type_check;
alter table public.contact_points
  add constraint contact_points_source_type_check
    check (source_type in ('google_places', 'official_website', 'website', 'manual', 'directory', 'social', 'unknown'));

create or replace function public.persist_discovery_results_for_owner(
  search_record_id uuid,
  expected_owner_id uuid,
  discovered jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_search public.searches;
  business jsonb;
  target_id uuid;
  inserted integer := 0;
  deduplicated integer := 0;
  opportunities integer := 0;
  provisional_websites integer := 0;
  without_website integer := 0;
  score smallint;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Esta función requiere el rol de servicio';
  end if;

  select * into current_search
  from public.searches
  where id = search_record_id and owner_id = expected_owner_id
  for update;

  if current_search.id is null then raise exception 'La búsqueda no existe'; end if;

  for business in select * from jsonb_array_elements(discovered)
  loop
    score := case when nullif(business ->> 'websiteUrl', '') is null then 85 else 55 end;
    if score >= 80 then opportunities := opportunities + 1; end if;
    if nullif(business ->> 'websiteUrl', '') is null then
      without_website := without_website + 1;
    else
      provisional_websites := provisional_websites + 1;
    end if;

    select id into target_id
    from public.prospects
    where owner_id = expected_owner_id
      and google_place_id = business ->> 'placeId';

    if target_id is null then
      insert into public.prospects (
        owner_id, search_id, google_place_id, business_name, niche, city, country,
        website_url, website_url_source, website_status, opportunity_score,
        commercial_status, recommended_offer, ai_summary, detected_opportunities
      ) values (
        expected_owner_id,
        search_record_id,
        business ->> 'placeId',
        business ->> 'displayName',
        current_search.query,
        current_search.location,
        current_search.country,
        nullif(business ->> 'websiteUrl', ''),
        case when nullif(business ->> 'websiteUrl', '') is null then null else 'google_places_cache' end,
        case when nullif(business ->> 'websiteUrl', '') is null
          then 'sin-sitio'::public.website_status
          else 'desconocido'::public.website_status end,
        score,
        'nuevo',
        case when score >= 80
          then 'Crear una presencia web profesional'
          else 'Verificar y auditar el sitio oficial' end,
        'Negocio descubierto mediante Google Places. Datos pendientes de verificación independiente.',
        case when score >= 80
          then array['Google Places no devolvió un sitio web; requiere verificación']
          else array['Sitio provisional pendiente de análisis independiente'] end
      ) returning id into target_id;
      inserted := inserted + 1;
    else
      update public.prospects
      set search_id = search_record_id,
          website_url = case
            when website_url_verified_at is null then nullif(business ->> 'websiteUrl', '')
            else website_url end,
          website_url_source = case
            when website_url_verified_at is null and nullif(business ->> 'websiteUrl', '') is not null
              then 'google_places_cache'
            else website_url_source end
      where id = target_id and owner_id = expected_owner_id;
      deduplicated := deduplicated + 1;
    end if;
  end loop;

  update public.searches
  set results_count = jsonb_array_length(discovered),
      opportunities_count = opportunities,
      inserted_count = inserted,
      deduplicated_count = deduplicated,
      provisional_website_count = provisional_websites,
      no_website_count = without_website,
      provider_call_count = provider_call_count + 1
  where id = search_record_id and owner_id = expected_owner_id;

  insert into public.activities (owner_id, type, description, metadata)
  values (
    expected_owner_id,
    'busqueda',
    'Google Places devolvió ' || jsonb_array_length(discovered) || ' identificadores de negocio.',
    jsonb_build_object(
      'search_id', search_record_id,
      'provider', 'google-places-text-search-new',
      'requests', 1,
      'inserted', inserted,
      'deduplicated', deduplicated,
      'cache_ttl_hours', 24
    )
  );

  return jsonb_build_object(
    'inserted', inserted,
    'deduplicated', deduplicated,
    'opportunities', opportunities,
    'provisionalWebsites', provisional_websites,
    'withoutWebsite', without_website
  );
end;
$$;

revoke all on function public.persist_discovery_results_for_owner(uuid, uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.persist_discovery_results_for_owner(uuid, uuid, jsonb)
  to service_role;

drop function if exists public.persist_discovery_results(uuid, jsonb);
