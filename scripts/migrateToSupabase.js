/**
 * Migration script to help users transition from AsyncStorage to Supabase
 * 
 * Run this script with:
 * node scripts/migrateToSupabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables
require('dotenv').config();

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to safely convert values to JSONB
const toJsonb = (value) => {
  if (value === null || value === undefined) {
    return {};
  }
  
  if (typeof value === 'object') {
    // Filter out undefined values which can cause issues with PostgreSQL
    return Object.fromEntries(
      Object.entries(value).filter(([_, v]) => v !== undefined)
    );
  }
  
  // If it's a primitive value, wrap it in an object
  return { value };
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Function to read AsyncStorage data from exported JSON files
const readAsyncStorageData = async (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
};

// Main migration function
const migrateToSupabase = async () => {
  try {
    console.log('=== Roomies AsyncStorage to Supabase Migration ===');
    console.log('This script will migrate your data from AsyncStorage to Supabase');
    console.log('Make sure you have exported your AsyncStorage data to JSON files first');
    console.log('');
    
    // Get file paths from user
    const userDataPath = await prompt('Path to user data JSON file: ');
    const roommateDataPath = await prompt('Path to roommate data JSON file (optional, press Enter to skip): ');
    
    // Read user data
    console.log('\nReading user data...');
    const userData = await readAsyncStorageData(userDataPath);
    if (!userData) {
      console.error('Failed to read user data. Migration aborted.');
      process.exit(1);
    }
    
    // Read roommate data if provided
    let roommateData = null;
    if (roommateDataPath) {
      console.log('Reading roommate data...');
      roommateData = await readAsyncStorageData(roommateDataPath);
    }
    
    // Extract user data from the state
    const user = userData.state?.user;
    if (!user) {
      console.error('Invalid user data format. Expected state.user structure.');
      process.exit(1);
    }
    
    console.log(`\nFound user: ${user.name} (${user.email})`);
    
    // Check if user exists in Supabase Auth
    console.log('\nChecking if user exists in Supabase Auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(user.email);
    
    let userId;
    
    if (authError || !authUser) {
      console.log('User not found in Supabase Auth. Creating new user...');
      
      // Create temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Create user in Supabase Auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: user.name
        }
      });
      
      if (createError) {
        console.error('Failed to create user in Supabase Auth:', createError.message);
        process.exit(1);
      }
      
      userId = newUser.user.id;
      console.log(`Created new user with ID: ${userId}`);
      console.log(`Temporary password: ${tempPassword}`);
      console.log('IMPORTANT: User should reset this password on first login');
    } else {
      userId = authUser.user.id;
      console.log(`User found in Supabase Auth with ID: ${userId}`);
    }
    
    // Prepare complex data for JSONB columns
    const lifestylePreferences = toJsonb(user.lifestylePreferences || {});
    const personalityDimensions = toJsonb(user.personalityDimensions || {});
    const location = toJsonb(user.location || {});
    const housingGoals = toJsonb({
      roomType: user.preferences?.roomType,
      moveInDate: user.preferences?.moveInDate,
      duration: user.preferences?.duration
    });
    
    // Check if user exists in users table
    console.log('\nChecking if user exists in users table...');
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error checking user in users table:', userError.message);
    }
    
    if (existingUser) {
      console.log('User found in users table. Updating user data...');
      
      // Update user data
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: user.name,
          profile_image_url: user.profilePicture,
          is_premium: user.isPremium || false,
          is_verified: user.isVerified || false,
          onboarding_completed: user.onboardingCompleted || false,
          budget_min: user.budget?.min,
          budget_max: user.budget?.max,
          personality_type: user.personalityType,
          lifestyle_preferences: lifestylePreferences,
          personality_dimensions: personalityDimensions,
          location: location,
          housing_goals: housingGoals,
          profile_strength: 50 // Default value, will be recalculated
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Failed to update user data:', updateError.message);
      } else {
        console.log('User data updated successfully');
      }
    } else {
      console.log('User not found in users table. Creating new user record...');
      
      // Create user record
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: user.email,
          name: user.name,
          profile_image_url: user.profilePicture,
          is_premium: user.isPremium || false,
          is_verified: user.isVerified || false,
          onboarding_completed: user.onboardingCompleted || false,
          budget_min: user.budget?.min,
          budget_max: user.budget?.max,
          personality_type: user.personalityType,
          lifestyle_preferences: lifestylePreferences,
          personality_dimensions: personalityDimensions,
          location: location,
          housing_goals: housingGoals,
          profile_strength: 50 // Default value, will be recalculated
        });
        
      if (insertError) {
        console.error('Failed to create user record:', insertError.message);
      } else {
        console.log('User record created successfully');
      }
    }
    
    // Migrate roommate data if provided
    if (roommateData && roommateData.state?.profile) {
      console.log('\nMigrating roommate profile data...');
      
      const profile = roommateData.state.profile;
      
      // Check if roommate profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('roommate_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking roommate profile:', profileError.message);
      }
      
      // Prepare complex data for JSONB columns
      const personalityDimensions = toJsonb(profile.personalityDimensions || {});
      const lifestylePreferences = toJsonb({
        cleanliness: profile.cleanliness,
        noise: profile.noise,
        guestFrequency: profile.guestFrequency,
        smoking: profile.smoking,
        pets: profile.pets,
        drinking: profile.drinking,
        earlyRiser: profile.earlyRiser,
        nightOwl: profile.nightOwl
      });
      
      const placeDetails = toJsonb(profile.placeDetails || {});
      
      if (existingProfile) {
        console.log('Roommate profile found. Updating profile data...');
        
        // Update profile
        const { error: updateError } = await supabase
          .from('roommate_profiles')
          .update({
            age: profile.age,
            university: profile.university,
            major: profile.major,
            year: profile.year,
            bio: profile.bio,
            room_photos: profile.photos || [],
            traits: profile.personalityTraits || [],
            has_place: profile.hasPlace || false,
            gender: profile.gender,
            personality_type: profile.personalityType,
            personality_dimensions: personalityDimensions,
            lifestyle_preferences: lifestylePreferences,
            place_details: placeDetails,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
          
        if (updateError) {
          console.error('Failed to update roommate profile:', updateError.message);
        } else {
          console.log('Roommate profile updated successfully');
        }
      } else {
        console.log('Roommate profile not found. Creating new profile...');
        
        // Create profile
        const { error: insertError } = await supabase
          .from('roommate_profiles')
          .insert({
            user_id: userId,
            age: profile.age,
            university: profile.university,
            major: profile.major,
            year: profile.year,
            bio: profile.bio,
            room_photos: profile.photos || [],
            traits: profile.personalityTraits || [],
            has_place: profile.hasPlace || false,
            gender: profile.gender,
            personality_type: profile.personalityType,
            personality_dimensions: personalityDimensions,
            lifestyle_preferences: lifestylePreferences,
            place_details: placeDetails
          });
          
        if (insertError) {
          console.error('Failed to create roommate profile:', insertError.message);
        } else {
          console.log('Roommate profile created successfully');
        }
      }
    }
    
    console.log('\n=== Migration Complete ===');
    console.log('Your data has been migrated to Supabase successfully.');
    console.log('You can now use the Supabase-based stores in your app.');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    rl.close();
  }
};

// Run the migration
migrateToSupabase();
