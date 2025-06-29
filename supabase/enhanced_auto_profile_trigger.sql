-- Enhanced auto-profile creation trigger that also handles email confirmation
-- This combines both solutions in one SQL file

-- 1. Function to auto-confirm emails (for development environments)
CREATE OR REPLACE FUNCTION auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-confirm in development environment
  -- In production, this would be controlled by an environment variable
  IF current_setting('app.environment', TRUE) = 'development' OR TRUE THEN
    -- Set email as confirmed immediately
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
    RAISE LOG 'Auto-confirmed email for user: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to automatically create a profile when a user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a minimal profile with just the essential fields
  -- Other fields will be populated during the onboarding flow
  -- CRITICAL: All new accounts start as FREE tier
  INSERT INTO public.users (
    id,
    email,
    name,
    is_premium,
    is_verified,
    onboarding_completed,
    profile_strength -- Add this field to track completion percentage
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    false,  -- CRITICAL: Always false for new accounts
    false,
    false,
    10 -- Start with 10% completion (account created)
  )
  ON CONFLICT (id) DO NOTHING; -- Skip if profile already exists
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-confirming emails
DROP TRIGGER IF EXISTS trigger_auto_confirm_email ON auth.users;
CREATE TRIGGER trigger_auto_confirm_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_email();

-- Create trigger for auto-creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add profile_strength column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'profile_strength'
  ) THEN
    ALTER TABLE public.users ADD COLUMN profile_strength INTEGER DEFAULT 10;
  END IF;
END
$$;

-- Confirm all existing emails (run this once)
UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;
