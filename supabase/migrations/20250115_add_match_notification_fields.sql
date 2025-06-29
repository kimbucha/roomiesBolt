-- =====================================================
-- Add Match Notification Fields - Minimal Migration
-- =====================================================
-- This migration adds only the necessary fields for match card notifications
-- without recreating existing tables

-- Add notification fields to matches table if they don't exist
DO $$ 
BEGIN
    -- Add has_unread_messages field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'has_unread_messages'
    ) THEN
        ALTER TABLE public.matches ADD COLUMN has_unread_messages boolean DEFAULT false;
        CREATE INDEX IF NOT EXISTS idx_matches_unread ON public.matches(has_unread_messages) WHERE has_unread_messages = true;
    END IF;

    -- Add last_message_at field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'last_message_at'
    ) THEN
        ALTER TABLE public.matches ADD COLUMN last_message_at timestamptz;
        CREATE INDEX IF NOT EXISTS idx_matches_last_message ON public.matches(last_message_at DESC NULLS LAST);
    END IF;

    -- Add initiated_conversation_by field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'initiated_conversation_by'
    ) THEN
        ALTER TABLE public.matches ADD COLUMN initiated_conversation_by uuid REFERENCES public.users(id);
    END IF;
END $$;

-- Add initiated_by field to conversations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' AND column_name = 'initiated_by'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN initiated_by uuid REFERENCES public.users(id);
        CREATE INDEX IF NOT EXISTS idx_conversations_initiated_by ON public.conversations(initiated_by);
    END IF;
END $$;

-- Create helper function to mark messages as read (if not exists)
CREATE OR REPLACE FUNCTION mark_messages_as_read(
    conversation_uuid uuid, 
    user_uuid uuid
)
RETURNS void AS $$
BEGIN
    -- Update read receipts in messages
    UPDATE public.messages 
    SET read_receipts = read_receipts || jsonb_build_object(user_uuid::text, NOW())
    WHERE conversation_id = conversation_uuid 
    AND sender_id != user_uuid
    AND NOT (read_receipts ? user_uuid::text);
    
    -- Update participant's last_read_at if conversation_participants table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') THEN
        UPDATE public.conversation_participants
        SET last_read_at = NOW()
        WHERE conversation_id = conversation_uuid 
        AND user_id = user_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_messages_as_read(uuid, uuid) TO authenticated;

-- Create function to create conversation from match (if not exists)
CREATE OR REPLACE FUNCTION create_conversation_from_match(match_uuid uuid)
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
    
    -- Create conversation
    INSERT INTO public.conversations (match_id)
    VALUES (match_uuid)
    RETURNING id INTO conversation_id;
    
    -- Add participants if conversation_participants table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') THEN
        INSERT INTO public.conversation_participants (conversation_id, user_id)
        VALUES 
            (conversation_id, user1_id),
            (conversation_id, user2_id);
    END IF;
    
    -- Update match with conversation_id
    UPDATE public.matches 
    SET conversation_id = conversation_id 
    WHERE id = match_uuid;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_conversation_from_match(uuid) TO authenticated;

COMMENT ON FUNCTION mark_messages_as_read(uuid, uuid) IS 'Mark messages as read for a user in a conversation';
COMMENT ON FUNCTION create_conversation_from_match(uuid) IS 'Create a conversation from a match and return conversation ID'; 