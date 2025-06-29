-- Migrate existing matches table to unified user-to-profile model
-- This enables matches between users AND between users and places

-- Step 1: Add new columns for unified match model
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS target_profile_id UUID REFERENCES public.roommate_profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS match_type TEXT DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS is_mutual BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 2: Create migration function to convert existing matches
CREATE OR REPLACE FUNCTION migrate_matches_to_unified()
RETURNS void AS $$
DECLARE
  match_record RECORD;
  target_profile UUID;
BEGIN
  -- Migrate existing matches to new format
  FOR match_record IN 
    SELECT id, user1_id, user2_id, user1_action, user2_action, status, conversation_id, created_at
    FROM public.matches 
    WHERE user_id IS NULL -- Only migrate unmigrated records
  LOOP
    -- Find the roommate_profile for user2
    SELECT rp.id INTO target_profile 
    FROM public.roommate_profiles rp 
    WHERE rp.user_id = match_record.user2_id;
    
    IF target_profile IS NOT NULL THEN
      -- Update the match record with new format
      UPDATE public.matches SET
        user_id = match_record.user1_id,
        target_profile_id = target_profile,
        target_user_id = match_record.user2_id,
        match_type = CASE 
          WHEN match_record.status = 'superMatched' THEN 'super'
          WHEN match_record.status = 'mixedMatched' THEN 'mixed'
          ELSE 'regular'
        END,
        is_mutual = CASE 
          WHEN match_record.status IN ('matched', 'superMatched', 'mixedMatched') THEN true
          ELSE false
        END,
        is_active = true
      WHERE id = match_record.id;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Migrated matches to unified format';
END;
$$ LANGUAGE plpgsql;

-- Step 3: Run the migration
SELECT migrate_matches_to_unified();

-- Step 4: Make new columns NOT NULL where appropriate
DO $$
DECLARE
  matches_count INTEGER;
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO matches_count FROM public.matches;
  SELECT COUNT(*) INTO migrated_count FROM public.matches WHERE user_id IS NOT NULL;
  
  IF matches_count = migrated_count THEN
    -- All matches migrated successfully
    ALTER TABLE public.matches 
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN target_profile_id SET NOT NULL;
    
    RAISE NOTICE 'Set unified match columns as NOT NULL - migration successful';
  ELSE
    RAISE NOTICE 'Migration incomplete: % total matches, % migrated', matches_count, migrated_count;
  END IF;
END
$$;

-- Step 5: Add match_type constraint
ALTER TABLE public.matches 
ADD CONSTRAINT check_match_type 
CHECK (match_type IN ('regular', 'super', 'mixed', 'place_interest'));

-- Step 6: Update unique constraint
ALTER TABLE public.matches 
DROP CONSTRAINT IF EXISTS matches_user1_id_user2_id_key;

ALTER TABLE public.matches 
ADD CONSTRAINT matches_user_id_target_profile_id_key 
UNIQUE (user_id, target_profile_id);

-- Step 7: Add new indexes
CREATE INDEX IF NOT EXISTS idx_matches_user_id_new ON public.matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_target_profile_id_new ON public.matches(target_profile_id);
CREATE INDEX IF NOT EXISTS idx_matches_target_user_id_new ON public.matches(target_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_match_type ON public.matches(match_type);
CREATE INDEX IF NOT EXISTS idx_matches_is_mutual ON public.matches(is_mutual);
CREATE INDEX IF NOT EXISTS idx_matches_is_active_new ON public.matches(is_active);

-- Step 8: Add updated_at column if missing
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing records
UPDATE public.matches 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Step 9: Update RLS policies for new structure
DROP POLICY IF EXISTS "Users can read their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can read their matches" ON public.matches;

CREATE POLICY "Users can view their unified matches" ON public.matches
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = target_user_id);

CREATE POLICY "System can create unified matches" ON public.matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their unified matches" ON public.matches
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = target_user_id);

-- Step 10: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_matches_updated_at_trigger ON public.matches;
CREATE TRIGGER update_matches_updated_at_trigger
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION update_matches_updated_at();

-- Step 11: Clean up migration function
DROP FUNCTION IF EXISTS migrate_matches_to_unified();

-- Step 12: Add helpful comments
COMMENT ON COLUMN public.matches.user_id IS 'User who initiated the match (swiper)';
COMMENT ON COLUMN public.matches.target_profile_id IS 'Profile that was matched (user profile or place)';
COMMENT ON COLUMN public.matches.target_user_id IS 'User who owns the target profile';
COMMENT ON COLUMN public.matches.match_type IS 'Type of match: regular, super, mixed, or place_interest';
COMMENT ON COLUMN public.matches.is_mutual IS 'Whether both parties have expressed interest';
COMMENT ON COLUMN public.matches.is_active IS 'Whether the match is still active';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Matches table migration completed successfully!';
  RAISE NOTICE '📊 Total matches: %', (SELECT COUNT(*) FROM public.matches);
  RAISE NOTICE '🤝 Unified matches: %', (SELECT COUNT(*) FROM public.matches WHERE user_id IS NOT NULL);
  RAISE NOTICE '💕 Mutual matches: %', (SELECT COUNT(*) FROM public.matches WHERE is_mutual = true);
END
$$; 