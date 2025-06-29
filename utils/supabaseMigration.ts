import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabaseClient';
import { generateId } from './idGenerator';
import { Alert } from 'react-native';

/**
 * Utility to migrate user data from AsyncStorage to Supabase
 * This should be used during the transition period
 */
export const migrateUserToSupabase = async (email: string, password: string) => {
  try {
    console.log('[Migration] Starting user migration to Supabase...');
    
    // Get user data from AsyncStorage
    const userDataString = await AsyncStorage.getItem('roomies-user-storage');
    if (!userDataString) {
      console.log('[Migration] No user data found in AsyncStorage');
      return { success: false, error: 'No user data found' };
    }
    
    // Parse the user data
    const userData = JSON.parse(userDataString);
    if (!userData.state || !userData.state.user) {
      console.log('[Migration] Invalid user data format in AsyncStorage');
      return { success: false, error: 'Invalid user data format' };
    }
    
    const user = userData.state.user;
    console.log('[Migration] Found user data:', user.name);
    
    // Check if user already exists in Supabase by email
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();
      
    if (checkError) {
      console.error('[Migration] Error checking for existing user:', checkError);
      return { success: false, error: checkError.message };
    }
    
    let userId;
    
    // If user doesn't exist, create them in Supabase Auth
    if (!existingUsers) {
      console.log('[Migration] Creating new user in Supabase Auth...');
      
      // Sign up the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: user.name
          }
        }
      });
      
      if (authError) {
        console.error('[Migration] Error creating auth user:', authError);
        return { success: false, error: authError.message };
      }
      
      userId = authData.user?.id;
      
      if (!userId) {
        console.error('[Migration] No user ID returned from auth signup');
        return { success: false, error: 'No user ID returned from auth signup' };
      }
      
      // Create user record in the users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          name: user.name,
          is_premium: user.isPremium || false,
          is_verified: user.isVerified || false,
          profile_image_url: user.profileImage,
          onboarding_completed: user.onboardingCompleted || false
        });
        
      if (userError) {
        console.error('[Migration] Error creating user record:', userError);
        return { success: false, error: userError.message };
      }
    } else {
      userId = existingUsers.id;
      console.log('[Migration] User already exists in Supabase with ID:', userId);
    }
    
    // Now migrate the roommate profile if it exists
    const roommateDataString = await AsyncStorage.getItem('roomies-roommate-storage');
    if (roommateDataString) {
      const roommateData = JSON.parse(roommateDataString);
      
      if (roommateData.state && roommateData.state.profiles) {
        // Find the user's own profile
        const userProfile = roommateData.state.profiles.find((p: any) => p.id === user.id);
        
        if (userProfile) {
          console.log('[Migration] Found roommate profile for user');
          
          // Check if profile already exists
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('roommate_profiles')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
            
          if (profileCheckError) {
            console.error('[Migration] Error checking for existing profile:', profileCheckError);
          }
          
          if (!existingProfile) {
            // Map the profile data to the Supabase schema
            const profileData = {
              id: generateId(),
              user_id: userId,
              age: userProfile.age,
              university: userProfile.university,
              major: userProfile.major,
              bio: userProfile.bio,
              budget: typeof userProfile.budget === 'string' 
                ? { range: userProfile.budget } 
                : userProfile.budget,
              location: typeof userProfile.location === 'string' 
                ? { city: userProfile.location } 
                : userProfile.location,
              neighborhood: userProfile.neighborhood,
              room_photos: userProfile.roomPhotos,
              traits: userProfile.traits,
              compatibility_score: userProfile.compatibilityScore,
              has_place: userProfile.hasPlace || false,
              room_type: userProfile.roomType,
              amenities: userProfile.amenities,
              bedrooms: userProfile.bedrooms,
              bathrooms: userProfile.bathrooms,
              is_furnished: userProfile.isFurnished,
              lease_duration: userProfile.leaseDuration,
              move_in_date: userProfile.moveInDate,
              flexible_stay: userProfile.flexibleStay,
              lease_type: userProfile.leaseType,
              utilities_included: userProfile.utilitiesIncluded,
              pet_policy: userProfile.petPolicy,
              sublet_allowed: userProfile.subletAllowed,
              gender: userProfile.gender,
              date_of_birth: userProfile.dateOfBirth,
              user_role: userProfile.userRole,
              personality_traits: userProfile.personalityTraits,
              personality_type: userProfile.personalityType,
              personality_dimensions: userProfile.personalityDimensions,
              social_media: userProfile.socialMedia,
              lifestyle_preferences: userProfile.lifestylePreferences,
              personal_preferences: userProfile.personalPreferences,
              description: userProfile.description,
              address: userProfile.address,
              monthly_rent: userProfile.monthlyRent,
              place_details: userProfile.placeDetails
            };
            
            // Insert the profile into Supabase
            const { error: profileError } = await supabase
              .from('roommate_profiles')
              .insert(profileData);
              
            if (profileError) {
              console.error('[Migration] Error creating roommate profile:', profileError);
              return { 
                success: true, 
                userId, 
                warning: `User migrated but profile failed: ${profileError.message}` 
              };
            }
            
            console.log('[Migration] Successfully migrated roommate profile');
          } else {
            console.log('[Migration] Roommate profile already exists for user');
          }
        }
      }
    }
    
    console.log('[Migration] Migration completed successfully');
    return { success: true, userId };
    
  } catch (error: any) {
    console.error('[Migration] Unexpected error during migration:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Utility to check if a user needs migration
 */
export const checkMigrationNeeded = async () => {
  try {
    // Check if user data exists in AsyncStorage
    const userDataString = await AsyncStorage.getItem('roomies-user-storage');
    if (!userDataString) {
      return false;
    }
    
    // Parse the user data
    const userData = JSON.parse(userDataString);
    if (!userData.state || !userData.state.user) {
      return false;
    }
    
    // Check if user already exists in Supabase
    const { data: session } = await supabase.auth.getSession();
    if (session && session.session) {
      // User is already authenticated in Supabase
      return false;
    }
    
    // Migration is needed
    return true;
  } catch (error) {
    console.error('[Migration] Error checking migration status:', error);
    return false;
  }
};

/**
 * Prompt the user to migrate their data
 */
export const promptMigration = async (email: string) => {
  return new Promise((resolve) => {
    Alert.alert(
      'Migrate Your Account',
      'We\'ve updated our system! Would you like to migrate your existing account data?',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => resolve(false)
        },
        {
          text: 'Migrate',
          onPress: () => resolve(true)
        }
      ],
      { cancelable: false }
    );
  });
};
