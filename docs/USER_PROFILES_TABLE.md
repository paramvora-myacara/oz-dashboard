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

-- Function to automatically create a profile with null entries when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id)
    VALUES (new.id);
    RETURN new;
END;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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