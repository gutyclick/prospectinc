begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000000011', 'one@example.test'),
  ('00000000-0000-4000-8000-000000000022', 'two@example.test');

insert into public.prospects (id, owner_id, google_place_id, business_name, niche)
values
  ('20000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000011', 'place-one', 'Negocio Uno', 'Prueba'),
  ('20000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000022', 'place-two', 'Negocio Dos', 'Prueba');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000011', true);
select results_eq(
  'select business_name from public.prospects order by business_name',
  $$values ('Negocio Uno'::text)$$,
  'RLS aísla los prospectos entre propietarios'
);
select is((select count(*) from public.profiles), 1::bigint, 'RLS aísla perfiles');
select lives_ok(
  $$insert into public.searches (owner_id, query, location, result_limit, sources) values ('00000000-0000-4000-8000-000000000022', 'Dentistas', 'Panamá', 10, array['google-places'])$$,
  'el trigger sustituye owner_id por auth.uid()'
);
select is((select owner_id from public.searches limit 1), '00000000-0000-4000-8000-000000000011'::uuid, 'owner_id queda ligado a la sesión');
select throws_ok(
  $$insert into public.prospects (owner_id, google_place_id, business_name, niche) values ('00000000-0000-4000-8000-000000000011', 'place-one', 'Duplicado', 'Prueba')$$,
  '23505', null, 'google_place_id no se duplica dentro de una cuenta'
);
select lives_ok(
  $$insert into public.prospects (owner_id, google_place_id, business_name, niche) values ('00000000-0000-4000-8000-000000000011', null, 'Sin Place Uno', 'Prueba'), ('00000000-0000-4000-8000-000000000011', null, 'Sin Place Dos', 'Prueba')$$,
  'varios prospectos sin google_place_id son válidos'
);
select throws_ok(
  $$insert into public.contact_points (owner_id, prospect_id, type, value, normalized_value, source_url) values ('00000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000022', 'email', 'x@example.test', 'x@example.test', 'https://example.test')$$,
  '23503', null, 'las relaciones no pueden cruzar propietarios'
);

insert into public.contact_points (owner_id, prospect_id, type, value, normalized_value, source_url)
values ('00000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000011', 'email', 'one@example.test', 'one@example.test', 'https://example.test/contacto');
select throws_ok(
  $$insert into public.contact_points (owner_id, prospect_id, type, value, normalized_value, source_url) values ('00000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000011', 'email', 'ONE@example.test', 'one@example.test', 'https://example.test/contacto')$$,
  '23505', null, 'un contacto normalizado no se duplica por prospecto'
);

reset role;
delete from public.prospects where id = '20000000-0000-4000-8000-000000000011';
select is((select count(*) from public.contact_points where prospect_id = '20000000-0000-4000-8000-000000000011'), 0::bigint, 'eliminar prospecto elimina contactos');
delete from auth.users where id = '00000000-0000-4000-8000-000000000022';
select is((select count(*) from public.prospects where owner_id = '00000000-0000-4000-8000-000000000022'), 0::bigint, 'eliminar usuario elimina sus datos');

select * from finish();
rollback;
