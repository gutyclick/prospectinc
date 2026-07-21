create extension if not exists pgcrypto with schema extensions;

create type public.search_status as enum ('borrador', 'pendiente', 'analizando', 'completada', 'fallida');
create type public.website_status as enum ('sin-sitio', 'desactualizado', 'solo-redes', 'basico', 'optimizado', 'desconocido');
create type public.commercial_status as enum ('nuevo', 'analizando', 'calificado', 'alta-prioridad', 'propuesta-lista', 'contactado', 'respondio', 'seguimiento', 'negociacion', 'ganado', 'descartado');
create type public.contact_point_type as enum ('email', 'phone', 'whatsapp', 'contact_form', 'instagram', 'facebook');
create type public.verification_status as enum ('pendiente', 'verificado', 'invalido');
create type public.audit_status as enum ('pendiente', 'analizando', 'completada', 'fallida');
create type public.proposal_status as enum ('borrador', 'lista', 'enviada', 'aceptada', 'negociacion', 'descartada');
create type public.conversation_channel as enum ('correo', 'whatsapp', 'telefono');
create type public.conversation_status as enum ('sin-contactar', 'esperando-respuesta', 'respondio', 'seguimiento', 'negociacion', 'ganada', 'cerrada');
create type public.message_direction as enum ('entrante', 'saliente');
create type public.integration_status as enum ('pendiente', 'conectada', 'error', 'revocada');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.enforce_owner_id()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is not null then
    new.owner_id = auth.uid();
  elsif new.owner_id is null then
    raise exception 'owner_id es obligatorio';
  end if;
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_normalized check (email = lower(trim(email)))
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, lower(new.email), new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
after insert or update of email on auth.users
for each row execute function public.handle_new_user();

create table public.searches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  query text not null check (length(trim(query)) >= 2),
  location text not null check (length(trim(location)) >= 2),
  result_limit integer not null check (result_limit between 1 and 500),
  sources text[] not null check (cardinality(sources) > 0),
  opportunity_filter text,
  status public.search_status not null default 'borrador',
  results_count integer not null default 0 check (results_count >= 0),
  opportunities_count integer not null default 0 check (opportunities_count >= 0 and opportunities_count <= results_count),
  external_run_id text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint searches_results_within_limit check (results_count <= result_limit),
  constraint searches_dates_ordered check (completed_at is null or started_at is null or completed_at >= started_at),
  constraint searches_owner_id_unique unique (owner_id, id)
);

create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  search_id uuid references public.searches(id) on delete set null,
  google_place_id text,
  business_name text not null check (length(trim(business_name)) >= 2),
  niche text not null check (length(trim(niche)) >= 2),
  primary_type text,
  formatted_address text,
  city text,
  country text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  website_url text,
  google_maps_url text,
  rating numeric(2,1) check (rating between 0 and 5),
  reviews_count integer check (reviews_count >= 0),
  website_status public.website_status not null default 'desconocido',
  opportunity_score smallint not null default 0 check (opportunity_score between 0 and 100),
  commercial_status public.commercial_status not null default 'nuevo',
  recommended_offer text,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prospects_owner_id_unique unique (owner_id, id),
  constraint prospects_search_owner_fk foreign key (owner_id, search_id) references public.searches(owner_id, id) on delete set null (search_id)
);

create table public.contact_points (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  type public.contact_point_type not null,
  value text not null check (length(trim(value)) > 0),
  normalized_value text not null check (length(trim(normalized_value)) > 0),
  source_url text not null check (source_url ~ '^https?://'),
  is_public boolean not null default true,
  confidence numeric(4,3) not null default 1 check (confidence between 0 and 1),
  verification_status public.verification_status not null default 'pendiente',
  do_not_contact boolean not null default false,
  first_detected_at timestamptz not null default now(),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  constraint contact_points_prospect_normalized_unique unique (prospect_id, type, normalized_value),
  constraint contact_points_prospect_owner_fk foreign key (owner_id, prospect_id) references public.prospects(owner_id, id) on delete cascade
);

create table public.website_audits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  status public.audit_status not null default 'pendiente',
  final_url text,
  http_status integer check (http_status between 100 and 599),
  uses_https boolean,
  has_viewport boolean,
  has_contact_form boolean,
  has_whatsapp boolean,
  has_booking boolean,
  has_social_links boolean,
  title text,
  meta_description text,
  copyright_year integer check (copyright_year between 1900 and 2200),
  broken_links_count integer check (broken_links_count >= 0),
  facts jsonb not null default '{}'::jsonb check (jsonb_typeof(facts) = 'object'),
  screenshot_path text,
  error_message text,
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint website_audits_prospect_owner_fk foreign key (owner_id, prospect_id) references public.prospects(owner_id, id) on delete cascade
);

