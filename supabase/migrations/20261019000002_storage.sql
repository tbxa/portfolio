-- =============================================================================
-- Storage: imagens (projetos, foto, OG) e currículo em PDF.
-- Buckets públicos para leitura via URL; escrita somente por administradores.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 8388608,
    array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif']),
  ('resume', 'resume', true, 10485760,
    array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "storage: admin envia arquivos"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('media', 'resume') and (select public.is_admin()));

create policy "storage: admin atualiza arquivos"
  on storage.objects for update to authenticated
  using (bucket_id in ('media', 'resume') and (select public.is_admin()))
  with check (bucket_id in ('media', 'resume') and (select public.is_admin()));

create policy "storage: admin remove arquivos"
  on storage.objects for delete to authenticated
  using (bucket_id in ('media', 'resume') and (select public.is_admin()));

-- Necessária para upsert/listagem pelo painel. Visitantes leem pela URL pública.
create policy "storage: admin lista arquivos"
  on storage.objects for select to authenticated
  using (bucket_id in ('media', 'resume') and (select public.is_admin()));
