import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface UserPreferences {
  // User's own roommate preferences
  budget: {
    min: number;
    max: number;
  };
  location: string;
  lifestyle: {
    cleanliness: 1 | 2 | 3 | 4 | 5;
    noise: 1 | 2 | 3 | 4 | 5;
    guestsFrequency: 1 | 2 | 3 | 4 | 5;
    smoking: boolean;
    drinking: boolean;
    pets: boolean;
  };
  schedule: {
    earlyRiser: boolean;
    nightOwl: boolean;
  };
  traits: string[];
  
  // App preferences
  darkMode: boolean;
  notifications: {
    newMatches: boolean;
    messages: boolean;
    appUpdates: boolean;
  };
}

// Search filters
export interface SearchFilters {
  university: string[];
  budget: {
    min: number;
    max: number;
  };
  location: string[];
  maxDistance: number; // in miles
  lifestyle: {
    cleanliness?: 'relaxed' | 'moderate' | 'very_clean';
    socialLevel?: 'quiet' | 'social' | 'very_social';
    // Rename/replace smoking/pets for consistency with modal
    nonSmoker?: boolean; // Renamed from !smoking
    petFriendly?: boolean; // Renamed from pets
  };
  // Filter types
  lookingFor: 'roommate' | 'place';
  hasPlace: boolean;
  gender: 'male' | 'female' | 'any';
  profileType?: 'student' | 'professional' | 'any';
  
  // Age range
  ageRange: {
    min: number;
    max: number;
  };
  
  // Account verification
  account: {
    verifiedOnly: boolean;
  };
  
  // Place specific details
  placeDetails: {
    roomType: 'private' | 'shared' | 'studio' | 'any';
    furnished?: boolean;
    bedrooms?: number;
    bathrooms?: number;
    moveInTiming?: 'asap' | 'within_month' | 'flexible';
  };
}

interface PreferencesState {
  userPreferences: UserPreferences;
  searchFilters: SearchFilters;
  onboardingComplete: boolean;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetSearchFilters: () => void;
  completeOnboarding: () => void;
  hardReset: () => void;
}

const defaultUserPreferences: UserPreferences = {
  budget: {
    min: 500,
    max: 1500,
  },
  location: '',
  lifestyle: {
    cleanliness: 3,
    noise: 3,
    guestsFrequency: 3,
    smoking: false,
    drinking: true,
    pets: true,
  },
  schedule: {
    earlyRiser: false,
    nightOwl: false,
  },
  traits: [],
  darkMode: false,
  notifications: {
    newMatches: true,
    messages: true,
    appUpdates: true,
  },
};

const defaultSearchFilters: SearchFilters = {
  university: [],
  budget: {
    min: 0,
    max: 3500, // Updated default max budget
  },
  location: [],
  maxDistance: 20,
  lifestyle: {
      // Set defaults for the renamed/new lifestyle keys
      cleanliness: undefined, // Use undefined for optional filters
      socialLevel: undefined,
      nonSmoker: undefined, // Use undefined for optional filters if no default preference
      petFriendly: undefined,
  },
  // removed verifiedOnly from top level
  lookingFor: 'roommate', // Default to roommate search for clear UX
  hasPlace: false, // Default is not filtering by this
  gender: 'any',
  profileType: 'any', // Default to showing all profile types

  // New default values matching FilterModal structure
  ageRange: {
      min: 18,
      max: 35,
  },
  account: {
      verifiedOnly: false,
  },
  placeDetails: {
      roomType: 'any', // Default room type
      furnished: undefined, // Default furnished state (optional filter)
      moveInTiming: 'flexible', // Default move-in timing
      // amenities: [],
  },
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      userPreferences: defaultUserPreferences,
      searchFilters: defaultSearchFilters,
      onboardingComplete: false,
      updateUserPreferences: (preferences) => {
        set((state) => ({
          userPreferences: {
            ...state.userPreferences,
            ...preferences,
          },
        }));
      },
      updateSearchFilters: (updates) => {
        set((state) => {
          // Create a copy of the current filters
          const updatedFilters = { ...state.searchFilters, ...updates };
          
          // If lookingFor is updated, ensure we're setting hasPlace correctly
          if (updates.lookingFor === 'place') {
            updatedFilters.hasPlace = true;
            console.log('[PreferencesStore] Setting hasPlace to true for place listings');
          }
          
          // Ensure placeDetails exists when looking for places
          if (updates.lookingFor === 'place' && (!updatedFilters.placeDetails || typeof updatedFilters.placeDetails !== 'object')) {
            updatedFilters.placeDetails = updatedFilters.placeDetails || {};
          }
          
          console.log('[PreferencesStore] Updated search filters:', JSON.stringify(updatedFilters, null, 2));
          
          return { 
            ...state, 
            searchFilters: updatedFilters 
          };
        });
      },
      resetSearchFilters: () => {
        console.log('Resetting search filters to defaults');
        console.log('Default filters:', defaultSearchFilters);
        set({
          searchFilters: defaultSearchFilters,
        });
      },
      completeOnboarding: () => {
        set({
          onboardingComplete: true,
        });
      },
      hardReset: () => {
        console.log('Hard resetting preferences store to defaults');
        set({
          userPreferences: defaultUserPreferences,
          searchFilters: defaultSearchFilters,
          onboardingComplete: false,
        });
      },
    }),
    {
      name: 'roomies-preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrated preferences store state:', state);
        
        // Handle migration of verifiedOnly from top level to account object
        if (state) {
          // Check if we have the old structure (verifiedOnly at top level)
          if (state.searchFilters && 'verifiedOnly' in state.searchFilters) {
            console.log('Migrating verifiedOnly from top level to account object');
            
            // Create or update the account object with the verifiedOnly value
            // Ensure verifiedOnly is a boolean
            const verifiedOnlyValue = !!state.searchFilters.verifiedOnly;
            
            // Create a new searchFilters object without the top-level verifiedOnly
            const { verifiedOnly, ...restFilters } = state.searchFilters;
            
            // Ensure account object exists
            const updatedFilters = {
              ...restFilters,
              account: {
                ...(state.searchFilters.account || {}),
                verifiedOnly: verifiedOnlyValue
              }
            } as SearchFilters;
            
            // Update the state with the migrated structure
            state.searchFilters = updatedFilters;
            console.log('Migrated search filters:', state.searchFilters);
          }
          
          // Ensure account and placeDetails objects always exist
          if (state.searchFilters) {
            if (!state.searchFilters.account) {
              state.searchFilters.account = { verifiedOnly: false };
            }
            
            if (!state.searchFilters.placeDetails) {
              state.searchFilters.placeDetails = { roomType: 'any', furnished: undefined };
            }
          }
        }
      },
    }
  )
);

// Add a debug function to log the current state
export const logPreferencesState = () => {
  const state = usePreferencesStore.getState();
  console.log('Current preferences state:', {
    searchFilters: state.searchFilters,
    onboardingComplete: state.onboardingComplete
  });
  return state;
};

// Add a function to clear AsyncStorage for the preferences store
export const clearPreferencesStorage = async () => {
  try {
    console.log('Clearing preferences storage...');
    await AsyncStorage.removeItem('roomies-preferences-storage');
    console.log('Preferences storage cleared');
    
    // Reset to defaults
    usePreferencesStore.getState().hardReset();
    
    return true;
  } catch (error) {
    console.error('Error clearing preferences storage:', error);
    return false;
  }
};
