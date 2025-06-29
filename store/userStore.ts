import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoommateStore } from './roommateStore';
import { createRoommateProfileFromUser, determineProfilePicture } from '../utils/profileSynchronizer';
import { ApiService } from '../services';
import { getNextStep } from './onboardingConfig';

// Import mapping functions from profileSynchronizer
import { mapCleanlinessToEnum, mapNoiseLevelToEnum, mapGuestFrequencyToEnum } from '../utils/profileSynchronizer';

// Import validation functions
const { validateUserData, validateOnboardingStep } = require('../utils/validation');

/**
 * Helper function to map numeric lifestyle values to string enum values
 * @param value The numeric value to map
 * @param type The type of lifestyle preference
 * @returns The mapped string enum value
 */
function mapLifestyleValueToEnum(value: number, type: string): string | undefined {
  if (value === undefined) return undefined;
  
  switch (type) {
    case 'cleanliness':
      if (value <= 1) return "very_clean";
      if (value <= 2) return "clean";
      if (value <= 3) return "moderate";
      return "relaxed";
      
    case 'noise':
      if (value <= 1) return "quiet";
      if (value <= 2) return "moderate";
      return "loud";
      
    case 'guestFrequency':
      if (value <= 1) return "rarely";
      if (value <= 2) return "sometimes";
      return "often";
      
    default:
      return undefined;
  }
}

