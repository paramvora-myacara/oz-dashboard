BEGIN;

-- This script undoes the migration in migration.sql by dropping all created tables, functions, and triggers.

-- =================================================================
-- Drop Tables
-- The order is important due to foreign key constraints. Tables that
-- reference public.users must be dropped before public.users itself.
-- Dropping a table also automatically removes its triggers, constraints, and indexes.
-- =================================================================
DROP TABLE IF EXISTS public.user_events;
DROP TABLE IF EXISTS public.investor_profiles;
DROP TABLE IF EXISTS public.developer_profiles;
DROP TABLE IF EXISTS public.user_interests;
DROP TABLE IF EXISTS public.users;

-- =================================================================
-- Drop Functions
-- These functions are no longer in use by any triggers or tables, so they can be safely removed.
-- copy_auth_user_to_public_users is dropped with CASCADE to also remove the trigger on auth.users that depends on it.
-- =================================================================
DROP FUNCTION IF EXISTS public.copy_auth_user_to_public_users() CASCADE;
DROP FUNCTION IF EXISTS public.track_funnel_progression();
DROP FUNCTION IF EXISTS public.update_completion_score();
DROP FUNCTION IF EXISTS public.ensure_profile_exists();
DROP FUNCTION IF EXISTS public.update_user_role();
DROP FUNCTION IF EXISTS public.update_profiles_from_event();
DROP FUNCTION IF EXISTS public.handle_updated_at();

COMMIT; 