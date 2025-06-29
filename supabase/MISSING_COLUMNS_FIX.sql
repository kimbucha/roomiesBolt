-- ================================================================================================
-- MISSING COLUMNS FIX FOR ONBOARDING ERRORS
-- ================================================================================================
-- This script adds the missing columns that are causing onboarding profile update errors
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/hybyjgpcbcqpndxrquqv/sql
-- ================================================================================================

-- PART 1: CHECK CURRENT SCHEMA AND ADD MISSING COLUMNS
-- ================================================================================================

DO $$
DECLARE
    missing_count INT := 0;
BEGIN
    RAISE NOTICE '🔍 Checking for missing columns in users table...';
    
    -- Check and add personality_traits column
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'personality_traits'
    ) THEN
        ALTER TABLE public.users ADD COLUMN personality_traits text[];
        missing_count := missing_count + 1;
        RAISE NOTICE '✅ Added personality_traits column (text array)';
    ELSE
        RAISE NOTICE '   personality_traits column already exists';
    END IF;
    
    -- Check and add company column
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'company'
    ) THEN
        ALTER TABLE public.users ADD COLUMN company text;
        missing_count := missing_count + 1;
        RAISE NOTICE '✅ Added company column (text)';
    ELSE
        RAISE NOTICE '   company column already exists';
    END IF;
    
    -- Check and add role column
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.users ADD COLUMN role text;
        missing_count := missing_count + 1;
        RAISE NOTICE '✅ Added role column (text)';
    ELSE
        RAISE NOTICE '   role column already exists';
    END IF;
    
    -- Check and add profile_picture column (different from profile_image_url)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'profile_picture'
    ) THEN
        ALTER TABLE public.users ADD COLUMN profile_picture text;
        missing_count := missing_count + 1;
        RAISE NOTICE '✅ Added profile_picture column (text)';
    ELSE
        RAISE NOTICE '   profile_picture column already exists';
    END IF;
    
    -- Check and add university column (if missing)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'university'
    ) THEN
        ALTER TABLE public.users ADD COLUMN university text;
        missing_count := missing_count + 1;
        RAISE NOTICE '✅ Added university column (text)';
    ELSE
        RAISE NOTICE '   university column already exists';
    END IF;
    
    -- Check and add major column (if missing)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'major'
    ) THEN
        ALTER TABLE public.users ADD COLUMN major text;
        missing_count := missing_count + 1;
        RAISE NOTICE '✅ Added major column (text)';
    ELSE
        RAISE NOTICE '   major column already exists';
    END IF;
    
    -- Check and add year column (if missing)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'year'
    ) THEN
        ALTER TABLE public.users ADD COLUMN year text;
        missing_count := missing_count + 1;
        RAISE NOTICE '✅ Added year column (text)';
    ELSE
        RAISE NOTICE '   year column already exists';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 SUMMARY: Added % missing columns', missing_count;
END $$;

-- PART 2: ADD INDEXES FOR PERFORMANCE
-- ================================================================================================

-- Add indexes for the new columns (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_users_personality_traits_gin ON public.users USING gin(personality_traits);
CREATE INDEX IF NOT EXISTS idx_users_company ON public.users(company);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_profile_picture ON public.users(profile_picture);
CREATE INDEX IF NOT EXISTS idx_users_university ON public.users(university);
CREATE INDEX IF NOT EXISTS idx_users_major ON public.users(major);
CREATE INDEX IF NOT EXISTS idx_users_year ON public.users(year);

-- PART 3: ADD COLUMN COMMENTS FOR DOCUMENTATION
-- ================================================================================================

COMMENT ON COLUMN public.users.personality_traits IS 'Array of personality traits selected during onboarding (e.g., studious, creative, etc.)';
COMMENT ON COLUMN public.users.company IS 'Company name where user works (alternative to university)';
COMMENT ON COLUMN public.users.role IS 'Job title/role at company (alternative to major)';
COMMENT ON COLUMN public.users.profile_picture IS 'Profile picture identifier (can be URL, local identifier, or personality_image)';
COMMENT ON COLUMN public.users.university IS 'University name for education';
COMMENT ON COLUMN public.users.major IS 'Academic major/field of study';
COMMENT ON COLUMN public.users.year IS 'Academic year or graduation year';

-- PART 4: VERIFY THE SCHEMA IS COMPLETE
-- ================================================================================================

DO $$
DECLARE
    column_count INT;
    required_columns text[] := ARRAY[
        'id', 'email', 'name', 'created_at', 'updated_at', 'is_premium', 'is_verified', 
        'profile_image_url', 'onboarding_completed', 'budget_min', 'budget_max', 
        'preferred_locations', 'location', 'lifestyle_preferences', 'lifestyle_answers',
        'personality_type', 'personality_dimensions', 'housing_goals', 'move_in_timeframe',
        'gender', 'roommate_preferences', 'additional_photos', 'date_of_birth',
        'completed_steps', 'profile_strength', 'personality_traits', 'company', 'role',
        'profile_picture', 'university', 'major', 'year'
    ];
    col text;
    missing_cols text[] := '{}';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 FINAL SCHEMA VERIFICATION';
    RAISE NOTICE '============================';
    
    -- Check each required column
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = col
        ) THEN
            missing_cols := array_append(missing_cols, col);
        END IF;
    END LOOP;
    
    -- Get total column count
    SELECT count(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users';
    
    RAISE NOTICE 'Total columns in users table: %', column_count;
    RAISE NOTICE 'Required columns checked: %', array_length(required_columns, 1);
    
    IF array_length(missing_cols, 1) > 0 THEN
        RAISE WARNING '⚠️ Missing columns: %', array_to_string(missing_cols, ', ');
    ELSE
        RAISE NOTICE '✅ All required columns are present!';
    END IF;
END $$;

-- PART 5: SUCCESS MESSAGE
-- ================================================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 MISSING COLUMNS FIX COMPLETED! 🎉';
    RAISE NOTICE '===================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed columns for onboarding errors:';
    RAISE NOTICE '1. ✅ personality_traits (for about-you step)';
    RAISE NOTICE '2. ✅ company (for education step)';
    RAISE NOTICE '3. ✅ role (for education step)';
    RAISE NOTICE '4. ✅ profile_picture (for photos step)';
    RAISE NOTICE '5. ✅ university, major, year (for education step)';
    RAISE NOTICE '';
    RAISE NOTICE 'Your onboarding should now work without column errors!';
    RAISE NOTICE 'Test the complete flow again.';
END $$; 