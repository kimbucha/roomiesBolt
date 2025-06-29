-- Migration: Add Row Level Security Policies
-- Created: 2025-01-07
-- Purpose: Secure data access with user-specific policies

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all tables that need user-specific access control
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Note: profiles table should already have RLS enabled from initial setup

-- =============================================================================
-- CONVERSATIONS TABLE POLICIES
-- =============================================================================

-- Users can only view conversations they participate in
CREATE POLICY "Users can view own conversations" ON conversations
FOR SELECT USING (
  auth.uid()::text = ANY(participants)
);

-- Users can create conversations (when creating a match)
CREATE POLICY "Users can create conversations" ON conversations
FOR INSERT WITH CHECK (
  auth.uid()::text = ANY(participants)
);

-- Users can update conversations they participate in (for timestamps, etc.)
CREATE POLICY "Users can update own conversations" ON conversations
FOR UPDATE USING (
  auth.uid()::text = ANY(participants)
) WITH CHECK (
  auth.uid()::text = ANY(participants)
);

-- Prevent deletion of conversations (business rule)
-- Only allow via admin/system operations
CREATE POLICY "Prevent conversation deletion" ON conversations
FOR DELETE USING (false);

-- =============================================================================
-- MESSAGES TABLE POLICIES
-- =============================================================================

-- Users can view messages in conversations they participate in
CREATE POLICY "Users can view messages in own conversations" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = messages.conversation_id 
    AND auth.uid()::text = ANY(participants)
  )
);

-- Users can send messages to conversations they participate in
CREATE POLICY "Users can send messages to own conversations" ON messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid()::text AND
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = messages.conversation_id 
    AND auth.uid()::text = ANY(participants)
  )
);

-- Users can update their own messages (for read receipts, edits)
CREATE POLICY "Users can update own messages" ON messages
FOR UPDATE USING (
  sender_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = messages.conversation_id 
    AND auth.uid()::text = ANY(participants)
  )
) WITH CHECK (
  sender_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = messages.conversation_id 
    AND auth.uid()::text = ANY(participants)
  )
);

-- Prevent message deletion (business rule - keep chat history)
CREATE POLICY "Prevent message deletion" ON messages
FOR DELETE USING (false);

-- =============================================================================
-- MATCHES TABLE POLICIES
-- =============================================================================

-- Users can view matches they are part of
CREATE POLICY "Users can view own matches" ON matches
FOR SELECT USING (
  user1_id = auth.uid()::text OR user2_id = auth.uid()::text
);

-- Users can create matches (when swiping results in a match)
-- Note: This should typically be done via stored procedures/functions
CREATE POLICY "Users can create matches" ON matches
FOR INSERT WITH CHECK (
  user1_id = auth.uid()::text OR user2_id = auth.uid()::text
);

-- Users can update matches they are part of (status changes, conversation linking)
CREATE POLICY "Users can update own matches" ON matches
FOR UPDATE USING (
  user1_id = auth.uid()::text OR user2_id = auth.uid()::text
) WITH CHECK (
  user1_id = auth.uid()::text OR user2_id = auth.uid()::text
);

-- Allow users to delete/unmatch
CREATE POLICY "Users can delete own matches" ON matches
FOR DELETE USING (
  user1_id = auth.uid()::text OR user2_id = auth.uid()::text
);

-- =============================================================================
-- SWIPES TABLE POLICIES
-- =============================================================================

-- Users can view their own swipes
CREATE POLICY "Users can view own swipes" ON swipes
FOR SELECT USING (
  swiper_id = auth.uid()::text
);

-- Users can create swipes (when swiping on profiles)
CREATE POLICY "Users can create swipes" ON swipes
FOR INSERT WITH CHECK (
  swiper_id = auth.uid()::text
);

-- Prevent updating swipes (business rule - swipes are immutable)
CREATE POLICY "Prevent swipe updates" ON swipes
FOR UPDATE USING (false);

-- Prevent deleting swipes (business rule - keep swipe history)
CREATE POLICY "Prevent swipe deletion" ON swipes
FOR DELETE USING (false);

-- =============================================================================
-- PROFILES TABLE POLICIES (if not already present)
-- =============================================================================

-- Users can view all profiles (for discovery)
-- Note: This might already exist from initial setup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);
  END IF;
END $$;

-- Users can only update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = id);
  END IF;
END $$;

-- Users can insert their own profile (during onboarding)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id);
  END IF;
END $$;

-- =============================================================================
-- ADMIN BYPASS POLICIES (for system operations)
-- =============================================================================

-- Create a function to check if user has admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin bypass policy for conversations
CREATE POLICY "Admin can manage all conversations" ON conversations
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Admin bypass policy for messages
CREATE POLICY "Admin can manage all messages" ON messages
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Admin bypass policy for matches
CREATE POLICY "Admin can manage all matches" ON matches
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Admin bypass policy for swipes
CREATE POLICY "Admin can view all swipes" ON swipes
FOR SELECT USING (is_admin());

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Query to verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages', 'matches', 'swipes', 'profiles')
ORDER BY tablename;

-- Query to verify all policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages', 'matches', 'swipes', 'profiles')
ORDER BY tablename, policyname; 