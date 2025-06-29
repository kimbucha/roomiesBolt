# Roomies Profile Data Structure

This document outlines the profile data structure used in the Roomies app, explaining how data is stored, transferred, and used throughout the application.

## Overview

The Roomies app uses two main profile data structures:

1. **User Profile** (`User` interface in `userStore.ts`): Stores user authentication data and basic profile information.
2. **Roommate Profile** (`RoommateProfile` interface in `roommateStore.ts`): Stores detailed roommate information used for matching and display in the app.

Data collected during onboarding is stored in both structures, with the roommate profile being the primary data source for the matching and discovery features.

## Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Onboarding    │────▶│   User Store    │────▶│ Roommate Store  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Profile Edit   │     │  User Profile   │     │ Roommate Profile│
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. Data is collected during the onboarding process
2. Data is saved to the user store
3. When onboarding is complete, a roommate profile is automatically created
4. The roommate profile is used for matching and discovery

## User Profile Structure

The `User` interface in `userStore.ts` includes:

- **Basic Information**: `id`, `name`, `email`, `dateOfBirth`, `bio`, `profilePicture`, `photos`
- **Identity**: `gender`, `userRole` ('roommate_seeker', 'place_lister', 'both')
- **Education**: `university`, `major`, `year`
- **Account Status**: `isPremium`, `isVerified`
- **Preferences**: Notification settings, dark mode, language, budget, etc.
- **Personality**: `personalityTraits`, `personalityDimensions`, `personalityType`
- **Lifestyle**: Cleanliness, noise level, guest frequency, etc.

## Roommate Profile Structure

The `RoommateProfile` interface in `roommateStore.ts` includes:

- **Basic Information**: `id`, `name`, `age`, `bio`, `image`, `roomPhotos`
- **Identity**: `gender` ('male', 'female', 'other', 'prefer_not_to_say')
- **Education**: `university`, `major`, `year`
- **Location**: `location`, `neighborhood`
- **Budget**: `budget` (string format like "$1000-1500")
- **Place Details**: `hasPlace`, `roomType`, `amenities`, `bedrooms`, `bathrooms`, etc.
- **Personality**: `personalityTraits`, `personalityType`, `personalityDimensions`
- **Lifestyle Preferences**: 
  - `sleepSchedule` ('early_bird', 'night_owl', 'flexible')
  - `cleanliness` ('very_clean', 'clean', 'moderate', 'relaxed')
  - `noiseLevel` ('quiet', 'moderate', 'loud')
  - `guestPolicy` ('rarely', 'occasionally', 'frequently')
  - `smoking`, `drinking`, `pets` (boolean values)
- **Personal Preferences**: Temperature, pet preferences, schedule, etc.
- **Social Media**: Links to various social media profiles
- **Matching Data**: `compatibilityScore`, `matchScenario`, etc.

## Data Transfer

Data is transferred from the user profile to the roommate profile using the following utilities:

1. **`createProfileFromUser`** in `profileDataTransfer.ts`: Creates a new roommate profile from user data
2. **`updateProfileField`** in `profileUpdater.ts`: Updates a specific field in the roommate profile

The transfer happens automatically when:
- Onboarding is completed (via `updateOnboardingProgress` in `userStore.ts`)
- User profile is updated (via individual onboarding screens)

## Gender Filtering

Gender filtering uses a tiered approach:

1. First tries to use the direct `gender` field if available
2. Falls back to pronouns if gender isn't available
3. Uses name-based filtering as a last resort

This ensures consistent filtering results across all profiles.

## Best Practices

When collecting user data, follow these best practices:

1. **Save data immediately**: Save data to the user profile as soon as it's collected
   ```typescript
   // Example from about-you.tsx
   const handleGenderSelect = (id: string) => {
     setSelectedGender(id);
     
     // Save gender directly to user profile
     updateUser({
       gender: id as 'male' | 'female' | 'other' | 'prefer_not_to_say'
     });
   };
   ```

2. **Update roommate profile when needed**: For critical fields, update the roommate profile directly
   ```typescript
   // Example from lifestyle.tsx
   import { updateProfileField } from '../../utils/profileUpdater';
   
   // Update the roommate profile with new lifestyle preferences
   updateProfileField('lifestylePreferences', {
     sleepSchedule: 'night_owl',
     cleanliness: 'very_clean',
     // other fields...
   });
   ```

3. **Use the correct data types**: Make sure to use the correct data types as defined in the interfaces

4. **Test data transfer**: Use the profile data test screen to verify data transfer

## Testing

A debug screen is available at `/(debug)/profile-data-test` to test the profile data transfer functionality. This screen can be accessed from the Settings page (only visible in development mode).

The test screen allows you to:
1. View current user and roommate profile data
2. Test profile data transfer
3. Test updating specific fields
4. Verify that data is being properly transferred

## Future Improvements

Planned improvements to the profile data structure:

1. Add more fields to support additional matching criteria
2. Improve data validation to ensure consistency
3. Add support for profile verification
4. Enhance privacy controls for sensitive data
