BEGIN;

-- This script creates the new tables and functions based on db_update/prompt.md

-- =================================================================
-- Helper function to update 'updated_at' columns
-- =================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- Table: users
-- Core user profile information, linked to auth.users
-- =================================================================
CREATE TABLE public.users (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  user_role text DEFAULT 'investor',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz,
  first_auth_source text
);

ALTER TABLE public.users
ADD CONSTRAINT users_user_role_check CHECK (user_role IN ('investor', 'developer', 'both'));

CREATE TRIGGER on_users_updated
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- =================================================================
-- Table: user_events
-- Tracks all user interactions and events
-- =================================================================
CREATE TABLE public.user_events (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type text,
  endpoint text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- =================================================================
-- Table: investor_profiles
-- Stores data specific to users with an 'investor' role
-- =================================================================
CREATE TABLE public.investor_profiles (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  cap_gain_or_not boolean,
  size_of_cap_gain numeric,
  time_of_cap_gain text,
  tax_bracket numeric,
  geographical_zone_of_investment text,
  profile_completion_score int DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

ALTER TABLE public.investor_profiles
ADD CONSTRAINT investor_profiles_size_of_cap_gain_check CHECK (size_of_cap_gain IS NULL OR size_of_cap_gain > 0);

CREATE TRIGGER on_investor_profiles_updated
BEFORE UPDATE ON public.investor_profiles
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- =================================================================
-- Table: developer_profiles
-- Stores data specific to users with a 'developer' role
-- =================================================================
CREATE TABLE public.developer_profiles (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  location_of_development text,
  oz_status boolean,
  geographical_zone text,
  profile_completion_score int DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

CREATE TRIGGER on_developer_profiles_updated
BEFORE UPDATE ON public.developer_profiles
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();


-- =================================================================
-- Table: user_interests
-- Tracks user interests and engagement flags
-- =================================================================
CREATE TABLE public.user_interests (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  needs_team_contact boolean DEFAULT false,
  community_member boolean DEFAULT false,
  viewed_listings boolean DEFAULT false,
  dashboard_accessed boolean DEFAULT false,
  last_team_contact_request timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

CREATE TRIGGER on_user_interests_updated
BEFORE UPDATE ON public.user_interests
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- =================================================================
-- Functions and Triggers
-- =================================================================

-- Function to update profiles from user events metadata
CREATE OR REPLACE FUNCTION public.update_profiles_from_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Update developer profile from OZ check events
    IF NEW.event_type = 'oz_check_completed' THEN
        UPDATE public.developer_profiles
        SET
            location_of_development = COALESCE(NEW.metadata->>'address', 'Coords: ' || (NEW.metadata->>'lat') || ', ' || (NEW.metadata->>'lng')),
            oz_status = (NEW.metadata->>'isInOZ')::boolean,
            geographical_zone = NEW.metadata->>'geoid',
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;

    -- Update investor profile from investor qualification events
    IF NEW.event_type = 'investor_qualification_submitted' THEN
        UPDATE public.investor_profiles
        SET
            cap_gain_or_not = (NEW.metadata->>'capGainStatus')::boolean,
            size_of_cap_gain = (NEW.metadata->>'gainAmount')::numeric,
            time_of_cap_gain = NEW.metadata->>'gainTiming',
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;

    -- Update investor profile from tax calculator events
    IF NEW.event_type = 'tax_calculator_used' THEN
        UPDATE public.investor_profiles
        SET
            size_of_cap_gain = (NEW.metadata->>'gainAmount')::numeric,
            tax_bracket = (NEW.metadata->>'taxRate')::numeric,
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;

    -- Update dashboard access flag
    IF NEW.event_type = 'dashboard_accessed' THEN
        UPDATE public.user_interests
        SET
            dashboard_accessed = true,
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for the above function on user_events table
CREATE TRIGGER on_user_event_insert_update_profiles
AFTER INSERT ON public.user_events
FOR EACH ROW
EXECUTE PROCEDURE public.update_profiles_from_event();


-- Function to update user role based on specific events
CREATE OR REPLACE FUNCTION public.update_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- If user completes a developer action, switch role to 'developer'
  IF NEW.event_type IN ('oz_check_completed', 'developer_profile_created') THEN
    UPDATE public.users
    SET user_role = 'developer'
    WHERE id = NEW.user_id AND user_role != 'developer';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for the above function on user_events table
CREATE TRIGGER on_user_event_insert_update_role
AFTER INSERT ON public.user_events
FOR EACH ROW
EXECUTE PROCEDURE public.update_user_role();

-- Function to auto-create profile tables on first relevant action
CREATE OR REPLACE FUNCTION public.ensure_profile_exists()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure a user_interests row exists for any event
    INSERT INTO public.user_interests (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- If it's a developer-related event, ensure a developer profile exists.
    IF NEW.event_type IN ('oz_check_completed', 'developer_profile_created', 'oz_check_performed') THEN
        INSERT INTO public.developer_profiles (user_id)
        VALUES (NEW.user_id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    -- If it's an investor-related event, ensure an investor profile exists.
    IF NEW.event_type IN ('investor_qualification_submitted', 'tax_calculator_used') THEN
        INSERT INTO public.investor_profiles (user_id)
        VALUES (NEW.user_id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for the above function on user_events table
CREATE TRIGGER on_user_event_insert_ensure_profile
AFTER INSERT ON public.user_events
FOR EACH ROW
EXECUTE PROCEDURE public.ensure_profile_exists();


-- Placeholder for update_completion_score function
-- This function's logic is not defined in the prompt and needs implementation.
CREATE OR REPLACE FUNCTION public.update_completion_score()
RETURNS TRIGGER AS $$
BEGIN
  -- TODO: Add logic to calculate and update profile_completion_score
  -- in investor_profiles or developer_profiles based on the NEW data.
  RAISE NOTICE 'Placeholder: update_completion_score trigger called for user %', NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Placeholder trigger for completion score on investor_profiles
CREATE TRIGGER on_investor_profile_update_score
AFTER UPDATE ON public.investor_profiles
FOR EACH ROW
EXECUTE PROCEDURE public.update_completion_score();

-- Placeholder trigger for completion score on developer_profiles
CREATE TRIGGER on_developer_profile_update_score
AFTER UPDATE ON public.developer_profiles
FOR EACH ROW
EXECUTE PROCEDURE public.update_completion_score();


-- Placeholder for track_funnel_progression function
-- This function's logic is not defined in the prompt and needs implementation.
CREATE OR REPLACE FUNCTION public.track_funnel_progression()
RETURNS TRIGGER AS $$
BEGIN
  -- TODO: Add logic to track user journey milestones based on event_type.
  -- This could involve updating user_interests or another analytics table.
  RAISE NOTICE 'Placeholder: track_funnel_progression trigger called for event %', NEW.event_type;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Placeholder trigger for funnel tracking on user_events
CREATE TRIGGER on_user_event_insert_track_funnel
AFTER INSERT ON public.user_events
FOR EACH ROW
EXECUTE PROCEDURE public.track_funnel_progression();


-- =================================================================
-- Grant Permissions for Auth Triggers
-- =================================================================
-- Grant usage on the public schema to the authenticator role.
-- This is necessary for the trigger on auth.users to be able to access public.users.
GRANT USAGE ON SCHEMA public TO authenticator;
GRANT INSERT ON TABLE public.users TO authenticator;


-- =================================================================
-- Function and Trigger to automatically copy new users from auth.users
-- to public.users on sign-up.
-- =================================================================
CREATE OR REPLACE FUNCTION public.copy_auth_user_to_public_users()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created_copy_to_public_users
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.copy_auth_user_to_public_users();

COMMIT; 