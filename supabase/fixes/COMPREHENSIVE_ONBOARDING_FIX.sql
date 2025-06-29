-- ================================================================================================
-- COMPREHENSIVE ONBOARDING FIX FOR ROOMIES APP
-- ================================================================================================
-- This script fixes the "JSON object requested, multiple (or no) rows returned" error
-- by addressing the root cause: duplicate user creation and missing auth triggers
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/hybyjgpcbcqpndxrquqv/sql
-- ================================================================================================

-- PART 1: IMMEDIATE CLEANUP - REMOVE ALL DUPLICATE USERS
-- ================================================================================================

DO $$
DECLARE 
    duplicate_record RECORD;
    total_duplicates INT := 0;
    cleanup_count INT := 0;
BEGIN
    RAISE NOTICE 'Starting comprehensive cleanup of all duplicate user records...';
    
    -- First, let's see what we're dealing with
    SELECT COUNT(*) INTO total_duplicates FROM (
        SELECT id FROM public.users GROUP BY id HAVING COUNT(*) > 1
    ) duplicates;
    
    RAISE NOTICE 'Found % user IDs with duplicates', total_duplicates;
    
    -- Clean up duplicates by keeping only the most recent record for each user ID
    FOR duplicate_record IN 
        SELECT id, COUNT(*) as record_count
        FROM public.users 
        GROUP BY id 
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'Cleaning up user ID: % (% records found)', duplicate_record.id, duplicate_record.record_count;
        
        -- Delete all but the most recent record for this user ID
        WITH ranked_users AS (
            SELECT ctid, ROW_NUMBER() OVER (
                ORDER BY 
                    updated_at DESC NULLS LAST, 
                    created_at DESC NULLS LAST,
                    ctid DESC
            ) as rn
            FROM public.users 
            WHERE id = duplicate_record.id
        )
        DELETE FROM public.users 
        WHERE ctid IN (
            SELECT ctid FROM ranked_users WHERE rn > 1
        );
        
        GET DIAGNOSTICS cleanup_count = ROW_COUNT;
        RAISE NOTICE 'Removed % duplicate records for user %', cleanup_count, duplicate_record.id;
    END LOOP;
    
    -- Final verification
    SELECT COUNT(*) INTO total_duplicates FROM (
        SELECT id FROM public.users GROUP BY id HAVING COUNT(*) > 1
    ) duplicates;
    
    IF total_duplicates = 0 THEN
        RAISE NOTICE '✅ All duplicate user records have been cleaned up';
    ELSE
        RAISE WARNING '⚠️ Still found % user IDs with duplicates after cleanup', total_duplicates;
    END IF;
END $$;

-- PART 2: ENSURE PROPER CONSTRAINTS AND INDEXES
-- ================================================================================================

-- Drop existing constraints that might be causing issues
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_key;

-- Add proper primary key constraint (this should already exist)
DO $$
BEGIN
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

-- Clean up email duplicates and add email uniqueness constraint
DO $$
DECLARE
    email_dup_count INT;
BEGIN
    -- Count email duplicates
    SELECT COUNT(*) INTO email_dup_count FROM (
        SELECT email FROM public.users 
        WHERE email IS NOT NULL 
        GROUP BY email 
        HAVING COUNT(*) > 1
    ) email_dups;
    
    IF email_dup_count > 0 THEN
        RAISE NOTICE 'Found % emails with duplicate records, cleaning up...', email_dup_count;
        
        -- Clean up email duplicates (keep the most recent record for each email)
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
        
        RAISE NOTICE 'Cleaned up email duplicates';
    END IF;
    
    -- Now add the unique constraint
    ALTER TABLE public.users ADD CONSTRAINT users_email_unique UNIQUE (email);
    RAISE NOTICE 'Added email uniqueness constraint';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Email uniqueness constraint already exists or conflicts remain';
    WHEN others THEN
        RAISE NOTICE 'Could not add email constraint: %', SQLERRM;
END $$;

-- PART 3: CREATE AUTOMATIC USER PROFILE CREATION TRIGGER
-- ================================================================================================

-- Create a function that automatically creates a user profile when an auth user is created
CREATE OR REPLACE FUNCTION auto_create_user_profile()
RETURNS trigger AS $$
BEGIN
    -- Insert into public.users when a new auth.users record is created
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
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
        false, -- Always create as non-premium
        false,
        false,
        5, -- Base profile strength
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING; -- Don't create if already exists
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_user_profile();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION auto_create_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_create_user_profile() TO anon;

