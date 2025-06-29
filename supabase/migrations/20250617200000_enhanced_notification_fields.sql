-- Enhanced Match Card Notification Fields
-- This migration adds advanced notification tracking for optimal UX

-- Add enhanced notification fields to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS new_match_notified_at timestamptz,
ADD COLUMN IF NOT EXISTS first_message_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS conversation_started_by uuid REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS match_card_status text DEFAULT 'new' CHECK (match_card_status IN ('new', 'messaged', 'archived'));

-- Add notification tracking to conversations
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS notification_last_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS conversation_priority integer DEFAULT 1;

-- Add message thread tracking
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS thread_type text DEFAULT 'main' CHECK (thread_type IN ('main', 'system', 'notification')),
ADD COLUMN IF NOT EXISTS notification_data jsonb DEFAULT '{}';

-- Create indexes for enhanced performance
CREATE INDEX IF NOT EXISTS idx_matches_card_status 
ON public.matches(match_card_status);

CREATE INDEX IF NOT EXISTS idx_matches_new_notified 
ON public.matches(new_match_notified_at) 
WHERE new_match_notified_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_priority 
ON public.conversations(conversation_priority DESC);

CREATE INDEX IF NOT EXISTS idx_messages_thread_type 
ON public.messages(thread_type, created_at DESC);

-- Enhanced function to create conversation from match with notification tracking
CREATE OR REPLACE FUNCTION create_conversation_from_match_enhanced(
    match_uuid uuid, 
    initiator_user_id uuid
)
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
    
    -- Create conversation with enhanced tracking
    INSERT INTO public.conversations (match_id, initiated_by, conversation_priority)
    VALUES (match_uuid, initiator_user_id, 1)
    RETURNING id INTO conversation_id;
    
    -- Add participants to conversation_participants table
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
        (conversation_id, user1_id),
        (conversation_id, user2_id);
    
    -- Update match with enhanced notification tracking
    UPDATE public.matches 
    SET 
        conversation_id = conversation_id,
        initiated_conversation_by = initiator_user_id,
        conversation_started_by = initiator_user_id,
        first_message_sent_at = NOW(),
        match_card_status = 'messaged'
    WHERE id = match_uuid;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark match as notified
CREATE OR REPLACE FUNCTION mark_match_as_notified(match_uuid uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.matches 
    SET 
        new_match_notified_at = NOW(),
        match_card_status = CASE 
            WHEN match_card_status = 'new' THEN 'new'
            ELSE match_card_status
        END
    WHERE id = match_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_conversation_from_match_enhanced(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_match_as_notified(uuid) TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION create_conversation_from_match_enhanced(uuid, uuid) IS 'Enhanced conversation creation with notification tracking';
COMMENT ON FUNCTION mark_match_as_notified(uuid) IS 'Mark a match as having been notified to the user';

COMMENT ON COLUMN public.matches.new_match_notified_at IS 'When the user was first notified of this new match';
COMMENT ON COLUMN public.matches.first_message_sent_at IS 'When the first message was sent in this match';
COMMENT ON COLUMN public.matches.conversation_started_by IS 'Which user initiated the conversation';
COMMENT ON COLUMN public.matches.match_card_status IS 'Current status of the match card in UI (new, messaged, archived)';
COMMENT ON COLUMN public.conversations.notification_last_sent_at IS 'Last time a notification was sent for this conversation';
COMMENT ON COLUMN public.conversations.conversation_priority IS 'Priority level for conversation ordering (1=highest)';
COMMENT ON COLUMN public.messages.thread_type IS 'Type of message thread (main, system, notification)';
COMMENT ON COLUMN public.messages.notification_data IS 'Additional data for notification-type messages'; 