-- Function to create a user profile bypassing RLS
-- This should be run in the Supabase SQL Editor
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
  -- CRITICAL: Always set is_premium to false for new accounts regardless of input
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
    false,  -- ALWAYS false for new accounts, ignore is_user_premium parameter
    is_user_verified,
    is_onboarding_completed
  );
  
  RETURN true;
EXCEPTION
  WHEN others THEN
    RETURN false;
END;
$$;
