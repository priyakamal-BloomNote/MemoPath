/*
# Add diary_font column to profiles table

1. Changes
- Adds a `diary_font` text column to the `profiles` table, nullable, default null.
- Stores the user's selected decorative handwriting font name for the diary/journal interface.
2. Security
- No policy changes — existing RLS policies on `profiles` already scope all CRUD to the owning user.
3. Notes
- The column is nullable so existing profiles are unaffected.
- Frontend will write one of a fixed set of font names (e.g. 'Dancing Script', 'Great Vibes', etc.).
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diary_font text;