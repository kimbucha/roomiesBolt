# Roomies App - Backend Master Documentation

> **Single Source of Truth** for all backend architecture, issues, fixes, and roadmap

## 📋 Table of Contents

1. [Current Status Overview](#current-status-overview)
2. [Architecture Overview](#architecture-overview)
3. [Premium Account Management](#premium-account-management)
4. [Database Schema](#database-schema)
5. [Issue Tracking & Resolutions](#issue-tracking--resolutions)
6. [Configuration & Environment](#configuration--environment)
7. [Testing Strategy](#testing-strategy)
8. [Roadmap & Future Plans](#roadmap--future-plans)
9. [Development Guidelines](#development-guidelines)

---

## 🎯 Current Status Overview

### ✅ **COMPLETED**
- [x] **Data Persistence Issue**: ✅ **RESOLVED** - Fixed all 6 profile components to use correct store
- [x] **Console Log Noise**: ✅ **RESOLVED** - Implemented tiered logging (200+ → 10 logs)
- [x] **Supabase Integration**: Basic setup with authentication and user management
- [x] **Type-Safe Database Types**: Generated from Supabase schema (`types/database.ts`)
- [x] **Database Migration**: All missing columns added to users table
- [x] **Essential Dependencies**: Added `zod`, `@tanstack/react-query`, `supabase CLI`
- [x] **Premium Card Feature**: Implemented blurred "who likes you" card for non-premium users
- [x] **User Creation**: All new accounts default to free tier

### 🔄 **IN PROGRESS**
- [ ] **Premium Account Integration**: Connecting frontend premium features with Supabase backend
- [ ] **Messaging System**: Migrating from mock data to real-time Supabase messaging
- [ ] **Match System**: Ensuring proper match creation and premium card visibility
- [ ] **End-to-End Testing**: Complete onboarding → sign out → sign in flow

### ✅ **RECENTLY COMPLETED**
- [x] **Templated Discover Card System**: ✅ **COMPLETED** - All cards now use real Supabase data with complete personality profiles
- [x] **UserProfileService Integration**: Real user data with personality dimensions, compatibility scoring, and fallback handling

### ⚠️ **CRITICAL FIXES NEEDED**
- [ ] **Premium Default Fix**: ✅ **READY TO APPLY** - Ensure all user creation paths default to free
- [ ] **Database Schema Consistency**: Update schema to support premium features properly

---

## 🏗️ Architecture Overview

### Current Stack
```
Frontend (React Native + Expo)
    ↓
Zustand Stores (State Management)
    ↓
Supabase Client (Database + Auth + Real-time)
    ↓
PostgreSQL Database (Supabase)
```

### Key Components

#### 1. **Authentication System**
- **File**: `store/supabaseAuthStore.ts`
- **Purpose**: User authentication, session management
- **Features**: Sign up, sign in, session persistence, auto-refresh
- **Premium Integration**: New accounts default to `is_premium: false`

#### 2. **User Management**
- **File**: `store/supabaseUserStore.ts`
- **Purpose**: User profile data, onboarding progress
- **Features**: Profile CRUD, onboarding tracking, data synchronization

#### 3. **Premium & Subscription Management**
- **File**: `store/subscriptionStore.ts`
- **Purpose**: Premium feature management, subscription state
- **Features**: Feature availability, premium status tracking
- **Default**: All new users start with `currentTier: 'free'`

#### 4. **Messaging System**
- **Files**: `store/messageStore.ts` (mock), `store/supabaseMessageStore.ts` (Supabase)
- **Purpose**: Real-time messaging between matches
- **Features**: Conversations, message history, unread counts

#### 5. **Match System**
- **File**: `store/matchesStore.ts`
- **Purpose**: Match creation, premium card features
- **Features**: Swipe tracking, match generation, premium card blur

---

## 💎 Premium Account Management

### Default Account Status
**All new accounts MUST start as FREE tier:**

```sql
-- Users table defaults
is_premium: false (default)
subscription_tier: 'free' (default)
```

### Premium Features Implementation

#### 1. **Premium Card Feature ("Who Likes You")**
- **Location**: `components/matches/NewMatchesSection.tsx`
- **Behavior**: 
  - **Free Users**: Blurred profile images with lock icon
  - **Premium Users**: Clear images with ability to view profiles
- **Database Integration**: Queries `pending_likes` table with user premium status

#### 2. **Feature Gating**
```typescript
// Feature availability check
const canViewLikes = user.is_premium || false;
const canUseAdvancedFilters = user.is_premium || false;
const canSendUnlimitedMessages = user.is_premium || false;
```

#### 3. **Premium Status Sources**
1. **Database**: `users.is_premium` (source of truth)
2. **Auth Store**: `useSupabaseAuthStore.user.isPremium`
3. **Subscription Store**: `useSubscriptionStore.currentTier`

### Critical Premium Fixes Applied

#### ✅ **Fix 1: User Creation Defaults**
**Files Updated**: 
- `store/supabaseAuthStore.ts` - Line ~156-165
- `supabase/create_user_profile_function.sql` - Line ~4-6
- `supabase/auto_profile_trigger.sql` - Line ~17-18

**Change**: Ensure `is_premium: false` on account creation

#### ✅ **Fix 2: New Account Premium Override**
**Files**: `app/(tabs)/matches/index.tsx` - Lines ~85-95
**Logic**: New accounts (< 24 hours old) automatically set to non-premium

#### ✅ **Fix 3: Premium Card Component**
**Files**: `components/matches/NewMatchesSection.tsx`
**Features**: 
- Blur effect on match images for non-premium users
- Lock icon overlay
- Premium upgrade prompt on tap

---

## 🗃️ Database Schema

### Core Tables

#### Users Table (Primary)
```sql
CREATE TABLE public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  name text not null,
  is_premium boolean default false,        -- CRITICAL: Default to false
  is_verified boolean default false,
  profile_image_url text,
  onboarding_completed boolean default false,
  
  -- Onboarding Data
  budget_min integer,
  budget_max integer,
  personality_type text,
  personality_traits text[],
  personality_dimensions jsonb,
  lifestyle_preferences jsonb,
  location jsonb,
  housing_goals jsonb,
  gender text,
  date_of_birth date,
  
  -- Metadata
  profile_strength integer default 10,
  completed_steps text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### Matches Table
```sql
CREATE TABLE public.matches (
  id uuid primary key,
  user1_id uuid references public.users not null,
  user2_id uuid references public.users not null,
  user1_action text check (user1_action in ('like', 'superLike')),
  user2_action text check (user2_action in ('like', 'superLike')),
  status text not null check (status in ('pending', 'matched', 'superMatched', 'mixedMatched')),
  conversation_id uuid,
  has_read boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### Messages & Conversations
```sql
CREATE TABLE public.conversations (
  id uuid primary key,
  match_id uuid references public.matches,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

CREATE TABLE public.messages (
  id uuid primary key,
  conversation_id uuid references public.conversations not null,
  sender_id uuid references public.users not null,
  content text not null,
  created_at timestamp with time zone default now(),
  is_read boolean default false
);
```

### Row Level Security (RLS)

**Critical Policies:**
```sql
-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users FOR update
  USING (auth.uid() = id);

-- Service role can create user profiles (for auto-profile creation)
CREATE POLICY "Service role can create user profiles"
  ON public.users FOR insert
  WITH CHECK (auth.role() = 'service_role');

-- Users can view their own matches
CREATE POLICY "Users can read their own matches"
  ON public.matches FOR select
  USING (auth.uid() = user1_id or auth.uid() = user2_id);
```

---

## 🐛 Issue Tracking & Resolutions

### **CRITICAL: Premium Account Default Issue** ⚠️ **NEEDS IMMEDIATE FIX**

**Problem**: Multiple code paths default new users to premium status instead of free
**Impact**: All new users get premium features they shouldn't have
**Priority**: CRITICAL

**Affected Areas**:
1. User creation functions
2. Mock data initialization 
3. Test account creation
4. Subscription store defaults

**Solution Status**: ✅ **PLAN READY** - See Premium Account Management section

---

### **Issue #1: Data Persistence Failure** ✅ **RESOLVED**
**Date**: January 27, 2025  
**Severity**: Critical  

**Problem**: Users completing onboarding were redirected back to onboarding after sign out/sign in. Profile data (personality, gender, lifestyle) not showing in UI despite being saved to database.

**Root Cause FINAL RESOLUTION**:
1. ✅ **Store Synchronization Fixed** - Profile components now use `useSupabaseUserStore`
2. ✅ **Authentication Timing Fixed** - `fetchUserProfile()` uses direct session check
3. ✅ **Data Refresh Fixed** - Added `fetchUserProfile()` call after onboarding completion
4. ✅ **Personality Traits Formatter Fixed** - Traits now properly saved in `formatStepData()`
5. ✅ **Database Schema Fixed** - Added missing `personality_traits` column to database
6. ✅ **Lifestyle Display Fixed** - Updated component to handle saved data format
7. ✅ **Settings Avatar Fixed** - Replaced text initials with proper `UserAvatar` component

**Current Status**: ✅ **FULLY RESOLVED**

---

### **Issue #2: Messaging System Integration** 🔄 **IN PROGRESS**

**Problem**: App uses mix of mock data (`messageStore.ts`) and real Supabase implementation (`supabaseMessageStore.ts`)

**Impact**: 
- Inconsistent message history
- Premium features not properly gated
- Real-time features not working

**Plan**:
1. Migrate all message UI to use `supabaseMessageStore.ts`
2. Remove mock data dependencies
3. Implement real-time message subscriptions
4. Connect premium features to database

---

### **Issue #3: Match System Premium Integration** 🔄 **IN PROGRESS**

**Problem**: Premium card blur feature works but not integrated with real user data

**Components**:
- `components/matches/NewMatchesSection.tsx` - Has premium UI
- `store/matchesStore.ts` - Has premium logic
- Database - Missing proper match/like tracking

**Plan**:
1. Connect premium card to real database queries
2. Implement proper like/match creation
3. Add premium status checks throughout match flow

---

## 🔧 Configuration & Environment

### Supabase Configuration
```typescript
// services/supabaseClient.ts
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
```

### Environment Variables Required
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🧪 Testing Strategy

### Current Test Coverage
- [x] Database connection and basic CRUD
- [x] User authentication flow
- [x] Profile data persistence
- [ ] Premium feature gating
- [ ] Real-time messaging
- [ ] Match creation and premium cards

### Testing Approach
1. **Unit Tests**: Store logic and data transformations
2. **Integration Tests**: Database operations and API calls
3. **E2E Tests**: Complete user flows including premium features
4. **Manual Testing**: Premium card visibility and feature gating

---

## 🗺️ Roadmap & Future Plans

### Phase 1: Critical Fixes (CURRENT)
- [ ] Fix premium account defaults
- [ ] Migrate to real data
- [ ] Stabilize messaging system

### Phase 2: Real-time Features
- [ ] Live messaging
- [ ] Match notifications
- [ ] Online status

### Phase 3: Advanced Premium Features
- [ ] Advanced filtering
- [ ] Super likes
- [ ] Read receipts
- [ ] Priority matching

### Phase 4: Performance & Scale
- [ ] Caching strategies
- [ ] Offline support
- [ ] Image optimization
- [ ] Search optimization

---

## 👩‍💻 Development Guidelines

### Code Standards
1. **Type Safety**: Use TypeScript throughout
2. **Database Types**: Generate types from Supabase schema
3. **Error Handling**: Comprehensive try-catch with user feedback
4. **Logging**: Use tiered logging (debug → info → warn → error)

### Premium Feature Development
1. **Default to Free**: All new features should be accessible to free users unless explicitly premium
2. **Graceful Degradation**: Premium features should fail gracefully for free users
3. **Clear Messaging**: Users should understand what premium unlocks
4. **Database Consistency**: Premium status should come from database, not local state

### Database Best Practices
1. **Migrations**: Use numbered migration files
2. **Indexes**: Add indexes for commonly queried columns
3. **RLS**: Implement Row Level Security for all user data
4. **Functions**: Use database functions for complex operations

### Testing Requirements
1. **Premium Testing**: Test both free and premium user flows
2. **Data Integrity**: Test data persistence across app restarts
3. **Edge Cases**: Test premium feature boundaries
4. **Performance**: Test with realistic data volumes

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

---

**Last Updated**: January 27, 2025  
**Version**: 2.0  
**Status**: ACTIVE DEVELOPMENT 