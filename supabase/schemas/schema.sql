-- Roomies App Database Schema for Supabase

-- Enable RLS (Row Level Security)
alter default privileges revoke execute on functions from public;

-- Create tables with proper relationships and constraints

-- Users table (core user data)
create table public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_premium boolean default false,
  is_verified boolean default false,
  profile_image_url text,
  onboarding_completed boolean default false
);

-- Roommate profiles (extended profile information)
create table public.roommate_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users not null,
  age integer,
  university text,
  major text,
  year text,
  bio text,
  budget jsonb,
  location jsonb,
  neighborhood text,
  room_photos text[],
  traits text[],
  compatibility_score numeric,
  has_place boolean default false,
  room_type text,
  amenities text[],
  bedrooms integer,
  bathrooms numeric,
  is_furnished boolean,
  lease_duration text,
  move_in_date date,
  flexible_stay boolean,
  lease_type text,
  utilities_included text[],
  pet_policy text,
  sublet_allowed boolean,
  gender text,
  date_of_birth date,
  user_role text,
  personality_traits text[],
  personality_type text,
  personality_dimensions jsonb,
  social_media jsonb,
  lifestyle_preferences jsonb,
  personal_preferences jsonb,
  description text,
  address text,
  monthly_rent text,
  place_details jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Each user can only have one profile
  unique(user_id)
);

-- Swipes (record of user swipe actions)
create table public.swipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users not null,
  target_user_id uuid references public.users not null,
  action text not null check (action in ('like', 'pass', 'superLike')),
  created_at timestamp with time zone default now()
);

-- Matches (connections between users)
create table public.matches (
  id uuid primary key,
  user1_id uuid references public.users not null,
  user2_id uuid references public.users not null,
  user1_action text check (user1_action in ('like', 'superLike')),
  user2_action text check (user2_action in ('like', 'superLike')),
  status text not null check (status in ('pending', 'matched', 'superMatched', 'mixedMatched')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  has_read boolean default false,
  conversation_id uuid,
  
  -- Prevent duplicate matches between the same users
  unique(user1_id, user2_id)
);

-- Conversations
create table public.conversations (
  id uuid primary key,
  match_id uuid references public.matches,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Conversation participants
create table public.conversation_participants (
  conversation_id uuid references public.conversations not null,
  user_id uuid references public.users not null,
  created_at timestamp with time zone default now(),
  primary key (conversation_id, user_id)
);

-- Messages
create table public.messages (
  id uuid primary key,
  conversation_id uuid references public.conversations not null,
  sender_id uuid references public.users not null,
  content text not null,
  created_at timestamp with time zone default now(),
  is_read boolean default false
);

-- Saved places
create table public.saved_places (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users not null,
  place_id uuid references public.roommate_profiles not null,
  is_priority boolean default false,
  created_at timestamp with time zone default now(),
  
  -- Prevent duplicate saves
  unique(user_id, place_id)
);

-- Reviews
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  reviewer_id uuid references public.users not null,
  reviewee_id uuid references public.users not null,
  rating integer not null check (rating between 1 and 5),
  content text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Prevent multiple reviews from the same user
  unique(reviewer_id, reviewee_id)
);

-- Health check table (for connection testing)
create table public.health_check (
  id serial primary key,
  status text not null default 'ok',
  checked_at timestamp with time zone default now()
);

-- Insert initial health check record
insert into public.health_check (status) values ('ok');

-- Enable Row Level Security on all tables
alter table public.users enable row level security;
alter table public.roommate_profiles enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.saved_places enable row level security;
alter table public.reviews enable row level security;
alter table public.health_check enable row level security;

-- Create RLS policies

-- Users policies
create policy "Users can read any user profile"
  on public.users for select
  using (true);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);
  
create policy "Service role can create user profiles"
  on public.users for insert
  with check (auth.role() = 'service_role');

-- Roommate profiles policies
create policy "Anyone can read roommate profiles"
  on public.roommate_profiles for select
  using (true);

create policy "Users can update their own roommate profile"
  on public.roommate_profiles for update
  using (auth.uid() = user_id);

create policy "Users can create their own roommate profile"
  on public.roommate_profiles for insert
  with check (auth.uid() = user_id);

-- Swipes policies
create policy "Users can read their own swipes"
  on public.swipes for select
  using (auth.uid() = user_id);

create policy "Users can create their own swipes"
  on public.swipes for insert
  with check (auth.uid() = user_id);

-- Matches policies
create policy "Users can read their own matches"
  on public.matches for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Conversations policies
create policy "Users can read conversations they're part of"
  on public.conversations for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = id and user_id = auth.uid()
    )
  );