create table public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  analysis_type text not null,
  model text not null,
  prompt_version text not null,
  input_hash text not null,
  structured_output jsonb not null check (jsonb_typeof(structured_output) = 'object'),
  input_tokens integer check (input_tokens >= 0),
  output_tokens integer check (output_tokens >= 0),
  created_at timestamptz not null default now(),
  constraint ai_analyses_input_unique unique (owner_id, prospect_id, analysis_type, prompt_version, input_hash),
  constraint ai_analyses_prospect_owner_fk foreign key (owner_id, prospect_id) references public.prospects(owner_id, id) on delete cascade
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  service text not null,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  status public.proposal_status not null default 'borrador',
  summary text not null,
  included_items text[] not null check (cardinality(included_items) > 0),
  recommended_angle text not null,
  delivery_time text not null,
  call_to_action text not null,
  gmail_draft_id text,
  gmail_thread_id text,
  sent_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint proposals_owner_id_unique unique (owner_id, id),
  constraint proposals_prospect_owner_fk foreign key (owner_id, prospect_id) references public.prospects(owner_id, id) on delete cascade
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  proposal_id uuid references public.proposals(id) on delete set null,
  channel public.conversation_channel not null,
  status public.conversation_status not null default 'sin-contactar',
  intent text,
  last_activity_at timestamptz not null default now(),
  next_action text,
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_owner_id_unique unique (owner_id, id),
  constraint conversations_prospect_owner_fk foreign key (owner_id, prospect_id) references public.prospects(owner_id, id) on delete cascade,
  constraint conversations_proposal_owner_fk foreign key (owner_id, proposal_id) references public.proposals(owner_id, id) on delete set null (proposal_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction public.message_direction not null,
  channel public.conversation_channel not null,
  external_message_id text,
  subject text,
  body text not null check (length(body) > 0),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint messages_external_unique unique (owner_id, channel, external_message_id),
  constraint messages_conversation_owner_fk foreign key (owner_id, conversation_id) references public.conversations(owner_id, id) on delete cascade
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  prospect_id uuid references public.prospects(id) on delete set null,
  type text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  constraint activities_prospect_owner_fk foreign key (owner_id, prospect_id) references public.prospects(owner_id, id) on delete set null (prospect_id)
);

create table public.exclusion_list (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contact_type public.contact_point_type not null,
  normalized_value text not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint exclusion_list_owner_contact_unique unique (owner_id, contact_type, normalized_value)
);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  status public.integration_status not null default 'pendiente',
  encrypted_access_token text,
  encrypted_refresh_token text,
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint integration_connections_owner_provider_unique unique (owner_id, provider)
);

create index searches_owner_created_idx on public.searches (owner_id, created_at desc);
create index searches_owner_status_idx on public.searches (owner_id, status);
create index prospects_owner_score_idx on public.prospects (owner_id, opportunity_score desc);
create index prospects_owner_status_idx on public.prospects (owner_id, commercial_status);
create unique index prospects_owner_place_unique on public.prospects (owner_id, google_place_id) where google_place_id is not null;
create index prospects_search_idx on public.prospects (search_id) where search_id is not null;
create index contact_points_owner_value_idx on public.contact_points (owner_id, normalized_value);
create index contact_points_prospect_idx on public.contact_points (prospect_id);
create index website_audits_prospect_created_idx on public.website_audits (prospect_id, created_at desc);
create index ai_analyses_prospect_created_idx on public.ai_analyses (prospect_id, created_at desc);
create index proposals_owner_status_idx on public.proposals (owner_id, status);
create index proposals_prospect_idx on public.proposals (prospect_id);
create index conversations_owner_activity_idx on public.conversations (owner_id, last_activity_at desc);
create index conversations_owner_followup_idx on public.conversations (owner_id, follow_up_at) where follow_up_at is not null;
create index messages_conversation_occurred_idx on public.messages (conversation_id, occurred_at);
create index activities_owner_created_idx on public.activities (owner_id, created_at desc);

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger searches_updated_at before update on public.searches for each row execute function public.set_updated_at();
create trigger prospects_updated_at before update on public.prospects for each row execute function public.set_updated_at();
create trigger proposals_updated_at before update on public.proposals for each row execute function public.set_updated_at();
create trigger conversations_updated_at before update on public.conversations for each row execute function public.set_updated_at();
create trigger integration_connections_updated_at before update on public.integration_connections for each row execute function public.set_updated_at();

do $$
declare table_name text;
begin
  foreach table_name in array array['searches','prospects','contact_points','website_audits','ai_analyses','proposals','conversations','messages','activities','exclusion_list','integration_connections']
  loop
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.enforce_owner_id()', table_name || '_enforce_owner', table_name);
  end loop;
end;
$$;

alter table public.profiles enable row level security;
alter table public.searches enable row level security;
alter table public.prospects enable row level security;
alter table public.contact_points enable row level security;
alter table public.website_audits enable row level security;
alter table public.ai_analyses enable row level security;
alter table public.proposals enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.activities enable row level security;
alter table public.exclusion_list enable row level security;
alter table public.integration_connections enable row level security;

create policy profiles_owner_all on public.profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

do $$
declare table_name text;
begin
  foreach table_name in array array['searches','prospects','contact_points','website_audits','ai_analyses','proposals','conversations','messages','activities','exclusion_list','integration_connections']
  loop
    execute format('create policy %I on public.%I for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid())', table_name || '_owner_all', table_name);
  end loop;
end;
$$;

revoke all on all tables in schema public from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.searches, public.prospects, public.contact_points, public.website_audits, public.ai_analyses, public.proposals, public.conversations, public.messages, public.activities, public.exclusion_list to authenticated;
revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
revoke all on public.integration_connections from authenticated;
grant select (id, owner_id, provider, status, token_expires_at, scopes, metadata, created_at, updated_at) on public.integration_connections to authenticated;

comment on table public.contact_points is 'Contactos empresariales públicos; source_url es obligatorio.';
comment on column public.integration_connections.encrypted_access_token is 'Solo server/service_role; nunca exponer al navegador.';
comment on column public.integration_connections.encrypted_refresh_token is 'Solo server/service_role; nunca exponer al navegador.';
