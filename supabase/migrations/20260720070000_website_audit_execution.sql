alter table public.website_audits
  add column if not exists progress smallint not null default 0 check (progress between 0 and 100),
  add column if not exists result_status text check (result_status in ('no_website','unreachable','basic','outdated','functional','strong')),
  add column if not exists external_run_id text;

create unique index if not exists website_audits_one_active_per_prospect_idx
  on public.website_audits (owner_id, prospect_id)
  where status in ('pendiente', 'analizando');

drop policy if exists "Owners can read website audit screenshots" on storage.objects;
create policy "Owners can read website audit screenshots"
on storage.objects for select to authenticated
using (
  bucket_id = 'website-audits'
  and (storage.foldername(name))[1] = 'owners'
  and (storage.foldername(name))[2] = auth.uid()::text
);
