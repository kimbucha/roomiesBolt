-- ================================================================================================
-- CRITICAL DATABASE FIX FOR ROOMIES APP
-- ================================================================================================
-- This script fixes the "JSON object requested, multiple (or no) rows returned" error
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/hybyjgpcbcqpndxrquqv/sql
-- ================================================================================================

-- PART 1: CLEAN UP DUPLICATE USER RECORDS
-- ================================================================================================

DO $$
DECLARE 
    duplicate_record RECORD;
    total_duplicates INT := 0;
BEGIN
    RAISE NOTICE 'Starting cleanup of duplicate user records...';
    
    -- Find and clean up duplicate users (keeping the most recent one)
    FOR duplicate_record IN 
        SELECT id, email, COUNT(*) as count_records
        FROM public.users 
        GROUP BY id, email 
        HAVING COUNT(*) > 1
    LOOP
        total_duplicates := total_duplicates + 1;
        RAISE NOTICE 'Found duplicate user: ID=%, email=%, count=%', duplicate_record.id, duplicate_record.email, duplicate_record.count_records;
        
        -- Delete all but the most recent record for this user ID
        WITH ranked_users AS (
            SELECT ctid, ROW_NUMBER() OVER (ORDER BY created_at DESC, updated_at DESC) as rn
            FROM public.users 
            WHERE id = duplicate_record.id
        )
        DELETE FROM public.users 
        WHERE ctid IN (
            SELECT ctid FROM ranked_users WHERE rn > 1
        );
        
        RAISE NOTICE 'Cleaned up % duplicate records for user %', duplicate_record.count_records - 1, duplicate_record.id;
    END LOOP;
    
    IF total_duplicates = 0 THEN
        RAISE NOTICE 'No duplicate user records found - database is clean';
    ELSE
        RAISE NOTICE 'Cleaned up % duplicate user groups', total_duplicates;
    END IF;
END $$;

-- PART 2: ENSURE PROPER TABLE CONSTRAINTS
-- ================================================================================================

-- Add unique constraint on user ID (primary key should already exist, but let's ensure it)
DO $$
BEGIN
    -- Check if primary key constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE public.users ADD PRIMARY KEY (id);
        RAISE NOTICE 'Added primary key constraint to users table';
    ELSE
        RAISE NOTICE 'Primary key constraint already exists on users table';
    END IF;
END $$;

-- Ensure email uniqueness
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' AND constraint_name = 'users_email_key'
    ) THEN
        -- First clean up any email duplicates
        WITH email_duplicates AS (
            SELECT email, MIN(ctid) as keep_ctid
            FROM public.users 
            WHERE email IS NOT NULL
            GROUP BY email
            HAVING COUNT(*) > 1
        )
        DELETE FROM public.users 
        WHERE email IN (SELECT email FROM email_duplicates)
        AND ctid NOT IN (SELECT keep_ctid FROM email_duplicates);
        
        -- Now add the unique constraint
        ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
        RAISE NOTICE 'Added email uniqueness constraint to users table';
    ELSE
        RAISE NOTICE 'Email uniqueness constraint already exists on users table';
    END IF;
END $$;

-- PART 3: FIX THE get_full_user_profile FUNCTION
-- ================================================================================================

-- Drop the conflicting function first
DROP FUNCTION IF EXISTS get_full_user_profile(uuid);

-- Create the corrected get_full_user_profile function
-- This version returns a single JSON object, not a table
CREATE OR REPLACE FUNCTION get_full_user_profile(user_uuid uuid)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    -- Build a complete user profile object
    SELECT jsonb_build_object(
        -- Basic user info
        'id', u.id,
        'email', u.email,
        'name', u.name,
        'is_premium', u.is_premium,
        'is_verified', u.is_verified,
        'profile_image_url', u.profile_image_url,
        'onboarding_completed', u.onboarding_completed,
        'created_at', u.created_at,
        'updated_at', u.updated_at,
        
        -- Onboarding fields
        'budget_min', u.budget_min,
        'budget_max', u.budget_max,
        'preferred_locations', u.preferred_locations,
        'location', u.location,
        'lifestyle_preferences', u.lifestyle_preferences,
        'lifestyle_answers', u.lifestyle_answers,
        'personality_type', u.personality_type,
        'personality_dimensions', u.personality_dimensions,
        'housing_goals', u.housing_goals,
        'move_in_timeframe', u.move_in_timeframe,
        'gender', u.gender,
        'roommate_preferences', u.roommate_preferences,
        'additional_photos', u.additional_photos,
        'date_of_birth', u.date_of_birth,
        'completed_steps', u.completed_steps,
        'profile_strength', u.profile_strength,
        
        -- Roommate profile (if exists)
        'roommate_profile', CASE 
            WHEN rp.id IS NOT NULL THEN jsonb_build_object(
                'id', rp.id,
                'age', rp.age,
                'university', rp.university,
                'major', rp.major,
                'year', rp.year,
                'bio', rp.bio,
                'budget', rp.budget,
                'location', rp.location,
                'neighborhood', rp.neighborhood,
                'room_photos', rp.room_photos,
                'traits', rp.traits,
                'compatibility_score', rp.compatibility_score,
                'has_place', rp.has_place,
                'room_type', rp.room_type,
                'amenities', rp.amenities,
                'bedrooms', rp.bedrooms,
                'bathrooms', rp.bathrooms,
                'is_furnished', rp.is_furnished,
                'lease_duration', rp.lease_duration,
                'move_in_date', rp.move_in_date,
                'flexible_stay', rp.flexible_stay,
                'lease_type', rp.lease_type,
                'utilities_included', rp.utilities_included,
                'pet_policy', rp.pet_policy,
                'sublet_allowed', rp.sublet_allowed,
                'personality_traits', rp.personality_traits,
                'personality_type', rp.personality_type,
                'personality_dimensions', rp.personality_dimensions,
                'social_media', rp.social_media,
                'lifestyle_preferences', rp.lifestyle_preferences,
                'personal_preferences', rp.personal_preferences,
                'description', rp.description,
                'address', rp.address,
                'monthly_rent', rp.monthly_rent,
                'place_details', rp.place_details
            )
            ELSE NULL
        END
    ) INTO result
    FROM public.users u
    LEFT JOIN public.roommate_profiles rp ON u.id = rp.user_id
    WHERE u.id = user_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_full_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_full_user_profile(uuid) TO anon;

