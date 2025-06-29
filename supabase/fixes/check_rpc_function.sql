-- Check if the create_user_profile function exists and reinstall it
-- Run this in the Supabase SQL Editor

-- Check if the function exists
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'create_user_profile'
  AND routine_schema = 'public';

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
    RETURN false;
END;
$$;

-- Grant execute permission to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon;

-- Verify the function exists
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'create_user_profile'
  AND routine_schema = 'public'; 