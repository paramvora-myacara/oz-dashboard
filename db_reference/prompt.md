1. Event-Driven Design with Role-Specific Tables (Recommended)
Structure:
users table (core auth/identity)
id,user_id email, created_at, updated_at (user id is foreign key to auth.users table)
current_role (can change based on actions)
user_events table (tracks all interactions)
id, user_id, event_type, endpoint, metadata (JSONB), created_at
Records: dashboard_viewed, oz_check_performed, tax_calculator_used, etc.
investor_profiles table
user_id (FK), cap_gain_or_not, size_of_cap_gain, time_of_cap_gain, tax_bracket
developer_profiles table
user_id (FK), location_of_development, oz_status, geographical_zone
user_interests table
user_id, needs_team_contact, community_member, viewed_listings
1:21
Database Schema Evolution Plan
1. Tracking Auth Sources
Add to the user_events table:
event_type: 'auth_initiated'
metadata: {
  source_endpoint: 'check_if_your_development_is_in_an_oz',
  subdomain: 'app.domain.com',
  referrer: 'marketing_page_url',
  first_auth: true/false,
  auth_method: 'email/google/etc'
}
2. Endpoint to Table Mapping
Complete Table Structure First:
users
- id (uuid, PK)
- email (unique)
- current_role (text, default: 'investor')
- created_at
- updated_at
- first_auth_source (text) -- tracks initial entry point

user_events  
- id (uuid, PK)
- user_id (FK to users)
- event_type (text)
- endpoint (text)
- metadata (jsonb)
- created_at

investor_profiles
- user_id (FK to users, PK)
- cap_gain_or_not (boolean)
- size_of_cap_gain (numeric)
- time_of_cap_gain (text)
- tax_bracket (numeric)
- geographical_zone_of_investment (text) -- Added per point 6
- profile_completion_score (int) -- 0-100
- created_at
- updated_at

developer_profiles
- user_id (FK to users, PK)  
- location_of_development (text)
- oz_status (boolean)
- geographical_zone (text)
- profile_completion_score (int)
- created_at
- updated_at

user_interests
- user_id (FK to users, PK)
- needs_team_contact (boolean)
- community_member (boolean)
- viewed_listings (boolean)
- dashboard_accessed (boolean)
- last_team_contact_request (timestamp)
- created_at
- updated_at
3. Default Role Logic
sql
-- Users table default
current_role DEFAULT 'investor'

-- Role change trigger
CREATE OR REPLACE FUNCTION update_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- If user completes developer action, switch role
  IF NEW.event_type IN ('oz_check_completed', 'developer_profile_created') THEN
    UPDATE users 
    SET current_role = 'developer' 
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
4. Triggers and Constraints
Essential Triggers:
sql
-- Auto-create profile tables on first relevant action
CREATE OR REPLACE FUNCTION ensure_profile_exists()

-- Update profile completion scores
CREATE OR REPLACE FUNCTION update_completion_score()

-- Track user journey milestones
CREATE OR REPLACE FUNCTION track_funnel_progression()
Key Constraints:
One profile per user per type (PK on user_id)
Event types must be from allowed list
Email must be valid format
Size_of_cap_gain must be positive
Role must be in ['investor', 'developer', 'both']
5. Data Update Frequency
Real-time updates: user_events (every interaction)
On-change updates: profile tables (when user provides new info)
Computed daily: profile_completion_score, email_segments
Append-only: user_events (never update, only insert)
6. Geographical Location for Investors
Already added to investor_profiles table as geographical_zone_of_investment
7. Extensibility for New Features
The design handles new features through:
New event_types in user_events
JSONB metadata for feature-specific data
New profile tables following pattern: {persona}_profiles
user_interests can add boolean flags without schema change
Endpoint to Table Connection Map
1. check_if_your_development_is_in_an_oz
ON AUTH:
→ users (create/update)
→ user_events (auth_initiated + endpoint info)
→ developer_profiles (create if not exists)

ON COMPLETION:
→ user_events (oz_check_completed)
→ developer_profiles (UPDATE location_of_development, oz_status)
→ users (UPDATE current_role = 'developer' via trigger)
2. qualify_as_an_investor
ON AUTH:
→ users (create/update)  
→ user_events (auth_initiated)
→ investor_profiles (create if not exists)

ON FORM SUBMIT:
→ user_events (investor_qualification_submitted)
→ investor_profiles (UPDATE cap_gain_or_not, size_of_cap_gain, time_of_cap_gain)
3. check_how_much_tax_you_can_save
ON AUTH:
→ users (create/update)
→ user_events (auth_initiated)
→ investor_profiles (create if not exists)

ON CALCULATION:
→ user_events (tax_calculator_used)
→ investor_profiles (UPDATE size_of_cap_gain, tax_bracket, time_of_cap_gain)
4. see_dashboard
ON AUTH:
→ users (create/update)
→ user_events (auth_initiated, dashboard_viewed)
→ user_interests (UPDATE dashboard_accessed = true)
5. speak_to_the_team
ON AUTH:
→ users (create/update)
→ user_events (auth_initiated)

ON FORM SUBMIT:
→ user_events (team_contact_requested)
→ user_interests (UPDATE needs_team_contact = true, last_team_contact_request)
→ investor_profiles (UPDATE if investor data provided)
6. join_our_community
ON SUBMIT:
→ users (create/update)
→ user_events (community_joined)
→ user_interests (UPDATE community_member = true)
→ users (UPDATE current_role if specified)
7. see_oz_listings
ON AUTH:
→ users (create/update)
→ user_events (auth_initiated, listings_viewed)
→ user_interests (UPDATE viewed_listings = true)
Migration Strategy from Current Single Table
Create new tables with proper structure
Migrate existing data:
Users table: SELECT DISTINCT email, role
Parse existing columns into appropriate profile tables
Generate historical events based on filled fields
Add triggers and constraints
Update application code to write to new structure
Run parallel for verification period
Deprecate old table
This design ensures every auth is tracked, maintains data integrity, and scales well for new features while providing rich data for email marketing segmentation.