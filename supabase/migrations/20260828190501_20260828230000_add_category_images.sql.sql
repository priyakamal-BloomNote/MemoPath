/*
# Add customizable images to categories

1. Modified Tables
- `categories`
  - Add `images` (text[], nullable, default '{}') — stores an array of image URL strings the user has chosen for this category. Empty array means "use built-in defaults".

2. New Storage Buckets
- `category-images` — private bucket for user-uploaded category photos. Objects are stored under `<user_id>/<category_id>/<filename>` so storage policies can enforce folder ownership.

3. Security
- `categories` table: existing owner-scoped RLS policies already cover the new `images` column (UPDATE policy allows any column on owned rows). No new table policies needed.
- `category-images` bucket: RLS-style storage policies enforce that only the owner of a folder (matching auth.uid()) can insert, read, update, or delete objects in their folder.

4. Notes
- The `images` column is additive — no data loss for existing categories.
- When `images` is empty/NULL, the app falls back to the built-in default photos per category name.
*/

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';

INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "category_images_select_own" ON storage.objects;
CREATE POLICY "category_images_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'category-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "category_images_insert_own" ON storage.objects;
CREATE POLICY "category_images_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'category-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "category_images_update_own" ON storage.objects;
CREATE POLICY "category_images_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'category-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'category-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "category_images_delete_own" ON storage.objects;
CREATE POLICY "category_images_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'category-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
