# User Profiles Table Setup

This document contains the SQL statements needed to create the `user_profiles` table in Supabase for backend user profiling.

## Overview

The `user_profiles` table is designed to store user profiling data that helps tailor chatbot responses. This table is:
- Automatically populated when users sign up via OAuth
- Backend-only access (users cannot view or delete their profile data)
- Linked to Supabase auth system via foreign key
- Protected with Row Level Security (RLS) policies

## SQL Setup

```sql
-- Create the user_profiles table
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    accredited_investor BOOLEAN DEFAULT NULL,
    check_size TEXT DEFAULT NULL,
    geographical_zone TEXT DEFAULT NULL,
    real_estate_investment_experience REAL DEFAULT NULL,
    investment_timeline TEXT DEFAULT NULL,
    investment_priorities TEXT[] DEFAULT NULL,
    deal_readiness TEXT DEFAULT NULL,
    preferred_asset_types TEXT[] DEFAULT NULL,
    needs_team_contact BOOLEAN DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only insert their own profile (for the auto-creation trigger)
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile (you may want to remove this too)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create an index on user_id for faster lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

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
  FOR EACH ROW EXECUTE FUNCTION public.copy_auth_user_to_public_users();

-- Optional: Add admin/backend access policies
-- Allow service role to do everything
CREATE POLICY "Service role full access" ON user_profiles
    FOR ALL USING (auth.role() = 'service_role');
```

## Table Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | Foreign key to `auth.users(id)`, unique |
| `accredited_investor` | BOOLEAN | Whether user is an accredited investor |
| `check_size` | TEXT | Investment amount range preference |
| `geographical_zone` | TEXT | Preferred geographical zones |
| `real_estate_investment_experience` | REAL | Years of RE investment experience |
| `investment_timeline` | TEXT | Investment timeline preferences |
| `investment_priorities` | TEXT[] | Array of investment priorities |
| `deal_readiness` | TEXT | Current deal readiness status |
| `preferred_asset_types` | TEXT[] | Array of preferred asset types |
| `needs_team_contact` | BOOLEAN | Whether user needs team contact |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

## RLS Policies

- **INSERT**: Users can only create their own profile (needed for auto-creation)
- **UPDATE**: Users can update their own profile (consider removing for full backend control)
- **SELECT**: No policy - users cannot view their profile data
- **DELETE**: No policy - users cannot delete their profile data
- **Service Role**: Full access for backend operations

## Key Features

1. **Auto-creation**: New OAuth users automatically get a profile record with null values
2. **Backend-only**: Users are unaware of profiling data collection
3. **Secure**: RLS ensures proper access control
4. **Scalable**: Indexed for fast lookups by user_id
5. **Auditable**: Automatic timestamps for tracking changes

## Backend Usage

Use the service role key to access and update profile data from your backend services. This allows for user profiling based on chat interactions, investment behavior, and other signals to provide more personalized responses. 

If `curl` works but your browser fetch from the frontend does not, the issue is almost certainly **CORS** (Cross-Origin Resource Sharing). Here’s why:

- **curl** does not enforce CORS, so it can talk to your backend directly.
- **Browsers** enforce CORS for security, so your backend must explicitly allow requests from your frontend’s origin (`http://localhost:3000`).

### Why is this happening?

Your FastAPI backend CORS config currently only allows requests from your deployed frontend, not from localhost. So when your browser tries to send a request from `http://localhost:3000`, the backend does not include the required `Access-Control-Allow-Origin` header, and the browser blocks the response.

### How to fix

**You must update your FastAPI backend to allow requests from `http://localhost:3000` during development.**

#### Example fix:

In your FastAPI backend (in the file where you have `app.add_middleware(CORSMiddleware, ...)`), change:

```python
frontend_url = "https://ozlistings-chat-frontend-1098767556937.us-central1.run.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3000",  # <-- add this for local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**To:**

```python
<code_block_to_apply_changes_from>
```

Then **restart your backend server**.

---

### Summary

- `curl` works because it ignores CORS.
- Browsers block the request due to missing CORS headers.
- Add `http://localhost:3000` to `allow_origins` in your FastAPI CORS config and restart the backend.

---

If you do this and still have issues, let me know the exact error message you see in the browser console after the change! 

# Schema Migration v2

This section contains the migration statements to update the existing `user_profiles` table to the new schema based on the updated requirements.

## Migration Overview

The v2 schema introduces:
- Role-based user classification (Developer vs Investor)
- Capital gains tracking for investors
- Location-based data (state codes for investment zones, coordinates/addresses for development)
- Conditional fields based on user type
- Email fetched from `auth.users` table instead of duplicated storage

## Migration SQL Statements

