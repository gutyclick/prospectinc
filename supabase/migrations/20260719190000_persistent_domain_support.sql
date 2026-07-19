alter table public.prospects
  add column detected_opportunities text[] not null default '{}';

alter table public.conversations
  add column draft_response text not null default '';

create function public.mark_response_sent(
  conversation_id uuid,
  response_body text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_conversation public.conversations;
begin
  if length(trim(response_body)) = 0 then
    raise exception 'La respuesta no puede estar vacía';
  end if;

  select * into current_conversation
  from public.conversations
  where id = conversation_id and owner_id = auth.uid();

  if current_conversation.id is null then
    raise exception 'La conversación no existe';
  end if;

  insert into public.messages (
    owner_id, conversation_id, direction, channel, body, occurred_at
  ) values (
    auth.uid(), conversation_id, 'saliente', current_conversation.channel,
    response_body, now()
  );

  update public.conversations
  set status = 'esperando-respuesta',
      draft_response = '',
      last_activity_at = now(),
      next_action = 'Esperar respuesta y revisar el seguimiento'
  where id = conversation_id and owner_id = auth.uid();
end;
$$;

create function public.transition_conversation(
  conversation_id uuid,
  conversation_state public.conversation_status,
  commercial_state public.commercial_status,
  action_text text default null,
  follow_up_time timestamptz default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_prospect_id uuid;
begin
  select prospect_id into target_prospect_id
  from public.conversations
  where id = conversation_id and owner_id = auth.uid();

  if target_prospect_id is null then
    raise exception 'La conversación no existe';
  end if;

  update public.conversations
  set status = conversation_state,
      next_action = action_text,
      follow_up_at = follow_up_time
  where id = conversation_id and owner_id = auth.uid();

  update public.prospects
  set commercial_status = commercial_state
  where id = target_prospect_id and owner_id = auth.uid();
end;
$$;

grant execute on function public.mark_response_sent(uuid, text) to authenticated;
grant execute on function public.transition_conversation(uuid, public.conversation_status, public.commercial_status, text, timestamptz) to authenticated;

create function public.import_demo_data()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare imported integer;
begin
  insert into public.prospects (owner_id, google_place_id, business_name, niche, formatted_address, city, country, website_status, opportunity_score, commercial_status, recommended_offer, ai_summary, detected_opportunities)
  values
    (auth.uid(), 'demo-clinica-nova', 'Clínica Dental Nova', 'Odontología', 'Ciudad de Panamá, Panamá', 'Ciudad de Panamá', 'Panamá', 'sin-sitio', 94, 'alta-prioridad', 'Landing con reservas', 'Negocio demo con una oportunidad clara de reservas digitales.', array['Crear presencia web', 'Incorporar reservas online']),
    (auth.uid(), 'demo-taller-automax', 'Taller AutoMax', 'Taller automotriz', 'San Miguelito, Panamá', 'San Miguelito', 'Panamá', 'desactualizado', 89, 'calificado', 'Web + WhatsApp', 'Negocio demo con sitio desactualizado y contacto directo.', array['Modernizar el sitio', 'Destacar servicios y WhatsApp']),
    (auth.uid(), 'demo-restaurante-toscana', 'Restaurante La Toscana', 'Restaurante', 'Panamá Oeste, Panamá', 'La Chorrera', 'Panamá', 'solo-redes', 84, 'nuevo', 'Landing + menú', 'Negocio demo que depende de redes sociales.', array['Publicar menú web', 'Facilitar reservas'])
  on conflict (owner_id, google_place_id) where google_place_id is not null do nothing;
  get diagnostics imported = row_count;

  if imported > 0 then
    insert into public.activities (owner_id, type, description, metadata)
    values (auth.uid(), 'prospecto', imported || ' prospectos demo importados.', jsonb_build_object('source', 'explicit-demo-import'));
  end if;
  return imported;
end;
$$;

grant execute on function public.import_demo_data() to authenticated;

create function public.create_manual_prospect(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare prospect_id uuid;
declare contact jsonb;
begin
  if jsonb_array_length(coalesce(payload -> 'contacts', '[]'::jsonb)) > 0
     and coalesce(payload ->> 'contact_source_url', '') = '' then
    raise exception 'Todo contacto debe conservar su URL de origen';
  end if;

  insert into public.prospects (owner_id, business_name, niche, formatted_address, website_url, website_status, opportunity_score, commercial_status, recommended_offer, ai_summary, detected_opportunities)
  values (auth.uid(), payload ->> 'business_name', payload ->> 'niche', payload ->> 'location', nullif(payload ->> 'website_url', ''), (payload ->> 'website_status')::public.website_status, (payload ->> 'opportunity_score')::smallint, 'nuevo', 'Auditoría digital y propuesta web personalizada', 'Prospecto añadido manualmente. Pendiente de análisis.', array['Revisar la presencia digital declarada', 'Validar el contacto público y su fuente', 'Preparar una oferta ajustada al nicho'])
  returning id into prospect_id;

  for contact in select * from jsonb_array_elements(coalesce(payload -> 'contacts', '[]'::jsonb))
  loop
    insert into public.contact_points (owner_id, prospect_id, type, value, normalized_value, source_url, is_public)
    values (auth.uid(), prospect_id, (contact ->> 'type')::public.contact_point_type, contact ->> 'value', lower(trim(contact ->> 'value')), payload ->> 'contact_source_url', true);
  end loop;
  return prospect_id;
end;
$$;

grant execute on function public.create_manual_prospect(jsonb) to authenticated;
