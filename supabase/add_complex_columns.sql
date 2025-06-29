-- Add missing complex columns to users table
DO $$
BEGIN
  -- Add budget_max column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'budget_max'
  ) THEN
    ALTER TABLE public.users ADD COLUMN budget_max INTEGER;
    RAISE NOTICE 'Added budget_max column to users table';
  ELSE
    RAISE NOTICE 'budget_max column already exists in users table';
  END IF;

  -- Add lifestyle_preferences column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'lifestyle_preferences'
  ) THEN
    ALTER TABLE public.users ADD COLUMN lifestyle_preferences JSONB DEFAULT '{}';
    RAISE NOTICE 'Added lifestyle_preferences column to users table';
  ELSE
    RAISE NOTICE 'lifestyle_preferences column already exists in users table';
  END IF;

  -- Add personality_dimensions column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'personality_dimensions'
  ) THEN
    ALTER TABLE public.users ADD COLUMN personality_dimensions JSONB DEFAULT '{}';
    RAISE NOTICE 'Added personality_dimensions column to users table';
  ELSE
    RAISE NOTICE 'personality_dimensions column already exists in users table';
  END IF;

  -- Add housing_goals column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'housing_goals'
  ) THEN
    ALTER TABLE public.users ADD COLUMN housing_goals JSONB DEFAULT '{}';
    RAISE NOTICE 'Added housing_goals column to users table';
  ELSE
    RAISE NOTICE 'housing_goals column already exists in users table';
  END IF;
  
  -- Check if there are any other columns in the onboarding flow that might be missing
  -- Add location column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'location'
  ) THEN
    ALTER TABLE public.users ADD COLUMN location JSONB DEFAULT '{}';
    RAISE NOTICE 'Added location column to users table';
  ELSE
    RAISE NOTICE 'location column already exists in users table';
  END IF;
  
  -- Add budget_min column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'budget_min'
  ) THEN
    ALTER TABLE public.users ADD COLUMN budget_min INTEGER;
    RAISE NOTICE 'Added budget_min column to users table';
  ELSE
    RAISE NOTICE 'budget_min column already exists in users table';
  END IF;
END
$$;