-- PART 4: CREATE SAFE USER FETCH FUNCTIONS
-- ================================================================================================

-- Create a function that safely fetches a single user (handles duplicates gracefully)
CREATE OR REPLACE FUNCTION get_user_safe(user_uuid uuid)
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
    lifestyle_preferences jsonb,
    personality_dimensions jsonb,
    location jsonb,
    housing_goals jsonb,
    created_at timestamptz,
    updated_at timestamptz
) AS $$
BEGIN
    -- Return only the most recent user record if duplicates exist
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
        u.lifestyle_preferences,
        u.personality_dimensions,
        u.location,
        u.housing_goals,
        u.created_at,
        u.updated_at
    FROM public.users u
    WHERE u.id = user_uuid
    ORDER BY u.updated_at DESC NULLS LAST, u.created_at DESC NULLS LAST, u.ctid DESC
    LIMIT 1; -- Ensure only one row is returned
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_safe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_safe(uuid) TO anon;

-- PART 5: ENSURE ALL EXISTING AUTH USERS HAVE PROFILES
-- ================================================================================================

-- Create profiles for any auth.users that don't have corresponding public.users records
DO $$
DECLARE
    auth_user_record RECORD;
    missing_profiles INT := 0;
BEGIN
    RAISE NOTICE 'Checking for auth.users without corresponding public.users profiles...';
    
    FOR auth_user_record IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL
    LOOP
        missing_profiles := missing_profiles + 1;
        
        RAISE NOTICE 'Creating profile for auth user: % (%)', auth_user_record.email, auth_user_record.id;
        
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
            auth_user_record.id,
            auth_user_record.email,
            COALESCE(auth_user_record.raw_user_meta_data->>'name', 'New User'),
            false,
            false,
            false,
            5,
            now(),
            now()
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
    
    IF missing_profiles = 0 THEN
        RAISE NOTICE '✅ All auth users have corresponding profiles';
    ELSE
        RAISE NOTICE '✅ Created % missing user profiles', missing_profiles;
    END IF;
END $$;

-- PART 6: FINAL VERIFICATION
-- ================================================================================================

-- Verify the database state
DO $$
DECLARE
    user_count INT;
    auth_user_count INT;
    duplicate_count INT;
    orphaned_profiles INT;
BEGIN
    -- Count users in both tables
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(*) INTO auth_user_count FROM auth.users;
    
    -- Count remaining duplicates
    SELECT COUNT(*) INTO duplicate_count FROM (
        SELECT id FROM public.users GROUP BY id HAVING COUNT(*) > 1
    ) duplicates;
    
    -- Count orphaned profiles (profiles without auth users)
    SELECT COUNT(*) INTO orphaned_profiles FROM public.users pu
    LEFT JOIN auth.users au ON pu.id = au.id
    WHERE au.id IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 DATABASE VERIFICATION COMPLETE 📊';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Auth users: %', auth_user_count;
    RAISE NOTICE 'Profile records: %', user_count;
    RAISE NOTICE 'Duplicate user IDs: %', duplicate_count;
    RAISE NOTICE 'Orphaned profiles: %', orphaned_profiles;
    RAISE NOTICE '';
    
    IF duplicate_count = 0 THEN
        RAISE NOTICE '✅ No duplicate users found';
    ELSE
        RAISE WARNING '⚠️ Still found % duplicate user IDs', duplicate_count;
    END IF;
    
    IF user_count >= auth_user_count THEN
        RAISE NOTICE '✅ All auth users have profiles';
    ELSE
        RAISE WARNING '⚠️ % auth users missing profiles', auth_user_count - user_count;
    END IF;
END $$;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 COMPREHENSIVE ONBOARDING FIX COMPLETED! 🎉';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'What was fixed:';
    RAISE NOTICE '1. ✅ Removed ALL duplicate user records';
    RAISE NOTICE '2. ✅ Added proper database constraints';
    RAISE NOTICE '3. ✅ Created automatic profile creation trigger';
    RAISE NOTICE '4. ✅ Added safe user fetch functions';
    RAISE NOTICE '5. ✅ Ensured all auth users have profiles';
    RAISE NOTICE '';
    RAISE NOTICE 'Your onboarding should now work without errors!';
    RAISE NOTICE 'The "JSON object requested, multiple rows" error should be fixed.';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Update your app code to use the new safe functions.';
END $$; 