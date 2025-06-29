# Supabase Database Migration Instructions

## Problem
The Supabase `users` table is missing several columns that the onboarding process expects, causing database errors like:
- `Could not find the 'preferred_locations' column`
- `Could not find the 'move_in_timeframe' column`
- `Could not find the 'gender' column`

## Solution
Run the migration script to add the missing columns.

## Steps to Apply Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard at: https://app.supabase.com
2. Navigate to your project: **hybyjgpcbcqpndxrquqv**
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `supabase/migrations/001_add_missing_user_columns.sql`
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to your project root
cd /Users/mona/code/Roomies

# Run the migration
supabase db push
```

### Option 3: Manual SQL Execution

Connect to your database and run:

```sql
-- Copy the entire contents of supabase/migrations/001_add_missing_user_columns.sql
-- and execute it in your database client
```

## Expected Result

After running the migration, your `users` table will have these additional columns:
- `budget_min` (integer)
- `budget_max` (integer) 
- `preferred_locations` (jsonb)
- `location` (jsonb)
- `lifestyle_preferences` (jsonb)
- `lifestyle_answers` (jsonb)
- `personality_type` (text)
- `personality_dimensions` (jsonb)
- `housing_goals` (jsonb)
- `move_in_timeframe` (text)
- `gender` (text)
- `roommate_preferences` (jsonb)
- `additional_photos` (jsonb)
- `date_of_birth` (date)
- `completed_steps` (text[])
- `profile_strength` (integer)

## Verification

After applying the migration, test the onboarding flow:
1. Create a new test account
2. Go through each onboarding step
3. Verify no database column errors appear in logs
4. Check that data is being saved properly

## Rollback (if needed)

If you need to rollback the migration:

```sql
-- Remove the added columns (use with caution!)
ALTER TABLE public.users 
DROP COLUMN IF EXISTS budget_min,
DROP COLUMN IF EXISTS budget_max,
DROP COLUMN IF EXISTS preferred_locations,
DROP COLUMN IF EXISTS location,
DROP COLUMN IF EXISTS lifestyle_preferences,
DROP COLUMN IF EXISTS lifestyle_answers,
DROP COLUMN IF EXISTS personality_type,
DROP COLUMN IF EXISTS personality_dimensions,
DROP COLUMN IF EXISTS housing_goals,
DROP COLUMN IF EXISTS move_in_timeframe,
DROP COLUMN IF EXISTS gender,
DROP COLUMN IF EXISTS roommate_preferences,
DROP COLUMN IF EXISTS additional_photos,
DROP COLUMN IF EXISTS date_of_birth,
DROP COLUMN IF EXISTS completed_steps,
DROP COLUMN IF EXISTS profile_strength;
``` 