interface Location {
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  radius?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: string;
  bio?: string;
  profilePicture?: string;
  photos?: string[];
  gender?: string;
  userRole?: 'roommate_seeker' | 'place_lister';
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
  personalityType?: string; // MBTI type (e.g., INFJ, ESTP)
  profilePhotoIndex?: number | null; // Index of the profile photo (-1 for personality image, null for none)
  lifestylePreferences?: {
    cleanliness: number;
    noise: number;
    guestFrequency: number;
    smoking: boolean;
    pets: boolean;
    drinking?: boolean;
    earlyRiser?: boolean;
    nightOwl?: boolean;
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
  onboardingProgress?: number; // ID of the last completed step
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
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateUserAndProfile: (userData: Partial<User>, options?: { validate: boolean }) => { success: boolean; error?: string };
  updateUserProfile: (profileData: Partial<User>) => Promise<any>;
  verifyUser: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getUserRating: () => { averageRating: number; totalReviews: number; responseRate: string; responseTime: string; };
  averageRating: number;
  totalReviews: number;
  responseRate: string;
  responseTime: string;
  updateOnboardingProgress: (progress: Partial<OnboardingProgress>) => void;
  completeOnboardingStep: (step: string, data: any, options?: { validate: boolean }) => { success: boolean; error?: string; nextStep?: string };
  resetOnboardingProgress: () => void;
  blockUser: (userIdToBlock: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      blockedUserIds: [],
      onboardingProgress: {
        currentStep: 'account',
        completedSteps: [],
        isComplete: false
      },
      averageRating: 0,
      totalReviews: 0,
      responseRate: '0%',
      responseTime: 'N/A',
      getUserRating: () => {
        const { user } = get();
        return {
          averageRating: 3.0,
          totalReviews: 2,
          responseRate: "92%",
          responseTime: "2h"
        };
      },
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          console.log('[Auth] Attempting login for:', email);
          const response = await ApiService.login(email, password);
          console.log('[Auth] Login API Response:', JSON.stringify(response)); // Log the full response
          
          if (response.error) {
            console.error('[Auth] Login API Error:', response.error);
            set({ error: response.error, isLoading: false });
            return Promise.reject(response.error);
          }
          
          // Log the data before setting state
          console.log('[Auth] Login Success - User Data:', JSON.stringify(response.data)); 

          set({ 
            user: response.data, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          console.log('[Auth] User state updated, resolving promise.');
          return Promise.resolve();
        } catch (error) {
          console.error('[Auth] Login Catch Error:', error);
          set({ 
            error: 'Failed to login. Please try again.', 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      signup: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ApiService.signup(name, email, password);
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return Promise.reject(response.error);
          }
          
          set({ 
            user: response.data, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: 'Failed to create account. Please try again.', 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      /**
       * Updates user data in the store
       * @param userData Partial user data to update
       */
      updateUser: (userData) => {
        set((state) => {
          // Create a new user object if it doesn't exist yet
          if (state.user) {
            // Update existing user
            return { user: { ...state.user, ...userData } };
          } else {
            // Create new user with required fields
            const newUser: User = {
              id: userData.id || 'temp-' + Date.now(),
              email: userData.email || '',
              name: userData.name || '',
              ...userData
            };
            return { user: newUser };
          }
        });
      },
      /**
       * Updates user data and syncs with roommate profile
       * @param userData Partial user data to update
       * @param options Additional options for the update
       * @returns Object with success status and any error message
       */
      updateUserAndProfile: (userData: Partial<User>, options = { validate: true }) => {
        const { validate } = options;
        
        // Validate data if requested
        if (validate) {
          const validationResult = validateUserData(userData);
          if (!validationResult.isValid) {
            console.warn('[UserStore] Validation failed:', validationResult.errors);
            return { success: false, error: validationResult.errors[0] };
          }
        }
        
        try {
          // Update user data
          get().updateUser(userData);
          
          // Get the updated user
          const updatedUser = get().user;
          if (!updatedUser) {
            return { success: false, error: 'No user data available' };
          }
          
          // Sync with roommate profile
          const roommateStore = useRoommateStore.getState();
          
          // Check if profile exists
          const existingProfile = roommateStore.profiles.find(p => p.id === updatedUser.id);
          
          if (existingProfile) {
            // Create update object with all necessary fields
            const updateData: Partial<any> = {
              // Update only the fields that were changed
              ...userData.name && { name: userData.name },
              ...userData.gender && { gender: userData.gender as any },
              ...userData.personalityTraits && { traits: userData.personalityTraits?.slice(0, 3) || [] },
              ...userData.bio && { bio: userData.bio },
              // Always update the image using determineProfilePicture to ensure it's correct
              image: determineProfilePicture(updatedUser)
            };
            
            // Update lifestyle preferences if they exist
            if (updatedUser.lifestylePreferences) {
              updateData.lifestylePreferences = {
                sleepSchedule: 'flexible', // Default value
                cleanliness: mapCleanlinessToEnum(updatedUser.lifestylePreferences.cleanliness),
                noiseLevel: mapNoiseLevelToEnum(updatedUser.lifestylePreferences.noise),
                guestPolicy: mapGuestFrequencyToEnum(updatedUser.lifestylePreferences.guestFrequency),
                smoking: updatedUser.lifestylePreferences.smoking,
                pets: updatedUser.lifestylePreferences.pets === true,
                drinking: false
              };
            }
            
            // Update roommate profile
            roommateStore.updateRoommate(updatedUser.id, updateData);
          } else {
            // Create new profile
            roommateStore.createProfileFromUser(updatedUser);
          }
          
          console.log('[UserStore] Profile updated successfully');
          
          return { success: true };
        } catch (error) {
          console.error('[UserStore] Error updating profile:', error);
          return { success: false, error: 'Failed to update profile' };
        }
      },
      /**
       * Updates user profile via API and local store
       * @param profileData Profile data to update
       */
      updateUserProfile: async (profileData: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = get();
          if (!user) {
            throw new Error('User not authenticated');
          }
          
          // Call API to update profile
          const response = await ApiService.updateUserProfile(user.id, profileData);
          
          if (response.error) {
            throw new Error(response.error);
          }
          
          // Update local state with the response data
          set({
            user: { ...user, ...response.data },
            isLoading: false
          });
          
          return response.data;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update profile',
            isLoading: false
          });
          throw error;
        }
      },
      verifyUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const { user } = get();
          if (!user) {
            throw new Error('User not authenticated');
          }
          
          const response = await ApiService.verifyUser(user.id);
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return Promise.reject(response.error);
          }
          
          set((state) => ({ 
            user: state.user ? { ...state.user, isVerified: true } : null,
            isLoading: false 
          }));
          
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: 'Failed to verify user. Please try again.', 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      upgradeToPremium: async () => {
        set({ isLoading: true, error: null });
        try {
          const { user } = get();
          if (!user) {
            throw new Error('User not authenticated');
          }
          
          const response = await ApiService.upgradeToPremium(user.id);
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return Promise.reject(response.error);
          }
          
          set((state) => ({ 
            user: state.user ? { ...state.user, isPremium: true } : null,
            isLoading: false 
          }));
          
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: 'Failed to upgrade to premium. Please try again.', 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ApiService.resetPassword(email);
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return Promise.reject(response.error);
          }
          
          set({ isLoading: false });
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: 'Failed to reset password. Please try again.', 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      updateOnboardingProgress: (progress) => {
        set((state) => {
          const newOnboardingProgress = {
            ...state.onboardingProgress,
            ...progress,
          };
          
          // If onboarding is being marked as complete, create a roommate profile
          if (progress.isComplete && !state.onboardingProgress.isComplete && state.user) {
            // Import the roommate store to create a profile
            const { useRoommateStore } = require('./roommateStore');
            
            // Create a roommate profile from the user data
            console.log('[UserStore] Onboarding complete, creating roommate profile');
            useRoommateStore.getState().createProfileFromUser(state.user);
          }
          
          return {
            onboardingProgress: newOnboardingProgress
          };
        });
      },
      /**
       * Completes an onboarding step with validation and profile syncing
       * @param step The onboarding step being completed
       * @param data The data collected in this step
       * @param options Additional options
       * @returns Object with success status and any error message
       */
      completeOnboardingStep: (step: string, data: any, options = { validate: true }) => {
        const { validate } = options;
        
        // Validate step data if requested
        if (validate) {
          const validationResult = validateOnboardingStep(step, data);
          if (!validationResult.isValid) {
            console.warn(`[UserStore] Validation failed for step ${step}:`, validationResult.errors);
            return { success: false, error: validationResult.errors[0] };
          }
        }
        
        try {
          // Get current onboarding progress
          const { onboardingProgress } = get();
          
          // Update user data
          get().updateUser(data);
          
          // Sync with roommate profile using the same approach as updateUserAndProfile
          const updatedUser = get().user;
          if (updatedUser) {
            const roommateStore = useRoommateStore.getState();
            const existingProfile = roommateStore.profiles.find(p => p.id === updatedUser.id);
            
            if (existingProfile) {
              // Update existing profile with the new data
              roommateStore.updateRoommate(updatedUser.id, {
                // Update relevant fields based on the step
                ...data.personalityTraits && { personalityTraits: data.personalityTraits },
                ...data.gender && { gender: data.gender as any },
                ...data.lifestylePreferences && { 
                  lifestylePreferences: {
                    ...existingProfile.lifestylePreferences,
                    // Map lifestyle preferences appropriately
                    ...(data.lifestylePreferences.cleanliness !== undefined) && { 
                      cleanliness: mapLifestyleValueToEnum(data.lifestylePreferences.cleanliness, 'cleanliness') 
                    },
                    ...(data.lifestylePreferences.noise !== undefined) && { 
                      noiseLevel: mapLifestyleValueToEnum(data.lifestylePreferences.noise, 'noise') 
                    }
                  }
                }
              });
            } else {
              // Create new profile
              roommateStore.createProfileFromUser(updatedUser);
            }
          }
          
          // Update onboarding progress
          const updatedCompletedSteps = [...(onboardingProgress?.completedSteps || [])];
          if (!updatedCompletedSteps.includes(step)) {
            updatedCompletedSteps.push(step);
          }
          
          // Get the next step
          const nextStep = getNextStep(step);
          
          // Update onboarding progress
          get().updateOnboardingProgress({
            currentStep: nextStep,
            completedSteps: updatedCompletedSteps
          });
          
          console.log(`[UserStore] Step ${step} completed successfully`);
          
          return { success: true, nextStep };
        } catch (error) {
          console.error(`[UserStore] Error completing step ${step}:`, error);
          return { success: false, error: `Failed to complete step ${step}` };
        }
      },
      
      resetOnboardingProgress: () => {
        set((state) => {
          // Keep the user's core identity but reset all onboarding-related data
          const resetUser = state.user ? {
            ...state.user,
            // Clear photos and profile picture
            photos: [],
            profilePicture: undefined,
            profilePhotoIndex: null,
            
            // Reset personal info
            bio: undefined,
            dateOfBirth: undefined,
            gender: undefined,
            
            // Reset education info
            university: undefined,
            major: undefined,
            year: undefined,
            
            // Reset personality data
            personalityType: undefined,
            personalityTraits: [],
            personalityDimensions: undefined,
            
            // Reset lifestyle preferences
            lifestylePreferences: undefined,
            
            // Reset budget and location
            budget: undefined,
            location: undefined,
            
            // Reset preferences
            preferences: {
              notifications: true,
              darkMode: false,
              language: 'en',
            },
          } : state.user;
          
          console.log('[UserStore] Resetting onboarding progress and clearing profile data');
          
          // Also reset the roommate profile if the user exists
          if (state.user && state.user.id) {
            try {
              // Import the roommateStore to reset the profile
              const { useRoommateStore } = require('./roommateStore');
              const roommateStore = useRoommateStore.getState();
              
              // Reset the roommate profile
              roommateStore.resetProfile(state.user.id);
              console.log('[UserStore] Also reset roommate profile for user:', state.user.id);
            } catch (error) {
              console.error('[UserStore] Error resetting roommate profile:', error);
            }
          }
          
          return {
            user: resetUser,
            onboardingProgress: {
              currentStep: 'welcome',
              completedSteps: [],
              isComplete: false,
            }
          };
        });
      },
      blockUser: (userIdToBlock) => {
        set((state) => {
          if (!state.blockedUserIds.includes(userIdToBlock)) {
            return { blockedUserIds: [...state.blockedUserIds, userIdToBlock] };
          }
          return {};
        });
        console.log(`User ${userIdToBlock} blocked (locally).`);
      },
    }),
    {
      name: 'roomies-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
