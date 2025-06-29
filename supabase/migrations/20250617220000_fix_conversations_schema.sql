-- Fix conversations table schema to match ConversationRepository expectations
-- This migration ensures conversations table has the correct structure

-- Add missing columns to conversations table if they don't exist
DO $$ 
BEGIN
    -- Add participants column as array if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' AND column_name = 'participants'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN participants text[];
        CREATE INDEX IF NOT EXISTS idx_conversations_participants_gin ON public.conversations USING GIN(participants);
    END IF;

    -- Add match_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' AND column_name = 'match_id'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN match_id uuid REFERENCES public.matches(id);
        CREATE INDEX IF NOT EXISTS idx_conversations_match_id ON public.conversations(match_id);
    END IF;

    -- Ensure created_at and updated_at exist with proper defaults
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN created_at timestamptz DEFAULT now();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Ensure matches table has the correct structure
DO $$ 
BEGIN
    -- Add conversation_id to matches if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'conversation_id'
    ) THEN
        ALTER TABLE public.matches ADD COLUMN conversation_id uuid REFERENCES public.conversations(id);
        CREATE INDEX IF NOT EXISTS idx_matches_conversation_id ON public.matches(conversation_id);
    END IF;

    -- Ensure user1_id and user2_id exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'user1_id'
    ) THEN
        ALTER TABLE public.matches ADD COLUMN user1_id uuid REFERENCES public.users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'user2_id'
    ) THEN
        ALTER TABLE public.matches ADD COLUMN user2_id uuid REFERENCES public.users(id);
    END IF;
END $$;

-- Create helper function to create conversation from match
CREATE OR REPLACE FUNCTION create_conversation_from_match_simple(match_uuid uuid)
RETURNS uuid AS $$
DECLARE
    conversation_id uuid;
    user1_id uuid;
    user2_id uuid;
BEGIN
    -- Get match participants
    SELECT user1_id, user2_id INTO user1_id, user2_id
    FROM public.matches 
    WHERE id = match_uuid;
    
    IF user1_id IS NULL OR user2_id IS NULL THEN
        RAISE EXCEPTION 'Match not found or invalid: %', match_uuid;
    END IF;
    
    -- Create conversation with participants array
    INSERT INTO public.conversations (participants, match_id, created_at, updated_at)
    VALUES (ARRAY[user1_id::text, user2_id::text], match_uuid, now(), now())
    RETURNING id INTO conversation_id;
    
    -- Update match with conversation_id
    UPDATE public.matches 
    SET conversation_id = conversation_id 
    WHERE id = match_uuid;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_conversation_from_match_simple(uuid) TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION create_conversation_from_match_simple(uuid) IS 'Simple function to create a conversation from a match using participants array';
COMMENT ON COLUMN public.conversations.participants IS 'Array of user IDs participating in this conversation';
COMMENT ON COLUMN public.conversations.match_id IS 'Reference to the match that created this conversation'; 