-- Complete fix script for Roomies app
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/hybyjgpcbcqpndxrquqv/sql)

-- PART 1: Clean up the problematic user

-- Get the user ID for t@roomies.com
DO $$
DECLARE
    user_id_var UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id_var
    FROM auth.users
    WHERE email = 't@roomies.com';
    
    -- If user exists, clean up all related records
    IF user_id_var IS NOT NULL THEN
        -- Delete from auth.sessions
        DELETE FROM auth.sessions
        WHERE user_id = user_id_var;
        
        -- Delete from auth.refresh_tokens
        DELETE FROM auth.refresh_tokens
        WHERE user_id = user_id_var;
        
        -- Delete from auth.identities
        DELETE FROM auth.identities
        WHERE user_id = user_id_var;
        
        -- Delete from public.users (if it exists)
        DELETE FROM public.users
        WHERE id = user_id_var OR email = 't@roomies.com';
        
        -- Finally, delete from auth.users
        DELETE FROM auth.users
        WHERE id = user_id_var;
        
        RAISE NOTICE 'User t@roomies.com (ID: %) has been completely removed', user_id_var;
    ELSE
        RAISE NOTICE 'User t@roomies.com not found in auth.users';
    END IF;
END $$;

-- PART 2: Reinstall the create_user_profile function

-- Drop and recreate the function
DROP FUNCTION IF EXISTS public.create_user_profile;

-- Function to create a user profile bypassing RLS
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  is_user_premium BOOLEAN DEFAULT false,
  is_user_verified BOOLEAN DEFAULT false,
  is_onboarding_completed BOOLEAN DEFAULT false
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- This is important! It means the function runs with the privileges of the creator
AS $$
BEGIN
  -- Insert the user profile
  INSERT INTO public.users (
    id, 
    email, 
    name, 
    is_premium, 
    is_verified, 
    onboarding_completed
  ) 
  VALUES (
    user_id,
    user_email,
    user_name,
    is_user_premium,
    is_user_verified,
    is_onboarding_completed
  );
  
  RETURN true;
EXCEPTION
  WHEN others THEN
    -- Log the error for debugging
    RAISE NOTICE 'Error in create_user_profile: %', SQLERRM;
    RETURN false;
END;
$$;

-- Grant execute permission to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon;

-- PART 3: Verify everything is fixed

-- Verify the user is completely removed
SELECT id, email FROM auth.users WHERE email = 't@roomies.com';

-- Verify the function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'create_user_profile'
  AND routine_schema = 'public'; 