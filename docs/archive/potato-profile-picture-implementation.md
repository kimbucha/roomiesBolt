# Potato Profile Picture for Skipped Onboarding

This document explains the implementation of the potato profile picture feature for users who skip the onboarding process.

## Overview

When users reach the "Welcome to Roomies" screen and choose "Skip for now" instead of "Let's Begin", they now automatically get a potato image as their default profile picture instead of the yellow lego avatar.

## Implementation Details

### Files Modified

1. **`app/(onboarding)/get-started.tsx`**
   - Updated `handleSkip` function to set potato image as profile picture
   - Added proper profile picture setting and onboarding completion logic
   - Imports the potato image helper function

2. **`utils/profilePictureHelper.ts`**
   - Added `getSkippedOnboardingProfilePicture()` function
   - Added `convertLocalImageIdentifier()` function for handling local image references
   - Updated profile picture logic to handle local image identifiers

3. **`components/UserAvatar.tsx`**
   - Enhanced to handle both local images (require() objects) and URL strings
   - Added support for local image identifiers (e.g., 'local://potato.png')
   - Maintains backward compatibility with existing functionality

4. **`store/supabaseUserStore.ts`**
   - Updated to convert require() objects to local identifiers when saving to Supabase
   - Updated to convert local identifiers back to require() objects when reading from Supabase
   - Uses 'local://potato.png' as the identifier for the potato image

5. **`app/(tabs)/_layout.tsx`**
   - Fixed profile tab icon to use SupabaseUserStore instead of UserStore
   - Replaced UserAvatar component with direct Image component to avoid type conflicts
   - Now correctly displays potato image in the profile tab icon

6. **`utils/profilePictureHelper.ts`** (Additional Fix)
   - Fixed getProfilePicture() to properly convert local image identifiers to actual images
   - Added debugging to convertLocalImageIdentifier() function
   - Now returns the potato image instead of undefined for local://potato.png

7. **`supabase/migrations/005_add_profile_picture_column.sql`** (Database Fix)
   - Added missing profile_picture column to users table 
   - Fixed "Could not find the 'profile_picture' column" error during onboarding
   - Added proper indexing and documentation for the new column

### How It Works

1. **User Flow**:
   - User creates account and enters name/email/password
   - User sees "Welcome to Roomies" screen
   - User clicks "Skip for now"
   - System automatically sets potato image as profile picture
   - User is taken directly to the main app (/(tabs))

2. **Technical Flow**:
   - `handleSkip()` calls `getSkippedOnboardingProfilePicture()` to get potato image
   - Updates both local store and Supabase with the potato image
   - Local store stores the require() object directly
   - Supabase stores 'local://potato.png' identifier
   - When loading, identifier is converted back to require() object

3. **Profile Picture Priority**:
   - Personality images (from completed personality quiz)
   - User-uploaded photos
   - Potato image (for skipped onboarding)
   - Default lego avatar (fallback)

### Benefits

- **Consistent Branding**: Potato image provides a fun, branded default
- **Visual Distinction**: Easy to identify users who skipped onboarding
- **Performance**: Local images load instantly
- **Maintainability**: Centralized profile picture logic

### Usage Examples

```typescript
// Get potato image for skipped onboarding
const potatoImage = getSkippedOnboardingProfilePicture();

// Convert local identifier back to image object
const imageObject = convertLocalImageIdentifier('local://potato.png');
```

### Image Storage

- **Local**: Stored as require() objects in the app
- **Supabase**: Stored as 'local://potato.png' identifier
- **Conversion**: Automatic between formats when reading/writing

This implementation ensures users who skip onboarding get a distinctive and branded profile picture while maintaining system consistency and performance. 