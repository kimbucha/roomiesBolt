import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabaseClient';
import { toJsonb } from './jsonbHelper';

/**
 * Helper utility to migrate data from AsyncStorage to Supabase
 */
export const SupabaseMigrationHelper = {
  /**
   * Migrates user data from AsyncStorage to Supabase
   * @returns Promise that resolves when migration is complete
   */
  migrateUserData: async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('[Migration] Starting user data migration to Supabase');
      
      // Get current user from Supabase auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        return { 
          success: false, 
          message: 'No authenticated user found. Please log in first.' 
        };
      }
      
      // Get user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem('roomies-user-storage');
      if (!userDataString) {
        return { 
          success: false, 
          message: 'No user data found in AsyncStorage to migrate.' 
        };
      }
      
      // Parse the data
      const userData = JSON.parse(userDataString).state.user;
      if (!userData) {
        return { 
          success: false, 
          message: 'Invalid user data format in AsyncStorage.' 
        };
      }
      
      console.log('[Migration] Found user data in AsyncStorage:', userData.name);
      
      // Prepare complex data for JSONB columns
      const lifestylePreferences = toJsonb(userData.lifestylePreferences || {});
      const personalityDimensions = toJsonb(userData.personalityDimensions || {});
      const location = toJsonb(userData.location || {});
      const housingGoals = toJsonb({
        roomType: userData.preferences?.roomType,
        moveInDate: userData.preferences?.moveInDate,
        duration: userData.preferences?.duration
      });
      
      // Check if user already exists in Supabase
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (existingUser) {
        // Update existing user
        console.log('[Migration] Updating existing user in Supabase');
        
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: userData.name,
            profile_image_url: userData.profilePicture,
            is_premium: userData.isPremium || false,
            is_verified: userData.isVerified || false,
            onboarding_completed: userData.onboardingCompleted || false,
            budget_min: userData.budget?.min,
            budget_max: userData.budget?.max,
            personality_type: userData.personalityType,
            lifestyle_preferences: lifestylePreferences,
            personality_dimensions: personalityDimensions,
            location: location,
            housing_goals: housingGoals,
            profile_strength: 50 // Default value, will be recalculated
          })
          .eq('id', authUser.id);
          
        if (updateError) {
          console.error('[Migration] Error updating user:', updateError.message);
          return { 
            success: false, 
            message: `Error updating user: ${updateError.message}` 
          };
        }
      } else {
        // Create new user
        console.log('[Migration] Creating new user in Supabase');
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email || userData.email,
            name: userData.name,
            profile_image_url: userData.profilePicture,
            is_premium: userData.isPremium || false,
            is_verified: userData.isVerified || false,
            onboarding_completed: userData.onboardingCompleted || false,
            budget_min: userData.budget?.min,
            budget_max: userData.budget?.max,
            personality_type: userData.personalityType,
            lifestyle_preferences: lifestylePreferences,
            personality_dimensions: personalityDimensions,
            location: location,
            housing_goals: housingGoals,
            profile_strength: 50 // Default value, will be recalculated
          });
          
        if (insertError) {
          console.error('[Migration] Error creating user:', insertError.message);
          return { 
            success: false, 
            message: `Error creating user: ${insertError.message}` 
          };
        }
      }
      
      console.log('[Migration] User data migration completed successfully');
      return { 
        success: true, 
        message: 'User data migrated successfully to Supabase.' 
      };
    } catch (error) {
      console.error('[Migration] Migration failed:', error instanceof Error ? error.message : String(error));
      return { 
        success: false, 
        message: `Migration failed: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },
  
  /**
   * Migrates roommate profile data from AsyncStorage to Supabase
   * @returns Promise that resolves when migration is complete
   */
  migrateRoommateData: async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('[Migration] Starting roommate data migration to Supabase');
      
      // Get current user from Supabase auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        return { 
          success: false, 
          message: 'No authenticated user found. Please log in first.' 
        };
      }
      
      // Get roommate data from AsyncStorage
      const roommateDataString = await AsyncStorage.getItem('roomies-roommate-storage');
      if (!roommateDataString) {
        return { 
          success: false, 
          message: 'No roommate data found in AsyncStorage to migrate.' 
        };
      }
      
      // Parse the data
      const roommateData = JSON.parse(roommateDataString).state;
      if (!roommateData || !roommateData.profile) {
        return { 
          success: false, 
          message: 'Invalid roommate data format in AsyncStorage.' 
        };
      }
      
      const profile = roommateData.profile;
      console.log('[Migration] Found roommate profile in AsyncStorage');
      
      // Check if roommate profile already exists
      const { data: existingProfile } = await supabase
        .from('roommate_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();
      
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
        // Update existing profile
        console.log('[Migration] Updating existing roommate profile in Supabase');
        
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
          .eq('user_id', authUser.id);
          
        if (updateError) {
          console.error('[Migration] Error updating roommate profile:', updateError.message);
          return { 
            success: false, 
            message: `Error updating roommate profile: ${updateError.message}` 
          };
        }
      } else {
        // Create new profile
        console.log('[Migration] Creating new roommate profile in Supabase');
        
        const { error: insertError } = await supabase
          .from('roommate_profiles')
          .insert({
            user_id: authUser.id,
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
          console.error('[Migration] Error creating roommate profile:', insertError.message);
          return { 
            success: false, 
            message: `Error creating roommate profile: ${insertError.message}` 
          };
        }
      }
      
      console.log('[Migration] Roommate data migration completed successfully');
      return { 
        success: true, 
        message: 'Roommate data migrated successfully to Supabase.' 
      };
    } catch (error) {
      console.error('[Migration] Migration failed:', error instanceof Error ? error.message : String(error));
      return { 
        success: false, 
        message: `Migration failed: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },
  
  /**
   * Migrates all data from AsyncStorage to Supabase
   * @returns Promise that resolves when migration is complete
   */
  migrateAllData: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const userResult = await SupabaseMigrationHelper.migrateUserData();
      if (!userResult.success) {
        return userResult;
      }
      
      const roommateResult = await SupabaseMigrationHelper.migrateRoommateData();
      if (!roommateResult.success) {
        return roommateResult;
      }
      
      return {
        success: true,
        message: 'All data migrated successfully to Supabase.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
};

export default SupabaseMigrationHelper;
