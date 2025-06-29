-- SQL functions to safely delete user data from auth tables
-- Run this in the Supabase SQL Editor

-- Function to delete sessions for a user
CREATE OR REPLACE FUNCTION delete_auth_sessions(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges
AS $$
BEGIN
  DELETE FROM auth.sessions
  WHERE user_id = user_id_param;
  
  RAISE NOTICE 'Successfully deleted sessions for user %', user_id_param;
  RETURN true;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error in delete_auth_sessions: %', SQLERRM;
    RETURN false;
END;
$$;

-- Function to delete refresh tokens for a user
CREATE OR REPLACE FUNCTION delete_auth_refresh_tokens(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges
AS $$
BEGIN
  DELETE FROM auth.refresh_tokens
  WHERE user_id = user_id_param;
  
  RAISE NOTICE 'Successfully deleted refresh tokens for user %', user_id_param;
  RETURN true;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error in delete_auth_refresh_tokens: %', SQLERRM;
    RETURN false;
END;
$$;

-- Function to delete identities for a user
CREATE OR REPLACE FUNCTION delete_auth_identities(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges
AS $$
BEGIN
  DELETE FROM auth.identities
  WHERE user_id = user_id_param;
  
  RAISE NOTICE 'Successfully deleted identities for user %', user_id_param;
  RETURN true;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error in delete_auth_identities: %', SQLERRM;
    RETURN false;
END;
$$;

-- Function to delete a user completely
CREATE OR REPLACE FUNCTION delete_user_completely(email_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges
AS $$
DECLARE
  user_id_var UUID;
  success BOOLEAN := false;
BEGIN
  -- Get the user ID
  SELECT id INTO user_id_var
  FROM auth.users
  WHERE email = email_param;
  
  -- If user doesn't exist, return false
  IF user_id_var IS NULL THEN
    RAISE NOTICE 'User with email % not found', email_param;
    RETURN false;
  END IF;
  
  RAISE NOTICE 'Found user with ID % for email %', user_id_var, email_param;
  
  -- Delete from auth.sessions
  BEGIN
    DELETE FROM auth.sessions WHERE user_id = user_id_var;
    success := true;
    RAISE NOTICE 'Successfully deleted sessions for user %', user_id_var;
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Error deleting sessions: %', SQLERRM;
      -- Continue with other deletions
  END;
  
  -- Delete from auth.refresh_tokens
  BEGIN
    DELETE FROM auth.refresh_tokens WHERE user_id = user_id_var;
    success := true;
    RAISE NOTICE 'Successfully deleted refresh tokens for user %', user_id_var;
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Error deleting refresh tokens: %', SQLERRM;
      -- Continue with other deletions
  END;
  
  -- Delete from auth.identities
  BEGIN
    DELETE FROM auth.identities WHERE user_id = user_id_var;
    success := true;
    RAISE NOTICE 'Successfully deleted identities for user %', user_id_var;
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Error deleting identities: %', SQLERRM;
      -- Continue with other deletions
  END;
  
  -- Delete from public.users (if exists)
  BEGIN
    DELETE FROM public.users
    WHERE id = user_id_var OR email = email_param;
    RAISE NOTICE 'Successfully deleted user record for user %', user_id_var;
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Error deleting user record: %', SQLERRM;
      -- Continue with auth.users deletion
  END;
  
  -- Delete from auth.users
  BEGIN
    DELETE FROM auth.users
    WHERE id = user_id_var;
    success := true;
    RAISE NOTICE 'Successfully deleted auth user %', user_id_var;
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Error deleting auth user: %', SQLERRM;
      success := false;
  END;
  
  RETURN success;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error in delete_user_completely: %', SQLERRM;
    RETURN false;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION delete_auth_sessions TO service_role;
GRANT EXECUTE ON FUNCTION delete_auth_refresh_tokens TO service_role;
GRANT EXECUTE ON FUNCTION delete_auth_identities TO service_role;
GRANT EXECUTE ON FUNCTION delete_user_completely TO service_role; 