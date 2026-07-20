begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

select has_table('public', 'place_discovery_cache', 'existe la caché temporal de Places');
select has_column('public', 'profiles', 'timezone', 'el perfil conserva zona horaria');
select has_column('public', 'searches', 'qualified_count', 'la búsqueda expone conteo calificado');
select has_column('public', 'prospects', 'official_website_url', 'el prospecto expone sitio oficial');
select has_column('public', 'contact_points', 'source_type', 'el contacto conserva tipo de fuente');
select col_not_null('public', 'contact_points', 'source_url', 'la URL de origen es obligatoria');
select has_column('public', 'website_audits', 'initial_url', 'la auditoría conserva URL inicial');
select has_column('public', 'website_audits', 'has_services_content', 'la auditoría registra contenido de servicios');
select has_column('public', 'proposals', 'email_subject', 'la propuesta admite asunto de correo');
select has_function('public', 'delete_expired_place_discovery_cache', array[]::text[], 'existe limpieza de caché vencida');
select has_column('public', 'searches', 'provisional_website_count', 'la búsqueda cuenta sitios provisionales');
select has_column('public', 'searches', 'no_website_count', 'la búsqueda cuenta resultados sin sitio');
select has_column('public', 'prospects', 'website_url_source', 'el sitio conserva procedencia');
select col_not_null('public', 'place_discovery_cache', 'expires_at', 'la caché exige caducidad');

insert into auth.users (id, email)
values ('00000000-0000-4000-8000-000000000088', 'cache@example.test');
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000088', true);
insert into public.searches (id, owner_id, query, location, result_limit, sources)
values ('10000000-0000-4000-8000-000000000088', auth.uid(), 'Prueba', 'Panamá', 1, array['google-places']);
insert into public.place_discovery_cache (
  owner_id, search_id, google_place_id, payload, created_at, expires_at
) values (
  auth.uid(), '10000000-0000-4000-8000-000000000088', 'expired-place', '{}'::jsonb,
  now() - interval '2 hours', now() - interval '1 hour'
);
select is(public.delete_expired_place_discovery_cache(), 1, 'la limpieza elimina una entrada vencida');
select is((select count(*) from public.place_discovery_cache), 0::bigint, 'la caché vencida no permanece almacenada');

select * from finish();
rollback;
