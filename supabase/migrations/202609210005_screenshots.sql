begin;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('screenshots', 'screenshots', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']);
create policy "Admins upload screenshots" on storage.objects for insert to authenticated
with check (bucket_id = 'screenshots' and exists (select 1 from public.admins where user_id = (select auth.uid())));
create policy "Admins list screenshots" on storage.objects for select to authenticated
using (bucket_id = 'screenshots' and exists (select 1 from public.admins where user_id = (select auth.uid())));
create policy "Admins delete screenshots" on storage.objects for delete to authenticated
using (bucket_id = 'screenshots' and exists (select 1 from public.admins where user_id = (select auth.uid())));
commit;
