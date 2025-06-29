-- Migration: Simple Premium Account Defaults Fix
-- Date: January 27, 2025
-- Purpose: Ensure all users default to free tier without breaking existing functions

-- 1. Ensure is_premium column defaults to false
ALTER TABLE public.users 
ALTER COLUMN is_premium SET DEFAULT false;

-- 2. Update any existing test/demo users that might have been incorrectly set to premium
UPDATE public.users 
SET is_premium = false 
WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%@testuser%';

-- 3. Add subscription tier column for better premium management
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';

-- 4. Add subscription expiry for premium users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone;

-- 5. Add constraint for subscription_tier if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'users_subscription_tier_check'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_subscription_tier_check 
    CHECK (subscription_tier IN ('free', 'premium'));
  END IF;
END $$;

-- 6. Create premium feature check function
CREATE OR REPLACE FUNCTION public.can_view_premium_feature(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id 
    AND is_premium = true 
    AND (subscription_expires_at IS NULL OR subscription_expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create pending likes count function
CREATE OR REPLACE FUNCTION public.get_pending_likes_count(user_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT count(*)::integer
    FROM public.pending_likes
    WHERE user_id = $1
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If pending_likes view doesn't exist, return 0
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create simple pending likes view (if swipes table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swipes') THEN
    DROP VIEW IF EXISTS public.pending_likes;
    CREATE VIEW public.pending_likes AS
    SELECT 
      s.target_user_id as user_id,
      s.user_id as liker_id,
      s.action,
      s.created_at,
      u.name as liker_name,
      u.profile_image_url as liker_image
    FROM public.swipes s
    JOIN public.users u ON s.user_id = u.id
    WHERE s.action IN ('like', 'superLike')
      -- Only show likes where there's no mutual match yet
      AND NOT EXISTS (
        SELECT 1 FROM public.swipes s2 
        WHERE s2.user_id = s.target_user_id 
        AND s2.target_user_id = s.user_id 
        AND s2.action IN ('like', 'superLike')
      );
  END IF;
END $$;

-- 9. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users(subscription_tier);

-- 10. Add comments for documentation
COMMENT ON COLUMN public.users.subscription_tier IS 'User subscription level: free or premium';
COMMENT ON COLUMN public.users.subscription_expires_at IS 'When premium subscription expires (NULL for free users)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Simple premium defaults migration completed successfully';
  RAISE NOTICE 'All new users will now default to free tier';
  RAISE NOTICE 'is_premium column default set to false';
END $$; 