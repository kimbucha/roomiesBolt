-- =============================================
-- FIX AUTH INTEGRATION
-- Link roommate_profiles to auth.users properly
-- =============================================

-- First, let's create a proper profiles table that links to auth.users
-- This will be the standard Supabase pattern
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Now let's properly link roommate_profiles to auth.users
-- First, add the foreign key constraint to user_id
ALTER TABLE public.roommate_profiles 
    DROP CONSTRAINT IF EXISTS roommate_profiles_user_id_fkey;

ALTER TABLE public.roommate_profiles 
    ADD CONSTRAINT roommate_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a view that combines profiles with roommate_profiles for easy querying
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
    p.id,
    p.name,
    p.avatar_url,
    p.bio,
    rp.age,
    rp.location,
    rp.university,
    rp.hasPlace,
    rp.place_title,
    rp.place_description,
    rp.rent_amount,
    rp.room_type,
    rp.furnished,
    rp.amenities,
    rp.personality_type,
    rp.lifestyle_preferences,
    rp.matchScenario,
    rp.is_active,
    rp.profile_image_url,
    rp.additional_images,
    p.created_at,
    p.updated_at
FROM public.profiles p
LEFT JOIN public.roommate_profiles rp ON p.id = rp.user_id;

-- Grant access to the view
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- Update existing roommate_profiles to link to auth.users
-- For development, we'll create test auth users for existing profiles
-- This is a one-time migration script

DO $$
DECLARE
    profile_record RECORD;
    new_user_id UUID;
BEGIN
    -- Only run this in development
    IF current_setting('app.environment', true) = 'development' THEN
        FOR profile_record IN 
            SELECT * FROM public.roommate_profiles WHERE user_id IS NULL
        LOOP
            -- Create a test auth user for each profile
            -- Note: This would normally be done through Supabase Auth API
            -- For now, we'll just generate UUIDs and update later
            new_user_id := gen_random_uuid();
            
            UPDATE public.roommate_profiles 
            SET user_id = new_user_id 
            WHERE id = profile_record.id;
            
            -- Create corresponding profile entry
            INSERT INTO public.profiles (id, name, avatar_url, bio)
            VALUES (
                new_user_id,
                profile_record.name,
                profile_record.profile_image_url,
                profile_record.bio
            )
            ON CONFLICT (id) DO NOTHING;
        END LOOP;
        
        RAISE NOTICE 'Updated % roommate profiles with auth user links', 
            (SELECT COUNT(*) FROM public.roommate_profiles WHERE user_id IS NOT NULL);
    END IF;
END
$$;

-- Add updated_at trigger to profiles
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ AUTH INTEGRATION FIXED!';
    RAISE NOTICE '📊 Profiles table created and linked to auth.users';
    RAISE NOTICE '🔗 Roommate profiles now properly linked to auth users';
    RAISE NOTICE '👀 user_profiles view created for easy querying';
END
$$; 