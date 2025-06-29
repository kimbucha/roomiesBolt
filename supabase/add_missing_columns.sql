-- Add missing columns to users table
DO $$
BEGIN
  -- Add completed_steps column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'completed_steps'
  ) THEN
    ALTER TABLE public.users ADD COLUMN completed_steps TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added completed_steps column to users table';
  ELSE
    RAISE NOTICE 'completed_steps column already exists in users table';
  END IF;

  -- Add email_verified column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE public.users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added email_verified column to users table';
  ELSE
    RAISE NOTICE 'email_verified column already exists in users table';
  END IF;

  -- Add profile_strength column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'profile_strength'
  ) THEN
    ALTER TABLE public.users ADD COLUMN profile_strength INTEGER DEFAULT 10;
    RAISE NOTICE 'Added profile_strength column to users table';
  ELSE
    RAISE NOTICE 'profile_strength column already exists in users table';
  END IF;
END
$$;
