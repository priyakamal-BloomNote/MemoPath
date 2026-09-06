/*
# Fix profiles RLS policies to use user_id instead of id

## Problem
The `profiles` table has two identity columns:
- `id` (primary key, defaults to gen_random_uuid())
- `user_id` (defaults to auth.uid())

The original migration created the table with `id` referencing auth.users(id),
but the live schema drifted: `id` now defaults to a random UUID and a separate
`user_id` column was added with a default of auth.uid().

All existing RLS policies check `auth.uid() = id`, but since `id` is a random
UUID for most rows, these policies block every SELECT, UPDATE, and DELETE.
The profile page silently fails: updates affect 0 rows (no error returned),
so the UI shows "Profile updated" even though nothing was saved.

## Fix
1. Replace all profile policies to check `auth.uid() = user_id` instead of
   `auth.uid() = id`. Since `user_id` defaults to `auth.uid()`, this reliably
   identifies the owner.
2. Add a unique constraint on `user_id` so upsert (onConflict: 'user_id')
   works as a fallback when no profile row exists yet.

## Security
- RLS remains enabled on profiles.
- Owner-scoped CRUD: each authenticated user can only access their own row.
- No columns are dropped or renamed; no data is lost.
*/

-- Unique constraint so upsert on user_id works
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_key ON profiles (user_id);

-- Replace policies: use user_id for ownership checks
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
