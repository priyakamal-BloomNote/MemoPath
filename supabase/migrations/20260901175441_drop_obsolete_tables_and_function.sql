-- Drop obsolete tables that have zero code references.
-- These tables are from earlier development iterations and are not used by any current feature.

-- chat_messages: early AI chat persistence, replaced by client-side AICoach
DROP TABLE IF EXISTS chat_messages CASCADE;

-- custom_categories: early user-defined categories, replaced by the categories table
DROP TABLE IF EXISTS custom_categories CASCADE;

-- journal_entries: early journal feature, replaced by the reflections table
DROP TABLE IF EXISTS journal_entries CASCADE;

-- milestones: early milestones-as-a-table feature, replaced by JSONB column on goals
DROP TABLE IF EXISTS milestones CASCADE;

-- handle_new_user: auto-create-profile function, replaced by explicit insert in auth.tsx
-- No trigger is attached to it (trigger was already removed in a prior migration).
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
