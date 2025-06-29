import { supabase } from '../services/supabaseClient';
import { calculateProfileStrength } from './profileStrength';
import { toJsonb } from './jsonbHelper';

/**
 * Utility for updating profile data and strength during onboarding with Supabase
 * This version properly handles JSONB columns
 */
export const SupabaseOnboardingProfileUpdater = {
  /**
   * Update profile data and strength after completing an onboarding step
   * @param userId User ID
   * @param step Completed step name
   * @param data Step-specific data to save
   */
  updateAfterStep: async (
    userId: string, 
    step: string, 
    data?: Record<string, any>
  ): Promise<void> => {
    try {
      console.log(`[Onboarding] Updating profile after completing step: ${step}`);
      
      // Always try to get the authenticated user ID first
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.id) {
        console.log(`[Onboarding] Using authenticated user ID: ${authUser.id}`);
        userId = authUser.id;
      } else if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error(`[Onboarding] No authenticated user and invalid user ID format: ${userId}`);
          return;
      }
      
      // First, fetch the current profile
      const { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (fetchError) {
        console.error(`[Onboarding] Error fetching profile for step ${step}:`, fetchError.message);
        return;
      }
      
      // Update the profile with step-specific data
      const updateData: Record<string, any> = {};
      
      // Track completed steps
      const completedSteps = profile.completed_steps || [];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
        updateData.completed_steps = completedSteps;
      }
      
      // Format the data based on the step
      const formattedData = SupabaseOnboardingProfileUpdater.formatStepData(step, data || {});
      
      // Merge formatted data into update data
      Object.assign(updateData, formattedData);
      
      // Calculate new profile strength
      const updatedProfile = { ...profile, ...updateData };
      const strength = calculateProfileStrength(updatedProfile);
      updateData.profile_strength = strength;
      
      // Log what we're updating
      console.log(`[Onboarding] Updating profile for user ${userId} with data:`, JSON.stringify(updateData, null, 2));
      
      // Update the profile in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);
        
      if (updateError) {
        console.error(`[Onboarding] Error updating profile for step ${step}:`, updateError.message);
        return;
      }
      
      console.log(`[Onboarding] Successfully updated profile after step ${step}. New strength: ${strength}%`);
    } catch (error) {
      console.error(`[Onboarding] Error in updateAfterStep:`, error instanceof Error ? error.message : String(error));
    }
  },
  
  /**
   * Map onboarding steps to profile data fields
   * @param step Onboarding step name
   * @param data Step data
   * @returns Formatted data for profile update
   */
  formatStepData(step: string, data: any): Record<string, any> {
    const formattedData: Record<string, any> = {};
    
    console.log(`[Onboarding] Formatting step data for ${step}:`, JSON.stringify(data, null, 2));
    
    switch (step) {
      case 'get-started':
      case 'welcome':
        if (data.name) formattedData.name = data.name;
        break;
        
      case 'budget':
        // Handle budget data structure from budget.tsx
        if (data.budget_min !== undefined) formattedData.budget_min = data.budget_min;
        if (data.budget_max !== undefined) formattedData.budget_max = data.budget_max;
        
        if (data.preferred_locations) {
          // Store preferred locations as JSONB
          formattedData.preferred_locations = toJsonb(data.preferred_locations);
        }
        
        // Also handle old budget data structure for compatibility
        if (data.budget) {
          if (data.budget.min !== undefined) formattedData.budget_min = data.budget.min;
          if (data.budget.max !== undefined) formattedData.budget_max = data.budget.max;
        }
        
        if (data.location) {
          // Store location as JSONB
          formattedData.location = toJsonb(data.location);
        }
        break;
        
      case 'lifestyle':
        // Handle lifestyle data from lifestyle.tsx
        if (data.lifestylePreferences) {
          formattedData.lifestyle_preferences = toJsonb(data.lifestylePreferences);
        }
        if (data.rawAnswers) {
          formattedData.lifestyle_answers = toJsonb(data.rawAnswers);
        }
        // Handle legacy format where data is passed directly
        if (data.lifestyle_preferences) {
          formattedData.lifestyle_preferences = toJsonb(data.lifestyle_preferences);
        }
        break;
        
      case 'personality':
        // Handle personality data from personality results
        if (data.personalityType) formattedData.personality_type = data.personalityType;
        if (data.personality_type) formattedData.personality_type = data.personality_type;
        
        if (data.personalityDimensions) {
          formattedData.personality_dimensions = toJsonb(data.personalityDimensions);
        }
        
        if (data.dimensions) {
          formattedData.personality_dimensions = toJsonb(data.dimensions);
        }
        
        if (data.personality_dimensions) {
          formattedData.personality_dimensions = toJsonb(data.personality_dimensions);
        }
        break;
        
      case 'goals':
        // Handle goals data from goals.tsx
        if (data.housing_goals) {
          formattedData.housing_goals = toJsonb(data.housing_goals);
        }
        
        if (data.move_in_timeframe) {
          formattedData.move_in_timeframe = data.move_in_timeframe;
        }
        break;
        
      case 'about-you':
        // Handle about-you data
        if (data.gender) formattedData.gender = data.gender;
        if (data.preferences) {
          formattedData.roommate_preferences = toJsonb(data.preferences);
        }
        // CRITICAL FIX: Save personality traits from about-you step
        if (data.personality_traits && Array.isArray(data.personality_traits)) {
          formattedData.personality_traits = data.personality_traits;
        }
        break;
        
      case 'education':
        // Handle education/work data
        if (data.university !== undefined) formattedData.university = data.university;
        if (data.major !== undefined) formattedData.major = data.major;
        if (data.year !== undefined) formattedData.year = data.year;
        if (data.company !== undefined) formattedData.company = data.company;
        if (data.role !== undefined) formattedData.role = data.role;
        break;
        
      case 'photos':
        // Handle profile picture URL - store as profile_picture (consistent naming)  
        if (data.profilePicture) formattedData.profile_picture = data.profilePicture;
        if (data.profile_picture_url) formattedData.profile_picture = data.profile_picture_url;
        if (data.profile_image_url) formattedData.profile_picture = data.profile_image_url;
        
        // Handle additional photos
        if (data.additionalPhotos) formattedData.additional_photos = toJsonb(data.additionalPhotos);
        if (data.additional_photos) formattedData.additional_photos = toJsonb(data.additional_photos);
        
        // Handle date of birth
        if (data.dateOfBirth) formattedData.date_of_birth = data.dateOfBirth;
        if (data.date_of_birth) formattedData.date_of_birth = data.date_of_birth;
        break;
        
      case 'account':
        // Account step doesn't complete onboarding anymore
        break;
        
      case 'notifications':
        // Mark onboarding as completed when user finishes notifications step
        formattedData.onboarding_completed = true;
        
        // KEEP: Essential for data persistence testing
        console.log('[DATA PERSISTENCE TEST] 🎯 Setting onboarding_completed = true in Supabase database');
        
        // Note: notifications_enabled column doesn't exist in current schema
        // If we need notification preferences, they should be added to schema first
        // For now, we'll just mark onboarding as completed
        break;
        
      default:
        console.log(`[Onboarding] Unknown step: ${step}, storing data as-is`);
        // For unknown steps, try to store the data as-is
        Object.assign(formattedData, data);
        break;
    }
    
    console.log(`[Onboarding] Formatted data for ${step}:`, JSON.stringify(formattedData, null, 2));
    return formattedData;
  }
};

export default SupabaseOnboardingProfileUpdater;
