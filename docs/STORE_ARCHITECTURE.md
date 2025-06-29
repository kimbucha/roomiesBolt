# Store Architecture Guide

This document outlines the responsibilities and usage patterns for the different user stores in the Roomies application.

## Overview

The application uses three user-related stores, each with distinct responsibilities:

1. **`supabaseAuthStore`** - Authentication and session management
2. **`supabaseUserStore`** - Complete user profile management with Supabase integration
3. **`userStore`** (Legacy) - Local storage-based user management (being phased out)

## Store Responsibilities

### 1. supabaseAuthStore (`store/supabaseAuthStore.ts`)

**Primary Purpose:** Authentication and session management

**Responsibilities:**
- User login/logout/signup
- Session persistence and refresh
- Authentication state management
- Basic user profile creation
- Auth token management

**Data Structure:**
```typescript
interface User {
  id: string;           // For current user identification
  email: string;        // For authentication
  name: string;         // Basic profile info
  profileImage?: string;
  isPremium: boolean;
  isVerified: boolean;
  onboardingCompleted?: boolean;
  userRole?: string;    // Read-only, for basic role checking
}
```

**When to Use:**
- Authentication flows (login/logout)
- Checking if user is logged in
- Getting current user ID for API calls
- Session validation
- Basic auth-related role checks

**Example Usage:**
```typescript
const { user: authUser, isLoggedIn, login, logout } = useSupabaseAuthStore();

// Use for authentication
if (!isLoggedIn) return <LoginScreen />;

// Use for current user identification
const currentUserId = authUser?.id;
```

### 2. supabaseUserStore (`store/supabaseUserStore.ts`)

**Primary Purpose:** Complete user profile management with Supabase integration

**Responsibilities:**
- Full user profile CRUD operations
- Onboarding flow management
- Complex user data (personality, lifestyle, place details)
- Profile strength calculation
- JSONB data handling for complex objects

**Data Structure:**
```typescript
interface User {
  // All authentication fields +
  personalityType?: string;
  personalityDimensions?: object;
  lifestylePreferences?: object;
  placeDetails?: object;
  budget?: object;
  location?: object;
  userRole?: string;     // Authoritative source for user role
  hasPlace?: boolean;
  // ... 20+ additional profile fields
}
```

**When to Use:**
- Profile management screens
- Onboarding flows
- Matching logic that needs detailed user data
- Any component displaying user profile information
- Getting user role for UI behavior

**Example Usage:**
```typescript
const { user, updateUserAndProfile, fetchUserProfile } = useSupabaseUserStore();

// Use for profile data
const userRole = user?.userRole;
const hasPlace = user?.hasPlace;
const budget = user?.budget;

// Use for profile updates
await updateUserAndProfile({ personalityType: 'ENFP' });
```

### 3. userStore (Legacy) (`store/userStore.ts`)

**Status:** Being phased out in favor of Supabase stores

**Primary Purpose:** Local storage-based user management (legacy)

**When to Use:** 
- Only when migrating existing functionality
- Avoid for new features

## Migration Guidelines

### From supabaseAuthStore to supabaseUserStore

If you're currently using `supabaseAuthStore` for profile data, migrate as follows:

**Before:**
```typescript
const { user } = useSupabaseAuthStore();
const userRole = user?.userRole;
const hasPlace = user?.hasPlace; // This won't exist!
```

**After:**
```typescript
const { user: authUser } = useSupabaseAuthStore(); // For auth only
const { user } = useSupabaseUserStore(); // For profile data
const userRole = user?.userRole;
const hasPlace = user?.hasPlace;

// Use authUser for authentication checks
if (!authUser) return <LoginRequired />;

// Use user for profile data
if (user?.userRole === 'place_lister') {
  return <PlaceListerView />;
}
```

## Common Anti-Patterns

### ❌ Don't Do This:
```typescript
// Using auth store for profile data
const { user } = useSupabaseAuthStore();
const personality = user?.personalityType; // Won't exist!
const placeDetails = user?.placeDetails;   // Won't exist!
```

### ✅ Do This Instead:
```typescript
// Use appropriate store for each purpose
const { user: authUser, isLoggedIn } = useSupabaseAuthStore(); // Auth
const { user } = useSupabaseUserStore(); // Profile data

if (!isLoggedIn) return <LoginScreen />;
const personality = user?.personalityType;
const placeDetails = user?.placeDetails;
```

## Data Consistency

### userRole Handling

The `userRole` field is now consistently handled across stores:

1. **Authoritative source:** `supabaseUserStore` writes to `user_role` database column
2. **Auth store compatibility:** `supabaseAuthStore` reads from `user_role` column with JSONB fallback
3. **Types:** All stores support `'roommate_seeker' | 'place_lister' | 'both'`

### Database Storage

- **user_role column:** Direct storage for user role (preferred)
- **housing_goals.user_role:** JSONB fallback for backward compatibility
- **Profile data:** Stored in various columns and JSONB fields, managed by `supabaseUserStore`

## Migration Checklist

When adding new features or updating existing components:

- [ ] Use `supabaseAuthStore` only for authentication state
- [ ] Use `supabaseUserStore` for all profile data access
- [ ] Avoid `userStore` for new features
- [ ] Test that userRole is accessible after onboarding
- [ ] Ensure consistent user experience across user types (place lister vs roommate seeker)

## File Examples

### Correctly Using Both Stores:
- `app/(tabs)/matches/index.tsx` - Uses `supabaseUserStore` for user role detection
- `components/matches/UniversalRoommateMatchesView.tsx` - Uses auth for ID, user store for profile
- `components/matches/NewMatchesSection.tsx` - Uses auth for current user ID, user store for role

### Auth-Only Usage:
- `app/_layout.tsx` - Uses `supabaseAuthStore` for session management
- `app/(auth)/login.tsx` - Uses `supabaseAuthStore` for authentication flows