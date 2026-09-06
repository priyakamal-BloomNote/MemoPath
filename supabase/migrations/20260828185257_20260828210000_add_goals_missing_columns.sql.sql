/*
# Add missing columns to goals table

1. Modified Tables
- `goals`
  - Add `category` (text, NOT NULL, default 'Personal Growth') — the app writes the six bucket-list categories here.
  - Add `target_date` (date, nullable) — the app writes the chosen deadline here.
  - Add `status` (text, NOT NULL, default 'not_started') — the app writes not_started / in_progress / completed here.
2. Security
- No RLS or policy changes. Existing owner-scoped policies still apply to the new columns automatically.
3. Notes
- The existing `type`, `deadline`, `milestones`, and `completed` columns are left untouched so no data is lost.
- New columns are additive only; no destructive operations.
*/

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Personal Growth';

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS target_date date;

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'not_started';
