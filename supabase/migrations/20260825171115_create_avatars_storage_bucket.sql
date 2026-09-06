/*
# Create avatars storage bucket for profile pictures

1. Storage
- Creates a public bucket called `avatars` for storing user profile pictures.
- Sets file size limit to 2MB and restricts to image MIME types.

2. Security (RLS policies on storage.objects)
- SELECT: anyone can read avatar images (bucket is public).
- INSERT/UPDATE: authenticated users can only write to their own folder (`user_id/`).
- DELETE: authenticated users can only delete from their own folder.

3. Important notes
- The bucket is public so avatar URLs can be displayed without signed URLs.
- Each user uploads to a path prefixed with their own user ID, preventing collisions.
- MIME types restricted to jpeg, png, webp, gif for security.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow public read access to avatars
DROP POLICY IF EXISTS "public_read_avatars" ON storage.objects;
CREATE POLICY "public_read_avatars"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');

-- Allow authenticated users to insert into their own folder
DROP POLICY IF EXISTS "users_insert_own_avatar" ON storage.objects;
CREATE POLICY "users_insert_own_avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own folder
DROP POLICY IF EXISTS "users_update_own_avatar" ON storage.objects;
CREATE POLICY "users_update_own_avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete from their own folder
DROP POLICY IF EXISTS "users_delete_own_avatar" ON storage.objects;
CREATE POLICY "users_delete_own_avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
