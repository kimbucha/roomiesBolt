/**
 * Simple utility to test data persistence fix
 * Run this after completing onboarding to verify all fields are properly mapped
 */

import { supabase } from '../services/supabaseClient';
import { useSupabaseUserStore } from '../store/supabaseUserStore';

export const testDataPersistence = async () => {
  console.log('🧪 [TEST] Starting data persistence verification...');
  
  try {
    // Get current user from auth
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      console.error('❌ [TEST] No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }
    
    // Fetch raw data from database
    const { data: rawData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();
      
    if (error) {
      console.error('❌ [TEST] Error fetching raw data:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('📋 [TEST] Raw database data:', {
      gender: rawData.gender,
      personality_type: rawData.personality_type,
      date_of_birth: rawData.date_of_birth,
      onboarding_completed: rawData.onboarding_completed,
      lifestyle_preferences: rawData.lifestyle_preferences,
      university: rawData.university,
      major: rawData.major
    });
    
    // Get formatted user data from store
    const { fetchUserProfile } = useSupabaseUserStore.getState();
    await fetchUserProfile();
    
    const { user: formattedUser } = useSupabaseUserStore.getState();
    
    console.log('🎨 [TEST] Formatted user data:', {
      gender: formattedUser?.gender,
      personalityType: formattedUser?.personalityType,
      dateOfBirth: formattedUser?.dateOfBirth,
      onboardingCompleted: formattedUser?.onboardingCompleted,
      lifestylePreferences: formattedUser?.lifestylePreferences,
      university: formattedUser?.university,
      major: formattedUser?.major
    });
    
    // Verify critical fields are mapped correctly
    const testResults = {
      gender: rawData.gender === formattedUser?.gender,
      personalityType: rawData.personality_type === formattedUser?.personalityType,
      dateOfBirth: rawData.date_of_birth === formattedUser?.dateOfBirth,
      onboardingCompleted: rawData.onboarding_completed === formattedUser?.onboardingCompleted,
      university: rawData.university === formattedUser?.university,
      major: rawData.major === formattedUser?.major
    };
    
    console.log('✅ [TEST] Field mapping verification:', testResults);
    
    const allFieldsMapped = Object.values(testResults).every(result => result === true);
    
    if (allFieldsMapped) {
      console.log('🎉 [TEST] SUCCESS! All fields mapped correctly');
      return { success: true, results: testResults };
    } else {
      console.log('⚠️ [TEST] Some fields not mapped correctly');
      return { success: false, results: testResults };
    }
    
  } catch (error) {
    console.error('❌ [TEST] Test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Export for easy testing in console
if (typeof window !== 'undefined') {
  (window as any).testDataPersistence = testDataPersistence;
} 