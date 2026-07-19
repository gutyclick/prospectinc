begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

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

select * from finish();
rollback;
