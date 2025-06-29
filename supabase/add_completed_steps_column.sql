-- Add completed_steps column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'completed_steps'
  ) THEN
    ALTER TABLE public.users ADD COLUMN completed_steps TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added completed_steps column to users table';
  ELSE
    RAISE NOTICE 'completed_steps column already exists in users table';
  END IF;
END
$$;
