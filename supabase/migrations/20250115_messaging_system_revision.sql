-- =====================================================
-- Messaging System Revision - Final Schema Migration
-- =====================================================
-- This migration establishes the clean, optimized messaging schema
-- replacing the multiple conflicting table structures

-- Drop existing conflicting tables if they exist
DROP TABLE IF EXISTS public.conversation_participants CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;  
DROP TABLE IF EXISTS public.conversations CASCADE;

-- =====================================================
-- CORE MESSAGING TABLES
-- =====================================================

-- Conversations (Primary entity for all message threads)
CREATE TABLE public.conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id uuid REFERENCES public.matches(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    last_message_id uuid, -- Will reference messages after table creation
    participant_count integer DEFAULT 2 NOT NULL,
    metadata jsonb DEFAULT '{}' NOT NULL
);

-- Messages (Optimized for performance and functionality)
CREATE TABLE public.messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    message_type text DEFAULT 'text' NOT NULL CHECK (message_type IN ('text', 'image', 'system')),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    read_receipts jsonb DEFAULT '{}' NOT NULL,
    metadata jsonb DEFAULT '{}' NOT NULL
);

-- Conversation Participants (Many-to-many relationship)
CREATE TABLE public.conversation_participants (
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    joined_at timestamptz DEFAULT now() NOT NULL,
    last_read_at timestamptz,
    notification_settings jsonb DEFAULT '{}' NOT NULL,
    PRIMARY KEY (conversation_id, user_id)
);

-- Add foreign key for last_message_id after messages table exists
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_last_message_fkey 
FOREIGN KEY (last_message_id) REFERENCES public.messages(id) ON DELETE SET NULL;

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Critical indexes for messaging performance
CREATE INDEX idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_conversations_updated ON public.conversations(updated_at DESC);
CREATE INDEX idx_conversations_match ON public.conversations(match_id) WHERE match_id IS NOT NULL;
CREATE INDEX idx_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_participants_conversation ON public.conversation_participants(conversation_id);

-- Partial indexes for common queries
CREATE INDEX idx_messages_unread ON public.messages(conversation_id, created_at) 
WHERE (read_receipts = '{}' OR read_receipts IS NULL);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only see conversations they're part of
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (
        id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their conversations" ON public.conversations
    FOR UPDATE USING (
        id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Messages: Users can only see messages in their conversations
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Conversation Participants: Users can see their own participation records
CREATE POLICY "Users can view their participation" ON public.conversation_participants
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their participation" ON public.conversation_participants
    FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update conversation.updated_at when messages are added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET updated_at = NOW(),
        last_message_id = NEW.id
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp on new messages
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Function to update message.updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update messages.updated_at
CREATE TRIGGER trigger_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update conversations.updated_at
CREATE TRIGGER trigger_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION OF EXISTING DATA
-- =====================================================

-- Add conversation_id to matches table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'conversation_id'
    ) THEN
        ALTER TABLE public.matches ADD COLUMN conversation_id uuid REFERENCES public.conversations(id);
        CREATE INDEX idx_matches_conversation ON public.matches(conversation_id) WHERE conversation_id IS NOT NULL;
    END IF;
END $$;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for conversations with participant details
CREATE OR REPLACE VIEW conversation_details AS
SELECT 
    c.id,
    c.match_id,
    c.created_at,
    c.updated_at,
    c.last_message_id,
    c.participant_count,
    COALESCE(
        json_agg(
            json_build_object(
                'user_id', cp.user_id,
                'joined_at', cp.joined_at,
                'last_read_at', cp.last_read_at,
                'name', u.name,
                'avatar_url', u.profile_image_url
            )
        ) FILTER (WHERE cp.user_id IS NOT NULL), 
        '[]'::json
    ) as participants,
    lm.content as last_message_content,
    lm.sender_id as last_message_sender_id,
    lm.created_at as last_message_created_at
FROM public.conversations c
LEFT JOIN public.conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN public.users u ON cp.user_id = u.id
LEFT JOIN public.messages lm ON c.last_message_id = lm.id
GROUP BY c.id, c.match_id, c.created_at, c.updated_at, c.last_message_id, 
         c.participant_count, lm.content, lm.sender_id, lm.created_at;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to create a conversation from a match
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
    
    -- Add participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
        (conversation_id, user1_id),
        (conversation_id, user2_id);
    
    -- Update match with conversation_id
    UPDATE public.matches 
    SET conversation_id = conversation_id 
    WHERE id = match_uuid;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark messages as read
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
    
    -- Update participant's last_read_at
    UPDATE public.conversation_participants
    SET last_read_at = NOW()
    WHERE conversation_id = conversation_uuid 
    AND user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.conversation_participants TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION create_conversation_from_match(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_messages_as_read(uuid, uuid) TO authenticated;

COMMENT ON TABLE public.conversations IS 'Primary table for message threads between users';
COMMENT ON TABLE public.messages IS 'Individual messages within conversations';
COMMENT ON TABLE public.conversation_participants IS 'Many-to-many relationship between users and conversations';
COMMENT ON VIEW conversation_details IS 'Optimized view for fetching conversations with participant details'; 