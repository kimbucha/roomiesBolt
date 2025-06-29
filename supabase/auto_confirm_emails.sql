-- Function to automatically confirm all emails in development environment
-- IMPORTANT: Only use this in development, never in production!

-- Option 1: One-time confirmation for all existing users
CREATE OR REPLACE FUNCTION confirm_all_existing_emails()
RETURNS void AS $$
BEGIN
  UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, now());
  RAISE NOTICE 'All existing user emails have been confirmed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Option 2: Trigger to auto-confirm all new signups
CREATE OR REPLACE FUNCTION auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Set email as confirmed immediately
  NEW.email_confirmed_at := now();
  
  -- Log the auto-confirmation (helpful for debugging)
  RAISE LOG 'Auto-confirmed email for user: %', NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run on new user creation
DROP TRIGGER IF EXISTS trigger_auto_confirm_email ON auth.users;
CREATE TRIGGER trigger_auto_confirm_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_email();

-- Run this to confirm all existing users
SELECT confirm_all_existing_emails();

-- IMPORTANT: Comment out this trigger in production!
-- To disable this trigger in production, run:
-- DROP TRIGGER IF EXISTS trigger_auto_confirm_email ON auth.users;
