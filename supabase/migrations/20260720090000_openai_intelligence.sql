alter table public.proposals
  add column if not exists generated_content jsonb
  check (generated_content is null or jsonb_typeof(generated_content) = 'object');

create index if not exists ai_analyses_owner_created_idx
  on public.ai_analyses (owner_id, created_at desc);
