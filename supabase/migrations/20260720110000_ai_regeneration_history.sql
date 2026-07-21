alter table public.ai_analyses
  drop constraint if exists ai_analyses_input_unique;

create index if not exists ai_analyses_cache_lookup_idx
  on public.ai_analyses (owner_id, prospect_id, analysis_type, prompt_version, input_hash, created_at desc);
