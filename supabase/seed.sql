-- Datos ficticios exclusivos del entorno local. No contienen secretos ni credenciales de acceso.
-- El usuario no tiene contraseña y debe crearse desde Studio para probar el inicio de sesión.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'owner@prospector.test',
  '',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Usuario local"}'::jsonb,
  now(),
  now()
);

insert into public.searches (id, owner_id, query, location, result_limit, sources, opportunity_filter, status, results_count, opportunities_count, started_at, completed_at)
values ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Clínicas dentales', 'Ciudad de Panamá', 20, array['google-places'], 'sin-web', 'completada', 4, 2, now() - interval '1 hour', now());

insert into public.prospects (id, owner_id, search_id, google_place_id, business_name, niche, primary_type, formatted_address, city, country, website_status, opportunity_score, commercial_status, recommended_offer)
values ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'dev-place-clinica-nova', 'Clínica Dental Nova (local)', 'Odontología', 'dentist', 'Dirección ficticia de desarrollo', 'Ciudad de Panamá', 'Panamá', 'sin-sitio', 91, 'alta-prioridad', 'Landing con reservas');

insert into public.contact_points (owner_id, prospect_id, type, value, normalized_value, source_url, is_public, verification_status)
values ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'contact_form', 'Formulario ficticio', 'https://example.test/contacto', 'https://example.test/contacto', true, 'pendiente');
