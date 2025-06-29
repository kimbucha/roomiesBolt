import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { toJsonb, getJsonbProperty } from '../utils/jsonbHelper';
import { useSupabaseAuthStore } from './supabaseAuthStore';
import { calculateProfileStrength } from '../utils/profileStrength';
import { logCritical } from '../utils/onboardingDebugUtils';

// Import validation functions
const { validateUserData, validateOnboardingStep } = require('../utils/validation');

interface Location {
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: string;
  bio?: string;
  profilePicture?: string;
  photos?: string[];
  gender?: string;
  userRole?: 'roommate_seeker' | 'place_lister' | 'both';
  hasPlace?: boolean;
  university?: string;
  major?: string;
  year?: string | number;
  company?: string; // Work information
  role?: string; // Job title/role
  isPremium?: boolean;
  isVerified?: boolean;
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
    budget?: { min: number; max: number };
    moveInDate?: string;
    duration?: string;
    roomType?: 'private' | 'shared' | 'studio';
  };
  personalityTraits?: string[];
  personalityDimensions?: {
    ei: number; // Extraversion (0) vs Introversion (100)
    sn: number; // Sensing (0) vs Intuition (100)
    tf: number; // Thinking (0) vs Feeling (100)
    jp: number; // Judging (0) vs Perceiving (100)
  };
  personalityType?: string;
  profilePhotoIndex?: number | null;
  lifestylePreferences?: {
    cleanliness?: number;
    noise?: number;
    guestFrequency?: number;
    smoking?: boolean;
    pets?: boolean;
    drinking?: boolean;
    earlyRiser?: boolean;
    nightOwl?: boolean;
    schedule?: 'early-riser' | 'night-owl' | 'flexible' | 'regular-hours' | 'irregular';
    petPreference?: string;
  };
  budget?: {
    min: number;
    max: number;
  };
  location?: Location;
  placeDetails?: {
    roomType?: 'private' | 'shared' | 'studio';
    bedrooms: number;
    bathrooms: number;
    monthlyRent?: string;
    address?: string;
    moveInDate?: string;
    leaseDuration?: string;
    utilitiesIncluded?: boolean;
    estimatedUtilitiesCost?: string;
    amenities: string[] | any[];
    photos: string[];
    description?: string;
    isFurnished?: boolean;
  };
  onboardingProgress?: number;
  onboardingCompleted?: boolean;
}

interface OnboardingProgress {
  currentStep: string;
  completedSteps: string[];
  userGoal?: string;
  referralCode?: string;
  isComplete: boolean;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboardingProgress: OnboardingProgress;
  blockedUserIds: string[];
  
  // Actions
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateUserAndProfile: (userData: Partial<User>, options?: { validate: boolean }) => Promise<{ success: boolean; error?: string }>;
  getUserRating: () => { averageRating: number; totalReviews: number; responseRate: string; responseTime: string; };
  updateOnboardingProgress: (progress: Partial<OnboardingProgress>) => Promise<{ success: boolean; error?: string }>;
  completeOnboardingStep: (step: string, data: any, options?: { validate: boolean }) => Promise<{ success: boolean; error?: string; nextStep?: string }>;
  resetOnboardingProgress: () => Promise<{ success: boolean; error?: string }>;
  blockUser: (userIdToBlock: string) => Promise<{ success: boolean; error?: string }>;
  fetchUserProfile: () => Promise<{ success: boolean; error?: string }>;
}

/**
 * Converts a Supabase user record to our app's User format
 */
