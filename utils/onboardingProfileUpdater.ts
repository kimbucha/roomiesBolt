import { supabase } from '../services/supabaseClient';
import { calculateProfileStrength } from './profileStrength';
import { useUserStore } from '../store/userStore';

/**
 * Utility for updating profile data and strength during onboarding
 */
export const OnboardingProfileUpdater = {
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
      
      // Make sure we have a valid UUID format for the user ID
      if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error(`[Onboarding] Invalid user ID format: ${userId}`);
        
        // Try to get the current user ID from auth
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          console.log(`[Onboarding] Using authenticated user ID instead: ${user.id}`);
          userId = user.id;
        } else {
          console.error('[Onboarding] No valid user ID available');
          return;
        }
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
      const updateData: Record<string, any> = { 
        ...data 
      };
      
      // Track completed steps
      const completedSteps = profile.completed_steps || [];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
        updateData.completed_steps = completedSteps;
      }
      
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
      
      // Update the local user store with the new profile data
      const userStore = useUserStore.getState();
      if (userStore.user?.id === userId) {
        // Use the existing updateUser method to refresh the user data
        userStore.updateUser(updateData);
      }
      
    } catch (error: any) {
      console.error('[Onboarding] Unexpected error updating profile:', error?.message || 'Unknown error');
    }
  },
  
  /**
   * Map onboarding steps to profile data fields
   * @param step Onboarding step name
   * @param data Step data
   * @returns Formatted data for profile update
   */
  formatStepData: (step: string, data: any): Record<string, any> => {
    switch (step) {
      case 'welcome':
        return {
          name: data.name
        };
        
      case 'budget':
        return {
          budget_min: data.budgetMin,
          budget_max: data.budgetMax,
          preferred_locations: data.locations
        };
        
      case 'lifestyle':
        return {
          lifestyle_preferences: data.preferences
        };
        
      case 'personality':
        return {
          personality_type: data.personalityType,
          personality_traits: data.traits
        };
        
      case 'goals':
        return {
          housing_goals: data.goals,
          move_in_timeframe: data.timeframe
        };
        
      case 'preferences':
        return {
          roommate_preferences: data.preferences
        };
        
      case 'photos':
        return {
          profile_picture_url: data.profilePicture,
          additional_photos: data.additionalPhotos
        };
        
      case 'account':
        return {
          email_verified: true
        };
        
      default:
        return {};
    }
  }
};
