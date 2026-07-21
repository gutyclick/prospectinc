alter table public.searches
  add column country text,
  add column query_fingerprint text,
  add column inserted_count integer not null default 0 check (inserted_count >= 0),
  add column deduplicated_count integer not null default 0 check (deduplicated_count >= 0),
  add column provider_call_count integer not null default 0 check (provider_call_count >= 0);

create index searches_recent_fingerprint_idx
  on public.searches (owner_id, query_fingerprint, created_at desc)
  where query_fingerprint is not null;

create function public.persist_discovery_results(
  search_record_id uuid,
  discovered jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_search public.searches;
  business jsonb;
  target_id uuid;
  inserted integer := 0;
  deduplicated integer := 0;
  opportunities integer := 0;
  score smallint;
  phone text;
  normalized_phone text;
begin
  select * into current_search
  from public.searches
  where id = search_record_id and owner_id = auth.uid()
  for update;

  if current_search.id is null then
    raise exception 'La búsqueda no existe';
  end if;

  for business in select * from jsonb_array_elements(discovered)
  loop
    score := case when nullif(business ->> 'websiteUrl', '') is null then 85 else 55 end;

    select id into target_id
    from public.prospects
    where owner_id = auth.uid()
      and google_place_id = business ->> 'placeId';

    if target_id is null then
      insert into public.prospects (
        owner_id, search_id, google_place_id, business_name, niche,
        primary_type, formatted_address, city, country, latitude, longitude,
        website_url, google_maps_url, rating, reviews_count, website_status,
        opportunity_score, commercial_status, recommended_offer, ai_summary,
        detected_opportunities
      ) values (
        auth.uid(), search_record_id, business ->> 'placeId',
        business ->> 'displayName', current_search.query,
        nullif(business ->> 'primaryType', ''),
        nullif(business ->> 'formattedAddress', ''), current_search.location,
        current_search.country,
        nullif(business ->> 'latitude', '')::double precision,
        nullif(business ->> 'longitude', '')::double precision,
        nullif(business ->> 'websiteUrl', ''), business ->> 'sourceUrl',
        nullif(business ->> 'rating', '')::numeric,
        nullif(business ->> 'reviewsCount', '')::integer,
        case when nullif(business ->> 'websiteUrl', '') is null
          then 'sin-sitio'::public.website_status
          else 'desconocido'::public.website_status end,
        score, 'nuevo',
        case when score >= 80 then 'Crear una presencia web profesional' else 'Auditar y mejorar la presencia digital' end,
        'Negocio descubierto mediante Google Places. Pendiente de revisión humana.',
        case when score >= 80 then array['No se encontró un sitio web público'] else array['Revisar la calidad del sitio web'] end
      ) returning id into target_id;
      inserted := inserted + 1;
    else
      update public.prospects set
        search_id = search_record_id,
        business_name = business ->> 'displayName',
        primary_type = nullif(business ->> 'primaryType', ''),
        formatted_address = nullif(business ->> 'formattedAddress', ''),
        latitude = nullif(business ->> 'latitude', '')::double precision,
        longitude = nullif(business ->> 'longitude', '')::double precision,
        website_url = nullif(business ->> 'websiteUrl', ''),
        google_maps_url = business ->> 'sourceUrl',
        rating = nullif(business ->> 'rating', '')::numeric,
        reviews_count = nullif(business ->> 'reviewsCount', '')::integer
      where id = target_id and owner_id = auth.uid();
      deduplicated := deduplicated + 1;
    end if;

    if score >= 80 then opportunities := opportunities + 1; end if;
    phone := nullif(trim(business ->> 'phone'), '');
    normalized_phone := regexp_replace(coalesce(phone, ''), '[^0-9+]', '', 'g');
    if phone is not null and normalized_phone <> '' then
      insert into public.contact_points (
        owner_id, prospect_id, type, value, normalized_value, source_url,
        is_public, first_detected_at, last_verified_at
      ) values (
        auth.uid(), target_id, 'phone', phone, normalized_phone,
        business ->> 'sourceUrl', true, now(), now()
      ) on conflict (prospect_id, type, normalized_value)
        do update set value = excluded.value, source_url = excluded.source_url,
          last_verified_at = now();
    end if;
  end loop;

  update public.searches set
    status = 'completada', results_count = jsonb_array_length(discovered),
    opportunities_count = opportunities, inserted_count = inserted,
    deduplicated_count = deduplicated, provider_call_count = provider_call_count + 1,
    completed_at = now(), error_message = null
  where id = search_record_id and owner_id = auth.uid();

  insert into public.activities (owner_id, type, description, metadata)
  values (
    auth.uid(), 'busqueda',
    'Búsqueda real completada: ' || inserted || ' negocios nuevos y ' || deduplicated || ' deduplicados.',
    jsonb_build_object('search_id', search_record_id, 'provider', 'google-places-new', 'calls', 1, 'inserted', inserted, 'deduplicated', deduplicated)
  );

  return jsonb_build_object('inserted', inserted, 'deduplicated', deduplicated, 'opportunities', opportunities);
end;
$$;

grant execute on function public.persist_discovery_results(uuid, jsonb) to authenticated;
