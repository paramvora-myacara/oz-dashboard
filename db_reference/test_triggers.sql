-- =================================================================
-- Test Script for Database Triggers
-- =================================================================
--
-- Instructions:
-- 1. Your user ID is already included in the script.
-- 2. Run each test block separately in your Supabase SQL Editor to observe the changes.
--
-- =================================================================

-- Test 1: Check if a developer-related event correctly changes the user's role
-- and creates a developer profile.
-- -----------------------------------------------------------------

-- Step 1.1: Check the user's role BEFORE the event.
-- Expected output: 'investor' (the default)
SELECT id, user_role FROM public.users WHERE id = 'be76af18-8643-4845-9099-47f0d4997fb2';

-- Step 1.2: Check if a developer profile exists BEFORE the event.
-- Expected output: 0 rows
SELECT * FROM public.developer_profiles WHERE user_id = 'be76af18-8643-4845-9099-47f0d4997fb2';


-- Step 1.3: Simulate a developer action by inserting an event.
-- This should trigger both `on_user_event_insert_update_role` and `on_user_event_insert_ensure_profile`.
INSERT INTO public.user_events (user_id, event_type, endpoint)
VALUES ('be76af18-8643-4845-9099-47f0d4997fb2', 'oz_check_completed', '/api/check_oz_status');

-- Step 1.4: Check the user's role AFTER the event.
-- Expected output: 'developer'
SELECT id, user_role FROM public.users WHERE id = 'be76af18-8643-4845-9099-47f0d4997fb2';

-- Step 1.5: Check that a developer profile has been created.
-- Expected output: 1 row with the user_id
SELECT * FROM public.developer_profiles WHERE user_id = 'be76af18-8643-4845-9099-47f0d4997fb2';


-- =================================================================

-- Test 2: Check if an investor-related event correctly creates an investor profile.
-- -----------------------------------------------------------------

-- Step 2.1: Check if an investor profile exists BEFORE the event.
-- Expected output: 0 rows (assuming a clean test user, or run this test first)
SELECT * FROM public.investor_profiles WHERE user_id = 'be76af18-8643-4845-9099-47f0d4997fb2';

-- Step 2.2: Simulate an investor action by inserting an event.
-- This should trigger `on_user_event_insert_ensure_profile`.
INSERT INTO public.user_events (user_id, event_type, endpoint)
VALUES ('be76af18-8643-4845-9099-47f0d4997fb2', 'tax_calculator_used', '/tools/tax-calculator');

-- Step 2.3: Check that an investor profile has been created.
-- Expected output: 1 row with the user_id
SELECT * FROM public.investor_profiles WHERE user_id = 'be76af18-8643-4845-9099-47f0d4997fb2';


-- =================================================================

-- Test 3: Check if a generic event creates a user_interests record.
-- -----------------------------------------------------------------

-- Step 3.1: Check if a user_interests record exists BEFORE the event.
-- This will likely already exist from previous events, but it's good to check.
SELECT * FROM public.user_interests WHERE user_id = 'be76af18-8643-4845-9099-47f0d4997fb2';

-- Step 3.2: Simulate a generic event.
-- The `ensure_profile_exists` trigger creates a `user_interests` record for ANY event.
INSERT INTO public.user_events (user_id, event_type, endpoint)
VALUES ('be76af18-8643-4845-9099-47f0d4997fb2', 'dashboard_viewed', '/dashboard');

-- Step 3.3: Check that the user_interests record exists.
-- Expected output: 1 row with the user_id
SELECT * FROM public.user_interests WHERE user_id = 'be76af18-8643-4845-9099-47f0d4997fb2'; 