-- Conversation participants policies
create policy "Users can read conversation participants for their conversations"
  on public.conversation_participants for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = conversation_participants.conversation_id and user_id = auth.uid()
    )
  );

-- Messages policies
create policy "Users can read messages from conversations they're part of"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );

create policy "Users can send messages to conversations they're part of"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );

-- Saved places policies
create policy "Users can read their own saved places"
  on public.saved_places for select
  using (auth.uid() = user_id);

create policy "Users can create their own saved places"
  on public.saved_places for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own saved places"
  on public.saved_places for update
  using (auth.uid() = user_id);

create policy "Users can delete their own saved places"
  on public.saved_places for delete
  using (auth.uid() = user_id);

-- Reviews policies
create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

create policy "Users can create reviews"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

create policy "Users can update their own reviews"
  on public.reviews for update
  using (auth.uid() = reviewer_id);

-- Health check policy
create policy "Anyone can read health check"
  on public.health_check for select
  using (true);

-- Create indexes for better performance
create index idx_roommate_profiles_user_id on public.roommate_profiles(user_id);
create index idx_swipes_user_id on public.swipes(user_id);
create index idx_swipes_target_user_id on public.swipes(target_user_id);
create index idx_matches_user1_id on public.matches(user1_id);
create index idx_matches_user2_id on public.matches(user2_id);
create index idx_conversation_participants_user_id on public.conversation_participants(user_id);
create index idx_messages_conversation_id on public.messages(conversation_id);
create index idx_messages_sender_id on public.messages(sender_id);
create index idx_saved_places_user_id on public.saved_places(user_id);
create index idx_saved_places_place_id on public.saved_places(place_id);
create index idx_reviews_reviewee_id on public.reviews(reviewee_id);

-- Create functions for common operations

-- Function to get user profile with roommate profile
create or replace function get_full_user_profile(user_id uuid)
returns json as $$
begin
  return (
    select json_build_object(
      'user', json_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email,
        'profileImage', u.profile_image_url,
        'isPremium', u.is_premium,
        'isVerified', u.is_verified,
        'onboardingCompleted', u.onboarding_completed,
        'createdAt', u.created_at
      ),
      'profile', case when rp.id is not null then json_build_object(
        'id', rp.id,
        'age', rp.age,
        'university', rp.university,
        'major', rp.major,
        'bio', rp.bio,
        'budget', rp.budget,
        'location', rp.location,
        'hasPlace', rp.has_place,
        'roomType', rp.room_type,
        'personalityType', rp.personality_type,
        'personalityDimensions', rp.personality_dimensions,
        'lifestylePreferences', rp.lifestyle_preferences
      ) else null end
    )
    from public.users u
    left join public.roommate_profiles rp on u.id = rp.user_id
    where u.id = user_id
  );
end;
$$ language plpgsql security definer;

-- Function to get matches with profiles
create or replace function get_matches_with_profiles(user_id uuid)
returns json as $$
begin
  return (
    select json_agg(
      json_build_object(
        'match', json_build_object(
          'id', m.id,
          'status', m.status,
          'createdAt', m.created_at,
          'hasRead', m.has_read,
          'conversationId', m.conversation_id
        ),
        'profile', json_build_object(
          'id', rp.id,
          'name', u.name,
          'profileImage', u.profile_image_url,
          'age', rp.age,
          'university', rp.university,
          'hasPlace', rp.has_place
        )
      )
    )
    from public.matches m
    join public.users u on 
      (m.user1_id = user_id and m.user2_id = u.id) or
      (m.user2_id = user_id and m.user1_id = u.id)
    join public.roommate_profiles rp on u.id = rp.user_id
    where m.user1_id = user_id or m.user2_id = user_id
  );
end;
$$ language plpgsql security definer;

-- Function to get unread message count
create or replace function get_unread_message_count(user_id uuid)
returns integer as $$
begin
  return (
    select count(*)
    from public.messages m
    join public.conversation_participants cp on m.conversation_id = cp.conversation_id
    where cp.user_id = user_id
    and m.sender_id != user_id
    and m.is_read = false
  );
end;
$$ language plpgsql security definer;

-- Trigger to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at columns
create trigger set_users_updated_at
before update on public.users
for each row execute function update_updated_at_column();

create trigger set_roommate_profiles_updated_at
before update on public.roommate_profiles
for each row execute function update_updated_at_column();

create trigger set_matches_updated_at
before update on public.matches
for each row execute function update_updated_at_column();

create trigger set_conversations_updated_at
before update on public.conversations
for each row execute function update_updated_at_column();

create trigger set_reviews_updated_at
before update on public.reviews
for each row execute function update_updated_at_column();
