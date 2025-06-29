-- Add messaging and notification fields for match card management
-- This migration adds only the essential fields needed for the messaging system revision

-- Add notification and conversation tracking fields to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS has_unread_messages boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_message_at timestamptz,
ADD COLUMN IF NOT EXISTS initiated_conversation_by uuid REFERENCES public.users(id);

-- Add initiated_by field to conversations table
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS initiated_by uuid REFERENCES public.users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_unread 
ON public.matches(has_unread_messages) 
WHERE has_unread_messages = true;

CREATE INDEX IF NOT EXISTS idx_matches_last_message 
ON public.matches(last_message_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_conversations_initiated_by 
ON public.conversations(initiated_by);

-- Helper function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
    conversation_uuid uuid, 
    user_uuid uuid
)
RETURNS void AS $$
BEGIN
    -- Update read receipts in messages
    UPDATE public.messages 
    SET is_read = true
    WHERE conversation_id = conversation_uuid 
    AND sender_id != user_uuid
    AND (is_read IS NULL OR is_read = false);
    
    -- Update match unread status
    UPDATE public.matches
    SET has_unread_messages = false
    WHERE conversation_id = conversation_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_messages_as_read(uuid, uuid) TO authenticated;

-- Helper function to create conversation from match
CREATE OR REPLACE FUNCTION create_conversation_from_match(match_uuid uuid, initiator_user_id uuid)
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
    
    -- Validate initiator is one of the match participants
    IF initiator_user_id != user1_id AND initiator_user_id != user2_id THEN
        RAISE EXCEPTION 'Initiator must be one of the match participants';
    END IF;
    
    -- Create conversation
    INSERT INTO public.conversations (match_id, initiated_by)
    VALUES (match_uuid, initiator_user_id)
    RETURNING id INTO conversation_id;
    
    -- Add participants to conversation_participants table
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
        (conversation_id, user1_id),
        (conversation_id, user2_id);
    
    -- Update match with conversation_id and initiator
    UPDATE public.matches 
    SET 
        conversation_id = conversation_id,
        initiated_conversation_by = initiator_user_id
    WHERE id = match_uuid;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_conversation_from_match(uuid, uuid) TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION mark_messages_as_read(uuid, uuid) IS 'Mark messages as read for a user in a conversation and update match unread status';
COMMENT ON FUNCTION create_conversation_from_match(uuid, uuid) IS 'Create a conversation from a match with specified initiator and return conversation ID';
