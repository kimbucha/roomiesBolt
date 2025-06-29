-- =============================================
-- ROOMIES COMPLETE SETUP MIGRATION
-- This migration sets up the entire Roomies database schema
-- and populates it with mock data for testing
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: roommate_profiles
-- Core profiles for users (both roommate seekers and place owners)
-- =============================================

-- Drop and recreate roommate_profiles table
DROP TABLE IF EXISTS public.roommate_profiles CASCADE;

CREATE TABLE public.roommate_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Will be linked to auth.users later
    
    -- Basic Info
    name TEXT NOT NULL,
    age INTEGER,
    bio TEXT,
    
    -- Profile Images
    profile_image_url TEXT,
    additional_images TEXT[], -- Array of image URLs
    
    -- Location & Housing
    location TEXT,
    university TEXT,
    hasPlace BOOLEAN DEFAULT false,
    
    -- Place Details (if hasPlace = true)
    place_title TEXT,
    place_description TEXT,
    rent_amount INTEGER,
    room_type TEXT, -- 'private', 'shared', 'studio', etc.
    furnished BOOLEAN DEFAULT false,
    amenities TEXT[], -- Array of amenities
    
    -- Lifestyle & Preferences
    personality_type TEXT, -- MBTI type
    lifestyle_preferences JSONB DEFAULT '{}',
    
    -- Match Scenario for Testing
    matchScenario TEXT DEFAULT 'noMatch', -- 'noMatch', 'instantMatch', 'mutualMatch', 'superMatch', 'mixedMatch'
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- =============================================
-- TABLE: swipes
-- User swipe actions on profiles
-- =============================================

DROP TABLE IF EXISTS public.swipes CASCADE;

CREATE TABLE public.swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swiper_id UUID NOT NULL, -- Will reference profiles later
    swipee_id UUID NOT NULL REFERENCES public.roommate_profiles(id) ON DELETE CASCADE,
    swipe_type TEXT NOT NULL CHECK (swipe_type IN ('like', 'dislike', 'super_like')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure each user can only swipe once per profile
    UNIQUE(swiper_id, swipee_id)
);

-- =============================================
-- TABLE: matches
-- Mutual matches between users
-- =============================================

DROP TABLE IF EXISTS public.matches CASCADE;

CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL, -- Will reference profiles later
    user2_id UUID NOT NULL, -- Will reference profiles later
    match_type TEXT NOT NULL DEFAULT 'regular' CHECK (match_type IN ('regular', 'super', 'mixed', 'place_interest')),
    status TEXT DEFAULT 'matched',
    conversation_id UUID, -- Will be linked to conversations
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique matches
    UNIQUE(user1_id, user2_id)
);

-- =============================================
-- TABLE: conversations
-- Chat conversations between matched users
-- =============================================

DROP TABLE IF EXISTS public.conversations CASCADE;

CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants UUID[] NOT NULL, -- Array of participant IDs
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: messages
-- Individual messages in conversations
-- =============================================

DROP TABLE IF EXISTS public.messages CASCADE;

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL, -- Will reference profiles later
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES for Performance
-- =============================================

-- Roommate Profiles
CREATE INDEX idx_roommate_profiles_user_id ON public.roommate_profiles(user_id);
CREATE INDEX idx_roommate_profiles_location ON public.roommate_profiles(location);
CREATE INDEX idx_roommate_profiles_hasPlace ON public.roommate_profiles(hasPlace);
CREATE INDEX idx_roommate_profiles_is_active ON public.roommate_profiles(is_active);

-- Swipes
CREATE INDEX idx_swipes_swiper_id ON public.swipes(swiper_id);
CREATE INDEX idx_swipes_swipee_id ON public.swipes(swipee_id);
CREATE INDEX idx_swipes_swipe_type ON public.swipes(swipe_type);
CREATE INDEX idx_swipes_created_at ON public.swipes(created_at);

-- Matches
CREATE INDEX idx_matches_user1_id ON public.matches(user1_id);
CREATE INDEX idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX idx_matches_is_active ON public.matches(is_active);
CREATE INDEX idx_matches_created_at ON public.matches(created_at);
CREATE INDEX idx_matches_conversation_id ON public.matches(conversation_id);

-- Conversations
CREATE INDEX idx_conversations_participants ON public.conversations USING GIN(participants);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at);

-- Messages
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.roommate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roommate_profiles (allow all for now, will be restricted later)
CREATE POLICY "Anyone can view active profiles" 
    ON public.roommate_profiles FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Anyone can manage profiles for now" 
    ON public.roommate_profiles FOR ALL 
    USING (true);

-- RLS Policies for other tables (permissive for development)
CREATE POLICY "Development access for swipes" 
    ON public.swipes FOR ALL 
    USING (true);

CREATE POLICY "Development access for matches" 
    ON public.matches FOR ALL 
    USING (true);

CREATE POLICY "Development access for conversations" 
    ON public.conversations FOR ALL 
    USING (true);

CREATE POLICY "Development access for messages" 
    ON public.messages FOR ALL 
    USING (true);

-- =============================================
-- TRIGGERS for updated_at
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_roommate_profiles_updated_at 
    BEFORE UPDATE ON public.roommate_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at 
    BEFORE UPDATE ON public.matches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON public.conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MOCK DATA POPULATION
-- =============================================

