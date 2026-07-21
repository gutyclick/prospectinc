create or replace function public.prepare_proposal_conversation(proposal_id uuid)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare target public.proposals; selected_channel public.conversation_channel; result_id uuid;
begin
  select * into target from public.proposals where id = proposal_id and owner_id = auth.uid() and status = 'lista';
  if target.id is null then raise exception 'La propuesta no está lista'; end if;
  if exists (select 1 from public.contact_points where owner_id = auth.uid() and prospect_id = target.prospect_id and type = 'email' and is_public and not do_not_contact and verification_status = 'verificado' and source_url <> '') then
    selected_channel := 'correo';
  elsif exists (select 1 from public.contact_points where owner_id = auth.uid() and prospect_id = target.prospect_id and type = 'whatsapp' and is_public and not do_not_contact and verification_status = 'verificado' and source_url <> '') then
    selected_channel := 'whatsapp';
  else return null;
  end if;
  insert into public.conversations (owner_id, prospect_id, proposal_id, channel, status, next_action, last_activity_at)
  values (auth.uid(), target.prospect_id, target.id, selected_channel, 'sin-contactar', 'Preparar contacto manual', now())
  on conflict (owner_id, prospect_id, channel) do update set proposal_id = excluded.proposal_id, next_action = case when public.conversations.status = 'sin-contactar' then excluded.next_action else public.conversations.next_action end
  returning id into result_id;
  return result_id;
end;
$$;

grant execute on function public.prepare_proposal_conversation(uuid) to authenticated;
