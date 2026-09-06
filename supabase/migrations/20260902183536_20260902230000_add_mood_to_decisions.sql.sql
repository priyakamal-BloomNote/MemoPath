/*
# Add mood column to decisions table

1. Changes
- Adds a `mood` text column to the `decisions` table, nullable, default null.
- This lets each captured moment store an emoji-based mood alongside the existing priority/status fields.
2. Security
- No policy changes — existing RLS policies on `decisions` already scope all CRUD to the owning user via `auth.uid() = user_id`.
3. Notes
- The column is nullable so existing moments are unaffected.
- Frontend will write one of a fixed set of mood keys (e.g. 'happy', 'calm', 'excited', etc.).
*/

ALTER TABLE decisions ADD COLUMN IF NOT EXISTS mood text;