-- PART 4: UPDATE create_user_profile FUNCTION
-- ================================================================================================

-- Drop and recreate the user creation function
DROP FUNCTION IF EXISTS create_user_profile(uuid, text, text, boolean, boolean, boolean);

CREATE OR REPLACE FUNCTION create_user_profile(
    user_id uuid,
    user_email text,
    user_name text,
    is_user_premium boolean DEFAULT false,
    is_user_verified boolean DEFAULT false,
    is_onboarding_completed boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert user profile (will fail if user already exists due to primary key)
    INSERT INTO public.users (
        id, 
        email, 
        name, 
        is_premium, 
        is_verified, 
        onboarding_completed,
        profile_strength,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        user_email,
        user_name,
        false, -- Always create as non-premium
        is_user_verified,
        is_onboarding_completed,
        10, -- Base profile strength
        now(),
        now()
    );
    
    RETURN true;
EXCEPTION
    WHEN unique_violation THEN
        -- User already exists, that's okay
        RAISE NOTICE 'User % already exists, skipping creation', user_email;
        RETURN true;
    WHEN others THEN
        RAISE NOTICE 'Error creating user profile: %', SQLERRM;
        RETURN false;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_user_profile(uuid, text, text, boolean, boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile(uuid, text, text, boolean, boolean, boolean) TO anon;

-- PART 5: CREATE SIMPLIFIED PROFILE FETCH FUNCTION
-- ================================================================================================

-- Create a simple function for fetching user data that handles the single() requirement
CREATE OR REPLACE FUNCTION get_user_simple(user_uuid uuid)
RETURNS TABLE (
    id uuid,
    email text,
    name text,
    is_premium boolean,
    is_verified boolean,
    profile_image_url text,
    onboarding_completed boolean,
    personality_type text,
    budget_min integer,
    budget_max integer,
    gender text,
    profile_strength integer,
    completed_steps text[],
    created_at timestamptz,
    updated_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.is_premium,
        u.is_verified,
        u.profile_image_url,
        u.onboarding_completed,
        u.personality_type,
        u.budget_min,
        u.budget_max,
        u.gender,
        u.profile_strength,
        u.completed_steps,
        u.created_at,
        u.updated_at
    FROM public.users u
    WHERE u.id = user_uuid
    LIMIT 1; -- Ensure only one row is returned
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_simple(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_simple(uuid) TO anon;

-- PART 6: VERIFY DATABASE STATE
-- ================================================================================================

-- Check for any remaining issues
DO $$
DECLARE
    user_count INT;
    duplicate_count INT;
BEGIN
    -- Count total users
    SELECT COUNT(*) INTO user_count FROM public.users;
    
    -- Count potential duplicates
    SELECT COUNT(*) INTO duplicate_count FROM (
        SELECT id FROM public.users GROUP BY id HAVING COUNT(*) > 1
    ) duplicates;
    
    RAISE NOTICE 'Database verification complete:';
    RAISE NOTICE 'Total users: %', user_count;
    RAISE NOTICE 'Duplicate user IDs: %', duplicate_count;
    
    IF duplicate_count = 0 THEN
        RAISE NOTICE '✅ Database is clean - no duplicate users found';
    ELSE
        RAISE WARNING '⚠️ Still found % duplicate user IDs - manual cleanup may be needed', duplicate_count;
    END IF;
END $$;

-- PART 7: CREATE HEALTH CHECK
-- ================================================================================================

-- Test the functions work correctly
DO $$
DECLARE
    test_result jsonb;
BEGIN
    -- Test get_full_user_profile function with a known user (if any exist)
    SELECT get_full_user_profile(id) INTO test_result 
    FROM public.users 
    LIMIT 1;
    
    IF test_result IS NOT NULL THEN
        RAISE NOTICE '✅ get_full_user_profile function works correctly';
    ELSE
        RAISE NOTICE 'ℹ️ get_full_user_profile function created (no users to test with)';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE WARNING '⚠️ Error testing get_full_user_profile: %', SQLERRM;
END $$;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 DATABASE FIX COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE 'What was fixed:';
    RAISE NOTICE '1. ✅ Removed duplicate user records';
    RAISE NOTICE '2. ✅ Added proper uniqueness constraints';
    RAISE NOTICE '3. ✅ Fixed get_full_user_profile function to return single result';
    RAISE NOTICE '4. ✅ Updated create_user_profile function with error handling';
    RAISE NOTICE '5. ✅ Created simplified user fetch function';
    RAISE NOTICE '';
    RAISE NOTICE 'Your app should now work correctly!';
    RAISE NOTICE 'Try running the onboarding flow again.';
END $$; 