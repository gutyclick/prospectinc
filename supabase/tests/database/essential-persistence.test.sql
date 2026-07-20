begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

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

select * from finish();
rollback;