-- Insert mock roommate profiles for testing
INSERT INTO public.roommate_profiles (
    name, age, bio, profile_image_url, location, university, hasPlace, 
    place_title, place_description, rent_amount, room_type, furnished, 
    amenities, personality_type, matchScenario, is_active
) VALUES 
-- ROOMMATE SEEKERS (hasPlace = false)
(
    'Alex Chen', 23, 
    'Computer Science student at UC Berkeley. Love hiking, cooking, and Netflix marathons. Looking for a clean, friendly roommate who respects quiet study time.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'Berkeley, CA', 'UC Berkeley', false,
    NULL, NULL, NULL, NULL, NULL, NULL,
    'ENFP', 'noMatch', true
),
(
    'Jamie Rodriguez', 25,
    'Grad student in Environmental Science. Early riser, yoga enthusiast, and plant parent. Seeking a roommate who loves sustainable living and good vibes.',
    'https://images.unsplash.com/photo-1494790108755-2616b612b1d2?w=400',
    'Berkeley, CA', 'UC Berkeley', false,
    NULL, NULL, NULL, NULL, NULL, NULL,
    'ISFJ', 'mixedMatch', true
),
(
    'Riley Thompson', 22,
    'Art major with a passion for photography and indie music. Night owl who loves creative projects. Looking for someone chill who won''t mind my art supplies everywhere.',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    'Berkeley, CA', 'UC Berkeley', false,
    NULL, NULL, NULL, NULL, NULL, NULL,
    'INFP', 'instantMatch', true
),
(
    'Jordan Smith', 24,
    'Business student and coffee addict. Love trying new restaurants and weekend adventures. Seeking a social roommate who enjoys good conversations and exploring the city.',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    'Berkeley, CA', 'UC Berkeley', false,
    NULL, NULL, NULL, NULL, NULL, NULL,
    'ESTP', 'mutualMatch', true
),

-- PLACE OWNERS (hasPlace = true)
(
    'Taylor Kim', 26,
    'Working professional with a beautiful 2BR apartment. Clean, organized, and friendly. Perfect for a graduate student or working professional.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    'Downtown Berkeley, CA', 'UC Berkeley Alumni', true,
    'Beautiful 2BR Near Campus', 'Spacious 2-bedroom apartment just 10 minutes walk to UC Berkeley campus. Newly renovated kitchen, in-unit laundry, and rooftop access. Perfect for students or young professionals.',
    1200, 'private', true,
    ARRAY['WiFi', 'Laundry', 'Kitchen', 'Parking', 'Rooftop Access'],
    'ENTJ', 'superMatch', true
),
(
    'Casey Wong', 28,
    'Software engineer with a modern studio. Tech-savvy, clean, and loves hosting game nights. Great for someone in tech or creative fields.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'North Berkeley, CA', 'UC Berkeley Alumni', true,
    'Modern Studio in North Berkeley', 'Sleek studio apartment with high-speed internet, modern appliances, and a dedicated workspace. Perfect for remote workers or students who value a quiet, productive environment.',
    900, 'studio', true,
    ARRAY['WiFi', 'Workspace', 'Modern Kitchen', 'Parking'],
    'INTJ', 'noMatch', true
),
(
    'Marcus Johnson', 23,
    'Senior at UC Berkeley with an extra room in my shared house. Love basketball, gaming, and having friends over. Looking for someone fun and social.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    'South Berkeley, CA', 'UC Berkeley', true,
    'Shared House Near Telegraph', 'Fun shared house with 4 bedrooms, big common areas, and a backyard. Great for socializing and studying. Close to campus and Telegraph Ave shops and restaurants.',
    800, 'shared', false,
    ARRAY['WiFi', 'Backyard', 'Common Areas', 'Near Campus'],
    'ESFP', 'instantMatch', true
),
(
    'Sam Patel', 25,
    'Graduate student with a quiet 1BR apartment. Perfect for focused studying. Non-smoker, clean, and respectful of personal space.',
    'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400',
    'West Berkeley, CA', 'UC Berkeley', true,
    'Quiet 1BR for Focused Student', 'Peaceful 1-bedroom apartment in a quiet neighborhood. Perfect for graduate students who need a distraction-free environment for research and studying.',
    1000, 'private', false,
    ARRAY['WiFi', 'Quiet', 'Study Space', 'Near Libraries'],
    'ISTJ', 'mutualMatch', true
),

-- ADDITIONAL ROOMMATE SEEKERS
(
    'Ethan Williams', 21,
    'Sophomore studying Psychology. Love outdoor activities, cooking, and movie nights. Looking for a friendly, responsible roommate to share expenses and good times.',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400',
    'Berkeley, CA', 'UC Berkeley', false,
    NULL, NULL, NULL, NULL, NULL, NULL,
    'ENFJ', 'superMatch', true
),
(
    'Olivia Kim', 24,
    'Law student who loves reading, yoga, and weekend farmers markets. Seeking a mature, responsible roommate who values a balanced lifestyle.',
    'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400',
    'Berkeley, CA', 'UC Berkeley Law', false,
    NULL, NULL, NULL, NULL, NULL, NULL,
    'ISFP', 'mixedMatch', true
),
(
    'Noah Davis', 22,
    'Engineering student and part-time barista. Love music, tech gadgets, and weekend hiking. Looking for someone who shares similar interests and keeps things tidy.',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    'Berkeley, CA', 'UC Berkeley', false,
    NULL, NULL, NULL, NULL, NULL, NULL,
    'INTP', 'noMatch', true
);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '🎉 ROOMIES DATABASE SETUP COMPLETE!';
    RAISE NOTICE '📊 Profiles created: %', (SELECT COUNT(*) FROM public.roommate_profiles);
    RAISE NOTICE '🏠 Places available: %', (SELECT COUNT(*) FROM public.roommate_profiles WHERE hasPlace = true);
    RAISE NOTICE '👥 Roommate seekers: %', (SELECT COUNT(*) FROM public.roommate_profiles WHERE hasPlace = false);
    RAISE NOTICE '✅ Schema ready for production!';
END
$$; 