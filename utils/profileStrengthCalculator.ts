import { supabase } from '../services/supabaseClient';

/**
 * Profile strength calculator
 * Calculates and updates the profile strength percentage based on completed profile fields
 */
export const ProfileStrengthCalculator = {
  /**
   * Profile sections and their contribution to overall strength
   * Total adds up to 100%
   */
  STRENGTH_WEIGHTS: {
    ACCOUNT_CREATED: 10,   // Basic account exists
    BASIC_INFO: 15,        // Name, email verified
    BUDGET: 10,            // Budget preferences
    LIFESTYLE: 15,         // Lifestyle preferences
    PERSONALITY: 15,       // Personality quiz completed
    GOALS: 10,             // Housing goals
    PREFERENCES: 10,       // Roommate preferences
    PHOTOS: 15             // Profile photos uploaded
  },

  /**
   * Calculate profile strength based on completed sections
   * @param profile The user profile object
   * @returns Number between 0-100 representing profile completion percentage
   */
  calculateStrength: (profile: any): number => {
    if (!profile) return 0;
    
    let strength = ProfileStrengthCalculator.STRENGTH_WEIGHTS.ACCOUNT_CREATED;
    
    // Basic info
    if (profile.name && profile.email) {
      strength += ProfileStrengthCalculator.STRENGTH_WEIGHTS.BASIC_INFO;
    }
    
    // Budget
    if (profile.budget_min && profile.budget_max) {
      strength += ProfileStrengthCalculator.STRENGTH_WEIGHTS.BUDGET;
    }
    
    // Lifestyle
    if (profile.lifestyle_preferences && Object.keys(profile.lifestyle_preferences).length > 0) {
      strength += ProfileStrengthCalculator.STRENGTH_WEIGHTS.LIFESTYLE;
    }
    
    // Personality
    if (profile.personality_type) {
      strength += ProfileStrengthCalculator.STRENGTH_WEIGHTS.PERSONALITY;
    }
    
    // Goals
    if (profile.housing_goals && Object.keys(profile.housing_goals).length > 0) {
      strength += ProfileStrengthCalculator.STRENGTH_WEIGHTS.GOALS;
    }
    
    // Preferences
    if (profile.roommate_preferences && Object.keys(profile.roommate_preferences).length > 0) {
      strength += ProfileStrengthCalculator.STRENGTH_WEIGHTS.PREFERENCES;
    }
    
    // Photos
    if (profile.profile_picture_url) {
      strength += ProfileStrengthCalculator.STRENGTH_WEIGHTS.PHOTOS;
    }
    
    return Math.min(100, Math.round(strength));
  },
  
  /**
   * Update the profile strength in the database
   * @param userId The user ID
   * @param profile The user profile object (optional, will be fetched if not provided)
   */
  updateProfileStrength: async (userId: string, profile?: any): Promise<void> => {
    try {
      // If profile not provided, fetch it
      if (!profile) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error('[ProfileStrength] Error fetching profile:', error.message);
          return;
        }
        
        profile = data;
      }
      
      // Calculate strength
      const strength = ProfileStrengthCalculator.calculateStrength(profile);
      
      // Update in database
      const { error } = await supabase
        .from('users')
        .update({ profile_strength: strength })
        .eq('id', userId);
        
      if (error) {
        console.error('[ProfileStrength] Error updating strength:', error.message);
      } else {
        console.log(`[ProfileStrength] Updated profile strength to ${strength}% for user ${userId}`);
      }
    } catch (error: any) {
      console.error('[ProfileStrength] Unexpected error:', error?.message || 'Unknown error');
    }
  },
  
  /**
   * Update profile strength after completing a specific onboarding step
   * @param userId The user ID
   * @param step The completed onboarding step
   */
  updateAfterStep: async (userId: string, step: string): Promise<void> => {
    try {
      // Get current profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error(`[ProfileStrength] Error fetching profile after ${step} step:`, error.message);
        return;
      }
      
      // Calculate new strength
      const strength = ProfileStrengthCalculator.calculateStrength(profile);
      
      // Update in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_strength: strength })
        .eq('id', userId);
        
      if (updateError) {
        console.error(`[ProfileStrength] Error updating strength after ${step} step:`, updateError.message);
      } else {
        console.log(`[ProfileStrength] Updated profile strength to ${strength}% after completing ${step} step`);
      }
    } catch (error: any) {
      console.error('[ProfileStrength] Unexpected error:', error?.message || 'Unknown error');
    }
  }
};
