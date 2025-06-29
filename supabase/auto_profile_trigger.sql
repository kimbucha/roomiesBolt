-- Function to automatically create a minimal user profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
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
  );
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run this function after a new user is inserted in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
