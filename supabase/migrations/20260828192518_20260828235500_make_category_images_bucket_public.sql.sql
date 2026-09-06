/*
# Make category-images bucket public for permanent URLs

1. Modified Storage Buckets
- `category-images` — changed from private to public so that uploaded image URLs are permanent (signed URLs expire after 10 minutes, causing images to disappear). Public read is safe because storage policies still restrict writes to the owner.

2. Security
- SELECT policy widened to allow public read (anyone can view images), since the bucket is now public.
- INSERT/UPDATE/DELETE policies remain owner-only (first folder must match auth.uid()).
*/

update storage.buckets set public = true where id = 'category-images';

drop policy if exists "category_images_select_own" on storage.objects;
create policy "category_images_select_any" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'category-images');

drop policy if exists "category_images_insert_own" on storage.objects;
create policy "category_images_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'category-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "category_images_update_own" on storage.objects;
create policy "category_images_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'category-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'category-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "category_images_delete_own" on storage.objects;
create policy "category_images_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'category-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