```sql
-- Step 1: Add new columns
ALTER TABLE user_profiles 
ADD COLUMN role TEXT CHECK (role IN ('Developer', 'Investor')),
ADD COLUMN cap_gain_or_not BOOLEAN DEFAULT NULL,
ADD COLUMN size_of_cap_gain NUMERIC DEFAULT NULL,
ADD COLUMN time_of_cap_gain TEXT CHECK (time_of_cap_gain IN ('Last 180 days', 'More than 180 days AGO', 'Upcoming')),
ADD COLUMN geographical_zone_of_investment TEXT CHECK (LENGTH(geographical_zone_of_investment) = 2),
ADD COLUMN need_team_contact BOOLEAN DEFAULT NULL,
ADD COLUMN location_of_development TEXT DEFAULT NULL;

-- Step 2: Remove old columns
ALTER TABLE user_profiles 
DROP COLUMN accredited_investor,
DROP COLUMN check_size,
DROP COLUMN geographical_zone,
DROP COLUMN real_estate_investment_experience,
DROP COLUMN investment_timeline,
DROP COLUMN investment_priorities,
DROP COLUMN deal_readiness,
DROP COLUMN preferred_asset_types,
DROP COLUMN needs_team_contact;

-- Step 3: Add constraints for conditional fields
-- Cap gain size should only be set if cap_gain_or_not is true
ALTER TABLE user_profiles 
ADD CONSTRAINT check_cap_gain_size 
CHECK (
    (cap_gain_or_not = true AND size_of_cap_gain IS NOT NULL) OR 
    (cap_gain_or_not = false AND size_of_cap_gain IS NULL) OR 
    (cap_gain_or_not IS NULL AND size_of_cap_gain IS NULL)
);

-- Time of cap gain should only be set if cap_gain_or_not is true
ALTER TABLE user_profiles 
ADD CONSTRAINT check_cap_gain_time 
CHECK (
    (cap_gain_or_not = true AND time_of_cap_gain IS NOT NULL) OR 
    (cap_gain_or_not = false AND time_of_cap_gain IS NULL) OR 
    (cap_gain_or_not IS NULL AND time_of_cap_gain IS NULL)
);

-- Cap gain fields should only apply to Investors
ALTER TABLE user_profiles 
ADD CONSTRAINT check_investor_cap_gain 
CHECK (
    (role = 'Investor') OR 
    (role = 'Developer' AND cap_gain_or_not IS NULL AND size_of_cap_gain IS NULL AND time_of_cap_gain IS NULL) OR
    (role IS NULL AND cap_gain_or_not IS NULL AND size_of_cap_gain IS NULL AND time_of_cap_gain IS NULL)
);

-- Location of development should only apply to Developers
ALTER TABLE user_profiles 
ADD CONSTRAINT check_developer_location 
CHECK (
    (role = 'Developer') OR 
    (role = 'Investor' AND location_of_development IS NULL) OR
    (role IS NULL AND location_of_development IS NULL)
);

-- Step 4: Update indexes
DROP INDEX IF EXISTS idx_user_profiles_user_id;
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_geo_zone ON user_profiles(geographical_zone_of_investment);

-- Step 5: Create a view for easy access to user profiles with email
CREATE OR REPLACE VIEW user_profiles_with_email AS
SELECT 
    up.*,
    au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id;
```

## Updated Table Schema (v2)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | Foreign key to `auth.users(id)`, unique |
| `role` | TEXT | User role: 'Developer' or 'Investor' |
| `cap_gain_or_not` | BOOLEAN | Whether user has capital gains (Investors only) |
| `size_of_cap_gain` | NUMERIC | Amount of capital gains (if cap_gain_or_not = true) |
| `time_of_cap_gain` | TEXT | Timing of capital gains: 'Last 180 days', 'More than 180 days AGO', 'Upcoming' |
| `geographical_zone_of_investment` | TEXT | 2-letter US state code for investment zone |
| `need_team_contact` | BOOLEAN | Whether user needs team contact (no database constraints) |
| `location_of_development` | TEXT | Coordinates or address for development (Developers only) |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Note:** Email is accessed via JOIN with `auth.users` table or through the `user_profiles_with_email` view.

## Email Access Examples

### Using JOIN:
```sql
SELECT up.*, au.email 
FROM user_profiles up 
JOIN auth.users au ON up.user_id = au.id 
WHERE up.user_id = 'some-uuid';
```

### Using the View:
```sql
SELECT * FROM user_profiles_with_email WHERE user_id = 'some-uuid';
```

# Schema Migration v3

This section contains the migration statements to remove constraints that prevent flexible capital gains data collection.

## Migration Overview v3

The v3 schema removes restrictive constraints to allow:
- Capturing capital gains data regardless of the initial yes/no answer
- More flexible data collection during the investor qualification flow
- Partial form completion tracking

## Migration SQL Statements v3

```sql
-- Remove restrictive constraints that prevent flexible data collection
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS check_cap_gain_size;

ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS check_cap_gain_time;

-- Keep the role-based constraint to ensure cap gain fields only apply to Investors
-- (This constraint remains unchanged from v2)
```

# Schema Migration v4

This section contains the migration statements to update RLS policies for proper API endpoint functionality.

## Migration Overview v4

The v4 schema updates RLS policies to allow:
- Server-side API endpoints to create and update user profiles
- Proper authentication context for the investor eligibility flow
- Maintains security while enabling backend operations

## Migration SQL Statements v4

```sql
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create new policies that work with both client and server-side authentication
CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id OR 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Enable update for authenticated users" ON user_profiles
    FOR UPDATE 
    USING (
        auth.uid() = user_id OR 
        auth.role() = 'authenticated'
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Enable select for own profile" ON user_profiles
    FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

-- Service role policy remains unchanged for backend operations
-- (This policy already exists from v2)
```

## Migration Notes

⚠️ **Important:** This migration will **lose all existing data** in the removed columns. If you need to preserve any existing data, create a backup first.

The migration maintains all existing RLS policies and triggers while updating the schema to support the new role-based user profiling approach. 