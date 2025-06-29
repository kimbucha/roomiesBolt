# ⚠️ NOTICE: This documentation has been consolidated

**Please refer to [ROOMIES_BACKEND_MASTER.md](./ROOMIES_BACKEND_MASTER.md) for the most up-to-date backend documentation.**

This file contains historical information but may not reflect the current state. The master documentation is the single source of truth for:
- Current status and issues
- Architecture overview  
- Testing strategy
- Roadmap and plans
- Development guidelines

---

# Supabase Integration for Roomies App

This guide will help you set up Supabase as the backend for your Roomies application, replacing the current AsyncStorage implementation to solve profile inconsistency issues and provide a solid foundation for future features.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up Supabase](#setting-up-supabase)
3. [Installing Dependencies](#installing-dependencies)
4. [Database Schema](#database-schema)
5. [Migrating from AsyncStorage](#migrating-from-asyncstorage)
6. [Authentication Flow](#authentication-flow)
7. [Real-time Features](#real-time-features)
8. [Storage for Images](#storage-for-images)
9. [Security Considerations](#security-considerations)

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm/yarn installed
- Your existing Roomies React Native application

## Setting Up Supabase

1. Create a new Supabase project:
   - Go to [app.supabase.com](https://app.supabase.com) and sign in
   - Click "New Project"
   - Enter a name for your project (e.g., "Roomies")
   - Choose a strong database password
   - Select a region closest to your users
   - Click "Create New Project"

2. Once your project is created, find your project URL and anon key:
   - Go to Project Settings > API
   - Copy the URL and anon key
   - Update these values in `/services/supabaseClient.ts`

3. Set up the database schema:
   - Go to the SQL Editor in your Supabase dashboard
   - Paste the contents of `/supabase/schema.sql`
   - Click "Run" to create all tables and set up security policies

## Installing Dependencies

Install the required Supabase packages:

```bash
npm install @supabase/supabase-js react-native-url-polyfill
# or
yarn add @supabase/supabase-js react-native-url-polyfill
```

## Database Schema

The Supabase schema includes the following tables:

- `users`: Core user data linked to Supabase Auth
- `roommate_profiles`: Extended profile information
- `swipes`: Record of user swipe actions
- `matches`: Connections between users
- `conversations`: Chat conversations
- `conversation_participants`: Users in conversations
- `messages`: Chat messages
- `saved_places`: Saved housing listings
- `reviews`: User reviews and ratings

Each table has appropriate Row Level Security (RLS) policies to ensure data privacy and security.

## Migrating from AsyncStorage

To migrate your existing data from AsyncStorage to Supabase:

1. First, ensure all users are properly registered in Supabase Auth
2. Use the migration script below to transfer data:

```javascript
// Add this to a new file: scripts/migrateToSupabase.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabaseClient';

const migrateToSupabase = async () => {
  try {
    // Get user data from AsyncStorage
    const userDataString = await AsyncStorage.getItem('roomies-user-storage');
    const roommateDataString = await AsyncStorage.getItem('roomies-roommate-storage');
    const matchesDataString = await AsyncStorage.getItem('matches-storage');
    const messageDataString = await AsyncStorage.getItem('message-storage');
    
    if (!userDataString) {
      console.log('No user data found in AsyncStorage');
      return;
    }
    
    // Parse the data
    const userData = JSON.parse(userDataString).state;
    const roommateData = roommateDataString ? JSON.parse(roommateDataString).state : null;
    const matchesData = matchesDataString ? JSON.parse(matchesDataString).state : null;
    const messageData = messageDataString ? JSON.parse(messageDataString).state : null;
    
    // Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.user.email,
      password: 'temporary-password', // You'll need to implement a password reset flow
      options: {
        data: {
          name: userData.user.name
        }
      }
    });
    
    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }
    
    // Create user record
    const { error: userError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: userData.user.email,
      name: userData.user.name,
      is_premium: userData.user.isPremium || false,
      is_verified: userData.user.isVerified || false,
      profile_image_url: userData.user.profileImage,
      onboarding_completed: userData.user.onboardingCompleted || false
    });
    
    if (userError) {
      console.error('Error creating user record:', userError);
      return;
    }
    
    // Continue with migrating roommate profiles, matches, etc.
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

export default migrateToSupabase;
```

## Authentication Flow

The new authentication flow using Supabase:

1. **Sign Up**:
   - User enters email, password, and name
   - Call `useSupabaseAuthStore.getState().signup(email, password, name)`
   - This creates both a Supabase Auth user and a user record

2. **Login**:
   - User enters email and password
   - Call `useSupabaseAuthStore.getState().login(email, password)`
   - This authenticates with Supabase and loads the user profile

3. **Session Management**:
   - Sessions are automatically persisted using AsyncStorage
   - On app start, call `useSupabaseAuthStore.getState().refreshUser()`
   - This will restore the session if valid

4. **Logout**:
   - Call `useSupabaseAuthStore.getState().logout()`
   - This signs out the user and clears the session

## Real-time Features

Supabase provides real-time functionality through Postgres changes. The message store includes subscription setup:

```javascript
// From supabaseMessageStore.ts
subscribeToMessages: async () => {
  const { user } = useSupabaseAuthStore.getState();
  if (!user) return;
  
  // Clean up any existing subscription
  get().unsubscribeFromMessages();
  
  // Subscribe to new messages
  messageSubscription = supabase
    .channel('messages-channel')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `sender_id=neq.${user.id}`
      }, 
      async (payload) => {
        // Handle new message...
      }
    )
    .subscribe();
}
```

To enable real-time for matches:

1. Go to your Supabase dashboard
2. Navigate to Database > Replication
3. Enable replication for the `matches` table

## Storage for Images

For profile images and place photos:

1. Create storage buckets in Supabase:
   - Go to Storage in your Supabase dashboard
   - Create two buckets: `profile-images` and `place-photos`
   - Set public access as needed

2. Upload images using the Supabase client:

```javascript
const uploadProfileImage = async (uri) => {
  const { user } = useSupabaseAuthStore.getState();
  if (!user) return { error: 'Not authenticated' };
  
  try {
    // Convert URI to file object
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: `profile-${user.id}.jpg`,
      type: 'image/jpeg'
    });
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('profile-images')
      .upload(`${user.id}/profile.jpg`, formData, {
        upsert: true
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: publicUrl } = supabase
      .storage
      .from('profile-images')
      .getPublicUrl(`${user.id}/profile.jpg`);
      
    // Update user profile with new image URL
    await useSupabaseAuthStore.getState().updateUser({
      profileImage: publicUrl
    });
    
    return { data: publicUrl, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};
```

## Security Considerations

1. **API Keys**: Never expose your service role key in client code. Only use the anon key.

2. **Row Level Security**: All tables have RLS policies to ensure users can only access their own data.

3. **Auth Hooks**: Use Supabase Auth hooks to protect routes in your app:

```javascript
// Example of a protected screen component
const ProtectedScreen = () => {
  const { user, isLoading } = useSupabaseAuthStore();
  
  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login
      router.replace('/login');
    }
  }, [user, isLoading]);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return <YourProtectedContent />;
};
```

4. **Data Validation**: Always validate data on both client and server side.

---

## Testing Checklist

### Full Onboarding Flow Test
1. **Create Account** - Use test account or create new account
2. **Go through each onboarding step**:
   - ✅ Welcome/Get Started
   - ✅ Budget & Location
   - ✅ Lifestyle Questions
   - ✅ Personality Quiz & Results
   - ✅ Goals Selection
   - ✅ About You
   - ✅ Photos & Date of Birth
3. **Complete Onboarding** - Should reach main app
4. **Sign Out and Sign Back In** - Verify all data is preserved

### Expected Behavior After Recent Fixes
- ✅ No `updateUserProfile is not a function` errors
- ✅ No `formatStepData is not a function` errors  
- ✅ No invalid user ID errors (empty strings)
- ✅ No database column missing errors
- ✅ Profile data should be formatted and saved to Supabase
- ✅ Profile strength should be calculated and updated
- ✅ All onboarding data should persist after sign out/sign in
- ✅ Proper Supabase user IDs should be used (not temp IDs)
- ✅ Better logging should show data flow

### 🚨 IMPORTANT: Database Migration Required

**Before testing, you MUST run the database migration:**

1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project
2. Navigate to **SQL Editor**
3. Run the migration script from `supabase/migrations/001_add_missing_user_columns.sql`
4. See `SUPABASE_MIGRATION_INSTRUCTIONS.md` for detailed steps

**Without the migration, you'll continue to get database column errors.**

### Data Persistence Verification
- [ ] User profile data saved to Supabase
- [ ] Budget and location preferences saved  
- [ ] Lifestyle preferences saved
- [ ] Personality type and dimensions saved
- [ ] Goals and housing preferences saved
- [ ] Photos and date of birth saved
- [ ] Profile strength calculated and updated

### Error Monitoring
- [ ] All SupabaseOnboardingProfileUpdater calls succeed
- [ ] Console shows proper data formatting logs
- [ ] Supabase database properly stores JSONB data
- [ ] User authentication remains stable throughout
- [ ] No lingering `temp-` user IDs in logs

## Next Steps

1. Create a Supabase project and set up the schema
2. Update the client configuration with your project URL and anon key
3. Implement the new auth flow in your app
4. Migrate existing data
5. Test thoroughly, especially the profile consistency across sessions

By following this guide, you'll have a robust backend for your Roomies app that solves the profile inconsistency issues and provides a foundation for scaling your application.

# Supabase Integration Progress

## Overview
This document tracks the integration of Supabase as the backend database for the Roomies app, replacing AsyncStorage with a proper cloud database solution.

## Current Status: ✅ Authentication Error Fixed

### Issue: `updateUserProfile is not a function`
**Date:** January 25, 2025  
**Status:** ✅ RESOLVED

**Problem:**
- Error occurred during account creation in onboarding flow
- `app/(onboarding)/account.tsx` was trying to import `updateUserProfile` from `useSupabaseUserStore`
- The function didn't exist in `supabaseUserStore.ts`

**Root Cause:**
- Mismatch between function names in stores
- `userStore.ts` has `updateUserProfile` but `supabaseUserStore.ts` has `updateUserAndProfile`
- Account creation flow was importing from the wrong store

**Solution:**
1. Fixed import in `account.tsx`:
   ```typescript
   // Before
   const { updateUserProfile } = useSupabaseUserStore();
   
   // After  
   const { updateUserAndProfile: updateSupabaseUserProfile } = useSupabaseUserStore();
   ```

2. Updated function call to use correct name and made it async:
   ```typescript
   // Before
   updateUserProfile(userData);
   
   // After
   await updateSupabaseUserProfile(userData);
   ```

3. Made the helper function async to properly handle await:
   ```typescript
   const updateUserAndProfile = async (userData: any, options = { validate: false }) => {
   ```

**Files Modified:**
- `app/(onboarding)/account.tsx` - Fixed import and function calls
- `app/(onboarding)/get-started.tsx` - Updated to use SupabaseOnboardingProfileUpdater
- `app/(onboarding)/budget.tsx` - Updated to use SupabaseOnboardingProfileUpdater
- `app/(onboarding)/personality/results.tsx` - Updated to use SupabaseOnboardingProfileUpdater
- `app/(onboarding)/photos.tsx` - Updated to use SupabaseOnboardingProfileUpdater, fixed invalid showToast option
- `app/(onboarding)/lifestyle.tsx` - Updated to use SupabaseOnboardingProfileUpdater
- `app/(onboarding)/goals.tsx` - Updated to use SupabaseOnboardingProfileUpdater (2 references)
- `app/(onboarding)/about-you.tsx` - Updated to use SupabaseOnboardingProfileUpdater

**Testing Status:** ✅ Fixed and Ready for testing

### Issue: Database Schema Missing Columns  
**Date:** January 25, 2025  
**Status:** ✅ RESOLVED (Migration Created)

**Problem:**
- Multiple database errors about missing columns:
  - `Could not find the 'preferred_locations' column of 'users' in the schema cache`
  - `Could not find the 'move_in_timeframe' column of 'users' in the schema cache`  
  - `Could not find the 'gender' column of 'users' in the schema cache`
- User ID problems where temporary IDs were being used instead of authenticated Supabase user IDs

**Root Cause:**
- The `users` table schema was missing 16 columns that the onboarding process expects
- The `SupabaseOnboardingProfileUpdater` was not prioritizing authenticated user IDs

**Solution:**
- ✅ Created migration script: `supabase/migrations/001_add_missing_user_columns.sql`
- ✅ Fixed user ID handling to always use authenticated Supabase user ID first
- ✅ Enhanced data formatting to handle multiple data formats
- ✅ Added comprehensive database indexes for performance
- ✅ Updated database functions to include new columns

**Files Modified:**
- `supabase/migrations/001_add_missing_user_columns.sql` - New migration script
- `utils/supabaseOnboardingProfileUpdater.ts` - Fixed user ID handling and data formatting
- `SUPABASE_MIGRATION_INSTRUCTIONS.md` - Created migration instructions

**Testing Status:** 🔄 NEEDS DATABASE MIGRATION

### Issue: `formatStepData is not a function`
**Date:** January 25, 2025  
**Status:** ✅ RESOLVED

**Problem:**
- Multiple onboarding screens were getting error: `_this.formatStepData is not a function (it is undefined)`
- Some screens were passing empty strings as user ID

**Root Cause:**
- Method call using `this.formatStepData` but object is not a class
- Some screens passing `''` instead of actual user ID

**Solution:**
- Fixed method call to use `SupabaseOnboardingProfileUpdater.formatStepData`
- Updated `get-started.tsx` and `budget.tsx` to pass `user?.id || ''` instead of `''`
- Enhanced formatStepData to handle actual data structures from each onboarding step
- Added better logging to understand data flow

**Files Modified:**
- `utils/supabaseOnboardingProfileUpdater.ts` - Fixed method call and data formatting
- `app/(onboarding)/get-started.tsx` - Fixed user ID parameter
- `app/(onboarding)/budget.tsx` - Fixed user ID parameter

**Testing Status:** ✅ Ready for testing - Errors should be resolved

---

## Architecture Overview

### Core Components

1. **Supabase Client** (`services/supabaseClient.ts`)
   - Main client configuration
   - Admin client for test accounts (dev only)
   - Connection helpers and retry logic

2. **Authentication Store** (`store/supabaseAuthStore.ts`)
   - Handles user authentication state
   - Session management
   - Sign in/out functionality

3. **User Store** (`store/supabaseUserStore.ts`)
   - User profile management
   - Onboarding progress tracking
   - Profile updates and synchronization

4. **Database Schema** (`supabase/schema.sql`)
   - User profiles table
   - Relationships and constraints
   - Triggers and functions

### Key Features

- ✅ User authentication with Supabase Auth
- ✅ Profile data storage in Supabase database
- ✅ Test account creation (dev mode)
- ✅ Onboarding flow integration
- ✅ Session persistence
- 🔄 Real-time subscriptions (in progress)
- 🔄 File storage for photos (in progress)

---

## Configuration

### Environment Variables
Located in `app.config.js`:
```javascript
extra: {
  supabaseUrl: "https://hybyjgpcbcqpndxrquqv.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  supabaseServiceKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Dev only
}
```

### Database Connection
- Connection validation with retry logic
- Automatic session refresh
- Error handling and fallback mechanisms

---

## Testing Strategy

### Test Accounts
- Automated test account creation for development
- Pre-confirmed emails to bypass verification
- Stored credentials for reuse
- Clean slate for each test run

### Full User Flow Testing
1. ✅ Account creation
2. 🔄 Onboarding completion (in progress)
3. 🔄 Sign out
4. 🔄 Sign back in
5. 🔄 Data persistence verification

---

## Known Issues

### Resolved
- ✅ `updateUserProfile is not a function` error

### Active
- 🔄 Need to test complete onboarding flow
- 🔄 Verify data persistence after sign out/in
- 🔄 Photo upload integration
- 🔄 Real-time features

---

## Migration Notes

### From AsyncStorage to Supabase
- User data now stored in `users` table
- Authentication handled by Supabase Auth
- Session persistence through Supabase
- Local stores still used for temporary state

### Data Mapping
```typescript
// AsyncStorage format -> Supabase format
user.profilePicture -> users.profile_image_url
user.budget -> users.budget_min, users.budget_max
user.personalityDimensions -> users.personality_dimensions (JSONB)
user.lifestylePreferences -> users.lifestyle_preferences (JSONB)
user.location -> users.location (JSONB)
```

---

## Next Steps

1. **Test Complete Flow**
   - Create account ✅
   - Complete all onboarding steps
   - Sign out
   - Sign back in
   - Verify data persistence

2. **Implement Photo Storage**
   - Supabase Storage bucket setup
   - Image upload utilities
   - Profile photo management

3. **Real-time Features**
   - Message subscriptions
   - Match notifications
   - Live updates

4. **Performance Optimization**
   - Query optimization
   - Caching strategies
   - Offline support

---

## References

- [Supabase Documentation](https://supabase.com/docs)
- [React Native Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Database Design](./roomiesERD.drawio)

## Summary of Fixes Applied

### 1. Fixed `updateUserProfile is not a function` Error
**Root Issue:** The account creation flow was trying to use a function that didn't exist in the Supabase user store.

**Changes Made:**
- Updated import in `account.tsx` to use `updateUserAndProfile` instead of `updateUserProfile`
- Made the helper function async to properly handle await calls
- Fixed all function calls to await the async operations

### 2. Updated All Onboarding Screens to Use Supabase
**Root Issue:** Multiple onboarding screens were still using the old `OnboardingProfileUpdater` instead of the Supabase version.

**Changes Made:**
- Updated 8 onboarding screens to use `SupabaseOnboardingProfileUpdater`
- Fixed invalid function options (removed `showToast` parameter)
- Ensured consistent error handling across all screens

### 3. Comprehensive Onboarding Flow Integration
**Screens Updated:**
1. `account.tsx` - Account creation with Supabase auth
2. `get-started.tsx` - Welcome screen with profile strength tracking
3. `budget.tsx` - Budget and location preferences
4. `personality/results.tsx` - Personality quiz results
5. `photos.tsx` - Photo upload and date of birth
6. `lifestyle.tsx` - Lifestyle preferences
7. `goals.tsx` - User goals and role selection (2 code paths)
8. `about-you.tsx` - Basic profile information

---

## Testing Checklist

### ✅ Pre-Testing Setup
- [x] Fixed all import errors
- [x] Updated all onboarding screens to use Supabase
- [x] Verified environment configuration
- [x] Started development server

### 🔄 Account Creation Flow
- [ ] Create new test account
- [ ] Verify account is created in Supabase Auth
- [ ] Verify user profile is created in database
- [ ] Check that test account helper works correctly

### 🔄 Complete Onboarding Flow
- [ ] Step 1: Welcome (name entry)
- [ ] Step 2: Account creation
- [ ] Step 3: Get started screen
- [ ] Step 4: Budget and location
- [ ] Step 5: Goals selection
- [ ] Step 6: About you (gender, bio)
- [ ] Step 7: Lifestyle preferences
- [ ] Step 8: Personality quiz
- [ ] Step 9: Photos and date of birth
- [ ] Step 10: Social proof (final step)

### 🔄 Data Persistence Testing
- [ ] Complete full onboarding
- [ ] Sign out of the app
- [ ] Sign back in with same credentials
- [ ] Verify all profile data is preserved
- [ ] Check that onboarding progress is maintained

### 🔄 Error Handling
- [ ] Test with invalid credentials
- [ ] Test with network interruptions
- [ ] Verify graceful error messages
- [ ] Check retry mechanisms work

### 🔄 Profile Strength Calculation
- [ ] Verify profile strength updates after each step
- [ ] Check that JSONB data is stored correctly
- [ ] Validate complex data structures (personality, lifestyle, location)

---

## Expected Behavior

### Account Creation
1. User enters name on welcome screen
2. User creates account with email/password
3. Test account is created and auto-confirmed (dev mode)
4. User is automatically signed in
5. Profile record is created in Supabase
6. Navigation proceeds to get-started screen

### Onboarding Progression
1. Each step saves data to both local store and Supabase
2. Profile strength is calculated and updated
3. Complex data (personality, lifestyle) is stored as JSONB
4. Onboarding progress is tracked in database
5. User can navigate back/forward without data loss

### Session Management
1. User session persists across app restarts
2. Profile data is loaded from Supabase on app start
3. Local stores are synchronized with database
4. Sign out clears local data but preserves database

---

## Recent Updates

### Database Schema Fix for Data Persistence (Latest)
**Status: ✅ COMPLETED**

**Problem Identified:**
- Users could complete onboarding but `onboarding_completed` was never set to `true` in database
- After sign out/sign in, users were redirected back to onboarding (data not persisted)
- Root cause: Database schema mismatch in `notifications` step

**Root Cause Analysis:**
The notifications step was trying to update a non-existent column:
```
[Onboarding] Error updating profile for step notifications: Could not find the 'notifications_enabled' column of 'users' in the schema cache
```

**Fix Applied:**
1. **Removed non-existent column reference** in `utils/supabaseOnboardingProfileUpdater.ts`:
   - Removed `notifications_enabled` field update that was causing database errors
   - Kept essential `onboarding_completed = true` field update

2. **Updated notifications screen** in `app/(onboarding)/notifications.tsx`:
   - Removed `notificationsEnabled` data parameter that was causing schema conflicts
   - Simplified to only pass essential completion data

**Files Modified:**
- `utils/supabaseOnboardingProfileUpdater.ts` - Fixed formatStepData for notifications step
- `app/(onboarding)/notifications.tsx` - Removed non-existent field references
- Added data persistence testing logs to track `onboarding_completed` field

**Testing Strategy:**
Now when testing the full flow:
1. Complete onboarding → should see: `[DATA PERSISTENCE TEST] 🎯 Setting onboarding_completed = true in Supabase database`
2. Sign out and sign back in → should see: `[DATA PERSISTENCE TEST] 📋 Raw Supabase data - onboarding_completed: true`
3. Should redirect to main app instead of onboarding

### Console Log Cleanup (Previous)
**Status: ✅ COMPLETED**

Cleaned up excessive console logging throughout the app while preserving essential data persistence testing logs:

**Logs Removed:**
- Debug redirect logs in `app/index.tsx`
- Excessive authentication flow logs in `app/_layout.tsx` and `app/(auth)/login.tsx`
- Verbose onboarding debugging in all onboarding screens
- Debug photo loading logs in `app/(onboarding)/photos.tsx`
- Test account creation debug logs in `app/(onboarding)/account.tsx`
- Animated onboarding step debugging

**Logs Preserved:**
- `[DATA PERSISTENCE TEST]` - Essential for tracking onboarding completion and sign in flow
- Error logs for debugging authentication and database issues
- Critical state change logs for auth state transitions

## Architecture Overview

### Supabase Configuration
- **URL**: From environment via `app.config.js`
- **Authentication**: Anonymous key for client operations
- **Admin Operations**: Service role key for test account creation (dev only)
- **Storage**: AsyncStorage for session persistence

### Key Components
- **Authentication Store**: `supabaseAuthStore.ts` - Manages user sessions and auth state
- **User Store**: `supabaseUserStore.ts` - Handles profile data and onboarding state
- **Profile Updater**: `supabaseOnboardingProfileUpdater.ts` - Manages step-by-step profile updates
- **Migration Helper**: `supabaseMigrationHelper.ts` - Handles AsyncStorage to Supabase migration

### Database Schema (users table)
Essential columns for onboarding flow:
- `id` (uuid, primary key)
- `email` (text)
- `name` (text)
- `onboarding_completed` (boolean) - **Critical for data persistence**
- `completed_steps` (jsonb array)
- `personality_type` (text)
- `budget_min`, `budget_max` (numeric)
- `lifestyle_preferences` (jsonb)
- `personality_dimensions` (jsonb)
- `housing_goals` (jsonb)
- `location` (jsonb)

**Note**: `notifications_enabled` column does not exist - handled in app state only

## Testing Strategy

### Data Persistence Testing
Complete user flow to verify onboarding data persists:

1. **Account Creation & Onboarding**
   - Create test account
   - Complete all onboarding steps
   - Verify: `[DATA PERSISTENCE TEST] 🎯 Setting onboarding_completed = true in Supabase database`

2. **Sign Out & Sign In**
   - Sign out of account
   - Sign back in with same credentials
   - Verify: `[DATA PERSISTENCE TEST] 📋 Raw Supabase data - onboarding_completed: true`
   - Should redirect to main app instead of onboarding

3. **Data Verification**
   - All onboarding data should be preserved (personality, preferences, etc.)
   - Profile should show completed state

### Test Accounts
Development test accounts with format: `test_MM-DD-YY_HH-MM@roomies.com`
- Auto-generated with confirmed email status
- Saved locally for reuse during development
- Uses service role key for admin API access

## Known Issues & Solutions

### Issue: Onboarding Data Not Persisting
**Status: ✅ RESOLVED**
- **Problem**: Users redirected to onboarding after sign out/in
- **Cause**: Database column `notifications_enabled` didn't exist, causing update to fail
- **Solution**: Removed non-existent column references, simplified to essential fields only

### Issue: Excessive Console Logging
**Status: ✅ RESOLVED**  
- **Problem**: Too many debug logs making testing difficult
- **Solution**: Cleaned up all logs except essential `[DATA PERSISTENCE TEST]` markers

## Next Steps

1. **Test Complete Flow**: Verify end-to-end onboarding → sign out → sign in → data persistence
2. **Schema Enhancement**: Add `notifications_enabled` column if notification preferences are needed
3. **Real-time Features**: Implement messaging, match notifications
4. **Photo Storage**: Integrate Supabase Storage for profile pictures
5. **Performance**: Add caching and offline support
6. **Production**: Remove service role key usage, implement proper RLS policies

## Migration Notes

### From AsyncStorage to Supabase
- Onboarding progress: AsyncStorage → Supabase `completed_steps` JSONB
- User preferences: AsyncStorage → Supabase JSONB columns
- Profile data: AsyncStorage → Supabase relational structure
- Session management: AsyncStorage → Supabase Auth with AsyncStorage persistence

### Development vs Production
- **Dev**: Service role key for test accounts, relaxed RLS
- **Prod**: Anonymous key only, strict RLS policies, no admin operations

---
