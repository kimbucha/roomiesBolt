# Roomies App: AsyncStorage to Supabase Migration Guide

This guide will walk you through the process of migrating your Roomies app from AsyncStorage to Supabase with JSONB support for complex data structures.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Migration Steps](#migration-steps)
4. [Using JSONB in Supabase](#using-jsonb-in-supabase)
5. [Testing the Migration](#testing-the-migration)
6. [Troubleshooting](#troubleshooting)

## Overview

We've implemented a complete migration solution to move your app from AsyncStorage to Supabase with proper JSONB support. This includes:

- **JSONB Helper Utility**: Functions for working with JSONB data
- **Migration Helper**: Utilities to migrate data from AsyncStorage to Supabase
- **Supabase User Store**: A replacement for the original userStore that uses Supabase
- **Supabase Onboarding Updater**: An updated version of the onboarding profile updater that properly handles JSONB

## Prerequisites

Before starting the migration, ensure you have:

1. A Supabase project set up with the correct schema
2. The SQL migration script has been run to add all necessary columns
3. Environment variables configured in your `.env` file:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

## Migration Steps

### 1. Run the Database Schema Updates

If you haven't already, run the `add_complex_columns.sql` script in the Supabase SQL Editor to add all necessary JSONB columns.

### 2. Migrate User Data

When a user logs in, you can trigger the migration process:

```javascript
import SupabaseMigrationHelper from '../utils/supabaseMigrationHelper';

// Migrate all data from AsyncStorage to Supabase
const result = await SupabaseMigrationHelper.migrateAllData();
if (result.success) {
  console.log('Migration successful!');
} else {
  console.error('Migration failed:', result.message);
}
```

Alternatively, you can use the migration component we've created:

```jsx
import SupabaseMigration from '../components/SupabaseMigration';

// In your component
return <SupabaseMigration onComplete={handleMigrationComplete} />;
```

### 3. Switch to Supabase Stores

Replace imports of the original stores with the new Supabase-based stores:

```javascript
// Before
import { useUserStore } from '../store/userStore';

// After
import { useSupabaseUserStore } from '../store/supabaseUserStore';
```

### 4. Fetch User Profile

After login, make sure to fetch the user profile from Supabase:

```javascript
await useSupabaseUserStore.getState().fetchUserProfile();
```

### 5. Update Onboarding Components

Update your onboarding components to use the new Supabase onboarding profile updater:

```javascript
// Before
import { OnboardingProfileUpdater } from '../utils/onboardingProfileUpdater';

// After
import { SupabaseOnboardingProfileUpdater } from '../utils/supabaseOnboardingProfileUpdater';
```

## Using JSONB in Supabase

JSONB is a powerful feature in PostgreSQL that allows you to store complex nested data structures. We've created helper functions to make working with JSONB easier:

### Converting to JSONB

```javascript
import { toJsonb } from '../utils/jsonbHelper';

// Convert a complex object to JSONB
const lifestylePreferences = toJsonb({
  cleanliness: 5,
  noise: 3,
  guestFrequency: 2,
  smoking: false,
  pets: true
});

// Update in Supabase
await supabase
  .from('users')
  .update({ lifestyle_preferences: lifestylePreferences })
  .eq('id', userId);
```

### Extracting from JSONB

```javascript
import { getJsonbProperty } from '../utils/jsonbHelper';

// Get a property with type safety and default value
const cleanliness = getJsonbProperty(
  user.lifestyle_preferences,
  'cleanliness',
  3 // default value
);
```

### Converting Between Flat and Nested Structures

```javascript
import { flatToNested, nestedToFlat } from '../utils/jsonbHelper';

// Convert flat object with dot notation to nested structure
const nested = flatToNested({
  'lifestyle_preferences.cleanliness': 5,
  'lifestyle_preferences.noise': 3
});
// Result: { lifestyle_preferences: { cleanliness: 5, noise: 3 } }

// Convert nested structure to flat object with dot notation
const flat = nestedToFlat({
  lifestyle_preferences: { cleanliness: 5, noise: 3 }
});
// Result: { 'lifestyle_preferences.cleanliness': 5, 'lifestyle_preferences.noise': 3 }
```

## Testing the Migration

To test the migration:

1. Log in with an existing account
2. Verify that the migration process completes successfully
3. Check that all user data is correctly displayed in the app
4. Complete an onboarding step to verify that data is saved correctly
5. Log out and log back in to verify that data persists

## Troubleshooting

### Common Issues

1. **Missing Columns**: If you see errors about missing columns, make sure you've run the `add_complex_columns.sql` script.

2. **Invalid UUID Format**: If you see errors about invalid UUID format, check that the user ID being used is a valid Supabase UUID.

3. **JSONB Parsing Errors**: If you encounter JSONB parsing errors, check that you're using the `toJsonb` helper function to format data correctly.

### Debugging

We've added extensive logging throughout the migration process. Check the console logs for detailed information about what's happening during migration.

If you need to manually inspect the data in Supabase:

1. Go to your Supabase dashboard
2. Navigate to the Table Editor
3. Select the `users` table
4. Look for your user record and examine the JSONB columns

## Next Steps

After completing the migration, consider:

1. Removing the old AsyncStorage-based stores
2. Updating all components to use the new Supabase stores
3. Implementing real-time features using Supabase's real-time capabilities
4. Setting up proper error handling and retry logic for network operations

---

By following this guide, you should be able to successfully migrate your Roomies app from AsyncStorage to Supabase with proper JSONB support for complex data structures.
