begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

insert into auth.users (id, email) values ('00000000-0000-4000-8000-000000000099', 'repository@example.test');
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000099', true);

select is(public.import_demo_data(), 3, 'la importación demo crea tres prospectos');
select is(public.import_demo_data(), 0, 'la importación demo es idempotente');

select lives_ok(
  $$select public.create_manual_prospect('{"business_name":"Manual","niche":"Prueba","location":"Panamá","website_url":null,"website_status":"sin-sitio","opportunity_score":80,"contact_source_url":"https://example.test/contacto","contacts":[{"type":"email","value":"public@example.test"}]}'::jsonb)$$,
  'el alta manual crea prospecto y contacto en una transacción'
);
select is((select count(*) from public.contact_points where normalized_value = 'public@example.test'), 1::bigint, 'el contacto manual conserva persistencia');

insert into public.conversations (id, owner_id, prospect_id, channel)
select '30000000-0000-4000-8000-000000000099', auth.uid(), id, 'correo'
from public.prospects where google_place_id = 'demo-clinica-nova';
select lives_ok($$select public.mark_response_sent('30000000-0000-4000-8000-000000000099', 'Respuesta persistente')$$, 'registrar respuesta actualiza conversación y mensaje');
select is((select count(*) from public.messages where conversation_id = '30000000-0000-4000-8000-000000000099'), 1::bigint, 'la respuesta queda persistida');

insert into public.searches (id, owner_id, query, location, country, result_limit, sources, status)
values ('40000000-0000-4000-8000-000000000099', auth.uid(), 'Dentistas', 'Panamá', 'Panamá', 20, array['google-places'], 'analizando');
select is((select progress from public.searches where id = '40000000-0000-4000-8000-000000000099'), 0::smallint, 'la búsqueda comienza sin progreso inventado');
update public.searches set query_fingerprint = 'fingerprint-activo' where id = '40000000-0000-4000-8000-000000000099';
select throws_ok(
  $$insert into public.searches (owner_id, query, location, result_limit, sources, status, query_fingerprint) values (auth.uid(), 'Dentistas', 'Panamá', 20, array['google-places'], 'pendiente', 'fingerprint-activo')$$,
  'una huella activa evita ejecuciones duplicadas'
);
select lives_ok(
  $$select public.persist_discovery_results('40000000-0000-4000-8000-000000000099', '[{"placeId":"place-real-1","displayName":"Clínica Real","formattedAddress":"Panamá","primaryType":"dentist","latitude":8.98,"longitude":-79.52,"websiteUrl":null,"phone":"+507 200-0000","sourceUrl":"https://maps.google.com/?cid=real-1","rating":4.5,"reviewsCount":10}]'::jsonb)$$,
  'la persistencia de descubrimiento es transaccional'
);
select is((select inserted_count from public.searches where id = '40000000-0000-4000-8000-000000000099'), 1, 'registra el negocio insertado');
select is((select source_url from public.contact_points where normalized_value = '+5072000000'), 'https://maps.google.com/?cid=real-1', 'el teléfono conserva la fuente atribuible');
select is((select count(*) from public.prospects where google_place_id = 'place-real-1'), 1::bigint, 'google_place_id evita duplicados por propietario');

select * from finish();
rollback;
