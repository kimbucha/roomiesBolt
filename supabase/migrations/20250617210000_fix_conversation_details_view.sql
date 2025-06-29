-- Fix missing conversation_details view
-- This view is required by ConversationRepository

-- Drop view if it exists to recreate it
DROP VIEW IF EXISTS public.conversation_details;

-- Create the conversation_details view that ConversationRepository expects
CREATE OR REPLACE VIEW public.conversation_details AS
SELECT 
    c.id,
    c.match_id,
    c.created_at,
    c.updated_at,
    c.last_message_id,
    c.participant_count,
    c.metadata,
    -- Aggregate participants as JSON array
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
    -- Last message details
    lm.content as last_message_content,
    lm.sender_id as last_message_sender_id,
    lm.created_at as last_message_created_at
FROM public.conversations c
LEFT JOIN public.conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN public.users u ON cp.user_id = u.id
LEFT JOIN public.messages lm ON c.last_message_id = lm.id
GROUP BY 
    c.id, 
    c.match_id, 
    c.created_at, 
    c.updated_at, 
    c.last_message_id, 
    c.participant_count,
    c.metadata,
    lm.content, 
    lm.sender_id, 
    lm.created_at;

-- Grant SELECT permission on the view
GRANT SELECT ON public.conversation_details TO authenticated;

-- Add helpful comment
COMMENT ON VIEW public.conversation_details IS 'Detailed view of conversations with participant and last message information for ConversationRepository'; 