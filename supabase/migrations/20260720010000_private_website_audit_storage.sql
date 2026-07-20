insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('website-audits', 'website-audits', false, 5242880, array['image/png'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "owners read their website audit captures"
on storage.objects for select to authenticated
using (
  bucket_id = 'website-audits'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Las escrituras se realizan exclusivamente con service_role desde tareas autorizadas.
