-- Create or modify swipes table for unified profile-based swiping
-- This handles both new installations and existing ones

-- First, check if swipes table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'swipes'
  ) THEN
    -- Create swipes table from scratch
    CREATE TABLE public.swipes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      target_profile_id UUID NOT NULL REFERENCES public.roommate_profiles(id) ON DELETE CASCADE,
      swipe_type TEXT NOT NULL CHECK (swipe_type IN ('like', 'dislike', 'super_like')),
      swiped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      
      -- Ensure each user can only swipe once per profile
      UNIQUE(user_id, target_profile_id)
    );
    
    RAISE NOTICE '✅ Created new swipes table with profile-based structure';
  ELSE
    RAISE NOTICE '⚠️ Swipes table already exists, will be modified by subsequent migration';
  END IF;
END
$$;

-- Add helpful indexes for new table
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON public.swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target_profile_id ON public.swipes(target_profile_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swipe_type ON public.swipes(swipe_type);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped_at ON public.swipes(swiped_at);

-- Add RLS policies
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can create their own swipes" ON public.swipes;

-- Create unified RLS policies
CREATE POLICY "Users can view their own swipes" 
  ON public.swipes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own swipes" 
  ON public.swipes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own swipes" 
  ON public.swipes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own swipes" 
  ON public.swipes FOR DELETE 
  USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE public.swipes IS 'User swipe actions on profiles (both user and place profiles)';
COMMENT ON COLUMN public.swipes.user_id IS 'User who performed the swipe';
COMMENT ON COLUMN public.swipes.target_profile_id IS 'Profile that was swiped (user profile or place listing)';
COMMENT ON COLUMN public.swipes.swipe_type IS 'Type of swipe: like, dislike, or super_like';
COMMENT ON COLUMN public.swipes.swiped_at IS 'When the swipe action occurred';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_swipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_swipes_updated_at_trigger ON public.swipes;
CREATE TRIGGER update_swipes_updated_at_trigger
  BEFORE UPDATE ON public.swipes
  FOR EACH ROW
  EXECUTE FUNCTION update_swipes_updated_at();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎯 Swipes table ready for profile-based swiping!';
  RAISE NOTICE '📊 Current swipes: %', (SELECT COUNT(*) FROM public.swipes);
END
$$; 