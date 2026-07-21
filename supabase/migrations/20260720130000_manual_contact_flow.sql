create unique index if not exists conversations_owner_prospect_channel_idx
  on public.conversations (owner_id, prospect_id, channel);

create or replace function public.record_manual_outreach(
  proposal_id uuid,
  contact_point_id uuid,
  outreach_channel public.conversation_channel,
  message_subject text,
  message_body text,
  allow_repeat boolean default false,
  daily_limit integer default 25,
  follow_up_time timestamptz default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_proposal public.proposals;
  target_contact public.contact_points;
  conversation_id uuid;
  normalized_channel text;
  sent_today integer;
begin
  if daily_limit < 1 or daily_limit > 500 then raise exception 'Límite diario inválido'; end if;
  if length(trim(message_body)) = 0 then raise exception 'El mensaje no puede estar vacío'; end if;

  select * into target_proposal from public.proposals
  where id = proposal_id and owner_id = auth.uid() and status in ('lista', 'enviada');
  if target_proposal.id is null then raise exception 'La propuesta debe estar revisada y lista'; end if;

  select * into target_contact from public.contact_points
  where id = contact_point_id and owner_id = auth.uid() and prospect_id = target_proposal.prospect_id
    and is_public and not do_not_contact and verification_status = 'verificado' and source_url <> '';
  if target_contact.id is null then raise exception 'El contacto no es público, verificable o utilizable'; end if;

  normalized_channel := case when outreach_channel = 'correo' then 'email' else 'whatsapp' end;
  if target_contact.type::text <> normalized_channel then raise exception 'El contacto no corresponde al canal'; end if;
  if exists (select 1 from public.exclusion_list e where e.owner_id = auth.uid() and e.contact_type::text = normalized_channel and e.normalized_value = target_contact.normalized_value) then
    raise exception 'El contacto está excluido';
  end if;

  select count(*) into sent_today from public.messages
  where owner_id = auth.uid() and direction = 'saliente' and occurred_at >= date_trunc('day', now());
  if sent_today >= daily_limit then raise exception 'Se alcanzó el límite diario de contactos'; end if;
  if not allow_repeat and exists (
    select 1 from public.messages m join public.conversations c on c.id = m.conversation_id
    where m.owner_id = auth.uid() and m.direction = 'saliente' and c.prospect_id = target_proposal.prospect_id
      and c.channel = outreach_channel and m.occurred_at >= now() - interval '7 days'
  ) then raise exception 'Existe un contacto reciente; confirma antes de repetir'; end if;

  insert into public.conversations (owner_id, prospect_id, proposal_id, channel, status, last_activity_at, next_action, follow_up_at)
  values (auth.uid(), target_proposal.prospect_id, target_proposal.id, outreach_channel,
    case when follow_up_time is null then 'esperando-respuesta' else 'seguimiento' end,
    now(), case when follow_up_time is null then 'Esperar respuesta' else 'Realizar seguimiento programado' end, follow_up_time)
  on conflict (owner_id, prospect_id, channel) do update set
    proposal_id = excluded.proposal_id, status = excluded.status, last_activity_at = now(), next_action = excluded.next_action, follow_up_at = excluded.follow_up_at
  returning id into conversation_id;

  insert into public.messages (owner_id, conversation_id, direction, channel, subject, body, occurred_at)
  values (auth.uid(), conversation_id, 'saliente', outreach_channel, nullif(trim(message_subject), ''), message_body, now());
  update public.prospects set commercial_status = 'contactado' where id = target_proposal.prospect_id and owner_id = auth.uid();
  update public.proposals set status = 'enviada', sent_at = coalesce(sent_at, now()) where id = target_proposal.id and owner_id = auth.uid();
  insert into public.activities (owner_id, prospect_id, type, description, metadata)
  values (auth.uid(), target_proposal.prospect_id, 'contacto', 'Contacto marcado manualmente como enviado.', jsonb_build_object('channel', outreach_channel, 'proposalId', target_proposal.id));
  return conversation_id;
end;
$$;

create or replace function public.record_manual_inbound(conversation_id uuid, message_body text)
returns void language plpgsql security invoker set search_path = '' as $$
declare current_conversation public.conversations;
begin
  if length(trim(message_body)) = 0 then raise exception 'La respuesta no puede estar vacía'; end if;
  select * into current_conversation from public.conversations where id = conversation_id and owner_id = auth.uid();
  if current_conversation.id is null then raise exception 'La conversación no existe'; end if;
  insert into public.messages (owner_id, conversation_id, direction, channel, body, occurred_at)
  values (auth.uid(), conversation_id, 'entrante', current_conversation.channel, message_body, now());
  update public.conversations set status = 'respondio', last_activity_at = now(), next_action = 'Revisar la respuesta recibida' where id = conversation_id and owner_id = auth.uid();
  update public.prospects set commercial_status = 'respondio' where id = current_conversation.prospect_id and owner_id = auth.uid();
  insert into public.activities (owner_id, prospect_id, type, description, metadata)
  values (auth.uid(), current_conversation.prospect_id, 'respuesta', 'Respuesta recibida registrada manualmente.', jsonb_build_object('conversationId', conversation_id));
end;
$$;

grant execute on function public.record_manual_outreach(uuid, uuid, public.conversation_channel, text, text, boolean, integer, timestamptz) to authenticated;
grant execute on function public.record_manual_inbound(uuid, text) to authenticated;
