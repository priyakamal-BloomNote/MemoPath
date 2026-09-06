/*
# Add customizable images to decisions and goals

1. Modified Tables
- `decisions`
  - Add `images` (text[], nullable, default '{}') — stores user-customized image URLs for a decision. Empty array means no custom images.
- `goals`
  - Add `images` (text[], nullable, default '{}') — stores user-customized image URLs for a bucket-list goal. Empty array means no custom images.

2. Security
- Both tables already have owner-scoped RLS policies (select/insert/update/delete scoped to auth.uid() = user_id). The new `images` column is covered by those existing policies automatically — no new policies needed.
- Uploaded files go to the existing `category-images` private storage bucket, which already enforces folder ownership via storage policies.

3. Notes
- Both columns are additive — no data loss for existing rows.
- When `images` is empty/NULL, the app falls back to the built-in category default photos (same logic as the Categories page).
*/ 

ALTER TABLE decisions
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';