const formatSupabaseUser = (supabaseUser: any): User => {
  console.log('[SupabaseUserStore] Formatting user from Supabase:', {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.name,
    onboarding_completed: supabaseUser.onboarding_completed
  });
  
  // CRITICAL FIX: Parse lifestyle preferences from JSONB with safe defaults
  let lifestylePrefs = {};
  if (supabaseUser.lifestyle_preferences) {
      try {
      lifestylePrefs = typeof supabaseUser.lifestyle_preferences === 'string'
        ? JSON.parse(supabaseUser.lifestyle_preferences)
        : supabaseUser.lifestyle_preferences;
      } catch (e) {
      console.warn('[SupabaseUserStore] Failed to parse lifestyle preferences:', e);
        lifestylePrefs = {};
      }
    }
  
  // Handle profile picture - use standardized field names
  // The new ProfileImageService will handle the actual resolution
  const profilePicture = supabaseUser.profile_picture || supabaseUser.profile_image_url;
  
  return {
    id: supabaseUser.id || '',
    email: supabaseUser.email || '',
    name: supabaseUser.name || '',
    profilePicture: profilePicture,
    isPremium: supabaseUser.is_premium || false,
    isVerified: supabaseUser.is_verified || false,
    onboardingCompleted: supabaseUser.onboarding_completed || false,
    personalityType: supabaseUser.personality_type,
    
    // CRITICAL FIX: Add missing fields that are saved during onboarding
    gender: supabaseUser.gender,
    dateOfBirth: supabaseUser.date_of_birth,
    
    budget: supabaseUser.budget_min && supabaseUser.budget_max ? {
      min: supabaseUser.budget_min,
      max: supabaseUser.budget_max
    } : undefined,
    
    // Extract complex data from JSONB columns (with safe defaults)
    personalityDimensions: (() => {
      const rawDimensions = supabaseUser.personality_dimensions;
      console.log('[formatSupabaseUser] Raw personality_dimensions from DB:', rawDimensions);
      
      // If rawDimensions exists and is an object, use it directly
      if (rawDimensions && typeof rawDimensions === 'object' && rawDimensions.ei !== undefined) {
        console.log('[formatSupabaseUser] Using raw personality dimensions directly:', rawDimensions);
        return rawDimensions;
      }
      
      // Fallback to default values only if no valid data exists
      const fallback = { ei: 50, sn: 50, tf: 50, jp: 50 };
      console.log('[formatSupabaseUser] Using fallback personality dimensions:', fallback);
      return fallback;
    })(),
    lifestylePreferences: lifestylePrefs,
    location: supabaseUser.location || { city: '', state: '' },
    
    // Extract personality traits if stored in a separate column
    personalityTraits: supabaseUser.personality_traits || [],
    
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'en',
      ...(supabaseUser.housing_goals || {}),
      budget: supabaseUser.budget_min && supabaseUser.budget_max ? {
        min: supabaseUser.budget_min,
        max: supabaseUser.budget_max
      } : undefined
    },
    
    // Add additional fields that may be saved during onboarding
    university: supabaseUser.university,
    major: supabaseUser.major,
    year: supabaseUser.year,
    bio: supabaseUser.bio,
    userRole: supabaseUser.user_role || (supabaseUser.housing_goals?.user_role) || null,
    hasPlace: supabaseUser.has_place || (supabaseUser.housing_goals?.has_place) || false,
    
    // Add additional photos if available
    photos: supabaseUser.additional_photos || [],
    
    // Add company and role fields
    company: supabaseUser.company,
    role: supabaseUser.role,
    
    // CRITICAL FIX: Extract place details from housing_goals JSONB field
    placeDetails: (() => {
      // First, let's debug what we're getting
      console.log('[formatSupabaseUser] Raw housing_goals from DB:', supabaseUser.housing_goals);
      
      // FIXED: Don't use getJsonbProperty with empty string path, use the object directly
      const housingGoals = supabaseUser.housing_goals || {};
      console.log('[formatSupabaseUser] Parsed housing_goals:', housingGoals);
      
      const rawPlaceDetails = housingGoals.place_details;
      console.log('[formatSupabaseUser] Raw place_details from housing_goals:', rawPlaceDetails);
      
      if (rawPlaceDetails && typeof rawPlaceDetails === 'object') {
        // Convert database format to app format
        return {
          roomType: rawPlaceDetails.roomType || rawPlaceDetails.room_type,
          bedrooms: rawPlaceDetails.bedrooms || 1,
          bathrooms: rawPlaceDetails.bathrooms || 1,
          monthlyRent: rawPlaceDetails.monthlyRent || rawPlaceDetails.monthly_rent,
          address: rawPlaceDetails.address,
          moveInDate: rawPlaceDetails.moveInDate || rawPlaceDetails.move_in_date,
          leaseDuration: rawPlaceDetails.leaseDuration || rawPlaceDetails.lease_duration,
          utilitiesIncluded: rawPlaceDetails.utilitiesIncluded,
          estimatedUtilitiesCost: rawPlaceDetails.estimatedUtilitiesCost,
          amenities: rawPlaceDetails.amenities || [],
          photos: rawPlaceDetails.photos || rawPlaceDetails.room_photos || [],
          description: rawPlaceDetails.description,
          isFurnished: rawPlaceDetails.isFurnished || rawPlaceDetails.is_furnished || false
        };
      }
      
      console.log('[formatSupabaseUser] No place_details found in housing_goals');
      return undefined;
    })()
  } as User;
};

// Helper function to determine next onboarding step
const getNextStep = (currentStep: string): string => {
  const steps = [
    'welcome',
    'budget', 
    'lifestyle',
    'personality',
    'goals',
    'about-you',
    'photos',
    'notifications',
    'complete'
  ];
  
  const currentIndex = steps.indexOf(currentStep);
  return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : 'complete';
};

export const useSupabaseUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  onboardingProgress: {
    currentStep: 'welcome',
    completedSteps: [],
    isComplete: false
  },
  blockedUserIds: [],
  
  /**
   * Get user rating information
   */
  getUserRating: () => {
    // This would be fetched from Supabase in a real implementation
    return {
      averageRating: 4.8,
      totalReviews: 12,
      responseRate: '95%',
      responseTime: '< 1 hour'
    };
  },
  
  /**
   * Updates user data in Supabase
   */
  updateUser: async (userData: Partial<User>) => {
    try {
      // Get current session directly from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'Not authenticated' };
      }
      const authUser = session.user;
      
      // Prepare data for Supabase
      const updateData: any = {};
      
      // Map simple fields
      if (userData.name !== undefined) updateData.name = userData.name;
      
      // Handle profilePicture - now using standardized identifiers from ProfileImageService
      if (userData.profilePicture !== undefined) {
        console.log('[SupabaseUserStore] Processing profilePicture:', typeof userData.profilePicture, userData.profilePicture);
        
        // The ProfileImageService now handles all the conversion logic
        // We just store the identifier as-is - using correct database column name
        updateData.profile_image_url = userData.profilePicture;
        console.log('[SupabaseUserStore] Storing profile picture identifier:', userData.profilePicture);
      }
      
      if (userData.isPremium !== undefined) updateData.is_premium = userData.isPremium;
      if (userData.isVerified !== undefined) updateData.is_verified = userData.isVerified;
      if (userData.onboardingCompleted !== undefined) updateData.onboarding_completed = userData.onboardingCompleted;
      if (userData.personalityType !== undefined) updateData.personality_type = userData.personalityType;
      if (userData.university !== undefined) updateData.university = userData.university;
      if (userData.major !== undefined) updateData.major = userData.major;
      if (userData.year !== undefined) updateData.year = userData.year;
      if (userData.company !== undefined) updateData.company = userData.company;
      if (userData.role !== undefined) updateData.role = userData.role;
      // NOTE: user_role column doesn't exist in current schema, commenting out
      // if (userData.userRole !== undefined) updateData.user_role = userData.userRole;
      // NOTE: has_place column doesn't exist in current schema, commenting out
      // if (userData.hasPlace !== undefined) updateData.has_place = userData.hasPlace;
      
      // Map budget
      if (userData.budget?.min !== undefined) updateData.budget_min = userData.budget.min;
      if (userData.budget?.max !== undefined) updateData.budget_max = userData.budget.max;
      
      // Map complex objects to JSONB
      if (userData.personalityDimensions) {
        console.log('[SupabaseUserStore] Saving personality dimensions:', userData.personalityDimensions);
        updateData.personality_dimensions = toJsonb(userData.personalityDimensions);
        console.log('[SupabaseUserStore] Converted to JSONB:', updateData.personality_dimensions);
      }
      
      if (userData.lifestylePreferences) {
        updateData.lifestyle_preferences = toJsonb(userData.lifestylePreferences);
      }
      
      if (userData.location) {
        updateData.location = toJsonb(userData.location);
      }
      
      // NOTE: place_details column doesn't exist, store in housing_goals JSONB instead
      
      // Housing goals from preferences - include userRole, hasPlace, and placeDetails since columns don't exist
      if (userData.preferences || userData.userRole !== undefined || userData.hasPlace !== undefined || userData.placeDetails !== undefined) {
        // Get current user's existing housing goals to preserve them
        const currentUser = get().user || {};
        const existingHousingGoals = currentUser.preferences || {};
        updateData.housing_goals = toJsonb({
          ...existingHousingGoals,
          roomType: userData.preferences?.roomType,
          moveInDate: userData.preferences?.moveInDate,
          duration: userData.preferences?.duration,
          ...(userData.userRole !== undefined && { user_role: userData.userRole }),
          ...(userData.hasPlace !== undefined && { has_place: userData.hasPlace }),
          ...(userData.placeDetails !== undefined && { place_details: userData.placeDetails })
        });
        
        console.log('[SupabaseUserStore] Saving place details in housing_goals:', userData.placeDetails);
      }
      
      // Calculate profile strength
      const currentUser = get().user || {};
      const updatedUser = { ...currentUser, ...userData };
      updateData.profile_strength = calculateProfileStrength(updatedUser);
      
      console.log('[SupabaseUserStore] Complete updateData being sent to Supabase:', updateData);
      
      // Update in Supabase
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', authUser.id);
        
      if (error) {
        console.error('[Supabase] Error updating user:', error.message);
        return { success: false, error: error.message };
      }
      
      console.log('[SupabaseUserStore] ✅ Successfully updated user in Supabase');
      
      // Update local state
      set(state => ({
        user: { ...state.user, ...userData } as User
      }));
      
      return { success: true };
    } catch (error) {
      console.error('[Supabase] Update user error:', error instanceof Error ? error.message : String(error));
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
  
  /**
   * Updates user data and syncs with roommate profile
   */
  updateUserAndProfile: async (userData: Partial<User>, options = { validate: true }) => {
    try {
      // Validate data if required
      if (options.validate) {
        const validationResult = validateUserData(userData);
        if (!validationResult.isValid) {
          return { success: false, error: validationResult.errors.join(', ') };
        }
      }
      
      // Update user data
      const updateResult = await get().updateUser(userData);
      if (!updateResult.success) {
        return updateResult;
      }
      
      // In a full implementation, we would also update the roommate profile here
      // This would involve a separate call to the roommate profile table
      
      return { success: true };
    } catch (error) {
      console.error('[Supabase] Update user and profile error:', error instanceof Error ? error.message : String(error));
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
  
  /**
   * Updates onboarding progress
   */
  updateOnboardingProgress: async (progress: Partial<OnboardingProgress>) => {
    try {
      // Get current session directly from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'Not authenticated' };
      }
      const authUser = session.user;
      
      // Update local state
      set(state => ({
        onboardingProgress: {
          ...state.onboardingProgress,
          ...progress
        }
      }));
      
      // If completed steps are updated, save to Supabase
      if (progress.completedSteps) {
        const { error } = await supabase
          .from('users')
          .update({
            completed_steps: progress.completedSteps
          })
          .eq('id', authUser.id);
          
        if (error) {
          console.error('[Supabase] Error updating completed steps:', error.message);
          return { success: false, error: error.message };
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('[Supabase] Update onboarding progress error:', error instanceof Error ? error.message : String(error));
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
  
  /**
   * Completes an onboarding step with validation and profile syncing
   */
  completeOnboardingStep: async (step: string, data: any, options = { validate: true }) => {
    try {
      // Validate step data if required
      if (options.validate) {
        const validationResult = validateOnboardingStep(step, data);
        if (!validationResult.isValid) {
          return { success: false, error: validationResult.errors.join(', ') };
        }
      }
      
      const { user: authUser } = useSupabaseAuthStore.getState();
      if (!authUser) {
        return { success: false, error: 'Not authenticated' };
      }
      
      // Get current state
      const { onboardingProgress, user } = get();
      
      // Update completed steps
      const completedSteps = [...onboardingProgress.completedSteps];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }
      
      // Determine next step
      const nextStep = getNextStep(step);
      
      // Update onboarding progress
      await get().updateOnboardingProgress({
        currentStep: nextStep,
        completedSteps,
        isComplete: nextStep === 'complete'
      });
      
      // Update user data based on step
      let userData: Partial<User> = {};
      
      switch (step) {
        case 'welcome':
          userData = { name: data.name };
          break;
        case 'budget':
          userData = {
            budget: data.budget,
            location: data.location
          };
          break;
        case 'lifestyle':
          userData = {
            lifestylePreferences: data.preferences
          };
          break;
        case 'personality':
          userData = {
            personalityType: data.personalityType,
            personalityDimensions: data.dimensions
          };
          break;
        case 'goals':
          userData = {
            preferences: {
              ...user?.preferences,
              roomType: data.roomType,
              moveInDate: data.moveInDate,
              duration: data.duration
            }
          };
          break;
        case 'photos':
          userData = {
            profilePicture: data.profilePicture,
            photos: data.photos
          };
          break;
        case 'account':
          userData = {
            onboardingCompleted: true
          };
          break;
      }
      
      // Update user data in Supabase
      if (Object.keys(userData).length > 0) {
        await get().updateUser(userData);
      }
      
      return { success: true, nextStep };
    } catch (error) {
      console.error('[Supabase] Complete onboarding step error:', error instanceof Error ? error.message : String(error));
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
  
  /**
   * Resets onboarding progress
   */
  resetOnboardingProgress: async () => {
    try {
      const { user: authUser } = useSupabaseAuthStore.getState();
      if (!authUser) {
        return { success: false, error: 'Not authenticated' };
      }
      
      // Reset in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          completed_steps: [],
          onboarding_completed: false
        })
        .eq('id', authUser.id);
        
      if (error) {
        console.error('[Supabase] Error resetting onboarding progress:', error.message);
        return { success: false, error: error.message };
      }
      
      // Reset local state
      set({
        onboardingProgress: {
          currentStep: 'welcome',
          completedSteps: [],
          isComplete: false
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('[Supabase] Reset onboarding progress error:', error instanceof Error ? error.message : String(error));
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
  
  /**
   * Blocks a user
   */
  blockUser: async (userIdToBlock: string) => {
    try {
      // In a full implementation, we would store blocked users in Supabase
      // For now, we just update the local state
      set(state => ({
        blockedUserIds: [...state.blockedUserIds, userIdToBlock]
      }));
      
      return { success: true };
    } catch (error) {
      console.error('[Supabase] Block user error:', error instanceof Error ? error.message : String(error));
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
  
  /**
   * Fetch user profile from Supabase
   */
  fetchUserProfile: async () => {
    try {
      // Set loading to true
      set({ isLoading: true });
      
      // Get current session directly from Supabase instead of auth store
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logCritical(`❌ Session error: ${sessionError.message}`);
        set({ isLoading: false });
        return { success: false, error: sessionError.message };
      }
      
      if (!session?.user) {
        logCritical('❌ fetchUserProfile failed: No active session');
        set({ isLoading: false });
        return { success: false, error: 'Not authenticated' };
      }
      
      const authUser = session.user;
      logCritical(`🔍 Fetching profile for user ID: ${authUser.id}`);
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (error) {
        logCritical(`❌ Supabase fetch error: ${error.message}`);
        console.error('[Supabase] Error fetching user profile:', error.message);
        set({ isLoading: false });
        return { success: false, error: error.message };
      }
      
      if (userData) {
        // Critical data persistence verification
        logCritical(`📋 Raw Supabase data - onboarding_completed: ${userData.onboarding_completed}, name: ${userData.name}, personality_type: ${userData.personality_type}`);
        logCritical(`📋 Raw personality_dimensions from DB:`, userData.personality_dimensions);
        
        const formattedUser = formatSupabaseUser(userData);
      
        // Critical data persistence verification
        logCritical(`📋 Formatted user - onboardingCompleted: ${formattedUser?.onboardingCompleted}, name: ${formattedUser?.name}, personalityType: ${formattedUser?.personalityType}`);
        logCritical(`📋 Formatted personalityDimensions:`, formattedUser?.personalityDimensions);
        
        set({ user: formattedUser, isAuthenticated: true, isLoading: false });
        logCritical('✅ Profile loaded successfully into Supabase user store');
        return { success: true };
      }
      
      logCritical('❌ No user data found in Supabase');
      set({ isLoading: false });
      return { success: false, error: 'User not found' };
    } catch (error) {
      logCritical(`❌ fetchUserProfile catch error: ${error instanceof Error ? error.message : String(error)}`);
      console.error('[Supabase] Fetch profile error:', error instanceof Error ? error.message : String(error));
      set({ isLoading: false });
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}));

export default useSupabaseUserStore;
